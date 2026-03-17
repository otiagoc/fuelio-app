import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format number with Portuguese locale (comma as decimal separator) */
export function fmtNum(value: number, decimals = 2): string {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format currency in EUR with Portuguese locale */
export function fmtEur(value: number, decimals = 2): string {
  return `${fmtNum(value, decimals)}\u00A0\u20AC`;
}

/** Format date string to Portuguese display format */
export function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Format date string to short display (e.g. "18 mai") */
export function fmtDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
}

/** Get month name in Portuguese */
export function getMonthName(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  const name = d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Get short month label (e.g. "Mar 26") */
export function getMonthShort(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
}

/** Group items by a key function */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}
