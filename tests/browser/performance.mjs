export async function measurePerformance(page){
  await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>!!window.__CITY__&&window.__CITY__.runtime.ready,null,{timeout:45000});
  const environment=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info'),r=window.__CITY__.runtime;return{userAgent:navigator.userAgent,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),startupMs:r.bootedAt-r.startedAt};});
  const measurements=[];
  for(const [id,quality] of [['wumen','balanced'],['taihedian','balanced'],['qianqinggong','balanced'],['qinandian','balanced'],['taihedian','performance'],['wumen','balanced'],['qinandian','balanced'],['wumen','balanced']]){
    await page.getByRole('button',{name:'打开设置'}).click();await page.getByRole('button',{name:quality==='performance'?'性能优先':'均衡',exact:true}).click();await page.getByRole('button',{name:'关闭设置'}).click();
    await page.evaluate(id=>window.__CITY__.teleport(id),id);
    await page.waitForFunction(()=>!window.__CITY__.runtime.teleport);
    await page.evaluate(()=>new Promise(resolve=>{let n=0;const tick=()=>{if(++n>=60)resolve(null);else requestAnimationFrame(tick);};requestAnimationFrame(tick);}));
    const result=await page.evaluate(()=>new Promise(resolve=>{
      const times=[];let last=performance.now();const tick=()=>{const now=performance.now();times.push(now-last);last=now;if(times.length<120){requestAnimationFrame(tick);return;}
        const sorted=[...times].sort((a,b)=>a-b),r=window.__CITY__.runtime;resolve({frames:times.length,averageFPS:1000/(times.reduce((a,b)=>a+b,0)/times.length),frameMs:{p50:sorted[60],p95:sorted[114],p99:sorted[118],max:sorted[119]},heapBytes:performance.memory?.usedJSHeapSize??null,drawCalls:r.drawCalls,triangles:r.triangles,geometries:r.geometryCount,textures:r.textureCount,position:[...r.position]});};requestAnimationFrame(tick);
    }));measurements.push({id,quality,...result});
  }
  await page.reload();await page.waitForSelector('.intro',{timeout:45000});
  return {date:'2026-10-19',environment,measurements,notes:['Short stationary samples in a connected desktop browser; browser visibility may cap RAF.','Warm local development reload. JS heap excludes GPU memory. No sustained-hour leak conclusion.']};
}
