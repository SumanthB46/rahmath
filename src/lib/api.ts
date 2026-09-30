/**
 * Mubarak Ceramic Studio - Unified Backend API Client
 * Separate customer and admin API clients with isolated token headers.
 */

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  total?: number;
  products?: unknown[];
  categories?: any[];
  orders?: unknown[];
  customers?: unknown[];
  user?: unknown;
  token?: string;
  admin?: unknown;
  error?: string;
}

export interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  projectType: string;
  message: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  mobile?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Token Helpers
 */
export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customer_token");
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

/**
 * Low-level HTTP request helper
 */
async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  tokenGetter?: () => string | null
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  if (tokenGetter) {
    const token = tokenGetter();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      if (tokenGetter === getAdminToken || endpoint.startsWith("/admin") || endpoint.startsWith("admin")) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        window.dispatchEvent(new Event("admin-unauthorized"));
      }
    }
    const errorMsg = data.message || data.error || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

/**
 * Customer API Client (Attaches customer_token)
 */
export const customerApiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    httpRequest<T>(endpoint, { ...options, method: "GET" }, getCustomerToken),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    httpRequest<T>(
      endpoint,
      { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined },
      getCustomerToken
    ),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    httpRequest<T>(
      endpoint,
      { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined },
      getCustomerToken
    ),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    httpRequest<T>(endpoint, { ...options, method: "DELETE" }, getCustomerToken),
};

/**
 * Admin API Client (Attaches admin_token)
 */
export const adminApiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    httpRequest<T>(endpoint, { ...options, method: "GET" }, getAdminToken),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    httpRequest<T>(
      endpoint,
      { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined },
      getAdminToken
    ),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    httpRequest<T>(
      endpoint,
      { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined },
      getAdminToken
    ),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    httpRequest<T>(
      endpoint,
      { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined },
      getAdminToken
    ),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    httpRequest<T>(endpoint, { ...options, method: "DELETE" }, getAdminToken),
};

/**
 * Unified API Facade
 */
export const api = {
  // Public Endpoints
  async checkHealth(): Promise<{ status: string; message: string; timestamp: string }> {
    return httpRequest("/health", { method: "GET" });
  },

  async submitInquiry(payload: InquiryPayload): Promise<ApiResponse> {
    return httpRequest("/inquiries", { method: "POST", body: JSON.stringify(payload) });
  },

  // Public Catalogs
  catalogs: {
    async getAll(params: { category?: string } = {}): Promise<{ success: boolean; data: any[]; categories: string[]; total: number }> {
      const q = params.category ? `?category=${encodeURIComponent(params.category)}` : "";
      return httpRequest(`/catalogs${q}`, { method: "GET" });
    },
    async getById(id: string | number): Promise<ApiResponse> {
      return httpRequest(`/catalogs/${id}`, { method: "GET" });
    },
    getDownloadUrl(id: string | number): string {
      return `${API_BASE_URL}/catalogs/${id}/download`;
    },
  },

  // Public Orders / Tracking
  orders: {
    async track(orderQuery: string): Promise<ApiResponse> {
      return httpRequest(`/orders/track/${encodeURIComponent(orderQuery)}`, { method: "GET" });
    },
  },

  getGoogleAuthUrl(): string {
    return `${API_BASE_URL}/auth/google`;
  },

  // Customer Auth
  customer: {
    async sendOtp(phone: string): Promise<ApiResponse> {
      return customerApiClient.post("/auth/send-otp", { phone });
    },

    async verifyOtp(phone: string, otp: string): Promise<ApiResponse> {
      return customerApiClient.post("/auth/verify-otp", { phone, otp });
    },

    async getProfile(): Promise<ApiResponse> {
      return customerApiClient.get("/auth/me");
    },

    async updateProfile(data: { name?: string; email?: string; mobile?: string }): Promise<ApiResponse> {
      return customerApiClient.put("/auth/profile", data);
    },

    async getAddresses(): Promise<ApiResponse> {
      return customerApiClient.get("/auth/addresses");
    },

    async saveAddress(data: any): Promise<ApiResponse> {
      return customerApiClient.post("/auth/addresses", data);
    },
  },

  // ================= ADMIN API (Strictly requires admin_token) =================
  admin: {
    async login(payload: LoginPayload): Promise<{
      success?: boolean;
      token?: string;
      admin?: any;
      message?: string;
      requires2FA?: boolean;
      isSetup?: boolean;
      tempToken?: string;
      secret?: string;
      otpauthUrl?: string;
    }> {
      return adminApiClient.post("/admin/auth/login", payload);
    },

    async verify2FA(payload: { tempToken: string; code: string }): Promise<{
      success: boolean;
      token: string;
      admin: any;
      message?: string;
    }> {
      return adminApiClient.post("/admin/auth/verify-2fa", payload);
    },

    async getProfile(): Promise<ApiResponse> {
      return adminApiClient.get("/admin/auth/me");
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
      return adminApiClient.post("/admin/auth/change-password", { currentPassword, newPassword });
    },

    async reset2FA(payload: { password: string; code?: string }): Promise<ApiResponse> {
      return adminApiClient.post("/admin/auth/reset-2fa", payload);
    },

    // Dashboard
    async getDashboardStats(): Promise<ApiResponse> {
      return adminApiClient.get("/admin/dashboard/stats");
    },

    // Products
    async getProducts(params: Record<string, any> = {}): Promise<ApiResponse> {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const q = searchParams.toString();
      return adminApiClient.get(`/admin/products${q ? `?${q}` : ""}`);
    },

    async getProduct(id: string | number): Promise<ApiResponse> {
      return adminApiClient.get(`/admin/products/${id}`);
    },

    async createProduct(data: any): Promise<ApiResponse> {
      return adminApiClient.post("/admin/products", data);
    },

    async updateProduct(id: string | number, data: any): Promise<ApiResponse> {
      return adminApiClient.put(`/admin/products/${id}`, data);
    },

    async deleteProduct(id: string | number): Promise<ApiResponse> {
      return adminApiClient.delete(`/admin/products/${id}`);
    },

    async updateStock(id: string | number, stockQuantity: number): Promise<ApiResponse> {
      return adminApiClient.patch(`/admin/products/${id}/stock`, { stockQuantity });
    },

    async toggleProductStatus(id: string | number, isActive: boolean): Promise<ApiResponse> {
      return adminApiClient.patch(`/admin/products/${id}/status`, { isActive });
    },

    // Categories
    async getCategories(): Promise<ApiResponse> {
      return adminApiClient.get("/admin/categories");
    },

    async createCategory(data: any): Promise<ApiResponse> {
      return adminApiClient.post("/admin/categories", data);
    },

    async updateCategory(id: string | number, data: any): Promise<ApiResponse> {
      return adminApiClient.put(`/admin/categories/${id}`, data);
    },

    async deleteCategory(id: string | number): Promise<ApiResponse> {
      return adminApiClient.delete(`/admin/categories/${id}`);
    },

    async createSubcategory(data: any): Promise<ApiResponse> {
      return adminApiClient.post("/admin/subcategories", data);
    },

    async updateSubcategory(id: string | number, data: any): Promise<ApiResponse> {
      return adminApiClient.put(`/admin/subcategories/${id}`, data);
    },

    async deleteSubcategory(id: string | number): Promise<ApiResponse> {
      return adminApiClient.delete(`/admin/subcategories/${id}`);
    },

    // Orders
    async getOrders(params: Record<string, any> = {}): Promise<ApiResponse> {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const q = searchParams.toString();
      return adminApiClient.get(`/admin/orders${q ? `?${q}` : ""}`);
    },

    async getOrder(id: string | number): Promise<ApiResponse> {
      return adminApiClient.get(`/admin/orders/${id}`);
    },

    async updateOrderStatus(id: string | number, orderStatus: string): Promise<ApiResponse> {
      return adminApiClient.patch(`/admin/orders/${id}/status`, { orderStatus });
    },

    // Delivery
    async updateDeliveryDetails(id: string | number, data: any): Promise<ApiResponse> {
      return adminApiClient.patch(`/admin/orders/${id}/delivery`, data);
    },

    async markDeliveryPaymentPaid(id: string | number, notes?: string): Promise<ApiResponse> {
      return adminApiClient.post(`/admin/orders/${id}/delivery-payment`, { notes });
    },

    // Customers
    async getCustomers(params: Record<string, any> = {}): Promise<ApiResponse> {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const q = searchParams.toString();
      return adminApiClient.get(`/admin/customers${q ? `?${q}` : ""}`);
    },

    async getCustomer(id: string | number): Promise<ApiResponse> {
      return adminApiClient.get(`/admin/customers/${id}`);
    },

    // Coupons
    async getCoupons(): Promise<ApiResponse> {
      return adminApiClient.get("/admin/coupons");
    },

    async createCoupon(data: any): Promise<ApiResponse> {
      return adminApiClient.post("/admin/coupons", data);
    },

    async updateCoupon(id: string | number, data: any): Promise<ApiResponse> {
      return adminApiClient.put(`/admin/coupons/${id}`, data);
    },

    async deleteCoupon(id: string | number): Promise<ApiResponse> {
      return adminApiClient.delete(`/admin/coupons/${id}`);
    },

    // Reviews
    async getReviews(): Promise<ApiResponse> {
      return adminApiClient.get("/admin/reviews");
    },

    async updateReviewStatus(id: string | number, status: string): Promise<ApiResponse> {
      return adminApiClient.patch(`/admin/reviews/${id}/status`, { status });
    },

    async deleteReview(id: string | number): Promise<ApiResponse> {
      return adminApiClient.delete(`/admin/reviews/${id}`);
    },

    // Banners
    async getBanners(): Promise<ApiResponse> {
      return adminApiClient.get("/admin/banners");
    },

    async createBanner(data: any): Promise<ApiResponse> {
      return adminApiClient.post("/admin/banners", data);
    },

    async updateBanner(id: string | number, data: any): Promise<ApiResponse> {
      return adminApiClient.put(`/admin/banners/${id}`, data);
    },

    async deleteBanner(id: string | number): Promise<ApiResponse> {
      return adminApiClient.delete(`/admin/banners/${id}`);
    },

    // Catalogs
    async getCatalogs(params: Record<string, any> = {}): Promise<ApiResponse> {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const q = searchParams.toString();
      return adminApiClient.get(`/admin/catalogs${q ? `?${q}` : ""}`);
    },

    async getCatalog(id: string | number): Promise<ApiResponse> {
      return adminApiClient.get(`/admin/catalogs/${id}`);
    },

    async createCatalog(data: any): Promise<ApiResponse> {
      return adminApiClient.post("/admin/catalogs", data);
    },

    async updateCatalog(id: string | number, data: any): Promise<ApiResponse> {
      return adminApiClient.put(`/admin/catalogs/${id}`, data);
    },

    async deleteCatalog(id: string | number): Promise<ApiResponse> {
      return adminApiClient.delete(`/admin/catalogs/${id}`);
    },

    async uploadCatalogFile(data: { filename: string; data: string; mimeType: string }): Promise<{ success: boolean; url: string; filename: string }> {
      return adminApiClient.post("/admin/catalogs/upload", data);
    },

    // Notifications
    async getNotifications(): Promise<ApiResponse> {
      return adminApiClient.get("/admin/notifications");
    },

    async markNotificationRead(id: string | number): Promise<ApiResponse> {
      return adminApiClient.patch(`/admin/notifications/${id}/read`);
    },

    async markAllNotificationsRead(): Promise<ApiResponse> {
      return adminApiClient.post("/admin/notifications/mark-all-read");
    },

    // Homepage Sections CMS
    homepage: {
      async getSections(): Promise<{ success: boolean; sections: any[] }> {
        return adminApiClient.get("/admin/homepage/sections");
      },
      async getSection(id: string | number): Promise<{ success: boolean; section: any }> {
        return adminApiClient.get(`/admin/homepage/sections/${id}`);
      },
      async createSection(data: any): Promise<ApiResponse> {
        return adminApiClient.post("/admin/homepage/sections", data);
      },
      async updateSection(id: string | number, data: any): Promise<ApiResponse> {
        return adminApiClient.put(`/admin/homepage/sections/${id}`, data);
      },
      async deleteSection(id: string | number): Promise<ApiResponse> {
        return adminApiClient.delete(`/admin/homepage/sections/${id}`);
      },
      async reorderSections(items: { id: number; sort_order: number }[]): Promise<ApiResponse> {
        return adminApiClient.patch("/admin/homepage/sections/reorder", { items });
      },
    },

    // Page Sections CMS
    sections: {
      async getSections(page = "home"): Promise<{ success: boolean; sections: any[] }> {
        return adminApiClient.get(`/admin/sections?page=${page}`);
      },
      async updateSection(id: string | number, data: any): Promise<ApiResponse> {
        return adminApiClient.patch(`/admin/sections/${id}`, data);
      },
      async revertSection(id: string | number): Promise<ApiResponse> {
        return adminApiClient.post(`/admin/sections/${id}/revert`);
      },
      async reorderSections(items: { id: number; sort_order: number }[]): Promise<ApiResponse> {
        return adminApiClient.patch("/admin/sections/reorder", { items });
      },
      async uploadSectionImage(payload: { filename: string; data: string; mimeType: string }): Promise<{ success: boolean; url: string }> {
        return adminApiClient.post("/admin/sections/upload-image", payload);
      },
    },

    // Settings
    async getSettings(): Promise<ApiResponse> {
      return adminApiClient.get("/admin/settings");
    },

    async updateSettings(data: any): Promise<ApiResponse> {
      return adminApiClient.put("/admin/settings", data);
    },

    // Catalogue Library & Sections
    async getCatalogSections(): Promise<ApiResponse> {
      return adminApiClient.get("/admin/catalog-sections");
    },
    async createCatalogSection(data: any): Promise<ApiResponse> {
      return adminApiClient.post("/admin/catalog-sections", data);
    },
    async updateCatalogSection(id: string | number, data: any): Promise<ApiResponse> {
      return adminApiClient.put(`/admin/catalog-sections/${id}`, data);
    },
    async deleteCatalogSection(id: string | number): Promise<ApiResponse> {
      return adminApiClient.delete(`/admin/catalog-sections/${id}`);
    },
    async reorderCatalogSections(orderedIds: (string | number)[]): Promise<ApiResponse> {
      return adminApiClient.post("/admin/catalog-sections/reorder", { orderedIds });
    },
    async getCatalogLibraryStructure(): Promise<ApiResponse> {
      return adminApiClient.get("/admin/catalog-sections/structure");
    },

    // Catalogs
    async getCatalogs(params: Record<string, any> = {}): Promise<ApiResponse> {
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") sp.append(k, String(v));
      });
      const q = sp.toString() ? `?${sp.toString()}` : "";
      return adminApiClient.get(`/admin/catalogs${q}`);
    },
    async getCatalog(id: string | number): Promise<ApiResponse> {
      return adminApiClient.get(`/admin/catalogs/${id}`);
    },
    async createCatalog(data: any): Promise<ApiResponse> {
      return adminApiClient.post("/admin/catalogs", data);
    },
    async updateCatalog(id: string | number, data: any): Promise<ApiResponse> {
      return adminApiClient.put(`/admin/catalogs/${id}`, data);
    },
    async deleteCatalog(id: string | number): Promise<ApiResponse> {
      return adminApiClient.delete(`/admin/catalogs/${id}`);
    },
    async reorderCatalogs(orderedIds: (string | number)[]): Promise<ApiResponse> {
      return adminApiClient.post("/admin/catalogs/reorder", { orderedIds });
    },
    async uploadCatalogFile(payload: { filename: string; data: string; mimeType: string }): Promise<{ success: boolean; url: string }> {
      return adminApiClient.post("/admin/catalogs/upload", payload);
    },

    // Video Blog / Reels CMS
    async getReels(params?: { status?: string; search?: string; category?: string }): Promise<{ success: boolean; reels: ReelItem[]; counts: any }> {
      const sp = new URLSearchParams();
      if (params?.status) sp.set("status", params.status);
      if (params?.search) sp.set("search", params.search);
      if (params?.category) sp.set("category", params.category);
      const q = sp.toString() ? `?${sp.toString()}` : "";
      return adminApiClient.get(`/admin/reels${q}`);
    },

    async createReel(data: any): Promise<{ success: boolean; message: string; reel: ReelItem }> {
      return adminApiClient.post("/admin/reels", data);
    },

    async updateReel(id: string | number, data: any): Promise<{ success: boolean; message: string; reel: ReelItem }> {
      return adminApiClient.put(`/admin/reels/${id}`, data);
    },

    async deleteReel(id: string | number): Promise<{ success: boolean; message: string }> {
      return adminApiClient.delete(`/admin/reels/${id}`);
    },

    async uploadReelMedia(payload: { filename: string; data: string; mimeType: string }): Promise<{ success: boolean; url: string; filename: string }> {
      return adminApiClient.post("/admin/reels/upload", payload);
    },
  },

  // Public Catalogs & Library
  catalogs: {
    async getLibrary(): Promise<{ success: boolean; data: { sections: any[]; featured: any; total_catalogues: number } }> {
      return httpRequest("/catalogs/library", { method: "GET" });
    },
    async getSections(): Promise<{ success: boolean; data: any[] }> {
      return httpRequest("/catalogs/sections", { method: "GET" });
    },
    async getCatalogs(params?: { category?: string; section_id?: string | number }): Promise<{ success: boolean; data: any[]; categories: string[]; total: number }> {
      const sp = new URLSearchParams();
      if (params?.category) sp.set("category", params.category);
      if (params?.section_id) sp.set("section_id", String(params.section_id));
      const q = sp.toString() ? `?${sp.toString()}` : "";
      return httpRequest(`/catalogs${q}`, { method: "GET" });
    },
    async getCatalog(idOrSlug: string | number): Promise<{ success: boolean; data: any }> {
      return httpRequest(`/catalogs/${idOrSlug}`, { method: "GET" });
    },
    getDownloadUrl(id: string | number): string {
      return `${API_BASE_URL}/catalogs/${id}/download`;
    },
  },

  // Public Sections
  sections: {
    async getPublicSections(page = "home"): Promise<{ success: boolean; sections: any[] }> {
      return httpRequest(`/sections?page=${page}`, { method: "GET" });
    },
  },

  // Public Reels / Video Blog
  reels: {
    async getPublicReels(category?: string): Promise<{ success: boolean; reels: ReelItem[]; categories: string[] }> {
      const q = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
      return httpRequest(`/reels${q}`, { method: "GET" });
    },
    async getPublicReel(id: string | number): Promise<{ success: boolean; reel: ReelItem }> {
      return httpRequest(`/reels/${id}`, { method: "GET" });
    },
    async recordView(id: string | number): Promise<{ success: boolean }> {
      return httpRequest(`/reels/${id}/view`, { method: "POST" });
    },
    async recordLike(id: string | number): Promise<{ success: boolean; likes_count: number }> {
      return httpRequest(`/reels/${id}/like`, { method: "POST" });
    },
  },
};

export interface ReelItem {
  id: number | string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  category?: string;
  tags?: string[];
  status?: string;
  dynamic_status?: "draft" | "scheduled" | "published" | "expired" | "unpublished";
  publish_at?: string;
  expires_at?: string | null;
  views_count?: number;
  likes_count?: number;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Exported standalone helpers
export const getPublicReels = (category?: string) => api.reels.getPublicReels(category);
export const getPublicReel = (id: string | number) => api.reels.getPublicReel(id);
export const recordReelView = (id: string | number) => api.reels.recordView(id);
export const recordReelLike = (id: string | number) => api.reels.recordLike(id);
export const getAdminReels = (params?: any) => api.admin.getReels(params);
export const createAdminReel = (data: any) => api.admin.createReel(data);
export const updateAdminReel = (id: string | number, data: any) => api.admin.updateReel(id, data);
export const deleteAdminReel = (id: string | number) => api.admin.deleteReel(id);
export const uploadReelMedia = async (file: File): Promise<{ success: boolean; url: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.admin.uploadReelMedia({
          filename: file.name,
          data: base64,
          mimeType: file.type || "video/mp4",
        });
        const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
        const fullUrl = res.url?.startsWith("http") ? res.url : `${backendOrigin}${res.url}`;
        resolve({ success: res.success, url: fullUrl });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Exported standalone helpers
export const getPublicSections = (page = "home") => api.sections.getPublicSections(page);
export const getAdminSections = (page = "home") => api.admin.sections.getSections(page);
export const updateSection = (id: string | number, data: any) => api.admin.sections.updateSection(id, data);
export const revertSection = (id: string | number) => api.admin.sections.revertSection(id);
export const reorderSections = (items: { id: number; sort_order: number }[]) => api.admin.sections.reorderSections(items);
export const uploadSectionImage = async (file: File): Promise<{ success: boolean; url: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.admin.sections.uploadSectionImage({
          filename: file.name,
          data: base64,
          mimeType: file.type || "image/jpeg",
        });
        const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
        const fullUrl = res.url?.startsWith("http") ? res.url : `${backendOrigin}${res.url}`;
        resolve({ success: res.success, url: fullUrl });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const uploadImage = uploadSectionImage;

export const uploadCatalogPdf = async (file: File): Promise<{ success: boolean; url: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res: any = await api.admin.uploadCatalogFile({
          filename: file.name,
          data: base64,
          mimeType: file.type || "application/pdf",
        });
        const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
        const fullUrl = res.url?.startsWith("http") ? res.url : `${backendOrigin}${res.url}`;
        resolve({ success: res.success, url: fullUrl });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default api;
