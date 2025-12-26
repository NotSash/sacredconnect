// ========================================
// APP - Main Application Controller (API Connected)
// ========================================

const App = {
    otpTimer: null,

    // booking page state (client-side filters)
    _book: {
        service: null,
        panditsRaw: [],
        panditsView: []
    },

    // typeahead state
    _typeahead: {
        hero: { items: [], open: false, activeIndex: -1, query: '', timer: null },
        search: { items: [], open: false, activeIndex: -1, query: '', timer: null }
    },

    async init() {
        console.log('🙏 SacredConnect initializing...');

        this.registerRoutes();
        Router.init();
        this.setupEventListeners();

        // bootstrap auth if token exists
        await this.bootstrapAuth();

        setTimeout(() => {
            this.hideLoader();
        }, 500);

        console.log('✅ SacredConnect ready!');
    },

    registerRoutes() {
        // Canonical landing route
        Router.register('/home', () => this.render(Pages.Home()));
        // Backward-compatible alias
        Router.register('/', () => Router.navigate('/home'));
        Router.register('/services', (ctx) => this.render(Pages.Services(ctx)));
        Router.register('/services/:category', (ctx) => this.render(Pages.Services(ctx)));
        Router.register('/pandits', () => this.render(Pages.Pandits()));
        Router.register('/pandits/:id', (ctx) => this.render(Pages.PanditDetail(ctx)));
        Router.register('/login', () => this.render(Pages.Login()));
        Router.register('/register', () => this.render(Pages.Register()));
        Router.register('/dashboard', () => this.render(Pages.Dashboard()));
        Router.register('/search', (ctx) => this.render(Pages.Search(ctx)));
        Router.register('/about', () => this.render(Pages.About()));
        Router.register('/contact', () => this.render(Pages.Contact()));
        Router.register('/support', (ctx) => this.render(Pages.Support(ctx)));
        Router.register('/faqs', () => this.render(Pages.FAQs()));
        Router.register('/privacy', () => this.render(Pages.Privacy()));
        Router.register('/terms', () => this.render(Pages.Terms()));
        Router.register('/store', () => this.render(Pages.Store()));
        Router.register('/book', (ctx) => this.render(Pages.Book(ctx)));
        Router.register('/book/:service', (ctx) => this.render(Pages.Book(ctx)));
        Router.register('/pandit/register', () => this.render(Pages.PanditRegister()));

        // Admin
        Router.register('/admin', () => this.render(Pages.AdminDashboard()));
        Router.register('/admin/pandits', () => this.render(Pages.AdminPandits()));

        Router.register('/404', () => this.render(Pages.NotFound()));
    },

    render(html) {
        const app = document.getElementById('app');
        app.innerHTML = html;

        this.setupNavbarScroll();
        this.setupBackToTop();
        this.loadDynamicContent();
    },

    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
    },

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
                this.closeTypeahead('hero');
                this.closeTypeahead('search');
                this.closeCityMenu();
            }
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            const t = e.target;
            const inHero = t && t.closest && t.closest('#hero-search-input');
            const inHeroBox = t && t.closest && t.closest('#hero-suggest');
            if (!inHero && !inHeroBox) this.closeTypeahead('hero');

            const inSearch = t && t.closest && t.closest('#search-input');
            const inSearchBox = t && t.closest && t.closest('#search-suggest');
            if (!inSearch && !inSearchBox) this.closeTypeahead('search');
        });

        // City dropdown (custom)
        document.addEventListener('click', (e) => {
            const t = e.target;

            // Toggle city menu
            const btn = t && t.closest ? t.closest('#hero-city-btn') : null;
            if (btn) {
                e.preventDefault();
                this.toggleCityMenu();
                return;
            }

            // Select live city
            const opt = t && t.closest ? t.closest('.city-option') : null;
            if (opt && opt.id !== 'hero-city-btn') {
                const city = opt.getAttribute('data-city');
                const isDisabled = opt.classList.contains('disabled');
                if (city && !isDisabled) {
                    Store.setCity(city);
                    const label = document.getElementById('hero-city-label');
                    if (label) label.textContent = city;
                    Utils.toast(`Location set to ${city}`, 'success');
                    this.closeCityMenu();
                    // refresh home featured pandits
                    const path = Router.getCurrentPath().split('?')[0];
                    if (path === '/home') this.loadHomeData();
                }
                return;
            }

            // Close menu if clicking outside
            const inMenu = t && t.closest && t.closest('#hero-city-menu');
            if (!inMenu && !(t && t.closest && t.closest('#hero-city-btn'))) {
                this.closeCityMenu();
            }
        });
    },

    setupNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        const currentPath = Router.getCurrentPath();
        const isHomePage = currentPath === '/home' || currentPath === '/' || currentPath === '';

        const handleScroll = () => {
            if (window.scrollY > 50) {
                navbar.classList.remove('transparent');
                navbar.classList.add('scrolled');
            } else if (isHomePage) {
                navbar.classList.remove('scrolled');
                navbar.classList.add('transparent');
            }
        };

        if (!isHomePage) {
            navbar.classList.remove('transparent');
            navbar.classList.add('scrolled');
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    },

    setupBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;

        const handleScroll = () => {
            if (window.scrollY > 300) btn.classList.add('visible');
            else btn.classList.remove('visible');
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        btn.addEventListener('click', () => Utils.scrollToTop());
    },

    async bootstrapAuth() {
        // if token exists, try /auth/me
        const token = Utils.storage.get('sc_token', null);
        if (!token) return;

        Store.setToken(token);

        try {
            // Prefer /users/me (stable user profile endpoint)
            let me = null;
            try {
                me = await API.users.me();
            } catch (_) {
                // fallback to /auth/me
                me = await API.auth.me();
            }

            if (me && me.data && me.data.user) {
                Store.login({ token: token, user: me.data.user });
            }
        } catch (e) {
            // token invalid
            Store.logout();
        }
    },

    // ============================
    // Dynamic page data loaders
    // ============================

    loadDynamicContent() {
        const full = Router.getCurrentPath();
        const path = full.split('?')[0];

        if (path === '/' || path === '/home') this.loadHomeData();
        if (path === '/pandits') this.loadPanditsPage();
        if (path.startsWith('/pandits/')) this.loadPanditDetailPage(path.split('/')[2]);
        if (path === '/dashboard') this.loadDashboard();
        if (path === '/search') this.loadSearch(full);
        if (path === '/services' || path.startsWith('/services/')) this.loadServicesPage(path.split('/')[2] || null);
        if (path === '/book') this.loadBookPage(null);
        if (path.startsWith('/book/')) this.loadBookPage(path.split('/')[2] || null);

        // Admin
        if (path === '/admin') this.loadAdminDashboard();
        if (path === '/admin/pandits') this.loadAdminPandits();
    },

    async loadHomeData() {
        // categories
        try {
            const res = await API.categories.listRoot();
            const cats = (res && res.data) ? res.data : [];
            const grid = document.getElementById('home-categories');
            const empty = document.getElementById('home-categories-empty');
            if (grid && empty) {
                if (!cats || cats.length === 0) {
                    grid.classList.add('hidden');
                    empty.classList.remove('hidden');
                } else {
                    grid.classList.remove('hidden');
                    empty.classList.add('hidden');
                    grid.innerHTML = cats.map(c => Components.CategoryCard({
                        name: c.name,
                        slug: c.slug,
                        icon: c.icon || '🙏',
                        subtitle: c.description ? Utils.truncate(c.description, 24) : (c.serviceCount ? (c.serviceCount + ' services') : '')
                    })).join('');
                }
            }
        } catch (e) {
            // keep skeleton, but show empty
            const grid = document.getElementById('home-categories');
            const empty = document.getElementById('home-categories-empty');
            if (grid && empty) {
                grid.classList.add('hidden');
                empty.classList.remove('hidden');
            }
        }

        // featured pandits by city
        try {
            const city = Store.getState().selectedCity;
            const res = await API.pandits.featured({ city: city, limit: 8 });
            const list = (res && res.data) ? res.data : [];
            const grid = document.getElementById('home-pandits-grid');
            const empty = document.getElementById('home-pandits-empty');
            if (grid && empty) {
                if (!list || list.length === 0) {
                    grid.classList.add('hidden');
                    empty.classList.remove('hidden');
                } else {
                    grid.classList.remove('hidden');
                    empty.classList.add('hidden');
                    grid.innerHTML = list.map(p => Components.PanditCard({
                        id: p.id,
                        name: p.displayName,
                        photo: p.profilePhoto,
                        rating: (p.rating && p.rating > 0) ? p.rating.toFixed(1) : '—',
                        experience: p.yearsOfExperience || '—',
                        specialization: (p.specializations && p.specializations.length) ? p.specializations[0] : (p.tagline || 'Religious Ceremonies'),
                        verified: (p.verificationLevel && p.verificationLevel !== 'basic') || false
                    })).join('');
                }
            }
        } catch (e) {
            const grid = document.getElementById('home-pandits-grid');
            const empty = document.getElementById('home-pandits-empty');
            if (grid && empty) {
                grid.classList.add('hidden');
                empty.classList.remove('hidden');
            }
        }

        // stats: best-effort (no hardcoded)
        try {
            const panditsRes = await API.pandits.list({ limit: 1, page: 1 });
            const totalPandits = panditsRes && panditsRes.pagination ? panditsRes.pagination.total : null;
            const elPandits = document.getElementById('stats-pandits');
            if (elPandits) elPandits.textContent = (typeof totalPandits === 'number') ? totalPandits.toString() : '—';
        } catch (_) {
            const elPandits = document.getElementById('stats-pandits');
            if (elPandits) elPandits.textContent = '—';
        }
        // other stats not available publicly yet
        const elCer = document.getElementById('stats-ceremonies');
        const elCities = document.getElementById('stats-cities');
        const elRating = document.getElementById('stats-rating');
        if (elCer) elCer.textContent = '—';
        if (elCities) elCities.textContent = '—';
        if (elRating) elRating.textContent = '—';
    },

    async loadPanditsPage() {
        const grid = document.getElementById('pandits-grid');
        const empty = document.getElementById('pandits-empty');
        if (!grid || !empty) return;

        try {
            const city = Store.getState().selectedCity;
            const res = await API.pandits.list({ city: city, page: 1, limit: 24 });
            const list = res && res.data ? res.data : [];

            if (!list || list.length === 0) {
                grid.classList.add('hidden');
                empty.classList.remove('hidden');
                return;
            }

            grid.classList.remove('hidden');
            empty.classList.add('hidden');

            grid.innerHTML = list.map(p => Components.PanditCard({
                id: p.id,
                name: p.displayName,
                photo: p.profilePhoto,
                rating: (p.rating && p.rating > 0) ? p.rating.toFixed(1) : '—',
                experience: p.yearsOfExperience || '—',
                specialization: (p.specializations && p.specializations.length) ? p.specializations[0] : (p.tagline || 'Religious Ceremonies'),
                verified: (p.verificationLevel && p.verificationLevel !== 'basic') || false
            })).join('');
        } catch (e) {
            grid.classList.add('hidden');
            empty.classList.remove('hidden');
        }
    },

    async loadPanditDetailPage(id) {
        const container = document.getElementById('pandit-detail');
        if (!container) return;

        try {
            const res = await API.pandits.getById(id);
            const data = res && res.data ? res.data : null;
            if (!data || !data.pandit) {
                container.innerHTML = Components.EmptyState({ icon: 'fa-user-tie', title: 'Pandit Not Found', description: 'This profile is not available.', action: { text: 'Back to Pandits', icon: 'fa-arrow-left', onClick: "Router.navigate('/pandits')" } });
                return;
            }

            const p = data.pandit;
            const services = data.services || [];

            const languages = (p.languages || []).slice(0, 4).join(', ');
            const specializations = (p.specializations || []).slice(0, 3).join(', ');

            let servicesHtml = '';
            if (services.length) {
                servicesHtml = '<div style="margin-top: 18px;">'
                    + '<h3 style="font-size: 16px; font-weight: 800; margin-bottom: 10px;">Services</h3>'
                    + '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">'
                    + services.map(s => {
                        return '<div class="card-flat" style="padding: 16px;">'
                            + '<div style="font-weight: 800; margin-bottom: 6px;">' + (s.name || 'Service') + '</div>'
                            + '<div style="color: var(--text-secondary); font-size: 14px;">From ' + Utils.formatCurrency(s.price || 0) + '</div>'
                            + '</div>';
                    }).join('')
                    + '</div>'
                    + '</div>';
            }

            container.innerHTML = ''
                + '<div style="display:flex; gap: 18px; align-items: center; flex-wrap:wrap;">'
                + '  <div style="width: 84px; height: 84px; border-radius: 18px; overflow:hidden; background: #f5f5f4; display:flex; align-items:center; justify-content:center;">'
                + (p.profilePhoto ? '<img src="' + p.profilePhoto + '" alt="' + (p.displayName || 'Pandit') + '" style="width:100%; height:100%; object-fit:cover;">' : '<i class="fas fa-user-circle" style="font-size: 48px; color:#d6d3d1;"></i>')
                + '  </div>'
                + '  <div style="flex:1; min-width: 220px;">'
                + '    <div style="display:flex; align-items:center; gap: 10px; flex-wrap:wrap;">'
                + '      <h2 style="font-size: 22px; font-weight: 900;">' + (p.displayName || 'Pandit') + '</h2>'
                + (p.verificationLevel && p.verificationLevel !== 'basic' ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Verified</span>' : '')
                + '    </div>'
                + '    <p style="color: var(--text-secondary); margin-top: 6px;">' + (p.tagline || 'Religious Ceremonies') + '</p>'
                + '    <div style="display:flex; gap: 14px; margin-top: 10px; flex-wrap:wrap; color: var(--text-muted); font-weight: 600;">'
                + '      <span><i class="fas fa-star" style="color:#f59e0b;"></i> ' + ((p.stats && p.stats.averageRating) ? p.stats.averageRating.toFixed(1) : '—') + '</span>'
                + '      <span><i class="fas fa-briefcase"></i> ' + (p.yearsOfExperience || '—') + ' yrs</span>'
                + '      <span><i class="fas fa-location-dot"></i> ' + (p.baseCity || '—') + '</span>'
                + '    </div>'
                + '  </div>'
                + '  <a class="btn btn-primary" href="https://wa.me/919629184024" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i>Chat</a>'
                + '</div>'
                + '<div style="margin-top: 18px; display:grid; gap: 12px;">'
                + '  <div class="card-flat" style="padding: 16px;">'
                + '    <div style="font-weight: 800; margin-bottom: 6px;">About</div>'
                + '    <div style="color: var(--text-secondary); line-height: 1.8;">' + (p.bio ? p.bio : 'Bio will be available once the pandit completes their profile.') + '</div>'
                + '  </div>'
                + '  <div class="card-flat" style="padding: 16px;">'
                + '    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">'
                + '      <div><div style="font-weight:800; margin-bottom: 6px;">Languages</div><div style="color: var(--text-secondary);">' + (languages || '—') + '</div></div>'
                + '      <div><div style="font-weight:800; margin-bottom: 6px;">Specializations</div><div style="color: var(--text-secondary);">' + (specializations || '—') + '</div></div>'
                + '    </div>'
                + '  </div>'
                + '</div>'
                + servicesHtml;

        } catch (e) {
            container.innerHTML = Components.EmptyState({ icon: 'fa-triangle-exclamation', title: 'Unable to Load Profile', description: e.message || 'Please try again later.', action: { text: 'Back to Pandits', icon: 'fa-arrow-left', onClick: "Router.navigate('/pandits')" } });
        }
    },

    async loadDashboard() {
        const state = Store.getState();
        if (!state.isLoggedIn) return;

        const body = document.getElementById('dashboard-bookings-body');
        if (!body) return;

        try {
            const res = await API.bookings.myBookings({ page: 1, limit: 10 });
            const list = res && res.data ? res.data : [];

            if (!list || list.length === 0) {
                body.innerHTML = Components.EmptyState({ icon: 'fa-calendar-alt', title: 'No Bookings Yet', description: 'When you book a ceremony, it will show up here.', action: { text: 'Browse Services', icon: 'fa-om', onClick: "Router.navigate('/services')" } });
                return;
            }

            let items = '<div style="display:grid; gap: 12px;">';
            for (var i = 0; i < list.length; i++) {
                var b = list[i];
                items += '<div class="card-flat" style="padding: 16px; display:flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap:wrap;">'
                    + '<div>'
                    + '  <div style="font-weight: 900;">' + (b.serviceName || 'Ceremony') + '</div>'
                    + '  <div style="color: var(--text-secondary); font-size: 14px;">' + Utils.formatDate(b.date) + ' • ' + (b.time || '') + ' • ' + (b.status || '') + '</div>'
                    + '</div>'
                    + '<div style="font-weight: 900; color: var(--primary);">' + Utils.formatCurrency(b.totalAmount) + '</div>'
                    + '</div>';
            }
            items += '</div>';
            body.innerHTML = items;
        } catch (e) {
            body.innerHTML = Components.EmptyState({ icon: 'fa-triangle-exclamation', title: 'Could not load bookings', description: e.message || 'Please try again later.' });
        }
    },

    async loadSearch(fullHash) {
        const parts = fullHash.split('?');
        const qs = parts[1] || '';
        const params = new URLSearchParams(qs);
        const q = params.get('q') || '';

        const container = document.getElementById('search-results');
        if (!container) return;

        if (!q) {
            container.innerHTML = Components.EmptyState({ icon: 'fa-search', title: 'Start Searching', description: 'Type a ceremony name to search services.' });
            return;
        }

        try {
            const res = await API.services.search(q);
            const list = res && res.data ? res.data : [];
            if (!list || list.length === 0) {
                container.innerHTML = Components.EmptyState({ icon: 'fa-search', title: 'No Results Found', description: 'Try a different keyword or browse categories.', action: { text: 'Browse Services', icon: 'fa-om', onClick: "Router.navigate('/services')" } });
                return;
            }

            let html = '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">';
            for (var i = 0; i < list.length; i++) {
                var s = list[i];
                html += '<div class="card-flat" style="padding: 16px;">'
                    + '<div style="display:flex; align-items:center; gap:10px;">'
                    + '<div style="width: 42px; height: 42px; border-radius: 12px; background: var(--primary-light); display:flex; align-items:center; justify-content:center; font-size: 20px;">' + (s.icon || '🙏') + '</div>'
                    + '<div style="font-weight: 900;">' + (s.name || 'Service') + '</div>'
                    + '</div>'
                    + '<div style="color: var(--text-secondary); margin-top: 10px;">From ' + Utils.formatCurrency((s.price && s.price.min != null) ? s.price.min : null) + '</div>'
                    + '</div>';
            }
            html += '</div>';
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = Components.EmptyState({ icon: 'fa-triangle-exclamation', title: 'Search Failed', description: e.message || 'Please try again later.' });
        }
    },

    async loadServicesPage(categorySlug) {
        const grid = document.getElementById('services-grid');
        const empty = document.getElementById('services-empty');
        if (!grid || !empty) return;

        try {
            const res = await API.services.list({ category: categorySlug || '', page: 1, limit: 24, city: Store.getState().selectedCity });
            const list = res && res.data ? res.data : [];

            if (!list || list.length === 0) {
                grid.classList.add('hidden');
                empty.classList.remove('hidden');
                return;
            }

            grid.classList.remove('hidden');
            empty.classList.add('hidden');

            let html = '';
            for (var i = 0; i < list.length; i++) {
                var s = list[i];
                html += '<div class="card" style="padding: 18px;">'
                    + '<div style="width: 54px; height: 54px; border-radius: 16px; background: var(--primary-light); display:flex; align-items:center; justify-content:center; font-size: 24px; margin-bottom: 12px;">' + (s.icon || '🙏') + '</div>'
                    + '<div style="font-weight: 900; font-size: 16px; margin-bottom: 6px;">' + (s.name || 'Service') + '</div>'
                    + '<div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px;">' + (s.description ? Utils.truncate(s.description, 90) : 'Details will be available soon.') + '</div>'
                    + '<div style="display:flex; align-items:center; justify-content: space-between; gap: 12px;">'
                    + '<div style="font-weight: 900; color: var(--primary);">From ' + Utils.formatCurrency((s.price && s.price.min != null) ? s.price.min : null) + '</div>'
                    + '<a href="#/book/' + encodeURIComponent(s.slug) + '" class="btn btn-secondary btn-sm">Choose</a>'
                    + '</div>'
                    + '</div>';
            }

            grid.innerHTML = html;
        } catch (e) {
            grid.classList.add('hidden');
            empty.classList.remove('hidden');
        }
    },

    async loadBookPage(serviceSlug) {
        const servicesGrid = document.getElementById('book-services');
        const servicesEmpty = document.getElementById('book-services-empty');
        const panditsGrid = document.getElementById('book-pandits');
        const panditsEmpty = document.getElementById('book-pandits-empty');

        // If no service selected, list services
        if (!serviceSlug) {
            // reset book state
            this._book = { service: null, panditsRaw: [], panditsView: [] };

            if (!servicesGrid || !servicesEmpty) return;
            try {
                const res = await API.services.list({ page: 1, limit: 24, city: Store.getState().selectedCity });
                const list = res && res.data ? res.data : [];

                if (!list || list.length === 0) {
                    servicesGrid.classList.add('hidden');
                    servicesEmpty.classList.remove('hidden');
                    return;
                }

                servicesGrid.classList.remove('hidden');
                servicesEmpty.classList.add('hidden');

                let html = '';
                for (var i = 0; i < list.length; i++) {
                    var s = list[i];
                    const priceLabel = (s.price && s.price.min != null)
                        ? ('From ' + Utils.formatCurrency(s.price.min))
                        : 'View pandits';

                    html += '<div class="card" style="padding: 18px;">'
                        + '<div style="width: 54px; height: 54px; border-radius: 16px; background: var(--primary-light); display:flex; align-items:center; justify-content:center; font-size: 24px; margin-bottom: 12px;">' + (s.icon || '🙏') + '</div>'
                        + '<div style="font-weight: 900; font-size: 16px; margin-bottom: 6px;">' + (s.name || 'Ceremony') + '</div>'
                        + '<div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px;">' + (s.description ? Utils.truncate(s.description, 90) : 'Details will be available soon.') + '</div>'
                        + '<div style="display:flex; align-items:center; justify-content: space-between; gap: 12px;">'
                        + '<div style="font-weight: 900; color: var(--primary);">' + priceLabel + '</div>'
                        + '<a href="#/book/' + encodeURIComponent(s.slug) + '" class="btn btn-primary btn-sm">Choose</a>'
                        + '</div>'
                        + '</div>';
                }

                servicesGrid.innerHTML = html;
            } catch (e) {
                servicesGrid.classList.add('hidden');
                servicesEmpty.classList.remove('hidden');
            }
            return;
        }

        // If service selected, show service summary + pandits offering that service
        if (!panditsGrid || !panditsEmpty) return;

        try {
            const res = await API.services.getBySlug(serviceSlug);
            const data = res && res.data ? res.data : null;

            const service = data && data.service ? data.service : null;
            const list = (data && data.pandits) ? data.pandits : [];

            // Store raw list for filtering
            this._book.service = service;
            this._book.panditsRaw = Array.isArray(list) ? list : [];
            this._book.panditsView = Array.isArray(list) ? list.slice() : [];

            // Render service summary
            this.renderBookServiceSummary(service);
            // Fill language dropdown options based on pandits list (ensure DOM mounted)
            if (document.getElementById('book-filter-language')) {
                this.populateBookLanguages(this._book.panditsRaw);
            } else {
                setTimeout(() => this.populateBookLanguages(this._book.panditsRaw), 0);
            }

            if (!list || list.length === 0) {
                panditsGrid.classList.add('hidden');
                panditsEmpty.classList.remove('hidden');
                return;
            }

            panditsGrid.classList.remove('hidden');
            panditsEmpty.classList.add('hidden');

            // Apply default (recommended) sort/filter once
            this.applyBookFilters();
        } catch (e) {
            panditsGrid.classList.add('hidden');
            panditsEmpty.classList.remove('hidden');
        }
    },

    // ============================
    // Mobile menu
    // ============================

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-overlay');
        if (!menu || !overlay) return;

        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    },

    closeMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-overlay');
        if (!menu || !overlay) return;

        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    // ============================
    // Auth flows (API)
    // ============================

    async handleLoginPhone(e) {
        e.preventDefault();

        const inputEl = document.getElementById('login-identifier');
        const identifier = (inputEl && inputEl.value ? inputEl.value : '').trim();

        const isEmail = identifier.includes('@');
        const isPhone = Utils.isValidPhone(identifier);

        if (!identifier || (!isEmail && !isPhone)) {
            Utils.toast('Enter a valid phone number or email address', 'error');
            inputEl && inputEl.focus();
            return;
        }

        // store identifier for verification step (could be phone or email)
        Store.setState({ authPhone: identifier });

        try {
            const res = await API.auth.sendOTP(identifier, 'login');
            const data = res && res.data ? res.data : null;

            // If user typed email, backend returns phone in response data.
            // Store returned phone for robustness.
            if (data && data.phone) {
                Store.setState({ authPhone: identifier, authResolvedPhone: data.phone, authEmail: data.email || '' });
            }

            const container = document.getElementById('auth-form-container');
            if (container) {
                container.innerHTML = Pages.LoginOTPForm(identifier, data && data.email ? data.email : null);
                const firstInput = container.querySelector('.otp-input');
                if (firstInput) firstInput.focus();
                this.startOTPTimer();
            }

            Utils.toast('OTP sent successfully', 'success');
        } catch (err) {
            if (err.status === 404) {
                Utils.toast('No account found. Please register first.', 'warning');
                Router.navigate('/register');
                return;
            }
            Utils.toast(err.message || 'Failed to send OTP', 'error');
        }
    },

    async handleLoginOTP(e) {
        e.preventDefault();

        const inputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(inputs).map(i => i.value).join('');

        if (otp.length !== 6) {
            Utils.toast('Please enter the complete 6-digit OTP', 'error');
            return;
        }

        const identifier = Store.getState().authPhone;

        try {
            const res = await API.auth.verifyOTP(identifier, otp, 'login');
            const data = res && res.data ? res.data : null;
            if (!data || !data.token || !data.user) throw new Error('Invalid login response');

            Store.login({ token: data.token, user: data.user });
            Utils.toast('Login successful', 'success');
            if (this.otpTimer) clearInterval(this.otpTimer);
            Router.navigate('/dashboard');
        } catch (err) {
            Utils.toast(err.message || 'OTP verification failed', 'error');
        }
    },

    handleOTPInput(e) {
        const input = e.target;
        const index = parseInt(input.dataset.index);
        const value = input.value;
        input.value = value.replace(/\D/g, '');
        if (value && index < 5) {
            const nextInput = document.querySelector('.otp-input[data-index="' + (index + 1) + '"]');
            if (nextInput) nextInput.focus();
        }
    },

    handleOTPKeydown(e) {
        const input = e.target;
        const index = parseInt(input.dataset.index);
        if (e.key === 'Backspace' && !input.value && index > 0) {
            const prevInput = document.querySelector('.otp-input[data-index="' + (index - 1) + '"]');
            if (prevInput) {
                prevInput.focus();
                prevInput.value = '';
            }
        }
    },

    startOTPTimer() {
        let seconds = 30;
        const countdownEl = document.getElementById('otp-countdown');
        const timerEl = document.getElementById('otp-timer');
        if (this.otpTimer) clearInterval(this.otpTimer);

        this.otpTimer = setInterval(() => {
            seconds--;
            if (countdownEl) countdownEl.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(this.otpTimer);
                if (timerEl) timerEl.innerHTML = '<span class="otp-resend" onclick="App.resendOTP()">Resend OTP</span>';
            }
        }, 1000);
    },

    async resendOTP() {
        const identifier = Store.getState().authPhone;
        try {
            await API.auth.sendOTP(identifier, 'login');
            Utils.toast('OTP resent', 'success');
        } catch (e) {
            Utils.toast('Failed to resend OTP', 'error');
        }

        const timerEl = document.getElementById('otp-timer');
        if (timerEl) timerEl.innerHTML = 'Resend OTP in <span id="otp-countdown">30</span>s';
        this.startOTPTimer();
    },

    resetLoginForm() {
        if (this.otpTimer) clearInterval(this.otpTimer);
        Store.setState({ authPhone: '', authResolvedPhone: null, authEmail: null });
        const container = document.getElementById('auth-form-container');
        if (container) container.innerHTML = Pages.LoginIdentifierForm();
    },

    async handleRegisterStart(e) {
        e.preventDefault();

        const nameEl = document.getElementById('register-name');
        const phoneEl = document.getElementById('register-phone');
        const emailEl = document.getElementById('register-email');

        const name = ((nameEl && nameEl.value) ? nameEl.value : '').trim();
        const phone = ((phoneEl && phoneEl.value) ? phoneEl.value : '').trim();
        const email = ((emailEl && emailEl.value) ? emailEl.value : '').trim();

        if (!name) return Utils.toast('Please enter your name', 'error');
        if (!Utils.isValidPhone(phone)) return Utils.toast('Please enter a valid phone number', 'error');
        if (!email || !Utils.isValidEmail(email)) return Utils.toast('Please enter a valid email', 'error');

        Store.setState({ registerDraft: { fullName: name, phone: phone, email: email }, authPhone: phone });

        try {
            await API.auth.sendOTP(phone, 'registration', email);
            const container = document.getElementById('register-form-container');
            if (container) {
                container.innerHTML = Pages.RegisterOTPForm(phone);
                const first = container.querySelector('.otp-input');
                if (first) first.focus();
                this.startOTPTimer();
            }
            Utils.toast('OTP sent to your phone', 'success');
        } catch (e) {
            Utils.toast(e.message || 'Failed to send OTP', 'error');
        }
    },

    async handleRegisterVerify(e) {
        e.preventDefault();

        const inputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(inputs).map(i => i.value).join('');
        if (otp.length !== 6) return Utils.toast('Please enter the complete 6-digit OTP', 'error');

        const draft = Store.getState().registerDraft;
        if (!draft) return Utils.toast('Please start registration again', 'error');

        try {
            const res = await API.auth.register({
                phone: draft.phone,
                fullName: draft.fullName,
                email: draft.email || undefined,
                otp: otp
            });

            const data = res && res.data ? res.data : null;
            if (!data || !data.token || !data.user) throw new Error('Invalid registration response');

            Store.login({ token: data.token, user: data.user });
            Store.setState({ registerDraft: null });
            Utils.toast('Account created successfully', 'success');
            if (this.otpTimer) clearInterval(this.otpTimer);
            Router.navigate('/dashboard');
        } catch (e) {
            Utils.toast(e.message || 'Registration failed', 'error');
        }
    },

    resetRegisterForm() {
        if (this.otpTimer) clearInterval(this.otpTimer);
        Store.setState({ registerDraft: null, authPhone: '' });
        const container = document.getElementById('register-form-container');
        if (container) container.innerHTML = Pages.RegisterStartForm();
    },

    async handlePanditRegister(e) {
        e.preventDefault();
        Utils.toast('Pandit onboarding will be enabled soon. Thank you!', 'info');
        Router.navigate('/home');
    },

    handleContact(e) {
        e.preventDefault();
        Utils.toast('Message sent! We\'ll get back to you soon.', 'success');
        e.target.reset();
    },

    handleSearch(e) {
        e.preventDefault();

        // If typeahead is open and something is highlighted, choose it
        const t = this._typeahead.search;
        if (t && t.open && t.activeIndex >= 0 && t.items[t.activeIndex]) {
            this.selectTypeaheadItem('search', t.activeIndex);
            return;
        }

        const input = document.getElementById('search-input');
        const query = input && input.value ? input.value.trim() : '';
        if (!query) return Utils.toast('Please enter a search term', 'warning');
        Router.navigate('/search?q=' + encodeURIComponent(query));
    },

    handleHeroSearch() {
        // If typeahead is open and something is highlighted, choose it
        const t = this._typeahead.hero;
        if (t && t.open && t.activeIndex >= 0 && t.items[t.activeIndex]) {
            this.selectTypeaheadItem('hero', t.activeIndex);
            return;
        }

        const input = document.getElementById('hero-search-input');
        const query = input && input.value ? input.value.trim() : '';
        if (query) Router.navigate('/search?q=' + encodeURIComponent(query));
        else Router.navigate('/services');
    },

    // ============================
    // Typeahead (Search Suggestions)
    // ============================

    typeaheadFocus(ctx) {
        const t = this._typeahead[ctx];
        if (!t) return;
        if (t.items && t.items.length) {
            this.openTypeahead(ctx);
        }
    },

    typeaheadInput(e, ctx) {
        const t = this._typeahead[ctx];
        if (!t) return;

        const value = (e && e.target && e.target.value) ? e.target.value.trim() : '';
        t.query = value;

        if (t.timer) clearTimeout(t.timer);

        if (!value || value.length < 2) {
            t.items = [];
            t.activeIndex = -1;
            this.closeTypeahead(ctx);
            return;
        }

        // debounce
        t.timer = setTimeout(() => {
            this.fetchTypeahead(ctx, value);
        }, 180);
    },

    async fetchTypeahead(ctx, q) {
        const t = this._typeahead[ctx];
        if (!t) return;

        const box = document.getElementById(ctx === 'hero' ? 'hero-suggest' : 'search-suggest');
        if (box) {
            box.classList.remove('hidden');
            box.innerHTML = '<div style="padding:12px 14px; color: var(--text-muted); font-weight: 700;">Searching…</div>';
        }

        // ignore stale
        const currentQ = q;

        try {
            const city = Store.getState().selectedCity;

            const svcP = API.services.search(currentQ);
            const panditP = API.pandits.list({ search: currentQ, city: city, page: 1, limit: 6 });

            const results = await Promise.allSettled([svcP, panditP]);

            const servicesRes = results[0].status === 'fulfilled' ? results[0].value : null;
            const panditsRes = results[1].status === 'fulfilled' ? results[1].value : null;

            // if query changed during await, ignore
            if (t.query !== currentQ) return;

            const services = servicesRes && servicesRes.data ? servicesRes.data : [];
            const pandits = panditsRes && panditsRes.data ? panditsRes.data : [];

            const items = [];

            // services first
            for (let i = 0; i < Math.min(5, services.length); i++) {
                const s = services[i];
                items.push({
                    kind: 'service',
                    label: s.name,
                    sub: (s.category && s.category.name) ? s.category.name : 'Ceremony',
                    icon: s.icon || '🙏',
                    slug: s.slug
                });
            }

            // pandits next
            for (let j = 0; j < Math.min(5, pandits.length); j++) {
                const p = pandits[j];
                items.push({
                    kind: 'pandit',
                    label: p.displayName,
                    sub: p.baseCity ? ('Available in ' + p.baseCity) : 'Pandit',
                    icon: '👤',
                    id: p.id
                });
            }

            t.items = items;
            t.activeIndex = items.length ? 0 : -1;

            if (!items.length) {
                if (box) {
                    box.classList.remove('hidden');
                    box.innerHTML = '<div style="padding:12px 14px; color: var(--text-muted);">No suggestions. Try a different keyword.</div>';
                }
                return;
            }

            this.openTypeahead(ctx);
            this.renderTypeahead(ctx);
        } catch (e) {
            // fail silently
            this.closeTypeahead(ctx);
        }
    },

    openTypeahead(ctx) {
        const box = document.getElementById(ctx === 'hero' ? 'hero-suggest' : 'search-suggest');
        const t = this._typeahead[ctx];
        if (!box || !t) return;
        t.open = true;
        box.classList.remove('hidden');
        this.renderTypeahead(ctx);
    },

    closeTypeahead(ctx) {
        const box = document.getElementById(ctx === 'hero' ? 'hero-suggest' : 'search-suggest');
        const t = this._typeahead[ctx];
        if (t) t.open = false;
        if (box) box.classList.add('hidden');
    },

    // ============================
    // City dropdown (Chennai-only for now)
    // ============================
    toggleCityMenu() {
        const menu = document.getElementById('hero-city-menu');
        const btn = document.getElementById('hero-city-btn');
        if (!menu || !btn) return;
        const isOpen = !menu.classList.contains('hidden');
        if (isOpen) this.closeCityMenu();
        else {
            menu.classList.remove('hidden');
            btn.setAttribute('aria-expanded', 'true');
        }
    },

    closeCityMenu() {
        const menu = document.getElementById('hero-city-menu');
        const btn = document.getElementById('hero-city-btn');
        if (menu) menu.classList.add('hidden');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    },

    renderTypeahead(ctx) {
        const box = document.getElementById(ctx === 'hero' ? 'hero-suggest' : 'search-suggest');
        const t = this._typeahead[ctx];
        if (!box || !t) return;

        const items = t.items || [];
        if (!items.length) {
            box.classList.add('hidden');
            return;
        }

        let html = '';
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const active = i === t.activeIndex ? ' active' : '';
            html += ''
                + '<button type="button" class="typeahead-item' + active + '" onclick="App.selectTypeaheadItem(\'' + ctx + '\',' + i + ')">'
                + '  <span class="typeahead-left">'
                + '    <span class="typeahead-icon">' + (it.icon || '•') + '</span>'
                + '    <span class="typeahead-text">'
                + '      <span class="typeahead-label">' + (it.label || '') + '</span>'
                + '      <span class="typeahead-sub">' + (it.sub || '') + '</span>'
                + '    </span>'
                + '  </span>'
                + '  <span class="typeahead-kind">' + (it.kind === 'pandit' ? 'Pandit' : 'Service') + '</span>'
                + '</button>';
        }

        box.innerHTML = html;
    },

    typeaheadKeydown(e, ctx) {
        const t = this._typeahead[ctx];
        if (!t) return;

        if (!t.open || !t.items || !t.items.length) {
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            t.activeIndex = Math.min(t.items.length - 1, t.activeIndex + 1);
            this.renderTypeahead(ctx);
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            t.activeIndex = Math.max(0, t.activeIndex - 1);
            this.renderTypeahead(ctx);
            return;
        }

        if (e.key === 'Enter') {
            if (t.activeIndex >= 0 && t.items[t.activeIndex]) {
                e.preventDefault();
                this.selectTypeaheadItem(ctx, t.activeIndex);
            }
            return;
        }

        if (e.key === 'Escape') {
            this.closeTypeahead(ctx);
        }
    },

    selectTypeaheadItem(ctx, index) {
        const t = this._typeahead[ctx];
        if (!t || !t.items || !t.items[index]) return;
        const it = t.items[index];

        // fill input with label for clarity
        const inputId = ctx === 'hero' ? 'hero-search-input' : 'search-input';
        const input = document.getElementById(inputId);
        if (input) input.value = it.label || '';

        this.closeTypeahead(ctx);

        if (it.kind === 'service') {
            Router.navigate('/book/' + encodeURIComponent(it.slug));
        } else if (it.kind === 'pandit') {
            Router.navigate('/pandits/' + encodeURIComponent(it.id));
        }
    },

    // ============================
    // Booking: Service summary + filters
    // ============================
    renderBookServiceSummary(service) {
        const mount = document.getElementById('book-service-summary');
        if (!mount) return;

        const slug = service && service.slug ? service.slug : '';
        const name = service && service.name ? service.name : (slug ? Utils.unslugify(slug) : 'Ceremony');
        const desc = service && service.description ? service.description : '';

        const durMin = service && service.duration && service.duration.min != null ? service.duration.min : null;
        const durMax = service && service.duration && service.duration.max != null ? service.duration.max : null;
        const dur = (durMin != null)
            ? (durMax && durMax !== durMin ? (durMin + '–' + durMax + ' hrs') : (durMin + ' hr'))
            : null;

        const priceMin = service && service.price && service.price.min != null ? service.price.min : null;
        const priceMax = service && service.price && service.price.max != null ? service.price.max : null;
        const price = (priceMin != null)
            ? (priceMax && priceMax !== priceMin ? (Utils.formatCurrency(priceMin) + ' – ' + Utils.formatCurrency(priceMax)) : Utils.formatCurrency(priceMin))
            : null;

        mount.innerHTML = ''
            + '<div class="book-service-row">'
            + '  <div class="book-service-left">'
            + '    <div class="book-service-name">' + name + '</div>'
            + (desc ? ('<div class="book-service-desc">' + Utils.truncate(desc, 140) + '</div>') : '<div class="book-service-desc" style="color:var(--text-muted);">Details will appear here as services are enriched.</div>')
            + '  </div>'
            + '  <div class="book-service-meta">'
            + (dur ? ('<div class="book-pill"><i class="fas fa-clock"></i>' + dur + '</div>') : '')
            + (price ? ('<div class="book-pill"><i class="fas fa-indian-rupee-sign"></i>' + price + '</div>') : '<div class="book-pill" style="opacity:.8;"><i class="fas fa-tag"></i>Pricing varies by pandit</div>')
            + '  </div>'
            + '</div>';
    },

    populateBookLanguages(pandits) {
        const sel = document.getElementById('book-filter-language');
        if (!sel) return;
        const set = new Set();
        (pandits || []).forEach(p => {
            const langs = p.languages || [];
            for (let i = 0; i < langs.length; i++) set.add(langs[i]);
        });
        const list = Array.from(set).sort();

        // keep first option "Any"
        let html = '<option value="">Any</option>';
        for (let i = 0; i < list.length; i++) {
            html += '<option value="' + String(list[i]).replace(/"/g, '') + '">' + list[i] + '</option>';
        }
        sel.innerHTML = html;
    },

    resetBookFilters() {
        const lang = document.getElementById('book-filter-language');
        const rating = document.getElementById('book-filter-rating');
        const exp = document.getElementById('book-filter-exp');
        const sort = document.getElementById('book-filter-sort');

        if (lang) lang.value = '';
        if (rating) rating.value = '0';
        if (exp) exp.value = '0';
        if (sort) sort.value = 'recommended';

        this.applyBookFilters();
    },

    applyBookFilters() {
        const grid = document.getElementById('book-pandits');
        const empty = document.getElementById('book-pandits-empty');
        if (!grid || !empty) return;

        const lang = (document.getElementById('book-filter-language') || {}).value || '';
        const minRating = parseFloat((document.getElementById('book-filter-rating') || {}).value || '0');
        const minExp = parseInt((document.getElementById('book-filter-exp') || {}).value || '0', 10);
        const sort = (document.getElementById('book-filter-sort') || {}).value || 'recommended';

        let list = (this._book.panditsRaw || []).slice();

        // filters
        if (lang) {
            list = list.filter(p => (p.languages || []).indexOf(lang) >= 0);
        }
        if (minRating > 0) {
            list = list.filter(p => (p.rating || 0) >= minRating);
        }
        if (minExp > 0) {
            list = list.filter(p => (p.yearsOfExperience || 0) >= minExp);
        }

        // sorting
        if (sort === 'rating') {
            list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sort === 'experience') {
            list.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
        } else if (sort === 'price') {
            list.sort((a, b) => (a.price || Number.MAX_SAFE_INTEGER) - (b.price || Number.MAX_SAFE_INTEGER));
        } else {
            // recommended: rating desc, reviews desc, exp desc
            list.sort((a, b) => {
                const ra = (a.rating || 0), rb = (b.rating || 0);
                if (rb !== ra) return rb - ra;
                const rca = (a.reviewCount || 0), rcb = (b.reviewCount || 0);
                if (rcb !== rca) return rcb - rca;
                return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
            });
        }

        this._book.panditsView = list;

        if (!list.length) {
            grid.classList.add('hidden');
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        grid.classList.remove('hidden');

        grid.innerHTML = list.map(p => Components.PanditCard({
            id: p.id,
            name: p.displayName,
            photo: p.profilePhoto,
            rating: (p.rating && p.rating > 0) ? p.rating.toFixed(1) : '—',
            experience: p.yearsOfExperience || '—',
            specialization: p.baseCity ? ('Available in ' + p.baseCity) : 'Ceremony Specialist',
            verified: false
        })).join('');
    },

    toggleFAQ(index) {
        const answer = document.querySelector('.faq-answer-' + index);
        const icon = document.querySelector('.faq-icon-' + index);
        if (!answer || !icon) return;

        const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
        if (isOpen) {
            answer.style.maxHeight = '0px';
            icon.style.transform = 'rotate(0deg)';
        } else {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            icon.style.transform = 'rotate(180deg)';
        }
    },

    async logout() {
        try { await API.auth.logout(); } catch (_) {}
        Store.logout();
        this.closeMobileMenu();
        Utils.toast('Logged out', 'info');
        Router.navigate('/home');
    },

    // ============================
    // Admin data loaders
    // ============================

    async loadAdminDashboard() {
        const mount = document.getElementById('admin-dashboard-mount');
        if (!mount) return;

        const state = Store.getState();
        if (!state.isLoggedIn || !state.user || state.user.role !== 'admin') {
            mount.innerHTML = Components.EmptyState({
                icon: 'fa-lock',
                title: 'Admin Access Only',
                description: 'Please login with an admin account to access the admin panel.',
                action: { text: 'Login', icon: 'fa-sign-in-alt', onClick: "Router.navigate('/login')" }
            });
            return;
        }

        try {
            const res = await API.admin.dashboard();
            const d = res && res.data ? res.data : {};

            mount.innerHTML = ''
                + '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">'
                + this._adminStatCard('Users', d.users, 'fa-users', 'rgba(59,130,246,0.12)', '#3B82F6')
                + this._adminStatCard('Pandits', d.pandits, 'fa-user-tie', 'rgba(237,123,18,0.12)', '#ED7B12')
                + this._adminStatCard('Pending Pandits', d.pendingPandits, 'fa-hourglass-half', 'rgba(245,158,11,0.12)', '#F59E0B')
                + this._adminStatCard('Services', d.services, 'fa-om', 'rgba(34,197,94,0.12)', '#22C55E')
                + '</div>'
                + '<div style="margin-top: 18px; display:flex; justify-content:flex-end;">'
                + '  <a href="#/admin/pandits" class="btn btn-primary"><i class="fas fa-user-check"></i>Review Pending Pandits</a>'
                + '</div>';
        } catch (e) {
            mount.innerHTML = Components.EmptyState({
                icon: 'fa-triangle-exclamation',
                title: 'Could not load admin dashboard',
                description: e.message || 'Please try again later.'
            });
        }
    },

    async loadAdminPandits() {
        const mount = document.getElementById('admin-pandits-mount');
        if (!mount) return;

        const state = Store.getState();
        if (!state.isLoggedIn || !state.user || state.user.role !== 'admin') {
            mount.innerHTML = Components.EmptyState({
                icon: 'fa-lock',
                title: 'Admin Access Only',
                description: 'Please login with an admin account to access the admin panel.',
                action: { text: 'Login', icon: 'fa-sign-in-alt', onClick: "Router.navigate('/login')" }
            });
            return;
        }

        try {
            const res = await API.admin.pendingPandits({ page: 1, limit: 25 });
            const list = res && res.data ? res.data : [];

            if (!list.length) {
                mount.innerHTML = Components.EmptyState({
                    icon: 'fa-circle-check',
                    title: 'No Pending Applications',
                    description: 'All pandit applications are processed.'
                });
                return;
            }

            let html = '<div style="display:grid; gap: 12px;">';
            for (let i = 0; i < list.length; i++) {
                const p = list[i];
                html += '<div class="card-flat" style="padding: 16px; display:flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap:wrap;">'
                    + '<div>'
                    + '  <div style="font-weight: 900;">' + (p.displayName || 'Pandit') + '</div>'
                    + '  <div style="color: var(--text-secondary); font-size: 14px;">' + (p.baseCity || '—') + ' • ' + (p.yearsOfExperience || 0) + ' yrs • ' + ((p.languages || []).slice(0, 3).join(', ') || '—') + '</div>'
                    + '</div>'
                    + '<div style="display:flex; gap: 10px; align-items:center; flex-wrap:wrap; justify-content:flex-end;">'
                    + '  <span class="badge badge-warning"><i class="fas fa-hourglass-half"></i> Pending</span>'
                    + '  <button class="btn btn-secondary btn-sm" onclick="App.adminApprovePandit(\'' + p.id + '\')"><i class="fas fa-check"></i>Approve</button>'
                    + '  <button class="btn btn-ghost btn-sm" onclick="App.adminRejectPandit(\'' + p.id + '\')"><i class="fas fa-xmark"></i>Reject</button>'
                    + '</div>'
                    + '</div>';
            }
            html += '</div>';
            mount.innerHTML = html;
        } catch (e) {
            mount.innerHTML = Components.EmptyState({
                icon: 'fa-triangle-exclamation',
                title: 'Could not load pending pandits',
                description: e.message || 'Please try again later.'
            });
        }
    },

    async adminApprovePandit(id) {
        const ok = confirm('Approve this pandit?');
        if (!ok) return;
        try {
            await API.admin.approvePandit(id, 'verified');
            Utils.toast('Pandit approved', 'success');
            this.loadAdminPandits();
        } catch (e) {
            Utils.toast(e.message || 'Approve failed', 'error');
        }
    },

    async adminRejectPandit(id) {
        const reason = prompt('Reason for rejection (optional):', '');
        const ok = confirm('Reject this pandit?');
        if (!ok) return;
        try {
            await API.admin.rejectPandit(id, reason || '');
            Utils.toast('Pandit rejected', 'info');
            this.loadAdminPandits();
        } catch (e) {
            Utils.toast(e.message || 'Reject failed', 'error');
        }
    },

    _adminStatCard(label, value, icon, bg, color) {
        const safeVal = (value === 0 || value) ? value : '—';
        return ''
            + '<div class="card-flat" style="padding: 18px;">'
            + '  <div style="display:flex; align-items:center; gap: 12px;">'
            + '    <div style="width: 44px; height: 44px; border-radius: 14px; background:' + bg + '; display:flex; align-items:center; justify-content:center;">'
            + '      <i class="fas ' + icon + '" style="color:' + color + ';"></i>'
            + '    </div>'
            + '    <div>'
            + '      <div style="font-weight: 900; font-size: 18px;">' + safeVal + '</div>'
            + '      <div style="color: var(--text-secondary); font-size: 13px;">' + label + '</div>'
            + '    </div>'
            + '  </div>'
            + '</div>';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;