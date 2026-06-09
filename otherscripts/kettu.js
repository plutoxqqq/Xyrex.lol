(() => {
  const css = `
    @import url("https://tetunori.github.io/fluent-emoji-webfont/dist/FluentEmojiColor.css");

    * {
      font-family:
        "Fluent Emoji Color",
        "Segoe UI Emoji",
        "Apple Color Emoji",
        "Noto Color Emoji",
        sans-serif !important;
    }
  `;

  function inject() {
    const head = document.head || document.getElementsByTagName("head")[0];
    if (!head) return setTimeout(inject, 1000);

    const style = document.createElement("style");
    style.id = "windows-11-emoji-font";
    style.textContent = css;
    head.appendChild(style);
  }

  setTimeout(inject, 3000);
})();
