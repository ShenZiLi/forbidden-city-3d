# M1铺地候选：两份原始BaseColor检查

检查日期：2026-10-20（上海）。**两份候选均不采用为太和殿主广场大板贴图。** 下载后已通过`view_image`查看完整原图，没有裁切、改色、修复或加载到运行时；这些资源不是故宫采样。

## 实际视觉结论

| 候选 | 供应方重复面积 | 单块数量的肉眼估计 | 接缝和颜色 | 主广场适配 |
|---|---|---|---|---|
| [Slab Tiles](https://polyhaven.com/a/slab_tiles) | 约2.37×2.37m | 约20余块，含边界裁断与少量三角填补碎块；没有规则行列 | 深炭灰/近黑板岩；很宽且高对比的赭棕砂浆呈不规则网状；大块也是不规则多边形 | **拒绝直接采用。** 颜色偏暗、砂浆偏橙棕，形制像碎拼石面而非规整中性大板 |
| [Stone Tiles 02](https://polyhaven.com/a/stone_tiles_02) | 2×2m | 约50块上下，含边界裁断碎块；数量为目测而非分割计数 | 较中性的灰/灰青，浅灰棕曲折接缝，片理与磨耗可见；多边形密集、块径明显偏小 | **拒绝直接采用。** 色相更接近目标，但碎拼接缝与块形不支持规整大板构造 |

数量均为完整2K图的近似目测，非精确拓扑统计；边界重复会造成完整块和裁断块的计数差异。重复面积不是单块尺寸。不能放大整个纹理把碎拼块强行冒充历史铺地大板，也不能把这些接缝叠在独立矩形板几何上。

后续应先按有依据的矩形板布局建立独立板块几何与UV，再选择不带现成砖缝的中性石面做细节；当前两张只保留筛选证据，可研究其他确需碎拼的S3重构区域。仅有BaseColor，不能据此判定roughness、法线、真实反射或G2通过。

## 原始文件与来源记录

两份资源均为Poly Haven官方API返回的 **2048×2048、8bit、sRGB JPG BaseColor（Diffuse）**，保持源文件原始字节；没有下载候选Normal、Roughness、AO或预览渲染。

| 原图 | 作者 | bytes | SHA-256 |
|---|---|---:|---|
| [slab_tiles_diff_2k.jpg](../public/assets/materials/candidates/slab_tiles_diff_2k.jpg) | Dario Barresi（Processing）、Dimitrios Savva（Photography） | 1,982,779 | `4d783b04cbe612f292871cd98514e9d13db1892cb0378e65aeefddff47524d1e` |
| [stone_tiles_02_diff_2k.jpg](../public/assets/materials/candidates/stone_tiles_02_diff_2k.jpg) | Charlotte Baglioni（All） | 3,487,320 | `02e056f5f5fbcbd90212bd4c7b8c1e979a10685a3291b6b25b19eeeb84f7d410` |

完整下载URL、源MD5、SHA-256、实际bytes、分辨率、供应方毫米尺度、作者、API出处及许可见[candidates/sources.json](../public/assets/materials/candidates/sources.json)。文件为CC0-1.0资源，许可与API条款已于本日核对：[官方许可](https://polyhaven.com/license)、[CC0](https://creativecommons.org/publicdomain/zero/1.0/)、[API条款](https://github.com/Poly-Haven/Public-API/blob/master/ToS.md)。下载User-Agent为`ForbiddenCity3DArtProduction/0.2`，只使用这两个已选资产的官方文件URL，无密钥、无站点批量抓取。

## 预算与加载范围

- 原`production-v3`九文件：30,469,518 bytes（29.058 MiB）。
- 本次候选两文件：5,470,099 bytes（5.2167 MiB）。
- 合计原始资源：**35,939,617 bytes（34.2747 MiB）**，低于35 MiB（36,700,160 bytes）。

候选两张合计比最初候选上限5 MiB多227,219 bytes；已获父任务明确允许采用“候选+production原始资源≤35 MiB”的总预算。原production单独35,000,000 bytes约束仍通过。这里统计实际取得的原始资源存储/下载，不把候选资源计作运行时必加载资源，也不声称产品会下载全部11张图。候选目录不在原九文件manifest中，没有修改原`production-v3 --verify`逻辑。

实际取得与校验约4.1秒，无失败。来源API提供的物理重复尺度未被独立实测，更不是故宫文物尺寸。

## 再现和离线验证

```powershell
node public/assets/materials/candidates/fetch-candidates.mjs
node public/assets/materials/candidates/fetch-candidates.mjs --verify
node scripts/fetch-production-assets.mjs --verify
```

候选脚本按已保存URL/MD5获取缺失文件，保留原production清单；`--verify`离线检查候选文件大小、源MD5、SHA-256与JPEG尺寸。原脚本仍独立核验原来的9份资源。候选抓取不会重新下载或替换原9份资源。
