// ========================================
// ROUTER - Client-side Routing (History API)
// ========================================
// Clean URLs like: /home, /login, /services
// Note: requires SPA fallback on hosting (Netlify/Cloudflare Pages): rewrite all routes to /index.html

const Router = {
    routes: {},
    currentPath: '/home',

    init() {
        // Handle back/forward
        window.addEventListener('popstate', () => this.handleRoute());

        // Intercept internal link clicks
        document.addEventListener('click', (e) => {
            const a = e.target && e.target.closest ? e.target.closest('a') : null;
            if (!a) return;

            // allow open-in-new-tab etc
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const href = a.getAttribute('href');
            if (!href) return;

            // Ignore external links
            if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }

            // Allow normal hash anchors (e.g. #section)
            if (href.startsWith('#') && !href.startsWith('#/')) {
                return;
            }

            // Support old hash routes (#/home) but convert them to clean routes (/home)
            if (href.startsWith('#/')) {
                e.preventDefault();
                this.navigate(href.slice(1));
                return;
            }

            // Internal route
            if (href.startsWith('/')) {
                e.preventDefault();
                this.navigate(href);
                return;
            }
        });

        // Initial route
        window.addEventListener('load', () => {
            // If user arrives on a hash route, migrate to clean URL once
            const h = window.location.hash || '';
            if (h.startsWith('#/')) {
                const p = h.slice(1);
                history.replaceState({}, '', p + window.location.search);
                window.location.hash = '';
            }

            // Canonicalize root to /home
            if (window.location.pathname === '/' || window.location.pathname === '') {
                history.replaceState({}, '', '/home' + window.location.search);
            }

            this.handleRoute();
        });
    },

    register(path, handler) {
        this.routes[path] = handler;
    },

    navigate(path, opts = {}) {
        if (!path) path = '/home';
        if (!path.startsWith('/')) path = '/' + path;

        // Canonicalize / to /home
        if (path === '/') path = '/home';

        if (opts.replace) history.replaceState({}, '', path);
        else history.pushState({}, '', path);

        this.handleRoute();
    },

    getCurrentPath() {
        // Support direct visits to hash routes by converting them
        const h = window.location.hash || '';
        if (h.startsWith('#/')) {
            const p = h.slice(1);
            history.replaceState({}, '', p + window.location.search);
            window.location.hash = '';
        }

        let p = window.location.pathname || '/home';
        if (!p || p === '/') p = '/home';
        return p;
    },

    handleRoute() {
        const path = this.getCurrentPath();
        this.currentPath = path;
        Store.setState({ currentPage: path });

        let handler = this.routes[path];
        let params = {};

        if (!handler) {
            for (const route in this.routes) {
                const match = this.matchDynamicRoute(route, path);
                if (match) {
                    handler = this.routes[route];
                    params = match;
                    break;
                }
            }
        }

        if (handler) {
            handler({ params, query: this.parseQuery(), path });
        } else if (this.routes['/404']) {
            this.routes['/404']();
        } else if (this.routes['/home']) {
            this.routes['/home']();
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
    },

    matchDynamicRoute(route, path) {
        const routeParts = route.split('/');
        const pathParts = path.split('/');

        if (routeParts.length !== pathParts.length) return null;

        const params = {};
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                params[routeParts[i].slice(1)] = decodeURIComponent(pathParts[i] || '');
            } else if (routeParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    },

    parseQuery() {
        const qs = window.location.search ? window.location.search.slice(1) : '';
        return qs ? Object.fromEntries(new URLSearchParams(qs)) : {};
    },

    isActive(path) {
        return this.currentPath === path;
    }
};

window.Router = Router;