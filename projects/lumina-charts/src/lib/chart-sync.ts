import type { ECharts } from 'echarts';
interface ChartEngine { connect(group: string): unknown; disconnect(group: string): void; }
const groups = new Map<string, Set<ECharts>>();
export function joinChartGroup(engine: ChartEngine, chart: ECharts, name: string): () => void {
  const group = `lumina:${name}`;
  let members = groups.get(group);
  if (!members) { members = new Set(); groups.set(group, members); engine.connect(group); }
  members.add(chart);
  chart.group = group;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    members!.delete(chart);
    chart.group = '';
    if (!members!.size) { groups.delete(group); engine.disconnect(group); }
  };
}
