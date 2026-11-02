import '@angular/compiler';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as echarts from 'echarts';
import {SAMPLES} from '../projects/gallery/src/samples';
import {buildChartOption} from '../projects/lumina-charts/src/lib/chart-options';

test('every gallery example renders SVG with the actual ECharts engine',()=>{
  assert.equal(SAMPLES.length,35);
  for(const sample of SAMPLES) {
    const chart=echarts.init(null,undefined,{renderer:'svg',ssr:true,width:600,height:320});
    try {
      const options=buildChartOption({...sample.config,animation:false},{width:600});
      if(sample.type==='graph') options.series=[{type:'graph',layout:'circular',data:[{name:'A'},{name:'B'}],links:[{source:0,target:1}]}];
      chart.setOption(options);
      const svg=chart.renderToSVGString();
      assert.ok(svg.includes('<svg'),sample.name);
      assert.ok(!/\b(?:NaN|Infinity)\b/.test(svg),`${sample.name} has invalid geometry`);
    }finally {chart.dispose();}
  }
});
