import { AfterViewInit, Directive, ElementRef, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LuminaChartComponent } from './chart.component';

/** Optional adapter; works with Ionic page DOM events without an Ionic peer dependency. */
@Directive({ selector: 'lumina-chart[luminaIonic]', standalone: true })
export class LuminaIonicDirective implements AfterViewInit, OnDestroy {
  private chart = inject(LuminaChartComponent, { self: true });
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private platform = inject(PLATFORM_ID);
  private page?: HTMLElement;
  private enter = () => this.chart.resume();
  private leave = () => this.chart.pause();
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platform)) return;
    this.page = this.host.nativeElement.closest<HTMLElement>('.ion-page') ?? undefined;
    this.page?.addEventListener('ionViewDidEnter', this.enter);
    this.page?.addEventListener('ionViewWillLeave', this.leave);
    if (this.page?.classList.contains('ion-page-hidden') || this.page?.getAttribute('aria-hidden') === 'true') this.chart.pause();
    else this.chart.resume();
  }
  ngOnDestroy(): void {
    this.page?.removeEventListener('ionViewDidEnter', this.enter);
    this.page?.removeEventListener('ionViewWillLeave', this.leave);
  }
}
