# 写实美术升级实施计划

**Goal:** 持续推进总方案M0–M5，全城高完成度才是最终完成；本批先建立可复现管线和太和殿样板，不能把样板认定为全城竣工。

**Architecture:** 保留地图/导航/碰撞的数据边界；独立HeroAssetSpec同时驱动核心建筑的可见台基和碰撞；美术资源、校验门禁、摄影机和PBR通道独立注册。不同来源只修改有证据的字段。

**Tech Stack:** React19 / R3F9 / Three0.183 / Rapier2；本地公开授权扫描PBR与HDRI；必要时离线模型烘焙和压缩，不依赖运行时远程资源。

采用 subagent-driven-development：独立实现任务分工，集成前先核对总方案，再审查代码与实测。当前工作区没有git仓库，不创建虚假的提交或PR记录。

## Task 1 · 生产台账与机位（M0）

Files: `src/art/assetManifest.ts`、`src/art/reviewCameras.ts`、`src/art/validation.ts`、`src/tests/art*.test.ts`、`docs/ART_ASSET_REGISTER.md`。

- [ ] 写测试：重复ID、缺依赖、accepted缺门禁证据必须失败，真实planned状态不能伪装为accepted。
- [ ] 实现R/T/J/S/P/V全部具体资源ID、依赖、状态和证据字段。
- [ ] 录入太和殿十二个固定机位和入口基线，记录position/target/FOV/画质/时间/检查目的。
- [ ] 执行 `npm test -- src/tests/art*.test.ts` 并检查结果；文档写明未通过项。

## Task 2 · 首批扫描PBR/HDRI（M0）

Files: `scripts/fetch-production-assets.mjs`、`public/assets/materials/production-v3/`、`public/assets/environment/production-v3/`、`docs/PRODUCTION_ASSET_SOURCES.md`。

- [ ] 核对官方许可/API规则，少量下载，唯一User-Agent。
- [ ] 获取石材与灰泥匹配的BaseColor/NormalGL/Roughness/AO，以及一份日光HDRI。
- [ ] 记录实际尺寸、字节数、SHA256、作者、下载URL、许可与通道色彩空间。
- [ ] 图片不是故宫实物采样；缺失通道显式记录，不能以复制颜色图补齐PBR清单。

## Task 3 · 太和殿形体替换（M1第一批）

Files: `src/architecture/hero/`、`src/tests/hero*.test.ts`。

- [ ] 测试核心高度、退台连续、楼体包络、几何有限数与台阶落点。
- [ ] 实现独立HeroAssetSpec；26.92米殿身、8.13米台基有明确公开依据，其余构件比例记为重构。
- [ ] 制作三层退台与石作线脚、栏板/望柱、主阶与两侧阶梯；提供同源碰撞和台阶规格。
- [ ] 制作柱网、内凹门窗、分开的上下檐、厚檐/椽望、补间构造与瓦口。
- [ ] 不再调用通用59%殿身公式。真实雕刻/准确彩画/全部吻兽单独保留未完成项。
- [ ] 跑本目录测试和TypeScript，提交文件/API与风险供主层集成。

## Task 4 · 材质、光照和审查集成（M0/M1）

Files: `src/architecture/materials.ts`、`SurfaceMaterial.ts`、`src/hooks/useImperialMaterials.ts`、`src/world/Lighting.tsx`、`RenderPipeline.tsx`、`src/art/ArtReview.tsx`。

- [ ] PBR独立线性Normal/Roughness/AO，BaseColor sRGB；检查所有shader使用相同物理尺度UV。
- [ ] 本地HDRI/PMREM，保留方向、亮度和来源；不能双太阳或重复色调映射。
- [ ] 添加可关闭的接触遮蔽；均衡/高档有合理采样成本，性能档降级。
- [ ] `?artReview=<id>`进入固定审查机位，隐藏展示HUD，冻结角色移动；通过安全锚点加载对应近景。
- [ ] 用相同机位保存基线/新版本，不能用摄影机变化冒充材质改进。

## Task 5 · 同源碰撞、LOD与功能回归

Files: `BuildingFactory.tsx`、`CollisionSystem.ts`、`TraversalRules.ts`、`src/tests/routes-physics.test.ts`。

- [ ] 只对taihedian启用首批HeroPalace；普通模型保留，数据不重复硬编码位置。
- [ ] 视觉退台、台阶与碰撞引用HeroAssetSpec；禁止旧100×70整块悬空碰撞覆盖退台。
- [ ] 远景与近景外部轮廓保持，切换不改变角色位置或删除碰撞。
- [ ] 跑 `npm run validate`，完整A/B/C/D路线和十处传送保持通过。

## Task 6 · 视觉复核与阶段记录

- [ ] 浏览器加载所有本地资源，无持续WebGL/shader错误。
- [ ] 审查至少正面、45度、檐下、台基与材质近景；发现穿插或消失必须修复或明示未通过。
- [ ] 正式标记本批资源状态，G1–G4按画面证据逐项判断，不能用测试绿替代。
- [ ] 保留当前浏览器前台策略/限帧问题的实际记录；未验证前不报60FPS。
- [ ] 更新 `ART_PROGRESS.md`。本批交付后总目标仍active，继续M1剩余细节及M2–M5。

## 后续队列（不在本批伪称完成）

太和殿雕刻和准确彩画 → 独立高模/烘焙/GLB → 太和殿前院和陈设 → 午门/太和门及南部完整路线 → 内廷核心 → 东西宫区 → 园林 → 全城资源压缩、前台性能、长期稳定及作品包。
