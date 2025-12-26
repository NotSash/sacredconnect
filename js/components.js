// ========================================
// COMPONENTS - Global Facade
// ========================================
// Primary components live in: js/components/*  (window.SCComponents)
// This file provides a stable global API: window.Components
// so existing Pages/App code stays unchanged.

(function () {
  const sc = window.SCComponents || {};

  function has(obj, key) {
    return obj && Object.prototype.hasOwnProperty.call(obj, key);
  }

  const Components = {
    // Layout
    MobileMenu: function () {
      // Keep the same mobile menu markup your app expects
      const state = (window.Store && window.Store.getState) ? window.Store.getState() : { isLoggedIn: false, user: null };

      return ''
        + '<div id="mobile-overlay" class="mobile-overlay" onclick="App.closeMobileMenu()"></div>'
        + '<div id="mobile-menu" class="mobile-menu">'
        + '  <div class="mobile-menu-header">'
        + '    <a href="/home" class="nav-logo" onclick="App.closeMobileMenu()" aria-label="SacredConnect Home">'
        + '      <div class="nav-logo-icon"><i class="fas fa-om"></i></div>'
        + '      <span class="nav-logo-name" style="color: var(--text-primary);">SacredConnect</span>'
        + '    </a>'
        + '    <button class="mobile-menu-close" onclick="App.closeMobileMenu()"><i class="fas fa-times"></i></button>'
        + '  </div>'
        + '  <nav class="mobile-menu-body">'
        + '    <a href="/home" class="mobile-nav-link" onclick="App.closeMobileMenu()"><i class="fas fa-home"></i><span>Home</span></a>'
        + '    <a href="/services" class="mobile-nav-link" onclick="App.closeMobileMenu()"><i class="fas fa-layer-group"></i><span>Ceremonies</span></a>'
        + '    <a href="/book" class="mobile-nav-link" onclick="App.closeMobileMenu()"><i class="fas fa-calendar-check"></i><span>Book a Pandit</span></a>'
        + '    <a href="/pandits" class="mobile-nav-link" onclick="App.closeMobileMenu()"><i class="fas fa-user-tie"></i><span>Find Pandits</span></a>'
        + '    <a href="/store" class="mobile-nav-link" onclick="App.closeMobileMenu()"><i class="fas fa-shopping-bag"></i><span>Essentials</span></a>'
        + '    <a href="/about" class="mobile-nav-link" onclick="App.closeMobileMenu()"><i class="fas fa-circle-info"></i><span>About</span></a>'
        + '    <a href="/contact" class="mobile-nav-link" onclick="App.closeMobileMenu()"><i class="fas fa-envelope"></i><span>Contact</span></a>'
        + (state.isLoggedIn
          ? ('<a href="/dashboard" class="mobile-nav-link" onclick="App.closeMobileMenu()"><i class="fas fa-tachometer-alt"></i><span>Dashboard</span></a>')
          : '')
        + '  </nav>'
        + '  <div class="mobile-menu-footer">'
        + (state.isLoggedIn
          ? ('<a href="/dashboard" class="btn btn-secondary w-full" onclick="App.closeMobileMenu()"><i class="fas fa-user-circle"></i>My Account</a>'
            + '<button class="btn btn-ghost w-full" onclick="App.logout()"><i class="fas fa-sign-out-alt"></i>Logout</button>')
          : ('<a href="/login" class="btn btn-secondary w-full" onclick="App.closeMobileMenu()"><i class="fas fa-sign-in-alt"></i>Login</a>'
            + '<a href="/register" class="btn btn-primary w-full" onclick="App.closeMobileMenu()"><i class="fas fa-user-plus"></i>Sign Up</a>'))
        + '  </div>'
        + '</div>';
    },

    Navbar: function (options) {
      const nav = (sc.Navbar && typeof sc.Navbar.render === 'function') ? sc.Navbar.render(options || {}) : '';
      // Append mobile menu expected by app
      return nav + Components.MobileMenu();
    },

    Footer: function () {
      if (sc.Footer && typeof sc.Footer.render === 'function') return sc.Footer.render();
      return '';
    },

    // Cards
    CategoryCard: function (category) {
      if (sc.Cards && typeof sc.Cards.CategoryCard === 'function') return sc.Cards.CategoryCard(category);
      return '';
    },

    PanditCard: function (pandit) {
      if (sc.Cards && typeof sc.Cards.PanditCard === 'function') return sc.Cards.PanditCard(pandit);
      return '';
    },

    ServiceCard: function (service) {
      if (sc.Cards && typeof sc.Cards.ServiceCard === 'function') return sc.Cards.ServiceCard(service);
      return '';
    },

    // Skeletons
    Skeleton: {
      category: function () {
        if (sc.Skeleton && typeof sc.Skeleton.categoryCard === 'function') return sc.Skeleton.categoryCard();
        if (sc.Skeleton && typeof sc.Skeleton.category === 'function') return sc.Skeleton.category();
        return '<div class="skeleton" style="height:140px;"></div>';
      },
      pandit: function () {
        if (sc.Skeleton && typeof sc.Skeleton.panditCard === 'function') return sc.Skeleton.panditCard();
        return '<div class="skeleton" style="height:260px;"></div>';
      },
      service: function () {
        if (sc.Skeleton && typeof sc.Skeleton.serviceCard === 'function') return sc.Skeleton.serviceCard();
        return '<div class="skeleton" style="height:180px;"></div>';
      }
    },

    // Empty State
    EmptyState: function (options) {
      if (sc.EmptyState && typeof sc.EmptyState.render === 'function') return sc.EmptyState.render(options || {});
      // ultra-safe fallback
      options = options || {};
      return ''
        + '<div class="empty-state">'
        + '  <div class="empty-state-icon"><i class="fas fa-inbox"></i></div>'
        + '  <h3 class="empty-state-title">' + (options.title || 'Nothing here yet') + '</h3>'
        + '  <p class="empty-state-desc">' + (options.description || 'There is nothing to display right now.') + '</p>'
        + '</div>';
    },

    // Breadcrumb
    Breadcrumb: function (items) {
      items = items || [];
      return ''
        + '<nav class="breadcrumb">'
        + items.map(function (item, index) {
            return ''
              + (index > 0 ? '<i class="fas fa-chevron-right"></i>' : '')
              + (item.href
                ? '<a href="' + item.href + '">' + item.label + '</a>'
                : '<span>' + item.label + '</span>');
          }).join('')
        + '</nav>';
    },

    // Page Header
    PageHeader: function (options) {
      options = options || {};
      return ''
        + (options.breadcrumb ? Components.Breadcrumb(options.breadcrumb) : '')
        + '<div class="page-header">'
        + '  <h1 class="page-title">' + (options.title || '') + '</h1>'
        + (options.subtitle ? '<p class="page-subtitle">' + options.subtitle + '</p>' : '')
        + '</div>';
    },

    // Step Card
    StepCard: function (step, index, total) {
      step = step || {};
      index = index || 0;
      total = total || 0;
      return ''
        + '<div class="step-card">'
        + '  <div class="step-number ' + (step.completed ? 'completed' : '') + '">' + (step.completed ? '<i class="fas fa-check"></i>' : (index + 1)) + '</div>'
        + '  <h3 class="step-title">' + (step.title || '') + '</h3>'
        + '  <p class="step-desc">' + (step.description || '') + '</p>'
        + (index < total - 1 ? '<div class="step-connector"></div>' : '')
        + '</div>';
    },

    // CTA Box
    CTABox: function (options) {
      options = options || {};
      return ''
        + '<div class="cta-box">'
        + '  <div class="cta-content">'
        + '    <h2 class="cta-title">' + (options.title || '') + '</h2>'
        + '    <p class="cta-text">' + (options.text || '') + '</p>'
        + '    <a href="' + (options.buttonHref || '/services') + '" class="btn btn-white">'
        + (options.buttonIcon ? '<i class="fas ' + options.buttonIcon + '"></i>' : '')
        + (options.buttonText || 'Explore')
        + '    </a>'
        + '  </div>'
        + '</div>';
    },

    // Loader (index.html already renders loader)
    Loader: function () {
      return '';
    }
  };

  window.Components = Components;
})();