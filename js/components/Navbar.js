// ================================================
// SCComponents.Navbar - Navbar helper (no-module)
// Note: Your app currently uses js/components.js for Navbar.
// This file is kept clean + consistent for future modularization.
// ================================================

(function () {
  const Navbar = {
    render: function (opts) {
      opts = opts || {};
      const transparent = !!opts.transparent;
      const state = (window.Store && window.Store.getState) ? window.Store.getState() : { isLoggedIn: false, user: null };

      return ''
        + '<nav id="navbar" class="navbar ' + (transparent ? 'transparent' : 'scrolled') + '">' 
        + '  <div class="navbar-inner">'
        + '    <a href="/home" class="nav-logo" aria-label="SacredConnect Home">'
        + '      <div class="nav-logo-icon"><i class="fas fa-om"></i></div>'
        + '      <div class="nav-logo-text">'
        + '        <span class="nav-logo-name">SacredConnect</span>'
        + '        <span class="nav-logo-tagline">Ceremony Booking</span>'
        + '      </div>'
        + '    </a>'

        + '    <div class="nav-links">'
        + '      <a href="/home" class="nav-link">Home</a>'
        + '      <a href="/services" class="nav-link">Ceremonies</a>'
        + '      <a href="/pandits" class="nav-link">Find Pandits</a>'
        + '      <a href="/store" class="nav-link">Essentials</a>'
        + '      <a href="/about" class="nav-link">About</a>'
        + '    </div>'

        + '    <div class="nav-actions">'
        + (state.isLoggedIn
          ? ('<a href="/dashboard" class="nav-btn-login"><i class="fas fa-user-circle"></i><span>My Account</span></a>')
          : ('<a href="/login" class="nav-btn-login"><i class="fas fa-sign-in-alt"></i><span>Login</span></a>'))
        + '      <a href="/book" class="btn btn-primary nav-btn-book"><i class="fas fa-calendar-check"></i><span>Book Now</span></a>'
        + '      <button class="nav-mobile-toggle" aria-label="Open menu" onclick="window.App && App.toggleMobileMenu && App.toggleMobileMenu()"><i class="fas fa-bars"></i></button>'
        + '    </div>'
        + '  </div>'
        + '</nav>';
    }
  };

  window.SCComponents = window.SCComponents || {};
  window.SCComponents.Navbar = Navbar;
})();