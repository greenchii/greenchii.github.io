# GitHub Pages 发布笔记（新手向）

你已经做到「上传网站文件」，接下来通常会遇到这几个点：

## 1）仓库名必须正确

仓库名需要是：

`<你的 GitHub 用户名>.github.io`

比如你叫 `alice`，仓库名就必须是 `alice.github.io`。

## 2）Pages 选择主分支根目录

在仓库 Settings → Pages：

- **Build and deployment** → **Source** 选择 **Deploy from a branch**
- Branch 选 **main**
- Folder 选 **/(root)**（根目录）

保存后，GitHub 会给你一个站点地址：`https://<用户名>.github.io/`

## 3）更新文章后要做什么

静态博客没有后台数据库，所以每次新增文章时，你需要：

- 新增 `posts/xxx.md`
- 更新 `posts/posts.json`（让首页能看到新文章）

## 4）常见坑

- 访问 404：通常是仓库名不对，或 Pages 没选 root
- CSS/JS 没生效：检查路径是不是相对路径（本项目用 `./assets/...`）
- 缓存问题：刚部署可能需要等 1-3 分钟
