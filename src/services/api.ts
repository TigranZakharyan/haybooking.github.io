import type { TCredentials } from '@/types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  sendVerification: async (phone: string) => {
    const response = await api.post('/auth/send-verification', { phone });
    return response;
  },
  login: async (credential: TCredentials) => {
    const loginData = credential.phone 
      ? { phone: credential, password: credential.password }
      : { email: credential, password: credential.password };
    const response = await api.post('/auth/login', loginData);
    return response;
  },
//   register: async (data) => {
//     const response = await api.post('/auth/register', data);
//     return response;
//   },
//   getMe: async () => {
//     const response = await api.get('/auth/me');
//     return response.user;
//   },
//   updateProfile: async (data) => {
//     const response = await api.put('/auth/profile', data);
//     return response.user;
//   },
//   changePassword: async (data) => {
//     return await api.put('/auth/password', data);
//   },
};

// // Business Services
// export const businessService = {
//   getMyBusiness: async () => {
//     const response = await api.get('/businesses/my-business');
//     return response.business;
//   },
//   updateMyBusiness: async (data) => {
//     const response = await api.put('/businesses/my-business', data);
//     return response.business;
//   },
//   getBusinessByLink: async (bookingLink) => {
//     const response = await api.get(`/businesses/link/${bookingLink}`);
//     return response.business;
//   },
//   getStats: async () => {
//     const response = await api.get('/businesses/stats');
//     return response.stats;
//   },
//   updateWorkingHours: async (workingHours) => {
//     const response = await api.put('/businesses/working-hours', { workingHours });
//     return response.business;
//   },
// };

// // Service Services
// export const serviceService = {
//   createService: async (data) => {
//     const response = await api.post('/services', data);
//     return response.service;
//   },
//   getMyServices: async () => {
//     const response = await api.get('/services');
//     return response.services;
//   },
//   getService: async (id) => {
//     const response = await api.get(`/services/${id}`);
//     return response.service;
//   },
//   updateService: async (id, data) => {
//     const response = await api.put(`/services/${id}`, data);
//     return response.service;
//   },
//   deleteService: async (id) => {
//     return await api.delete(`/services/${id}`);
//   },
// };

// // Specialist Services
// export const specialistService = {
//   createSpecialist: async (data) => {
//     const response = await api.post('/specialists', data);
//     return response.specialist;
//   },
//   getMySpecialists: async () => {
//     const response = await api.get('/specialists');
//     return response.specialists;
//   },
//   getSpecialist: async (id) => {
//     const response = await api.get(`/specialists/${id}`);
//     return response.specialist;
//   },
//   getSpecialistsByBusinessId: async (businessId) => {
//     const response = await api.get(`/specialists/business/${businessId}`);
//     return response.specialists || response.data;
//   },
//   updateSpecialist: async (id, data) => {
//     const response = await api.put(`/specialists/${id}`, data);
//     return response.specialist;
//   },
//   deleteSpecialist: async (id) => {
//     return await api.delete(`/specialists/${id}`);
//   },
// };

// // Booking Services
// export const bookingService = {
//   // Send SMS verification code
//   sendVerification: async (phone) => {
//     const response = await api.post('/bookings/send-verification', { phone });
//     return response;
//   },
  
//   // Create booking (with or without auth)
//   createBooking: async (data) => {
//     const response = await api.post('/bookings', data);
//     return response.booking;
//   },
  
//   // Update booking (customer)
//   updateBooking: async (id, updateData) => {
//     const response = await api.put(`/bookings/${id}`, updateData);
//     return response.booking;
//   },

//   // Update booking (business)
//   updateBookingByBusiness: async (id, updateData) => {
//     const response = await api.put(`/bookings/${id}/business-update`, updateData);
//     return response.booking;
//   },
  
//   // Get customer bookings
//   getMyBookings: async (params) => {
//     const response = await api.get('/bookings/my-bookings', { params });
//     return response;
//   },

//   // Get business bookings
//   getBusinessBookings: async (params) => {
//     const response = await api.get('/bookings/business-bookings', { params });
//     return response;
//   },

//   // Get availability
//   getAvailability: async (params) => {
//     const response = await api.get('/bookings/availability', { params });
//     return response;
//   },

//   // Update booking status (business)
//   updateBookingStatus: async (id, status) => {
//     const response = await api.put(`/bookings/${id}/status`, { status });
//     return response.booking;
//   },

//   // Cancel booking (customer)
//   cancelBooking: async (id, reason) => {
//     const response = await api.put(`/bookings/${id}/cancel`, { reason });
//     return response.booking;
//   },
  
//   // Get availability
//   getAvailability: async (params) => {
//     const response = await api.get('/bookings/availability', { params });
//     return response;
//   },

//   // NEW: Add this method - Validate Custom Time
//   validateCustomTime: async (data) => {
//     try {
//       const response = await api.post('/bookings/validate-custom-time', data);
//       return response;
//     } catch (error) {
//       // Re-throw with proper error structure
//       throw error;
//     }
//   },
// };

// // Search Services
// export const searchService = {
//   searchBusinesses: async (params) => {
//     const response = await api.get('/search', { params });
//     return response;
//   },
//   getCities: async () => {
//     const response = await api.get('/search/cities');
//     return response.cities;
//   },
//   getBusinessTypes: async () => {
//     const response = await api.get('/search/types');
//     return response.types;
//   },
// };

// export default api;