export interface RefuelEntry {
  date: string;
  odometer: number | null;
  fuel: 'GPL' | 'Gasolina';
  liters: number;
  cost: number;
  pricePerLiter: number;
  consumption: number | null;
  distance: number | null;
  station: string;
  fullTank: boolean;
}

export interface MonthlySummary {
  month: string;
  count: number;
  gasolinaL: number;
  gplL: number;
  totalL: number;
  cost: number;
}

export const refuelEntries: RefuelEntry[] = [
  { date: '2024-05-18', odometer: 20, fuel: 'GPL', liters: 35.09, cost: 28.04, pricePerLiter: 0.799, consumption: null, distance: null, station: 'AUCHAN SETUBAL', fullTank: false },
  { date: '2024-05-19', odometer: 100, fuel: 'GPL', liters: 10.99, cost: 9.00, pricePerLiter: 0.819, consumption: null, distance: 80, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2024-05-20', odometer: 462, fuel: 'GPL', liters: 28.79, cost: 23.00, pricePerLiter: 0.799, consumption: 7.95, distance: 362, station: 'AUCHAN SETUBAL', fullTank: true },
  { date: '2024-06-08', odometer: 797, fuel: 'GPL', liters: 28.49, cost: 24.33, pricePerLiter: 0.854, consumption: 8.50, distance: 335, station: 'E.S. FOGUETEIRO', fullTank: true },
  { date: '2024-06-24', odometer: 1272, fuel: 'GPL', liters: 42.01, cost: 36.92, pricePerLiter: 0.879, consumption: 8.84, distance: 475, station: '', fullTank: true },
  { date: '2024-07-06', odometer: 1644, fuel: 'GPL', liters: 28.78, cost: 24.00, pricePerLiter: 0.834, consumption: 7.74, distance: 372, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2024-07-11', odometer: 2177, fuel: 'GPL', liters: 40, cost: 36.47, pricePerLiter: 0.912, consumption: 7.50, distance: 533, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2024-07-19', odometer: 2733, fuel: 'GPL', liters: 38.64, cost: 31.65, pricePerLiter: 0.819, consumption: 6.95, distance: 555.7, station: 'AUCHAN COINA', fullTank: true },
  { date: '2024-08-08', odometer: 3167, fuel: 'GPL', liters: 40, cost: 35.67, pricePerLiter: 0.892, consumption: 9.22, distance: 434, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2024-08-09', odometer: 3468, fuel: 'Gasolina', liters: 12.05, cost: 20.00, pricePerLiter: 1.660, consumption: null, distance: 301.1, station: '', fullTank: true },
  { date: '2024-08-16', odometer: 3423, fuel: 'GPL', liters: 21, cost: 17.83, pricePerLiter: 0.849, consumption: 8.20, distance: null, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2024-08-21', odometer: 3957, fuel: 'GPL', liters: 43.13, cost: 37.48, pricePerLiter: 0.869, consumption: 8.07, distance: 534.6, station: '', fullTank: true },
  { date: '2024-08-23', odometer: 4415, fuel: 'GPL', liters: 32.57, cost: 27.00, pricePerLiter: 0.829, consumption: 7.12, distance: 457.6, station: 'AUCHAN COINA', fullTank: true },
  { date: '2024-09-17', odometer: 4911, fuel: 'GPL', liters: 40, cost: 37.56, pricePerLiter: 0.939, consumption: 8.06, distance: 496.1, station: 'E.S. FOGUETEIRO', fullTank: true },
  { date: '2024-09-17', odometer: 5452, fuel: 'GPL', liters: 39.95, cost: 35.31, pricePerLiter: 0.884, consumption: 7.38, distance: 541, station: 'E.S. FOGUETEIRO', fullTank: true },
  { date: '2024-10-05', odometer: 7333, fuel: 'GPL', liters: 43, cost: 37.95, pricePerLiter: 0.883, consumption: 9.34, distance: 1880.5, station: '', fullTank: true },
  { date: '2024-10-30', odometer: 5984, fuel: 'GPL', liters: 45, cost: 40.38, pricePerLiter: 0.898, consumption: 8.45, distance: 532.4, station: '', fullTank: true },
  { date: '2024-11-19', odometer: 6575, fuel: 'GPL', liters: 40.74, cost: 37.44, pricePerLiter: 0.919, consumption: 6.89, distance: 591, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2024-11-23', odometer: 6872, fuel: 'GPL', liters: 21, cost: 19.50, pricePerLiter: 0.929, consumption: 7.07, distance: 296.9, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2024-11-24', odometer: 7629, fuel: 'GPL', liters: 21.1, cost: 19.07, pricePerLiter: 0.904, consumption: 7.11, distance: 757.1, station: '', fullTank: true },
  { date: '2024-11-25', odometer: 6935, fuel: 'Gasolina', liters: 8.9, cost: 14.14, pricePerLiter: 1.589, consumption: null, distance: null, station: '', fullTank: false },
  { date: '2024-12-06', odometer: 7929, fuel: 'GPL', liters: 32, cost: 28.45, pricePerLiter: 0.889, consumption: 10.68, distance: 299.6, station: '', fullTank: true },
  { date: '2024-12-16', odometer: 8367, fuel: 'GPL', liters: 34.82, cost: 32.00, pricePerLiter: 0.919, consumption: 7.95, distance: 437.7, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2025-01-07', odometer: 8772, fuel: 'GPL', liters: 36, cost: 32.36, pricePerLiter: 0.899, consumption: 8.89, distance: 405, station: 'E.S. FOGUETEIRO', fullTank: true },
  { date: '2025-01-25', odometer: 9180, fuel: 'GPL', liters: 34.62, cost: 31.43, pricePerLiter: 0.908, consumption: 8.49, distance: 407.6, station: 'E.S. FOGUETEIRO', fullTank: true },
  { date: '2025-02-11', odometer: 9664, fuel: 'GPL', liters: 35.98, cost: 33.24, pricePerLiter: 0.924, consumption: 7.43, distance: 484.5, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2025-02-16', odometer: 9893, fuel: 'GPL', liters: 18.46, cost: 17.24, pricePerLiter: 0.934, consumption: 8.08, distance: 228.4, station: 'E.S. COINA N10', fullTank: true },
  { date: '2025-03-03', odometer: 10258, fuel: 'GPL', liters: 30.18, cost: 27.88, pricePerLiter: 0.924, consumption: 8.27, distance: 365, station: 'E.S. COINA N10', fullTank: true },
  { date: '2025-03-22', odometer: 10624, fuel: 'GPL', liters: 35.2, cost: 33.23, pricePerLiter: 0.944, consumption: 9.60, distance: 366.6, station: 'E.S. COINA N10', fullTank: true },
  { date: '2025-04-04', odometer: 11032, fuel: 'GPL', liters: 35.3, cost: 33.32, pricePerLiter: 0.944, consumption: 8.65, distance: 408, station: 'E.S. COINA N10', fullTank: true },
  { date: '2025-04-15', odometer: 11448, fuel: 'GPL', liters: 36.37, cost: 33.43, pricePerLiter: 0.919, consumption: 8.74, distance: 416.2, station: 'E.S. FOGUETEIRO', fullTank: true },
  { date: '2025-05-05', odometer: 11835, fuel: 'GPL', liters: 45.68, cost: 40.61, pricePerLiter: 0.889, consumption: null, distance: 386.5, station: 'PRIO Fernao Ferro', fullTank: false },
  { date: '2025-05-12', odometer: 12397, fuel: 'GPL', liters: 32.64, cost: 27.06, pricePerLiter: 0.829, consumption: 8.26, distance: 561.6, station: 'E.S. FOGUETEIRO', fullTank: true },
  { date: '2025-05-19', odometer: 12793, fuel: 'GPL', liters: 37.2, cost: 31.21, pricePerLiter: 0.839, consumption: 9.39, distance: 396, station: 'AUCHAN COINA', fullTank: true },
  { date: '2025-06-03', odometer: 13289, fuel: 'GPL', liters: 38.75, cost: 32.51, pricePerLiter: 0.839, consumption: 7.81, distance: 496.2, station: 'AUCHAN COINA', fullTank: true },
  { date: '2025-06-27', odometer: 13683, fuel: 'GPL', liters: 33.72, cost: 29.30, pricePerLiter: 0.869, consumption: 8.55, distance: 394.4, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2025-07-11', odometer: 14131, fuel: 'GPL', liters: 42.77, cost: 36.31, pricePerLiter: 0.849, consumption: 9.55, distance: 447.8, station: '', fullTank: true },
  { date: '2025-07-24', odometer: 14569, fuel: 'GPL', liters: 35.58, cost: 30.21, pricePerLiter: 0.849, consumption: 8.13, distance: 437.8, station: '', fullTank: true },
  { date: '2025-08-04', odometer: 15037, fuel: 'GPL', liters: 35.59, cost: 29.50, pricePerLiter: 0.829, consumption: 7.61, distance: 467.9, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2025-11-08', odometer: 15496.4, fuel: 'GPL', liters: 41.17, cost: 33.31, pricePerLiter: 0.809, consumption: 8.60, distance: 459.8, station: 'AUCHAN COINA', fullTank: true },
  { date: '2025-11-24', odometer: null, fuel: 'Gasolina', liters: 2.55, cost: 5.00, pricePerLiter: 1.9464, consumption: null, distance: null, station: '', fullTank: false },
  { date: '2025-12-02', odometer: 16047.8, fuel: 'GPL', liters: 39.82, cost: 33.01, pricePerLiter: 0.829, consumption: 8.30, distance: 551.4, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2025-12-07', odometer: 16547.2, fuel: 'GPL', liters: 41.99, cost: 34.81, pricePerLiter: 0.829, consumption: 8.40, distance: 499.4, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2025-12-14', odometer: 17006.7, fuel: 'GPL', liters: 39.2, cost: 32.50, pricePerLiter: 0.829, consumption: 8.50, distance: 459.5, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2025-12-26', odometer: 17480.5, fuel: 'GPL', liters: 43.12, cost: 35.75, pricePerLiter: 0.829, consumption: 8.10, distance: 473.8, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2026-01-07', odometer: 18012.8, fuel: 'GPL', liters: 40.06, cost: 33.41, pricePerLiter: 0.834, consumption: 8.00, distance: 532.3, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2026-01-19', odometer: 18563, fuel: 'GPL', liters: 41.87, cost: 35.13, pricePerLiter: 0.839, consumption: 7.70, distance: 550.2, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2026-01-27', odometer: 19093.6, fuel: 'GPL', liters: 39.26, cost: 33.14, pricePerLiter: 0.844, consumption: 8.10, distance: 530.6, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2026-02-09', odometer: 19579.8, fuel: 'GPL', liters: 45.35, cost: 38.96, pricePerLiter: 0.859, consumption: 8.50, distance: 486.2, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2026-02-18', odometer: 20026.3, fuel: 'GPL', liters: 38.41, cost: 32.99, pricePerLiter: 0.859, consumption: 9.00, distance: 446.5, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2026-02-21', odometer: 20258.1, fuel: 'GPL', liters: 19.35, cost: 19.25, pricePerLiter: 0.994, consumption: 8.30, distance: 231.8, station: 'Galp', fullTank: true },
  { date: '2026-02-21', odometer: 20461.2, fuel: 'GPL', liters: 40.23, cost: 38.18, pricePerLiter: 0.949, consumption: 9.00, distance: 434.9, station: '(sem registo)', fullTank: true },
  { date: '2026-02-22', odometer: 20943.8, fuel: 'GPL', liters: 37.38, cost: 32.11, pricePerLiter: 0.859, consumption: 8.20, distance: 482.6, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2026-03-03', odometer: null, fuel: 'Gasolina', liters: 5.55, cost: 10.00, pricePerLiter: 1.799, consumption: null, distance: null, station: 'Galp', fullTank: false },
  { date: '2026-03-03', odometer: 26008, fuel: 'GPL', liters: 40.99, cost: 35.21, pricePerLiter: 0.859, consumption: 8.10, distance: 513.8, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2026-03-04', odometer: null, fuel: 'Gasolina', liters: 5.55, cost: 10.00, pricePerLiter: 1.799, consumption: null, distance: null, station: 'Galp', fullTank: false },
  { date: '2026-03-07', odometer: 26498, fuel: 'GPL', liters: 40.97, cost: 36.01, pricePerLiter: 0.879, consumption: 8.20, distance: 490, station: 'PRIO Fernao Ferro', fullTank: true },
  { date: '2026-03-15', odometer: 26989.8, fuel: 'GPL', liters: 38.32, cost: 36.32, pricePerLiter: 0.948, consumption: 8.10, distance: 491.8, station: 'E.S. FOGUETEIRO', fullTank: true },
];

export const monthlySummaries: MonthlySummary[] = [
  { month: '2024-05', count: 3, gasolinaL: 0, gplL: 74.87, totalL: 74.87, cost: 60.04 },
  { month: '2024-06', count: 2, gasolinaL: 0, gplL: 70.5, totalL: 70.5, cost: 61.25 },
  { month: '2024-07', count: 3, gasolinaL: 0, gplL: 107.42, totalL: 107.42, cost: 92.12 },
  { month: '2024-08', count: 5, gasolinaL: 12.05, gplL: 136.7, totalL: 148.75, cost: 137.98 },
  { month: '2024-09', count: 2, gasolinaL: 0, gplL: 79.95, totalL: 79.95, cost: 72.87 },
  { month: '2024-10', count: 2, gasolinaL: 0, gplL: 88, totalL: 88, cost: 78.33 },
  { month: '2024-11', count: 4, gasolinaL: 8.9, gplL: 82.84, totalL: 91.74, cost: 90.15 },
  { month: '2024-12', count: 2, gasolinaL: 0, gplL: 66.82, totalL: 66.82, cost: 60.45 },
  { month: '2025-01', count: 2, gasolinaL: 0, gplL: 70.62, totalL: 70.62, cost: 63.79 },
  { month: '2025-02', count: 2, gasolinaL: 0, gplL: 54.44, totalL: 54.44, cost: 50.48 },
  { month: '2025-03', count: 2, gasolinaL: 0, gplL: 65.38, totalL: 65.38, cost: 61.11 },
  { month: '2025-04', count: 2, gasolinaL: 0, gplL: 71.67, totalL: 71.67, cost: 66.75 },
  { month: '2025-05', count: 3, gasolinaL: 0, gplL: 115.52, totalL: 115.52, cost: 98.88 },
  { month: '2025-06', count: 2, gasolinaL: 0, gplL: 72.47, totalL: 72.47, cost: 61.81 },
  { month: '2025-07', count: 2, gasolinaL: 0, gplL: 78.35, totalL: 78.35, cost: 66.52 },
  { month: '2025-08', count: 1, gasolinaL: 0, gplL: 35.59, totalL: 35.59, cost: 29.50 },
  { month: '2025-11', count: 2, gasolinaL: 2.55, gplL: 41.17, totalL: 43.72, cost: 38.31 },
  { month: '2025-12', count: 4, gasolinaL: 0, gplL: 164.13, totalL: 164.13, cost: 136.07 },
  { month: '2026-01', count: 3, gasolinaL: 0, gplL: 121.19, totalL: 121.19, cost: 101.68 },
  { month: '2026-02', count: 5, gasolinaL: 0, gplL: 180.72, totalL: 180.72, cost: 161.49 },
  { month: '2026-03', count: 5, gasolinaL: 11.1, gplL: 120.28, totalL: 131.38, cost: 127.54 },
];

// Vehicle info
export const vehicle = {
  name: 'Dacia Sandero Stepway',
  plate: 'BJ-13-PO',
  currentOdometer: 26989.8,
};
