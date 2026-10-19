# Production v3 · 首批真实表面与天空资源

核查日期：2026-10-20（上海）。资源状态为 **downloaded-and-verified**，尚未通过项目 G2 材质球、立面、斜光及建筑近景验收。没有修改旧生成图片，没有生成/假冒烘焙法线，没有改运行时代码。

## 交付与真实性边界

| 稳定键 | 官方资源 ID / 作者 | 用途与限制 | 原始字节 |
|---|---|---|---:|
| `courtyardStone` | [pavement_01](https://polyhaven.com/a/pavement_01) / Rob Tuytel | 灰褐手凿方石表面；不是故宫采样。块形较小，不能代替太和殿院落大板铺设的独立几何/UV与考据 | 11,819,253 |
| `mineralPlaster` | [white_plaster_02](https://polyhaven.com/a/white_plaster_02) / Rob Tuytel | 细颗粒灰白灰泥，供运行时调赭红；未确认矿物/胶结剂化学组成，不声称故宫原墙颜料 | 13,198,772 |
| `daylight` | [kloofendal_48d_partly_cloudy_puresky](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky) / Greg Zaal（Original）、Jarod Guest（Sky edits） | 仅天空的日间多云 HDRI，来源白平衡字段5400K；不带宫殿、建筑或树木环境。运行时太阳仍须校准 | 5,451,493 |

总计 **9个原始文件，30,469,518 bytes = 29.058 MiB**，低于更严格的35,000,000 bytes预算。首次下载与源MD5/图像头验证约17.8秒；无失败。Node运行的UTC取得时间保存在清单中。

Poly Haven的[纹理标准](https://docs.polyhaven.com/en/technical-standards/textures)说明其通常要求照片来源、摄影测量或光度立体工作流；单项API未给出具体拍摄/烘焙工艺，因此这里称“供应方照片来源PBR资源”，不擅自宣称某一张就是故宫实测、高模烘焙或指定扫描设备所得。所有下载文件保持原始字节。

## 许可与API条款

核查了[官方资源许可](https://polyhaven.com/license)、[API介绍](https://polyhaven.com/our-api)和[独立API条款](https://github.com/Poly-Haven/Public-API/blob/master/ToS.md)。资源使用[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)，可本地托管与再分发；网站预览、文案等不能一并当成CC0资源。本包没有下载网站示例渲染/头像/Logo。

API目前允许免费商业访问，无需密钥，要求独特User-Agent或Referer；使用线上API向用户呈现内容时须清楚标明来源。抓取脚本所有请求使用 **`ForbiddenCity3DArtProduction/0.2`**。本次由官方API目录选择少数候选后，只下载以上3个资产的9个指定通道，不抓网站或批量猜URL。产品加载本地资源，不依赖线上API；仍在此保留Poly Haven及作者署名。条款可能变化，再进行在线更新前应复核。

## 文件清单与通道约定

机器可读且包含 **每个下载URL、实际bytes、源MD5、SHA-256、格式、实际分辨率、位深、颜色空间、作者、许可、API出处、物理尺度及冲突说明**：

- 材质：[manifest.json](../public/assets/materials/production-v3/manifest.json)
- 环境：[manifest.json](../public/assets/environment/production-v3/manifest.json)
- 可复现脚本：[fetch-production-assets.mjs](../scripts/fetch-production-assets.mjs)

| 通道键 | 下载规格 | 解释 / Three.js接入 |
|---|---|---|
| `baseColor` | 官方2K（2048²）8bit JPG | `SRGBColorSpace`；材质`map`。保留原始有损源文件，无二次有损压缩 |
| `normal` | 官方1K（1024²）16bit PNG | `NoColorSpace`；OpenGL切线空间+Y，`normalMap`，不是颜色图派生 |
| `roughness` | 官方1K（1024²）16bit PNG | `NoColorSpace`；灰度数据，`roughnessMap`读取G；文件自身灰度不含颜色编码 |
| `ao` | 官方1K（1024²）16bit PNG | `NoColorSpace`；灰度数据，`aoMap`读取R，使用匹配UV；强度需近景检查，不是建筑接触遮蔽 |
| `environment` | 官方2K（2048×1024）Radiance `.hdr` | 线性RGBE辐射值；HDR加载器与PMREM。无sRGB转换；方位/太阳方向未在本资产交付中校准 |

两套表面均为非金属，`metallic=0`。没有下载或伪造Height/Displacement、没有打包ORM；后续需要ORM时固定R=AO/G=roughness/B=metallic并保留当前原图。原始PNG位深为16，但浏览器普通图片解码/上传可能降为8bit；本包不把16bit源文件等同于运行时16bit精度，也未完成KTX2压缩或GPU显存验收。

为控制初样预算采用2K颜色+1K数据通道，不将它们声称为全通道2K最终贴图。材质需按实际米制尺寸重复，不可一张覆盖整院。下载后的颜色图已肉眼查看：石面为低饱和灰褐方块，灰泥为弱斑驳细颗粒灰白面；这些检查不代替PBR渲染验收。

## 物理尺度与未确认事项

[官方API定义](https://github.com/Poly-Haven/Public-API/blob/master/swagger.yml)的`dimensions`单位为毫米。石面提供`[1500,1500]`，对应1.5×1.5m重复；1K数据约683px/m，2K颜色约1365px/m。下载图中约9×9石块，属于小块铺装表面参考，块长不能直接当故宫尺寸。

灰泥当前`dimensions=[1000,1000]`（1×1m），但旧`scale="1.5M x 1.5M"`。清单同时保留两者，以当前结构化字段暂定1m重复，并明确冲突未解决；这不是本项目独立实测。HDRI没有物理平面尺度，`tileSizeMeters=null`；资产名48d仅作来源太阳高度提示，不作为已校准方向。

## 再现与离线验证

```powershell
node scripts/fetch-production-assets.mjs
node scripts/fetch-production-assets.mjs --verify
```

已有清单时，默认按固定URL/源MD5恢复缺失或损坏文件，其余不走网络；`--verify`完全离线，只检查9个文件的bytes、源MD5、SHA-256与图像头尺寸。只有显式`--refresh`重新查询3个选定资产的官方API并生成清单，未更换资源ID；在线更新前复核许可/条款。每个请求有超时，单通道失败会记录并继续其他通道；完整性验证失败则非零退出。35MB为单次下载硬上限，不含少量API JSON元数据。

运行时可读取`materials.courtyardStone.channels.baseColor.path`等绝对站内路径；灰泥键为`materials.mineralPlaster`，环境为`environments.daylight.channels.environment.path`。源文件可直接随站分发，无需用户密钥。网络或上游版本变化不会改变已保存文件的散列；若固定URL内容变动，脚本拒绝冒充原资源。

## 大石板后续候选（未下载）

主广场不沿用`pavement_01`的小块铺装比例。仅经官方API元数据筛选，下列候选没有新增贴图下载，也没有通过原色图/近景PBR审查：

| 候选 | 供应方重复尺寸 | 作者 | 元数据支持的适用性 / 限制 |
|---|---|---|---|
| [slab_tiles](https://polyhaven.com/a/slab_tiles) | 约2.37×2.37m | Dario Barresi（Processing）、Dimitrios Savva（Photography） | 深灰板岩slab、平滑磨耗、棕色砂浆，低光泽；每图单块数量与长宽须再核实 |
| [stone_tiles_02](https://polyhaven.com/a/stone_tiles_02) | 2×2m | Charlotte Baglioni | 粗凿板岩slabs、明确接缝与自然色差；凹凸可能偏强，块形须再看 |
| [sandstone_cracks](https://polyhaven.com/a/sandstone_cracks) | 2×2m | Rob Tuytel | 米色砂岩颗粒与细裂缝，描述未提砖格；可研究用于独立大板几何内部表面，石种与偏暖色仍须判断 |

没有将3m的`large_floor_tiles_02`（官方为混凝土）或4m的`floor_tiles_04`（官方为大理石）冒充院落石板；重复尺寸大不等于单块尺寸真实，也不证明历史适配。
