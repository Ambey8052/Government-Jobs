import api from './client';

export const getMeta = () => api.get('/meta').then((r) => r.data);
