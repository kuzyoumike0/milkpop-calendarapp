import axios from 'axios';
const api = axios.create({ baseURL: '/api', timeout: 8000 });
export const addPersonal = (payload) => api.post('/personal', payload);
export const listPersonal = () => api.get('/personal');
export const addShared = (payload) => api.post('/shared', payload);
export const listShared = () => api.get('/shared');
export const addEvent = (payload) => api.post('/events', payload);
export const listEvents = () => api.get('/events');
export default api;
