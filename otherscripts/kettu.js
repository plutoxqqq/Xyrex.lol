const style = document.createElement("style");
style.textContent = `
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
document.head.appendChild(style);
