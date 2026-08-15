import api from './client';

export const getAdminStats = () => api.get('/admin/stats').then((r) => r.data);
