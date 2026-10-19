// Repeatable real browser checks. Screenshots remain evidence for human review, not automatic visual acceptance.
export async function runArtChecks(page,expect,{capture=false}={}){
  const errors=[],results=[],screenshots=[];
  const pageError=e=>errors.push(e.message),consoleError=m=>{if(m.type()==='error')errors.push(m.text());};
  page.on('pageerror',pageError);page.on('console',consoleError);
  const cameras=['taihe-front-eye','taihe-front-mid','taihe-45','taihe-east','taihe-west','taihe-rear','taihe-eaves','taihe-column-base','taihe-door','taihe-tile-edge','taihe-terrace','taihe-distant','entrance-panorama'];
  try{
    for(const id of cameras){
      try{
        await page.goto(`http://127.0.0.1:5173/?artReview=${id}`,{waitUntil:'domcontentloaded'});
        await expect(page.getByRole('combobox',{name:'美术检查机位'})).toHaveValue(id,{timeout:60000});
        await page.waitForFunction(()=>window.__CITY_ART__?.frames>=3,{timeout:30000});
        const diagnostic=await page.evaluate(()=>{const r=window.__CITY_ART__;return {frames:r.frames,position:[...r.position],drawCalls:r.drawCalls,triangles:r.triangles,geometryCount:r.geometryCount,textureCount:r.textureCount,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,visibility:document.visibilityState};});
        expect(diagnostic.position.every(Number.isFinite)).toBe(true);expect(diagnostic.position[1]).toBeGreaterThan(.3);expect(diagnostic.drawCalls).toBeGreaterThan(0);
        if(capture){const receipt=await page.screenshot({fullPage:false,path:`${id}.png`});screenshots.push({id,receipt});}
        results.push({name:id,passed:true,diagnostic});
      }catch(e){results.push({name:id,passed:false,error:String(e).slice(0,600)});}
    }
    try{
      await page.goto('http://127.0.0.1:5173/?materialLab=1',{waitUntil:'domcontentloaded'});
      await expect(page.getByText('小块石面样本 · 实拍PBR/原始1.5m',{exact:true})).toBeVisible({timeout:60000});
      await expect(page.locator('canvas')).toBeVisible();results.push({name:'six-sample material lab',passed:true});
    }catch(e){results.push({name:'six-sample material lab',passed:false,error:String(e).slice(0,600)});}
  }finally{page.off('pageerror',pageError);page.off('console',consoleError);}
  return {date:new Date().toISOString(),backend:'Tabbit browser-owned Playwright',scope:'13 fixed cameras and material lab; no visual or FPS acceptance',results,errors,screenshots};
}
