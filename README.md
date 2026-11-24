# DeepSeek Harness (`dsh`) 技术分享演示文稿 (v2)

面向程序员同事的 **DeepSeek Harness (`dsh`)** 20 分钟精简版分享网页（衔接 20 分钟自研插件 Demo）。

## 在线预览

- **v2 精简版（主地址）**：https://holynova.github.io/dsh-tech-talk/
- **v1 原版归档**：https://holynova.github.io/dsh-tech-talk/v1.html

## v2 核心改动

- 新增 **Profile `cordis.patch.yml` 补丁文件与叠加流程** 专页
- 新增 **Web / Headless / SDK 三种使用方式** 交互图文专页
- **原理一**：聚焦 Cordis 依赖注入（DI）与 `ctx.effect` 自动清理，去掉事件监听示例
- **原理二**：以内置服务 `@deepseek-ai/dsh-fs` 为例，直接对比系统 `Definition` 与自定义重写 `Provider`
- 移除双平面隔离页，并将核心全流程简化为一眼看懂的 **4 步闭环图**
