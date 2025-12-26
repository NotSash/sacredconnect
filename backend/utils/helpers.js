/**
 * ===========================================
 * HELPER UTILITIES
 * ===========================================
 */

/**
 * Generate random string
 */
exports.generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generate OTP
 */
exports.generateOTP = (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
};

/**
 * Format phone number (add country code)
 */
exports.formatPhoneNumber = (phone, countryCode = '+91') => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If already has country code
    if (cleaned.startsWith('91') && cleaned.length === 12) {
        return '+' + cleaned;
    }
    
    // Add country code
    return countryCode + cleaned;
};

/**
 * Mask phone number for privacy
 */
exports.maskPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) return phone;
    return cleaned.substring(0, 2) + 'XXXXXX' + cleaned.substring(8);
};

/**
 * Mask email for privacy
 */
exports.maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const maskedName = name.substring(0, 2) + '***';
    return maskedName + '@' + domain;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Paginate results
 */
exports.paginate = (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
};

/**
 * Build pagination response
 */
exports.paginationResponse = (data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

/**
 * Filter object - remove undefined/null values
 */
exports.filterObject = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v != null && v !== '')
    );
};

/**
 * Slugify string
 */
exports.slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

/**
 * Capitalize first letter
 */
exports.capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format currency
 */
exports.formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Format date
 */
exports.formatDate = (date, format = 'medium') => {
    const options = {
        short: { day: 'numeric', month: 'short' },
        medium: { day: 'numeric', month: 'short', year: 'numeric' },
        long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
        time: { hour: 'numeric', minute: '2-digit', hour12: true }
    };
    
    return new Intl.DateTimeFormat('en-IN', options[format] || options.medium)
        .format(new Date(date));
};

/**
 * Check if date is valid
 */
exports.isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
};

/**
 * Get date range
 */
exports.getDateRange = (range) => {
    const now = new Date();
    const start = new Date();
    
    switch (range) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
        default:
            return null;
    }
    
    return { start, end: now };
};

/**
 * Build MongoDB sort object from string
 */
exports.buildSortObject = (sortString) => {
    if (!sortString) return { createdAt: -1 };
    
    const sortObj = {};
    const fields = sortString.split(',');
    
    fields.forEach(field => {
        if (field.startsWith('-')) {
            sortObj[field.substring(1)] = -1;
        } else {
            sortObj[field] = 1;
        }
    });
    
    return sortObj;
};

/**
 * Validate Indian phone number
 */
exports.isValidIndianPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    // Indian phone: 10 digits starting with 6-9
    return /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Validate email
 */
exports.isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Sanitize HTML to prevent XSS
 */
exports.sanitizeHtml = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Deep clone object
 */
exports.deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Pick specific fields from object
 */
exports.pick = (obj, keys) => {
    return keys.reduce((acc, key) => {
        if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
};

/**
 * Omit specific fields from object
 */
exports.omit = (obj, keys) => {
    return Object.keys(obj)
        .filter(key => !keys.includes(key))
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {});
};

/**
 * Sleep function for async operations
 */
exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
exports.retry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await exports.sleep(delay * Math.pow(2, i));
        }
    }
};