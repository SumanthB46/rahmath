import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export interface AddressItem {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address_line: string;
  area?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  is_default?: boolean;
}

export interface CustomerUser {
  id?: number | string;
  name?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  role: "customer";
  status?: string;
}

export interface CustomerOrderItem {
  id: number;
  product_id?: number;
  product_name: string;
  sku?: string;
  price: number;
  quantity: number;
  unit?: string;
  total: number;
  product_image?: string;
}

export interface CustomerOrder {
  id: number;
  order_number: string;
  user_id?: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  product_total: number;
  product_payment_status: string;
  order_status: string;
  created_at: string;
  items?: CustomerOrderItem[];
  delivery?: {
    partner?: string;
    partner_name?: string;
    delivery_charge?: number;
    delivery_status?: string;
    tracking_number?: string;
    expected_delivery_date?: string;
  };
}

export const CUSTOMER_TOKEN_KEY = "customer_token";
export const CUSTOMER_USER_KEY = "customer_user";
export const CUSTOMER_ADDRESSES_KEY = "customer_addresses";

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mubarak_auth_changed"));
  }
}

export function useCustomerAuth() {
  const [user, setUser] = useState<CustomerUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(CUSTOMER_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CUSTOMER_TOKEN_KEY) || null;
  });

  const [addresses, setAddresses] = useState<AddressItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CUSTOMER_ADDRESSES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const storedUser = localStorage.getItem(CUSTOMER_USER_KEY);
        const storedToken = localStorage.getItem(CUSTOMER_TOKEN_KEY);
        const storedAddrs = localStorage.getItem(CUSTOMER_ADDRESSES_KEY);
        setUser(storedUser ? JSON.parse(storedUser) : null);
        setToken(storedToken || null);
        setAddresses(storedAddrs ? JSON.parse(storedAddrs) : []);
      } catch {
        setUser(null);
        setToken(null);
        setAddresses([]);
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("mubarak_auth_changed", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("mubarak_auth_changed", handleStorage);
    };
  }, []);

  // Send Phone OTP
  const sendOtp = async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      }).then((r) => r.json());

      if (!res.success) {
        throw new Error(res.message || res.error || "Failed to send OTP.");
      }
      return res;
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP. Please verify your phone number.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify Phone OTP
  const verifyOtp = async (phone: string, otp: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      }).then((r) => r.json());

      if (!res.success || !res.token) {
        throw new Error(res.message || res.error || "Invalid OTP entered.");
      }

      const userData: CustomerUser = {
        ...res.user,
        role: "customer",
      };
      const authToken: string = res.token;
      const userAddrs: AddressItem[] = res.addresses || [];

      setUser(userData);
      setToken(authToken);
      setAddresses(userAddrs);

      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(CUSTOMER_TOKEN_KEY, authToken);
      localStorage.setItem(CUSTOMER_ADDRESSES_KEY, JSON.stringify(userAddrs));
      notifyAuthChanged();

      return {
        user: userData,
        token: authToken,
        isNew: res.isNew,
        hasProfile: res.hasProfile,
        addresses: userAddrs,
      };
    } catch (err: any) {
      toast.error(err.message || "OTP verification failed. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update Customer Profile
  const updateProfile = async (data: { name?: string; email?: string; mobile?: string }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      }).then((r) => r.json());

      if (!res.success) {
        throw new Error(res.message || res.error || "Failed to update profile.");
      }

      const updatedUser: CustomerUser = {
        ...res.user,
        role: "customer",
      };
      setUser(updatedUser);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
      notifyAuthChanged();
      return updatedUser;
    } catch (err: any) {
      toast.error(err.message || "Profile update failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch Saved Delivery Addresses
  const fetchAddresses = async () => {
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE_URL}/auth/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());

      if (res.success && Array.isArray(res.addresses)) {
        setAddresses(res.addresses);
        localStorage.setItem(CUSTOMER_ADDRESSES_KEY, JSON.stringify(res.addresses));
        notifyAuthChanged();
        return res.addresses;
      }
      return [];
    } catch {
      return addresses;
    }
  };

  // Save New Delivery Address
  const saveAddress = async (data: {
    full_name: string;
    phone: string;
    address_line: string;
    area?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    is_default?: boolean;
  }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      }).then((r) => r.json());

      if (!res.success) {
        throw new Error(res.message || res.error || "Failed to save address.");
      }

      const newAddr: AddressItem = res.address;
      const updatedList = [newAddr, ...addresses.filter((a) => a.id !== newAddr.id)];
      setAddresses(updatedList);
      localStorage.setItem(CUSTOMER_ADDRESSES_KEY, JSON.stringify(updatedList));
      notifyAuthChanged();

      toast.success("Delivery address saved successfully");
      return newAddr;
    } catch (err: any) {
      toast.error(err.message || "Could not save address. Please check all fields.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update Existing Address
  const updateAddress = async (id: number, data: Partial<AddressItem>) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/addresses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      }).then((r) => r.json());

      if (!res.success) {
        throw new Error(res.message || "Failed to update address.");
      }

      const updatedAddr: AddressItem = res.address;
      const updatedList = addresses.map((a) => {
        if (data.is_default) {
          return a.id === id ? updatedAddr : { ...a, is_default: false };
        }
        return a.id === id ? updatedAddr : a;
      });
      setAddresses(updatedList);
      localStorage.setItem(CUSTOMER_ADDRESSES_KEY, JSON.stringify(updatedList));
      notifyAuthChanged();

      toast.success("Address updated successfully");
      return updatedAddr;
    } catch (err: any) {
      toast.error(err.message || "Could not update address.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete Address
  const deleteAddress = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/addresses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }).then((r) => r.json());

      if (!res.success) {
        throw new Error(res.message || "Failed to delete address.");
      }

      const updatedList = addresses.filter((a) => a.id !== id);
      setAddresses(updatedList);
      localStorage.setItem(CUSTOMER_ADDRESSES_KEY, JSON.stringify(updatedList));
      notifyAuthChanged();

      toast.success("Address deleted successfully");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Could not delete address.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch Customer's Orders
  const fetchOrders = async (): Promise<CustomerOrder[]> => {
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE_URL}/orders/my/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json());

      if (res.success && Array.isArray(res.orders)) {
        return res.orders;
      }
      return [];
    } catch {
      return [];
    }
  };

  // Email / Password Login
  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }).then((r) => r.json());

      if (!res.token || !res.user) {
        throw new Error(res.message || res.error || "Login failed");
      }

      const userData: CustomerUser = {
        ...res.user,
        role: "customer",
      };
      setUser(userData);
      setToken(res.token);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(CUSTOMER_TOKEN_KEY, res.token);
      notifyAuthChanged();
      toast.success("Welcome back!", { description: `Logged in as ${userData.name || userData.email}` });
      return userData;
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in. Please check your credentials.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Register
  const register = async (data: { name: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json());

      if (!res.token || !res.user) {
        throw new Error(res.message || res.error || "Registration failed");
      }

      const userData: CustomerUser = {
        ...res.user,
        role: "customer",
      };
      setUser(userData);
      setToken(res.token);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(CUSTOMER_TOKEN_KEY, res.token);
      notifyAuthChanged();
      toast.success("Account created successfully", { description: `Welcome, ${userData.name}!` });
      return userData;
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAddresses([]);
    localStorage.removeItem(CUSTOMER_USER_KEY);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_ADDRESSES_KEY);
    notifyAuthChanged();
    toast.info("Signed out of customer account");
  }, []);

  return {
    user,
    token,
    addresses,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    sendOtp,
    verifyOtp,
    sendPhoneOtp: sendOtp,
    verifyPhoneOtp: verifyOtp,
    updateProfile,
    fetchAddresses,
    saveAddress,
    updateAddress,
    deleteAddress,
    fetchOrders,
    logout,
  };
}

export default useCustomerAuth;
