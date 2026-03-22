const THEME_KEY = "theme";
const POSTS_STORAGE_KEY = "blog_posts_local";
const DEFAULT_POSTS_FILE = "./posts/posts.json";

// ============ Storage Management ============
class PostStorage {
  static getPosts() {
    try {
      const stored = localStorage.getItem(POSTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static setPosts(posts) {
    try {
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    } catch {}
  }

  static addPost(post) {
    const posts = this.getPosts();
    posts.push(post);
    this.setPosts(posts);
    return post;
  }

  static updatePost(slug, updates) {
    const posts = this.getPosts();
    const index = posts.findIndex((p) => p.slug === slug);
    if (index === -1) throw new Error("Post not found");
    posts[index] = { ...posts[index], ...updates };
    this.setPosts(posts);
    return posts[index];
  }

  static deletePost(slug) {
    const posts = this.getPosts();
    const filtered = posts.filter((p) => p.slug !== slug);
    this.setPosts(filtered);
  }

  static getPost(slug) {
    return this.getPosts().find((p) => p.slug === slug);
  }
}

// ============ Utility Functions ============
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

function getPreferredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(d);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function fetchJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return await res.json();
}

async function fetchText(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return await res.text();
}

function renderTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return "";
  return tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("");
}

function normalizeForSearch(s) {
  return String(s ?? "").trim().toLowerCase();
}

function isIndexPage() {
  const p = window.location.pathname;
  return p.endsWith("/") || p.endsWith("/index.html") || p.endsWith("index.html");
}

function isPostPage() {
  return window.location.pathname.endsWith("/post.html") || window.location.pathname.endsWith("post.html");
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function generateUniqueSlug(baseSlug, existingPosts) {
  let slug = baseSlug;
  let counter = 1;
  while (existingPosts.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

// ============ Modal Management ============
class PostModal {
  constructor() {
    this.modal = document.getElementById("postModal");
    this.overlay = document.getElementById("modalOverlay");
    this.titleInput = document.getElementById("postTitleInput");
    this.excerptInput = document.getElementById("postExcerptInput");
    this.contentInput = document.getElementById("postContentInput");
    this.tagsInput = document.getElementById("postTagsInput");
    this.saveBtn = document.getElementById("modalSave");
    this.cancelBtn = document.getElementById("modalCancel");
    this.closeBtn = document.getElementById("modalClose");
    this.modalTitle = document.getElementById("modalTitle");
    this.editingSlug = null;
    this.onSaveCallback = null;

    if (this.saveBtn) this.saveBtn.addEventListener("click", () => this.save());
    if (this.cancelBtn) this.cancelBtn.addEventListener("click", () => this.close());
    if (this.closeBtn) this.closeBtn.addEventListener("click", () => this.close());
    if (this.overlay) this.overlay.addEventListener("click", () => this.close());
  }

  open(editingPost = null) {
    if (!this.modal) return;
    this.editingSlug = editingPost?.slug || null;
    this.modalTitle.textContent = editingPost ? "编辑文章" : "新建文章";

    if (editingPost) {
      this.titleInput.value = editingPost.title || "";
      this.excerptInput.value = editingPost.excerpt || "";
      this.contentInput.value = editingPost.content || "";
      this.tagsInput.value = (editingPost.tags || []).join(", ");
    } else {
      this.titleInput.value = "";
      this.excerptInput.value = "";
      this.contentInput.value = "";
      this.tagsInput.value = "";
    }

    this.modal.style.display = "flex";
    this.titleInput.focus();
  }

  close() {
    if (!this.modal) return;
    this.modal.style.display = "none";
    this.editingSlug = null;
  }

  save() {
    const title = this.titleInput.value.trim();
    const excerpt = this.excerptInput.value.trim();
    const content = this.contentInput.value.trim();
    const tagsStr = this.tagsInput.value.trim();
    const tags = tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter((t) => t) : [];

    if (!title || !content) {
      alert("标题和内容不能为空");
      return;
    }

    const post = {
      title,
      excerpt: excerpt || title,
      content,
      tags,
      date: this.editingSlug ? this.getEditingPostDate() : new Date().toISOString().split("T")[0],
    };

    if (this.onSaveCallback) {
      this.onSaveCallback(post, this.editingSlug);
    }
    this.close();
  }

  getEditingPostDate() {
    if (!this.editingSlug) return new Date().toISOString().split("T")[0];
    const editingPost = PostStorage.getPost(this.editingSlug);
    return editingPost?.date || new Date().toISOString().split("T")[0];
  }

  setOnSaveCallback(fn) {
    this.onSaveCallback = fn;
  }
}

// ============ Index Page ============
async function initIndex() {
  const listEl = document.getElementById("postsList");
  const metaEl = document.getElementById("postsMeta");
  const searchEl = document.getElementById("searchInput");
  const newPostBtn = document.getElementById("newPostBtn");
  if (!listEl || !metaEl) return;

  const modal = new PostModal();

  // Load posts from both sources
  let dbPosts = [];
  try {
    dbPosts = await fetchJson(DEFAULT_POSTS_FILE);
  } catch (e) {
    // File might not exist, continue with empty array
  }
  dbPosts = Array.isArray(dbPosts) ? dbPosts : [];

  const localPosts = PostStorage.getPosts();

  // Merge: local posts override db posts with same slug
  const allPosts = [...dbPosts];
  for (const localPost of localPosts) {
    const existingIndex = allPosts.findIndex((p) => p.slug === localPost.slug);
    if (existingIndex === -1) {
      allPosts.push(localPost);
    } else {
      allPosts[existingIndex] = { ...allPosts[existingIndex], ...localPost };
    }
  }

  allPosts.sort((a, b) => String(b?.date ?? "").localeCompare(String(a?.date ?? "")));

  const render = (q) => {
    const query = normalizeForSearch(q);
    const filtered = query
      ? allPosts.filter((p) => {
          const t = normalizeForSearch(p?.title);
          const ex = normalizeForSearch(p?.excerpt);
          const tags = Array.isArray(p?.tags) ? p.tags.map(normalizeForSearch).join(" ") : "";
          return t.includes(query) || ex.includes(query) || tags.includes(query);
        })
      : allPosts;

    metaEl.textContent = `共 ${filtered.length} 篇文章`;
    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="muted">没有找到匹配的文章。</div>`;
      return;
    }

    listEl.innerHTML = filtered
      .map((p) => {
        const slug = encodeURIComponent(p.slug || "");
        const href = `./post.html?slug=${slug}`;
        const date = formatDate(p.date);
        const tagsHtml = renderTags(p.tags);
        const isLocal = localPosts.some((lp) => lp.slug === p.slug);
        const badge = isLocal ? '<span class="badge" style="background: rgba(124, 58, 237, 0.2); border-color: rgba(124, 58, 237, 0.4);">本地</span>' : "";

        return `
          <div class="post-card-container">
            <a class="post-card" href="${href}">
              <div class="meta-row">
                <span class="badge">${escapeHtml(date)}</span>
                <span class="tags">${tagsHtml}</span>
                ${badge}
              </div>
              <h3 class="post-title">${escapeHtml(p.title || "未命名")}</h3>
              <p class="post-excerpt">${escapeHtml(p.excerpt || "")}</p>
            </a>
            ${isLocal ? `<div class="post-card-actions">
              <button class="btn" data-action="edit" data-slug="${escapeHtml(p.slug)}">编辑</button>
              <button class="btn" data-action="delete" data-slug="${escapeHtml(p.slug)}">删除</button>
            </div>` : ""}
          </div>
        `;
      })
      .join("");

    // Add event listeners for edit/delete buttons
    document.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const slug = btn.dataset.slug;
        const post = allPosts.find((p) => p.slug === slug);
        if (post) {
          modal.open(post);
        }
      });
    });

    document.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const slug = btn.dataset.slug;
        if (confirm("确定要删除这篇文章吗？")) {
          PostStorage.deletePost(slug);
          const newAllPosts = allPosts.filter((p) => p.slug !== slug);
          allPosts.length = 0;
          allPosts.push(...newAllPosts);
          render(searchEl.value);
        }
      });
    });
  };

  // Setup modal save callback
  modal.setOnSaveCallback((post, editingSlug) => {
    if (editingSlug) {
      // Update
      const existing = allPosts.find((p) => p.slug === editingSlug);
      if (existing) {
        PostStorage.updatePost(editingSlug, post);
        Object.assign(existing, post);
        allPosts.sort((a, b) => String(b?.date ?? "").localeCompare(String(a?.date ?? "")));
      }
    } else {
      // Create
      const baseSlug = generateSlug(post.title);
      const slug = generateUniqueSlug(baseSlug, allPosts);
      const fullPost = { ...post, slug };
      PostStorage.addPost(fullPost);
      allPosts.push(fullPost);
      allPosts.sort((a, b) => String(b?.date ?? "").localeCompare(String(a?.date ?? "")));
    }
    render(searchEl.value);
  });

  // Setup new post button
  if (newPostBtn) {
    newPostBtn.addEventListener("click", () => {
      modal.open();
    });
  }

  render("");
  if (searchEl) {
    searchEl.addEventListener("input", () => render(searchEl.value));
  }
}

// ============ Post Page ============
async function initPost() {
  const titleEl = document.getElementById("postTitle");
  const dateEl = document.getElementById("postDate");
  const tagsEl = document.getElementById("postTags");
  const bodyEl = document.getElementById("postBody");
  const editBtn = document.getElementById("editPostBtn");
  const deleteBtn = document.getElementById("deletePostBtn");
  if (!titleEl || !dateEl || !tagsEl || !bodyEl) return;

  const slug = getQueryParam("slug");
  if (!slug) {
    titleEl.textContent = "缺少 slug 参数";
    bodyEl.innerHTML = `<p class="muted">请从首页点击文章进入。</p>`;
    return;
  }

  // Load posts from both sources
  let dbPosts = [];
  try {
    dbPosts = await fetchJson(DEFAULT_POSTS_FILE);
  } catch (e) {
    // File might not exist
  }
  dbPosts = Array.isArray(dbPosts) ? dbPosts : [];

  const localPosts = PostStorage.getPosts();
  const allPosts = [...dbPosts];
  for (const localPost of localPosts) {
    const existingIndex = allPosts.findIndex((p) => p.slug === localPost.slug);
    if (existingIndex === -1) {
      allPosts.push(localPost);
    } else {
      allPosts[existingIndex] = { ...allPosts[existingIndex], ...localPost };
    }
  }

  let post = allPosts.find((p) => String(p?.slug) === String(slug));
  const isLocal = localPosts.some((p) => p.slug === slug);

  if (!post) {
    titleEl.textContent = "文章不存在";
    bodyEl.innerHTML = `<p class="muted">找不到 slug 为 <code>${escapeHtml(slug)}</code> 的文章。</p>`;
    if (editBtn) editBtn.style.display = "none";
    if (deleteBtn) deleteBtn.style.display = "none";
    return;
  }

  const renderPost = () => {
    titleEl.textContent = post.title || "未命名";
    dateEl.textContent = formatDate(post.date) || "—";
    tagsEl.innerHTML = renderTags(post.tags);
    document.title = `${post.title || "文章"} - 我的博客`;

    let content = post.content || "";

    // If it's from markdown file, fetch it
    if (!content && !isLocal) {
      const mdPath = post.file || `./posts/${slug}.md`;
      fetchText(mdPath)
        .then((md) => {
          if (window.marked) {
            window.marked.setOptions({
              gfm: true,
              breaks: false,
              mangle: false,
              headerIds: true,
            });
            bodyEl.innerHTML = window.marked.parse(md);
          } else {
            bodyEl.textContent = md;
          }
          highlightCode();
        })
        .catch(() => {
          const mdPath = post.file || `./posts/${slug}.md`;
          bodyEl.innerHTML = `<p class="muted">加载文章内容失败：<code>${escapeHtml(mdPath)}</code></p>`;
        });
    } else {
      // Plain text content
      bodyEl.textContent = content;
    }
  };

  const highlightCode = () => {
    if (window.hljs) {
      bodyEl.querySelectorAll("pre code").forEach((block) => {
        try {
          window.hljs.highlightElement(block);
        } catch {}
      });
    }
  };

  // Show/hide edit and delete buttons
  if (editBtn && deleteBtn) {
    if (isLocal) {
      editBtn.style.display = "inline-block";
      deleteBtn.style.display = "inline-block";
    } else {
      editBtn.style.display = "none";
      deleteBtn.style.display = "none";
    }
  }

  if (editBtn || deleteBtn) {
    const modal = new PostModal();

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        modal.open(post);
      });
    }

    modal.setOnSaveCallback((updated, editingSlug) => {
      PostStorage.updatePost(slug, updated);
      post = { ...post, ...updated };
      renderPost();
      highlightCode();
    });

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (confirm("确定要删除这篇文章吗？")) {
          PostStorage.deletePost(slug);
          window.location.href = "./index.html";
        }
      });
    }
  }

  renderPost();
}

function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const apply = (t) => {
    setTheme(t);
    btn.textContent = t === "light" ? "浅色" : "深色";
  };

  apply(getPreferredTheme());
  btn.addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme;
    apply(cur === "light" ? "dark" : "light");
  });
}

function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initThemeToggle();
  if (isIndexPage()) initIndex();
  if (isPostPage()) initPost();
});

