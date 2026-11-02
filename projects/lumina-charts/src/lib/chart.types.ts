import type { EChartsOption } from 'echarts';

export const CHART_TYPES = ['line', 'area', 'bar', 'horizontalBar', 'stackedBar', 'pie', 'donut', 'scatter', 'bubble', 'radar', 'heatmap', 'candlestick', 'boxplot', 'gauge', 'funnel', 'treemap', 'sunburst', 'sankey', 'graph', 'parallel', 'themeRiver', 'map', 'custom', 'stepLine', 'stackedArea', 'normalizedBar', 'waterfall', 'histogram', 'rose', 'radialBar', 'combo', 'gantt', 'rangeArea', 'tree', 'calendar', 'pictorialBar'] as const;
export type ChartType = typeof CHART_TYPES[number];
export type ChartTheme = 'light' | 'dark';
export interface ChartSeries { name: string; data: number[]; type?: 'line' | 'bar'; yAxisIndex?: 0 | 1; }
export interface ChartPoint { x: number; y: number; size?: number; name?: string; }
export interface ChartPointSeries { name: string; data: ChartPoint[]; }
export interface ChartTable { headers: string[]; rows: (string | number | null)[][]; }
export interface ChartAnnotation { name: string; value: number; axis?: 'x' | 'y'; color?: string; }
export interface ChartBand { name: string; start: number; end: number; axis?: 'x' | 'y'; color?: string; }
export interface ChartState {
  zoom: { start?: number; end?: number; startValue?: number | string; endValue?: number | string }[];
  legend: Record<string, boolean>;
}
/** Cartesian and composition charts use labels/series. Advanced charts use option. */
export interface ChartData { labels: string[]; series: ChartSeries[]; }
export interface ChartConfig {
  type: ChartType;
  data?: ChartData;
  option?: EChartsOption;
  theme?: ChartTheme;
  colors?: string[];
  legend?: boolean;
  smooth?: boolean;
  animation?: boolean;
  /** Numeric XY scatter/bubble series. Takes precedence over data. */
  points?: ChartPointSeries[];
  /** Unbinned observations for histogram. */
  values?: number[];
  bins?: number;
  zoom?: boolean | { start?: number; end?: number; slider?: boolean };
  crosshair?: boolean;
  brush?: boolean;
  annotations?: ChartAnnotation[];
  bands?: ChartBand[];
  performance?: boolean;
  locale?: string;
  decimals?: number;
  /** Explicit table for advanced series; used by CSV, JSON and accessible tables. */
  table?: ChartTable;
  drilldown?: Record<string, ChartConfig>;
  preserveState?: boolean;
}
export interface ChartClick { name: string; seriesName?: string; dataIndex?: number; value: unknown; }
export interface ChartInteraction { type: 'datazoom' | 'legendselectchanged' | 'brushselected'; payload: unknown; }
export interface ChartExport { format: 'svg' | 'png' | 'csv' | 'json'; content: string; filename: string; }
export interface ChartLayout { width?: number; reducedMotion?: boolean; }
