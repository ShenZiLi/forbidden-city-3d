# 本地资源接入口

`models/` 放置有明确许可的米制 GLB；`textures/` 放置材质贴图；`environment/` 放置环境贴图与声音。

当前版本不含外部模型。关键几何、天空和音效为本地程序化生成；六张AI生成材质位于 `textures/imperial-v2/`，提示词与实际尺寸保存在同目录 `manifest.json`，并已应用于三维表面。不要在缺少授权记录时导入模型。新增资产时同步更新根目录 `docs/SOURCES.md`。
