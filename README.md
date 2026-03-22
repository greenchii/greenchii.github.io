# 个人博客（GitHub Pages）

这是一个可直接部署到 GitHub Pages 的静态博客。

## 目录结构

- `index.html`：首页（文章列表 + 搜索）
- `post.html`：文章页（根据 `?slug=` 加载 Markdown）
- `assets/style.css`：样式（含浅色/深色主题）
- `assets/main.js`：逻辑（主题切换 + 列表/文章加载）
- `posts/posts.json`：文章索引（新增文章需要更新这里）
- `posts/*.md`：文章内容（Markdown）

## 新增文章

1. 在 `posts/` 新建 `xxx.md`
2. 在 `posts/posts.json` 追加一条记录（注意 `slug` 与文件名一致）

## 发布到 GitHub Pages

把这些文件上传到仓库根目录（`<你的用户名>.github.io`），然后在仓库 Settings → Pages：

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/(root)`

保存后等待部署完成即可访问：`https://<你的用户名>.github.io/`

