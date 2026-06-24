const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async(email, otp, name) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #FF6B6B, #FF8E53); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-code { font-size: 32px; font-weight: bold; color: #FF6B6B; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍕 Foodie Hub</h1>
                    <p>Verify Your Email Address</p>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p>Thank you for registering with Foodie Hub! Please use the following OTP to verify your email address:</p>
                    
                    <div class="otp-code">
                        ${otp}
                    </div>
                    
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© 2024 Foodie Hub. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await transporter.sendMail({
        from: `"Foodie Hub" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - Foodie Hub',
        html
    });
};

const sendOrderConfirmation = async(order, user) => {
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #FF6B6B, #FF8E53); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .total { font-size: 24px; font-weight: bold; color: #FF6B6B; text-align: right; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Order Confirmed!</h1>
                </div>
                <div class="content">
                    <h2>Hello ${user.name},</h2>
                    <p>Your order has been confirmed and is being prepared!</p>
                    
                    <div class="order-details">
                        <h3>Order #${order.orderNumber}</h3>
                        ${order.items.map(item => `<p>${item.quantity}x ${item.name} - $${item.price}</p>`).join('')}
                        <div class="total">Total: $${order.totalAmount}</div>
                    </div>
                    
                    <p>Your order will be delivered within 30-45 minutes.</p>
                    <p>Thank you for ordering from Foodie Hub!</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    await transporter.sendMail({
        from: `"Foodie Hub" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Order Confirmed - #${order.orderNumber}`,
        html
    });
};

module.exports = { sendOTPEmail, sendOrderConfirmation };