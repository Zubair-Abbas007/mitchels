import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000, // 10 seconds timeout
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            error.response = { data: { message: 'Server is taking too long. Please try again.' } };
        } else if (!error.response) {
            error.response = { data: { message: 'Cannot connect to server. Make sure backend is running.' } };
        }
        return Promise.reject(error);
    }
);

// ============= AUTH APIs =============
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    sendOTP: (data) => api.post('/auth/send-otp', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    sendResetOTP: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ============= USER APIs =============
export const userAPI = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    updateProfile: (data) => api.put('/users/profile', data),
};

// ============= PRODUCT APIs =============
export const productAPI = {
    getAll: () => api.get('/products'),
    getAdmin: () => api.get('/products/admin'),
    getById: (id) => api.get(`/products/${id}`),
    getLatestReviews: () => api.get('/products/reviews/latest'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    addComment: (id, data) => api.post(`/products/${id}/comment`, data),
    delete: (id) => api.delete(`/products/${id}`),
    init: () => api.post('/products/init'),
};

// ============= ORDER APIs =============
export const orderAPI = {
    getAll: () => api.get('/orders'),
    getWorker: () => api.get('/orders/worker'),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    workerComplete: (id) => api.put(`/orders/${id}/worker-complete`),
    delete: (id) => api.delete(`/orders/${id}`),
    getStats: () => api.get('/orders/stats/summary'),
};

// ============= COUPON APIs =============
export const couponAPI = {
    generate: (data) => api.post('/coupons/generate', data),
    validate: (data) => api.post('/coupons/validate', data),
    redeem: (data) => api.post('/coupons/redeem', data),
};

// ============= VENDOR APIs =============
export const vendorAPI = {
    submit: (data) => api.post('/vendor', data),
    getMy: () => api.get('/vendor/my'),
    getAll: () => api.get('/vendor'),
    updateStatus: (id, data) => api.put(`/vendor/${id}`, data),
};

// ============= WISHLIST APIs =============
export const wishlistAPI = {
    get: () => api.get('/wishlist'),
    toggle: (productId) => api.post(`/wishlist/${productId}`),
};

// ============= CHAT API =============
export const chatAPI = {
    send: (data) => api.post('/chat', data),
};

export default api;
