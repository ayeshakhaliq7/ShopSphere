import api from './api';

const data = (promise) => promise.then((r) => r.data);

export const authService = {
  register: (body) => data(api.post('/auth/register', body)),
  login: (body) => data(api.post('/auth/login', body)),
  me: () => data(api.get('/auth/me')),
};

export const productService = {
  list: (params) => data(api.get('/products', { params })),
  get: (id) => data(api.get(`/products/${id}`)),
  create: (body) => data(api.post('/products', body)),
  update: (id, body) => data(api.put(`/products/${id}`, body)),
  remove: (id) => data(api.delete(`/products/${id}`)),
  reviews: (id) => data(api.get(`/products/${id}/reviews`)),
  addReview: (id, body) => data(api.post(`/products/${id}/reviews`, body)),
};

export const categoryService = { list: () => data(api.get('/categories')) };

export const orderService = {
  create: (body) => data(api.post('/orders', body)),
  list: (params) => data(api.get('/orders', { params })),
  get: (id) => data(api.get(`/orders/${id}`)),
  cancel: (id) => data(api.put(`/orders/${id}/cancel`)),
  updateStatus: (id, status) => data(api.put(`/orders/${id}/status`, { status })),
};

export const userService = {
  list: () => data(api.get('/users')),
  get: (id) => data(api.get(`/users/${id}`)),
  update: (id, body) => data(api.put(`/users/${id}`, body)),
  wishlist: () => data(api.get('/users/wishlist')),
  addWishlist: (id) => data(api.post(`/users/wishlist/${id}`)),
  removeWishlist: (id) => data(api.delete(`/users/wishlist/${id}`)),
};

export const adminService = { stats: () => data(api.get('/admin/stats')) };
export const newsletterService = { subscribe: (email) => data(api.post('/newsletter', { email })) };
