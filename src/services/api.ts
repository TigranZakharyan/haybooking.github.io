import type {
  TBusinessType,
  TCredentials,
  TRegisterBusinessCreds,
  TRegisterCustomerCreds,
  TUpdatePassword,
  TUpdateProfile,
  TUser,
} from "@/types";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  },
);

// Auth Services
export const authService = {
  sendVerification: async (phone: string) => {
    const response = await api.post("/auth/send-verification", { phone });
    return response.data;
  },
  login: async (credential: TCredentials): Promise<{token: string}> => {
    const response = await api.post<{ token: string }>("/auth/login", credential);
    return response.data;
  },
  registerCustomer: async (credential: TRegisterCustomerCreds) => {
    const response = await api.post("/auth/register", credential);
    return response.data;
  },
  registerBusiness: async (credential: TRegisterBusinessCreds) => {
    const response = await api.post("/auth/register", credential);
    return response.data;
  },
  getMe: async (): Promise<{ user: TUser }> => {
    const response = await api.get<{ user: TUser }>("/auth/me");
    return response.data
  },
  updateProfile: async (data: TUpdateProfile): Promise<TUser> => {
    const response = await api.put<{ user: TUser }>('/auth/profile', data);
    return response.data.user;
  },
  changePassword: async (data: TUpdatePassword): Promise<{ status: string }> => {
    return await api.put<{ message: string }>('/auth/password', data);
  },
};

// Business Services
export const businessService = {
  getMyBusiness: async () => {
    const response = await api.get('/businesses/my-business');
    return response.data.business;
  },
  updateMyBusiness: async (data) => {
    const response = await api.put('/businesses/my-business', data);
    return response.data.business;
  },
  getBusinessByLink: async (bookingLink) => {
    const response = await api.get(`/businesses/link/${bookingLink}`);
    return response.data.business;
  },
  getStats: async () => {
    const response = await api.get('/businesses/stats');
    return response.data.stats;
  },
  updateWorkingHours: async (workingHours) => {
    const response = await api.put('/businesses/working-hours', { workingHours });
    return response.data.business;
  },
};

// Service Services
export const serviceService = {
  createService: async (data) => {
    const response = await api.post('/services', data);
    return response.data.service;
  },
  getMyServices: async () => {
    const response = await api.get('/services');
    return response.data.services;
  },
  getService: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data.service;
  },
  updateService: async (id, data) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data.service;
  },
  deleteService: async (id) => {
    return await api.delete(`/services/${id}`);
  },
};

// Specialist Services
export const specialistService = {
  createSpecialist: async (data) => {
    const response = await api.post('/specialists', data);
    return response.specialist;
  },
  getMySpecialists: async () => {
    const response = await api.get('/specialists');
    return response.specialists;
  },
  getSpecialist: async (id) => {
    const response = await api.get(`/specialists/${id}`);
    return response.specialist;
  },
  getSpecialistsByBusinessId: async (businessId) => {
    const response = await api.get(`/specialists/business/${businessId}`);
    return response.specialists || response.data;
  },
  updateSpecialist: async (id, data) => {
    const response = await api.put(`/specialists/${id}`, data);
    return response.specialist;
  },
  deleteSpecialist: async (id) => {
    return await api.delete(`/specialists/${id}`);
  },
};

// // Booking Services
export const bookingService = {
  // Send SMS verification code
  sendVerification: async (phone: string) => {
    const response = await api.post("/bookings/send-verification", { phone });
    return response;
  },

  // Create booking (with or without auth)
  createBooking: async (data) => {
    const response = await api.post("/bookings", data);
    return response.data.booking;
  },

  // Update booking (customer)
  updateBooking: async (id, updateData) => {
    const response = await api.put(`/bookings/${id}`, updateData);
    return response.data.booking;
  },

  // Update booking (business)
  updateBookingByBusiness: async (id, updateData) => {
    const response = await api.put(
      `/bookings/${id}/business-update`,
      updateData,
    );
    return response.data.booking;
  },

  // Get customer bookings
  getMyBookings: async (params) => {
    const response = await api.get("/bookings/my-bookings", { params });
    return response;
  },

  // Get business bookings
  getBusinessBookings: async (params) => {
    const response = await api.get("/bookings/business-bookings", { params });
    return response;
  },

  // Get availability
  getAvailability: async (params) => {
    const response = await api.get("/bookings/availability", { params });
    return response;
  },

  // Update booking status (business)
  updateBookingStatus: async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.booking;
  },

  // Cancel booking (customer)
  cancelBooking: async (id, reason) => {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.booking;
  },

  // Get availability
  getAvailability: async (params) => {
    const response = await api.get("/bookings/availability", { params });
    return response;
  },

  // NEW: Add this method - Validate Custom Time
  validateCustomTime: async (data) => {
    try {
      const response = await api.post("/bookings/validate-custom-time", data);
      return response;
    } catch (error) {
      // Re-throw with proper error structure
      throw error;
    }
  },
};

// // Search Services
export const searchService = {
  searchBusinesses: async (params) => {
    const response = await api.get("/search", { params });
    return response.data;
  },
  getCities: async () => {
    const response = await api.get("/search/cities");
    return response.data.cities;
  },
  getBusinessTypes: async (): Promise<TBusinessType[]> => {
    const response = await api.get<{ types: TBusinessType[] }>("/search/types");
    return response.data.types;
  },
};


// Upload service
export const uploadService = {
  uploadBusinessLogo: async (formData) => {
    const response = await api.post('/images/business-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // response is the unwrapped `data` object from backend -> { logo, ... }
    return response.data.logo;
  },
  getBusinessLogo: async () => {
    const response = await api.get('/images/business-logo');
    // backend returns { logo, businessName }
    return response.data.logo || null;
  },
  deleteBusinessLogo: async () => {
    return await api.delete('/images/business-logo');
  },
  uploadServiceImage: async (serviceId, formData) => {
    const response = await api.post(`/images/service-image/${serviceId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // backend returns { image, serviceName }
    return response.data.image;
  },
  uploadSpecialistPhoto: async (specialistId, formData) => {
    const response = await api.post(`/images/specialist-photo/${specialistId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // backend returns { photo, specialistName }
    return response.data.photo;
  },
  deleteServiceImage: async (serviceId) => {
    return await api.delete(`/images/service-image/${serviceId}`);
  },
  deleteSpecialistPhoto: async (specialistId) => {
    return await api.delete(`/images/specialist-photo/${specialistId}`);
  },
};


export const branchesService = {
  updateMyBranch: async (branchId, data) => {
    const response = await api.put(`/branches/${branchId}`, data);
    return response;
  },
  createBranch: async (businessId, data) => {
    const response = await api.post(`/branches/${businessId}`, data);
    return response.branch;
  },
  deleteBranch: async (branchId) => {
    await api.delete(`/branches/${branchId}`);
  }
}