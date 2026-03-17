import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { refuelEntries, type RefuelEntry } from '../data/fuelData';
import { APPS_SCRIPT_URL } from '../config';

const STATIONS = [
  'AUCHAN SETÚBAL',
  'PRIO Fernão Ferro',
  'E.S. FOGUETEIRO',
  'AUCHAN COINA',
  'E.S. COINA N10',
  'Galp',
];

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function AddRefueling() {
  const navigate = useNavigate();

  const [date, setDate] = useState(todayStr());
  const [odometer, setOdometer] = useState('');
  const [fuel, setFuel] = useState<'GPL' | 'Gasolina'>('GPL');
  const [liters, setLiters] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [station, setStation] = useState('');
  const [fullTank, setFullTank] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Track which field the user last edited for auto-calc logic
  const lastEdited = useRef<'liters' | 'totalCost' | 'pricePerLiter' | null>(null);

  // Station autocomplete
  const [stationFocused, setStationFocused] = useState(false);
  const filteredStations = useMemo(() => {
    if (!station.trim()) return STATIONS;
    const term = station.toLowerCase();
    return STATIONS.filter(s => s.toLowerCase().includes(term));
  }, [station]);

  // Auto-calculate price per liter when liters and totalCost change
  useEffect(() => {
    if (lastEdited.current === 'pricePerLiter') return;
    const l = parseFloat(liters);
    const c = parseFloat(totalCost);
    if (l > 0 && c > 0) {
      setPricePerLiter((c / l).toFixed(3));
    }
  }, [liters, totalCost]);

  // Auto-calculate liters when user edits pricePerLiter
  useEffect(() => {
    if (lastEdited.current !== 'pricePerLiter') return;
    const p = parseFloat(pricePerLiter);
    const c = parseFloat(totalCost);
    if (p > 0 && c > 0) {
      setLiters((c / p).toFixed(2));
    }
  }, [pricePerLiter, totalCost]);

  const handleSubmit = async () => {
    // Validate
    if (!date) { toast.error('Preencha a data'); return; }
    if (!liters || parseFloat(liters) <= 0) { toast.error('Preencha os litros'); return; }
    if (!totalCost || parseFloat(totalCost) <= 0) { toast.error('Preencha o preço total'); return; }

    setSubmitting(true);

    const l = parseFloat(liters);
    const cost = parseFloat(totalCost);
    const ppl = parseFloat(pricePerLiter) || (cost / l);
    const odo = odometer ? parseFloat(odometer) : null;

    // Calculate distance from last entry
    let distance: number | null = null;
    if (odo !== null) {
      const lastWithOdo = [...refuelEntries].reverse().find(e => e.odometer !== null);
      if (lastWithOdo && lastWithOdo.odometer !== null) {
        distance = Math.round((odo - lastWithOdo.odometer) * 10) / 10;
        if (distance <= 0) distance = null;
      }
    }

    // Calculate consumption
    let consumption: number | null = null;
    if (fullTank && distance && distance > 0) {
      consumption = Math.round((l / distance) * 10000) / 100;
    }

    // Build local entry
    const entry: RefuelEntry = {
      date,
      odometer: odo,
      fuel,
      liters: l,
      cost,
      pricePerLiter: ppl,
      consumption,
      distance,
      station,
      fullTank,
    };

    // Post to Google Apps Script if configured
    if (APPS_SCRIPT_URL) {
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            date,
            odometer: odo ?? '',
            fuelType: fuel,
            liters: l,
            totalCost: cost,
            pricePerLiter: ppl,
            distance: distance ?? '',
            station,
            fullTank: fullTank ? 'Sim' : 'Não',
          }),
        });
        const result = await res.json();
        if (!result.success) {
          toast.error('Erro ao guardar na Google Sheet: ' + (result.error || 'Erro desconhecido'));
          setSubmitting(false);
          return;
        }
      } catch (err) {
        toast.error('Erro de rede ao enviar para a Google Sheet');
        setSubmitting(false);
        return;
      }
    }

    // Add to local data
    refuelEntries.push(entry);

    if (APPS_SCRIPT_URL) {
      toast.success('Abastecimento guardado com sucesso!');
    } else {
      toast.warning('Guardado localmente. Configure o Apps Script URL para sincronizar com a Google Sheet.');
    }

    setSubmitting(false);
    navigate('/fuel');
  };

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-[#2c2c2e] flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Novo Abastecimento</h1>
      </div>

      <div className="space-y-4">
        {/* Data */}
        <div>
          <label className="text-sm text-[#8e8e93] mb-1.5 block">Data</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-[#4A9DFF] [color-scheme:dark]"
          />
        </div>

        {/* Km Odómetro */}
        <div>
          <label className="text-sm text-[#8e8e93] mb-1.5 block">Km Odómetro</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Ex: 27500"
            value={odometer}
            onChange={e => setOdometer(e.target.value)}
            className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-3 placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
          />
        </div>

        {/* Combustível toggle */}
        <div>
          <label className="text-sm text-[#8e8e93] mb-1.5 block">Combustível</label>
          <div className="flex bg-[#3a3a3c] rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setFuel('GPL')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                fuel === 'GPL'
                  ? 'bg-[#4A9DFF] text-white'
                  : 'text-[#8e8e93]'
              }`}
            >
              GPL
            </button>
            <button
              type="button"
              onClick={() => setFuel('Gasolina')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                fuel === 'Gasolina'
                  ? 'bg-[#FF6B35] text-white'
                  : 'text-[#8e8e93]'
              }`}
            >
              Gasolina
            </button>
          </div>
        </div>

        {/* Litros + Preço Total side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-[#8e8e93] mb-1.5 block">Litros (L)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              value={liters}
              onChange={e => { lastEdited.current = 'liters'; setLiters(e.target.value); }}
              className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-3 placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
            />
          </div>
          <div>
            <label className="text-sm text-[#8e8e93] mb-1.5 block">Preço Total (€)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              value={totalCost}
              onChange={e => { lastEdited.current = 'totalCost'; setTotalCost(e.target.value); }}
              className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-3 placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
            />
          </div>
        </div>

        {/* Preço/Litro */}
        <div>
          <label className="text-sm text-[#8e8e93] mb-1.5 block">Preço/Litro (€/L)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.001"
            placeholder="Auto-calculado"
            value={pricePerLiter}
            onChange={e => { lastEdited.current = 'pricePerLiter'; setPricePerLiter(e.target.value); }}
            className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-3 placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
          />
        </div>

        {/* Posto */}
        <div className="relative">
          <label className="text-sm text-[#8e8e93] mb-1.5 block">Posto</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nome do posto"
              value={station}
              onChange={e => setStation(e.target.value)}
              onFocus={() => setStationFocused(true)}
              onBlur={() => setTimeout(() => setStationFocused(false), 200)}
              className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-3 pr-10 placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
            />
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636366]" />
          </div>
          {stationFocused && filteredStations.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-[#3a3a3c] rounded-xl overflow-hidden shadow-lg border border-[#48484a]">
              {filteredStations.map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => { setStation(s); setStationFocused(false); }}
                  className="w-full text-left text-sm text-white px-4 py-2.5 hover:bg-[#48484a] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Depósito Cheio */}
        <div className="flex items-center justify-between bg-[#3a3a3c] rounded-xl px-4 py-3">
          <span className="text-sm text-white">Depósito Cheio?</span>
          <button
            type="button"
            onClick={() => setFullTank(!fullTank)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              fullTank ? 'bg-[#4A9DFF]' : 'bg-[#636366]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                fullTank ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-[#636366] -mt-2 ml-1">
          {fullTank ? 'Sim — depósito cheio' : 'Não — abastecimento parcial'}
        </p>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#4A9DFF] text-white font-semibold text-base rounded-xl py-3.5 mt-2 transition-opacity disabled:opacity-50"
        >
          {submitting ? 'A guardar...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
