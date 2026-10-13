import { apiRequest } from './api'
export const adminService = {
  dashboard: () => apiRequest('/admin/dashboard'),
  customers: () => apiRequest('/admin/customers'),
  products: () => apiRequest('/admin/products'),
  orders: () => apiRequest('/admin/orders'),
  createProduct: data => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => apiRequest(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  archiveProduct: id => apiRequest(`/products/${id}`, { method: 'DELETE' }),
  content: type => apiRequest(`/cms${type ? `?type=${encodeURIComponent(type)}` : ''}`),
  createContent: data => apiRequest('/cms', { method: 'POST', body: JSON.stringify(data) }),
  updateContent: (id, data) => apiRequest(`/cms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteContent: id => apiRequest(`/cms/${id}`, { method: 'DELETE' })
}
