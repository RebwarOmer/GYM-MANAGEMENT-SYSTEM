import api from './axios';

export const getAllLogs = () => api.get('/logs');
export const getLogsByMember = (memberId) => api.get(`/logs/member/${memberId}`);
