import api from './client';

export const listSaved = () => api.get('/saved').then((r) => r.data);
export const saveOpportunity = (opportunityId) =>
  api.post(`/saved/${opportunityId}`).then((r) => r.data);
export const updateSavedStatus = (opportunityId, status) =>
  api.put(`/saved/${opportunityId}`, { status }).then((r) => r.data);
export const unsaveOpportunity = (opportunityId) =>
  api.delete(`/saved/${opportunityId}`).then((r) => r.data);
