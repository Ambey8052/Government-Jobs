import api from './client';

export const getMatches = (params) => api.get('/matches', { params }).then((r) => r.data);
export const getMatchDetail = (id) => api.get(`/matches/${id}`).then((r) => r.data);
