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
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  // Update theme toggle icon
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = theme === "light" ? "light_mode" : "dark_mode";
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
  return tags
    .map((t) => `<span class="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">#${escapeHtml(t)}</span>`)
    .join("");
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

function isAboutPage() {
  return window.location.pathname.endsWith("/about.html") || window.location.pathname.endsWith("about.html");
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

// Card gradient presets for variety
const CARD_GRADIENTS = [
  "from-[#2b1b4d] via-[#1d1b1f] to-[#352100]",
  "from-[#354487] via-[#1d1b1f] to-[#2b1b4d]",
  "from-[#352100] via-[#1d1b1f] to-[#354487]",
  "from-[#2b292d] via-[#1d1b1f] to-[#2b1b4d]",
  "from-[#1d1b1f] via-[#354487] to-[#352100]",
  "from-[#2b1b4d] via-[#352100] to-[#1d1b1f]",
];

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
      listEl.innerHTML = `<div class="col-span-full text-on-surface-variant/50 italic text-center py-12">没有找到匹配的文章。</div>`;
      return;
    }

    listEl.innerHTML = filtered
      .map((p, i) => {
        const slug = encodeURIComponent(p.slug || "");
        const href = `./post.html?slug=${slug}`;
        const date = formatDate(p.date);
        const tagsHtml = renderTags(p.tags);
        const isLocal = localPosts.some((lp) => lp.slug === p.slug);
        const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
        const staggerOffset = (i % 3 === 1) ? "lg:mt-8" : "";

        return `
          <article class="poster-card group cursor-pointer relative ${staggerOffset}">
            <a href="${href}" class="block no-underline">
              <div class="poster-glow aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br ${gradient} relative border border-outline-variant/10">
                <div class="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-[#141316]/95 via-[#141316]/40 to-transparent">
                  <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span class="text-xs font-semibold text-tertiary tracking-widest uppercase">${escapeHtml(date)}</span>
                    ${isLocal ? '<span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary border border-primary/30">本地</span>' : ""}
                  </div>
                  <h3 class="font-headline text-lg md:text-xl font-semibold text-on-surface leading-tight group-hover:text-primary transition-colors duration-300 mb-2">${escapeHtml(p.title || "未命名")}</h3>
                  <div class="h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-500 mb-2"></div>
                  <p class="text-on-surface-variant text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-2">${escapeHtml(p.excerpt || "")}</p>
                  <div class="flex gap-1.5 flex-wrap">${tagsHtml}</div>
                </div>
              </div>
            </a>
            ${isLocal ? `<div class="flex gap-2 mt-2 px-1">
              <button class="bg-surface-container-high text-on-surface-variant hover:text-primary px-3 py-1 rounded-full text-xs font-semibold border border-outline-variant/30 hover:border-primary/30 transition-all cursor-pointer" data-action="edit" data-slug="${escapeHtml(p.slug)}">编辑</button>
              <button class="bg-surface-container-high text-on-surface-variant hover:text-error px-3 py-1 rounded-full text-xs font-semibold border border-outline-variant/30 hover:border-error/30 transition-all cursor-pointer" data-action="delete" data-slug="${escapeHtml(p.slug)}">删除</button>
            </div>` : ""}
          </article>
        `;
      })
      .join("");

    // Add event listeners for edit/delete buttons
    document.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
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
        e.stopPropagation();
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

    // Poster card perspective tilt effect
    document.querySelectorAll(".poster-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        const glow = card.querySelector(".poster-glow");
        if (glow) {
          glow.style.transform = `perspective(1000px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
      });
      card.addEventListener("mouseleave", () => {
        const glow = card.querySelector(".poster-glow");
        if (glow) {
          glow.style.transform = "perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)";
        }
      });
    });
  };

  // Setup modal save callback
  modal.setOnSaveCallback((post, editingSlug) => {
    if (editingSlug) {
      const existing = allPosts.find((p) => p.slug === editingSlug);
      if (existing) {
        PostStorage.updatePost(editingSlug, post);
        Object.assign(existing, post);
        allPosts.sort((a, b) => String(b?.date ?? "").localeCompare(String(a?.date ?? "")));
      }
    } else {
      const baseSlug = generateSlug(post.title);
      const slug = generateUniqueSlug(baseSlug, allPosts);
      const fullPost = { ...post, slug };
      PostStorage.addPost(fullPost);
      allPosts.push(fullPost);
      allPosts.sort((a, b) => String(b?.date ?? "").localeCompare(String(a?.date ?? "")));
    }
    render(searchEl.value);
  });

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
    bodyEl.innerHTML = `<p class="text-on-surface-variant/50 italic">请从首页点击文章进入。</p>`;
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
    bodyEl.innerHTML = `<p class="text-on-surface-variant/50 italic">找不到 slug 为 <code class="font-mono text-sm bg-surface-container-high px-2 py-0.5 rounded">${escapeHtml(slug)}</code> 的文章。</p>`;
    return;
  }

  const renderPost = () => {
    titleEl.textContent = post.title || "未命名";
    dateEl.innerHTML = `<span class="material-symbols-outlined text-sm">calendar_today</span> ${formatDate(post.date) || "—"}`;
    tagsEl.innerHTML = renderTags(post.tags);
    document.title = `${post.title || "文章"} - 拂烟`;

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
          bodyEl.innerHTML = `<p class="text-on-surface-variant/50 italic">加载文章内容失败：<code class="font-mono text-sm">${escapeHtml(mdPath)}</code></p>`;
        });
    } else {
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
      editBtn.classList.remove("hidden");
      deleteBtn.classList.remove("hidden");
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

// ============ Theme Toggle ============
function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const theme = getPreferredTheme();
  setTheme(theme);

  btn.addEventListener("click", () => {
    const cur = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(cur === "light" ? "dark" : "light");
  });
}

// ============ Year ============
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

// ============ Init ============
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initThemeToggle();
  if (isIndexPage()) initIndex();
  if (isPostPage()) initPost();
});
