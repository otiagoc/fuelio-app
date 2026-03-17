import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Fuel, MapPin } from 'lucide-react';
import { refuelEntries } from '../data/fuelData';
import { fmtNum, fmtEur, fmtDate, getMonthName, groupBy } from '../lib/utils';

export default function FuelLog() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const sortedEntries = useMemo(() => {
    const entries = [...refuelEntries].reverse();
    if (!searchTerm.trim()) return entries;
    const term = searchTerm.toLowerCase();
    return entries.filter(e =>
      e.station.toLowerCase().includes(term) ||
      e.date.includes(term) ||
      e.fuel.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const grouped = useMemo(() => {
    const groups = groupBy(sortedEntries, e => e.date.slice(0, 7));
    // Sort groups by month descending
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map(key => ({
      month: key,
      label: getMonthName(key),
      entries: groups[key],
    }));
  }, [sortedEntries]);

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Registo de Kms</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-9 h-9 rounded-full bg-[#2c2c2e] flex items-center justify-center"
          >
            <Search size={18} className="text-[#8e8e93]" />
          </button>
          <button
            onClick={() => navigate('/add')}
            className="w-9 h-9 rounded-full bg-[#4A9DFF] flex items-center justify-center"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Pesquisar por posto, data, tipo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#2c2c2e] text-white text-sm rounded-xl px-4 py-3 placeholder-[#8e8e93] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
            autoFocus
          />
        </div>
      )}

      {/* Entries grouped by month */}
      <div className="space-y-5 pb-4">
        {grouped.map(group => (
          <div key={group.month}>
            <h2 className="text-sm font-semibold text-[#8e8e93] mb-2 uppercase tracking-wide">
              {group.label}
            </h2>
            <div className="space-y-2">
              {group.entries.map((entry, idx) => {
                const isGPL = entry.fuel === 'GPL';
                const fuelColor = isGPL ? '#4A9DFF' : '#FF6B35';
                const costPerKm = entry.distance && entry.distance > 0
                  ? entry.cost / entry.distance
                  : null;

                return (
                  <div
                    key={`${entry.date}-${idx}`}
                    className="bg-[#2c2c2e] rounded-xl p-3.5"
                  >
                    {/* Row 1: date + odometer */}
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${fuelColor}20` }}
                        >
                          <Fuel size={15} style={{ color: fuelColor }} />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{fmtDate(entry.date)}</p>
                          <p className="text-xs text-[#8e8e93]">{fmtEur(entry.cost)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {entry.odometer !== null && (
                          <p className="text-sm text-white font-medium">
                            {fmtNum(entry.odometer, 1)} km
                          </p>
                        )}
                        {entry.distance !== null && (
                          <p className="text-xs text-[#8e8e93]">
                            +{fmtNum(entry.distance, 1)} km
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: liters, price, fuel type */}
                    <div className="flex items-center gap-2 mb-1.5 ml-[42px]">
                      <span className="text-xs text-white">
                        {fmtNum(entry.liters, 2)} L
                      </span>
                      <span className="text-xs text-[#8e8e93]">&rarr;</span>
                      <span className="text-xs text-[#8e8e93]">
                        {fmtNum(entry.pricePerLiter, 3)} &euro;/L
                      </span>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                        style={{ backgroundColor: `${fuelColor}20`, color: fuelColor }}
                      >
                        {entry.fuel}
                      </span>
                      {!entry.fullTank && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[#FF3B30]/20 text-[#FF3B30]">
                          Parcial
                        </span>
                      )}
                    </div>

                    {/* Row 3: consumption + cost/km + station */}
                    <div className="flex items-center justify-between ml-[42px]">
                      <div className="flex items-center gap-3">
                        {entry.consumption !== null && (
                          <span className="text-xs font-medium text-[#34C759]">
                            {fmtNum(entry.consumption)} L/100km
                          </span>
                        )}
                        {costPerKm !== null && (
                          <span className="text-xs font-medium text-[#4A9DFF]">
                            {fmtNum(costPerKm, 3)} &euro;/km
                          </span>
                        )}
                      </div>
                      {entry.station && (
                        <div className="flex items-center gap-1 max-w-[140px]">
                          <MapPin size={10} className="text-[#8e8e93] flex-shrink-0" />
                          <span className="text-[10px] text-[#8e8e93] truncate">
                            {entry.station}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
