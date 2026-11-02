import { Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterLink, RouteReuseStrategy } from '@angular/router';
import { IonApp, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonBackButton, IonButtons, provideIonicAngular, IonicRouteStrategy } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { LuminaChartComponent, LuminaIonicDirective, ChartConfig, ChartExport, appendChartData, ganttChart } from 'lumina-charts';

@Component({
  selector:'app-metrics', standalone:true,
  imports:[IonHeader,IonToolbar,IonTitle,IonContent,IonButton,IonCard,IonCardContent,RouterLink,LuminaChartComponent,LuminaIonicDirective],
  template:`<ion-header><ion-toolbar><ion-title>Lúmina · Ionic</ion-title></ion-toolbar></ion-header><ion-content><div class="mobile-container"><span class="mobile-tag">El mismo componente. En tu bolsillo.</span><h1>Datos que se <span>mueven contigo.</span></h1><p class="mobile-lead">Navega al detalle, vuelve y cambia el ancho. La gráfica se adapta a la página Ionic y conserva sus interacciones.</p><div class="mobile-stats"><span>Entradas a esta página: {{visits()}}</span><span>SVG · táctil · sin conexión tras cargar</span></div><ion-card><ion-card-content><div class="mobile-actions"><ion-button size="small" [routerLink]="['/detail']">Abrir detalle →</ion-button><ion-button size="small" fill="outline" (click)="narrow.set(!narrow())">Cambiar ancho</ion-button><ion-button size="small" fill="outline" (click)="add()">Agregar dato</ion-button></div><div [class.narrow-chart]="narrow()"><lumina-chart #chart luminaIonic [config]="config()" [tools]="true" pointer="coarse" height="340px" label="Ingresos diarios de la aplicación móvil" exportMode="emit" (chartExport)="receive($event)"/></div><p class="export-info" role="status">{{status()}}</p>@if (lastExport) { <ion-button expand="block" (click)="share()">Guardar o compartir {{lastExport.format.toUpperCase()}}</ion-button> }</ion-card-content></ion-card><p class="mobile-lead">El adaptador escucha ionViewDidEnter / ionViewWillLeave. La aplicación decide cómo guardar y compartir los archivos; la biblioteca entrega el contenido.</p></div></ion-content>`
})
export class MetricsPage {
  visits=signal(0);narrow=signal(false);status=signal('Prueba el zoom o exporta una imagen o tus datos.');lastExport?:ChartExport;
  config=signal<ChartConfig>({type:'area',zoom:true,crosshair:true,annotations:[{name:'Meta',value:70}],data:{labels:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],series:[{name:'Ingresos',data:[32,48,39,67,52,84,62]}]}});
  ionViewDidEnter():void {this.visits.update(v=>v+1);}
  add():void {const current=this.config();this.config.set(appendChartData(current,{labels:[`Día ${(current.data?.labels.length??0)+1}`],series:[{name:'Ingresos',data:[Math.round(40+Math.sin((current.data?.labels.length??0)*1.8)*25)]}]},30));}
  receive(payload:ChartExport):void {this.lastExport=payload;this.status.set(`${payload.filename}: ${payload.content.length.toLocaleString()} caracteres listos para guardar o compartir.`);}
  async share():Promise<void> {
    const payload=this.lastExport;if(!payload)return;
    try {
      if(Capacitor.isNativePlatform()) {
        const {Filesystem,Directory,Encoding}=await import('@capacitor/filesystem');
        const {Share}=await import('@capacitor/share');
        const data=payload.format==='png'?payload.content.slice(payload.content.indexOf(',')+1):payload.format==='svg'?decodeURIComponent(payload.content.slice(payload.content.indexOf(',')+1)):payload.content;
        await Filesystem.writeFile({path:payload.filename,directory:Directory.Cache,data,...(payload.format==='png'?{}:{encoding:Encoding.UTF8})});
        const {uri}=await Filesystem.getUri({path:payload.filename,directory:Directory.Cache});
        await Share.share({title:'Lúmina Charts',files:[uri]});
      } else {
        const blob=payload.format==='png'||payload.format==='svg'?await(await fetch(payload.content)).blob():new Blob([payload.content],{type:payload.format==='csv'?'text/csv;charset=utf-8':'application/json'});
        const file=new File([blob],payload.filename,{type:blob.type});
        if(navigator.canShare?.({files:[file]})) await navigator.share({files:[file],title:'Lúmina Charts'});
        else {const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=payload.filename;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
      }
      this.status.set('Archivo entregado al sistema.');
    } catch(error) {this.status.set(error instanceof Error?error.message:String(error));}
  }
}
@Component({selector:'app-detail',standalone:true,imports:[IonHeader,IonToolbar,IonTitle,IonContent,IonBackButton,IonButtons,IonCard,IonCardContent,LuminaChartComponent,LuminaIonicDirective],template:`<ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/" text="Volver"/></ion-buttons><ion-title>Detalle del proyecto</ion-title></ion-toolbar></ion-header><ion-content><div class="mobile-container"><h1>Una vista <span>más cerca.</span></h1><p class="mobile-lead">Al volver, Ionic conserva la página anterior en memoria. Su gráfica debe recuperar el tamaño y el zoom.</p><ion-card><ion-card-content><lumina-chart luminaIonic [config]="gantt" [tools]="true" label="Calendario de tareas del proyecto" height="330px"/></ion-card-content></ion-card></div></ion-content>`})
export class DetailPage {gantt=ganttChart([{name:'Diseño',start:1,end:5,progress:1},{name:'Código',start:3,end:12,progress:.65},{name:'Pruebas',start:9,end:15,progress:.2}]);}
@Component({selector:'app-mobile',standalone:true,imports:[IonApp,IonRouterOutlet],template:`<ion-app><ion-router-outlet/></ion-app>`})
export class MobileApp {}
bootstrapApplication(MobileApp,{providers:[provideIonicAngular({mode:'ios'}),{provide:RouteReuseStrategy,useClass:IonicRouteStrategy},provideRouter([{path:'',component:MetricsPage},{path:'detail',component:DetailPage},{path:'**',redirectTo:''}])]}).catch(console.error);
