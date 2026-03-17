import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Fuel, BarChart3, LineChart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart, Bar, LineChart as RLineChart, Line,
  XAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { refuelEntries, monthlySummaries, vehicle } from '../data/fuelData';
import { fmtNum, fmtEur, getMonthShort } from '../lib/utils';

export default function HomePage() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const gplEntries = refuelEntries.filter(e => e.fuel === 'GPL');
    const gasEntries = refuelEntries.filter(e => e.fuel === 'Gasolina');
    const gplConsumptions = gplEntries.filter(e => e.consumption !== null).map(e => e.consumption!);
    const avgConsumption = gplConsumptions.length > 0
      ? gplConsumptions.reduce((a, b) => a + b, 0) / gplConsumptions.length
      : 0;
    const totalGplCost = gplEntries.reduce((s, e) => s + e.cost, 0);
    const totalGasCost = gasEntries.reduce((s, e) => s + e.cost, 0);
    const totalGplL = gplEntries.reduce((s, e) => s + e.liters, 0);
    const totalGasL = gasEntries.reduce((s, e) => s + e.liters, 0);

    return {
      gplCount: gplEntries.length,
      gasCount: gasEntries.length,
      avgConsumption,
      totalGplCost,
      totalGasCost,
      totalGplL,
      totalGasL,
    };
  }, []);

  // Last 6 months for trend charts
  const last6Months = monthlySummaries.slice(-6);

  const monthlyCostData = last6Months.map(m => ({
    month: getMonthShort(m.month),
    cost: m.cost,
  }));

  const lastCost = last6Months[last6Months.length - 1]?.cost ?? 0;
  const avgCost = last6Months.reduce((s, m) => s + m.cost, 0) / last6Months.length;
  const prevCost = last6Months.length >= 2 ? last6Months[last6Months.length - 2].cost : avgCost;
  const costVariation = prevCost > 0 ? ((lastCost - prevCost) / prevCost) * 100 : 0;

  // GPL price trend (last entries with price data)
  const gplPriceData = refuelEntries
    .filter(e => e.fuel === 'GPL')
    .slice(-12)
    .map(e => ({
      date: e.date.slice(5),
      price: e.pricePerLiter,
    }));

  // GPL consumption trend
  const gplConsData = refuelEntries
    .filter(e => e.fuel === 'GPL' && e.consumption !== null)
    .slice(-12)
    .map(e => ({
      date: e.date.slice(5),
      consumption: e.consumption!,
    }));

  const TrendIcon = costVariation > 1 ? TrendingUp : costVariation < -1 ? TrendingDown : Minus;
  const trendColor = costVariation > 1 ? '#FF3B30' : costVariation < -1 ? '#34C759' : '#8e8e93';

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Vehicle Card */}
      <div className="bg-[#2c2c2e] rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-[#3a3a3c] flex items-center justify-center">
          <Car size={28} className="text-[#4A9DFF]" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-white">{vehicle.name}</h1>
          <p className="text-[#8e8e93] text-sm">{vehicle.plate}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-semibold">{fmtNum(vehicle.currentOdometer, 1)}</p>
          <p className="text-[#8e8e93] text-xs">km</p>
        </div>
      </div>

      {/* Fuel summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* GPL Card */}
        <div className="bg-[#2c2c2e] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#4A9DFF]/20 flex items-center justify-center">
              <Fuel size={16} className="text-[#4A9DFF]" />
            </div>
            <span className="text-sm font-medium text-[#4A9DFF]">GPL</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#8e8e93] text-xs">Abastecimentos</span>
              <span className="text-white text-sm font-medium">{stats.gplCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93] text-xs">Total litros</span>
              <span className="text-white text-sm font-medium">{fmtNum(stats.totalGplL, 1)} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93] text-xs">Consumo med.</span>
              <span className="text-[#34C759] text-sm font-medium">{fmtNum(stats.avgConsumption)} L/100km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93] text-xs">Custo total</span>
              <span className="text-white text-sm font-medium">{fmtEur(stats.totalGplCost)}</span>
            </div>
          </div>
        </div>

        {/* Gasolina Card */}
        <div className="bg-[#2c2c2e] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center">
              <Fuel size={16} className="text-[#FF6B35]" />
            </div>
            <span className="text-sm font-medium text-[#FF6B35]">Gasolina</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#8e8e93] text-xs">Abastecimentos</span>
              <span className="text-white text-sm font-medium">{stats.gasCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93] text-xs">Total litros</span>
              <span className="text-white text-sm font-medium">{fmtNum(stats.totalGasL, 1)} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93] text-xs">Custo total</span>
              <span className="text-white text-sm font-medium">{fmtEur(stats.totalGasCost)}</span>
            </div>
            <div className="h-[18px]" /> {/* spacer to match GPL card height */}
          </div>
        </div>
      </div>

      {/* Trend section */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Tendencias</h2>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-container pb-2">
          {/* Monthly cost trend */}
          <div className="bg-[#2c2c2e] rounded-2xl p-4 min-w-[280px] snap-item flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#8e8e93]">Despesas mensais</span>
              <TrendIcon size={16} style={{ color: trendColor }} />
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-bold text-white">{fmtEur(lastCost)}</span>
              <span
                className="text-xs font-medium mb-1"
                style={{ color: trendColor }}
              >
                {costVariation >= 0 ? '+' : ''}{fmtNum(costVariation, 1)}%
              </span>
            </div>
            <div className="flex gap-4 text-xs text-[#8e8e93] mb-3">
              <span>Media: {fmtEur(avgCost)}</span>
            </div>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCostData} barCategoryGap="20%">
                  <XAxis dataKey="month" tick={{ fill: '#8e8e93', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Bar dataKey="cost" fill="#4A9DFF" radius={[3, 3, 0, 0]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#8e8e93' }}
                    formatter={(v) => [fmtEur(Number(v)), 'Custo']}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GPL price trend */}
          <div className="bg-[#2c2c2e] rounded-2xl p-4 min-w-[280px] snap-item flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#8e8e93]">Preco GPL</span>
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-2xl font-bold text-white">
                {fmtNum(gplPriceData[gplPriceData.length - 1]?.price ?? 0, 3)} &euro;/L
              </span>
            </div>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={gplPriceData}>
                  <XAxis dataKey="date" tick={{ fill: '#8e8e93', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Line type="monotone" dataKey="price" stroke="#6B9FFF" strokeWidth={2} dot={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#8e8e93' }}
                    formatter={(v) => [fmtNum(Number(v), 3) + ' \u20AC/L', 'Preco']}
                  />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GPL consumption trend */}
          <div className="bg-[#2c2c2e] rounded-2xl p-4 min-w-[280px] snap-item flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#8e8e93]">Consumo GPL</span>
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-2xl font-bold text-white">
                {fmtNum(gplConsData[gplConsData.length - 1]?.consumption ?? 0)} L/100km
              </span>
            </div>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={gplConsData}>
                  <XAxis dataKey="date" tick={{ fill: '#8e8e93', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Line type="monotone" dataKey="consumption" stroke="#34C759" strokeWidth={2} dot={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#8e8e93' }}
                    formatter={(v) => [fmtNum(Number(v)) + ' L/100km', 'Consumo']}
                  />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <button
          onClick={() => navigate('/stats')}
          className="bg-[#2c2c2e] rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <BarChart3 size={20} className="text-[#4A9DFF]" />
          <span className="text-sm text-white font-medium">Estatisticas</span>
        </button>
        <button
          onClick={() => navigate('/charts')}
          className="bg-[#2c2c2e] rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <LineChart size={20} className="text-[#4A9DFF]" />
          <span className="text-sm text-white font-medium">Graficos</span>
        </button>
      </div>
    </div>
  );
}
