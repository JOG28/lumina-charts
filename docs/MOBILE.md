# Ionic, Capacitor y Angular móvil

Lúmina 0.2.0 incluye una biblioteca Angular 21, un adaptador Ionic opcional sin dependencia de Ionic y una aplicación de ejemplo con Ionic 9 + Capacitor 8.

## Alcance

| Entorno | Integración |
| --- | --- |
| Angular 21 en navegador móvil | Componente standalone, SVG o Canvas |
| Ionic Angular + Capacitor | Adaptador de ciclo de vida y exportaciones para Filesystem/Share |
| Ionic Angular + Cordova | Mismo componente WebView; la aplicación aporta sus plugins para archivos/compartir |
| Angular PWA | Mismo componente; el service worker de la aplicación debe cachear los bundles para arranque sin conexión |
| Otros shells con Angular en WebView | Componente estándar; `active`, `pause`, `resume`, `resize` para el ciclo de vida del shell |
| NativeScript y renderizadores sin DOM | No se puede montar directamente. Alojar la aplicación Angular compilada en un WebView y crear el puente de datos específico del host |

La versión del paquete declara Angular 21 como peer dependency. No se afirma compatibilidad con todas las versiones de Angular ni con componentes nativos que no tengan DOM.

## Iniciar el ejemplo

```sh
npm install
npm run build:lib
npm run start:mobile
```

Abre http://localhost:4201. El ejemplo consume **la biblioteca compilada de `dist/lumina-charts`**, no sus fuentes. Si cambias el código de la biblioteca, vuelve a compilarla antes de revisar el ejemplo.

En la página principal puedes hacer zoom, cambiar el ancho, agregar datos, exportar y navegar al detalle. Al volver, el contador de entradas aumenta y la página original mantiene su instancia, tamaño e interacciones.

## Ionic 9

```ts
import {Component} from '@angular/core';
import {IonContent} from '@ionic/angular';
import {ChartConfig, LuminaChartComponent, LuminaIonicDirective} from 'lumina-charts';

@Component({
  selector: 'app-metrics',
  imports: [IonContent, LuminaChartComponent, LuminaIonicDirective],
  template: `<ion-content>
    <lumina-chart luminaIonic [config]="config" [tools]="true"
      height="340px" pointer="coarse" label="Ventas semanales"
      exportMode="emit" (chartExport)="saveOrShare($event)" />
  </ion-content>`
})
export class MetricsPage {
  config: ChartConfig = {
    type: 'area', zoom: true, crosshair: true,
    data: {labels: ['Lun', 'Mar', 'Mié'], series: [{name:'Ventas', data:[24,42,35]}]}
  };
  saveOrShare(event: unknown) { /* código de tu aplicación */ }
}
```

En Ionic 8, importa sus componentes desde `@ionic/angular/standalone`; en Ionic 9 se importan desde `@ionic/angular`. El adaptador de Lúmina conserva su importación. La prueba incluida usa Ionic 9.

## Páginas conservadas y visibilidad

El adaptador escucha `ionViewDidEnter` y `ionViewWillLeave` en el ancestro `.ion-page` más cercano. Se conecta después de la creación de la vista y se desconecta al destruirse. No requiere que un hijo reciba métodos de ciclo de vida de Ionic.

Si el host no es una página Ionic, controla la actividad explícitamente:

```html
<lumina-chart [config]="config" [active]="isCurrentPage" />
```

O llama `pause()` al salir y `resume()` al volver. `resize()` programa un reajuste. El componente evita iniciar ECharts con ancho/alto cero, responde a ResizeObserver y al cambio de tamaño, y pausa la animación al ocultarse el documento. Las actualizaciones de `config` pendientes se aplican al reanudar. **La aplicación debe detener sus suscripciones, peticiones o timers propios**; pausar la gráfica no detiene la fuente de datos.

`active=false` y `pause()` impiden las actualizaciones del wrapper; no son un mecanismo para cancelar código externo que manipula la instancia ECharts directamente.

## Táctil y rendimiento

- `pointer="auto"` deja al motor detectar el tipo de dispositivo; `coarse` fuerza la proximidad táctil de 44 px; `fine` la desactiva.
- El zoom interno permite el desplazamiento vertical de la página con un dedo. Usa el navegador inferior o el gesto de pellizco para explorar. Hay botones de 44 px y atajos +, −, 0 con foco en la gráfica.
- `renderer="svg"` es el predeterminado; `canvas` está disponible para muchos puntos. El ratio de píxeles inicial de Canvas se limita a 2 para reducir memoria.
- `performance: true` activa LTTB para líneas y renderizado grande/progresivo para barras o dispersión. El modo `large` del motor limita selección individual y pointer snapping; úsalo según tu caso.
- Las animaciones se desactivan si el sistema indica `prefers-reduced-motion` durante un render.
- El tamaño responde al contenedor, no a un ancho fijo. Usa CSS y `height` apropiados para tu pantalla.

## Guardar y compartir

Con `exportMode="emit"`, los botones entregan `ChartExport` sin forzar una descarga del navegador:

```ts
interface ChartExport {
  format: 'svg' | 'png' | 'csv' | 'json';
  content: string; // SVG/PNG: data URL; CSV/JSON: texto
  filename: string;
}
```

El ejemplo usa plugins oficiales de Capacitor: escribe un archivo temporal en Cache y abre la hoja de compartir. En web intenta Web Share con archivos o descarga local. El usuario decide cuándo compartir. La integración no transmite datos a servidores de exportación.

Consulta `projects/mobile-demo/src/main.ts` para el flujo completo. El acceso a plugins, permisos del sistema y el destino del archivo son responsabilidad de la app anfitriona. SVG solo se exporta con el motor SVG; PNG funciona con ambos motores.

## Preparar Android/iOS

`capacitor.config.ts` apunta a `dist/mobile-demo/browser` con un identificador de ejemplo. Cambia `appId` antes de distribuir tu aplicación.

```sh
npm run build
# Instala en el entorno que tenga el SDK correspondiente:
npm install --save-dev @capacitor/android@^8 @capacitor/ios@^8
npx cap add android
npx cap add ios
npx cap sync
npx cap open android
# cap open ios requiere macOS y Xcode
```

Los proyectos nativos, el firmado y las tiendas no se han generado ni ejecutado en esta entrega. La compilación y la navegación se verifican en navegador; los gestos físicos, permisos y compartir nativo deben probarse en Android/iOS antes de publicar.

Referencias oficiales: [ciclo de vida Ionic](https://ionicframework.com/docs/angular/lifecycle), [Ionic 9](https://ionic.io/blog/announcing-ionic-framework-9), [táctil de ECharts](https://echarts.apache.org/handbook/en/how-to/interaction/coarse-pointer/), [WebView de NativeScript](https://docs.nativescript.org/ui/web-view).
