# Lúmina Charts 0.2

Biblioteca Angular 21 de gráficas interactivas para web, Ionic y WebView, gratuita para uso personal y comercial, con 35 ejemplos y galería en español. Código propio bajo MIT; motor Apache ECharts bajo Apache-2.0. No necesita API keys, cuentas ni servicios externos. El nombre npm es provisional y este paquete aún no se ha publicado.

Incluye zoom y navegador, crosshair, selección de región, líneas/bandas de referencia, drilldown, sincronización, datos en vivo acotados, exportación SVG/PNG/CSV/JSON, tablas accesibles y estado de zoom/leyenda. [Guía móvil](docs/MOBILE.md) · [Funciones y límites](docs/FEATURES.md).

## Ejecutar

Requiere Node.js 22.12+ o 24 y npm.

```sh
npm install
npm start
```

Abre http://localhost:4200. La galería incluye filtros, buscador, tema oscuro, ejemplos y configuración para copiar.

```sh
npm test
npm run build
```

La biblioteca compilada queda en `dist/lumina-charts`, la galería en `dist/gallery/browser` y el ejemplo Ionic en `dist/mobile-demo/browser`.

```sh
npm run build:lib
npm run start:mobile
```

El ejemplo Ionic 9 abre en http://localhost:4201 y consume el paquete compilado. Incluye navegación, reentrada a páginas, controles táctiles y exportaciones para Capacitor Filesystem/Share. Angular web/PWA y shells WebView pueden usar el mismo componente; NativeScript sin WebView necesita otro renderizador. Android/iOS aún requieren validación en sus SDK/dispositivos.

## Usar en otro proyecto Angular

Compila con `npm run build:lib` y en la aplicación de destino ejecuta:

```sh
npm install /ruta/absoluta/libreria/dist/lumina-charts echarts
```

```ts
import { Component } from '@angular/core';
import { LuminaChartComponent, ChartConfig } from 'lumina-charts';

@Component({
  selector: 'app-sales',
  imports: [LuminaChartComponent],
  template: `<lumina-chart [config]="sales" height="320px"
    label="Ventas mensuales" (chartClick)="onClick($event)" />`
})
export class SalesComponent {
  sales: ChartConfig = {
    type: 'area',
    data: {
      labels: ['Ene', 'Feb', 'Mar'],
      series: [{ name: 'Ventas', data: [24, 42, 35] }]
    }
  };
  onClick(event: unknown) { console.log(event); }
}
```

Reemplaza la referencia de `config` al actualizar datos para activar la detección de cambios de Angular.

## Tipos

| API simplificada (`data`) | Configuración avanzada (`option`) |
| --- | --- |
| line, area, stepLine, stackedArea | heatmap, candlestick, boxplot |
| bar, horizontalBar, stackedBar, normalizedBar, waterfall | treemap, sunburst, sankey, graph |
| pie, donut, rose, radialBar, radar, gauge, funnel | parallel, themeRiver, map, custom |
| scatter, bubble, histogram, combo, pictorialBar | gantt, rangeArea (con helpers), tree, calendar |

35 ejemplos ejecutables. `map` requiere un GeoJSON registrado por el consumidor; no se incluyen mapas ni datos geográficos de terceros. No pretende cubrir todos los tipos de visualización existentes ni incluye 3D. Para casos especializados se pueden usar series `custom` de ECharts.

`pie`, `donut`, `rose`, `radialBar`, `waterfall` y `funnel` usan la primera serie; `gauge` usa su primer valor (porcentaje 0–100). `scatter` y `bubble` aceptan categorías con `data` o coordenadas XY y tamaños variables mediante `points`. Histograma usa observaciones sin agrupar en `values` y un número de `bins` entre 1 y 200. Combo acepta `type: 'line' | 'bar'` y `yAxisIndex: 0 | 1` por serie. Radar usa un máximo compartido calculado; personaliza `option.radar` para escalas propias.

## Personalización

- `theme`: `light` o `dark`.
- `colors`: paleta propia.
- `legend`, `smooth`, `animation`: controles visuales.
- `option`: `EChartsOption` nativo, combinado **a nivel superior**. Por ejemplo, `option.series` reemplaza todas las series generadas.
- Inputs del componente: `config`, `height`, `label`, `loading`, `tools`, `renderer`, `pointer`, `active`, `group`, `exportMode`.
- Outputs: `chartReady`, `chartClick`, `chartError`, `interaction`, `chartExport`, `drillChange`.
- Métodos públicos: `exportImage()` (data URL SVG), `exportPng()`, `exportData()`, `resize()`, `setOption()`, `pause()`, `resume()`, `getState()`, `restoreState()`, `zoomBy()`, `resetZoom()`, `drillDown()`, `drillUp()`.

El componente carga ECharts en el navegador, permite SVG o Canvas, espera un tamaño visible, usa ResizeObserver y libera recursos al destruirse. En SSR no intenta inicializar el motor. Incluye descripción ARIA y estados de carga/vacío/error; proporciona un `label` descriptivo. La barra de herramientas permite mostrar una tabla accesible con hasta 200 filas; CSV/JSON exportan todas. Las series avanzadas necesitan una `table` explícita para esa función. El tema oscuro puede acompañarse con variables CSS `--lumina-surface` y `--lumina-muted`; en Ionic se usan también sus variables de fondo/texto como respaldo.

## Mapas

```ts
import { registerMap } from 'echarts';
// Antes de montar el componente, registra un GeoJSON que tengas derecho a usar:
registerMap('mi-region', geojson);
const config: ChartConfig = {
  type: 'map',
  option: { series: [{ type: 'map', map: 'mi-region', data: [] }] }
};
```

## Distribuir

```sh
npm run build:lib
cd dist/lumina-charts
npm pack --dry-run
```

Antes de publicar, elige un nombre npm disponible y actualiza los metadatos del paquete. La publicación no forma parte de la creación local. La biblioteca distribuye todo el motor ECharts mediante importación dinámica; no es una selección modular mínima de cada tipo de gráfica.

La galería y la biblioteca usan fuentes locales de respaldo; no descargan fuentes externas.

Referencias: [bibliotecas Angular](https://angular.dev/tools/libraries/creating-libraries), [ECharts](https://echarts.apache.org/), [API de opciones](https://echarts.apache.org/en/option.html).
