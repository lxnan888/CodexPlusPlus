(() => {
  // Codex++：关闭 Composer 输入框毛玻璃
  // 修复 Chromium/Windows 合成环境下 backdrop-filter 被渲染成青色的问题（用户实测确认）
  if (!window.__CODEX_PLUS_COMPOSER_BLUR_FIX__) return;
  if (window.__codexPlusComposerBlurFixInstalled === "1") return;
  window.__codexPlusComposerBlurFixInstalled = "1";
  const style = document.createElement("style");
  style.setAttribute("data-codex-plus-composer-blur-fix", "1");
  style.textContent = [
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
  (document.head || document.documentElement).appendChild(style);
})();
