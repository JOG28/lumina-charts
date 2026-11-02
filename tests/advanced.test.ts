import {test} from 'node:test';
import assert from 'node:assert/strict';
import {histogram,chartToTable,tableToCsv,appendChartData} from '../projects/lumina-charts/src/lib/chart-data';
import {buildChartOption} from '../projects/lumina-charts/src/lib/chart-options';
import {ganttChart,rangeAreaChart} from '../projects/lumina-charts/src/lib/chart-presets';
import {joinChartGroup} from '../projects/lumina-charts/src/lib/chart-sync';
import type {ChartConfig} from '../projects/lumina-charts/src/lib/chart.types';
import type {ECharts} from 'echarts';

test('histogram includes max, preserves count, handles constant and empty input',()=>{
  assert.deepEqual(histogram([0,1,2,3,4],2).counts,[2,3]);
  assert.deepEqual(histogram([5,5,5],7),{labels:['5'],counts:[3]});
  assert.deepEqual(histogram([],7),{labels:[],counts:[]});
  assert.throws(()=>histogram([Infinity]),/finitos/);
  assert.throws(()=>histogram([1],0),/bins/);
  assert.equal(histogram([-1e308,0,1e308],3).counts.reduce((sum,n)=>sum+n,0),3);
});
test('CSV preserves commas, quotes, newlines and neutralizes string formula cells',()=>{
  const result=tableToCsv({headers:['Nombre','Valor'],rows:[['a,"b"\nc',3],['=1+1',-4],['  @SUM(A1)',null]]});
  assert.equal(result,'"Nombre","Valor"\r\n"a,""b""\nc","3"\r\n"\'=1+1","-4"\r\n"\'  @SUM(A1)",""');
});
test('advanced export tables are copied and point tables expose all dimensions',()=>{
  const source={headers:['A'],rows:[[4]]};const copy=chartToTable({type:'custom',table:source});copy.rows[0][0]=9;assert.equal(source.rows[0][0],4);
  assert.throws(()=>chartToTable({type:'custom',table:{headers:['A'],rows:[[1,2]]}}),/encabezado/);
  const table=chartToTable({type:'bubble',points:[{name:'P',data:[{name:'A',x:1,y:2,size:25}]}]});assert.deepEqual(table.rows,[['P','A',1,2,25]]);
});
test('live data is bounded, immutable and rejects misaligned series',()=>{
  const config:ChartConfig={type:'line',data:{labels:['A','B'],series:[{name:'S',data:[1,2]}]}};
  const incoming={labels:['C','D'],series:[{name:'S',data:[3,4]}]};
  assert.deepEqual(appendChartData(config,incoming,3).data,{labels:['B','C','D'],series:[{name:'S',data:[2,3,4]}]});
  assert.deepEqual(config.data!.labels,['A','B']);assert.deepEqual(incoming.labels,['C','D']);
  assert.throws(()=>appendChartData(config,{...incoming,series:[{name:'X',data:[3,4]}]}),/nombre/);
  assert.throws(()=>appendChartData(config,incoming,0),/positivo/);
});
test('normalized stacks sum to 100 and zero columns remain finite',()=>{
  const config:ChartConfig={type:'normalizedBar',data:{labels:['A','B'],series:[{name:'S',data:[1,0]},{name:'T',data:[3,0]}]}};
  const series=buildChartOption(config).series as {data:number[]}[];
  assert.deepEqual(series.map(s=>s.data),[[25,0],[75,0]]);
  assert.throws(()=>buildChartOption({...config,data:{labels:['X'],series:[{name:'S',data:[-1]}]}}),/positivos/);
});
test('mobile zoom leaves vertical page gestures available and honors reduced motion',()=>{
  const config:ChartConfig={type:'line',zoom:true,data:{labels:['A'],series:[{name:'S',data:[1]}]}};
  const options=buildChartOption(config,{width:320,reducedMotion:true});
  const zoom=options.dataZoom as {preventDefaultMouseMove?:boolean;moveOnMouseMove?:boolean}[];
  assert.equal(zoom[0].preventDefaultMouseMove,false);assert.equal(zoom[0].moveOnMouseMove,false);assert.equal(zoom.length,2);assert.equal(options.animation,false);
  assert.equal((buildChartOption({...config,type:'pie'}).dataZoom),undefined);
});
test('bubble sizes use the third dimension instead of a uniform radius',()=>{
  const option=buildChartOption({type:'bubble',points:[{name:'P',data:[{x:1,y:2,size:17}]}]});
  const series=(option.series as {symbolSize:(v:number[])=>number;data:unknown[]}[])[0];
  assert.equal(series.symbolSize([1,2,17]),17);assert.equal(series.symbolSize([1,2,500]),80);
});
test('Gantt and range helpers validate intervals and preserve negative bounds',()=>{
  const gantt=ganttChart([{name:'X',start:-2,end:3,progress:.5}]);assert.deepEqual(gantt.table!.rows,[['X',-2,3,.5]]);
  assert.throws(()=>ganttChart([{name:'X',start:3,end:2}]),/rangos/);
  assert.throws(()=>rangeAreaChart([{label:'X',low:4,high:1}]),/low/);
  assert.deepEqual(rangeAreaChart([{label:'X',low:-5,high:2}]).table!.rows,[['X',-5,2]]);
});
test('sync group survives partial disposal, moves and repeated cleanup',()=>{
  const calls:string[]=[];const engine={connect:(name:string)=>calls.push(`+${name}`),disconnect:(name:string)=>{calls.push(`-${name}`);}};
  const a={group:''} as ECharts,b={group:''} as ECharts;
  const leaveA=joinChartGroup(engine,a,'test'),leaveB=joinChartGroup(engine,b,'test');
  assert.deepEqual(calls,['+lumina:test']);leaveA();leaveA();assert.deepEqual(calls,['+lumina:test']);leaveB();assert.deepEqual(calls,['+lumina:test','-lumina:test']);assert.equal(b.group,'');
});
test('reference overlays work on native series without mutating consumer options',()=>{
  const series=[{type:'line' as const,data:[10,20]}];
  const config:ChartConfig={type:'custom',crosshair:true,annotations:[{name:'Meta',value:15}],bands:[{name:'Objetivo',start:12,end:18}],option:{xAxis:{data:['A','B']},yAxis:{},series}};
  const result=buildChartOption(config);
  assert.equal('markLine' in series[0],false);
  assert.ok((result.series as {markLine:unknown}[])[0].markLine);
  assert.equal((result.tooltip as {axisPointer:{type:string}}).axisPointer.type,'cross');
  assert.throws(()=>buildChartOption({...config,bands:[{name:'Mal',start:20,end:10}]}),/rangos/);
});
