import api from './axios';

export const assignOffer = (memberId, offerId) => api.post('/subscriptions/assign', { memberId, offerId });
export const renewSubscription = (memberId, offerId) => api.post('/subscriptions/renew', { memberId, offerId });
export const getSubscriptionsByMember = (memberId) => api.get(`/subscriptions/member/${memberId}`);
