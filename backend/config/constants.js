/**
 * ===========================================
 * APPLICATION CONSTANTS
 * ===========================================
 */

module.exports = {
    // User roles
    ROLES: {
        USER: 'user',
        PANDIT: 'pandit',
        ADMIN: 'admin'
    },
    
    // Booking statuses
    BOOKING_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
        NO_SHOW: 'no_show'
    },
    
    // Payment statuses
    PAYMENT_STATUS: {
        PENDING: 'pending',
        ADVANCE_PAID: 'advance_paid',
        FULLY_PAID: 'fully_paid',
        REFUNDED: 'refunded',
        PARTIALLY_REFUNDED: 'partially_refunded'
    },
    
    // Pandit verification levels
    VERIFICATION_LEVELS: {
        BASIC: 'basic',
        VERIFIED: 'verified',
        PREMIUM: 'premium',
        ELITE: 'elite'
    },
    
    // Pandit status
    PANDIT_STATUS: {
        PENDING: 'pending_verification',
        ACTIVE: 'active',
        SUSPENDED: 'suspended',
        INACTIVE: 'inactive'
    },
    
    // Service modes
    SERVICE_MODES: {
        AT_CUSTOMER: 'at_customer',
        AT_PANDIT: 'at_pandit',
        ONLINE: 'online',
        TEMPLE: 'temple'
    },
    
    // Languages supported
    LANGUAGES: [
        'Hindi',
        'English',
        'Sanskrit',
        'Tamil',
        'Telugu',
        'Marathi',
        'Bengali',
        'Gujarati',
        'Kannada',
        'Malayalam',
        'Odia',
        'Punjabi'
    ],
    
    // Cities supported (Phase 1)
    CITIES: [
        'Delhi NCR',
        'Mumbai',
        'Bangalore',
        'Chennai',
        'Hyderabad',
        'Pune',
        'Kolkata',
        'Ahmedabad',
        'Jaipur',
        'Lucknow',
        'Chandigarh',
        'Indore'
    ],
    
    // Commission tiers
    COMMISSION_TIERS: {
        NEW: { name: 'new', rate: 25, minBookings: 0 },
        ESTABLISHED: { name: 'established', rate: 20, minBookings: 50 },
        PREMIUM: { name: 'premium', rate: 15, minBookings: 200 },
        ELITE: { name: 'elite', rate: 12, minBookings: 500 }
    },
    
    // Default pagination
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },
    
    // OTP settings
    OTP: {
        LENGTH: 6,
        EXPIRE_MINUTES: 10,
        MAX_ATTEMPTS: 5
    },
    
    // File upload limits
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
        ALLOWED_DOC_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
        MAX_GALLERY_IMAGES: 10
    },
    
    // Review settings
    REVIEW: {
        MIN_RATING: 1,
        MAX_RATING: 5,
        MIN_TEXT_LENGTH: 10,
        MAX_TEXT_LENGTH: 1000
    },
    
    // Booking settings
    BOOKING: {
        MIN_NOTICE_HOURS: 24,
        MAX_ADVANCE_DAYS: 90,
        CANCELLATION_HOURS: 48, // Free cancellation before this
        ADVANCE_PERCENTAGE: 20 // 20% advance payment
    }
};