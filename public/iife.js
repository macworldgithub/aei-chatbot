/**
 * AEI Payment Solutions — Chatbot Widget v2 (IIFE)
 * Embed: <link rel="stylesheet" href="iife.css">
 *        <script src="iife.js" data-api="https://your-server.com"></script>
 *
 * data-api      → backend base URL  (default: same origin)
 * data-title    → header name       (default: "AEI Support")
 * data-subtitle → header sub-line   (default: "Typically replies instantly")
 */
(function () {
  "use strict";

  /* ─── Config ─────────────────────────────────────────────── */
  const _script =
    document.currentScript ||
    (function () {
      const s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();

  const CFG = {
    api:      (_script && _script.getAttribute("data-api"))      || "",
    title:    (_script && _script.getAttribute("data-title"))    || "AEI Support",
    subtitle: (_script && _script.getAttribute("data-subtitle")) || "Typically replies instantly",
  };

  /* ─── State ──────────────────────────────────────────────── */
  let open        = false;
  let loading     = false;
  let unread      = 0;
  let history     = [];           // [{role, content}]

  /* ─── Constants ──────────────────────────────────────────── */
  const WELCOME =
    "👋 Hi there! I'm the AEI virtual assistant. I can help you with payment processing, equipment, pricing, funding, and more.\n\nWhat can I help you with today?";

  const QR = [
    "Check my processing rates",
    "How do I switch processors?",
    "Business funding options",
    "Request a free quote",
  ];

  /* ─── SVG icons ──────────────────────────────────────────── */
  const IC = {
    chat: `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>`,
    close:`<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    send: `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
    bot:  `<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7H4a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2M7 14v2h2v-2H7m8 0v2h2v-2h-2M4 19c0 1.11.89 2 2 2h12a2 2 0 002-2v-2H4v2z"/></svg>`,
    user: `<svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`,
    info: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
  };

  /* ─── Helpers ────────────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function hms() {
    return new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  }

  function $(id) { return document.getElementById(id); }

  /* ─── Build DOM ──────────────────────────────────────────── */
  function build() {
    const root = document.createElement("div");
    root.id = "aei-chat-root";

    /* ── Bubble ── */
    root.innerHTML = `
      <button id="aei-chat-bubble" aria-label="Open chat support" aria-expanded="false">
        <svg id="aei-bubble-icon" viewBox="0 0 24 24">${IC.chat}</svg>
        <span id="aei-unread-badge" aria-hidden="true"></span>
      </button>

      <div id="aei-chat-window" role="dialog" aria-label="AEI Payment Solutions Chat">

        <!-- Header -->
        <div id="aei-chat-header">
          <div id="aei-header-avatar">${IC.bot}</div>
          <div id="aei-header-text">
            <div id="aei-header-name">${esc(CFG.title)}</div>
            <div id="aei-header-sub">${esc(CFG.subtitle)}</div>
          </div>
          <div id="aei-header-actions">
            <button id="aei-chat-close" aria-label="Close chat">${IC.close}</button>
          </div>
        </div>

        <!-- Intro banner -->
        <div id="aei-intro-banner">
          <div id="aei-intro-icon">${IC.info}</div>
          <div id="aei-intro-text">
            <strong>AEI Payment Solutions</strong>
            Ask about rates, equipment, funding, switching processors &amp; more.
          </div>
        </div>

        <!-- Messages -->
        <div id="aei-messages" role="log" aria-live="polite">
          <div class="aei-date-divider"><span>Today</span></div>
        </div>

        <!-- Typing -->
        <div id="aei-typing" aria-hidden="true">
          <div class="aei-av">${IC.bot}</div>
          <div class="aei-typing-bubble">
            <span></span><span></span><span></span>
          </div>
        </div>

        <!-- Quick replies -->
        <div id="aei-quick-replies"></div>

        <!-- Input -->
        <div id="aei-input-area">
          <textarea
            id="aei-input"
            rows="1"
            maxlength="800"
            placeholder="Type a message…"
            aria-label="Chat message input"
          ></textarea>
          <button id="aei-send-btn" aria-label="Send message">${IC.send}</button>
        </div>

        <!-- Footer -->
        <div id="aei-footer">Powered by <strong>AEI Payment Solutions</strong></div>

      </div>`;

    document.body.appendChild(root);
  }

  /* ─── Append a message ───────────────────────────────────── */
  function addMsg(role, text) {
    const msgs = $("aei-messages");
    const isBot = role === "assistant";

    const row = document.createElement("div");
    row.className = `aei-msg-row ${isBot ? "bot" : "user"}`;

    const av = document.createElement("div");
    av.className = "aei-av";
    av.innerHTML = isBot ? IC.bot : IC.user;

    const wrap = document.createElement("div");
    wrap.className = "aei-bwrap";

    const bub = document.createElement("div");
    bub.className = "aei-bubble";
    bub.innerHTML = esc(text).replace(/\n/g, "<br>");

    const ts = document.createElement("div");
    ts.className = "aei-ts";
    ts.textContent = hms();

    wrap.appendChild(bub);
    wrap.appendChild(ts);

    if (isBot) { row.appendChild(av); row.appendChild(wrap); }
    else        { row.appendChild(wrap); row.appendChild(av); }

    msgs.appendChild(row);
    scrollBottom();

    /* unread badge when closed */
    if (!open && isBot) {
      unread++;
      const badge = $("aei-unread-badge");
      badge.textContent = unread > 9 ? "9+" : unread;
      badge.classList.add("show");
    }
  }

  function scrollBottom() {
    const m = $("aei-messages");
    if (m) m.scrollTop = m.scrollHeight;
  }

  /* ─── Quick replies ──────────────────────────────────────── */
  function showQR(yes) {
    const c = $("aei-quick-replies");
    c.innerHTML = "";
    if (!yes) return;
    QR.forEach(label => {
      const b = document.createElement("button");
      b.className = "aei-qr";
      b.textContent = label;
      b.addEventListener("click", () => { c.innerHTML = ""; send(label); });
      c.appendChild(b);
    });
  }

  /* ─── Typing indicator ───────────────────────────────────── */
  function setTyping(show) {
    const t = $("aei-typing");
    const m = $("aei-messages");
    if (show) { t.classList.add("show"); m.after(t); }
    else       { t.classList.remove("show"); }
    scrollBottom();
  }

  /* ─── Send message ───────────────────────────────────────── */
  async function send(text) {
    text = (text || "").trim();
    if (!text || loading) return;

    const inp = $("aei-input");
    const btn = $("aei-send-btn");

    if (inp) { inp.value = ""; resize(inp); }

    addMsg("user", text);
    history.push({ role:"user", content:text });

    loading = true;
    if (btn) btn.disabled = true;
    setTyping(true);
    showQR(false);

    try {
      const res = await fetch(`${CFG.api}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-20) }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.reply || "I'm sorry, I didn't catch that. Please try again.";

      history.push({ role:"assistant", content:reply });
      setTyping(false);
      addMsg("assistant", reply);

    } catch (e) {
      console.error("[AEI Chat]", e);
      setTyping(false);
      addMsg("assistant", "I'm having trouble connecting right now. Please try again in a moment or call us directly.");
    } finally {
      loading = false;
      if (btn) btn.disabled = false;
      if (inp) inp.focus();
    }
  }

  /* ─── Textarea auto-resize ───────────────────────────────── */
  function resize(ta) {
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 96) + "px";
  }

  /* ─── Open / Close ───────────────────────────────────────── */
  function openChat() {
    open = true;
    const win    = $("aei-chat-window");
    const bubble = $("aei-chat-bubble");
    if (win)    win.classList.add("open");
    if (bubble) {
      bubble.classList.add("hidden");       // ← hide bubble
      bubble.setAttribute("aria-expanded","true");
    }

    /* clear unread */
    unread = 0;
    const badge = $("aei-unread-badge");
    if (badge) badge.classList.remove("show");

    setTimeout(() => {
      const inp = $("aei-input");
      if (inp) inp.focus();
      scrollBottom();
    }, 280);
  }

  function closeChat() {
    open = false;
    const win    = $("aei-chat-window");
    const bubble = $("aei-chat-bubble");
    if (win)    win.classList.remove("open");
    if (bubble) {
      bubble.classList.remove("hidden");    // ← restore bubble
      bubble.setAttribute("aria-expanded","false");
    }
  }

  /* ─── Events ─────────────────────────────────────────────── */
  function bind() {
    $("aei-chat-bubble").addEventListener("click", () => open ? closeChat() : openChat());
    $("aei-chat-close").addEventListener("click", closeChat);

    const inp = $("aei-input");
    const btn = $("aei-send-btn");

    btn.addEventListener("click", () => send(inp.value));
    inp.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(inp.value); }
    });
    inp.addEventListener("input", () => resize(inp));

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && open) closeChat();
    });
  }

  /* ─── Init ───────────────────────────────────────────────── */
  function init() {
    build();
    bind();
    /* Welcome message */
    setTimeout(() => {
      addMsg("assistant", WELCOME);
      setTimeout(() => showQR(true), 350);
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
