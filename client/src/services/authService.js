import API from './api';

export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (data) => API.post('/auth/register', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updatePassword: (data) => API.put('/auth/update-password', data),
};

export const userService = {
  updateProfile: (data) => API.put('/users/profile', data),
  uploadAvatar: (formData) => API.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
