// ================================================
// SCComponents.Modal - Modal helper (no-module)
// ================================================

(function () {
  const Modal = {
    currentId: null,
    lastActiveEl: null,

    open: function (id) {
      const backdrop = document.getElementById(id);
      if (!backdrop) return;

      this.lastActiveEl = document.activeElement;
      this.currentId = id;

      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Focus first focusable element
      setTimeout(() => {
        const focusable = backdrop.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
      }, 0);

      this._bindCloseHandlers(backdrop);
      this._bindFocusTrap(backdrop);
    },

    close: function (id) {
      const modalId = id || this.currentId;
      if (!modalId) return;

      const backdrop = document.getElementById(modalId);
      if (backdrop) backdrop.classList.remove('active');

      document.body.style.overflow = '';
      this.currentId = null;

      // Restore focus
      if (this.lastActiveEl && typeof this.lastActiveEl.focus === 'function') {
        this.lastActiveEl.focus();
      }
      this.lastActiveEl = null;
    },

    create: function (opts) {
      opts = opts || {};
      const id = opts.id || ('sc-modal-' + Date.now());
      const title = opts.title || '';
      const content = opts.content || '';
      const showClose = (opts.showClose !== false);
      const maxWidth = opts.maxWidth || '520px';

      const html = ''
        + '<div id="' + id + '" class="modal-backdrop" role="dialog" aria-modal="true" aria-label="' + (title || 'Dialog').replace(/"/g, '') + '">' 
        + '  <div class="modal" style="max-width:' + maxWidth + ';">'
        + (title || showClose ? (
          '    <div class="modal-header">'
          + (title ? ('<div class="modal-title">' + title + '</div>') : '<div></div>')
          + (showClose ? '<button class="modal-close" data-modal-close aria-label="Close"><i class="fas fa-times"></i></button>' : '')
          + '    </div>'
        ) : '')
        + '    <div class="modal-body">' + content + '</div>'
        + '  </div>'
        + '</div>';

      const existing = document.getElementById(id);
      if (existing) existing.remove();
      document.body.insertAdjacentHTML('beforeend', html);
      return document.getElementById(id);
    },

    confirm: function (opts) {
      opts = opts || {};
      const title = opts.title || 'Confirm';
      const message = opts.message || 'Are you sure?';
      const confirmText = opts.confirmText || 'Confirm';
      const cancelText = opts.cancelText || 'Cancel';
      const danger = !!opts.danger;

      return new Promise((resolve) => {
        const id = 'sc-confirm-' + Date.now();
        const content = ''
          + '<p style="margin-bottom:16px; color: var(--text-secondary); line-height:1.7;">' + message + '</p>'
          + '<div style="display:flex; gap:10px; justify-content:flex-end;">'
          + '  <button class="btn btn-secondary" data-modal-close data-action="cancel">' + cancelText + '</button>'
          + '  <button class="btn ' + (danger ? 'btn-primary' : 'btn-primary') + '" data-action="confirm" style="' + (danger ? 'background: linear-gradient(135deg, #EF4444, #DC2626);' : '') + '">' + confirmText + '</button>'
          + '</div>';

        this.create({ id: id, title: title, content: content, maxWidth: '420px' });
        const el = document.getElementById(id);

        el.querySelector('[data-action="confirm"]').addEventListener('click', () => {
          this.close(id);
          el.remove();
          resolve(true);
        });
        el.querySelector('[data-action="cancel"]').addEventListener('click', () => {
          this.close(id);
          el.remove();
          resolve(false);
        });

        this.open(id);
      });
    },

    _bindCloseHandlers: function (backdrop) {
      // backdrop click
      const onClick = (e) => {
        if (e.target === backdrop) this.close();
      };
      backdrop.addEventListener('click', onClick, { once: true });

      // close buttons
      backdrop.querySelectorAll('[data-modal-close]').forEach((btn) => {
        btn.addEventListener('click', () => this.close());
      });

      // escape
      const onEsc = (e) => {
        if (e.key === 'Escape' && this.currentId) {
          this.close();
          document.removeEventListener('keydown', onEsc);
        }
      };
      document.addEventListener('keydown', onEsc);
    },

    _bindFocusTrap: function (backdrop) {
      const onKeydown = (e) => {
        if (e.key !== 'Tab') return;
        const focusable = backdrop.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      backdrop.addEventListener('keydown', onKeydown);
    }
  };

  window.SCComponents = window.SCComponents || {};
  window.SCComponents.Modal = Modal;
})();