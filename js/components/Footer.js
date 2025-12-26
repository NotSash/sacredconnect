// ================================================
// SCComponents.Footer - Footer Component
// No-module, production-safe helper
// ================================================

(function () {
  const Footer = {
    render: function () {
      const y = new Date().getFullYear();

      return ''
        + '<footer class="footer">'
        + '  <div class="container">'
        + '    <div class="footer-grid">'
        + '      <div class="footer-brand">'
        + '        <div class="footer-logo">'
        + '          <div class="footer-logo-icon"><i class="fas fa-om"></i></div>'
        + '          <span class="footer-logo-text">SacredConnect</span>'
        + '        </div>'
        + '        <p class="footer-desc">Connecting families with verified pandits for authentic ceremonies. Transparent pricing, trusted service.'
        + '          <br><span style="color:#A8A29E;">Support: </span>'
        + '          <a href="mailto:its.sash024@gmail.com" style="color: var(--primary); text-decoration:none; font-weight:700;">its.sash024@gmail.com</a>'
        + '        </p>'
        + '        <div class="footer-social">'
        + '          <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>'
        + '          <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>'
        + '          <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>'
        + '          <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>'
        + '        </div>'
        + '      </div>'

        + '      <div class="footer-column">'
        + '        <h4>Ceremonies</h4>'
        + '        <ul class="footer-links">'
        + '          <li><a href="/services/life-events">Life Events</a></li>'
        + '          <li><a href="/services/wedding">Wedding Ceremonies</a></li>'
        + '          <li><a href="/services/everyday-ceremonies">Everyday Rituals</a></li>'
        + '          <li><a href="/services/fire-ceremonies">Fire Rituals</a></li>'
        + '          <li><a href="/services">View All →</a></li>'
        + '        </ul>'
        + '      </div>'

        + '      <div class="footer-column">'
        + '        <h4>Company</h4>'
        + '        <ul class="footer-links">'
        + '          <li><a href="/about">About Us</a></li>'
        + '          <li><a href="/contact">Contact Us</a></li>'
        + '          <li><a href="/services">Browse Ceremonies</a></li>'
        + '          <li><a href="/pandits">Find Pandits</a></li>'
        + '        </ul>'
        + '      </div>'

        + '      <div class="footer-column">'
        + '        <h4>Support</h4>'
        + '        <ul class="footer-links">'
        + '          <li><a href="/support">Support Center</a></li>'
        + '          <li><a href="/faqs">FAQs</a></li>'
        + '          <li><a href="/search">Search</a></li>'
        + '          <li><a href="/dashboard">My Bookings</a></li>'
        + '          <li><a href="/contact">Contact</a></li>'
        + '        </ul>'
        + '      </div>'

        + '      <div class="footer-column">'
        + '        <h4>For Pandits</h4>'
        + '        <ul class="footer-links">'
        + '          <li><a href="/pandit/register">Join as Pandit</a></li>'
        + '          <li><a href="/support?audience=pandit">Pandit Support</a></li>'
        + '        </ul>'
        + '      </div>'
        + '    </div>'

        + '    <div class="footer-bottom">'
        + '      <p class="footer-copyright">© ' + y + ' SacredConnect. All rights reserved.</p>'
        + '      <div class="footer-legal">'
        + '        <a href="/privacy">Privacy Policy</a>'
        + '        <a href="/terms">Terms of Service</a>'
        + '      </div>'
        + '    </div>'

        + '  </div>'
        + '</footer>';
    }
  };

  window.SCComponents = window.SCComponents || {};
  window.SCComponents.Footer = Footer;
})();