function showError(msg) {
  const loader = document.getElementById('fallback-loader');
  if (!loader) return;
  loader.innerHTML = '<div style="max-width:600px;padding:20px;text-align:left;"><h2 style="color:#ef4444;font-size:16px;margin-bottom:10px;">Something went wrong</h2><pre style="white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;font-size:12px;color:#f6f6f6;">' + msg + '</pre></div>';
}

window.onerror = function(message, source, lineno, colno, error) {
  showError(String(message) + ' at ' + source + ':' + lineno + ':' + colno + (error && error.stack ? '\n' + error.stack : ''));
};
window.addEventListener('unhandledrejection', function(event) {
  showError('Unhandled promise rejection: ' + String(event.reason) + (event.reason && event.reason.stack ? '\n' + event.reason.stack : ''));
});

window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('fallback-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }, 500);

  setTimeout(() => {
    const loader = document.getElementById('fallback-loader');
    if (loader && loader.style.display !== 'none') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          Promise.all(regs.map(r => r.unregister())).then(() => {
            window.location.reload();
          });
        });
      }
    }
  }, 4000);
});
