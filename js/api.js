// ========================================
// API - Backend Client (SacredConnect)
// ========================================

(function () {
    // Default base: empty (same-origin). In local dev, index.html sets window.__SC_API_BASE__ automatically.
    const DEFAULT_BASE = '';

    function safeStorageGet(key, def) {
        try {
            if (window.Utils && window.Utils.storage && typeof window.Utils.storage.get === 'function') {
                return window.Utils.storage.get(key, def);
            }
        } catch (_) {}
        return def;
    }

    function getBaseUrl() {
        const fromStorage = safeStorageGet('sc_api_base', null);
        const base = (fromStorage || window.__SC_API_BASE__ || DEFAULT_BASE);
        return String(base).replace(/\/+$/, '');
    }

    function getToken() {
        return safeStorageGet('sc_token', null);
    }

    function setToken(token) {
        if (!window.Utils?.storage) return;
        if (token) window.Utils.storage.set('sc_token', token);
        else window.Utils.storage.remove('sc_token');
    }

    async function request(method, path, body, opts) {
        opts = opts || {};
        const baseUrl = getBaseUrl();
        const url = baseUrl + path;

        const headers = {
            'Content-Type': 'application/json'
        };

        const token = getToken();
        if (opts.auth && token) {
            headers.Authorization = 'Bearer ' + token;
        }

        const res = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const text = await res.text();
        let json = null;
        try { json = text ? JSON.parse(text) : null; } catch (_) { json = null; }

        if (!res.ok) {
            const msg = (json && (json.message || json.error?.message)) || `Request failed (${res.status})`;
            const err = new Error(msg);
            err.status = res.status;
            err.payload = json;
            throw err;
        }

        return json;
    }

    const API = {
        getBaseUrl,
        getToken,
        setToken,

        health: {
            async ping() {
                return request('GET', '/', null, { auth: false });
            }
        },

        auth: {
            // identifier can be phone OR email
            async sendOTP(identifier, purpose, email) {
                const payload = { purpose: purpose || 'login' };
                // detect if identifier is email
                if (identifier && String(identifier).includes('@')) payload.email = String(identifier).trim().toLowerCase();
                else payload.phone = identifier;

                // For registration, we also pass email explicitly (required)
                if (email) payload.email = String(email).trim().toLowerCase();

                return request('POST', '/auth/send-otp', payload, { auth: false });
            },
            async verifyOTP(identifier, otp, purpose) {
                const payload = { otp, purpose: purpose || 'login' };
                if (identifier && String(identifier).includes('@')) payload.email = String(identifier).trim().toLowerCase();
                else payload.phone = identifier;

                return request('POST', '/auth/verify-otp', payload, { auth: false });
            },
            async register(payload) {
                return request('POST', '/auth/register', payload, { auth: false });
            },
            async me() {
                return request('GET', '/auth/me', null, { auth: true });
            },
            async logout() {
                try {
                    await request('POST', '/auth/logout', {}, { auth: true });
                } catch (_) {
                    // ignore
                }
                setToken(null);
            }
        },

        categories: {
            async listRoot() {
                // backend: /api/categories?parent=root
                return request('GET', '/categories?parent=root', null, { auth: false });
            }
        },

        services: {
            async list(params) {
                const qs = params ? ('?' + new URLSearchParams(params).toString()) : '';
                return request('GET', '/services' + qs, null, { auth: false });
            },
            async search(q) {
                const qs = '?' + new URLSearchParams({ q: q || '' }).toString();
                return request('GET', '/services/search' + qs, null, { auth: false });
            },
            async getBySlug(slug) {
                return request('GET', '/services/' + encodeURIComponent(slug), null, { auth: false });
            }
        },

        pandits: {
            async list(params) {
                const qs = params ? ('?' + new URLSearchParams(params).toString()) : '';
                return request('GET', '/pandits' + qs, null, { auth: false });
            },
            async featured(params) {
                const qs = params ? ('?' + new URLSearchParams(params).toString()) : '';
                return request('GET', '/pandits/featured' + qs, null, { auth: false });
            },
            async getById(id) {
                return request('GET', '/pandits/' + encodeURIComponent(id), null, { auth: false });
            }
        },

        users: {
            async me() {
                return request('GET', '/users/me', null, { auth: true });
            },
            async updateMe(payload) {
                return request('PUT', '/users/me', payload || {}, { auth: true });
            }
        },

        bookings: {
            async myBookings(params) {
                const qs = params ? ('?' + new URLSearchParams(params).toString()) : '';
                return request('GET', '/bookings' + qs, null, { auth: true });
            }
        },

        admin: {
            async dashboard() {
                return request('GET', '/admin/dashboard', null, { auth: true });
            },
            async pendingPandits(params) {
                const qs = params ? ('?' + new URLSearchParams(params).toString()) : '';
                return request('GET', '/admin/pandits/pending' + qs, null, { auth: true });
            },
            async approvePandit(id, verificationLevel) {
                return request('PUT', '/admin/pandits/' + encodeURIComponent(id) + '/approve', { verificationLevel: verificationLevel || 'verified' }, { auth: true });
            },
            async rejectPandit(id, reason) {
                return request('PUT', '/admin/pandits/' + encodeURIComponent(id) + '/reject', { reason: reason || '' }, { auth: true });
            }
        }
    };

    window.API = API;
})();