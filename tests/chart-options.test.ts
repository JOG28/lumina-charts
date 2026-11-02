import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChartOption } from '../projects/lumina-charts/src/lib/chart-options';
import { ChartType } from '../projects/lumina-charts/src/lib/chart.types';

const data = { labels: ['Ene', 'Feb'], series: [{ name: 'Ventas', data: [12, 30] }] };
test('all simple chart variants generate the expected ECharts series', () => {
  const expected = { line: 'line', area: 'line', bar: 'bar', horizontalBar: 'bar', stackedBar: 'bar', pie: 'pie', donut: 'pie', scatter: 'scatter', bubble: 'scatter', radar: 'radar', gauge: 'gauge', funnel: 'funnel' };
  for (const [type, seriesType] of Object.entries(expected)) {
    const option = buildChartOption({ type: type as ChartType, data });
    assert.equal((option.series as {type: string}[])[0].type, seriesType);
  }
});
test('horizontal bars swap axes and stacked bars share a stack', () => {
  assert.equal((buildChartOption({type: 'horizontalBar', data}).yAxis as {type: string}).type, 'category');
  assert.equal((buildChartOption({type: 'stackedBar', data}).series as {stack: string}[])[0].stack, 'total');
});
test('rejects mismatched and nonfinite values', () => {
  assert.throws(() => buildChartOption({type: 'line', data: {...data, series: [{name:'Bad', data:[1]}]}}), /etiqueta/);
  assert.throws(() => buildChartOption({type: 'bar', data: {...data, series: [{name:'Bad', data:[1, NaN]}]}}), /finitos/);
});
test('advanced charts require native options and preserve them', () => {
  assert.throws(() => buildChartOption({type: 'sankey'}), /requiere option/);
  const series = [{type: 'sankey' as const, data: [{name: 'A'}], links: []}];
  assert.equal(buildChartOption({type: 'sankey', option: {series}}).series, series);
});
test('builder leaves inputs unchanged and supports dark theme', () => {
  const before = JSON.stringify(data);
  const option = buildChartOption({type: 'area', data, theme: 'dark', animation: false});
  assert.equal(JSON.stringify(data), before);
  assert.equal(option.animation, false);
  assert.equal((option.textStyle as {color: string}).color, '#bfc5d6');
});
