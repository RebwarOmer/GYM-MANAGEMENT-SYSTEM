import api from './axios';

export const getAllOffers = () => api.get('/offers');
