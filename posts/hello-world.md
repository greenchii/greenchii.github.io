# Hello World：我的博客上线啦

欢迎来到我的个人博客。

这套博客的特点：

- 用 Markdown 写文章（放在 `posts/` 目录）
- 首页自动加载 `posts/posts.json` 并生成文章列表
- 文章页 `post.html` 根据 `?slug=` 读取对应 Markdown 并渲染
- 支持浅色/深色主题切换

---

## 如何新增一篇文章

1. 在 `posts/` 新建一个 Markdown 文件，例如：`my-first-post.md`
2. 打开 `posts/posts.json`，新增一条记录：

```json
{
  "slug": "my-first-post",
  "title": "我的第一篇文章",
  "date": "2026-03-19",
  "tags": ["生活"],
  "excerpt": "一段简短摘要，显示在首页卡片里。",
  "file": "./posts/my-first-post.md"
}
```

3. 打开首页，文章就会出现了。

---

## 代码高亮示例

```js
function hello(name) {
  return `你好，${name}`;
}

console.log(hello("世界"));
```
