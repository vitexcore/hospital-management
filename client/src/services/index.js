import API from './api';

export const doctorService = {
  getAll: (params) => API.get('/doctors', { params }),
  getOne: (id) => API.get(`/doctors/${id}`),
  getSlots: (id, date) => API.get(`/doctors/${id}/slots`, { params: { date } }),
  create: (data) => API.post('/doctors', data),
  update: (id, data) => API.put(`/doctors/${id}`, data),
  delete: (id) => API.delete(`/doctors/${id}`),
};

export const patientService = {
  getAll: (params) => API.get('/patients', { params }),
  getOne: (id) => API.get(`/patients/${id}`),
  register: (data) => API.post('/patients/register', data),
  update: (id, data) => API.put(`/patients/${id}`, data),
  delete: (id) => API.delete(`/patients/${id}`),
  getStats: () => API.get('/patients/stats'),
};

export const departmentService = {
  getAll: (params) => API.get('/departments', { params }),
  getOne: (id) => API.get(`/departments/${id}`),
  create: (data) => API.post('/departments', data),
  update: (id, data) => API.put(`/departments/${id}`, data),
  delete: (id) => API.delete(`/departments/${id}`),
};

export const serviceService = {
  getAll: (params) => API.get('/services', { params }),
  getOne: (id) => API.get(`/services/${id}`),
  create: (data) => API.post('/services', data),
  update: (id, data) => API.put(`/services/${id}`, data),
  delete: (id) => API.delete(`/services/${id}`),
};

export const appointmentService = {
  getAll: (params) => API.get('/appointments', { params }),
  getOne: (id) => API.get(`/appointments/${id}`),
  getToday: () => API.get('/appointments/today'),
  getStats: () => API.get('/appointments/stats'),
  create: (data) => API.post('/appointments', data),
  updateStatus: (id, data) => API.patch(`/appointments/${id}/status`, data),
  reschedule: (id, data) => API.patch(`/appointments/${id}/reschedule`, data),
};

export const medicalRecordService = {
  getAll: (params) => API.get('/medical-records', { params }),
  getOne: (id) => API.get(`/medical-records/${id}`),
  create: (data) => API.post('/medical-records', data),
  update: (id, data) => API.put(`/medical-records/${id}`, data),
};

export const prescriptionService = {
  getAll: (params) => API.get('/prescriptions', { params }),
  getOne: (id) => API.get(`/prescriptions/${id}`),
  create: (data) => API.post('/prescriptions', data),
  update: (id, data) => API.put(`/prescriptions/${id}`, data),
};

export const laboratoryService = {
  getAll: (params) => API.get('/laboratory', { params }),
  getOne: (id) => API.get(`/laboratory/${id}`),
  request: (data) => API.post('/laboratory', data),
  update: (id, data) => API.put(`/laboratory/${id}`, data),
  uploadReport: (id, formData) => API.post(`/laboratory/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const invoiceService = {
  getAll: (params) => API.get('/invoices', { params }),
  getOne: (id) => API.get(`/invoices/${id}`),
  create: (data) => API.post('/invoices', data),
  update: (id, data) => API.put(`/invoices/${id}`, data),
};

export const paymentService = {
  getAll: (params) => API.get('/payments', { params }),
  create: (data) => API.post('/payments', data),
  getRevenue: () => API.get('/payments/revenue'),
};

export const notificationService = {
  getAll: (params) => API.get('/notifications', { params }),
  markRead: (id) => API.patch(`/notifications/${id}/read`),
  markAllRead: () => API.patch('/notifications/read-all'),
  delete: (id) => API.delete(`/notifications/${id}`),
};

export const activityLogService = {
  getAll: (params) => API.get('/activity-logs', { params }),
};

export const adminService = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
};
