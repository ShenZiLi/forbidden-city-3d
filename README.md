# 紫禁漫游 · Forbidden City 3D

可运行的 React / Three.js / React Three Fiber 宫城漫游研究版。包含统一米制空间、第一与第三人称、Rapier 胶囊运动学碰撞、宫门通道、台阶、地图、建筑档案、十处传送和本地分区加载。

当前美术制作已转入长期M0/M1：太和殿使用独立三层台基、柱网、厚屋壳、实体瓦陇与同源碰撞；接入本地授权HDRI、独立PBR通道与GTAO。既有六张AI生成外观图是艺术资源，不能称为实物扫描。详细生产方案、50项台账和待办见 [美术总方案](docs/ART_PRODUCTION_MASTERPLAN.md)、[资源台账](docs/ART_ASSET_REGISTER.md)、[长期进度](docs/ART_PROGRESS.md)。尚未达到超写实成品标准。

**当前是具有地图轮廓依据的程序化结构版本，并非超写实、测绘级故宫数字孪生。** 高精度 GLB、室内、雕刻、彩画、精确高程及完整院落测绘尚未交付。每栋建筑在档案中显示来源和可信度，不能使用当前模型进行实物测量。

## 启动

要求 Node.js **22.12 或更新版本**（本次使用 24.15.0），npm 10+，支持 WebGL 2 的桌面浏览器。

```sh
npm ci
npm run dev
```

打开 **http://127.0.0.1:5173/**。开发服务器绑定本机，核心画面不需要远程模型、在线地图或 API 密钥。依赖安装需要网络。Vite 使用固定端口；如端口被占用，请先停止旧开发服务。

```sh
npm run build
npm run preview
```

生产输出为 `dist/`，可部署至静态站点根目录。预览地址通常为 `http://127.0.0.1:4173/`。若部署于子目录，需同时调整 Vite `base` 和 manifest 中的本地资源 URL。

## 操作

| 操作 | 输入 |
|---|---|
| 开始第一人称 | 点击「进入紫禁城」，授权浏览器锁定鼠标 |
| 移动 / 奔跑 | WASD / Shift |
| 观察 | 第一人称移动鼠标；第三人称按住画布拖动 |
| 切换视角 | V 或右上角按钮，保留角色坐标与朝向 |
| 暂停 | Esc、浏览器失焦或切换到后台 |
| 查看附近建筑 | E 或左下方建筑卡片的箭头 |
| 传送 | 右上「前往一处宫殿」或展开地图后的地点 |
| 全城俯视 | 顶部「宫城总览」；期间不移动角色 |
| 碰撞调试 | F3 或设置中的复选框 |

Esc 后从暂停界面继续。传送后点击画布可以重新锁定鼠标。第一人称与第三人称共用一个胶囊刚体；角色是带程序化站立、行走摆动的临时模型。第三人称相机使用物理射线缩短跟随距离，尚无复杂镜头动画。

设置提供高、均衡、性能优先三档，分别调整渲染分辨率、阴影分辨率和近景构件距离；不会重置角色。声音默认关闭，进入后可开启本地合成风声、鸟鸣、脚步声。这些不是实地录音。

美术检查入口：`http://127.0.0.1:5173/?artReview=taihe-45`，提供13个固定机位及下拉切换，摄影机不会改变地图几何；角色停在对应建筑安全锚点以预加载所在分区。`?materialLab=1`打开六材质的米制检验场，可拖动环绕。检查场只用于比较，截图与功能测试不自动构成视觉验收。

新原始资产来源记录在 [PBR与环境来源](docs/PRODUCTION_ASSET_SOURCES.md)。`node scripts/fetch-production-assets.mjs --verify`离线检查9份原始文件的散列和图像头；不带参数可按固定清单补回缺失资源，`--refresh`才重新查询供应方元数据。项目不在运行时访问第三方资产API。

## 工程结构

```text
src/app/             React 状态、启动流程、开发诊断桥
src/world/           世界、灯光、天空、地面分块、园林、合成声音
src/data/            统一建筑类型、生成数据、区域、传送、来源
src/architecture/    曲面屋顶、斗拱、柱网、窗棂、阶台、宫墙与实例批次
src/navigation/      Rapier KCC、双视角、碰撞规则、外部连通网格
src/streaming/       异步加载去重、取消、重试、引用释放、近区细节
src/components/      HUD、地图、图鉴、建筑档案、设置、加载
src/tests/           坐标、数据、资源、几何与真实 Rapier 测试
tests/browser/       Playwright 测试与已连接浏览器复验程序
public/data/         OSM 来源快照及 8 个分区 JSON
public/assets/       后续本地模型、纹理、环境资产接入口
scripts/             空间数据生成、已连接浏览器验证
docs/                实施、验收、精度、性能与已知问题
```

## 坐标与数据更新

1 世界单位 = 1 米；X 向东，Y 向上，**-Z 向北**。`WorldCoordinates.ts` 使用 WGS84 局部平面近似，原点为纬度 39.9166、经度 116.39075。此原点不是宣称经过实地测量的控制点。不要将 GCJ-02 / BD-09 坐标直接混入此数据库；不同坐标制会产生明显偏移。

`public/data/osm-buildings.json` 是 2026-10-19 下载的 OSM 建筑快照，查询边界记录在文件中。`scripts/prepare-world.mjs` 将轮廓转为世界坐标，保留原始 polygon 和 OSM way ID，并应用有说明的核心建筑配置。运行：

```sh
node scripts/prepare-world.mjs
npm test
npm run build
```

生成 `src/data/buildings.generated.json` 和 `public/data/regions/*.json`。目前包含 **841 个地图结构记录**，其中 **588 个名称待核**。其中有殿宇、院墙、台基和附属轮廓，不能将此数目解释为已复原 841 座宫殿。中和殿是显式估计录入；核心位置、非公开尺寸和高度的精度请查每项 `accuracy`。

资料有新增时，应修改原始快照或生成脚本中的显式配置，然后重新生成；不建议仅编辑生成文件。新增建筑必须填写 ID、来源、区域、footprint、旋转、尺度、入口与碰撞配置。相同数据供场景、地图、碰撞、交互和传送使用。

## 新增精细资产

1. 把授权的 `.glb` 及贴图放入 `public/assets/models/`、`textures/`，在 `docs/SOURCES.md` 补充出处、作者、许可、修改与使用范围。
2. 校准米制单位、Y 轴、原点、朝向和建筑包络；保留现有建筑 ID 和世界位置。独立制作简化碰撞，不以百万面装饰网格直接碰撞。
3. 扩展 `Building.model` 与 `ArchitectureRegistry` 的模型资源配置，在 `BuildingFactory` 根据模型类型选择资源；以分区资源 loader 调用 `AssetManager.acquire`，最后释放引用时 dispose。
4. 如使用 KTX2、Meshopt 或 Draco，先将所需解码器放到本地并配置加载器；当前版本未引入这些格式的外部资源，也不宣称已接好对应解码链。
5. 替换视觉资产后执行坐标与可达性测试，并实测模型接缝、门洞、台阶和近景性能。

## 加载与性能策略

841 项基础空间数据和低细节轮廓随应用载入。重复主体、基础屋面、柱子与窗棂采用实例化批次。附近分区请求本地 JSON，准备更高细节构件；超过保留距离释放分区引用，远景体量与固定碰撞仍保留。当前流送对象是**程序化细节配置**，并非大型 GLB 流送压力测试。

地面用连续 100 米碰撞分块，避免单个 1600 米碰撞盒与米级胶囊产生数值误差。运动在固定 1/60 秒物理步进之前计算，之后同步位置，渲染帧读取位置更新相机。预取距离 170 米，释放距离 310 米，避免边界频繁装卸。视锥裁剪使用 Three.js 默认机制；批次并非按每栋建筑独立剔除。

详见 [性能记录](docs/PERFORMANCE.md)。源码中的 60 FPS 是目标，不是已通过的成绩。

## 测试

```sh
npm test
npm run test:watch
npx playwright install chromium
npm run test:e2e
```

本次环境的独立 Playwright 浏览器进程启动返回 `spawn UNKNOWN`，**不能称该独立测试命令已通过**。实际交互检查通过 Windows 本机 Tabbit 的 Playwright 运行时执行，报告见 `docs/browser-results.json`。安装了 Tabbit 时可以运行：

```powershell
npm run test:browser:tabbit
pwsh -NoProfile -File scripts/run-tabbit-tests.ps1 -Mode Performance
```

该脚本需要开发服务器，浏览器可能新建项目标签。单元测试包含真实 Rapier WASM 运动，自动路径检查也不能替代逐段人工观察所有复杂碰撞。

## 资料、范围与问题

请同时阅读 [来源与许可](docs/SOURCES.md)、[完成状态](docs/STATUS.md)、[验收记录](docs/VALIDATION.md) 和 [已知问题](docs/KNOWN_ISSUES.md)。该项目不是故宫博物院官方产品，未使用官方标识、官方模型或未经许可的实景照片。
