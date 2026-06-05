import api from './axios';

export const getAllMembers = () => api.get('/members');
export const getMemberById = (id) => api.get(`/members/${id}`);
export const createMember = (payload) => api.post('/members', payload);
export const updateMember = (id, payload) => api.put(`/members/${id}`, payload);
export const stopMember = (id) => api.put(`/members/${id}/stop`);
export const resumeMember = (id) => api.put(`/members/${id}/resume`);
export const deleteMember = (id) => api.delete(`/members/${id}`);
