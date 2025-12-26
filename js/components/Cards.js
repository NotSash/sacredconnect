// ================================================
// SCComponents.Cards - Reusable Card Components
// Note: This folder is "future-ready" and not required by the current SPA build.
// This file is written in a no-build, no-module style so it can be included directly.
// ================================================

(function () {
  const Utils = window.Utils || {
    truncate: (t, n) => (t && t.length > n ? t.slice(0, n).trim() + '…' : (t || '')),
    formatCurrency: (a) => (a == null ? '₹---' : `₹${Math.round(a).toLocaleString('en-IN')}`)
  };

  function safeHref(path) {
    // Prefer Router if available; otherwise fallback.
    // Using normal href keeps right-click open-in-new-tab behavior.
    if (!path) return '/home';
    return path.startsWith('/') ? path : '/' + path;
  }

  const Cards = {
    ServiceCard(service) {
      const icon = service && service.icon ? service.icon : '🙏';
      const name = (service && service.name) || 'Ceremony';
      const desc = Utils.truncate(service && service.description, 90) || 'Details will be available soon.';
      const priceLabel = (service && service.price != null)
        ? Utils.formatCurrency(service.price)
        : (service && service.price && service.price.min != null)
          ? ('From ' + Utils.formatCurrency(service.price.min))
          : 'View details';

      const href = safeHref('/book/' + encodeURIComponent((service && service.slug) || ''));

      return ''
        + '<a class="card" href="' + href + '" style="display:block; padding: 18px; text-decoration:none; color:inherit;">'
        + '  <div style="width:54px;height:54px;border-radius:16px;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">' + icon + '</div>'
        + '  <div style="font-weight:900;font-size:16px;margin-bottom:6px;">' + name + '</div>'
        + '  <div style="color:var(--text-secondary);font-size:14px;line-height:1.6;margin-bottom:12px;">' + desc + '</div>'
        + '  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">'
        + '    <div style="font-weight:900;color:var(--primary);">' + priceLabel + '</div>'
        + '    <span class="btn btn-secondary btn-sm" aria-hidden="true">Book</span>'
        + '  </div>'
        + '</a>';
    },

    CategoryCard(category) {
      const icon = (category && category.icon) || '🙏';
      const name = (category && category.name) || 'Category';
      const subtitle = (category && category.subtitle) || '';
      const slug = (category && category.slug) || '';
      const href = safeHref('/services/' + encodeURIComponent(slug));

      return ''
        + '<a href="' + href + '" class="category-card" style="text-decoration:none;">'
        + '  <div class="category-card-icon">' + icon + '</div>'
        + '  <h3 class="category-card-title">' + name + '</h3>'
        + (subtitle ? ('<p class="category-card-subtitle">' + subtitle + '</p>') : '<p class="category-card-subtitle"></p>')
        + '</a>';
    },

    PanditCard(pandit) {
      const id = (pandit && pandit.id) || '';
      const name = (pandit && pandit.name) || (pandit && pandit.displayName) || 'Pandit';
      const photo = (pandit && (pandit.photo || pandit.profilePhoto)) || '';
      const rating = (pandit && pandit.rating != null) ? pandit.rating : '—';
      const exp = (pandit && pandit.experience != null) ? pandit.experience : (pandit && pandit.yearsOfExperience != null ? pandit.yearsOfExperience : '—');
      const specialization = (pandit && pandit.specialization) || (pandit && pandit.tagline) || 'Ceremony Specialist';
      const verified = !!(pandit && pandit.verified);
      const href = safeHref('/pandits/' + encodeURIComponent(id));

      return ''
        + '<a href="' + href + '" class="pandit-card" aria-label="View pandit profile: ' + name.replace(/"/g, '') + '">'
        + '  <div class="pandit-card-image">'
        + (photo
          ? '<img src="' + photo + '" alt="' + name.replace(/"/g, '') + '" loading="lazy">'
          : '<i class="fas fa-user-circle" aria-hidden="true"></i>')
        + (verified
          ? '<div class="pandit-card-badge"><span class="badge badge-success"><i class="fas fa-check-circle" aria-hidden="true"></i> Verified</span></div>'
          : '')
        + '  </div>'
        + '  <div class="pandit-card-body">'
        + '    <h3 class="pandit-card-name">' + name + '</h3>'
        + '    <p class="pandit-card-specialty">' + specialization + '</p>'
        + '    <div class="pandit-card-meta">'
        + '      <span class="pandit-card-rating"><i class="fas fa-star" aria-hidden="true"></i> ' + rating + '</span>'
        + '      <span class="pandit-card-exp">' + exp + ' yrs exp</span>'
        + '    </div>'
        + '    <span class="btn btn-secondary w-full btn-sm" role="button" aria-hidden="true">View Profile</span>'
        + '  </div>'
        + '</a>';
    }
  };

  window.SCComponents = window.SCComponents || {};
  window.SCComponents.Cards = Cards;
})();