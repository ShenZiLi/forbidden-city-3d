# 当前进度交接 · 2026-10-20

用户要求将当前工程保存到GitHub并在完成后关机。本次保存的是可运行的M0/M1首轮制作进度，不是全宫城超写实成品。

## 已验证的当前状态

- `npm run validate`：58项测试、15文件全部通过，生产构建成功；保留引擎/物理块体积提示。
- `node scripts/fetch-production-assets.mjs --verify`：9个原始资源散列与图像头通过。
- 已连接浏览器：13固定机位与材质场14项、漫游交互12项全部通过，错误列表为空。记录为 `art-browser-regression.json` 与 `browser-results.json`。
- 独立Playwright启动仍受本机 `spawn UNKNOWN` 限制，未记为通过。
- 画质阴影目标重建已增加独立回归；实机专项往返结果保存在 `shadow-quality-results.json`。

## 运行

`npm ci`，再运行 `npm run dev`。自由漫游为根路径；`?artReview=taihe-45`是固定机位，`?materialLab=1`是米制材质比较场。`npm run build`生成生产目录。

## 恢复开发时的优先顺序

1. 阅读 `ART_PROGRESS.md`、`ART_VISUAL_REVIEW.md`、`TAIHE_REFERENCE_PACKET.md`，按M1继续，不将首个结构样板视为全城完成。
2. 校准屋面、三台轮廓与最高点定义；处理37.00/37.17米深度及35.05/37.44米高度口径。
3. 继续近景石作、准确瓦截面/脊饰、斗拱与彩画；统一院落与邻近建筑。主广场不能使用已否决的碎拼板岩候选。
4. 做前台性能、十次往返和30分钟驻留。当前高档全通道提交仍高，不宣称达到45–60FPS。
5. 太和殿和院落通过G0–G7后，再推进M2南入口与M3–M5全宫城制作。

来源与许可在 `SOURCES.md` 和 `PRODUCTION_ASSET_SOURCES.md`。没有纳入node_modules、生产构建、临时报告、密钥或个人文件。
