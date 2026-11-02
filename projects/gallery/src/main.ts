import { Component, computed, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ChartConfig, LuminaChartComponent } from 'lumina-charts';
import { SAMPLES, Sample } from './samples';
import { CapabilitiesComponent } from './capabilities';

@Component({
  selector: 'app-root', standalone: true, imports: [LuminaChartComponent, CapabilitiesComponent],
  template: `
  <aside [attr.inert]="selected() ? '' : null"><a class="brand" href="#" (click)="page.set('gallery')"><span class="logo">l<span>ı</span></span> lúmina<span class="brand-dot">.</span></a>
    <div class="workspace">◈ <span>Angular Charts</span><span class="version">v0.2</span></div>
    <div class="nav-label">TU BIBLIOTECA</div>
    <button class="nav" [class.active]="page() === 'gallery'" (click)="category.set('Todas'); page.set('gallery')"><span>▦</span> Galería de gráficas <small>{{samples.length}}</small></button>
    <button class="nav" [class.active]="page() === 'docs'" (click)="page.set('docs')"><span>⌘</span> Primeros pasos <span class="arrow">↗</span></button>
    <button class="nav" [class.active]="page() === 'features'" (click)="page.set('features')"><span>✧</span> Funciones avanzadas</button>
    <button class="nav" [class.active]="page() === 'mobile'" (click)="page.set('mobile')"><span>▯</span> Ionic y móvil</button>
    <div class="nav-label spaced">EXPLORAR POR TIPO</div>
    @for (item of categories; track item.name) { <button class="nav category" [class.selected]="category() === item.name && page() === 'gallery'" (click)="category.set(item.name); page.set('gallery')"><span>{{item.icon}}</span>{{item.name}}<small>{{count(item.name)}}</small></button> }
    <div class="aside-bottom"><div class="free-icon">✳</div><strong>Los buenos datos son para todos.</strong><p>Código abierto. Sin suscripciones.<br>Sin límites para crear.</p><a href="https://echarts.apache.org/en/index.html" target="_blank" rel="noopener">Conoce el motor ECharts ↗</a></div>
    <div class="aside-footer"><span class="green-dot"></span> Hecho para la comunidad <span>♡</span></div>
  </aside>
  <main [class.dark]="dark()" [attr.inert]="selected() ? '' : null">
    <header><div class="breadcrumb">Biblioteca <span>/</span> <b>{{pageNames[page()]}}</b></div><div class="header-right"><span class="angular-badge">▲ Angular 21</span><button class="icon-button" (click)="dark.set(!dark())" [attr.aria-label]="dark() ? 'Activar tema claro' : 'Activar tema oscuro'">{{dark() ? '☀' : '☾'}}</button><a class="header-link" href="https://echarts.apache.org/en/option.html" target="_blank" rel="noopener">API ECharts ↗</a></div></header>
    <div class="content">
    <nav class="page-tabs" aria-label="Secciones de la biblioteca"><button [class.current]="page() === 'gallery'" (click)="page.set('gallery')">Galería</button><button [class.current]="page() === 'features'" (click)="page.set('features')">Funciones avanzadas</button><button [class.current]="page() === 'mobile'" (click)="page.set('mobile')">Ionic y móvil</button><button [class.current]="page() === 'docs'" (click)="page.set('docs')">Documentación</button></nav>
    @if (page() === 'gallery') {
      <div class="eyebrow"><span></span> MENOS CÓDIGO. MÁS HISTORIAS.</div>
      <section class="intro"><div><h1>Tus datos merecen<br>verse <em>increíbles.</em></h1><p>Gráficas bonitas, interactivas y fáciles de integrar en Angular.<br>Elige una, conecta tus datos y deja que hablen.</p></div><button class="primary" (click)="page.set('docs')">Comenzar a crear <span>↗</span></button></section>
      <div class="feature-row"><span><i>✓</i> 100% gratuito y abierto</span><span><i>◇</i> Componentes standalone</span><span><i>↔</i> Diseño adaptable</span><span><i>◐</i> Temas claro y oscuro</span></div>
      <section class="install"><div><span class="terminal">❯_</span><code>npm install ./dist/lumina-charts echarts</code><span class="install-note">Instalación local · después de compilar</span></div><button (click)="copy('npm install ./dist/lumina-charts echarts')">{{copied() ? '✓ Copiado' : '▢ Copiar'}}</button></section>
      <div class="gallery-title"><div><h2>Una gráfica para cada historia <span>{{samples.length}}</span></h2><p>De lo esencial a lo extraordinario. Encuentra tu punto de partida.</p></div><label class="search"><span>⌕</span><input placeholder="Buscar una gráfica…" aria-label="Buscar gráfica" [value]="search()" (input)="search.set($any($event.target).value)"><kbd>/</kbd></label></div>
      <div class="filters"><button [class.chosen]="category() === 'Todas'" (click)="category.set('Todas')">Todas las gráficas</button>@for (item of categories; track item.name) { <button [class.chosen]="category() === item.name" (click)="category.set(item.name)">{{item.name}}</button> }<span class="result-count">{{filtered().length}} gráficas</span></div>
      <div class="chart-grid">@for (sample of filtered(); track sample.type) { <article class="chart-card"><div class="card-heading"><div><h3>{{sample.name}}</h3><p>{{sample.description}}</p></div><button class="card-menu" aria-label="Ver ejemplo y código" (click)="openSample(sample, $event)">↗</button></div><lumina-chart [config]="themed(sample.config)" [label]="sample.name" height="235px"/><div class="card-footer"><span><i></i> {{sample.category}}</span><button (click)="openSample(sample, $event)">Ver código <b>↗</b></button></div></article> }</div>
      @if (!filtered().length) { <div class="no-results">No encontramos gráficas con ese nombre.<button (click)="search.set(''); category.set('Todas')">Mostrar todas</button></div> }
      <div class="custom-banner"><span>✧</span><div><h3>Tu imaginación no tiene un tipo de gráfica.</h3><p>Usa la opción avanzada para mapas GeoJSON y configuraciones personalizadas de ECharts.</p></div><button (click)="page.set('docs')">Explorar la API ↗</button></div>
    } @else if (page() === 'features') {
      <app-capabilities [dark]="dark()"/>
    } @else if (page() === 'mobile') {
      <div class="eyebrow">DE LA WEB AL BOLSILLO</div><h1>Tu próxima gráfica.<br><em>También móvil.</em></h1>
      <div class="docs"><p>El mismo componente para Angular web, PWA y aplicaciones Ionic con Capacitor o Cordova. Sin una dependencia obligatoria de Ionic en tu biblioteca.</p><div class="mobile-features"><span>44 px para pulsar</span><span>SVG o Canvas</span><span>Reentrada de páginas</span><span>Exportación para compartir</span></div><h2>Prueba la aplicación Ionic incluida</h2><pre>npm run start:mobile\n# Abre http://localhost:4201</pre><p>Incluye rutas Ionic reales, gráficas con zoom y una página de detalle para comprobar que al volver la gráfica mantiene su tamaño.</p><h2>Importa el adaptador opcional</h2><pre>{{ionicExample}}</pre><h2>Ciclo de vida</h2><p><code>luminaIonic</code> escucha la entrada y salida de la página Ionic más cercana. Para otros contenedores, usa <code>[active]</code>, <code>pause()</code>, <code>resume()</code> y <code>resize()</code>. El componente espera un tamaño visible antes de inicializar y responde al giro o cambio de tamaño.</p><h2>Compartir desde una aplicación nativa</h2><p>Configura <code>exportMode="emit"</code> y recibe el contenido en <code>(chartExport)</code>. Así puedes guardarlo con Capacitor Filesystem y compartirlo con Share usando los permisos de tu aplicación.</p><h2>Compatibilidad realista</h2><p>Verificado con Angular 21 y el ejemplo Ionic 9 en navegador. Android e iOS requieren probar la compilación en sus SDK y dispositivos. NativeScript y otros renderizadores sin DOM pueden usar la galería compilada dentro de un WebView, pero el componente no se monta directamente en vistas nativas.</p></div>
    } @else {
      <div class="eyebrow">DE CERO A TU PRIMERA GRÁFICA</div><h1>Simple desde<br>el primer <em>import.</em></h1>
      <div class="docs"><h2>1. Compila e instala el paquete local</h2><pre>npm install\nnpm run build:lib\n# En el proyecto donde lo usarás:\nnpm install /ruta/a/libreria/dist/lumina-charts echarts</pre><p>El paquete todavía no está publicado en npm. El comando de instalación pública estará disponible al publicarlo.</p>
      <h2>2. Importa el componente standalone</h2><pre>{{starter}}</pre>
      <h2>Herramientas avanzadas incluidas</h2><p>Activa <code>zoom</code>, <code>crosshair</code>, <code>brush</code>, <code>annotations</code> y <code>bands</code>. Añade <code>[tools]="true"</code> para exportar SVG, PNG, CSV o JSON y mostrar una tabla accesible. Las series avanzadas requieren una <code>table</code> explícita para exportar sus datos.</p><p>Usa <code>group</code> para sincronizar gráficas, <code>drilldown</code> para niveles de detalle, <code>getState()/restoreState()</code> para guardar vistas y <code>appendChartData()</code> para ventanas de datos en vivo. Las preferencias de movimiento reducido se respetan automáticamente.</p>
      <h2>3. Hazlo tuyo</h2><p>Usa <code>theme</code>, <code>colors</code>, <code>legend</code>, <code>smooth</code> y <code>animation</code> para personalizarlo. Configura <code>height</code>, <code>label</code> y <code>loading</code> en el componente.</p><h2>Más allá de lo básico</h2><p>El campo <code>option</code> recibe una configuración nativa de ECharts. Sus propiedades reemplazan las opciones predeterminadas del mismo nivel. Los mapas requieren registrar un GeoJSON propio mediante <code>registerMap</code> de ECharts antes de mostrar el componente.</p><h2>Interacción y exportación</h2><p>Escucha <code>(chartClick)</code>, <code>(chartReady)</code> y <code>(chartError)</code>. Con una referencia al componente, llama <code>exportImage()</code> para obtener una imagen SVG, o <code>setOption()</code> para actualizaciones avanzadas.</p></div>
    }
    <footer><span class="footer-brand">lúmina.</span><span>Creada para que tus datos lleguen más lejos.</span><span>MIT · Gratis, también para uso comercial ↗</span></footer>
    </div>
  </main>
  @if (selected(); as sample) { <div class="modal-backdrop" (click)="closeSample()"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" (click)="$event.stopPropagation()" (keydown)="modalKeys($event)" tabindex="0"><button class="close" aria-label="Cerrar" (click)="closeSample()">×</button><div class="eyebrow">TU SIGUIENTE GRÁFICA</div><h2 id="modal-title">{{sample.name}}</h2><lumina-chart [config]="sample.config" [label]="sample.name" [tools]="true"/><p>Importa LuminaChartComponent y utiliza esta configuración:</p><pre>{{code(sample)}}</pre><button class="primary" (click)="copy(code(sample))">{{copied() ? 'Copiado ✓' : 'Copiar configuración'}}</button>@if (hasFunction(sample)) { <p>Este ejemplo contiene funciones. Copia el ejemplo TypeScript completo de samples.ts o usa los helpers ganttChart()/rangeAreaChart().</p> }</section></div> }
  `
})
export class App {
  pageNames = {gallery:'Galería',docs:'Documentación',features:'Funciones avanzadas',mobile:'Ionic y móvil'};
  samples = SAMPLES;
  categories = [{name: 'Tendencias', icon: '⌁'}, {name: 'Comparación', icon: '▥'}, {name: 'Composición', icon: '◔'}, {name: 'Distribución', icon: '⠿'}, {name: 'Avanzadas', icon: '⬡'}];
  category = signal('Todas'); search = signal(''); dark = signal(false); page = signal<'gallery' | 'docs' | 'features' | 'mobile'>('gallery'); selected = signal<Sample | null>(null); copied = signal(false);
  filtered = computed(() => this.samples.filter(s => (this.category() === 'Todas' || s.category === this.category()) && (s.name + s.type + s.description).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(this.search().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, ''))));
  count(category: string) { return this.samples.filter(s => s.category === category).length; }
  private themeCache = new WeakMap<ChartConfig, {light: ChartConfig; dark: ChartConfig}>();
  private opener?: HTMLElement;
  themed(config: ChartConfig): ChartConfig {
    let cached = this.themeCache.get(config);
    if (!cached) { cached = {light: {...config, theme:'light'},dark:{...config,theme:'dark'}}; this.themeCache.set(config,cached); }
    return this.dark() ? cached.dark : cached.light;
  }
  openSample(sample: Sample, event: Event): void { this.opener = event.currentTarget as HTMLElement; this.selected.set(sample); setTimeout(() => document.querySelector<HTMLButtonElement>('.modal .close')?.focus(),0); }
  closeSample(): void { this.selected.set(null); setTimeout(() => this.opener?.focus(),0); }
  modalKeys(event: KeyboardEvent): void {
    if (event.key === 'Escape') { this.closeSample(); return; }
    if (event.key !== 'Tab') return;
    const elements = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,[tabindex="0"]'));
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  hasFunction(sample: Sample): boolean { let found = false; JSON.stringify(sample.config, (_key,value) => { if (typeof value === 'function') found = true; return value; }); return found; }
  code(sample: Sample) { return JSON.stringify(sample.config, (_key, value) => typeof value === 'function' ? '[Función renderItem: ver samples.ts]' : value, 2); }
  async copy(text: string) { try { await navigator.clipboard.writeText(text); this.copied.set(true); setTimeout(() => this.copied.set(false), 1800); } catch { this.copied.set(false); } }
  ionicExample = `import { LuminaChartComponent, LuminaIonicDirective } from 'lumina-charts';\n\n@Component({\n  imports: [IonContent, LuminaChartComponent, LuminaIonicDirective],\n  template: \`<ion-content>\n    <lumina-chart luminaIonic [config]="config"\n      [tools]="true" exportMode="emit"\n      (chartExport)="saveOrShare($event)" />\n  </ion-content>\`\n})\nexport class MetricsPage { /* config y saveOrShare en tu app */ }`;
  starter = `import { Component } from '@angular/core';\nimport { LuminaChartComponent, ChartConfig } from 'lumina-charts';\n\n@Component({\n  selector: 'app-sales',\n  imports: [LuminaChartComponent],\n  template: \`<lumina-chart [config]="sales" label="Ventas mensuales" />\`\n})\nexport class SalesComponent {\n  sales: ChartConfig = {\n    type: 'area',\n    data: {\n      labels: ['Ene', 'Feb', 'Mar', 'Abr'],\n      series: [{ name: 'Ventas', data: [24, 42, 35, 68] }]\n    }\n  };\n}`;
}
bootstrapApplication(App).catch(console.error);
