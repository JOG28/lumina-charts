import { ChartConfig, ChartType, ganttChart, rangeAreaChart } from 'lumina-charts';
import type { EChartsOption } from 'echarts';

export interface Sample { type: ChartType; name: string; category: string; description: string; config: ChartConfig; }
const data = { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], series: [{ name: 'Este año', data: [32, 48, 39, 67, 52, 84] }, { name: 'Anterior', data: [22, 31, 28, 42, 38, 54] }] };
const simple: [ChartType, string, string, string][] = [
  ['line', 'Líneas', 'Tendencias', 'Cada punto cuenta una parte de la historia.'],
  ['area', 'Áreas', 'Tendencias', 'Dale volumen a tus tendencias.'],
  ['bar', 'Barras', 'Comparación', 'Compara valores de un vistazo.'],
  ['horizontalBar', 'Barras horizontales', 'Comparación', 'Un espacio para las etiquetas más largas.'],
  ['stackedBar', 'Barras apiladas', 'Comparación', 'El total y todas sus partes.'],
  ['donut', 'Dona', 'Composición', 'Pequeñas partes, una gran historia.'],
  ['pie', 'Circular', 'Composición', 'La proporción de cada categoría.'],
  ['scatter', 'Dispersión', 'Distribución', 'Descubre patrones entre tus datos.'],
  ['bubble', 'Burbujas', 'Distribución', 'Puntos con una presencia diferente.'],
  ['radar', 'Radar', 'Comparación', 'Explora múltiples dimensiones a la vez.'],
  ['gauge', 'Indicador', 'Composición', 'Tu siguiente objetivo, más cerca.'],
  ['funnel', 'Embudo', 'Composición', 'Entiende cada paso de la conversión.']
  ,['stepLine', 'Línea escalonada', 'Tendencias', 'Cambios discretos, sin suavizar la historia.']
  ,['stackedArea', 'Áreas apiladas', 'Tendencias', 'La evolución de cada parte del conjunto.']
  ,['normalizedBar', 'Barras al 100%', 'Comparación', 'Compara proporciones entre periodos.']
  ,['waterfall', 'Cascada', 'Comparación', 'Entiende las subidas y bajadas de un saldo.']
  ,['rose', 'Rosa de Nightingale', 'Composición', 'Compara magnitudes en forma radial.']
  ,['radialBar', 'Barras radiales', 'Composición', 'Avances que recorren su propio camino.']
  ,['combo', 'Combinada', 'Comparación', 'Barras y líneas, una visión compartida.']
  ,['pictorialBar', 'Barras pictóricas', 'Comparación', 'Cada símbolo representa una parte del valor.']
];
const advanced: [ChartType, string, string, EChartsOption][] = [
  ['heatmap', 'Mapa de calor', 'Intensidad y patrones en una matriz.', { xAxis: { type: 'category', data: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] }, yAxis: { type: 'category', data: ['AM', 'PM', 'Noche'] }, visualMap: { min: 0, max: 10, show: false, inRange: { color: ['#f0edff', '#7462e8'] } }, series: [{ type: 'heatmap', data: Array.from({length: 15}, (_, i) => [i % 5, Math.floor(i / 5), (i * 7 + 3) % 11]), itemStyle: { borderWidth: 5, borderColor: '#fff', borderRadius: 8 } }] }],
  ['candlestick', 'Velas', 'Apertura, cierre y rango de precios.', { xAxis: { data: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] }, yAxis: { scale: true }, series: [{ type: 'candlestick', data: [[20, 30, 15, 34], [30, 24, 21, 36], [24, 32, 20, 38], [32, 39, 30, 42], [39, 35, 32, 44]], itemStyle: { color: '#32b6a0', color0: '#e77ca2', borderColor: '#32b6a0', borderColor0: '#e77ca2' } }] }],
  ['boxplot', 'Caja y bigotes', 'Mediana, extremos y dispersión.', { xAxis: { data: ['A', 'B', 'C', 'D'] }, yAxis: {}, series: [{ type: 'boxplot', data: [[12, 20, 25, 32, 43], [18, 24, 31, 40, 52], [10, 18, 23, 29, 38], [25, 32, 39, 45, 60]] }] }],
  ['treemap', 'Mapa de árbol', 'Jerarquías que se entienden por su tamaño.', { series: [{ type: 'treemap', breadcrumb: { show: false }, data: [{ name: 'Producto', value: 42 }, { name: 'Diseño', value: 28 }, { name: 'Marketing', value: 18 }, { name: 'Otros', value: 12 }], itemStyle: { borderWidth: 4, borderColor: '#fff' } }] }],
  ['sunburst', 'Sunburst', 'Explora las capas de una jerarquía.', { series: [{ type: 'sunburst', radius: ['15%', '85%'], data: [{ name: 'Web', children: [{ name: 'Orgánico', value: 35 }, { name: 'Social', value: 25 }] }, { name: 'App', children: [{ name: 'iOS', value: 28 }, { name: 'Android', value: 22 }] }] }] }],
  ['sankey', 'Sankey', 'Sigue el flujo entre categorías.', { series: [{ type: 'sankey', left: 15, right: 65, data: [{ name: 'Visitas' }, { name: 'Registro' }, { name: 'Compra' }, { name: 'Salida' }], links: [{ source: 'Visitas', target: 'Registro', value: 70 }, { source: 'Visitas', target: 'Salida', value: 30 }, { source: 'Registro', target: 'Compra', value: 45 }, { source: 'Registro', target: 'Salida', value: 25 }], lineStyle: { color: 'gradient', opacity: .25 } }] }],
  ['graph', 'Red de nodos', 'Conecta ideas, personas o sistemas.', { series: [{ type: 'graph', layout: 'force', roam: true, label: { show: true }, force: { repulsion: 200 }, data: ['Angular', 'Datos', 'Diseño', 'Lúmina', 'Comunidad'].map((name, i) => ({ name, symbolSize: i === 3 ? 58 : 38 })), links: [{ source: 0, target: 3 }, { source: 1, target: 3 }, { source: 2, target: 3 }, { source: 3, target: 4 }] }] }],
  ['parallel', 'Coordenadas paralelas', 'Compara relaciones entre dimensiones.', { parallelAxis: [{ dim: 0, name: 'Precio' }, { dim: 1, name: 'Calidad' }, { dim: 2, name: 'Uso' }], parallel: { left: 35, right: 35, top: 35, bottom: 30 }, series: [{ type: 'parallel', lineStyle: { width: 3 }, data: [[12, 80, 65], [35, 60, 90], [60, 95, 45], [80, 72, 82]] }] }],
  ['themeRiver', 'Río temático', 'Cómo evolucionan las partes de un total.', { singleAxis: { type: 'time', bottom: 35 }, series: [{ type: 'themeRiver', data: ['2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01'].flatMap((date, i) => [[date, 12 + i * 5, 'Web'], [date, 20 - i * 2, 'App']]) }] }],
  ['custom', 'Personalizada', 'Tu propio renderizador con la API de ECharts.', { xAxis: { min: 0, max: 100 }, yAxis: { data: ['Diseño', 'Código', 'Pruebas'] }, series: [{ type: 'custom', renderItem: (_params, api) => { const start = api.coord([api.value(0), api.value(2)]); const end = api.coord([api.value(1), api.value(2)]); return { type: 'rect', shape: { x: start[0], y: start[1] - 12, width: end[0] - start[0], height: 24, r: 6 }, style: { fill: '#7462e8' } }; }, data: [[5, 35, 0], [25, 80, 1], [65, 95, 2]] }] }]
];
export const SAMPLES: Sample[] = [
  ...simple.map(([type, name, category, description]) => ({ type, name, category, description, config: { type, data: ['pie', 'donut', 'funnel'].includes(type) ? { labels: ['Directo', 'Orgánico', 'Social', 'Referidos'], series: [{ name: 'Visitas', data: [42, 28, 18, 12] }] } : data } })),
  ...advanced.map(([type, name, description, option]) => ({ type, name, category: 'Avanzadas', description, config: { type, option, legend: false } })),
  { type: 'histogram', name: 'Histograma', category: 'Distribución', description: 'De observaciones a una distribución real.', config: { type: 'histogram', values: [12, 13, 18, 21, 21, 23, 24, 25, 25, 26, 28, 29, 30, 32, 33, 35, 40, 46, 50, 51, 56], bins: 7, legend: false } },
  { type: 'gantt', name: 'Gantt', category: 'Avanzadas', description: 'Duraciones y avance de tus tareas.', config: ganttChart([{ name: 'Diseño', start: 1, end: 5, progress: 1 }, { name: 'Desarrollo', start: 3, end: 12, progress: .6 }, { name: 'Pruebas', start: 9, end: 15, progress: .2 }]) },
  { type: 'rangeArea', name: 'Área de rango', category: 'Tendencias', description: 'Visualiza incertidumbre y límites de un intervalo.', config: rangeAreaChart([{label:'Ene',low:18,high:35}, {label:'Feb',low:22,high:45}, {label:'Mar',low:30,high:55}, {label:'Abr',low:24,high:48}, {label:'May',low:35,high:65}, {label:'Jun',low:42,high:78}]) },
  { type: 'tree', name: 'Árbol jerárquico', category: 'Avanzadas', description: 'Toca los nodos para desplegar sus ramas.', config: { type: 'tree', legend: false, option: { series: [{ type: 'tree', left: '14%', right: '20%', top: '10%', bottom: '10%', symbolSize: 10, label: { position: 'left' }, leaves: { label: { position: 'right' } }, initialTreeDepth: 2, data: [{ name: 'Equipo', children: [{ name: 'Producto', children: [{ name: 'Diseño' }, { name: 'Código' }] }, { name: 'Negocio', children: [{ name: 'Ventas' }, { name: 'Soporte' }] }] }] }] } } },
  { type: 'calendar', name: 'Calendario de actividad', category: 'Distribución', description: 'Cada día tiene una intensidad diferente.', config: { type: 'calendar', legend: false, option: { calendar: { top: 42, left: 40, right: 15, bottom: 30, range: ['2026-01-01', '2026-03-31'], cellSize: ['auto', 18], yearLabel: { show: false }, dayLabel: { firstDay: 1, nameMap: ['D', 'L', 'M', 'X', 'J', 'V', 'S'] }, monthLabel: { nameMap: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'] } }, visualMap: { show: false, min: 0, max: 10, inRange: { color: ['#eeeafa', '#7462e8'] } }, series: [{ type: 'heatmap', coordinateSystem: 'calendar', data: Array.from({length: 90}, (_, i) => [new Date(Date.UTC(2026, 0, i + 1)).toISOString().slice(0,10), (i * 7 + 3) % 11]) }] } } }
];

// Give the simplified examples meaningful data for their particular semantics.
for (const sample of SAMPLES) {
  if (sample.type === 'waterfall') sample.config.data = { labels: ['Inicio', 'Ventas', 'Costes', 'Servicios', 'Devolución', 'Otros'], series: [{ name: 'Cambio', data: [45, 32, -22, 18, -10, 12] }] };
  if (sample.type === 'bubble') sample.config = { type: 'bubble', points: [{ name: 'Proyectos', data: [{x:12,y:25,size:18,name:'A'}, {x:25,y:40,size:32,name:'B'}, {x:40,y:32,size:24,name:'C'}, {x:55,y:68,size:46,name:'D'}, {x:75,y:52,size:28,name:'E'}] }] };
  if (sample.type === 'combo') sample.config.data = { labels: data.labels, series: [{ name: 'Ventas', data: [32,48,39,67,52,84], type: 'bar' }, { name: 'Conversión %', data: [2.4,3.1,2.8,4.2,3.8,5.4], type: 'line', yAxisIndex: 1 }] };
}
