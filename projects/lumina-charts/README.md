# Lúmina Charts 0.2

Gráficas Angular 21 standalone, gratuitas, con motor Apache ECharts 6.

```ts
import { LuminaChartComponent, ChartConfig } from 'lumina-charts';

const config: ChartConfig = {
  type: 'area',
  data: {
    labels: ['Ene', 'Feb', 'Mar'],
    series: [{name: 'Ventas', data: [12, 24, 35]}]
  }
};
```

Importa `LuminaChartComponent` en `imports` de tu componente Angular:

```html
<lumina-chart [config]="config" label="Ventas mensuales" height="320px" />
```

Tipos con API sencilla: line, area, stepLine, stackedArea, bar, horizontalBar,
stackedBar, normalizedBar, waterfall, pie, donut, rose, radialBar, scatter,
bubble, radar, gauge, funnel, histogram, combo y pictorialBar. Para mapas, heatmap, candlestick, boxplot,
treemap, sunburst, sankey, graph, parallel, themeRiver, tree, calendar y custom, usa `option` con
la configuración nativa de ECharts. Registra tu GeoJSON con `registerMap` para mapas.

`theme: 'dark'`, `colors`, `legend`, `animation` y `smooth` personalizan la presentación.
`option` reemplaza opciones al mismo nivel, sin combinación profunda.
Los gráficos de composición usan la primera serie; gauge usa el primer valor.
Scatter y bubble usan categorías en `data` o XY/tamaños variables en `points`.
Histograma usa `values` y `bins`. Gantt y rango tienen factories `ganttChart`
y `rangeAreaChart` que crean series custom y tablas. Actualiza `config` con una nueva referencia.

Activa `zoom`, `crosshair`, `brush`, `annotations`, `bands`, `performance`,
`drilldown`, `locale` y `decimals` según tu caso.

Inputs: config, label, height, loading, tools, renderer, pointer, active, group,
exportMode. Outputs: chartClick, chartReady, chartError, interaction, chartExport, drillChange.
Métodos: exportImage (data URL SVG), exportPng, exportData (CSV/JSON), resize,
setOption, pause, resume, getState, restoreState, zoomBy, resetZoom, drillDown y drillUp.
`[tools]="true"` muestra controles y tabla. Las series avanzadas requieren `table`
para exportar datos. SVG solo funciona con renderer SVG; PNG con ambos motores.

Ionic: importa también `LuminaIonicDirective` y agrega `luminaIonic` al componente.
Usa `exportMode="emit"` para entregar los archivos a plugins del host sin descargas
automáticas. No requiere Ionic como dependencia de la biblioteca.

Guías incluidas: [móvil](docs/MOBILE.md) y [funciones y límites](docs/FEATURES.md).
Inicialización en navegador, compatible con SSR sin render de gráfica en servidor.

Código MIT; ECharts conserva su licencia Apache-2.0.
