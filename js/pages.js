// ========================================
// PAGES - Page Components (No Demo Data)
// ========================================

const Pages = {

  // ========================================
  // HOME
  // ========================================
  Home: function () {
    var state = Store.getState();

    // City dropdown is rendered as a custom menu (Chennai live, others coming soon)

    // Skeleton categories/pandits
    var categoriesSkeleton = '';
    for (var c = 0; c < 8; c++) categoriesSkeleton += Components.Skeleton.category();

    var panditsSkeleton = '';
    for (var p = 0; p < 4; p++) panditsSkeleton += Components.Skeleton.pandit();

    // FAQs are shown on a dedicated page (see Pages.FAQs). Home only links to FAQs/Support.

    var steps = [
      { title: 'Choose Ceremony', description: 'Browse and select the ceremony you need' },
      { title: 'Choose Pandit', description: 'Compare verified profiles, languages and experience' },
      { title: 'Confirm & Pay', description: 'Pick date & time and pay securely' },
      { title: 'Ceremony Day', description: 'Pandit performs the ceremony at your location', completed: true }
    ];

    var stepsHtml = '';
    for (var s = 0; s < steps.length; s++) {
      stepsHtml += Components.StepCard(steps[s], s, steps.length);
    }

    return ''
      + Components.Navbar({ transparent: true })

      + '<section class="hero">'
      + '  <div class="hero-content">'
      + '    <div class="hero-badge">'
      + '      <span class="hero-badge-dot"></span>'
      + '      <span class="hero-badge-text">A trust-first platform for sacred ceremonies</span>'
      + '    </div>'
      + '    <h1 class="hero-title">Book Verified Pandits for<br><span class="hero-title-highlight">Sacred Ceremonies</span></h1>'
      + '    <p class="hero-subtitle">Discover, compare and book experienced pandits with transparent pricing and reliable scheduling.</p>'
      + '    <div class="hero-search">'
      + '      <div class="hero-search-box">'
      + '        <div class="hero-search-inner">'
      + '          <div class="hero-search-field hero-query-field" style="position: relative;">'
      + '            <i class="fas fa-search"></i>'
      + '            <input type="text" placeholder="Search for ceremonies or pandits..." id="hero-search-input" autocomplete="off" oninput="App.typeaheadInput(event,\'hero\')" onfocus="App.typeaheadFocus(\'hero\')" onkeydown="App.typeaheadKeydown(event,\'hero\')">'
      + '            <div id="hero-suggest" class="typeahead hidden" aria-label="Search suggestions"></div>'
      + '          </div>'
      + '          <div class="hero-search-field hero-city-field" style="position: relative;">'
      + '            <button type="button" id="hero-city-btn" class="hero-city-btn" aria-haspopup="listbox" aria-expanded="false">'
      + '              <span id="hero-city-label">' + (state.selectedCity || 'Chennai') + '</span>'
      + '              <span class="hero-city-icons" aria-hidden="true">'
      + '                <i class="fas fa-location-dot"></i>'
      + '                <i class="fas fa-chevron-down"></i>'
      + '              </span>'
      + '            </button>'
      + '            <div id="hero-city-menu" class="city-menu hidden" role="listbox" aria-label="Select city">'
      +                (function(){
                          var html = '';
                          var live = state.liveCity || 'Chennai';
                          for (var i = 0; i < state.cities.length; i++) {
                            var city = state.cities[i];
                            var isLive = city === live;
                            if (isLive) {
                              html += '<button type="button" class="city-option" data-city="' + city + '" role="option" aria-selected="' + (city === state.selectedCity ? 'true' : 'false') + '">' + city + '<span class="city-pill live">Live</span></button>';
                            } else {
                              html += '<div class="city-option disabled" data-city="' + city + '" role="option" aria-disabled="true">' + city + '<span class="city-pill soon">Coming soon</span><span class="city-tooltip">Coming soon</span></div>';
                            }
                          }
                          return html;
                      })()
      + '            </div>'
      + '          </div>'
      + '          <button class="btn btn-primary hero-search-btn" onclick="App.handleHeroSearch()">'
      + '            <i class="fas fa-arrow-right"></i>Search'
      + '          </button>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '    <div class="hero-features">'
      + '      <div class="hero-feature"><i class="fas fa-shield-halved"></i><span>Verified Pandits</span></div>'
      + '      <div class="hero-feature"><i class="fas fa-indian-rupee-sign"></i><span>Transparent Pricing</span></div>'
      + '      <div class="hero-feature"><i class="fas fa-clock"></i><span>On-time Service</span></div>'
      + '    </div>'
      + '  </div>'
      + '  <div class="hero-wave">'
      + '    <svg viewBox="0 0 1440 180" fill="none" preserveAspectRatio="none">'
      + '      <path d="M0 80L48 85C96 90 192 100 288 105C384 110 480 110 576 100C672 90 768 70 864 65C960 60 1056 70 1152 80C1248 90 1344 100 1392 105L1440 110V180H0V80Z" fill="#FFFEFB"/>'
      + '    </svg>'
      + '  </div>'
      + '</section>'

      + '<section class="section section-cream">'
      + '  <div class="container">'
      + '    <div class="section-header">'
      + '      <span class="badge badge-primary">Ceremony Types</span>'
      + '      <h2 class="section-title">Explore Ceremony Types</h2>'
      + '      <p class="section-subtitle">Categories will appear as we onboard ceremonies in your city.</p>'
      + '    </div>'
      + '    <div id="home-categories" class="category-grid">' + categoriesSkeleton + '</div>'
      + '    <div id="home-categories-empty" class="hidden">'
      +        Components.EmptyState({
                icon: 'fa-layer-group',
                title: 'Categories Coming Soon',
                description: 'We are onboarding services. Try searching for a ceremony or check back soon.',
                action: { text: 'Search', icon: 'fa-search', onClick: "Router.navigate('/search')" }
              })
      + '    </div>'
      + '  </div>'
      + '</section>'

      + '<section class="section section-white">'
      + '  <div class="container">'
      + '    <div class="section-header">'
      + '      <span class="badge badge-primary">Simple Process</span>'
      + '      <h2 class="section-title">How It Works</h2>'
      + '      <p class="section-subtitle">Book a pandit in 4 easy steps</p>'
      + '    </div>'
      + '    <div class="steps-grid">' + stepsHtml + '</div>'
      + '    <div style="text-align: center; margin-top: 48px;">'
      + '      <a href="#/services" class="btn btn-primary btn-lg"><i class="fas fa-calendar-check"></i>Browse Ceremonies</a>'
      + '    </div>'
      + '  </div>'
      + '</section>'

      + '<section class="section section-cream-dark">'
      + '  <div class="container">'
      + '    <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-bottom: 40px;">'
      + '      <div>'
      + '        <span class="badge badge-primary" style="margin-bottom: 12px;">Our Pandits</span>'
      + '        <h2 class="section-title" style="margin-bottom: 8px;">Featured Pandits</h2>'
      + '        <p class="section-subtitle" style="margin: 0;">Top profiles available in your selected city.</p>'
      + '      </div>'
      + '      <a href="#/pandits" class="btn btn-ghost">View All<i class="fas fa-arrow-right"></i></a>'
      + '    </div>'
      + '    <div id="home-pandits-grid" class="pandit-grid">' + panditsSkeleton + '</div>'
      + '    <div id="home-pandits-empty" class="hidden">'
      +        Components.EmptyState({
                icon: 'fa-user-tie',
                title: 'No Pandits Listed Yet',
                description: 'We are onboarding verified pandits in your area. Check back soon!',
                action: { text: 'Become a Pandit', icon: 'fa-user-plus', onClick: "Router.navigate('/pandit/register')" }
              })
      + '    </div>'
      + '  </div>'
      + '</section>'

      + '<section class="section section-white">'
      + '  <div class="container">'
      + '    <div class="stats-grid stats-grid-4" style="display: grid; gap: 20px;">'
      + '      <div class="card-flat" style="padding: 32px; text-align: center;">'
      + '        <div style="width: 60px; height: 60px; margin: 0 auto 16px; background: rgba(237, 123, 18, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center;">'
      + '          <i class="fas fa-user-tie" style="font-size: 24px; color: #ED7B12;"></i>'
      + '        </div>'
      + '        <div id="stats-pandits" class="font-display" style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">—</div>'
      + '        <div style="font-size: 14px; color: var(--text-secondary);">Verified Pandits</div>'
      + '      </div>'
      + '      <div class="card-flat" style="padding: 32px; text-align: center;">'
      + '        <div style="width: 60px; height: 60px; margin: 0 auto 16px; background: rgba(34, 197, 94, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center;">'
      + '          <i class="fas fa-om" style="font-size: 24px; color: #22C55E;"></i>'
      + '        </div>'
      + '        <div id="stats-ceremonies" class="font-display" style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">—</div>'
      + '        <div style="font-size: 14px; color: var(--text-secondary);">Ceremonies Completed</div>'
      + '      </div>'
      + '      <div class="card-flat" style="padding: 32px; text-align: center;">'
      + '        <div style="width: 60px; height: 60px; margin: 0 auto 16px; background: rgba(59, 130, 246, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center;">'
      + '          <i class="fas fa-map-marker-alt" style="font-size: 24px; color: #3B82F6;"></i>'
      + '        </div>'
      + '        <div id="stats-cities" class="font-display" style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">—</div>'
      + '        <div style="font-size: 14px; color: var(--text-secondary);">Cities Covered</div>'
      + '      </div>'
      + '      <div class="card-flat" style="padding: 32px; text-align: center;">'
      + '        <div style="width: 60px; height: 60px; margin: 0 auto 16px; background: rgba(245, 158, 11, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center;">'
      + '          <i class="fas fa-star" style="font-size: 24px; color: #F59E0B;"></i>'
      + '        </div>'
      + '        <div id="stats-rating" class="font-display" style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">—</div>'
      + '        <div style="font-size: 14px; color: var(--text-secondary);">Average Rating</div>'
      + '      </div>'
      + '    </div>'
      + '    <p style="text-align:center; margin-top: 14px; color: var(--text-muted); font-size: 13px;">Stats update automatically as the platform grows.</p>'
      + '  </div>'
      + '</section>'

      + '<section class="section section-cream">'
      + '  <div class="container">'
      + '    <div class="section-header">'
      + '      <span class="badge badge-primary">Testimonials</span>'
      + '      <h2 class="section-title">What Families Say</h2>'
      + '      <p class="section-subtitle">Reviews will appear once real bookings start.</p>'
      + '    </div>'
      + '    <div id="testimonials-content">'
      +        Components.EmptyState({
              icon: 'fa-star',
              title: 'No Reviews Yet',
              description: 'Customer reviews will show up here after verified bookings.',
              action: { text: 'Browse Pandits', icon: 'fa-user-tie', onClick: "Router.navigate('/pandits')" }
            })
      + '    </div>'
      + '  </div>'
      + '</section>'

      + '<section class="section section-white">'
      + '  <div class="container">'
      + '    <div class="section-header">'
      + '      <span class="badge badge-primary">Help</span>'
      + '      <h2 class="section-title">Need help?</h2>'
      + '      <p class="section-subtitle">Find quick answers or reach support anytime.</p>'
      + '    </div>'
      + '    <div style="max-width: 800px; margin: 0 auto; display:flex; gap: 12px; flex-wrap:wrap; justify-content:center;">'
      + '      <a class="btn btn-secondary" href="#/faqs"><i class="fas fa-circle-question"></i>View FAQs</a>'
      + '      <a class="btn btn-primary" href="#/support"><i class="fas fa-headset"></i>Support Center</a>'
      + '    </div>'
      + '  </div>'
      + '</section>'

      + '<section class="section section-cream">'
      + '  <div class="container">'
      +      Components.CTABox({
              title: 'Are You a Pandit?',
              text: 'Join our platform and connect with families seeking authentic ceremonies. Flexible schedule, transparent earnings.',
              buttonText: 'Register as Pandit',
              buttonHref: '#/pandit/register',
              buttonIcon: 'fa-user-plus'
            })
      + '  </div>'
      + '</section>'

      + Components.Footer();
  },

  // ========================================
  // SERVICES
  // ========================================
  Services: function (context) {
    var params = context.params || {};
    var category = params.category;

    // Friendlier category titles (keep slugs unchanged)
    var friendlyTitles = {
      'havans': 'Fire Rituals',
      'havans-yagyas': 'Fire Rituals',
      'fire-ceremonies': 'Fire Rituals',
      'regular-pujas': 'Everyday Rituals',
      'everyday-ceremonies': 'Everyday Rituals',
      'life-events': 'Life Events',
      'wedding': 'Wedding Ceremonies',
      'wedding-ceremonies': 'Wedding Ceremonies'
    };

    var categoryTitle = category ? (friendlyTitles[category] || Utils.unslugify(category)) : 'All Ceremonies';

    var servicesSkeleton = '';
    for (var i = 0; i < 8; i++) servicesSkeleton += Components.Skeleton.service();

    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({
                title: categoryTitle,
                subtitle: 'Explore ceremonies and rituals available in your city.',
                breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Services' }]
              })
      + '    <div id="services-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">'
      +        servicesSkeleton
      + '    </div>'
      + '    <div id="services-empty" class="hidden">'
      +        Components.EmptyState({ icon: 'fa-om', title: 'No Services Yet', description: 'We are onboarding services. Please check back soon.', action: { text: 'Go Home', icon: 'fa-home', onClick: "Router.navigate('/home')" } })
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // PANDITS
  // ========================================
  Pandits: function () {
    var panditsSkeleton = '';
    for (var i = 0; i < 8; i++) panditsSkeleton += Components.Skeleton.pandit();

    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({
                title: 'Find a Pandit',
                subtitle: 'Browse verified pandits in your city.',
                breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Pandits' }]
              })
      + '    <div id="pandits-grid" class="pandit-grid">' + panditsSkeleton + '</div>'
      + '    <div id="pandits-empty" class="hidden">'
      +        Components.EmptyState({ icon: 'fa-user-tie', title: 'No Pandits Listed Yet', description: 'We are onboarding verified pandits in your area. Check back soon!', action: { text: 'Become a Pandit', icon: 'fa-user-plus', onClick: "Router.navigate('/pandit/register')" } })
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // PANDIT DETAIL
  // ========================================
  PanditDetail: function () {
    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({
                title: 'Pandit Profile',
                subtitle: 'Profile details will load automatically.',
                breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Pandits', href: '#/pandits' }, { label: 'Profile' }]
              })
      + '    <div id="pandit-detail" class="card-flat" style="padding: 28px;">'
      + '      <div class="skeleton" style="width: 220px; height: 18px; margin-bottom: 12px;"></div>'
      + '      <div class="skeleton" style="width: 100%; height: 12px; margin-bottom: 8px;"></div>'
      + '      <div class="skeleton" style="width: 65%; height: 12px; margin-bottom: 16px;"></div>'
      + '      <div class="skeleton" style="width: 180px; height: 40px; border-radius: 12px;"></div>'
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // LOGIN
  // ========================================
  Login: function () {
    return ''
      + Components.Navbar()
      + '<main class="auth-page">'
      + '  <div class="auth-card">'
      + '    <div class="auth-header">'
      + '      <div class="auth-icon"><i class="fas fa-om"></i></div>'
      + '      <h1 class="auth-title">Welcome Back</h1>'
      + '      <p class="auth-subtitle">Login with Phone or Email (OTP via email)</p>'
      + '    </div>'
      + '    <div id="auth-form-container">' + Pages.LoginIdentifierForm() + '</div>'
      + '    <p class="auth-footer">Don\'t have an account? <a href="#/register">Sign up</a></p>'
      + '  </div>'
      + '</main>';
  },

  LoginIdentifierForm: function () {
    return ''
      + '<form id="login-identifier-form" onsubmit="App.handleLoginPhone(event)">'
      + '  <div class="input-group">'
      + '    <label class="label">Phone or Email</label>'
      + '    <div class="input-icon">'
      + '      <i class="fas fa-user"></i>'
      + '      <input type="text" id="login-identifier" class="input" placeholder="Enter phone (10 digits) or email" autocomplete="username" required>'
      + '    </div>'
      + '    <div style="margin-top:8px; font-size: 13px; color: var(--text-muted); line-height:1.6;">'
      + '      OTP will be sent to your registered email. (If you enter email, we\'ll use that directly.)'
      + '    </div>'
      + '  </div>'
      + '  <button type="submit" class="btn btn-primary w-full">Send OTP <i class="fas fa-arrow-right"></i></button>'
      + '</form>';
  },

  LoginOTPForm: function (identifier, email) {
    var isEmail = identifier && identifier.indexOf('@') >= 0;
    var display = isEmail ? identifier : ('+91 ' + Utils.formatPhone(identifier));
    var emailLine = email ? ('<br><span style="color: var(--text-muted); font-weight:700;">Sent to: ' + email + '</span>') : '';

    return ''
      + '<div style="text-align: center; margin-bottom: 24px;">'
      + '  <p style="color: var(--text-secondary); font-size: 14px;">Enter the 6-digit OTP sent to your email for<br><strong style="color: var(--text-primary);">' + display + '</strong>' + emailLine + '</p>'
      + '</div>'
      + '<form id="login-otp-form" onsubmit="App.handleLoginOTP(event)">'
      + '  <div class="otp-inputs">'
      + '    <input type="text" class="otp-input" maxlength="1" data-index="0" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">'
      + '    <input type="text" class="otp-input" maxlength="1" data-index="1" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">'
      + '    <input type="text" class="otp-input" maxlength="1" data-index="2" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">'
      + '    <input type="text" class="otp-input" maxlength="1" data-index="3" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">'
      + '    <input type="text" class="otp-input" maxlength="1" data-index="4" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">'
      + '    <input type="text" class="otp-input" maxlength="1" data-index="5" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">'
      + '  </div>'
      + '  <p class="otp-timer" id="otp-timer">Resend OTP in <span id="otp-countdown">30</span>s</p>'
      + '  <button type="submit" class="btn btn-primary w-full mb-4">Verify & Login <i class="fas fa-check"></i></button>'
      + '  <button type="button" class="btn btn-ghost w-full" onclick="App.resetLoginForm()"><i class="fas fa-arrow-left"></i>Change Phone Number</button>'
      + '</form>';
  },

  // ========================================
  // REGISTER
  // ========================================
  Register: function () {
    return ''
      + Components.Navbar()
      + '<main class="auth-page">'
      + '  <div class="auth-card">'
      + '    <div class="auth-header">'
      + '      <div class="auth-icon"><i class="fas fa-user-plus"></i></div>'
      + '      <h1 class="auth-title">Create Account</h1>'
      + '      <p class="auth-subtitle">Sign up using OTP</p>'
      + '    </div>'
      + '    <div id="register-form-container">' + Pages.RegisterStartForm() + '</div>'
      + '    <p class="auth-footer">Already have an account? <a href="#/login">Login</a></p>'
      + '  </div>'
      + '</main>';
  },

  RegisterStartForm: function () {
    return ''
      + '<form id="register-start-form" onsubmit="App.handleRegisterStart(event)">' 
      + '  <div class="input-group">'
      + '    <label class="label">Full Name</label>'
      + '    <input type="text" id="register-name" class="input" placeholder="Enter your full name" required>'
      + '  </div>'
      + '  <div class="input-group">'
      + '    <label class="label">Phone Number</label>'
      + '    <div class="phone-input">'
      + '      <span class="phone-input-prefix">+91</span>'
      + '      <input type="tel" id="register-phone" class="input" placeholder="Enter your phone number" maxlength="10" required>'
      + '    </div>'
      + '  </div>'
      + '  <div class="input-group">'
      + '    <label class="label">Email</label>'
      + '    <input type="email" id="register-email" class="input" placeholder="Enter your email" required>'
      + '  </div>'
      + '  <button type="submit" class="btn btn-primary w-full">Send Code <i class="fas fa-arrow-right"></i></button>'
      + '</form>';
  },

  RegisterOTPForm: function (phone) {
    var formattedPhone = Utils.formatPhone(phone);
    return ''
      + '<div style="text-align: center; margin-bottom: 24px;">'
      + '  <p style="color: var(--text-secondary); font-size: 14px;">Enter OTP sent to<br><strong style="color: var(--text-primary);">+91 ' + formattedPhone + '</strong></p>'
      + '</div>'
      + '<form id="register-otp-form" onsubmit="App.handleRegisterVerify(event)">'
      + '  <div class="otp-inputs">'
      + '    <input type="text" class="otp-input" maxlength="1" data-index="0" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">' 
      + '    <input type="text" class="otp-input" maxlength="1" data-index="1" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">' 
      + '    <input type="text" class="otp-input" maxlength="1" data-index="2" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">' 
      + '    <input type="text" class="otp-input" maxlength="1" data-index="3" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">' 
      + '    <input type="text" class="otp-input" maxlength="1" data-index="4" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">' 
      + '    <input type="text" class="otp-input" maxlength="1" data-index="5" oninput="App.handleOTPInput(event)" onkeydown="App.handleOTPKeydown(event)">' 
      + '  </div>'
      + '  <p class="otp-timer" id="otp-timer">Resend OTP in <span id="otp-countdown">30</span>s</p>'
      + '  <button type="submit" class="btn btn-primary w-full mb-4">Verify & Create Account <i class="fas fa-check"></i></button>'
      + '  <button type="button" class="btn btn-ghost w-full" onclick="App.resetRegisterForm()"><i class="fas fa-arrow-left"></i>Change Details</button>'
      + '</form>';
  },

  // ========================================
  // DASHBOARD
  // ========================================
  Dashboard: function () {
    var state = Store.getState();

    if (!state.isLoggedIn) {
      setTimeout(function () { Router.navigate('/login'); }, 50);
      return '<div class="auth-page"><p>Redirecting to login...</p></div>';
    }

    var userName = state.user && (state.user.fullName || state.user.name) ? (state.user.fullName || state.user.name) : 'User';
    var userPhone = state.user && state.user.phone ? '+91 ' + state.user.phone : '';

    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({ title: 'My Dashboard', subtitle: 'Bookings and profile', breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Dashboard' }] })
      + '    <div class="dashboard-welcome card-flat" style="padding: 32px; margin-bottom: 24px; display:flex; gap: 18px; align-items:center; flex-wrap:wrap;">'
      + '      <div style="width: 72px; height: 72px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: 18px; display:flex; align-items:center; justify-content:center;">'
      + '        <i class="fas fa-user" style="font-size: 28px; color:#fff;"></i>'
      + '      </div>'
      + '      <div style="flex:1; min-width: 200px;">'
      + '        <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 4px;">Hi, ' + userName + '</h2>'
      + '        <p style="color: var(--text-secondary);">' + userPhone + '</p>'
      + '      </div>'
      + '      <button class="btn btn-secondary" onclick="App.logout()"><i class="fas fa-sign-out-alt"></i>Logout</button>'
      + '    </div>'
      + '    <div id="dashboard-bookings" class="card-flat" style="padding: 28px;">'
      + '      <div style="display:flex; justify-content: space-between; align-items:center; gap: 12px; margin-bottom: 18px;">'
      + '        <h3 style="font-size: 18px; font-weight: 800;">My Bookings</h3>'
      + '        <a href="#/services" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i>Book New</a>'
      + '      </div>'
      + '      <div id="dashboard-bookings-body">'
      +          Components.EmptyState({ icon: 'fa-calendar-alt', title: 'Loading...', description: 'Fetching your bookings.' })
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // SEARCH
  // ========================================
  Search: function (context) {
    var query = (context && context.query) ? context.query : {};
    var searchTerm = query.q || '';

    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({ title: 'Search', subtitle: 'Search ceremonies and pandits', breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Search' }] })
      + '    <div class="card-flat" style="padding: 24px; margin-bottom: 18px;">'
      + '      <form onsubmit="App.handleSearch(event)" style="display:flex; gap: 12px; flex-wrap:wrap;">'
      + '        <div style="flex:1; min-width: 250px;">'
      + '          <div style="position: relative;">'
      + '            <input type="text" id="search-input" class="input" placeholder="Search for ceremonies or pandits..." value="' + (searchTerm || '') + '" autocomplete="off" oninput="App.typeaheadInput(event,\'search\')" onfocus="App.typeaheadFocus(\'search\')" onkeydown="App.typeaheadKeydown(event,\'search\')">'
      + '            <div id="search-suggest" class="typeahead hidden" aria-label="Search suggestions"></div>'
      + '          </div>'
      + '        </div>'
      + '        <button type="submit" class="btn btn-primary"><i class="fas fa-search"></i>Search</button>'
      + '      </form>'
      + '    </div>'
      + '    <div id="search-results">'
      +          (searchTerm
                ? Components.EmptyState({ icon: 'fa-search', title: 'Searching...', description: 'Fetching results...' })
                : Components.EmptyState({ icon: 'fa-search', title: 'Start Searching', description: 'Type a ceremony name to search services.' }))
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // ABOUT
  // ========================================
  About: function () {
    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px;">'
      + '  <div class="container">'
      +       Components.PageHeader({ title: 'About SacredConnect', subtitle: 'Keeping traditions alive — with trust, clarity, and care', breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'About' }] })
      + '    <div style="max-width: 980px; margin: 0 auto; display:grid; gap: 18px;">'
      + '      <div class="card-flat" style="padding: 36px;">'
      + '        <h2 class="font-display" style="font-size: 28px; font-weight: 800; margin-bottom: 10px;">A culture worth protecting</h2>'
      + '        <p style="color: var(--text-secondary); line-height: 1.9;">For many families, rituals are more than ceremonies — they are moments of gratitude, healing, and togetherness. But over time, the knowledge and trusted community connections behind these traditions are fading. Families move cities. Elders aren\'t always nearby. And finding the right pandit at the right time becomes stressful, especially when emotions are high.</p>'
      + '      </div>'
      + '      <div class="card-flat" style="padding: 36px;">'
      + '        <h3 class="font-display" style="font-size: 22px; font-weight: 800; margin-bottom: 10px;">Why we built SacredConnect</h3>'
      + '        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">'
      + '          <div class="card-flat" style="padding: 18px; border: 1px solid var(--border);">'
      + '            <div style="font-weight: 900; margin-bottom: 6px;"><i class="fas fa-shield-halved" style="color: var(--primary);"></i> Trust first</div>'
      + '            <div style="color: var(--text-secondary); line-height: 1.8;">Clear verification signals so families can choose confidently — not blindly.</div>'
      + '          </div>'
      + '          <div class="card-flat" style="padding: 18px; border: 1px solid var(--border);">'
      + '            <div style="font-weight: 900; margin-bottom: 6px;"><i class="fas fa-indian-rupee-sign" style="color: #f59e0b;"></i> Transparent pricing</div>'
      + '            <div style="color: var(--text-secondary); line-height: 1.8;">No awkward negotiations. No uncertainty. A smoother experience for everyone.</div>'
      + '          </div>'
      + '          <div class="card-flat" style="padding: 18px; border: 1px solid var(--border);">'
      + '            <div style="font-weight: 900; margin-bottom: 6px;"><i class="fas fa-people-group" style="color: #22c55e;"></i> Community connection</div>'
      + '            <div style="color: var(--text-secondary); line-height: 1.8;">Bringing families and pandits together — across cities and generations.</div>'
      + '          </div>'
      + '          <div class="card-flat" style="padding: 18px; border: 1px solid var(--border);">'
      + '            <div style="font-weight: 900; margin-bottom: 6px;"><i class="fas fa-clock" style="color: #60a5fa;"></i> Reliable scheduling</div>'
      + '            <div style="color: var(--text-secondary); line-height: 1.8;">Simple booking, reminders, and clear expectations — especially for time-sensitive ceremonies.</div>'
      + '          </div>'
      + '        </div>'
      + '      </div>'
      + '      <div class="card-flat" style="padding: 36px;">'
      + '        <h3 class="font-display" style="font-size: 22px; font-weight: 800; margin-bottom: 10px;">Our promise</h3>'
      + '        <p style="color: var(--text-secondary); line-height: 1.9;">We\'re building SacredConnect to be respectful to tradition and practical for modern life. Whether you\'re planning a family ceremony in Chennai or coordinating from another city/country for your parents, SacredConnect helps you do it with clarity, dignity, and care.</p>'
      + '        <div style="display:flex; gap: 12px; flex-wrap:wrap; margin-top: 16px;">'
      + '          <a class="btn btn-primary" href="#/services"><i class="fas fa-layer-group"></i>Explore services</a>'
      + '          <a class="btn btn-secondary" href="#/pandit/register"><i class="fas fa-user-plus"></i>Join as a pandit</a>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // CONTACT
  // ========================================
  Contact: function () {
    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px;">'
      + '  <div class="container">'
      +       Components.PageHeader({ title: 'Contact Us', subtitle: 'We would love to hear from you', breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Contact' }] })
      + '    <div style="display:grid; gap: 22px; max-width: 980px; margin: 0 auto;">'
      + '      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px;">'
      + '        <div class="card-flat" style="padding: 28px; text-align:center;">'
      + '          <div style="width: 56px; height: 56px; margin: 0 auto 12px; background: var(--primary-light); border-radius: 16px; display:flex; align-items:center; justify-content:center;">'
      + '            <i class="fas fa-phone" style="color: var(--primary); font-size: 20px;"></i>'
      + '          </div>'
      + '          <h3 style="font-weight: 800; margin-bottom: 6px;">Phone</h3>'
      + '          <p style="color: var(--text-secondary);">+91 96291 84024</p>'
      + '        </div>'
      + '        <div class="card-flat" style="padding: 28px; text-align:center;">'
      + '          <div style="width: 56px; height: 56px; margin: 0 auto 12px; background: #dcfce7; border-radius: 16px; display:flex; align-items:center; justify-content:center;">'
      + '            <i class="fab fa-whatsapp" style="color: #22c55e; font-size: 24px;"></i>'
      + '          </div>'
      + '          <h3 style="font-weight: 800; margin-bottom: 6px;">WhatsApp</h3>'
      + '          <p style="color: var(--text-secondary);">Chat: +91 96291 84024</p>'
      + '        </div>'
      + '        <div class="card-flat" style="padding: 28px; text-align:center;">'
      + '          <div style="width: 56px; height: 56px; margin: 0 auto 12px; background: var(--primary-light); border-radius: 16px; display:flex; align-items:center; justify-content:center;">'
      + '            <i class="fas fa-envelope" style="color: var(--primary); font-size: 20px;"></i>'
      + '          </div>'
      + '          <h3 style="font-weight: 800; margin-bottom: 6px;">Email</h3>'
      + '          <p style="color: var(--text-secondary);">its.sash024@gmail.com</p>'
      + '        </div>'
      + '      </div>'
      + '      <div class="card-flat" style="padding: 36px;">'
      + '        <h2 style="font-size: 20px; font-weight: 900; margin-bottom: 18px;">Send a Message</h2>'
      + '        <form onsubmit="App.handleContact(event)">'
      + '          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">'
      + '            <div class="input-group" style="margin-bottom: 0;">'
      + '              <label class="label">Name</label>'
      + '              <input type="text" class="input" required>'
      + '            </div>'
      + '            <div class="input-group" style="margin-bottom: 0;">'
      + '              <label class="label">Email</label>'
      + '              <input type="email" class="input" required>'
      + '            </div>'
      + '          </div>'
      + '          <div class="input-group">'
      + '            <label class="label">Message</label>'
      + '            <textarea class="input" rows="5" required style="resize: vertical;"></textarea>'
      + '          </div>'
      + '          <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i>Send</button>'
      + '        </form>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // STORE
  // ========================================
  Store: function () {
    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({ title: 'Ceremony Essentials Store', subtitle: 'Coming soon', breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Store' }] })
      +       Components.EmptyState({ icon: 'fa-shopping-bag', title: 'Store Coming Soon', description: 'We are setting up a curated essentials store for each ceremony.', action: { text: 'Go Home', icon: 'fa-home', onClick: "Router.navigate('/home')" } })
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // BOOK
  // ========================================
  Book: function (context) {
    var params = (context && context.params) ? context.params : {};
    var serviceSlug = params.service || null;

    // UI skeletons
    var servicesSkeleton = '';
    for (var i = 0; i < 8; i++) servicesSkeleton += Components.Skeleton.service();

    var panditsSkeleton = '';
    for (var p = 0; p < 6; p++) panditsSkeleton += Components.Skeleton.pandit();

    // -------------------------------------------------
    // A) No service selected → show services list only
    // -------------------------------------------------
    if (!serviceSlug) {
      return ''
        + Components.Navbar()
        + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
        + '  <div class="container">'
        +       Components.PageHeader({
                  title: 'Book a Pandit',
                  subtitle: 'Pick a ceremony first. Then you’ll see available pandits.',
                  breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Book' }]
                })
        + '    <div class="card-flat" style="padding: 18px; margin-bottom: 16px; display:flex; align-items:center; justify-content: space-between; gap: 12px; flex-wrap:wrap;">'
        + '      <div style="font-weight: 900;">Choose a ceremony</div>'
        + '      <a href="#/services" class="btn btn-secondary btn-sm"><i class="fas fa-layer-group"></i>Browse all ceremonies</a>'
        + '    </div>'
        + '    <div id="book-services" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">'
        +        servicesSkeleton
        + '    </div>'
        + '    <div id="book-services-empty" class="hidden">'
        +        Components.EmptyState({
                  icon: 'fa-om',
                  title: 'No Ceremonies Yet',
                  description: 'We are onboarding ceremonies in your city. Please check back soon.',
                  action: { text: 'Go Home', icon: 'fa-home', onClick: "Router.navigate('/home')" }
                })
        + '    </div>'
        + '  </div>'
        + '</main>'
        + Components.Footer();
    }

    // -------------------------------------------------
    // B) Service selected → show service summary + filters + pandits (clean UX)
    // -------------------------------------------------
    var ceremonyName = Utils.unslugify(serviceSlug);

    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({
                title: 'Choose a Pandit',
                subtitle: 'Compare profiles and choose the best match for your ceremony.',
                breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Book', href: '#/book' }, { label: ceremonyName }]
              })

      + '    <div class="card-flat" style="padding: 18px; margin-bottom: 14px;">'
      + '      <div class="booking-selected">'
      + '        <div class="booking-selected-title">'
      + '          <span class="badge badge-primary"><i class="fas fa-om"></i> Selected</span>'
      + '          <div style="font-weight: 900;" id="book-selected-name">' + ceremonyName + '</div>'
      + '        </div>'
      + '        <a class="btn btn-secondary btn-sm" href="#/book"><i class="fas fa-rotate-left"></i>Change ceremony</a>'
      + '      </div>'
      + '      <div id="book-service-summary" class="book-service-summary">'
      + '        <div class="skeleton" style="width: 40%; height: 14px; margin: 14px 0 10px; border-radius: 10px;"></div>'
      + '        <div class="skeleton" style="width: 100%; height: 12px; margin-bottom: 8px; border-radius: 10px;"></div>'
      + '        <div class="skeleton" style="width: 70%; height: 12px; border-radius: 10px;"></div>'
      + '      </div>'
      + '    </div>'

      + '    <div id="book-filters" class="card-flat book-filters">'
      + '      <div class="book-filters-head">'
      + '        <div style="font-weight: 900;">Filter pandits</div>'
      + '        <button class="btn btn-ghost btn-sm" type="button" onclick="App.resetBookFilters()"><i class="fas fa-rotate"></i>Reset</button>'
      + '      </div>'
      + '      <div class="book-filters-grid">'
      + '        <div>'
      + '          <label class="label" style="margin-bottom: 6px;">Language</label>'
      + '          <select id="book-filter-language" class="input" onchange="App.applyBookFilters()">'
      + '            <option value="">Any</option>'
      + '          </select>'
      + '        </div>'
      + '        <div>'
      + '          <label class="label" style="margin-bottom: 6px;">Rating</label>'
      + '          <select id="book-filter-rating" class="input" onchange="App.applyBookFilters()">'
      + '            <option value="0">Any</option>'
      + '            <option value="4">4+ stars</option>'
      + '            <option value="4.5">4.5+ stars</option>'
      + '          </select>'
      + '        </div>'
      + '        <div>'
      + '          <label class="label" style="margin-bottom: 6px;">Experience</label>'
      + '          <select id="book-filter-exp" class="input" onchange="App.applyBookFilters()">'
      + '            <option value="0">Any</option>'
      + '            <option value="5">5+ years</option>'
      + '            <option value="10">10+ years</option>'
      + '            <option value="20">20+ years</option>'
      + '          </select>'
      + '        </div>'
      + '        <div>'
      + '          <label class="label" style="margin-bottom: 6px;">Sort</label>'
      + '          <select id="book-filter-sort" class="input" onchange="App.applyBookFilters()">'
      + '            <option value="recommended">Recommended</option>'
      + '            <option value="rating">Rating (high → low)</option>'
      + '            <option value="experience">Experience (high → low)</option>'
      + '            <option value="price">Price (low → high)</option>'
      + '          </select>'
      + '        </div>'
      + '      </div>'
      + '    </div>'

      + '    <div id="book-pandits" class="pandit-grid" style="margin-top: 16px;">'
      +        panditsSkeleton
      + '    </div>'
      + '    <div id="book-pandits-empty" class="hidden">'
      +        Components.EmptyState({
                icon: 'fa-user-tie',
                title: 'No Pandits Available Yet',
                description: 'We are onboarding verified pandits for this ceremony in your city. Please check back soon.',
                action: { text: 'Browse all pandits', icon: 'fa-users', onClick: "Router.navigate('/pandits')" }
              })
      + '    </div>'

      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // PANDIT REGISTER
  // ========================================
  PanditRegister: function () {
    var state = Store.getState();
    var cityOptions = '';
    var live = state.liveCity || 'Chennai';
    for (var i = 0; i < state.cities.length; i++) {
      var city = state.cities[i];
      if (city === live) {
        cityOptions += '<option value="' + city + '" selected>' + city + ' (Live)</option>';
      } else {
        cityOptions += '<option value="' + city + '" disabled>' + city + ' (Coming soon)</option>';
      }
    }

    return ''
      + Components.Navbar()
      + '<main class="auth-page" style="padding-top: 120px;">'
      + '  <div class="auth-card" style="max-width: 540px;">'
      + '    <div class="auth-header">'
      + '      <div class="auth-icon" style="background: linear-gradient(135deg, #22c55e, #16a34a);"><i class="fas fa-user-tie"></i></div>'
      + '      <h1 class="auth-title">Join as a Pandit</h1>'
      + '      <p class="auth-subtitle">Apply to offer services on SacredConnect</p>'
      + '    </div>'
      + '    <form onsubmit="App.handlePanditRegister(event)">'
      + '      <div class="input-group"><label class="label">Full Name</label><input type="text" class="input" required></div>'
      + '      <div class="input-group"><label class="label">Phone</label><div class="phone-input"><span class="phone-input-prefix">+91</span><input type="tel" class="input" maxlength="10" required></div></div>'
      + '      <div class="input-group"><label class="label">City</label><select class="input" required><option value="">Select your city</option>' + cityOptions + '</select></div>'
      + '      <div class="input-group"><label class="label">Years of Experience</label><input type="number" class="input" min="0" required></div>'
      + '      <button type="submit" class="btn btn-primary w-full" style="background: linear-gradient(135deg, #22c55e, #16a34a);">Submit Application <i class="fas fa-arrow-right"></i></button>'
      + '    </form>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // ADMIN DASHBOARD
  // ========================================
  AdminDashboard: function () {
    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({
                title: 'Admin Panel',
                subtitle: 'Overview & moderation tools',
                breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Admin' }]
              })
      + '    <div id="admin-dashboard-mount">'
      +          Components.EmptyState({ icon: 'fa-spinner', title: 'Loading...', description: 'Fetching admin dashboard.' })
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // ADMIN - PENDING PANDITS
  // ========================================
  AdminPandits: function () {
    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({
                title: 'Pending Pandit Applications',
                subtitle: 'Review and approve new pandits',
                breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Admin', href: '#/admin' }, { label: 'Pending Pandits' }]
              })
      + '    <div id="admin-pandits-mount">'
      +          Components.EmptyState({ icon: 'fa-spinner', title: 'Loading...', description: 'Fetching pending applications.' })
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // SUPPORT
  // ========================================
  Support: function (context) {
    var query = (context && context.query) ? context.query : {};
    var audience = query.audience || 'customer';

    var title = audience === 'pandit' ? 'Pandit Support' : 'Support Center';
    var subtitle = audience === 'pandit'
      ? 'Help for onboarding, bookings, and profile verification.'
      : 'Help with booking, payments, and general questions.';

    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({ title: title, subtitle: subtitle, breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Support' }] })
      + '    <div style="max-width: 980px; margin: 0 auto; display:grid; gap: 16px;">'
      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-weight: 900; margin-bottom: 8px;">Quick links</h3>'
      + '        <div style="display:flex; gap: 10px; flex-wrap:wrap;">'
      + '          <a class="btn btn-secondary btn-sm" href="#/faqs"><i class="fas fa-circle-question"></i>FAQs</a>'
      + '          <a class="btn btn-secondary btn-sm" href="#/contact"><i class="fas fa-envelope"></i>Contact</a>'
      + '          <a class="btn btn-secondary btn-sm" href="https://wa.me/919629184024" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i>WhatsApp</a>'
      + '        </div>'
      + '      </div>'
      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-weight: 900; margin-bottom: 10px;">Common issues</h3>'
      + '        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">'
      + '          <div class="card-flat" style="padding: 16px; border:1px solid var(--border);">'
      + '            <div style="font-weight: 900; margin-bottom: 6px;">Booking help</div>'
      + '            <div style="color: var(--text-secondary);">Need to book, reschedule or cancel? Start from your dashboard.</div>'
      + '            <div style="margin-top: 10px;"><a href="#/dashboard" style="color: var(--primary); font-weight: 800; text-decoration:none;">Go to Dashboard →</a></div>'
      + '          </div>'
      + '          <div class="card-flat" style="padding: 16px; border:1px solid var(--border);">'
      + '            <div style="font-weight: 900; margin-bottom: 6px;">Login / OTP</div>'
      + '            <div style="color: var(--text-secondary);">If OTP is delayed, wait 30 seconds and resend.</div>'
      + '            <div style="margin-top: 10px;"><a href="#/login" style="color: var(--primary); font-weight: 800; text-decoration:none;">Go to Login →</a></div>'
      + '          </div>'
      + '          <div class="card-flat" style="padding: 16px; border:1px solid var(--border);">'
      + '            <div style="font-weight: 900; margin-bottom: 6px;">Pandit onboarding</div>'
      + '            <div style="color: var(--text-secondary);">Join as a pandit and complete your profile for faster verification.</div>'
      + '            <div style="margin-top: 10px;"><a href="#/pandit/register" style="color: var(--primary); font-weight: 800; text-decoration:none;">Apply →</a></div>'
      + '          </div>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // FAQs
  // ========================================
  FAQs: function () {
    // Dedicated FAQ page (no FAQs shown directly on Home)
    var faqs = [
      // Booking basics
      { q: 'How do I book a pandit on SacredConnect?', a: 'Go to Services (or Book Now), choose a ceremony, then select an available pandit and request a time slot. You can also search directly from the Home page.' },
      { q: 'Which city do you currently support?', a: 'We are currently live in Chennai. More cities will be enabled as we onboard verified pandits and services.' },
      { q: 'Do I need an account to book?', a: 'Yes. You’ll be asked to log in using OTP before placing a booking so we can securely share booking updates and protect your details.' },

      // Pricing & payments
      { q: 'Is pricing fixed?', a: 'Pricing is displayed clearly wherever possible. Some ceremonies may vary based on duration, add-ons, location, or special requirements. You’ll always see the details before confirming.' },
      { q: 'Are there any extra charges?', a: 'Potential extra charges (if applicable) include add-ons and travel fees. We aim to keep pricing transparent and show a clear breakdown before you confirm.' },

      // Verification & trust
      { q: 'How are pandits verified?', a: 'Pandits go through profile and identity checks. Their verification status is displayed on their profile so you can decide confidently.' },
      { q: 'Can I choose a pandit who speaks my language?', a: 'Yes. Each pandit profile lists languages spoken, and you can select a pandit based on language comfort.' },

      // Essentials / samagri
      { q: 'Do you provide ceremony essentials?', a: 'Essentials support will be available as we onboard the catalog. When enabled, you’ll see kit options and what to arrange yourself during booking.' },
      { q: 'What if I already have the required items?', a: 'You can choose self-arranged essentials. The pandit can also guide you on what items are required based on the ceremony.' },

      // Changes & cancellations
      { q: 'Can I reschedule or cancel?', a: 'Yes. You can manage changes from your Dashboard. The exact rules depend on how close the booking is and will be shown before you confirm.' },
      { q: 'What if the pandit is late or doesn’t arrive?', a: 'If there’s an issue, contact Support from the Support Center or WhatsApp. We’ll help resolve quickly and fairly.' },

      // NRI / remote
      { q: 'Can I book for my parents or family from another city/country?', a: 'Yes. You can book on behalf of family and add all ceremony details in the booking notes. Remote coordination features will be expanded over time.' },

      // Privacy
      { q: 'Is my phone number visible to everyone?', a: 'No. We protect user privacy. Where contact is required, it may be shared only for confirmed bookings or through controlled channels.' },

      // Support
      { q: 'How do I contact support?', a: 'Use the Support Center page for quick links, FAQs, and contact options. For faster help, you can also reach us via WhatsApp.' }
    ];

    var html = '';
    for (var i = 0; i < faqs.length; i++) {
      html += ''
        + '<div class="faq-item card-flat" style="margin-bottom: 14px; overflow:hidden;">'
        + '  <button class="faq-question" onclick="App.toggleFAQ(' + i + ')" style="width:100%; padding: 18px 20px; display:flex; justify-content: space-between; align-items:center; background:none; border:none; cursor:pointer; text-align:left;">'
        + '    <span style="font-weight: 800;">' + faqs[i].q + '</span>'
        + '    <i class="fas fa-chevron-down faq-icon-' + i + '" style="color: var(--text-muted); transition: transform 0.3s;"></i>'
        + '  </button>'
        + '  <div class="faq-answer faq-answer-' + i + '" style="max-height: 0; overflow:hidden; transition: max-height 0.3s ease-out;">'
        + '    <div style="padding: 0 20px 18px; color: var(--text-secondary); line-height: 1.8;">' + faqs[i].a + '</div>'
        + '  </div>'
        + '</div>';
    }

    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({ title: 'FAQs', subtitle: 'Quick answers to common questions', breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'FAQs' }] })
      + '    <div style="max-width: 860px; margin: 0 auto;">'
      +          html
      + '      <div class="card-flat" style="padding: 22px; margin-top: 18px;">'
      + '        <div style="font-weight: 900; margin-bottom: 8px;">Still need help?</div>'
      + '        <div style="color: var(--text-secondary); margin-bottom: 12px;">Contact us and we’ll respond as soon as possible.</div>'
      + '        <a class="btn btn-primary" href="#/contact"><i class="fas fa-envelope"></i>Contact Support</a>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // PRIVACY
  // ========================================
  Privacy: function () {
    var updated = new Date().toLocaleDateString('en-IN');

    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({ title: 'Privacy Policy', subtitle: 'How SacredConnect handles your information', breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Privacy' }] })
      + '    <div style="max-width: 980px; margin: 0 auto; display:grid; gap: 16px;">'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <span class="badge badge-primary" style="margin-bottom: 10px;"><i class="fas fa-shield-halved"></i> Transparency First</span>'
      + '        <h2 class="font-display" style="font-size: 24px; font-weight: 800; margin-bottom: 10px;">Quick Summary</h2>'
      + '        <ul style="color: var(--text-secondary); line-height: 1.9; padding-left: 18px;">'
      + '          <li>We collect only what is needed to provide bookings, support, and account security.</li>'
      + '          <li>We do <strong style="color: var(--text-primary);">not</strong> sell personal data.</li>'
      + '          <li>We use trusted third-party services (hosting, email/SMS, storage) only to operate the platform.</li>'
      + '          <li>You can request access, correction, or deletion of your data (subject to legal/operational requirements).</li>'
      + '        </ul>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">1) Information We Collect</h3>'
      + '        <div style="color: var(--text-secondary); line-height: 1.9;">'
      + '          <p><strong style="color: var(--text-primary);">Account details</strong>: phone number, name, email (optional), and login verification data.</p>'
      + '          <p><strong style="color: var(--text-primary);">Booking details</strong>: selected service, date/time, location/address, and special instructions needed to deliver the ceremony.</p>'
      + '          <p><strong style="color: var(--text-primary);">Optional profile details</strong>: preferences such as language or ceremony needs that help improve matching.</p>'
      + '          <p><strong style="color: var(--text-primary);">Technical data</strong>: basic logs for security, troubleshooting, and abuse prevention.</p>'
      + '        </div>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">2) How We Use Information</h3>'
      + '        <ul style="color: var(--text-secondary); line-height: 1.9; padding-left: 18px;">'
      + '          <li>To create and secure your account (OTP login).</li>'
      + '          <li>To match you with available pandits and coordinate bookings.</li>'
      + '          <li>To communicate important updates (OTP, confirmations, reminders).</li>'
      + '          <li>To improve reliability, safety, and overall product experience.</li>'
      + '        </ul>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">3) Sharing & Disclosure</h3>'
      + '        <div style="color: var(--text-secondary); line-height: 1.9;">'
      + '          <p>We share limited information only when required to operate the service:</p>'
      + '          <ul style="padding-left: 18px;">'
      + '            <li><strong style="color: var(--text-primary);">With pandits</strong> to fulfill a booking (name, schedule, location, instructions).</li>'
      + '            <li><strong style="color: var(--text-primary);">With vendors/providers</strong> (hosting, storage, email/SMS) strictly for platform operations.</li>'
      + '            <li><strong style="color: var(--text-primary);">Legal</strong>: if required to comply with law or prevent fraud/abuse.</li>'
      + '          </ul>'
      + '        </div>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">4) Data Security</h3>'
      + '        <div style="color: var(--text-secondary); line-height: 1.9;">'
      + '          <p>We use standard security measures like authentication checks and access controls. Please do not share your OTP with anyone.</p>'
      + '          <p><strong style="color: var(--text-primary);">Note:</strong> No system is 100% secure. If you suspect misuse, contact support immediately.</p>'
      + '        </div>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">5) Your Choices</h3>'
      + '        <ul style="color: var(--text-secondary); line-height: 1.9; padding-left: 18px;">'
      + '          <li>Update your profile details anytime.</li>'
      + '          <li>Request deletion by contacting support (some records may be retained for legal/accounting needs).</li>'
      + '          <li>Choose how you receive non-essential communications (where available).</li>'
      + '        </ul>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">6) Contact</h3>'
      + '        <p style="color: var(--text-secondary); line-height: 1.9;">Questions about privacy? Email <strong style="color: var(--text-primary);">its.sash024@gmail.com</strong> or use our Support Center.</p>'
      + '        <div style="margin-top: 12px; display:flex; gap: 10px; flex-wrap:wrap;">'
      + '          <a class="btn btn-secondary btn-sm" href="#/contact"><i class="fas fa-envelope"></i>Contact Support</a>'
      + '          <a class="btn btn-primary btn-sm" href="#/support"><i class="fas fa-headset"></i>Support Center</a>'
      + '        </div>'
      + '      </div>'

      + '      <p style="text-align:center; color: var(--text-muted); font-size: 13px; margin-top: 10px;">Last updated: ' + updated + '.</p>'

      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // TERMS
  // ========================================
  Terms: function () {
    var updated = new Date().toLocaleDateString('en-IN');

    return ''
      + Components.Navbar()
      + '<main class="section section-cream" style="padding-top: 120px; min-height: 100vh;">'
      + '  <div class="container">'
      +       Components.PageHeader({ title: 'Terms of Service', subtitle: 'Clear terms for using SacredConnect', breadcrumb: [{ label: 'Home', href: '#/home' }, { label: 'Terms' }] })
      + '    <div style="max-width: 980px; margin: 0 auto; display:grid; gap: 16px;">'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <span class="badge badge-primary" style="margin-bottom: 10px;"><i class="fas fa-file-signature"></i> Please Read</span>'
      + '        <h2 class="font-display" style="font-size: 24px; font-weight: 800; margin-bottom: 10px;">Quick Summary</h2>'
      + '        <ul style="color: var(--text-secondary); line-height: 1.9; padding-left: 18px;">'
      + '          <li>By using SacredConnect, you agree to these terms.</li>'
      + '          <li>Bookings depend on pandit availability and confirmation rules shown at checkout.</li>'
      + '          <li>You agree to provide accurate booking details and a safe venue.</li>'
      + '          <li>Payments, cancellations, and refunds follow the policy shown during booking.</li>'
      + '        </ul>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">1) Accounts & Security</h3>'
      + '        <div style="color: var(--text-secondary); line-height: 1.9;">'
      + '          <p>You must use a valid phone number and keep your OTP confidential.</p>'
      + '          <p>You are responsible for actions taken under your account.</p>'
      + '        </div>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">2) Booking & Service Delivery</h3>'
      + '        <ul style="color: var(--text-secondary); line-height: 1.9; padding-left: 18px;">'
      + '          <li>Provide accurate address, timing, and instructions.</li>'
      + '          <li>Pandits may decline or suggest a new time based on availability or constraints.</li>'
      + '          <li>SacredConnect facilitates discovery and booking; the ceremony is performed by the pandit.</li>'
      + '        </ul>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">3) Payments</h3>'
      + '        <div style="color: var(--text-secondary); line-height: 1.9;">'
      + '          <p>Payment terms (advance/full payment, fees, taxes) are shown during booking.</p>'
      + '          <p>Payment processing may involve trusted third-party providers.</p>'
      + '        </div>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">4) Cancellations & Refunds</h3>'
      + '        <div style="color: var(--text-secondary); line-height: 1.9;">'
      + '          <p>Cancellation and refund rules depend on the service, time to booking, and payment status.</p>'
      + '          <p>Exact terms will be displayed during booking and inside booking details.</p>'
      + '        </div>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">5) Reviews & Community Guidelines</h3>'
      + '        <ul style="color: var(--text-secondary); line-height: 1.9; padding-left: 18px;">'
      + '          <li>Reviews must be honest and respectful.</li>'
      + '          <li>Harassment, hate, or abuse can lead to account restrictions.</li>'
      + '          <li>We may remove content that violates guidelines or law.</li>'
      + '        </ul>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">6) Limitation of Liability</h3>'
      + '        <div style="color: var(--text-secondary); line-height: 1.9;">'
      + '          <p>SacredConnect provides a booking platform. We work to show verification signals and improve quality, but outcomes can vary.</p>'
      + '          <p>Where legally permitted, liability is limited to amounts paid through the platform for the booking in question.</p>'
      + '        </div>'
      + '      </div>'

      + '      <div class="card-flat" style="padding: 28px;">'
      + '        <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 10px;">7) Contact</h3>'
      + '        <p style="color: var(--text-secondary); line-height: 1.9;">Questions about these terms? Email <strong style="color: var(--text-primary);">its.sash024@gmail.com</strong>.</p>'
      + '        <div style="margin-top: 12px; display:flex; gap: 10px; flex-wrap:wrap;">'
      + '          <a class="btn btn-secondary btn-sm" href="#/contact"><i class="fas fa-envelope"></i>Contact Support</a>'
      + '          <a class="btn btn-primary btn-sm" href="#/support"><i class="fas fa-headset"></i>Support Center</a>'
      + '        </div>'
      + '      </div>'

      + '      <p style="text-align:center; color: var(--text-muted); font-size: 13px; margin-top: 10px;">Last updated: ' + updated + '.</p>'

      + '    </div>'
      + '  </div>'
      + '</main>'
      + Components.Footer();
  },

  // ========================================
  // 404
  // ========================================
  NotFound: function () {
    return ''
      + Components.Navbar()
      + '<main class="auth-page">'
      + '  <div style="text-align:center; max-width: 520px;">'
      + '    <div style="font-size: 110px; margin-bottom: 18px;">🧭</div>'
      + '    <h1 class="font-display" style="font-size: 44px; font-weight: 800; margin-bottom: 12px;">Page Not Found</h1>'
      + '    <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 22px;">The page you\'re looking for doesn\'t exist.</p>'
      + '    <a href="#/home" class="btn btn-primary btn-lg"><i class="fas fa-home"></i>Back to Home</a>'
      + '  </div>'
      + '</main>';
  }
};

window.Pages = Pages;