const API_BASE = '/api';

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }
  return data;
}

// Stats
export const fetchStats = () =>
  fetch(`${API_BASE}/stats`).then(handleResponse);

export const fetchCategoryStats = () =>
  fetch(`${API_BASE}/stats/categories`).then(handleResponse);

export const fetchOrderStats = () =>
  fetch(`${API_BASE}/stats/orders`).then(handleResponse);

// Products
export const fetchProducts = (params = {}) => {
  const searchParams = new URLSearchParams(params);
  return fetch(`${API_BASE}/products?${searchParams}`).then(handleResponse);
};

export const fetchProduct = (id) =>
  fetch(`${API_BASE}/products/${id}`).then(handleResponse);

export const createProduct = (data) =>
  fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateProduct = (id, data) =>
  fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteProduct = (id) =>
  fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' }).then(handleResponse);

// Customers
export const fetchCustomers = (params = {}) => {
  const searchParams = new URLSearchParams(params);
  return fetch(`${API_BASE}/customers?${searchParams}`).then(handleResponse);
};

export const fetchCustomer = (id) =>
  fetch(`${API_BASE}/customers/${id}`).then(handleResponse);

export const createCustomer = (data) =>
  fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateCustomer = (id, data) =>
  fetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteCustomer = (id) =>
  fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' }).then(handleResponse);

// Orders
export const fetchOrders = (params = {}) => {
  const searchParams = new URLSearchParams(params);
  return fetch(`${API_BASE}/orders?${searchParams}`).then(handleResponse);
};

export const fetchOrder = (id) =>
  fetch(`${API_BASE}/orders/${id}`).then(handleResponse);

export const createOrder = (data) =>
  fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateOrder = (id, data) =>
  fetch(`${API_BASE}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteOrder = (id) =>
  fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' }).then(handleResponse);
