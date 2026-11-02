import type { CustomSeriesOption } from 'echarts';
import type { ChartConfig } from './chart.types';

export interface GanttTask { name: string; start: number; end: number; progress?: number; }
export interface RangePoint { label: string; low: number; high: number; }

/** Numeric schedule (days/hours). This is a chart, not a scheduling/dependency editor. */
export function ganttChart(tasks: readonly GanttTask[]): ChartConfig {
  if (tasks.some(t => !Number.isFinite(t.start) || !Number.isFinite(t.end) || t.end < t.start || (t.progress !== undefined && (!Number.isFinite(t.progress) || t.progress < 0 || t.progress > 1)))) throw new Error('Las tareas requieren rangos ordenados y progreso entre 0 y 1.');
  const series: CustomSeriesOption = {
    type: 'custom', name: 'Duración', encode: { x: [0, 1], y: 2 },
    renderItem: (_params, api) => {
      const start = api.coord([api.value(0), api.value(2)]), end = api.coord([api.value(1), api.value(2)]);
      const size = api.size?.([0, 1]) as number[] | undefined;
      const height = Math.min(28, (size?.[1] ?? 40) * .6);
      const progress = Number(api.value(3));
      return { type: 'group', children: [
        { type: 'rect', shape: { x: start[0], y: start[1] - height / 2, width: Math.max(0, end[0] - start[0]), height, r: 5 }, style: { fill: '#7462e845' } },
        { type: 'rect', shape: { x: start[0], y: start[1] - height / 2, width: Math.max(0, end[0] - start[0]) * progress, height, r: 5 }, style: { fill: '#7462e8' } }
      ] };
    },
    clip: true, data: tasks.map((t, i) => ({ name: t.name, value: [t.start, t.end, i, t.progress ?? 0] }))
  };
  return { type: 'gantt', legend: false, table: { headers: ['Tarea', 'Inicio', 'Fin', 'Progreso'], rows: tasks.map(t => [t.name, t.start, t.end, t.progress ?? 0]) }, option: { xAxis: { type: 'value' }, yAxis: { type: 'category', inverse: true, data: tasks.map(t => t.name) }, series: [series] } };
}

/** An interval band built as polygons; low/high values may cross zero. */
export function rangeAreaChart(points: readonly RangePoint[]): ChartConfig {
  if (points.some(p => !Number.isFinite(p.low) || !Number.isFinite(p.high) || p.low > p.high)) throw new Error('Cada intervalo requiere low <= high y valores finitos.');
  const series: CustomSeriesOption = {
    type: 'custom', name: 'Intervalo', encode: { x: 0, y: [1, 2] },
    renderItem: (params, api) => {
      const index = params.dataIndex;
      const point = points[index];
      const next = points[index + 1];
      if (!next) return { type: 'circle', shape: { cx: api.coord([index, point.high])[0], cy: api.coord([index, point.high])[1], r: 3 }, style: { fill: '#7462e8' } };
      const vertices = [[index, point.low], [index + 1, next.low], [index + 1, next.high], [index, point.high]].map(p => api.coord(p));
      return { type: 'polygon', shape: { points: vertices }, style: { fill: '#7462e845', stroke: '#7462e8', lineWidth: 1 } };
    }, clip: true, data: points.map((p, i) => [i, p.low, p.high])
  };
  return { type: 'rangeArea', legend: false, table: { headers: ['Categoría', 'Mínimo', 'Máximo'], rows: points.map(p => [p.label, p.low, p.high]) }, option: { xAxis: { type: 'category', boundaryGap: false, data: points.map(p => p.label) }, yAxis: { type: 'value' }, series: [series] } };
}
