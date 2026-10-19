# 资料与资产许可

检索与下载日期：2026-10-19。

| 来源 | URL | 实际用途 | 精度及许可边界 |
|---|---|---|---|
| 故宫博物院「探索」 | https://www.dpm.org.cn/Explore.html | 宫城南北961米、东西753米、墙高10米、四门关系 | 公开事实参考；没有复制站点图片或模型 |
| 故宫博物院导览 | https://www.dpm.org.cn/Visit.html | 建筑名称、区域、东西宫殿及园林层次 | 非测绘控制图，不用于宣称精确坐标 |
| 太和殿资料 | https://www.dpm.org.cn/explore/building/236465.html | 十一间、重檐庑殿顶、殿高26.92米、台基8.13米 | 官方公开高度有依据；面阔63.96米和进深37米为常见公开值，尚未获得独立测绘图校准 |
| 午门资料 | https://www.dpm.org.cn/explore/building/236454.html | 城台12米，正楼60.05×25米，九间、五凤楼关系 | 正楼部分尺寸有公开资料；雁翅楼形状和落位为近似 |
| 御花园资料 | https://www.dpm.org.cn/explore/building/236519.html | 坤宁宫后、140×80米、钦安殿盝顶、亭台特征 | 植被和石景不是古树与石景测绘，当前仅示意 |
| OpenStreetMap API | https://api.openstreetmap.org/api/0.6/map?bbox=116.3858,39.912,116.3958,39.9213 | WGS84 建筑 way 轮廓，部分高度与材质标签 | © OpenStreetMap contributors；ODbL 1.0；社区数据未提供测绘误差 |
| OSM 许可 | https://www.openstreetmap.org/copyright | 地图署名与数据库使用条件 | 本地原始快照及衍生建筑数据库按 ODbL 1.0 提供；公开分发衍生数据库须保留署名及相应许可义务 |
| Rapier 文档 | https://rapier.rs/docs/user_guides/javascript/character_controller/ | KCC、autostep、snap-to-ground API | 安装版本0.19.2的声明文件为最终 API 核对依据 |
| React Three Rapier | https://pmndrs.github.io/react-three-rapier/ | 固定物理步长与前后步进回调 | 包版本2.2.0，匹配 React19 / R3F9 |

## 数据加工

原始快照保存 way ID、标签与经纬度轮廓。生成脚本以局部平面近似转换坐标，计算方向包络；保留 `footprint`。凹形轮廓按一米网格拆分墙段与台基，避免以矩形填平院落。误差包含原始 OSM 误差、包络近似和栅格近似，不能给出伪造的厘米级精度。

数据许可与直接链接同时保存在 `public/data/LICENSE.md`：[ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/)。

外围城墙、午门翼楼、桥面、河流、御花园植被和少量分区边界为配置式近似；地图来源不是上述细节已全部校准的证明。示意河流不用于水系研究。未核实建筑保留「名称待核」。中和殿位置和尺寸显式估计。

## 模型与纹理

本项目没有下载外部 GLB、HDR、音频、字体或实景照片。几何和声音主要由本项目程序生成。画面升级版使用内置 OpenAI image_gen 单独生成六张外观材质，保存于 `public/assets/textures/imperial-v2/`，提示词和原始尺寸见同目录 `manifest.json`。图像用于颜色与凹凸，不是实物摄影扫描，也不能代表完整的 PBR 扫描资产。彩绘为艺术化近似；屋脊装饰、斗拱、石栏均有形制简化，吻兽并非文物级雕刻。

场景使用系统已有中文字体；不捆绑商业字体。Lucide 图标使用 ISC 许可；React、Vite、Three.js、R3F、Drei、Rapier 与其他依赖保留各自许可，详见安装包内 LICENSE 和 package-lock.json。不得因本地程序化资产无第三方模型依赖，就假定未来导入的网上模型可自由商用。
# 2026-10-20 美术来源增补

新增实拍PBR与日光HDRI的逐文件作者、许可、原始下载URL、尺度和SHA256见 [生产来源](PRODUCTION_ASSET_SOURCES.md) 及本地production-v3清单。两张未上线候选的实际观察和否决原因见 [铺地候选](PAVING_CANDIDATES.md)。太和殿公开包络、三台与最高点口径见 [参考包](TAIHE_REFERENCE_PACKET.md)。以上记录不将第三方石面称为故宫实物采样，也不授权重分发官方参考照片。
