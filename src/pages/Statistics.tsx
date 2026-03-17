import { useMemo, useState } from 'react';
import { Fuel, Route, Wallet } from 'lucide-react';
import { refuelEntries, vehicle, monthlySummaries } from '../data/fuelData';
import { fmtNum, fmtEur } from '../lib/utils';

type Tab = 'abastecimentos' | 'despesas' | 'distancia';

export default function Statistics() {
  const [activeTab, setActiveTab] = useState<Tab>('abastecimentos');

  const data = useMemo(() => {
    const gpl = refuelEntries.filter(e => e.fuel === 'GPL');
    const gas = refuelEntries.filter(e => e.fuel === 'Gasolina');
    const gplWithCons = gpl.filter(e => e.consumption !== null);
    const gplConsumptions = gplWithCons.map(e => e.consumption!);
    const avgCons = gplConsumptions.length > 0
      ? gplConsumptions.reduce((a, b) => a + b, 0) / gplConsumptions.length
      : 0;
    const bestCons = gplConsumptions.length > 0 ? Math.min(...gplConsumptions) : 0;
    const worstCons = gplConsumptions.length > 0 ? Math.max(...gplConsumptions) : 0;

    const gplTotalL = gpl.reduce((s, e) => s + e.liters, 0);
    const gasTotalL = gas.reduce((s, e) => s + e.liters, 0);
    const gplTotalCost = gpl.reduce((s, e) => s + e.cost, 0);
    const gasTotalCost = gas.reduce((s, e) => s + e.cost, 0);
    const totalCost = gplTotalCost + gasTotalCost;

    const allCosts = refuelEntries.map(e => e.cost);
    const lowestCost = Math.min(...allCosts);
    const highestCost = Math.max(...allCosts);

    const allPrices = refuelEntries.map(e => e.pricePerLiter);
    const bestPrice = Math.min(...allPrices);
    const worstPrice = Math.max(...allPrices);

    const gplDistances = gpl.filter(e => e.distance !== null).map(e => e.distance!);
    const totalDistance = gplDistances.reduce((s, d) => s + d, 0);
    const gplCostPerKm = totalDistance > 0 ? gplTotalCost / totalDistance : 0;

    const gplCostPerKms = gpl
      .filter(e => e.distance !== null && e.distance > 0)
      .map(e => e.cost / e.distance!);
    const bestCostPerKm = gplCostPerKms.length > 0 ? Math.min(...gplCostPerKms) : 0;
    const worstCostPerKm = gplCostPerKms.length > 0 ? Math.max(...gplCostPerKms) : 0;

    // Distance stats
    const currentOdo = vehicle.currentOdometer;
    const firstOdo = 20; // first odometer reading
    const totalKm = currentOdo - firstOdo;

    // First and last dates
    const firstDate = new Date(refuelEntries[0].date + 'T00:00:00');
    const lastDate = new Date(refuelEntries[refuelEntries.length - 1].date + 'T00:00:00');
    const totalDays = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAvgKm = totalKm / totalDays;
    const monthlyAvgKm = dailyAvgKm * 30.44;

    // This year / last year
    const thisYear = 2026;
    const entriesThisYear = refuelEntries.filter(e => e.date.startsWith(String(thisYear)));
    const entriesLastYear = refuelEntries.filter(e => e.date.startsWith(String(thisYear - 1)));

    const kmThisYear = entriesThisYear
      .filter(e => e.distance !== null)
      .reduce((s, e) => s + e.distance!, 0);
    const kmLastYear = entriesLastYear
      .filter(e => e.distance !== null)
      .reduce((s, e) => s + e.distance!, 0);

    // This month / last month
    const thisMonth = '2026-03';
    const lastMonth = '2026-02';
    const kmThisMonth = refuelEntries
      .filter(e => e.date.startsWith(thisMonth) && e.distance !== null)
      .reduce((s, e) => s + e.distance!, 0);
    const kmLastMonth = refuelEntries
      .filter(e => e.date.startsWith(lastMonth) && e.distance !== null)
      .reduce((s, e) => s + e.distance!, 0);

    // Daily/monthly avg expenses
    const dailyAvgExpense = totalCost / totalDays;
    const monthlyAvgExpense = totalCost / monthlySummaries.length;

    return {
      gplCount: gpl.length,
      gasCount: gas.length,
      totalCount: refuelEntries.length,
      avgCons, bestCons, worstCons,
      gplTotalL, gasTotalL,
      gplTotalCost, gasTotalCost, totalCost,
      lowestCost, highestCost,
      bestPrice, worstPrice,
      gplCostPerKm, bestCostPerKm, worstCostPerKm,
      gplMinL: Math.min(...gpl.map(e => e.liters)),
      gplMaxL: Math.max(...gpl.map(e => e.liters)),
      gasMinL: gas.length > 0 ? Math.min(...gas.map(e => e.liters)) : 0,
      gasMaxL: gas.length > 0 ? Math.max(...gas.map(e => e.liters)) : 0,
      totalKm, currentOdo, dailyAvgKm, monthlyAvgKm,
      kmThisYear, kmLastYear, kmThisMonth, kmLastMonth,
      dailyAvgExpense, monthlyAvgExpense,
    };
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof Fuel }[] = [
    { key: 'abastecimentos', label: 'Abastecimentos', icon: Fuel },
    { key: 'despesas', label: 'Despesas', icon: Wallet },
    { key: 'distancia', label: 'Distancia', icon: Route },
  ];

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold text-white mb-4">Estatisticas</h1>

      {/* Tab bar */}
      <div className="flex bg-[#2c2c2e] rounded-xl p-1 mb-5">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#4A9DFF] text-white'
                : 'text-[#8e8e93]'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4 pb-4">
        {activeTab === 'abastecimentos' && (
          <>
            {/* Overall */}
            <StatSection title="Geral">
              <StatRow label="Total abastecimentos" value={String(data.totalCount)} />
              <StatRow label="Consumo medio" value={`${fmtNum(data.avgCons)} L/100km`} valueColor="#34C759" />
              <StatRow label="Melhor consumo" value={`${fmtNum(data.bestCons)} L/100km`} valueColor="#34C759" />
              <StatRow label="Pior consumo" value={`${fmtNum(data.worstCons)} L/100km`} valueColor="#FF3B30" />
            </StatSection>

            {/* GPL */}
            <StatSection title="GPL" titleColor="#4A9DFF">
              <StatRow label="Abastecimentos" value={String(data.gplCount)} />
              <StatRow label="Total litros" value={`${fmtNum(data.gplTotalL, 2)} L`} />
              <StatRow label="Min. abastecimento" value={`${fmtNum(data.gplMinL, 2)} L`} />
              <StatRow label="Max. abastecimento" value={`${fmtNum(data.gplMaxL, 2)} L`} />
            </StatSection>

            {/* Gasolina */}
            <StatSection title="Gasolina" titleColor="#FF6B35">
              <StatRow label="Abastecimentos" value={String(data.gasCount)} />
              <StatRow label="Total litros" value={`${fmtNum(data.gasTotalL, 2)} L`} />
              <StatRow label="Min. abastecimento" value={`${fmtNum(data.gasMinL, 2)} L`} />
              <StatRow label="Max. abastecimento" value={`${fmtNum(data.gasMaxL, 2)} L`} />
            </StatSection>
          </>
        )}

        {activeTab === 'despesas' && (
          <>
            <StatSection title="Geral">
              <StatRow label="Custo total" value={fmtEur(data.totalCost)} />
              <StatRow label="Menor custo" value={fmtEur(data.lowestCost)} valueColor="#34C759" />
              <StatRow label="Maior custo" value={fmtEur(data.highestCost)} valueColor="#FF3B30" />
              <StatRow label="Melhor preco/L" value={`${fmtNum(data.bestPrice, 3)} \u20AC/L`} valueColor="#34C759" />
              <StatRow label="Pior preco/L" value={`${fmtNum(data.worstPrice, 3)} \u20AC/L`} valueColor="#FF3B30" />
            </StatSection>

            <StatSection title="GPL" titleColor="#4A9DFF">
              <StatRow label="Custo total" value={fmtEur(data.gplTotalCost)} />
              <StatRow label="Custo/km" value={`${fmtNum(data.gplCostPerKm, 3)} \u20AC/km`} />
              <StatRow label="Melhor custo/km" value={`${fmtNum(data.bestCostPerKm, 3)} \u20AC/km`} valueColor="#34C759" />
              <StatRow label="Pior custo/km" value={`${fmtNum(data.worstCostPerKm, 3)} \u20AC/km`} valueColor="#FF3B30" />
            </StatSection>

            <StatSection title="Gasolina" titleColor="#FF6B35">
              <StatRow label="Custo total" value={fmtEur(data.gasTotalCost)} />
            </StatSection>

            <StatSection title="Medias">
              <StatRow label="Media diaria" value={fmtEur(data.dailyAvgExpense)} />
              <StatRow label="Media mensal" value={fmtEur(data.monthlyAvgExpense)} />
            </StatSection>
          </>
        )}

        {activeTab === 'distancia' && (
          <>
            <StatSection title="Geral">
              <StatRow label="Total km percorridos" value={`${fmtNum(data.totalKm, 0)} km`} />
              <StatRow label="Odometro atual" value={`${fmtNum(data.currentOdo, 1)} km`} />
            </StatSection>

            <StatSection title="Por periodo">
              <StatRow label="Km este ano (2026)" value={`${fmtNum(data.kmThisYear, 0)} km`} />
              <StatRow label="Km ano anterior (2025)" value={`${fmtNum(data.kmLastYear, 0)} km`} />
              <StatRow label="Km este mes" value={`${fmtNum(data.kmThisMonth, 0)} km`} />
              <StatRow label="Km mes anterior" value={`${fmtNum(data.kmLastMonth, 0)} km`} />
            </StatSection>

            <StatSection title="Medias">
              <StatRow label="Media diaria" value={`${fmtNum(data.dailyAvgKm, 1)} km`} />
              <StatRow label="Media mensal" value={`${fmtNum(data.monthlyAvgKm, 0)} km`} />
            </StatSection>
          </>
        )}
      </div>
    </div>
  );
}

function StatSection({
  title,
  titleColor,
  children,
}: {
  title: string;
  titleColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#2c2c2e] rounded-2xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#3a3a3c]">
        <h3
          className="text-sm font-semibold"
          style={{ color: titleColor || '#ffffff' }}
        >
          {title}
        </h3>
      </div>
      <div className="divide-y divide-[#3a3a3c]">{children}</div>
    </div>
  );
}

function StatRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[#8e8e93]">{label}</span>
      <span
        className="text-sm font-semibold"
        style={{ color: valueColor || '#ffffff' }}
      >
        {value}
      </span>
    </div>
  );
}
