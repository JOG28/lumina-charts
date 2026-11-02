import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, PLATFORM_ID, SimpleChanges, ViewChild, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import type { ECharts, EChartsOption } from 'echarts';
import { buildChartOption, CARTESIAN_TYPES } from './chart-options';
import { chartToTable, tableToCsv } from './chart-data';
import { joinChartGroup } from './chart-sync';
import type { ChartClick, ChartConfig, ChartExport, ChartInteraction, ChartState, ChartTable } from './chart.types';

@Component({
  selector: 'lumina-chart', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (depth()) { <button class="back" (click)="drillUp()">← Volver al nivel anterior</button> }
    @if (tools) {
      <div class="toolbar" role="group" aria-label="Herramientas de gráfica">
        @if (canZoom) {
          <button aria-label="Acercar gráfica" (click)="zoomBy(.7)">＋</button>
          <button aria-label="Alejar gráfica" (click)="zoomBy(1.4)">−</button>
          <button (click)="resetZoom()">Restablecer zoom</button>
        }
        <button (click)="requestExport('svg')" [disabled]="renderer !== 'svg'">SVG</button>
        <button (click)="requestExport('png')">PNG</button>
        @if (table.rows.length) {
          <button (click)="requestExport('csv')">CSV</button><button (click)="requestExport('json')">JSON</button>
          <button [attr.aria-expanded]="showTable()" (click)="showTable.set(!showTable())">{{showTable() ? 'Ocultar datos' : 'Ver datos'}}</button>
        }
      </div>
    }
    <div class="plot" [style.height]="height" [attr.aria-busy]="loading">
      <div class="chart" #canvas role="img" [attr.aria-label]="label" tabindex="0" (keydown)="onKey($event)"></div>
      @if (loading) { <div class="status" role="status">Cargando datos…</div> }
      @else if (error()) { <div class="status" role="alert">{{error()}}</div> }
      @else if (empty) { <div class="status" role="status">Sin datos para mostrar</div> }
    </div>
    @if (notice()) { <p class="notice" role="status">{{notice()}}</p> }
    @if (showTable() && table.rows.length) {
      <div class="data-table" tabindex="0" role="region" [attr.aria-label]="'Datos: ' + label">
        <table><caption>{{label}}</caption><thead><tr>@for (header of table.headers; track $index) { <th scope="col">{{header}}</th> }</tr></thead>
        <tbody>@for (row of table.rows.slice(0, 200); track $index) { <tr>@for (cell of row; track $index) { <td>{{cell ?? '—'}}</td> }</tr> }</tbody></table>
      </div>
      @if (table.rows.length > 200) { <p class="notice">Mostrando 200 filas. Exporta CSV o JSON para obtener todos los datos.</p> }
    }
  `,
  styles: [`:host{display:block;position:relative;min-width:0;color:var(--lumina-muted,var(--ion-text-color,#73798c));font:12px system-ui}.plot{position:relative;min-height:100px}.chart{width:100%;height:100%;min-height:100px}.chart:focus-visible{outline:2px solid #7462e8;outline-offset:-2px}.status{position:absolute;inset:0;display:grid;place-items:center;padding:16px;text-align:center;background:var(--lumina-surface,var(--ion-background-color,#fff))}.toolbar{display:flex;flex-wrap:wrap;gap:4px;padding:4px 0 8px}.toolbar button,.back{font:inherit;min-height:44px;min-width:44px;padding:7px 10px;border:1px solid #7462e835;border-radius:7px;background:var(--lumina-surface,var(--ion-background-color,#fff));color:inherit;cursor:pointer}.toolbar button:hover,.back:hover{border-color:#7462e8}.toolbar button:disabled{opacity:.4;cursor:default}button:focus-visible{outline:2px solid #7462e8;outline-offset:2px}.back{margin-bottom:6px}.notice{font-size:11px}.data-table{overflow:auto;max-height:330px;margin-top:12px;border:1px solid #7462e830;border-radius:8px}table{border-collapse:collapse;width:100%;font:12px system-ui;text-align:left}caption{padding:12px;text-align:left;font-weight:600}td,th{padding:10px 12px;border-top:1px solid #7462e820;white-space:nowrap}th{position:sticky;top:0;background:var(--lumina-surface,var(--ion-background-color,#fff))}`]
})
export class LuminaChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) config!: ChartConfig;
  @Input() height = '300px';
  @Input() label = 'Gráfica interactiva';
  @Input() loading = false;
  @Input() tools = false;
  @Input() renderer: 'svg' | 'canvas' = 'svg';
  @Input() pointer: 'auto' | 'coarse' | 'fine' = 'auto';
  @Input() active = true;
  @Input() group?: string;
  /** When true, export buttons emit payloads for Capacitor Filesystem/Share, without browser downloads. */
  @Input() exportMode: 'download' | 'emit' = 'download';
  @Output() chartClick = new EventEmitter<ChartClick>();
  @Output() chartReady = new EventEmitter<ECharts>();
  @Output() chartError = new EventEmitter<Error>();
  @Output() interaction = new EventEmitter<ChartInteraction>();
  @Output() chartExport = new EventEmitter<ChartExport>();
  @Output() drillChange = new EventEmitter<{ depth: number; config: ChartConfig }>();
  @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLDivElement>;
  private platform = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private zone = inject(NgZone);
  private engine?: typeof import('echarts');
  private instance?: ECharts;
  private observer?: ResizeObserver;
  private destroyed = false;
  private ready = false;
  private initializing = false;
  private suspended = false;
  private frame = 0;
  private dirty = true;
  private compact = false;
  private previous?: ChartConfig;
  private history: ChartConfig[] = [];
  private child = signal<ChartConfig | null>(null);
  private leaveGroup?: () => void;
  private revokeTimers = new Set<ReturnType<typeof setTimeout>>();
  readonly depth = signal(0);
  readonly error = signal<string | null>(null);
  readonly notice = signal('');
  readonly showTable = signal(false);
  get currentConfig(): ChartConfig { return this.child() ?? this.config; }
  get table(): ChartTable { try { return chartToTable(this.currentConfig); } catch { return { headers: [], rows: [] }; } }
  get canZoom(): boolean { return !!this.currentConfig?.zoom && CARTESIAN_TYPES.has(this.currentConfig.type); }
  get empty(): boolean {
    const config = this.currentConfig;
    return !config?.option && !(config?.type === 'histogram' && config.values?.length) && !config?.points?.some(s => s.data.length) && !config?.data?.series.some(s => s.data.length);
  }
  private get available(): boolean { return this.ready && !this.destroyed && this.active && !this.suspended && !this.document.hidden; }
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platform)) return;
    this.ready = true;
    this.zone.runOutsideAngular(() => {
      if (typeof ResizeObserver !== 'undefined') {
        this.observer = new ResizeObserver(this.queueResize);
        this.observer.observe(this.canvas.nativeElement);
      }
      this.document.defaultView?.addEventListener('resize', this.queueResize);
      this.document.addEventListener('visibilitychange', this.onVisibility);
      void this.initialize();
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.dirty = true;
    if (changes['config']) { this.history = []; this.child.set(null); this.depth.set(0); }
    if (changes['renderer'] || changes['pointer']) { this.disposeInstance(); }
    if (changes['group'] && this.instance) this.connectGroup();
    if (changes['active'] && !this.active) this.instance?.getZr().animation.stop();
    if (this.available) {
      this.instance?.getZr().animation.start();
      if (this.instance) this.render();
      else void this.initialize();
      this.queueResize();
    }
  }
  private async initialize(): Promise<void> {
    if (!this.available || this.instance || this.initializing) return;
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.initializing = true;
    try {
      this.engine ??= await import('echarts');
      if (!this.available) return;
      const size = this.canvas.nativeElement.getBoundingClientRect();
      if (!size.width || !size.height) return;
      this.zone.runOutsideAngular(() => {
        this.instance = this.engine!.init(this.canvas.nativeElement, undefined, { renderer: this.renderer, useCoarsePointer: this.pointer === 'auto' ? undefined : this.pointer === 'coarse', pointerSize: 44, devicePixelRatio: Math.min(this.document.defaultView?.devicePixelRatio ?? 1, 2) });
        this.instance.on('click', (event: unknown) => this.zone.run(() => {
          const click = event as ChartClick;
          this.chartClick.emit(click);
          if (click.name) this.drillDown(click.name);
        }));
        for (const type of ['datazoom', 'legendselectchanged', 'brushselected'] as const) this.instance.on(type, (payload: unknown) => this.zone.run(() => this.interaction.emit({ type, payload })));
        this.connectGroup();
        this.render();
      });
      this.zone.run(() => this.chartReady.emit(this.instance));
    } catch (error) { this.fail(error); }
    finally { this.initializing = false; }
  }
  private render(): void {
    if (!this.instance || !this.available || !this.currentConfig) return;
    try {
      const config = this.currentConfig;
      const preserve = this.previous?.type === config.type && config.preserveState !== false;
      const state = preserve ? this.getState() : undefined;
      const width = this.canvas.nativeElement.getBoundingClientRect().width;
      const option = buildChartOption(config, { width, reducedMotion: this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches });
      option.aria = { enabled: true, ...option.aria, label: { ...option.aria?.label, description: this.label } };
      this.instance.setOption(option, { notMerge: true });
      if (state) {
        if (JSON.stringify(this.previous?.zoom) !== JSON.stringify(config.zoom)) state.zoom = [];
        this.restoreState(state);
      }
      this.previous = config;
      this.compact = width < 480;
      this.dirty = false;
      this.error.set(null);
    } catch (error) { this.dirty = false; this.fail(error); }
  }
  private fail(error: unknown): void {
    const failure = error instanceof Error ? error : new Error(String(error));
    this.zone.run(() => { this.error.set(failure.message); this.chartError.emit(failure); });
  }
  private connectGroup(): void {
    this.leaveGroup?.(); this.leaveGroup = undefined;
    if (this.group && this.instance && this.engine) this.leaveGroup = joinChartGroup(this.engine, this.instance, this.group);
  }
  private queueResize = (): void => {
    if (!this.available || this.frame) return;
    this.zone.runOutsideAngular(() => {
      this.frame = this.document.defaultView!.requestAnimationFrame(() => {
        this.frame = 0;
        if (!this.available) return;
        const { width, height } = this.canvas.nativeElement.getBoundingClientRect();
        if (!width || !height) return;
        if (!this.instance) { void this.initialize(); return; }
        this.instance.resize();
        if (this.dirty || (width < 480) !== this.compact) this.render();
      });
    });
  };
  private onVisibility = (): void => {
    if (this.document.hidden) this.instance?.getZr().animation.stop();
    else if (this.available) { this.instance?.getZr().animation.start(); this.queueResize(); }
  };
  pause(): void { this.suspended = true; this.instance?.getZr().animation.stop(); }
  resume(): void { this.suspended = false; if (this.available) { this.instance?.getZr().animation.start(); this.queueResize(); } }
  resize(): void { this.queueResize(); }
  setOption(option: EChartsOption): void { this.instance?.setOption(option); }
  getState(): ChartState {
    const option = this.instance?.getOption() as { dataZoom?: ChartState['zoom']; legend?: { selected?: Record<string, boolean> }[] } | undefined;
    return { zoom: (option?.dataZoom ?? []).map(z => ({ start: z.start, end: z.end })), legend: { ...option?.legend?.[0]?.selected } };
  }
  restoreState(state: ChartState): void {
    const current = this.instance?.getOption() as { dataZoom?: unknown[] } | undefined;
    for (const [index, range] of state.zoom.entries()) if (current?.dataZoom?.[index]) this.instance?.dispatchAction({ type: 'dataZoom', dataZoomIndex: index, ...range }, { silent: true });
    for (const [name, selected] of Object.entries(state.legend)) this.instance?.dispatchAction({ type: selected ? 'legendSelect' : 'legendUnSelect', name }, { silent: true });
  }
  zoomBy(factor: number): void {
    if (!this.canZoom || !Number.isFinite(factor) || factor <= 0) return;
    const range = this.getState().zoom[0] ?? { start: 0, end: 100 };
    const start = range.start ?? 0, end = range.end ?? 100, center = (start + end) / 2;
    const width = Math.min(100, Math.max(1, (end - start) * factor));
    const next = Math.min(100 - width, Math.max(0, center - width / 2));
    this.instance?.dispatchAction({ type: 'dataZoom', start: next, end: next + width });
  }
  resetZoom(): void { this.instance?.dispatchAction({ type: 'dataZoom', start: 0, end: 100 }); }
  onKey(event: KeyboardEvent): void {
    if (!this.canZoom) return;
    if (['+', '=', '-', '0'].includes(event.key)) {
      event.preventDefault();
      if (event.key === '0') this.resetZoom(); else this.zoomBy(event.key === '-' ? 1.4 : .7);
    }
  }
  drillDown(name: string): boolean {
    const child = this.currentConfig.drilldown?.[name];
    if (!child) return false;
    this.history.push(this.currentConfig); this.child.set(child); this.depth.set(this.history.length); this.previous = undefined;
    this.render(); this.drillChange.emit({ depth: this.depth(), config: child }); return true;
  }
  drillUp(): void {
    const parent = this.history.pop();
    if (!parent) return;
    this.child.set(this.history.length ? parent : null); this.depth.set(this.history.length); this.previous = undefined;
    this.render(); this.drillChange.emit({ depth: this.depth(), config: this.currentConfig });
  }
  /** Original synchronous API. SVG requires the SVG renderer. */
  exportImage(): string | undefined {
    if (this.renderer !== 'svg') return undefined;
    return this.instance?.getDataURL({ type: 'svg', backgroundColor: this.currentConfig.theme === 'dark' ? '#1b2030' : '#ffffff' });
  }
  async exportPng(scale = 2): Promise<string | undefined> {
    if (!this.instance || !isPlatformBrowser(this.platform)) return undefined;
    if (!Number.isFinite(scale) || scale < 1 || scale > 4) throw new Error('La escala debe estar entre 1 y 4.');
    const backgroundColor = this.currentConfig.theme === 'dark' ? '#1b2030' : '#ffffff';
    if (this.renderer === 'canvas') return this.instance.getDataURL({ type: 'png', pixelRatio: scale, backgroundColor });
    const svg = this.exportImage();
    if (!svg) return undefined;
    const width = this.instance.getWidth(), height = this.instance.getHeight();
    const image = this.document.createElement('img');
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('No se pudo convertir el SVG a PNG.')); image.src = svg; });
    if (this.destroyed) return undefined;
    const canvas = this.document.createElement('canvas');
    canvas.width = width * scale; canvas.height = height * scale;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D no está disponible.');
    context.fillStyle = backgroundColor; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  }
  exportData(format: 'csv' | 'json' = 'csv'): string {
    const table = chartToTable(this.currentConfig);
    return format === 'csv' ? tableToCsv(table) : JSON.stringify(table, null, 2);
  }
  async requestExport(format: ChartExport['format']): Promise<void> {
    try {
      const content = format === 'svg' ? this.exportImage() : format === 'png' ? await this.exportPng() : this.exportData(format);
      if (!content) return;
      const payload = { format, content, filename: `lumina-chart.${format}` };
      this.chartExport.emit(payload);
      if (this.exportMode === 'emit') { this.notice.set('Exportación preparada para la aplicación.'); return; }
      const anchor = this.document.createElement('a');
      let url: string | undefined;
      if (format === 'csv' || format === 'json') {
        url = URL.createObjectURL(new Blob([format === 'csv' ? '\uFEFF' + content : content], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' })); anchor.href = url;
      } else anchor.href = content;
      anchor.download = payload.filename; this.document.body.appendChild(anchor); anchor.click(); anchor.remove();
      if (url) { const downloadUrl = url; const timer = setTimeout(() => { URL.revokeObjectURL(downloadUrl); this.revokeTimers.delete(timer); }, 1000); this.revokeTimers.add(timer); }
      this.notice.set(`Exportación ${format.toUpperCase()} preparada.`);
    } catch (error) { this.fail(error); }
  }
  private disposeInstance(): void { this.leaveGroup?.(); this.leaveGroup = undefined; this.instance?.dispose(); this.instance = undefined; this.previous = undefined; }
  ngOnDestroy(): void {
    this.destroyed = true; this.observer?.disconnect();
    if (this.frame) this.document.defaultView?.cancelAnimationFrame(this.frame);
    this.document.defaultView?.removeEventListener('resize', this.queueResize);
    this.document.removeEventListener('visibilitychange', this.onVisibility);
    // Pending short-lived URL revocations complete on their own; they do not retain the chart engine.
    this.disposeInstance();
  }
}
