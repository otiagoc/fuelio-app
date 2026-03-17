import { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { refuelEntries, monthlySummaries } from '../data/fuelData';
import { fmtNum, getMonthShort } from '../lib/utils';

type ChartType = 'consumo' | 'despesas' | 'preco' | 'custos' | 'km';
type TimeFilter = 'all' | 'ytd' | 'lastYear' | 'thisMonth';

const chartTypes: { key: ChartType; label: string }[] = [
  { key: 'consumo', label: 'Consumo de combustivel' },
  { key: 'despesas', label: 'Despesas mensais' },
  { key: 'preco', label: 'Preco de combustivel' },
  { key: 'custos', label: 'Custos com abastecimento' },
  { key: 'km', label: 'Quilometragem total' },
];

const timeFilters: { key: TimeFilter; label: string }[] = [
  { key: 'all', label: 'Tudo' },
  { key: 'ytd', label: 'Desde inicio do ano' },
  { key: 'lastYear', label: 'Ano ant.' },
  { key: 'thisMonth', label: 'Mes atual' },
];

function filterByTime<T extends { date: string }>(data: T[], filter: TimeFilter): T[] {
  if (filter === 'all') return data;
  if (filter === 'ytd') return data.filter(d => d.date >= '2026-01-01');
  if (filter === 'lastYear') return data.filter(d => d.date >= '2025-01-01' && d.date < '2026-01-01');
  if (filter === 'thisMonth') return data.filter(d => d.date >= '2026-03-01' && d.date < '2026-04-01');
  return data;
}

function filterMonthlyByTime(data: typeof monthlySummaries, filter: TimeFilter) {
  if (filter === 'all') return data;
  if (filter === 'ytd') return data.filter(d => d.month >= '2026-01');
  if (filter === 'lastYear') return data.filter(d => d.month >= '2025-01' && d.month < '2026-01');
  if (filter === 'thisMonth') return data.filter(d => d.month === '2026-03');
  return data;
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#2c2c2e',
    border: '1px solid #3a3a3c',
    borderRadius: 8,
    fontSize: 12,
    color: '#fff',
  },
  labelStyle: { color: '#8e8e93' },
};

export default function Charts() {
  const [chartType, setChartType] = useState<ChartType>('consumo');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  // Consumption data (GPL only, with consumption values)
  const consumptionData = useMemo(() => {
    const entries = refuelEntries
      .filter(e => e.fuel === 'GPL' && e.consumption !== null)
      .map(e => ({ date: e.date, label: e.date.slice(5), value: e.consumption! }));
    return filterByTime(entries, timeFilter);
  }, [timeFilter]);

  const avgConsumption = useMemo(() => {
    if (consumptionData.length === 0) return 0;
    return consumptionData.reduce((s, d) => s + d.value, 0) / consumptionData.length;
  }, [consumptionData]);

  // Monthly expenses
  const monthlyExpData = useMemo(() => {
    const filtered = filterMonthlyByTime(monthlySummaries, timeFilter);
    return filtered.map(m => ({
      date: m.month,
      label: getMonthShort(m.month),
      value: m.cost,
    }));
  }, [timeFilter]);

  // Fuel price (all entries)
  const priceData = useMemo(() => {
    const entries = refuelEntries.map(e => ({
      date: e.date,
      label: e.date.slice(5),
      value: e.pricePerLiter,
      fuel: e.fuel,
    }));
    return filterByTime(entries, timeFilter);
  }, [timeFilter]);

  // Cost per refueling
  const costData = useMemo(() => {
    const entries = refuelEntries.map(e => ({
      date: e.date,
      label: e.date.slice(5),
      value: e.cost,
      fuel: e.fuel,
    }));
    return filterByTime(entries, timeFilter);
  }, [timeFilter]);

  // Cumulative km
  const kmData = useMemo(() => {
    const entries = refuelEntries
      .filter(e => e.odometer !== null)
      .map(e => ({
        date: e.date,
        label: e.date.slice(5),
        value: e.odometer!,
      }));
    return filterByTime(entries, timeFilter);
  }, [timeFilter]);

  return (
    <div className="pt-6 flex flex-col h-full">
      <h1 className="text-xl font-bold text-white mb-4 px-4">Graficos</h1>

      {/* Chart type tabs (scrollable) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 mb-3">
        {chartTypes.map(ct => (
          <button
            key={ct.key}
            onClick={() => setChartType(ct.key)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
              chartType === ct.key
                ? 'bg-[#4A9DFF] text-white'
                : 'bg-[#2c2c2e] text-[#8e8e93]'
            }`}
          >
            {ct.label}
          </button>
        ))}
      </div>

      {/* Time filter bar */}
      <div className="flex gap-2 px-4 mb-4">
        {timeFilters.map(tf => (
          <button
            key={tf.key}
            onClick={() => setTimeFilter(tf.key)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              timeFilter === tf.key
                ? 'bg-[#3a3a3c] text-white'
                : 'text-[#8e8e93]'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="flex-1 px-2 pb-4" style={{ minHeight: 350 }}>
        {chartType === 'consumo' && (
          <div className="bg-[#2c2c2e] rounded-2xl p-4 h-full">
            <p className="text-sm text-[#8e8e93] mb-1">Consumo de combustivel (L/100km)</p>
            <p className="text-lg font-bold text-white mb-4">
              Media: {fmtNum(avgConsumption)} L/100km
            </p>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#8e8e93', fontSize: 10 }}
                    axisLine={{ stroke: '#3a3a3c' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#8e8e93', fontSize: 10 }}
                    axisLine={{ stroke: '#3a3a3c' }}
                    tickLine={false}
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v) => [fmtNum(Number(v)) + ' L/100km', 'Consumo']}
                  />
                  <ReferenceLine
                    y={avgConsumption}
                    stroke="#8e8e93"
                    strokeDasharray="6 4"
                    label={{ value: `Media ${fmtNum(avgConsumption)}`, fill: '#8e8e93', fontSize: 10, position: 'right' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6B9FFF"
                    strokeWidth={2}
                    dot={{ fill: '#6B9FFF', r: 3 }}
                    activeDot={{ r: 5, fill: '#4A9DFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartType === 'despesas' && (
          <div className="bg-[#2c2c2e] rounded-2xl p-4 h-full">
            <p className="text-sm text-[#8e8e93] mb-1">Despesas mensais</p>
            <p className="text-lg font-bold text-white mb-4">
              Total: {fmtNum(monthlyExpData.reduce((s, d) => s + d.value, 0))} &euro;
            </p>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#8e8e93', fontSize: 9 }}
                    axisLine={{ stroke: '#3a3a3c' }}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tick={{ fill: '#8e8e93', fontSize: 10 }}
                    axisLine={{ stroke: '#3a3a3c' }}
                    tickLine={false}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v) => [fmtNum(Number(v)) + ' \u20AC', 'Custo']}
                  />
                  <Bar dataKey="value" fill="#4A9DFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartType === 'preco' && (
          <div className="bg-[#2c2c2e] rounded-2xl p-4 h-full">
            <p className="text-sm text-[#8e8e93] mb-1">Preco de combustivel (&euro;/L)</p>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#8e8e93', fontSize: 10 }}
                    axisLine={{ stroke: '#3a3a3c' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#8e8e93', fontSize: 10 }}
                    axisLine={{ stroke: '#3a3a3c' }}
                    tickLine={false}
                    domain={['dataMin - 0.05', 'dataMax + 0.05']}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v, _name, entry) => [
                      fmtNum(Number(v), 3) + ' \u20AC/L',
                      (entry as { payload: { fuel: string } }).payload.fuel,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6B9FFF"
                    strokeWidth={2}
                    dot={(props: Record<string, unknown>) => {
                      const { payload, cx, cy } = props as { payload: { fuel: string }; cx: number; cy: number };
                      return (
                        <circle
                          key={`${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill={payload.fuel === 'GPL' ? '#4A9DFF' : '#FF6B35'}
                          stroke="none"
                        />
                      );
                    }}
                    activeDot={{ r: 5, fill: '#4A9DFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartType === 'custos' && (
          <div className="bg-[#2c2c2e] rounded-2xl p-4 h-full">
            <p className="text-sm text-[#8e8e93] mb-1">Custos com abastecimento (&euro;)</p>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#8e8e93', fontSize: 10 }}
                    axisLine={{ stroke: '#3a3a3c' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#8e8e93', fontSize: 10 }}
                    axisLine={{ stroke: '#3a3a3c' }}
                    tickLine={false}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v, _name, entry) => [
                      fmtNum(Number(v)) + ' \u20AC',
                      (entry as { payload: { fuel: string } }).payload.fuel,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6B9FFF"
                    strokeWidth={2}
                    dot={(props: Record<string, unknown>) => {
                      const { payload, cx, cy } = props as { payload: { fuel: string }; cx: number; cy: number };
                      return (
                        <circle
                          key={`${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill={payload.fuel === 'GPL' ? '#4A9DFF' : '#FF6B35'}
                          stroke="none"
                        />
                      );
                    }}
                    activeDot={{ r: 5, fill: '#4A9DFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartType === 'km' && (
          <div className="bg-[#2c2c2e] rounded-2xl p-4 h-full">
            <p className="text-sm text-[#8e8e93] mb-1">Quilometragem total (km)</p>
            <p className="text-lg font-bold text-white mb-4">
              {fmtNum(kmData[kmData.length - 1]?.value ?? 0, 0)} km
            </p>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kmData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#8e8e93', fontSize: 10 }}
                    axisLine={{ stroke: '#3a3a3c' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#8e8e93', fontSize: 10 }}
                    axisLine={{ stroke: '#3a3a3c' }}
                    tickLine={false}
                    tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v) => [fmtNum(Number(v), 1) + ' km', 'Odometro']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#34C759"
                    strokeWidth={2}
                    dot={{ fill: '#34C759', r: 2 }}
                    activeDot={{ r: 5, fill: '#34C759' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
