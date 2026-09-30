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

export const CUSTOMER_TOKEN_KEY = "customer_token";
export const CUSTOMER_USER_KEY = "customer_user";
export const CUSTOMER_ADDRESSES_KEY = "customer_addresses";

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
    return () => window.removeEventListener("storage", handleStorage);
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

      toast.success("Delivery address saved successfully");
      return newAddr;
    } catch (err: any) {
      toast.error(err.message || "Could not save address. Please check all fields.");
      throw err;
    } finally {
      setLoading(false);
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
    logout,
  };
}

export default useCustomerAuth;
