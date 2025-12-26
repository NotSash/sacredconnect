/**
 * ===========================================
 * EMAIL UTILITY (Using Resend)
 * ===========================================
 */

const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        // In development, log instead of sending
        if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
            console.log('📧 Email (Dev Mode):');
            console.log('  To:', to);
            console.log('  Subject:', subject);
            console.log('  Text:', text || html);
            return { success: true, id: 'dev-mode' };
        }
        
        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'SacredConnect <noreply@sacredconnect.com>',
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text
        });
        
        return { success: true, id: data.id };
        
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Email templates
 */
const templates = {
    // Welcome email
    welcome: (name) => ({
        subject: 'Welcome to SacredConnect! 🙏',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ED7B12, #d97706); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🙏 SacredConnect</h1>
                </div>
                <div style="padding: 30px; background: #fff;">
                    <h2 style="color: #333;">Welcome, ${name}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Thank you for joining SacredConnect - your trusted platform for booking verified Pandits for religious ceremonies.
                    </p>
                    <p style="color: #666; line-height: 1.6;">
                        With SacredConnect, you can:
                    </p>
                    <ul style="color: #666; line-height: 1.8;">
                        <li>Browse verified Pandits in your city</li>
                        <li>Book pujas and ceremonies with transparent pricing</li>
                        <li>Order samagri kits for your ceremonies</li>
                        <li>Get reminders for important religious dates</li>
                    </ul>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/services" 
                           style="background: #ED7B12; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Explore Services
                        </a>
                    </div>
                </div>
                <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 12px;">
                    <p>© ${new Date().getFullYear()} SacredConnect. All rights reserved.</p>
                </div>
            </div>
        `
    }),
    
    // OTP email
    otp: (otp, purpose) => ({
        subject: `Your OTP for SacredConnect - ${otp}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ED7B12, #d97706); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🙏 SacredConnect</h1>
                </div>
                <div style="padding: 30px; background: #fff; text-align: center;">
                    <h2 style="color: #333;">Your One-Time Password</h2>
                    <p style="color: #666;">Use this OTP to ${purpose}:</p>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ED7B12;">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        This OTP is valid for 10 minutes. Do not share it with anyone.
                    </p>
                </div>
                <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 12px;">
                    <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
            </div>
        `
    }),
    
    // Booking confirmation
    bookingConfirmation: (booking) => ({
        subject: `Booking Confirmed - ${booking.bookingNumber} 🙏`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ED7B12, #d97706); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🙏 SacredConnect</h1>
                </div>
                <div style="padding: 30px; background: #fff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="background: #dcfce7; color: #16a34a; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
                            ✓ Booking Confirmed
                        </span>
                    </div>
                    <h2 style="color: #333; text-align: center;">Booking #${booking.bookingNumber}</h2>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #666;">Service:</td>
                                <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right;">${booking.serviceName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #666;">Pandit:</td>
                                <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right;">${booking.panditName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #666;">Date:</td>
                                <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right;">${booking.date}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #666;">Time:</td>
                                <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right;">${booking.time}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #666;">Location:</td>
                                <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right;">${booking.location}</td>
                            </tr>
                            <tr style="border-top: 2px solid #ddd;">
                                <td style="padding: 15px 0; color: #333; font-weight: bold;">Total Amount:</td>
                                <td style="padding: 15px 0; color: #ED7B12; font-weight: bold; font-size: 20px; text-align: right;">₹${booking.totalAmount}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/bookings/${booking.bookingNumber}" 
                           style="background: #ED7B12; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            View Booking Details
                        </a>
                    </div>
                </div>
                <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 12px;">
                    <p>Need help? Contact us at support@sacredconnect.com</p>
                </div>
            </div>
        `
    }),
    
    // Booking reminder
    bookingReminder: (booking) => ({
        subject: `Reminder: Your puja is tomorrow - ${booking.bookingNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ED7B12, #d97706); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🙏 SacredConnect</h1>
                </div>
                <div style="padding: 30px; background: #fff;">
                    <h2 style="color: #333; text-align: center;">🔔 Booking Reminder</h2>
                    <p style="color: #666; text-align: center;">Your puja is scheduled for tomorrow!</p>
                    
                    <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0; color: #92400e; font-size: 18px; font-weight: bold;">
                            ${booking.serviceName}
                        </p>
                        <p style="margin: 10px 0 0; color: #92400e;">
                            ${booking.date} at ${booking.time}
                        </p>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        <strong>Pandit:</strong> ${booking.panditName}<br>
                        <strong>Location:</strong> ${booking.location}
                    </p>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Please ensure the following preparations are complete:
                    </p>
                    <ul style="color: #666; line-height: 1.8;">
                        <li>Puja space is clean and ready</li>
                        <li>All samagri items are arranged</li>
                        <li>Family members are informed</li>
                    </ul>
                </div>
            </div>
        `
    }),
    
    // Pandit registration
    panditWelcome: (name) => ({
        subject: 'Welcome to SacredConnect Pandit Network! 🙏',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ED7B12, #d97706); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🙏 SacredConnect</h1>
                </div>
                <div style="padding: 30px; background: #fff;">
                    <h2 style="color: #333;">Welcome, ${name}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Thank you for registering as a Pandit on SacredConnect. We're excited to have you join our network of verified religious service providers.
                    </p>
                    
                    <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #92400e; margin-top: 0;">📋 Next Steps:</h3>
                        <ol style="color: #92400e; line-height: 1.8;">
                            <li>Complete your profile</li>
                            <li>Upload verification documents</li>
                            <li>Add your services and pricing</li>
                            <li>Set your availability</li>
                        </ol>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Our team will review your application within 2-3 business days. Once verified, you'll start receiving booking requests from customers in your area.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/pandit/dashboard" 
                           style="background: #ED7B12; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Complete Your Profile
                        </a>
                    </div>
                </div>
            </div>
        `
    })
};

/**
 * Send templated email
 */
const sendTemplateEmail = async (to, templateName, data) => {
    const template = templates[templateName];
    if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
    }
    
    const { subject, html } = template(data);
    return sendEmail({ to, subject, html });
};

module.exports = {
    sendEmail,
    sendTemplateEmail,
    templates
};