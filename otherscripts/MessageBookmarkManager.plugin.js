/**
 * @name MessageBookmarkManager
 * @author GPT-5.3-Codex
 * @version 1.0.0
 * @description Bookmark Discord messages with notes/tags and manage them in a polished local dashboard.
 */

module.exports = class MessageBookmarkManager {
  constructor() {
    this.pluginName = "MessageBookmarkManager";
    this.styleId = "mbm-styles";
    this.modalId = "mbm-modal";
    this.buttonId = "mbm-float-btn";
    this.settingsKey = "settings";
    this.dataKey = "bookmarks";
    this.unpatches = [];
    this.observer = null;
    this.handlers = [];

    this.defaultSettings = {
      compactMode: false,
      previewLength: 180,
      confirmDelete: true,
      floatingButton: true,
      autoTagServer: true
    };

    this.settings = this.loadSettings();
    this.bookmarks = this.loadBookmarks();
  }

  start() {
    this.injectStyles();
    this.patchMessageContextMenu();
    this.installObserverFallback();
    this.renderFloatingButton();
    BdApi.UI.showToast("MessageBookmarkManager started", {type: "success"});
  }

  stop() {
    this.unpatches.forEach((u) => { try { u(); } catch (_) {} });
    this.unpatches = [];
    if (this.observer) this.observer.disconnect();
    this.observer = null;
    this.cleanupHandlers();
    this.removeDashboard();
    this.removeFloatingButton();
    BdApi.DOM.removeStyle(this.styleId);
  }

  loadSettings() {
    return Object.assign({}, this.defaultSettings, BdApi.Data.load(this.pluginName, this.settingsKey) || {});
  }

  saveSettings() {
    BdApi.Data.save(this.pluginName, this.settingsKey, this.settings);
  }

  loadBookmarks() {
    const raw = BdApi.Data.load(this.pluginName, this.dataKey);
    return Array.isArray(raw) ? raw : [];
  }

  saveBookmarks() {
    BdApi.Data.save(this.pluginName, this.dataKey, this.bookmarks);
  }

  patchMessageContextMenu() {
    const ContextMenu = BdApi.ContextMenu;
    if (!ContextMenu || !ContextMenu.patch) return;

    const unpatch = ContextMenu.patch("message", (menu, props) => {
      if (!menu || !props?.message) return;
      const item = ContextMenu.buildItem({
        label: "Save Bookmark",
        action: () => this.promptAndSaveBookmark(props.message)
      });
      menu.props.children = this.appendMenuItem(menu.props.children, item);
    });
    this.unpatches.push(unpatch);
  }

  installObserverFallback() {
    this.observer = new MutationObserver(() => {
      if (this.settings.floatingButton && !document.getElementById(this.buttonId)) {
        this.renderFloatingButton();
      }
    });
    this.observer.observe(document.body, {childList: true, subtree: true});
  }

  appendMenuItem(children, item) {
    if (Array.isArray(children)) return [...children, item];
    return [children, item].filter(Boolean);
  }

  promptAndSaveBookmark(message) {
    const existing = this.bookmarks.find((b) => b.messageId === message.id);
    const note = prompt("Optional note for bookmark:", existing?.note || "") ?? "";
    const tagInput = prompt("Optional tags (comma-separated):", existing ? existing.tags.join(", ") : "") ?? "";
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);

    if (existing) {
      existing.note = note;
      existing.tags = [...new Set(tags)];
      existing.updatedAt = new Date().toISOString();
      this.saveBookmarks();
      BdApi.UI.showToast("Bookmark already existed; note/tags updated.", {type: "info"});
      this.refreshDashboard();
      return;
    }

    const guildId = message.guild_id || message.guildId || null;
    const channelId = message.channel_id || message.channelId || null;
    const author = message.author || {};
    const attachments = Array.isArray(message.attachments) ? message.attachments : [];

    const bookmark = {
      id: `${message.id}-${Date.now()}`,
      messageId: message.id,
      content: String(message.content || ""),
      authorUsername: author.username || "Unknown",
      authorId: author.id || "Unknown",
      channelId,
      guildId,
      messageLink: this.buildMessageLink(guildId, channelId, message.id),
      messageTimestamp: message.timestamp || new Date().toISOString(),
      savedAt: new Date().toISOString(),
      note,
      tags: this.normalizeTags(tags, guildId),
      attachments: attachments.map((a) => ({
        id: a.id,
        filename: a.filename,
        url: a.url,
        size: a.size,
        contentType: a.content_type || a.contentType || ""
      }))
    };

    this.bookmarks.unshift(bookmark);
    this.saveBookmarks();
    BdApi.UI.showToast("Bookmark saved", {type: "success"});
    this.refreshDashboard();
  }

  normalizeTags(tags, guildId) {
    const out = new Set(tags.map((t) => t.toLowerCase()));
    if (this.settings.autoTagServer && guildId) out.add(`server:${guildId}`);
    return [...out];
  }

  buildMessageLink(guildId, channelId, messageId) {
    if (!channelId || !messageId) return "";
    return `https://discord.com/channels/${guildId || "@me"}/${channelId}/${messageId}`;
  }

  renderFloatingButton() {
    this.removeFloatingButton();
    if (!this.settings.floatingButton) return;

    const btn = document.createElement("button");
    btn.id = this.buttonId;
    btn.className = "mbm-float-btn";
    btn.textContent = "★";
    btn.title = "Open Message Bookmark Manager";
    const clickHandler = () => this.openDashboard();
    btn.addEventListener("click", clickHandler);
    this.handlers.push({el: btn, type: "click", fn: clickHandler});
    document.body.appendChild(btn);
  }

  removeFloatingButton() {
    const btn = document.getElementById(this.buttonId);
    if (btn) btn.remove();
  }

  cleanupHandlers() {
    this.handlers.forEach(({el, type, fn}) => { try { el.removeEventListener(type, fn); } catch (_) {} });
    this.handlers = [];
  }

  openDashboard() {
    this.removeDashboard();
    const wrap = document.createElement("div");
    wrap.id = this.modalId;
    wrap.innerHTML = this.dashboardMarkup();
    document.body.appendChild(wrap);

    this.bindDashboardEvents(wrap);
    this.renderBookmarkList(wrap);
  }

  removeDashboard() {
    const el = document.getElementById(this.modalId);
    if (el) el.remove();
  }

  refreshDashboard() {
    const el = document.getElementById(this.modalId);
    if (el) this.renderBookmarkList(el);
  }

  dashboardMarkup() {
    return `
      <div class="mbm-backdrop">
        <div class="mbm-modal ${this.settings.compactMode ? "compact" : ""}">
          <div class="mbm-header">
            <h2>Message Bookmark Manager</h2>
            <button class="mbm-close">✕</button>
          </div>
          <div class="mbm-toolbar">
            <input class="mbm-search" placeholder="Search bookmarks..." />
            <input class="mbm-tag-filter" placeholder="Filter by tag..." />
            <input class="mbm-scope-filter" placeholder="Filter by server/channel id..." />
            <button class="mbm-export">Export JSON</button>
            <button class="mbm-import">Import JSON</button>
            <button class="mbm-clear danger">Clear All</button>
          </div>
          <div class="mbm-settings">
            <label><input type="checkbox" class="mbm-set-compact" ${this.settings.compactMode ? "checked" : ""}/> Compact mode</label>
            <label><input type="checkbox" class="mbm-set-confirm" ${this.settings.confirmDelete ? "checked" : ""}/> Confirm before delete</label>
            <label><input type="checkbox" class="mbm-set-floating" ${this.settings.floatingButton ? "checked" : ""}/> Floating button</label>
            <label><input type="checkbox" class="mbm-set-autotag" ${this.settings.autoTagServer ? "checked" : ""}/> Auto-tag by server id</label>
            <label>Preview length <input type="number" class="mbm-set-preview" min="40" max="1000" value="${this.settings.previewLength}"/></label>
          </div>
          <div class="mbm-list"></div>
        </div>
      </div>`;
  }

  bindDashboardEvents(root) {
    const on = (sel, type, fn) => {
      const el = root.querySelector(sel);
      if (!el) return;
      el.addEventListener(type, fn);
      this.handlers.push({el, type, fn});
    };

    on(".mbm-close", "click", () => this.removeDashboard());
    [".mbm-search", ".mbm-tag-filter", ".mbm-scope-filter"].forEach((sel) => on(sel, "input", () => this.renderBookmarkList(root)));

    on(".mbm-export", "click", () => {
      const blob = new Blob([JSON.stringify(this.bookmarks, null, 2)], {type: "application/json"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "message-bookmarks.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });

    on(".mbm-import", "click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const parsed = JSON.parse(await file.text());
          if (!Array.isArray(parsed)) throw new Error("JSON must be an array");
          this.bookmarks = parsed;
          this.saveBookmarks();
          this.renderBookmarkList(root);
          BdApi.UI.showToast("Bookmarks imported", {type: "success"});
        } catch {
          BdApi.UI.showToast("Import failed", {type: "error"});
        }
      };
      input.click();
    });

    on(".mbm-clear", "click", () => {
      const clear = () => {
        this.bookmarks = [];
        this.saveBookmarks();
        this.renderBookmarkList(root);
      };
      BdApi.UI.showConfirmationModal("Clear all bookmarks?", "This cannot be undone.", {onConfirm: clear});
    });

    on(".mbm-set-compact", "change", (e) => { this.settings.compactMode = e.target.checked; this.saveSettings(); this.openDashboard(); });
    on(".mbm-set-confirm", "change", (e) => { this.settings.confirmDelete = e.target.checked; this.saveSettings(); });
    on(".mbm-set-floating", "change", (e) => { this.settings.floatingButton = e.target.checked; this.saveSettings(); this.renderFloatingButton(); });
    on(".mbm-set-autotag", "change", (e) => { this.settings.autoTagServer = e.target.checked; this.saveSettings(); });
    on(".mbm-set-preview", "change", (e) => {
      const n = Math.max(40, Math.min(1000, Number(e.target.value) || this.defaultSettings.previewLength));
      this.settings.previewLength = n;
      this.saveSettings();
      this.renderBookmarkList(root);
    });
  }

  renderBookmarkList(root) {
    const list = root.querySelector(".mbm-list");
    if (!list) return;

    const q = (root.querySelector(".mbm-search")?.value || "").toLowerCase();
    const tag = (root.querySelector(".mbm-tag-filter")?.value || "").toLowerCase();
    const scope = (root.querySelector(".mbm-scope-filter")?.value || "").toLowerCase();

    const filtered = this.bookmarks.filter((b) => {
      const text = [b.content, b.note, b.authorUsername, ...(b.tags || [])].join(" ").toLowerCase();
      const tagMatch = !tag || (b.tags || []).some((t) => t.toLowerCase().includes(tag));
      const scopeText = `${b.guildId || ""} ${b.channelId || ""}`.toLowerCase();
      const scopeMatch = !scope || scopeText.includes(scope);
      return (!q || text.includes(q)) && tagMatch && scopeMatch;
    });

    if (!filtered.length) {
      list.innerHTML = `<div class="mbm-empty">No bookmarks found.</div>`;
      return;
    }

    list.innerHTML = filtered.map((b) => this.cardMarkup(b)).join("");
    list.querySelectorAll(".mbm-card").forEach((card) => {
      const id = card.dataset.id;
      const bookmark = this.bookmarks.find((x) => x.id === id);
      if (!bookmark) return;

      card.querySelector(".jump")?.addEventListener("click", () => window.open(bookmark.messageLink, "_blank"));
      card.querySelector(".copy")?.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(bookmark.messageLink || ""); BdApi.UI.showToast("Link copied", {type: "success"}); }
        catch { BdApi.UI.showToast("Copy failed", {type: "error"}); }
      });
      card.querySelector(".edit")?.addEventListener("click", () => {
        const note = prompt("Edit note:", bookmark.note || "") ?? bookmark.note;
        const tags = prompt("Edit tags (comma-separated):", (bookmark.tags || []).join(", ")) ?? (bookmark.tags || []).join(", ");
        bookmark.note = note;
        bookmark.tags = [...new Set(tags.split(",").map((t) => t.trim()).filter(Boolean))];
        bookmark.updatedAt = new Date().toISOString();
        this.saveBookmarks();
        this.renderBookmarkList(root);
      });
      card.querySelector(".delete")?.addEventListener("click", () => {
        const doDelete = () => {
          this.bookmarks = this.bookmarks.filter((x) => x.id !== bookmark.id);
          this.saveBookmarks();
          this.renderBookmarkList(root);
        };
        if (this.settings.confirmDelete) {
          BdApi.UI.showConfirmationModal("Delete bookmark?", "This action cannot be undone.", {onConfirm: doDelete});
        } else doDelete();
      });
    });
  }

  cardMarkup(b) {
    const preview = (b.content || "").slice(0, this.settings.previewLength);
    const tags = (b.tags || []).map((t) => `<span class="mbm-tag">${this.escape(t)}</span>`).join(" ");
    return `
      <div class="mbm-card" data-id="${this.escape(b.id)}">
        <div class="mbm-card-top">
          <strong>${this.escape(b.authorUsername)}</strong>
          <span>${this.formatDate(b.messageTimestamp)}</span>
        </div>
        <div class="mbm-preview">${this.escape(preview || "(no message text)")}</div>
        <div class="mbm-meta">Guild: ${this.escape(b.guildId || "DM")} · Channel: ${this.escape(b.channelId || "Unknown")} · Saved: ${this.formatDate(b.savedAt)} · Attachments: ${(b.attachments || []).length}</div>
        <div class="mbm-note">Note: ${this.escape(b.note || "—")}</div>
        <div class="mbm-tags">${tags || "<span class='mbm-tag'>No tags</span>"}</div>
        <div class="mbm-actions">
          <button class="jump">Jump</button>
          <button class="copy">Copy Link</button>
          <button class="edit">Edit</button>
          <button class="delete danger">Delete</button>
        </div>
      </div>`;
  }

  formatDate(v) { return v ? new Date(v).toLocaleString() : "Unknown"; }
  escape(s) { return String(s).replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }

  injectStyles() {
    BdApi.DOM.addStyle(this.styleId, `
      .mbm-float-btn{position:fixed;right:20px;bottom:120px;z-index:10000;background:#5865f2;color:#fff;border:none;border-radius:999px;width:46px;height:46px;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.35);transition:.2s;}
      .mbm-float-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}
      #${this.modalId} .mbm-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px}
      #${this.modalId} .mbm-modal{width:min(1120px,95vw);max-height:92vh;overflow:auto;background:#1f2329;color:#e7eaf0;border:1px solid #2f3440;border-radius:14px;padding:16px;box-shadow:0 20px 60px rgba(0,0,0,.45)}
      #${this.modalId} .mbm-modal.compact .mbm-card{padding:10px}
      .mbm-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
      .mbm-toolbar,.mbm-settings{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-bottom:10px}
      .mbm-toolbar input,.mbm-settings input[type='number'],.mbm-toolbar button,.mbm-close,.mbm-actions button{background:#2a2f3a;color:#f1f3f8;border:1px solid #3a4150;border-radius:8px;padding:8px 10px}
      .mbm-list{display:grid;gap:10px}
      .mbm-card{background:#252b36;border:1px solid #333b49;border-radius:12px;padding:14px;transition:.2s}
      .mbm-card:hover{border-color:#4b5568;transform:translateY(-1px)}
      .mbm-card-top{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px}
      .mbm-preview{line-height:1.4;margin-bottom:6px}
      .mbm-meta,.mbm-note{font-size:12px;opacity:.9;margin-bottom:6px}
      .mbm-tag{display:inline-block;background:#3d4352;border:1px solid #535e74;padding:2px 8px;border-radius:999px;font-size:11px;margin:0 4px 4px 0}
      .mbm-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
      .danger{background:#5a2630 !important;border-color:#8d3a4a !important}
      .mbm-empty{text-align:center;padding:30px;background:#252b36;border-radius:10px;border:1px dashed #465065}
    `);
  }
};
