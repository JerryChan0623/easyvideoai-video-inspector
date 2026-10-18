const {test} = require('node:test');
const assert = require('node:assert/strict');
const {inspect,crop,textReport} = require('../metrics.js');
test('reports exact odd dimensions separately from an approximate standard ratio', () => {
  const info = inspect({name:'clip.mp4',type:'video/mp4',size:12500000,width:1080,height:608,duration:12.5});
  assert.equal(info.aspectRatio,'135:76');
  assert.equal(info.nearestStandard,'16:9');
  assert.equal(info.averageTotalBitrateMbps,8);
  assert.equal(info.orientation,'Landscape');
});
test('landscape to vertical removes sides, not the top or bottom', () => {
  const result = crop(1920,1080,'9:16');
  assert.equal(result.topPercent,0);
  assert.equal(result.heightPercent,100);
  assert.ok(Math.abs(result.widthPercent-31.640625)<1e-8);
  assert.ok(Math.abs(result.leftPercent-34.1796875)<1e-8);
  assert.ok(Math.abs(result.retainedAreaPercent-31.640625)<1e-8);
});
test('portrait to square removes top and bottom; original keeps every pixel', () => {
  const result = crop(720,1280,'1:1');
  assert.equal(result.leftPercent,0);
  assert.equal(result.widthPercent,100);
  assert.equal(result.heightPercent,56.25);
  assert.equal(result.topPercent,21.875);
  assert.equal(crop(560,752,'original').retainedAreaPercent,100);
});
test('rejects corrupt or unbounded metadata and unknown crop targets', () => {
  const valid = {size:1024,width:720,height:1280,duration:12};
  for (const key of ['size','width','height','duration']) for (const bad of [0,-1,NaN,Infinity]) assert.throws(()=>inspect({...valid,[key]:bad}));
  assert.throws(()=>inspect({...valid,width:1.5}));
  assert.throws(()=>crop(0,720,'9:16'));
  assert.throws(()=>crop(1280,720,'4:5'));
});
test('crop geometry stays inside source bounds for all orientations', () => {
  for (const [width,height] of [[560,752],[720,1280],[1080,608],[1920,1080],[512,512]]) {
    for (const target of ['original','9:16','1:1','16:9']) {
      const result=crop(width,height,target);
      assert.ok(result.leftPercent>=0 && result.topPercent>=0);
      assert.ok(Math.abs(result.leftPercent*2+result.widthPercent-100)<1e-8);
      assert.ok(Math.abs(result.topPercent*2+result.heightPercent-100)<1e-8);
      assert.ok(result.retainedAreaPercent>0 && result.retainedAreaPercent<=100);
      if(target!=='original') {const [a,b]=target.split(':').map(Number);assert.ok(Math.abs((width*result.widthPercent)/(height*result.heightPercent)-a/b)<1e-8);}
    }
  }
});
test('export names estimates and limitations without claiming a codec or audio result', () => {
  const info=inspect({name:'my clip.mp4',type:'',size:1000000,width:720,height:1280,duration:5});
  const report=textReport(info,crop(720,1280,'1:1'));
  assert.match(report,/my clip\.mp4/);
  assert.match(report,/56\.3%/);
  assert.match(report,/audio presence.*not verified/);
  assert.match(report,/No video file is uploaded/);
});
