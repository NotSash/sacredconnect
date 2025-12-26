// ========================================
// STORE - Global State Management
// ========================================

const Store = {
    state: {
        user: null,
        isLoggedIn: false,
        token: null,
        isLoading: true,
        currentPage: '/',

        // Location
        // City rollout strategy:
        // - Chennai is live for MVP
        // - Other cities are shown as "Coming soon" in UI (disabled)
        cities: [
            'Chennai',
            'Delhi NCR', 'Mumbai', 'Bangalore',
            'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad',
            'Jaipur', 'Lucknow', 'Indore', 'Chandigarh'
        ],
        liveCity: 'Chennai',
        selectedCity: 'Chennai',

        // API data
        categories: [],
        services: [],
        pandits: [],
        bookings: [],

        // UI
        mobileMenuOpen: false,
        modalOpen: null,

        // Auth flows
        authPhone: '',
        registerDraft: null,

        // Public stats (optional)
        stats: {
            pandits: null,
            ceremonies: null,
            cities: null,
            rating: null
        }
    },

    listeners: [],

    getState() {
        return this.state;
    },

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
        this.persist();
    },

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    },

    persist() {
        try {
            const toSave = {
                user: this.state.user,
                isLoggedIn: this.state.isLoggedIn,
                token: this.state.token,
                selectedCity: this.state.selectedCity,
                stats: this.state.stats
            };
            localStorage.setItem('sacredconnect_state', JSON.stringify(toSave));
        } catch (e) {
            console.warn('Could not persist state:', e);
        }
    },

    hydrate() {
        try {
            const saved = localStorage.getItem('sacredconnect_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
        } catch (e) {
            console.warn('Could not hydrate state:', e);
        }

        // Hydrate auth token (do NOT rely on Utils here because store.js loads before utils.js)
        try {
            const t = localStorage.getItem('sc_token');
            if (t) {
                this.state.token = t;
                // logged-in will be confirmed by /auth/me later
            }
        } catch (_) {}
    },

    setCity(city) {
        // Chennai-only rollout for now
        const live = this.state.liveCity || 'Chennai';
        if (city !== live) {
            // Do not change selected city
            if (window.Utils && typeof window.Utils.toast === 'function') {
                window.Utils.toast(`${city} is coming soon. Currently live in ${live}.`, 'info');
            }
            return;
        }
        this.setState({ selectedCity: city });
    },

    setToken(token) {
        this.setState({ token: token || null });
        if (window.API && typeof window.API.setToken === 'function') {
            window.API.setToken(token || null);
        }
    },

    login(session) {
        const user = session && session.user ? session.user : session;
        const token = session && session.token ? session.token : null;

        this.setState({
            user: user,
            isLoggedIn: true,
            token: token || this.state.token,
            authPhone: ''
        });

        if (token) this.setToken(token);
    },

    logout() {
        this.setState({
            user: null,
            isLoggedIn: false,
            token: null,
            bookings: []
        });

        // store.js loads before utils.js, so never depend on Utils here
        try {
            localStorage.removeItem('sc_token');
        } catch (_) {}
    }
};

Store.hydrate();
window.Store = Store;