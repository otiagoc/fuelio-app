import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Camera, Loader2 } from 'lucide-react';
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

const KNOWN_STATIONS: Record<string, string> = {
  'PRIO': 'PRIO Fernão Ferro',
  'AUCHAN': 'AUCHAN SETÚBAL',
  'GALP': 'Galp',
  'BP': 'BP',
  'REPSOL': 'REPSOL',
  'CEPSA': 'CEPSA',
  'E.S.': 'E.S. FOGUETEIRO',
  'FOGUETEIRO': 'E.S. FOGUETEIRO',
  'COINA': 'E.S. COINA N10',
};

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function parseReceiptText(text: string): Partial<{
  liters: string;
  totalCost: string;
  pricePerLiter: string;
  station: string;
  fuel: 'GPL' | 'Gasolina';
}> {
  const result: Partial<{
    liters: string;
    totalCost: string;
    pricePerLiter: string;
    station: string;
    fuel: 'GPL' | 'Gasolina';
  }> = {};

  // Normalize text: uppercase for matching
  const upper = text.toUpperCase();
  // Normalize numbers: replace commas with dots
  const normalized = text.replace(/,/g, '.');

  // Detect fuel type
  if (/\bGPL\b/i.test(text) || /\bGAS\s*AUTO\b/i.test(text) || /\bAUTOG[AÁ]S\b/i.test(text)) {
    result.fuel = 'GPL';
  } else if (/\bGASOLINA\b/i.test(text) || /\bSEM\s*CHUMBO\b/i.test(text) || /\b95\b/.test(text) || /\bGAS[OÓ]LEO\b/i.test(text)) {
    result.fuel = 'Gasolina';
  }

  // Try to find liters - look for patterns near "L", "LITROS", "VOLUME", "QTD"
  const litersPatterns = [
    /VOLUME\s*:?\s*(\d+[.,]\d+)\s*L?/i,
    /QTD\s*:?\s*(\d+[.,]\d+)\s*L?/i,
    /LITROS?\s*:?\s*(\d+[.,]\d+)/i,
    /(\d+[.,]\d{2,3})\s*L\b/i,
    /(\d+[.,]\d{2,3})\s*LT/i,
  ];
  for (const pat of litersPatterns) {
    const m = normalized.match(pat);
    if (m) {
      const val = parseFloat(m[1]);
      if (val > 0.5 && val < 200) {
        result.liters = val.toFixed(2);
        break;
      }
    }
  }

  // Try to find total cost - look for patterns near "TOTAL", "EUR", "€"
  const totalPatterns = [
    /TOTAL\s*[:]?\s*(\d+[.,]\d{2})\s*[€E]?/i,
    /TOTAL\s*[:]?\s*[€E]?\s*(\d+[.,]\d{2})/i,
    /VALOR\s*[:]?\s*(\d+[.,]\d{2})/i,
    /(\d+[.,]\d{2})\s*€/,
    /(\d+[.,]\d{2})\s*EUR/i,
  ];
  for (const pat of totalPatterns) {
    const m = normalized.match(pat);
    if (m) {
      const val = parseFloat(m[1]);
      if (val > 1 && val < 500) {
        result.totalCost = val.toFixed(2);
        break;
      }
    }
  }

  // Try to find price per liter
  const pplPatterns = [
    /P\.?\s*UNIT\.?\s*:?\s*(\d+[.,]\d{3})\s*[€E]?/i,
    /PVP\s*:?\s*(\d+[.,]\d{3})/i,
    /PRE[CÇ]O\s*\/?\s*L(?:ITRO)?\s*:?\s*(\d+[.,]\d{3})/i,
    /(\d+[.,]\d{3})\s*€\s*\/\s*L/i,
    /€\s*\/\s*L\s*:?\s*(\d+[.,]\d{3})/i,
  ];
  for (const pat of pplPatterns) {
    const m = normalized.match(pat);
    if (m) {
      const val = parseFloat(m[1]);
      if (val > 0.3 && val < 3.0) {
        result.pricePerLiter = val.toFixed(3);
        break;
      }
    }
  }

  // If we have total and liters but no price per liter, calculate it
  if (result.totalCost && result.liters && !result.pricePerLiter) {
    const ppl = parseFloat(result.totalCost) / parseFloat(result.liters);
    if (ppl > 0.3 && ppl < 3.0) {
      result.pricePerLiter = ppl.toFixed(3);
    }
  }

  // If we have total and price per liter but no liters, calculate it
  if (result.totalCost && result.pricePerLiter && !result.liters) {
    const l = parseFloat(result.totalCost) / parseFloat(result.pricePerLiter);
    if (l > 0.5 && l < 200) {
      result.liters = l.toFixed(2);
    }
  }

  // Fallback: if we still don't have total, look for the largest number that looks like a price
  if (!result.totalCost) {
    const allNumbers = [...normalized.matchAll(/(\d+[.,]\d{2})\b/g)]
      .map(m => parseFloat(m[1]))
      .filter(n => n > 1 && n < 500);
    if (allNumbers.length > 0) {
      const maxVal = Math.max(...allNumbers);
      result.totalCost = maxVal.toFixed(2);
    }
  }

  // Detect station name
  for (const [keyword, stationName] of Object.entries(KNOWN_STATIONS)) {
    if (upper.includes(keyword.toUpperCase())) {
      result.station = stationName;
      break;
    }
  }

  return result;
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

  // OCR state
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setOcrProcessing(true);

    try {
      // Lazy import tesseract.js
      const { createWorker } = await import('tesseract.js');

      const worker = await createWorker('por');
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const ocrText = data.text;
      console.log('OCR Text:', ocrText);

      const parsed = parseReceiptText(ocrText);
      const detectedFields: string[] = [];

      if (parsed.liters) {
        setLiters(parsed.liters);
        detectedFields.push(`Litros: ${parsed.liters}`);
      }
      if (parsed.totalCost) {
        setTotalCost(parsed.totalCost);
        detectedFields.push(`Total: ${parsed.totalCost}`);
      }
      if (parsed.pricePerLiter) {
        setPricePerLiter(parsed.pricePerLiter);
        detectedFields.push(`Preco/L: ${parsed.pricePerLiter}`);
      }
      if (parsed.station) {
        setStation(parsed.station);
        detectedFields.push(`Posto: ${parsed.station}`);
      }
      if (parsed.fuel) {
        setFuel(parsed.fuel);
        detectedFields.push(`Tipo: ${parsed.fuel}`);
      }

      if (detectedFields.length > 0) {
        toast.success(`Detetado: ${detectedFields.join(' | ')}`);
      } else {
        toast.warning('Nao foi possivel detetar dados no recibo. Preencha manualmente.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      toast.error('Erro ao analisar imagem. Tente novamente.');
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!date) { toast.error('Preencha a data'); return; }
    if (!liters || parseFloat(liters) <= 0) { toast.error('Preencha os litros'); return; }
    if (!totalCost || parseFloat(totalCost) <= 0) { toast.error('Preencha o preco total'); return; }

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
            fullTank: fullTank ? 'Sim' : 'Nao',
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
    <div className="px-4 pt-5 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-[#2c2c2e] flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Novo Abastecimento</h1>
      </div>

      {/* OCR Camera Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={ocrProcessing}
        className="w-full mb-4 border-2 border-dashed border-[#48484a] rounded-xl bg-[#2c2c2e] flex flex-col items-center justify-center py-4 gap-2 transition-colors hover:border-[#4A9DFF] disabled:opacity-60"
      >
        {ocrProcessing ? (
          <>
            <Loader2 size={28} className="text-[#4A9DFF] animate-spin" />
            <span className="text-sm text-[#8e8e93]">A analisar imagem...</span>
          </>
        ) : imagePreview ? (
          <div className="flex items-center gap-3">
            <img
              src={imagePreview}
              alt="Recibo"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="text-left">
              <span className="text-sm text-white block">Imagem carregada</span>
              <span className="text-xs text-[#8e8e93]">Toque para substituir</span>
            </div>
          </div>
        ) : (
          <>
            <Camera size={28} className="text-[#8e8e93]" />
            <span className="text-sm text-[#8e8e93]">Fotografar recibo</span>
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="space-y-3">
        {/* Data */}
        <div>
          <label className="text-sm text-[#8e8e93] mb-1 block">Data</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-[#4A9DFF] [color-scheme:dark]"
          />
        </div>

        {/* Km Odometro */}
        <div>
          <label className="text-sm text-[#8e8e93] mb-1 block">Km Odometro</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Ex: 27500"
            value={odometer}
            onChange={e => setOdometer(e.target.value)}
            className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-2.5 placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
          />
        </div>

        {/* Combustivel toggle */}
        <div>
          <label className="text-sm text-[#8e8e93] mb-1 block">Combustivel</label>
          <div className="flex bg-[#3a3a3c] rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setFuel('GPL')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
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
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                fuel === 'Gasolina'
                  ? 'bg-[#FF6B35] text-white'
                  : 'text-[#8e8e93]'
              }`}
            >
              Gasolina
            </button>
          </div>
        </div>

        {/* Litros + Preco Total side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-[#8e8e93] mb-1 block">Litros (L)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              value={liters}
              onChange={e => { lastEdited.current = 'liters'; setLiters(e.target.value); }}
              className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-2.5 placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
            />
          </div>
          <div>
            <label className="text-sm text-[#8e8e93] mb-1 block">Preco Total (EUR)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              value={totalCost}
              onChange={e => { lastEdited.current = 'totalCost'; setTotalCost(e.target.value); }}
              className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-2.5 placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
            />
          </div>
        </div>

        {/* Preco/Litro */}
        <div>
          <label className="text-sm text-[#8e8e93] mb-1 block">Preco/Litro (EUR/L)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.001"
            placeholder="Auto-calculado"
            value={pricePerLiter}
            onChange={e => { lastEdited.current = 'pricePerLiter'; setPricePerLiter(e.target.value); }}
            className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-2.5 placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
          />
        </div>

        {/* Posto */}
        <div className="relative">
          <label className="text-sm text-[#8e8e93] mb-1 block">Posto</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nome do posto"
              value={station}
              onChange={e => setStation(e.target.value)}
              onFocus={() => setStationFocused(true)}
              onBlur={() => setTimeout(() => setStationFocused(false), 200)}
              className="w-full bg-[#3a3a3c] text-white text-sm rounded-xl px-4 py-2.5 pr-10 placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#4A9DFF]"
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

        {/* Deposito Cheio */}
        <div className="flex items-center justify-between bg-[#3a3a3c] rounded-xl px-4 py-2.5">
          <span className="text-sm text-white">Deposito Cheio?</span>
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
        <p className="text-xs text-[#636366] -mt-1.5 ml-1">
          {fullTank ? 'Sim -- deposito cheio' : 'Nao -- abastecimento parcial'}
        </p>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#4A9DFF] text-white font-semibold text-base rounded-xl py-3.5 mt-1 transition-opacity disabled:opacity-50"
        >
          {submitting ? 'A guardar...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
