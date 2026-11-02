import { Component, Input, OnDestroy, ViewChild, computed, signal } from '@angular/core';
import { LuminaChartComponent, ChartConfig, ChartInteraction, appendChartData } from 'lumina-charts';

@Component({
  selector: 'app-capabilities', standalone: true, imports: [LuminaChartComponent],
  template: `
    <section class="cap-hero"><div class="eyebrow">POTENCIA INCLUIDA. LICENCIA MIT.</div><h1>Pequeña API.<br><em>Grandes posibilidades.</em></h1><p>Explora herramientas de análisis, interacción y exportación sin módulos de pago.</p></section>
    <div class="cap-badges"><span>Zoom táctil y teclado</span><span>CSV · JSON · SVG · PNG</span><span>Sincronización</span><span>Ionic & Capacitor</span></div>
    <section class="cap-card" [class.device-frame]="mobile()"><div class="cap-title"><div><h2>Un panel que crece contigo</h2><p>Acerca con +/−, usa el navegador inferior o muestra los datos en una tabla.</p></div><div class="cap-controls"><button (click)="mobile.set(!mobile())">{{mobile() ? 'Vista amplia' : 'Vista móvil'}}</button><button (click)="renderer.set(renderer() === 'svg' ? 'canvas' : 'svg')">Motor: {{renderer().toUpperCase()}}</button></div></div>
      <div class="live-status"><span [class.on]="live()"></span>{{live() ? 'Actualizando cada 1.5 s' : 'Datos de demostración'}}<button (click)="toggleLive()">{{live() ? 'Pausar datos' : 'Iniciar datos en vivo'}}</button><button (click)="addPoint()">Agregar punto</button></div>
      <lumina-chart #liveChart [config]="featured()" [renderer]="renderer()" [tools]="true" label="Ingresos por periodo; línea de meta en 70 y zona objetivo de 55 a 85" height="340px" (interaction)="onInteraction($event)"/>
      <p class="cap-note" role="status">{{event()}}</p>
    </section>
    <div class="cap-pair"><section class="cap-card"><div class="cap-title"><div><h2>Explora del total al detalle</h2><p>Toca «Web» o «App» y vuelve con el botón de navegación.</p></div></div><lumina-chart [config]="drill()" [tools]="true" label="Ventas por canal, selecciona un canal para ver su detalle" height="280px"/></section>
    <section class="cap-card"><div class="cap-title"><div><h2>Tu vista, a tu manera</h2><p>Guarda y restaura el zoom y la selección de leyenda del panel superior.</p></div></div><div class="state-actions"><button (click)="saveState()">Guardar vista</button><button [disabled]="!savedState" (click)="restoreState()">Restaurar vista</button></div><pre>{{stateText()}}</pre><p class="cap-note">El estado es un objeto serializable. Puedes guardarlo en el almacenamiento de tu aplicación.</p></section></div>
    <section class="cap-card"><div class="cap-title"><div><h2>Dos gráficas, una conversación</h2><p>Haz zoom o recorre los datos. El grupo comparte zoom, tooltip y selección de leyenda.</p></div></div><div class="cap-pair sync-pair"><lumina-chart [config]="syncA()" group="gallery-revenue" [tools]="true" label="Ingresos sincronizados" height="280px"/><lumina-chart [config]="syncB()" group="gallery-revenue" [tools]="true" label="Pedidos sincronizados" height="280px"/></div></section>
    <section class="cap-card"><h2>Configuración de este panel</h2><pre>{{example}}</pre><p class="cap-note">Las anotaciones disponibles son líneas y bandas configuradas por código. Gantt visualiza tareas; no incluye edición de dependencias ni un planificador.</p></section>
  `
})
export class CapabilitiesComponent implements OnDestroy {
  @Input() dark = false;
  @ViewChild('liveChart') liveChart?: LuminaChartComponent;
  private revision = signal(0);
  private data = signal({ labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], series: [{ name: 'Ingresos', data: [32,48,39,67,52,84,62,72,55,82,65,92] }] });
  mobile = signal(false); renderer = signal<'svg' | 'canvas'>('svg'); live = signal(false); event = signal('Selecciona un rango para explorar tus datos.'); stateText = signal('Todavía no hay una vista guardada.');
  private timer?: ReturnType<typeof setInterval>;
  savedState?: ReturnType<LuminaChartComponent['getState']>;
  // These computed values are invalidated explicitly on theme changes below.
  private theme = signal<'light' | 'dark'>('light');
  ngOnChanges(): void { this.theme.set(this.dark ? 'dark' : 'light'); }
  featured = computed<ChartConfig>(() => ({ type: 'area', data: this.data(), theme: this.theme(), zoom: { start: 0, end: 100 }, crosshair: true, annotations: [{name: 'Meta 70', value: 70}], bands: [{name: 'Objetivo', start:55,end:85}], locale:'es-MX' }));
  drill = computed<ChartConfig>(() => ({ type:'bar',theme:this.theme(),data:{labels:['Web','App'],series:[{name:'Ventas',data:[120,90]}]},drilldown:{Web:{type:'donut',theme:this.theme(),data:{labels:['Orgánico','Directo','Social'],series:[{name:'Web',data:[60,40,20]}]}},App:{type:'bar',theme:this.theme(),data:{labels:['Android','iOS'],series:[{name:'App',data:[50,40]}]}}} }));
  syncA = computed<ChartConfig>(() => ({type:'line',theme:this.theme(),data:{labels:this.data().labels,series:[{name:'Ingresos',data:this.data().series[0].data}]},zoom:true,crosshair:true}));
  syncB = computed<ChartConfig>(() => ({type:'bar',theme:this.theme(),data:{labels:this.data().labels,series:[{name:'Pedidos',data:this.data().series[0].data.map(v => Math.round(v / 3))}]},zoom:true,crosshair:true}));
  addPoint(): void {
    const index = this.revision() + 13; this.revision.set(index - 12);
    const next = appendChartData(this.featured(), {labels:[String(index).padStart(2,'0')],series:[{name:'Ingresos',data:[Math.round(55 + Math.sin(index * 1.8) * 28)]}]}, 60);
    this.data.set(next.data!);
  }
  toggleLive(): void {
    if (this.timer) { clearInterval(this.timer); this.timer=undefined; this.live.set(false); }
    else { this.live.set(true); this.timer=setInterval(() => { if (!document.hidden) this.addPoint(); },1500); }
  }
  onInteraction(event: ChartInteraction): void { this.event.set(event.type === 'datazoom' ? 'Rango actualizado. La vista se conserva al llegar nuevos datos.' : 'Selección actualizada.'); }
  saveState(): void { this.savedState = this.liveChart?.getState(); this.stateText.set(JSON.stringify(this.savedState, null, 2)); }
  restoreState(): void { if (this.savedState) this.liveChart?.restoreState(this.savedState); }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }
  example = `const config: ChartConfig = {\n  type: 'area', data, zoom: true, crosshair: true,\n  annotations: [{ name: 'Meta', value: 70 }],\n  bands: [{ name: 'Objetivo', start: 55, end: 85 }],\n  performance: true, locale: 'es-MX'\n};\n\n// En tu template:\n<lumina-chart [config]="config" [tools]="true"\n  luminaIonic exportMode="emit"\n  (chartExport)="saveOrShare($event)" />`;
}
