import { test, expect } from '@playwright/test';
test('三维初始化、地图、档案、图鉴、设置、视角和刷新',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.getByRole('button',{name:'进入紫禁城',exact:true})).toBeVisible({timeout:45000});
  await expect(page.locator('canvas')).toBeVisible();
  await page.screenshot({path:'docs/screenshots/entrance.png'});
  await page.getByRole('button',{name:'第三人称',exact:true}).click();await expect(page.getByRole('button',{name:'第三人称',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'收起小地图'}).click();await expect(page.getByRole('button',{name:'展开小地图'})).toBeVisible();await page.getByRole('button',{name:'展开小地图'}).click();
  await page.getByRole('button',{name:'展开宫城地图',exact:true}).click();await expect(page.getByRole('dialog',{name:'宫城总图'})).toBeVisible();await page.getByRole('button',{name:'关闭宫城地图'}).click();
  await page.getByRole('button',{name:'查看午门建筑档案'}).click();await expect(page.getByRole('dialog',{name:'午门建筑档案'})).toContainText('程序化结构');await page.getByRole('button',{name:'关闭建筑档案'}).click();
  await page.getByRole('button',{name:'打开设置'}).click();await page.getByRole('button',{name:'性能优先',exact:true}).click();await expect(page.getByRole('button',{name:'性能优先',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'黄昏',exact:true}).click();await page.getByRole('button',{name:'关闭设置'}).click();
  await page.getByRole('button',{name:/建筑图鉴/}).click();await expect(page.getByRole('dialog',{name:'宫城建筑图鉴'})).toBeVisible();await page.getByRole('button',{name:'关闭建筑图鉴'}).click();
  await page.getByRole('button',{name:/宫城总览/}).click();await expect(page.getByRole('button',{name:'回到当前位置'})).toBeVisible();await page.screenshot({path:'docs/screenshots/overview.png'});await page.getByRole('button',{name:'回到当前位置'}).click();
  await page.reload();await expect(page.getByRole('button',{name:'进入紫禁城',exact:true})).toBeVisible({timeout:45000});expect(errors).toEqual([]);
});
test('十个安全传送点、分区卸载和往返后界面保持可用',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('button',{name:'进入紫禁城',exact:true})).toBeVisible({timeout:45000});
  for(const name of ['太和门','太和殿','中和殿','保和殿','乾清宫','交泰殿','坤宁宫','御花园','神武门','午门']){
    await page.getByRole('button',{name:'前往一处宫殿'}).click();await page.locator('.travel-menu').getByRole('button',{name:new RegExp(name)}).click();
    await page.waitForFunction(()=>!((window as any).__CITY__?.runtime.teleport));
    await expect(page.locator('.loading-screen')).toHaveCount(0);
    const y=await page.evaluate(()=>(window as any).__CITY__.runtime.position[1]);expect(y).toBeGreaterThan(.3);expect(y).toBeLessThan(2);
  }
  expect(errors).toEqual([]);
});
test('实际键盘运动与视角连续性，失焦清空移动',async({page})=>{
  await page.goto('/');await expect(page.getByRole('button',{name:'进入紫禁城',exact:true})).toBeVisible({timeout:45000});
  await page.getByRole('button',{name:'进入紫禁城',exact:true}).click();
  const z=await page.evaluate(()=>(window as any).__CITY__.runtime.position[2]);
  await page.keyboard.down('w');await page.waitForFunction(start=>(window as any).__CITY__.runtime.position[2]<start-2,z);await page.keyboard.up('w');
  const before=await page.evaluate(()=>[...(window as any).__CITY__.runtime.position]);await page.keyboard.press('v');await expect(page.getByRole('button',{name:'第三人称',exact:true})).toHaveAttribute('aria-pressed','true');
  const after=await page.evaluate(()=>[...(window as any).__CITY__.runtime.position]);expect(Math.hypot(before[0]-after[0],before[2]-after[2])).toBeLessThan(.5);
  await page.keyboard.down('w');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.getByRole('button',{name:'继续漫游',exact:true})).toBeVisible();
  const paused=await page.evaluate(()=>[...(window as any).__CITY__.runtime.position]);await page.waitForTimeout(400);const stopped=await page.evaluate(()=>[...(window as any).__CITY__.runtime.position]);expect(Math.hypot(paused[0]-stopped[0],paused[2]-stopped[2])).toBeLessThan(.1);await page.keyboard.up('w');
});
