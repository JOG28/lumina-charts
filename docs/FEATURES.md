# Funciones avanzadas gratuitas

La selección se inspira en necesidades que cubren herramientas como [AG Charts Enterprise](https://github.com/ag-grid/ag-charts) y [Highcharts](https://www.highcharts.com/docs/export-module/export-module-overview). Lúmina utiliza código propio y funciones de Apache ECharts; no incorpora SDK comerciales ni afirma paridad completa.

| Función | API de Lúmina 0.2 | Alcance |
| --- | --- | --- |
| Zoom y navegador | `zoom: true` o `{start,end,slider}` | Gráficas cartesianas, rueda, pellizco, botones y teclado |
| Crosshair | `crosshair: true` | Tooltip cruzado sobre ejes cartesianos |
| Selección de región | `brush: true`, evento `interaction` | Selección rectangular/poligonal de ECharts en series compatibles; no edita datos |
| Anotaciones | `annotations` | Líneas de referencia por X/Y; configuradas por código |
| Bandas | `bands` | Rangos sombreados por X/Y |
| Sincronización | Input `group` | Zoom, tooltip y acciones ECharts compatibles; usa ejes/datos equivalentes entre gráficas |
| Drilldown | `drilldown: Record<string,ChartConfig>` | Toca una categoría con un nivel asociado; botón para volver |
| Guardar/restaurar vista | `getState()` / `restoreState()` | Zoom y selección de la primera leyenda, no serializa toda la instancia |
| Datos en vivo | `appendChartData(config,chunk,maxPoints)` | Ventana acotada e inmutable; la aplicación controla el stream |
| Rendimiento | `performance: true` | LTTB para líneas, modo grande/progresivo para series compatibles |
| Exportación | `exportImage()`, `exportPng()`, `exportData()` | SVG/PNG/CSV/JSON en cliente, sin servicio externo |
| Integración nativa | `exportMode="emit"` / `chartExport` | Contenido para Capacitor Filesystem/Share u otros plugins del host |
| Tabla de datos | `[tools]="true"` → Ver datos | Tabla HTML con encabezados/caption; muestra hasta 200 filas y exporta todas |
| Localización | `locale`, `decimals` | Formato numérico con Intl; textos de controles en español |
| Adaptación móvil | Inputs `pointer`, `active`, `renderer`; `luminaIonic` | Web móvil y WebView, no renderizador nativo sin DOM |

No se incluyen PDF/XLSX, anotaciones de dibujo libre o editables, editor de dependencias Gantt, indicadores financieros automáticos, 3D, sonificación ni garantía de cumplimiento integral WCAG. No se promete rendimiento de un millón de puntos: mide tu caso y selecciona Canvas/muestreo cuando proceda.

## Ejemplo

```ts
const config: ChartConfig = {
  type: 'line', data,
  zoom: {start: 20, end: 80, slider: true},
  crosshair: true,
  annotations: [{name: 'Meta', value: 70, color: '#f0b45b'}],
  bands: [{name: 'Rango objetivo', start: 50, end: 85}],
  locale: 'es-MX', decimals: 1
};
```

```html
<lumina-chart [config]="config" [tools]="true"
  (interaction)="onInteraction($event)" />
```

La propiedad `option` tiene prioridad a nivel superior. Por ejemplo, `option.dataZoom` reemplaza el zoom generado y `option.series` reemplaza las series. Las anotaciones y bandas se aplican a una copia de la primera serie cartesiana visible.

Los métodos `setOption()` y el acceso a la instancia de `chartReady` son una salida avanzada: los cambios directos al motor no modifican automáticamente `config`, las tablas de exportación ni el árbol de drilldown. Para mantenerlos coherentes, actualiza la configuración y los datos de origen.

## Datos y exportación

CSV/JSON exportan `config.data`, `points` o el histograma; para otras series define `table: {headers,rows}` explícitamente. En barras al 100%, se exportan las observaciones originales; el porcentaje es una transformación visual. Los strings de CSV se escapan y neutralizan si pueden interpretarse como fórmulas de una hoja de cálculo.

```ts
const config: ChartConfig = {
  type: 'bubble',
  points: [{name:'Proyectos', data:[{name:'A', x:12, y:25, size:18}]}]
};
```

`size` es diámetro en píxeles limitado al rango 4–80. `scatter`/`bubble` conservan también el formato sencillo categórico de `data`.

## Gantt y áreas de rango

```ts
const schedule = ganttChart([
  {name:'Diseño', start:1, end:5, progress:1},
  {name:'Código', start:3, end:12, progress:0.65}
]);
const forecast = rangeAreaChart([
  {label:'Ene', low:-5, high:20}, {label:'Feb', low:8, high:35}
]);
```

Son factories tipadas que crean las series `custom` y una tabla de datos. Sus funciones de renderizado deben conservarse como TypeScript: no se pueden serializar íntegramente a JSON.
