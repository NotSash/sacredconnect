// ================================================
// SCComponents.Toast - Toast Notifications (no-module)
// Note: Your app already has Utils.toast(). This is a future-ready helper.
// ================================================

(function () {
  const Toast = {
    init: function () {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(container);
      }
      return container;
    },

    show: function (message, type, duration) {
      type = type || 'info';
      duration = (duration == null) ? 3500 : duration;

      const container = this.init();

      const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
      };

      const el = document.createElement('div');
      el.className = 'toast ' + type;
      el.style.pointerEvents = 'auto';
      el.innerHTML = ''
        + '<i class="fas ' + (icons[type] || icons.info) + '"></i>'
        + '<span class="toast-message">' + String(message || '') + '</span>';

      container.appendChild(el);

      setTimeout(() => {
        el.style.animation = 'slideInRight 0.3s ease-out reverse forwards';
        setTimeout(() => el.remove(), 300);
      }, duration);

      return el;
    }
  };

  window.SCComponents = window.SCComponents || {};
  window.SCComponents.Toast = Toast;
})();