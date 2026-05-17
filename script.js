// Legacy entry kept for backward compatibility.
// Main application logic now lives in /js/app.js.
(function () {
  const existing = document.querySelector('script[data-xyrex-app="true"]');
  if (existing) return;
  const script = document.createElement('script');
  script.src = './js/app.js?v=2.0.8';
  script.defer = true;
  script.dataset.xyrexApp = 'true';
  document.head.appendChild(script);
})();
