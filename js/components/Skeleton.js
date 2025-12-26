// ================================================
// SCComponents.Skeleton - Loading Placeholder Components (no-module)
// ================================================

(function () {
  const Skeleton = {
    box: function (width, height, className) {
      width = width || '100%';
      height = height || '1rem';
      className = className || '';
      return '<div class="skeleton ' + className + '" style="width:' + width + '; height:' + height + ';"></div>';
    },

    circle: function (size) {
      size = size || '3rem';
      return '<div class="skeleton" style="width:' + size + '; height:' + size + '; border-radius:50%;"></div>';
    },

    text: function (width) {
      width = width || '100%';
      return '<div class="skeleton" style="width:' + width + '; height:1rem; border-radius:0.25rem;"></div>';
    },

    serviceCard: function () {
      return ''
        + '<div class="card-flat" style="padding: 1.5rem;">'
        + '  <div class="skeleton" style="width:3.5rem;height:3.5rem;border-radius:1rem;margin-bottom:1rem;"></div>'
        + '  <div class="skeleton" style="width:75%;height:1.25rem;border-radius:0.25rem;margin-bottom:0.75rem;"></div>'
        + '  <div class="skeleton" style="width:100%;height:0.875rem;border-radius:0.25rem;margin-bottom:0.5rem;"></div>'
        + '  <div class="skeleton" style="width:60%;height:0.875rem;border-radius:0.25rem;"></div>'
        + '</div>';
    },

    panditCard: function () {
      return ''
        + '<div class="card-flat" style="overflow:hidden;">'
        + '  <div class="skeleton" style="width:100%;height:12rem;"></div>'
        + '  <div style="padding:1.25rem;">'
        + '    <div class="skeleton" style="width:70%;height:1.25rem;border-radius:0.25rem;margin-bottom:0.5rem;"></div>'
        + '    <div class="skeleton" style="width:50%;height:0.875rem;border-radius:0.25rem;margin-bottom:1rem;"></div>'
        + '    <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">'
        + '      <div class="skeleton" style="width:4rem;height:1.5rem;border-radius:9999px;"></div>'
        + '      <div class="skeleton" style="width:4rem;height:1.5rem;border-radius:9999px;"></div>'
        + '    </div>'
        + '    <div class="skeleton" style="width:100%;height:2.5rem;border-radius:0.75rem;"></div>'
        + '  </div>'
        + '</div>';
    },

    categoryCard: function () {
      return ''
        + '<div class="card-flat" style="padding:1.5rem;text-align:center;">'
        + '  <div class="skeleton" style="width:4rem;height:4rem;border-radius:1rem;margin:0 auto 1rem;"></div>'
        + '  <div class="skeleton" style="width:60%;height:1rem;border-radius:0.25rem;margin:0 auto 0.5rem;"></div>'
        + '  <div class="skeleton" style="width:40%;height:0.75rem;border-radius:0.25rem;margin:0 auto;"></div>'
        + '</div>';
    },

    multiple: function (type, count) {
      count = count || 4;
      const fn = this[type] || this.serviceCard;
      let out = '';
      for (let i = 0; i < count; i++) out += fn.call(this);
      return out;
    }
  };

  window.SCComponents = window.SCComponents || {};
  window.SCComponents.Skeleton = Skeleton;
})();