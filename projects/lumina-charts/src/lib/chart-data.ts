import type { ChartConfig, ChartData, ChartTable } from './chart.types';

export function histogram(values: readonly number[], bins = 8): { labels: string[]; counts: number[] } {
  if (!Number.isInteger(bins) || bins < 1 || bins > 200) throw new Error('bins debe ser un entero entre 1 y 200.');
  if (values.some(v => !Number.isFinite(v))) throw new Error('Los valores deben ser números finitos.');
  if (!values.length) return { labels: [], counts: [] };
  let min = Infinity, max = -Infinity;
  for (const value of values) { min = Math.min(min, value); max = Math.max(max, value); }
  if (min === max) return { labels: [String(min)], counts: [values.length] };
  const span = max - min;
  const counts = Array<number>(bins).fill(0);
  for (const value of values) {
    const position = Number.isFinite(span) ? (value - min) / span : (value / 2 - min / 2) / (max / 2 - min / 2);
    counts[Math.min(bins - 1, Math.max(0, Math.floor(position * bins)))]++;
  }
  const boundary = (fraction: number) => Number((Number.isFinite(span) ? min + span * fraction : min * (1 - fraction) + max * fraction).toPrecision(5));
  return { labels: counts.map((_, i) => `${boundary(i / bins)}–${boundary((i + 1) / bins)}`), counts };
}

export function chartToTable(config: ChartConfig): ChartTable {
  if (config.table) {
    if (config.table.rows.some(row => row.length !== config.table!.headers.length)) throw new Error('La tabla debe tener una celda por encabezado.');
    return { headers: [...config.table.headers], rows: config.table.rows.map(row => [...row]) };
  }
  if (config.points) return { headers: ['Serie', 'Nombre', 'X', 'Y', 'Tamaño'], rows: config.points.flatMap(s => s.data.map(p => [s.name, p.name ?? '', p.x, p.y, p.size ?? null])) };
  if (config.type === 'histogram') {
    const result = histogram(config.values ?? [], config.bins);
    return { headers: ['Intervalo', 'Frecuencia'], rows: result.labels.map((label, i) => [label, result.counts[i]]) };
  }
  const data = config.data;
  if (!data) return { headers: [], rows: [] };
  return { headers: ['Categoría', ...data.series.map(s => s.name)], rows: data.labels.map((label, i) => [label, ...data.series.map(s => s.data[i] ?? null)]) };
}

/** RFC 4180 escaping and protection against formulas in spreadsheet string cells. */
export function tableToCsv(table: ChartTable): string {
  const cell = (value: string | number | null) => {
    let text = value === null ? '' : String(value);
    if (typeof value === 'string' && /^[\s]*[=+\-@\t\r]/.test(value)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [table.headers, ...table.rows].map(row => row.map(cell).join(',')).join('\r\n');
}

/** Bounded live updates. The application owns the stream and its pause policy. */
export function appendChartData(config: ChartConfig, incoming: ChartData, maxPoints = 500): ChartConfig {
  if (!Number.isInteger(maxPoints) || maxPoints < 1) throw new Error('maxPoints debe ser un entero positivo.');
  const previous = config.data;
  if (!previous) throw new Error('appendChartData requiere config.data.');
  if (incoming.series.length !== previous.series.length || incoming.series.some((s, i) => s.name !== previous.series[i].name)) throw new Error('Las series deben conservar nombre y orden.');
  for (const chunk of [previous, incoming]) {
    if (chunk.series.some(s => s.data.length !== chunk.labels.length || s.data.some(v => !Number.isFinite(v)))) throw new Error('Cada etiqueta requiere un valor finito por serie.');
  }
  return { ...config, data: { labels: [...previous.labels, ...incoming.labels].slice(-maxPoints), series: previous.series.map((s, i) => ({ ...s, data: [...s.data, ...incoming.series[i].data].slice(-maxPoints) })) } };
}
