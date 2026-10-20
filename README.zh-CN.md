<div align="center">

# 紫禁漫游 · Forbidden City 3D

**在浏览器中，走进北京故宫的院落、宫门与殿宇。**

[English](README.md) · [简体中文](README.zh-CN.md)

![版本](https://img.shields.io/badge/version-0.1.0-9b4437)
![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.183-222222?logo=threedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![开发状态](https://img.shields.io/badge/status-in_development-c1a365)

[快速开始](#快速开始) · [画面展示](#画面展示) · [操作指南](#操作指南) · [开发指南](#开发指南) · [参与贡献](#参与贡献)

</div>

![紫禁漫游首页：宫城全景、导航界面与小地图](docs/screenshots/readme/overview.png)

面向桌面浏览器的实时三维漫游项目，使用 React、Three.js 和 React Three Fiber 构建。沿中轴线步行，在第一、第三人称之间切换，结合宫城地图查阅建筑档案。

> **项目范围：** v0.1.0 为程序化建筑结构研究原型。建筑轮廓有地图来源，但几何、尺寸、高程与细部仍包含估计，尚未达到测绘级数字孪生或完整超写实复原标准。项目独立开发，与故宫博物院无官方关联。应用界面目前为中文，README 提供中英文版本，默认展示英文。

## 功能亮点

- **自由步行：** 第一人称鼠标观察、第三人称跟随镜头、行走、奔跑和暂停继续。
- **物理通行：** Rapier 胶囊角色控制器，支持宫门通道、台阶、碰撞边界和镜头避障。
- **地图与传送：** 小地图、展开地图、宫城俯视，以及中轴线上的 10 处传送地点。
- **建筑档案：** 建筑图鉴和附近建筑信息，附带来源与精度说明。
- **程序化建筑：** 曲面屋顶、柱网、斗拱、窗棂、阶台与实例化构件；太和殿使用独立模型，包含三层退台和实体瓦陇。
- **可调体验：** 三档画质，清晨、正午、黄昏光照预设，以及默认关闭的合成风声、鸟鸣和脚步声。
- **美术检查：** 13 个固定机位、六材质检验场、本地 PBR 贴图、HDRI 光照与 GTAO 环境遮蔽。
- **分区细节加载：** 八个区域的异步加载、重试和资源释放；场景资源由本地提供，运行时无需第三方资产 API 或 API 密钥。

当前数据包含 **841 个地图结构记录**，其中包括殿宇、院墙、台基和附属轮廓，**588 个名称待核实**。这些数字不代表已逐一精细复原 841 座宫殿。

## 画面展示

### 太和殿整体

![东南方向的太和殿：重檐屋顶、柱廊和三层台基](docs/screenshots/readme/taihe-hall.png)

当前重点制作的建筑：独立柱网、重檐屋顶、瓦陇、槅扇门窗与三层石作台基。

### 台基与石作细节

![太和殿台基近景：台阶、石栏杆和红色木柱](docs/screenshots/readme/terrace-detail.png)

以上图片于 **2026 年 10 月 20 日**从开发版本实机截取，视口为 **1600 × 1000**，未经后期修饰。太和殿图片使用内置美术检查机位，展示当前原型进度，不代表最终视觉验收。

## 快速开始

### 环境要求

- **Node.js 22.12.0 或更新版本**，npm 10 或更新版本。
- 支持 **WebGL 2** 的桌面浏览器，以及键盘和鼠标；暂未提供触屏移动控制。
- 安装依赖时需要网络；核心场景使用仓库内的本地资源。

```sh
git clone https://github.com/ShenZiLi/forbidden-city-3d.git
cd forbidden-city-3d
npm ci
npm run dev
```

打开 **http://127.0.0.1:5173/**，点击 **「进入紫禁城」**，允许浏览器锁定鼠标后即可进行第一人称漫游。

开发服务器绑定本机并使用固定端口。如果 5173 已被占用，请先停止已有服务，再启动新实例。

### 构建与预览

```sh
npm run build
npm run preview
```

生产文件输出至 `dist/`，本地预览地址通常为 **http://127.0.0.1:4173/**。可将 `dist/` 部署到静态站点根目录；若部署到子目录，还需调整 Vite 的 `base` 和清单中的绝对本地资源地址。

## 操作指南

| 操作 | 输入 |
| --- | --- |
| 开始漫游 | 点击 **进入紫禁城** |
| 移动 | **W / A / S / D** |
| 奔跑 | 移动时按住 **Shift** |
| 观察 | 第一人称移动鼠标；第三人称按住画布拖动 |
| 切换第一、第三人称 | **V** 或右上角视角按钮 |
| 暂停、释放鼠标 | **Esc**；浏览器失焦或切换到后台也会暂停 |
| 查看附近建筑 | **E** 或建筑卡片的箭头 |
| 传送 | **前往一处宫殿** 菜单或展开地图中的地点 |
| 全城俯视 | 顶部导航中的 **宫城总览** |
| 打开设置 | 右上角设置图标 |
| 碰撞调试 | **F3** 或设置中的复选框 |

暂停后点击「继续漫游」。传送后点击画布，可重新锁定鼠标。切换视角会保留角色的位置与朝向。

## 技术栈

| 层级 | 使用工具 |
| --- | --- |
| 应用 | React 19、TypeScript 5.9、Vite 7 |
| 三维渲染 | Three.js、React Three Fiber 9、Drei 10 |
| 物理 | Rapier 3D、React Three Rapier 2 |
| 界面图标 | Lucide React |
| 验证 | Vitest、Playwright |
| 空间数据 | OpenStreetMap 轮廓、WGS84 到本地世界坐标的转换 |

## 开发指南

### 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 类型检查并构建生产版本 |
| `npm run preview` | 本地预览生产版本 |
| `npm test` | 运行单元测试，包含真实 Rapier WASM 通行检查 |
| `npm run test:watch` | 监听模式运行单元测试 |
| `npm run test:e2e` | 运行 Playwright 浏览器测试 |
| `npm run validate` | 依次运行单元测试与生产构建 |
| `node scripts/prepare-world.mjs` | 从原始快照重新生成建筑和分区数据 |
| `node scripts/fetch-production-assets.mjs --verify` | 离线校验九份生产原始资源 |

运行独立浏览器测试前，先安装 Chromium：

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright 会启动本地开发服务器，或复用已运行的服务。此前 Windows 环境曾记录 `spawn UNKNOWN` 浏览器启动失败，已连接浏览器的复验结果保存在 [`docs/browser-results.json`](docs/browser-results.json)，这些结果不能证明独立 Playwright 命令在所有环境均已通过。历史测试背景见 [验收记录](docs/VALIDATION.md)。另有 Windows / PowerShell 的 Tabbit 适配命令 `npm run test:browser:tabbit`，需要先启动开发服务器。

### 项目结构

```text
src/
├── app/             应用状态、启动流程与开发诊断
├── architecture/    屋顶、柱网、斗拱、阶梯、墙体与材质
├── art/             固定检查机位与材质检验场
├── components/      HUD、地图、建筑档案、设置与加载界面
├── data/            建筑类型、生成数据、分区与传送地点
├── navigation/      角色控制器、相机与碰撞规则
├── streaming/       分区加载与资源生命周期管理
├── tests/           单元、几何、数据与物理测试
└── world/           坐标、光照、地面、园林与合成声音
public/
├── assets/          本地贴图、材质与环境贴图
└── data/            OSM 快照、署名与八个分区数据集
tests/browser/       浏览器交互与性能检查
scripts/             数据生成、资源校验与浏览器工具
docs/                来源、实现说明、制作进度与截图
```

### 空间数据与资源

**1 世界单位 = 1 米。** X 向东、Y 向上、**−Z 向北**。WGS84 局部平面近似的原点为纬度 `39.9166`、经度 `116.39075`，不代表经过实地测量的控制点。不要将未转换的 GCJ-02 或 BD-09 坐标混入数据库。

OSM 快照日期为 **2026 年 10 月 19 日**。更新原始快照或 `scripts/prepare-world.mjs` 中的显式配置后，重新生成并验证：

```sh
node scripts/prepare-world.mjs
npm run validate
```

生成的建筑数据库与分区 JSON 通过统一 ID 和几何数据，服务于场景、地图、碰撞、交互和传送。新增记录时保留来源、精度、轮廓、尺度、入口和碰撞信息。

新增精细模型时，将具有明确许可、以米为单位的 GLB 和贴图放入 `public/assets/`，记录来源，通过建筑注册表和分区资源生命周期接入；为装饰网格单独制作简化碰撞。GLB 流送以及 Draco、Meshopt、KTX2 解码链仍属后续工作，当前分区流送加载的是程序化细节配置。

### 美术检查

启动开发服务器后，可访问：

- **太和殿检查：** http://127.0.0.1:5173/?artReview=taihe-45 — 下拉切换 13 个固定机位。
- **材质检验场：** http://127.0.0.1:5173/?materialLab=1 — 使用环绕控制检查六种材质样本。

`node scripts/fetch-production-assets.mjs` 按固定来源清单恢复缺失资源；`--verify` 为离线校验，`--refresh` 会显式重新查询供应方元数据。更新或替换资源前，请阅读 [生产资源来源](docs/PRODUCTION_ASSET_SOURCES.md)。

## 路线图与当前限制

- [x] 第一、第三人称漫游，物理通行，地图和建筑档案。
- [x] 八区细节加载与 10 处传送地点。
- [x] 首轮太和殿独立模型、本地 PBR / HDRI 管线和检查工具。
- [ ] 以测绘资料校准建筑位置、尺寸和连续台基高程。
- [ ] 完善雕刻、脊饰、彩画与室内。
- [ ] 统一全城院落细节，补充有许可的高精度资源。
- [ ] 大型模型流送、长时间内存检查和更广的设备、浏览器测试。
- [ ] 触屏移动控制和更完整的可访问性支持。

当前尚未复原室内，部分高台只能从外部接近，第三人称角色使用临时程序化动画。时段光照为艺术预设，合成音效不是实地录音；稳定 60 FPS 和完整超写实仍是目标。详情见 [已知问题](docs/KNOWN_ISSUES.md) 和 [性能记录](docs/PERFORMANCE.md)。

## 详细文档

目前详细制作文档以中文为主。

| 主题 | 文档 |
| --- | --- |
| 工程实现与交付状态 | [实现说明](docs/IMPLEMENTATION.md) · [阶段状态](docs/STATUS.md) |
| 资料与资源溯源 | [来源说明](docs/SOURCES.md) · [生产资源](docs/PRODUCTION_ASSET_SOURCES.md) |
| 美术方向与资源管理 | [美术总方案](docs/ART_PRODUCTION_MASTERPLAN.md) · [资源台账](docs/ART_ASSET_REGISTER.md) · [制作进度](docs/ART_PROGRESS.md) |
| 太和殿参考与复核 | [参考包](docs/TAIHE_REFERENCE_PACKET.md) · [视觉复核](docs/ART_VISUAL_REVIEW.md) |
| 验证与待解决问题 | [验收记录](docs/VALIDATION.md) · [性能记录](docs/PERFORMANCE.md) · [已知问题](docs/KNOWN_ISSUES.md) |

## 参与贡献

欢迎提交问题、纠正资料、调查性能问题，以及贡献来源明确的资源。

1. 发现问题或计划较大改动时，先[创建 Issue](https://github.com/ShenZiLi/forbidden-city-3d/issues)。报告问题时附上复现步骤、浏览器、操作系统、画质档位，以及有助于说明问题的截图。
2. Fork 仓库并创建聚焦本次改动的分支。
3. 建筑考据应可追溯到来源；新增模型、贴图或音频时，在来源记录中填写作者、原始链接、许可和修改情况。
4. 执行 `npm run validate`。修改通行或交互时运行浏览器检查；修改几何或材质时对比固定机位。
5. [提交 Pull Request](https://github.com/ShenZiLi/forbidden-city-3d/pulls)，说明改动内容和验证方式。

## 致谢与许可

- **地图数据：** © OpenStreetMap contributors。OSM 快照及 OSM 衍生数据库部分按 **ODbL 1.0** 提供，见 [数据署名与许可](public/data/LICENSE.md)。
- **PBR 贴图与 HDRI：** 选用 Poly Haven 的 **CC0 1.0** 资源，作者和逐文件来源见 [生产资源来源](docs/PRODUCTION_ASSET_SOURCES.md)，不代表故宫实物采样。
- **生成贴图：** 六张 AI 生成外观贴图记录于 [`public/assets/textures/imperial-v2/manifest.json`](public/assets/textures/imperial-v2/manifest.json)，属于艺术资源，不是摄影扫描。
- **建筑参考：** 名称及部分尺寸参考故宫博物院公开资料，本项目并非博物院官方产品。
- **第三方依赖：** 保留各自许可，完整声明以安装包为准。

**代码许可：** 仓库目前没有根目录代码 `LICENSE` 文件。公开可见不等于已授予开源代码许可；地图数据和第三方资源的许可分别适用于对应材料。
