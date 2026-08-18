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

  // 1. 确保 style 标签存在（切换对话 DOM 重建后可能被清掉，需要重建）
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    (document.head || document.documentElement).appendChild(style);
  }

  // 2. 双保险：给匹配元素直接设 inline 样式，元素重建后也立即生效
  function patchElements() {
    document.querySelectorAll('[class*="ComposerLayoutBody"]').forEach((el) => {
      if (el.style.backdropFilter !== "none") el.style.backdropFilter = "none";
      if (el.style.webkitBackdropFilter !== "none") el.style.webkitBackdropFilter = "none";
    });
  }

  ensureStyle();
  patchElements();

  // 3. DOM 观察者：界面重建（切换对话等）后立即重新修复
  // 用观察者而不是轮询：即时生效、只在 DOM 真正变化时执行、零额外开销
  const observer = new MutationObserver((mutations) => {
    ensureStyle();
    // 只在新增节点里出现 composer 相关元素时才做全量修补，避免聊天流式输出时频繁全扫
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
})();
