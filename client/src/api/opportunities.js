import api from './client';

export const listOpportunities = (params) =>
  api.get('/opportunities', { params }).then((r) => r.data);

export const getOpportunity = (id) => api.get(`/opportunities/${id}`).then((r) => r.data);

export const listOpportunitiesAdmin = (params) =>
  api.get('/opportunities/admin/all', { params }).then((r) => r.data);

export const createOpportunity = (data) => api.post('/opportunities', data).then((r) => r.data);

export const updateOpportunity = (id, data) =>
  api.put(`/opportunities/${id}`, data).then((r) => r.data);

export const deleteOpportunity = (id) => api.delete(`/opportunities/${id}`).then((r) => r.data);
