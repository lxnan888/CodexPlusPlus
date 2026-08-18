(() => {
  // Codex++：关闭 Composer 输入框毛玻璃
  // 修复 Chromium/Windows 合成环境下 backdrop-filter 被渲染成青色的问题
  if (!window.__CODEX_PLUS_COMPOSER_BLUR_FIX__) return;
  const STYLE_ID = "codex-plus-composer-blur-fix";
  const CSS_TEXT = [
    // 精确类名（当前 Codex 版本）
    "._ComposerLayoutBody_f4zzl_2 {",
    "  backdrop-filter: none !important;",
    "  -webkit-backdrop-filter: none !important;",
    "}",
    // 兜底：类名哈希随 Codex 更新可能变化，按前缀匹配防止失效
    '[class*="ComposerLayoutBody"] {',
    "  backdrop-filter: none !important;",
    "  -webkit-backdrop-filter: none !important;",
    "}",
  ].join("\n");

  // 已打过 inline 样式的元素记账，避免轮询时重复赋值
  const patched = new WeakSet();

  // 1. 确保 style 标签存在（DOM 重建后可能被清掉，需要重建）
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    (document.head || document.documentElement).appendChild(style);
  }

  // 2. 给匹配元素直接设 inline 样式（元素重建后立即生效，不受样式表丢失影响）
  function patchElement(el) {
    if (patched.has(el)) return;
    if (el.style.backdropFilter !== "none") el.style.backdropFilter = "none";
    if (el.style.webkitBackdropFilter !== "none") el.style.webkitBackdropFilter = "none";
    patched.add(el);
  }

  function patchElements() {
    document.querySelectorAll('[class*="ComposerLayoutBody"]').forEach(patchElement);
  }

  ensureStyle();
  patchElements();

  // 3. DOM 观察者：界面重建（切换对话等）后立即修复，正常情况零延迟
  const observer = new MutationObserver((mutations) => {
    ensureStyle();
    // 只在新增节点里出现 composer 相关元素时才做修补，避免聊天流式输出时频繁全扫
    let needsPatch = false;
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) {
        if (
          node.nodeType === 1 &&
          (node.matches?.('[class*="ComposerLayoutBody"]') ||
            node.querySelector?.('[class*="ComposerLayoutBody"]'))
        ) {
          needsPatch = true;
          break;
        }
      }
      if (needsPatch) break;
    }
    if (needsPatch) patchElements();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // 4. 轮询兜底：观察者可能因页面 JS 上下文重置等极端情况失效，
  //    250ms 间隔自检自愈（WeakSet 去重，实际开销极小）
  setInterval(() => {
    ensureStyle();
    patchElements();
  }, 250);
})();
