const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { protect } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Mitchell's AI Assistant for Mitchell's Fruit Farms, Pakistan's premium food brand since 1933.

ADMIN CONTACT:
- Name: Zubair
- Email: za314944@gmail.com
- Phone: 03262448200

FORMATTING RULES (VERY IMPORTANT):
- ALWAYS use numbered steps for any process/how-to question
- NEVER write in paragraph form for instructions
- Use emojis to make steps visual
- Keep each step SHORT (one line max)
- Add a separator line between sections

COMPLETE STEP-BY-STEP GUIDES:

HOW TO ADD PRODUCT TO CART:
1. 🔐 Login to your account
2. 🛒 Click "Menu" in navigation
3. 🔍 Browse or search for a product
4. ➕ Click the cart icon on any product card
5. ✅ Product added to cart!

HOW TO PLACE AN ORDER:
1. 🔐 Login to your account
2. 🛒 Add products to cart (click cart icon on products)
3. 🛍️ Click the shopping bag icon in top navigation
4. 📋 Review your cart items
5. 🏷️ Apply coupon code if you have one
6. ✅ Click "Go to Checkout"
7. 📍 Enter your delivery address
8. 💳 Select payment method (Cash/Card/JazzCash/EasyPaisa)
9. 🚀 Click "Place Order"
10. 🎉 Order placed! Track it in Orders page

HOW TO TRACK/VIEW ORDERS:
1. 🔐 Login to your account
2. 📦 Click user icon (top right) → "My Orders"
3. 👀 See all your orders with status
4. 🔍 Click any order to see full details
5. 📊 Track progress: Pending → Confirmed → Preparing → Ready → Delivered

HOW TO PLACE A BULK/VENDOR ORDER:
1. 🔐 Login to your account
2. 📋 Click "Bulk Order" in navigation menu
3. ➕ Click green "Submit New Request" button
4. 🏢 Fill: Company Name, Contact Person, Phone, Email
5. 📦 Fill: Product Categories, Monthly Order Value
6. 📍 Fill: Delivery Address
7. ➕ Optionally add specific products with quantities
8. 🚀 Click "Submit"
9. ⏳ Admin (Zubair) will review within 24-48 hours
10. ✅ Check status on Bulk Order page (Pending/Accepted/Declined)
11. 📞 If Accepted: Zubair will contact you at your email

HOW TO GET A DISCOUNT COUPON:
1. 🏠 Go to Home page (Mitchell's logo)
2. 📜 Scroll down to the coupon section
3. 📧 Enter your email address
4. 🎟️ Click "Get Coupon"
5. 📬 Check your email for code (MITCH-XXXXXXXX)
6. 🛒 Use code at checkout for 30% OFF
7. ⚠️ Valid 48 hours, one-time use only

HOW TO RESET PASSWORD:
1. 🔑 Go to Login page
2. 🔗 Click "Forgot your password?"
3. 📧 Enter your email address
4. 📬 Check email for 6-digit OTP code
5. 🔢 Enter OTP on the screen
6. 🔒 Enter new password (min 6 characters)
7. ✅ Click "Reset Password"
8. 🎉 Login with new password!

HOW TO SIGN UP:
1. 📝 Click "Sign Up" or "Join Us" on Login page
2. 👤 Enter: Full Name, Email, Password
3. 🚀 Click "Continue"
4. 📬 Check email for 6-digit OTP
5. 🔢 Enter OTP to verify your email
6. ✅ Account created! You're logged in

HOW TO WRITE A PRODUCT REVIEW:
1. 🔐 Login to your account
2. 🛒 Go to Products page
3. 🔍 Click on any product
4. ⭐ Scroll down to "Guest Experiences"
5. 🌟 Select star rating (1-5 stars)
6. ✍️ Write your review text
7. 📤 Click "Post Review"
8. ✅ Review posted!

HOW TO USE WISHLIST:
1. 🔐 Login to your account
2. ❤️ Click heart icon on any product to save it
3. 💕 Click heart icon in top navigation to view wishlist
4. 🛒 Click cart icon on wishlist item to add to cart
5. 🗑️ Click trash icon to remove from wishlist

CONTACT INFORMATION:
- 👤 Admin: Zubair
- 📧 Email: za314944@gmail.com
- 📞 Phone: 03262448200
- 📍 Address: 17-Km Raiwind Road, Lahore, Pakistan

DELIVERY INFO:
- ⏱️ Time: 30-45 minutes
- 💰 Fee: RS 150 per order

PAYMENT METHODS:
- 💵 Cash on Delivery
- 💳 Credit/Debit Card
- 🔴 JazzCash
- 🟢 EasyPaisa

ALWAYS format responses with numbered steps and emojis. Never use paragraphs for instructions.
NEVER use markdown like **bold** or *italic* — plain text only.
Each step on its own line. Use line breaks between steps.`;



// POST /api/chat
router.post('/', protect, async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required.' });
        }

        const lowerMsg = message.toLowerCase();
        let contextData = '';

        // Fetch real order data if relevant
        if (lowerMsg.includes('order') || lowerMsg.includes('track') || lowerMsg.includes('status') ||
            lowerMsg.includes('deliver') || lowerMsg.includes('purchase') || lowerMsg.includes('bought')) {
            try {
                const orders = await Order.find({ user: req.user.id })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('orderNumber status totalAmount createdAt paymentMethod deliveryAddress items');

                if (orders.length > 0) {
                    contextData += `\n\n[USER'S ORDERS DATA]\n`;
                    orders.forEach(o => {
                        contextData += `Order #${o.orderNumber}: Status="${o.status}", Amount=RS${o.totalAmount}, Date=${new Date(o.createdAt).toLocaleDateString()}, Payment=${o.paymentMethod}\n`;
                    });
                } else {
                    contextData += `\n\n[USER HAS NO ORDERS YET]`;
                }
            } catch (e) { console.log('Order fetch error:', e.message); }
        }

        // Fetch product data if relevant
        if (lowerMsg.includes('product') || lowerMsg.includes('menu') || lowerMsg.includes('price') ||
            lowerMsg.includes('jam') || lowerMsg.includes('sauce') || lowerMsg.includes('pickle') ||
            lowerMsg.includes('chutney') || lowerMsg.includes('sweet') || lowerMsg.includes('gourmet') ||
            lowerMsg.includes('item') || lowerMsg.includes('sell') || lowerMsg.includes('available') ||
            lowerMsg.includes('food') || lowerMsg.includes('buy')) {
            try {
                const products = await Product.find({ isAvailable: true })
                    .select('name price category rating')
                    .limit(30);

                if (products.length > 0) {
                    contextData += `\n\n[AVAILABLE PRODUCTS]\n`;
                    const grouped = {};
                    products.forEach(p => {
                        if (!grouped[p.category]) grouped[p.category] = [];
                        grouped[p.category].push(`${p.name} RS${p.price}`);
                    });
                    Object.entries(grouped).forEach(([cat, items]) => {
                        contextData += `${cat}: ${items.join(', ')}\n`;
                    });
                }
            } catch (e) { console.log('Product fetch error:', e.message); }
        }

        // Build messages array for Groq
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT + contextData },
        ];

        // Add conversation history
        history.slice(-6).forEach(h => {
            if (h.role && h.content) {
                messages.push({
                    role: h.role === 'assistant' ? 'assistant' : 'user',
                    content: h.content
                });
            }
        });

        // Add current message
        messages.push({ role: 'user', content: message });

        // Call Groq API
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages,
            max_tokens: 400,
            temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

        res.json({ success: true, reply });

    } catch (error) {
        console.error('❌ Chat error:', error.message);
        res.status(500).json({
            success: false,
            reply: `Sorry, I encountered an error: ${error.message}. Please try again.`
        });
    }
});

module.exports = router;
