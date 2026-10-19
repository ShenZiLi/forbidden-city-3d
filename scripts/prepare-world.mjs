// Reproducible transform of the checked-in OSM snapshot; no runtime network needed.
import fs from 'node:fs';
const raw = JSON.parse(fs.readFileSync('public/data/osm-buildings.json', 'utf8'));
const origin = { lat: 39.9166, lon: 116.39075 };
const k = Math.PI / 180 * 6378137;
const xy = p => [(p[1] - origin.lon) * k * Math.cos(origin.lat * Math.PI / 180), (origin.lat - p[0]) * k];
const regionOf = (x,z) => z > 220 ? (x < -130 ? 'west-outer' : x > 130 ? 'east-outer' : 'entry') : z > -110 ? (x < -120 ? 'west-outer' : x > 120 ? 'east-outer' : 'outer') : z < -380 && Math.abs(x) < 85 ? 'garden' : x < -60 ? 'west-inner' : x > 60 ? 'east-inner' : 'inner';
const overrides = {
  '午门': { id: 'wumen', x: 20, z: 477, width: 60.05, depth: 25, base: 12, height: 23, roof: 'double-hip', bays: 9, passageWidth: 8, sourceUrl: 'https://www.dpm.org.cn/explore/building/236454.html' },
  '太和门': { id: 'taihemen', width: 57, depth: 24, base: 1.5, height: 20, roof: 'double-gable-hip', bays: 9, passageWidth: 8 },
  '太和殿': { id: 'taihedian', width: 63.96, depth: 37, base: 8.13, height: 26.92, roof: 'double-hip', bays: 11, sourceUrl: 'https://www.dpm.org.cn/explore/building/236465.html' },
  '保和殿': { id: 'baohedian', base: 4.5, height: 22, roof: 'double-gable-hip', bays: 9 },
  '乾清宫': { id: 'qianqinggong', base: 2.5, height: 20, roof: 'double-hip', bays: 9 },
  '交泰殿': { id: 'jiaotaidian', base: 1.5, height: 16, roof: 'pavilion', bays: 3 },
  '坤宁宫': { id: 'kunninggong', base: 1.5, height: 17, roof: 'double-gable-hip', bays: 9 },
  '神武门': { id: 'shenwumen', width: 40, depth: 22, base: 10, height: 20, roof: 'double-hip', bays: 5, passageWidth: 7 },
  '东华门': { id: 'donghuamen', x: 374, z: 322, width: 40, depth: 22, rotation: Math.PI / 2, base: 10, height: 17, roof: 'double-hip', passageWidth: 6 },
  '西华门': { id: 'xihuamen', x: -374, z: 322, width: 40, depth: 22, rotation: Math.PI / 2, base: 10, height: 17, roof: 'double-hip', passageWidth: 6 },
  '日精门': { rotation: Math.PI/2 }, '月华门': { rotation: Math.PI/2 },
  '景运门': { rotation: Math.PI/2 }, '隆宗门': { rotation: Math.PI/2 },
  '钦安殿': { id: 'qinandian', height: 14, roof: 'truncated-hip', base: 1.5, bays: 5 },
  '万春亭': { roof: 'pavilion', height: 10 }, '千秋亭': { roof: 'pavilion', height: 10 },
  '文华殿': { roof: 'hip', height: 17, width: 32, depth: 25 }, '武英殿': { roof: 'hip', height: 17, width: 32, depth: 25 },
};
const descriptions = {
  '午门': '紫禁城南面的正门，始建于明永乐十八年。城台与门楼构成层次分明的五凤楼格局。现模型保留贯通门洞，雁翅楼为体量近似。',
  '太和殿': '外朝礼仪中心。现存主体为清康熙年间重建，重檐庑殿顶，面阔十一间。殿身高26.92米、三层台基高8.13米有官方资料支持；构件与纹样为程序化近似。',
  '太和门': '外朝正门。与午门之间形成前朝入口庭院，内金水河和五座石桥横贯门前。',
  '乾清宫': '内廷中路的主要宫殿，为明清帝王寝宫之一。外部轮廓参考地图，内部尚未复原。',
  '钦安殿': '御花园中轴主体建筑，屋顶为重檐盝顶。园林道路、树木位置及石景为近似配置，非古树测绘。',
};
function decompose(p,b){
  const c=Math.cos(b.rotation),s=Math.sin(b.rotation),v=p.map(q=>[(q[0]-b.x)*c-(q[1]-b.z)*s,(q[0]-b.x)*s+(q[1]-b.z)*c]);
  const inside=(x,z)=>{let yes=false;for(let i=0,j=v.length-1;i<v.length;j=i++){const a=v[i],d=v[j];if((a[1]>z)!==(d[1]>z)&&x<(d[0]-a[0])*(z-a[1])/(d[1]-a[1])+a[0])yes=!yes;}return yes;};
  const minX=Math.floor(Math.min(...v.map(q=>q[0]))),maxX=Math.ceil(Math.max(...v.map(q=>q[0]))),minZ=Math.floor(Math.min(...v.map(q=>q[1]))),maxZ=Math.ceil(Math.max(...v.map(q=>q[1])));
  const parts=[];
  for(let z=minZ;z<maxZ;z++)for(let x=minX;x<maxX;x++){
    if(!inside(x+.5,z+.5))continue;let end=x+1;while(end<maxX&&inside(end+.5,z+.5))end++;
    const last=parts.find(q=>q.x===x+(end-x)/2&&q.width===end-x&&Math.abs(q.z+q.depth/2-z)<.01);
    if(last){last.z+=.5;last.depth++;}else parts.push({x:x+(end-x)/2,z:z+.5,width:end-x,depth:1});x=end-1;
  }
  return parts;
}
const result = [];
for (const src of raw.elements) {
  const p = src.points.slice(0,-1).map(xy);
  if (p.length < 3) continue;
  const xs = p.map(v=>v[0]), zs=p.map(v=>v[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
  let x=(minX+maxX)/2,z=(minZ+maxZ)/2;
  const name=src.tags['name:zh'] || src.tags.name || '';
  if (Math.abs(x)>358 || z>461 || z< -463) { if (!overrides[name]) continue; }
  if (/墙|厕所|售票|广播|房子|平房|小房|井$|中学|医院|门诊|城墙/.test(name)) continue;
  let width=maxX-minX,depth=maxZ-minZ;
  if (width<3.5 || depth<3.5 || width>120 || depth>120) { if(!overrides[name]) continue; }
  let rotation=0;
  // Fit a local oriented envelope with an east-west edge; retain original polygon in metadata.
  let best=0;
  for(let i=0;i<p.length;i++) { const a=p[i],b=p[(i+1)%p.length]; const dx=b[0]-a[0],dz=b[1]-a[1]; const len=Math.hypot(dx,dz); if(Math.abs(dx)>Math.abs(dz)*3 && len>best){best=len;rotation=-Math.atan2(dz,dx);if(rotation>Math.PI/2)rotation-=Math.PI;if(rotation< -Math.PI/2)rotation+=Math.PI;} }
  const c=Math.cos(rotation),s=Math.sin(rotation),local=p.map(v=>[(v[0]-x)*c-(v[1]-z)*s,(v[0]-x)*s+(v[1]-z)*c]);
  width=Math.max(...local.map(v=>v[0]))-Math.min(...local.map(v=>v[0]));depth=Math.max(...local.map(v=>v[1]))-Math.min(...local.map(v=>v[1]));
  const gate=/门$/.test(name), pavilion=/亭$/.test(name);
  const o=overrides[name]||{};
  const b={id:`osm-${src.osmId}`,name:name||'附属殿宇（名称待核）',english:src.tags['name:en']||'',region:regionOf(x,z),kind:gate?'gate':pavilion?'pavilion':name?'palace':'annex',x,z,width,depth,rotation,height:gate?8:pavilion?8:Math.min(14,Math.max(5,Math.min(width,depth)*0.6)),base:gate?0:0.65,roof:pavilion?'pavilion':name?'gable-hip':'gable',bays:Math.max(3,Math.min(9,Math.round(width/4.5)|1)),major:!!overrides[name],enterable:false,footprint:p.map(v=>v.map(x=>Math.round(x*100)/100)),model:'procedural:v1',collision:gate?'passage':'solid',passageWidth:gate?4:undefined,description:descriptions[name]||`${name||'该附属建筑'}的平面位置来自 OpenStreetMap 建筑轮廓。形制、立面、室内和高度尚未完成测绘核对；当前为可替换的程序化结构模型。`,sources:['osm-2026-10-19','dpm-map'],sourceUrl:'https://www.dpm.org.cn/Visit.html',osmId:src.osmId,accuracy:{position:'map-traced',dimensions:o.id==='taihedian'||o.id==='wumen'?'published-partial':'map-envelope',height:o.id==='taihedian'?'published':'estimated',orientation:'map-traced',errorBudget:'OSM 未提供测绘精度；位置、轮廓与朝向误差未知，高度除明确引用外为估计。'},...o};
  // Non-square long halls have ridges along their longer direction.
  if(b.depth>b.width*1.7 && !o.rotation && !gate){[b.width,b.depth]=[b.depth,b.width];b.rotation+=Math.PI/2;}
  const tagHeight=Number(src.tags.height);
  if(src.tags.building==='wall') {b.kind='wall';b.height=Number.isFinite(tagHeight)&&tagHeight>0?tagHeight:3.5;b.base=0;b.description='参考 OSM 的院墙轮廓，按一米网格分解为静态墙段，保留凹形轮廓的通道；墙高为估计。';}
  else if(!b.major&&!gate&&tagHeight>0&&tagHeight<=3){b.kind='platform';b.height=.1;b.base=tagHeight;b.description='OSM 标为低矮石构筑物。当前按原始轮廓表示台基或石道；高程、台阶和可达方式待实测。';}
  const area=Math.abs(p.reduce((sum,a,i)=>{const c=p[(i+1)%p.length];return sum+a[0]*c[1]-c[0]*a[1];},0))/2;
  if(!b.major&&b.collision==='solid'&&(b.kind==='wall'||area/(width*depth)<.78))b.parts=decompose(p,b);
  result.push(b);
}
// Missing named central hall is explicitly distinguished from traced footprints.
result.push({id:'zhonghedian',name:'中和殿',english:'Hall of Central Harmony',region:'outer',kind:'palace',x:3,z:9,width:24,depth:24,height:17,base:5,rotation:0,roof:'pavilion',bays:3,major:true,enterable:false,footprint:[[-9,-3],[15,-3],[15,21],[-9,21]],model:'procedural:v1',collision:'solid',description:'三大殿之间的方形殿宇，单檐四角攒尖顶。位置依中轴关系估计，尺寸和台基标高待测绘核实。',sources:['dpm-map'],sourceUrl:'https://www.dpm.org.cn/Visit.html',accuracy:{position:'estimated',dimensions:'map-envelope',height:'estimated',orientation:'estimated',errorBudget:'位置和尺寸尚无测绘校准；不可用于测量。'}});
fs.writeFileSync('src/data/buildings.generated.json',JSON.stringify(result,null,1));
const ids=['entry','outer','inner','east-inner','west-inner','garden','east-outer','west-outer'];
fs.mkdirSync('public/data/regions',{recursive:true});
for(const id of ids) fs.writeFileSync(`public/data/regions/${id}.json`,JSON.stringify({id,version:1,buildingIds:result.filter(b=>b.region===id).map(b=>b.id),detail:'procedural:v1',source:'Local procedural reconstruction; see SOURCES.md'}));
console.log(`Prepared ${result.length} buildings, ${ids.length} regions, ${result.filter(b=>b.name.includes('待核')).length} unnamed footprints.`);
