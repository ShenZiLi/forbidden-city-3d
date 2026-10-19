// The same real UI checks can run on Tabbit's browser-owned Playwright runtime.
export async function runBrowserChecks(page,expect){
  const results=[],errors=[];const error=e=>errors.push(e.message);page.on('pageerror',error);
  const check=async(name,fn)=>{try{await fn();results.push({name,passed:true});}catch(e){results.push({name,passed:false,error:String(e).slice(0,700)});}};
  await page.goto('http://127.0.0.1:5173/');
  await check('WebGL / physics / startup',async()=>{await expect(page.getByRole('button',{name:'进入紫禁城',exact:true})).toBeVisible({timeout:45000});await expect(page.locator('canvas')).toBeVisible();});
  await check('View switch buttons',async()=>{await page.getByRole('button',{name:'第三人称',exact:true}).click();await expect(page.getByRole('button',{name:'第三人称',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'第一人称',exact:true}).click();});
  await check('Minimap collapse and full map',async()=>{await page.getByRole('button',{name:'收起小地图'}).click();await expect(page.getByRole('button',{name:'展开小地图'})).toBeVisible();await page.getByRole('button',{name:'展开小地图'}).click();await page.getByRole('button',{name:'展开宫城地图',exact:true}).click();await expect(page.getByRole('dialog',{name:'宫城总图'})).toBeVisible();await page.getByRole('button',{name:'关闭宫城地图'}).click();});
  await check('Building archive',async()=>{await page.getByRole('button',{name:'查看午门建筑档案'}).click();await expect(page.getByRole('dialog',{name:'午门建筑档案'})).toContainText('程序化结构');await page.getByRole('button',{name:'关闭建筑档案'}).click();});
  await check('Quality, time, sensitivity, sound settings',async()=>{await page.getByRole('button',{name:'打开设置'}).click();await page.getByRole('button',{name:'性能优先',exact:true}).click();await expect(page.getByRole('button',{name:'性能优先',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'黄昏',exact:true}).click();await expect(page.locator('.time-label')).toContainText('黄昏');await page.locator('#sensitivity').press('ArrowRight');await expect(page.locator('#sensitivity')).toHaveValue('1.1');await page.locator('#volume').press('ArrowRight');await expect(page.locator('#volume')).toHaveValue('0.05');await page.getByRole('button',{name:'均衡',exact:true}).click();await page.getByRole('button',{name:'清晨',exact:true}).click();await page.getByRole('button',{name:'关闭设置'}).click();});
  await check('Architecture atlas',async()=>{await page.getByRole('button',{name:/建筑图鉴/}).click();await expect(page.getByRole('dialog',{name:'宫城建筑图鉴'})).toBeVisible();await page.getByRole('button',{name:'关闭建筑图鉴'}).click();});
  await check('Overview camera',async()=>{await page.getByRole('button',{name:/宫城总览/}).click();await expect(page.getByRole('button',{name:'回到当前位置'})).toBeVisible();await page.getByRole('button',{name:'回到当前位置'}).click();});
  await check('Ten teleport targets and streamed region return',async()=>{
    for(const name of ['太和门','太和殿','中和殿','保和殿','乾清宫','交泰殿','坤宁宫','御花园','神武门','午门']){
      await page.getByRole('button',{name:'前往一处宫殿'}).click();await page.locator('.travel-menu').getByRole('button',{name:new RegExp(name)}).click();await page.waitForFunction(()=>!window.__CITY__.runtime.teleport);
      await expect(page.locator('.loading-screen')).toHaveCount(0);const p=await page.evaluate(()=>[...window.__CITY__.runtime.position]);expect(p[1]).toBeGreaterThan(.3);expect(p[1]).toBeLessThan(2);
    }
  });
  await check('Refresh and pointer lock keyboard movement',async()=>{
    await page.reload();await expect(page.getByRole('button',{name:'进入紫禁城',exact:true})).toBeVisible({timeout:45000});await page.getByRole('button',{name:'进入紫禁城',exact:true}).click();
    const z=await page.evaluate(()=>window.__CITY__.runtime.position[2]);await page.keyboard.down('w');await page.waitForFunction(start=>window.__CITY__.runtime.position[2]<start-2,z,{timeout:12000});await page.keyboard.up('w');
    const before=await page.evaluate(()=>[...window.__CITY__.runtime.position]);await page.keyboard.press('v');await expect(page.getByRole('button',{name:'第三人称',exact:true})).toHaveAttribute('aria-pressed','true');const after=await page.evaluate(()=>[...window.__CITY__.runtime.position]);expect(Math.hypot(before[0]-after[0],before[2]-after[2])).toBeLessThan(.5);
  });
  await check('Blur resets held movement',async()=>{
    await page.keyboard.down('w');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.getByRole('button',{name:'继续漫游',exact:true})).toBeVisible();const p=await page.evaluate(()=>[...window.__CITY__.runtime.position]);await page.waitForTimeout(350);const q=await page.evaluate(()=>[...window.__CITY__.runtime.position]);expect(Math.hypot(p[0]-q[0],p[2]-q[2])).toBeLessThan(.1);await page.keyboard.up('w');
  });
  await check('No uncaught runtime errors',async()=>{expect(errors).toEqual([]);});
  await check('Region network failure and real retry',async()=>{
    await page.route('**/data/regions/entry.json',route=>route.abort());await page.reload();await expect(page.getByRole('button',{name:'重新加载',exact:true})).toBeVisible({timeout:40000});await page.unroute('**/data/regions/entry.json');await page.getByRole('button',{name:'重新加载',exact:true}).click();await expect(page.getByRole('button',{name:'进入紫禁城',exact:true})).toBeVisible({timeout:30000});
  });
  page.off('pageerror',error);
  const diagnostic=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return{viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),position:[...window.__CITY__.runtime.position],frames:window.__CITY__.runtime.frames};});
  await page.reload();await expect(page.getByRole('button',{name:'进入紫禁城',exact:true})).toBeVisible({timeout:45000});
  return {date:'2026-10-19',backend:'Tabbit browser-owned Playwright',results,errors,diagnostic};
}
