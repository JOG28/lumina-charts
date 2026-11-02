import type { EChartsOption, SeriesOption } from 'echarts';
import { CHART_TYPES, ChartConfig, ChartLayout } from './chart.types';
import { histogram } from './chart-data';

export const LUMINA_COLORS = ['#7462e8', '#32b6a0', '#f0b45b', '#e77ca2', '#5b9fe8', '#ae86db'];
const simple = new Set(['line', 'area', 'bar', 'horizontalBar', 'stackedBar', 'pie', 'donut', 'scatter', 'bubble', 'radar', 'gauge', 'funnel', 'stepLine', 'stackedArea', 'normalizedBar', 'waterfall', 'histogram', 'rose', 'radialBar', 'combo', 'pictorialBar']);
export const CARTESIAN_TYPES = new Set(['line', 'area', 'bar', 'horizontalBar', 'stackedBar', 'scatter', 'bubble', 'stepLine', 'stackedArea', 'normalizedBar', 'waterfall', 'histogram', 'combo', 'pictorialBar', 'candlestick', 'boxplot', 'heatmap', 'gantt', 'rangeArea', 'custom']);

/** Pure builder. Native `option` overrides generated properties at the top level. */
export function buildChartOption(config: ChartConfig, layout: ChartLayout = {}): EChartsOption {
  if (!CHART_TYPES.includes(config.type)) throw new Error(`Tipo de gráfica desconocido: ${config.type}`);
  if (!simple.has(config.type) && !config.option) throw new Error(`${config.type} requiere option con datos de ECharts.`);
  const dark = config.theme === 'dark';
  const compact = layout.width !== undefined && layout.width < 480;
  const text = dark ? '#bfc5d6' : '#73798c';
  const grid = dark ? '#30364a' : '#edf0f5';
  const format = new Intl.NumberFormat(config.locale ?? 'es-MX', { maximumFractionDigits: config.decimals ?? 2 });
  const zoom = config.zoom;
  const slider = !!zoom && (typeof zoom === 'boolean' || zoom.slider !== false);
  const bottom = slider ? 82 : 42;
  const base: EChartsOption = {
    color: config.colors ?? [...LUMINA_COLORS], backgroundColor: 'transparent',
    animation: layout.reducedMotion ? false : config.animation ?? true,
    textStyle: { fontFamily: 'Inter, Segoe UI, sans-serif', color: text, fontSize: compact ? 11 : 12 },
    aria: { enabled: true, decal: { show: false } },
    tooltip: { trigger: 'item', confine: true, renderMode: 'richText' },
    legend: { show: config.legend ?? true, type: 'scroll', bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: text }, pageTextStyle: { color: text } },
    grid: { left: compact ? 8 : 18, right: compact ? 12 : 20, top: 30, bottom, containLabel: true }
  };
  let data = config.data;
  if (config.type === 'histogram') {
    const result = histogram(config.values ?? [], config.bins);
    data = { labels: result.labels, series: [{ name: 'Frecuencia', data: result.counts }] };
  }
  const first = data?.series[0];
  if (data && simple.has(config.type)) {
    if (data.series.some(s => s.data.length !== data.labels.length)) throw new Error('Cada serie debe tener un valor por etiqueta.');
    if (data.series.some(s => s.data.some(v => !Number.isFinite(v)))) throw new Error('Los valores deben ser números finitos.');
    const parts = data.labels.map((name, i) => ({ name, value: first?.data[i] ?? 0 }));
    if (['pie', 'donut', 'funnel', 'rose'].includes(config.type)) {
      if (parts.some(p => p.value < 0)) throw new Error('Las proporciones deben ser positivas o cero.');
      base.series = config.type === 'funnel'
        ? [{ type: 'funnel', name: first?.name, data: parts, left: '15%', width: '70%', bottom: 40 }]
        : [{ type: 'pie', name: first?.name, data: parts, radius: config.type === 'donut' ? ['55%', '76%'] : config.type === 'rose' ? ['15%', '76%'] : '75%', roseType: config.type === 'rose' ? 'area' : undefined, center: ['50%', '44%'], label: { show: false }, itemStyle: { borderRadius: 5, borderWidth: 3, borderColor: dark ? '#1b2030' : '#fff' } }];
    } else if (config.type === 'gauge') {
      base.series = [{ type: 'gauge', progress: { show: true, width: 16 }, axisLine: { lineStyle: { width: 16 } }, detail: { formatter: '{value}%', color: text, fontSize: 30 }, data: [{ value: first?.data[0] ?? 0, name: data.labels[0] ?? '' }] }];
    } else if (config.type === 'radar') {
      let max = 1;
      for (const series of data.series) for (const v of series.data) max = Math.max(max, v);
      base.radar = { indicator: data.labels.map(name => ({ name, max: max * 1.2 })), radius: '65%', splitArea: { show: false }, axisName: { color: text } };
      base.series = [{ type: 'radar', areaStyle: { opacity: .12 }, data: data.series.map(s => ({ name: s.name, value: [...s.data] })) }];
    } else if (config.type === 'radialBar') {
      let max = 100;
      for (const v of first?.data ?? []) max = Math.max(max, v);
      base.polar = { radius: ['12%', '72%'] };
      base.angleAxis = { max, startAngle: 90, show: false };
      base.radiusAxis = { type: 'category', data: data.labels, axisLabel: { color: text }, axisLine: { show: false }, axisTick: { show: false } };
      base.series = [{ type: 'bar', coordinateSystem: 'polar', data: first?.data ?? [], roundCap: true, itemStyle: { color: params => (config.colors?.length ? config.colors : LUMINA_COLORS)[params.dataIndex % (config.colors?.length || LUMINA_COLORS.length)] } }];
    } else {
      const horizontal = config.type === 'horizontalBar';
      const category = { type: 'category' as const, data: [...data.labels], axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: text, hideOverlap: true } };
      const value = { type: 'value' as const, splitLine: { lineStyle: { color: grid } }, axisLabel: { color: text, formatter: (v: number) => format.format(v) } };
      base.xAxis = horizontal ? value : category;
      base.yAxis = horizontal ? category : config.type === 'combo' && data.series.some(s => s.yAxisIndex === 1) ? [value, { ...value, splitLine: { show: false } }] : value;
      base.tooltip = { trigger: 'axis', confine: true, renderMode: 'richText', valueFormatter: v => typeof v === 'number' ? format.format(v) : String(v) };
      if (config.type === 'normalizedBar' && data.series.some(s => s.data.some(v => v < 0))) throw new Error('normalizedBar requiere valores positivos o cero.');
      const totals = data.labels.map((_, i) => data!.series.reduce((sum, s) => sum + s.data[i], 0));
      base.series = data.series.map((s, i): SeriesOption => {
        const type = config.type === 'combo' ? s.type ?? (i ? 'line' : 'bar') : ['scatter', 'bubble'].includes(config.type) ? 'scatter' : ['line', 'area', 'stepLine', 'stackedArea'].includes(config.type) ? 'line' : config.type === 'pictorialBar' ? 'pictorialBar' : 'bar';
        const common = { name: s.name, data: config.type === 'normalizedBar' ? s.data.map((v, j) => totals[j] ? v / totals[j] * 100 : 0) : [...s.data], yAxisIndex: s.yAxisIndex ?? 0 };
        if (type === 'line') return { ...common, type, smooth: config.type === 'stepLine' ? false : config.smooth ?? true, step: config.type === 'stepLine' ? 'middle' : false, symbolSize: 7, areaStyle: ['area', 'stackedArea'].includes(config.type) ? { opacity: .16 } : undefined, stack: config.type === 'stackedArea' ? 'total' : undefined, sampling: config.performance ? 'lttb' : undefined, showSymbol: !config.performance, lineStyle: { width: 3 } };
        if (type === 'scatter') return { ...common, type, symbolSize: config.type === 'bubble' ? 22 : 7, large: config.performance ?? false, progressive: config.performance ? 5000 : undefined };
        if (type === 'pictorialBar') return { ...common, type, symbol: 'roundRect', symbolRepeat: true, symbolSize: [18, 6], symbolMargin: 2 };
        return { ...common, type, stack: ['stackedBar', 'normalizedBar'].includes(config.type) ? 'total' : undefined, barMaxWidth: 32, barGap: config.type === 'histogram' ? '0%' : undefined, large: config.performance ?? false, itemStyle: { borderRadius: 4 } };
      });
      if (config.type === 'normalizedBar') base.yAxis = { ...value, max: 100, axisLabel: { color: text, formatter: '{value}%' } };
      if (config.type === 'waterfall') {
        let total = 0;
        const offset: number[] = [], changes: { value: number; itemStyle: { color: string } }[] = [];
        for (const amount of first?.data ?? []) {
          offset.push(Math.min(total, total + amount));
          changes.push({ value: Math.abs(amount), itemStyle: { color: amount >= 0 ? '#32b6a0' : '#e77ca2' } });
          total += amount;
        }
        base.legend = { show: false };
        base.series = [{ name: 'Base', type: 'bar', stack: 'waterfall', stackStrategy: 'all', data: offset, silent: true, tooltip: { show: false }, itemStyle: { color: 'transparent' }, emphasis: { itemStyle: { color: 'transparent' } } }, { name: first?.name, type: 'bar', stack: 'waterfall', stackStrategy: 'all', data: changes, barMaxWidth: 32, tooltip: { valueFormatter: (_value, index) => String(first?.data[index]) }, label: { show: true, position: 'top', color: text, formatter: p => String(first?.data[p.dataIndex]) } }];
      }
    }
  }
  if (config.points && ['scatter', 'bubble'].includes(config.type)) {
    if (config.points.some(s => s.data.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || (p.size !== undefined && (!Number.isFinite(p.size) || p.size < 0))))) throw new Error('Los puntos requieren coordenadas finitas y tamaño positivo.');
    base.xAxis = { type: 'value', axisLabel: { color: text }, splitLine: { lineStyle: { color: grid } } };
    base.yAxis = { type: 'value', axisLabel: { color: text }, splitLine: { lineStyle: { color: grid } } };
    base.series = config.points.map(s => ({ name: s.name, type: 'scatter', data: s.data.map(p => ({ name: p.name, value: [p.x, p.y, p.size ?? 12] })), symbolSize: config.type === 'bubble' ? value => Math.min(80, Math.max(4, Number(value[2]))) : 9, large: config.performance ?? false }));
  }
  if (CARTESIAN_TYPES.has(config.type)) {
    if (zoom) {
      const range = typeof zoom === 'object' ? zoom : {};
      const axis = config.type === 'horizontalBar' ? { yAxisIndex: 0 } : { xAxisIndex: 0 };
      base.dataZoom = [{ type: 'inside', ...axis, start: range.start ?? 0, end: range.end ?? 100, zoomOnMouseWheel: true, moveOnMouseMove: false, moveOnMouseWheel: false, preventDefaultMouseMove: false }, ...(slider ? [{ type: 'slider' as const, ...axis, bottom: 25, height: compact ? 26 : 22, start: range.start ?? 0, end: range.end ?? 100, borderColor: grid, textStyle: { color: text } }] : [])];
    }
    if (config.crosshair) {
      base.axisPointer = { link: [{ xAxisIndex: 'all' }], label: { backgroundColor: '#7462e8' } };
      base.tooltip = { ...(base.tooltip as object), trigger: 'axis', axisPointer: { type: 'cross' } };
    }
    if (config.brush) base.brush = { toolbox: ['rect', 'polygon', 'clear'], xAxisIndex: 'all', brushMode: 'single', throttleType: 'debounce', throttleDelay: 100 };
  }
  const result: EChartsOption = { ...base, ...config.option };
  if (CARTESIAN_TYPES.has(config.type)) {
    // Clone native series before attaching overlays so caller-owned options remain immutable.
    const source = result.series;
    const series = (Array.isArray(source) ? source : source ? [source] : []).map(s => ({ ...s }));
    const target = series[config.type === 'waterfall' ? 1 : 0];
    if (target && (config.annotations?.length || config.bands?.length)) {
      const annotations = config.annotations ?? [], bands = config.bands ?? [];
      if (annotations.some(a => !Number.isFinite(a.value)) || bands.some(b => !Number.isFinite(b.start) || !Number.isFinite(b.end) || b.start > b.end)) throw new Error('Las anotaciones y bandas requieren valores finitos y rangos ordenados.');
      Object.assign(target, {
        markLine: { symbol: 'none', label: { color: text, position: 'insideEndTop' }, data: annotations.map(a => ({ name: a.name, [a.axis === 'x' ? 'xAxis' : 'yAxis']: a.value, lineStyle: { color: a.color ?? '#f0b45b', type: 'dashed' }, label: { formatter: a.name } })) },
        markArea: { silent: true, data: bands.map(b => [{ name: b.name, [b.axis === 'x' ? 'xAxis' : 'yAxis']: b.start, itemStyle: { color: b.color ?? '#7462e820' } }, { [b.axis === 'x' ? 'xAxis' : 'yAxis']: b.end }]) }
      });
      result.series = series as SeriesOption[];
    }
  }
  return result;
}
