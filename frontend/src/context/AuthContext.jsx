import { createContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { audioAlerts } from "../utils/audioAlert";

export const AuthContext = createContext();

const isTokenExpired = (tokenStr) => {
  if (!tokenStr) return true;
  try {
    const payload = JSON.parse(atob(tokenStr.split('.')[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const socketRef = useRef(null);

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Role and Privilege Computed Flags
  const role = user?.role || "patient";
  const isPatient = role === "patient";
  const isDoctor = role === "doctor";
  const isAdmin = role === "admin";
  const isPremium = user?.is_premium === true;
  const isEmergencyActive = Boolean(user?.is_emergency_active);

  // Theme Management (dark, light, premium)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme_mode");
    if (saved) return saved;
    return "dark"; // Default to Futuristic UNESCO Deep Space Dark
  });

  useEffect(() => {
    if (isPremium) {
      const saved = localStorage.getItem("theme_mode");
      if (!saved) {
        setTheme("premium");
      }
    }
  }, [isPremium]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme_mode", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (isPremium) {
        if (prev === "premium") return "dark";
        if (prev === "dark") return "light";
        return "premium";
      }
      return prev === "dark" ? "light" : "dark";
    });
  };

  const normalizeUserData = (data) => {
    if (!data) return null;
    return {
      ...data,
      id: data.id || data.user_id,
      fullName: data.full_name || data.fullName || data.name || "Aegis Care Member",
      email: data.email || "",
      role: data.role || "patient",
      wallet_balance: parseFloat(data.wallet_balance || 0),
      is_premium: Boolean(data.is_premium),
      is_emergency_active: Boolean(data.is_emergency_active),
      referral_code: data.referral_code || null,
    };
  };

  // ----------------------------------------------------------------------------
  // Socket.IO Gateway Management
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketConnected(false);
      }
      return;
    }

    // Initialize Socket.IO connection
    const socket = io(backendUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("⚡ [AegisGlobal Socket] Connected to UNESCO Gateway:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      setSocketConnected(false);
      console.log("⚠️ [AegisGlobal Socket] Disconnected:", reason);
      if (reason === "io server disconnect" || reason === "transport close") {
        toast.warn("Horizon Gateway socket offline. Reconnecting...", {
          toastId: "socket-disconnect",
          autoClose: 4000
        });
      }
    });

    // Real-Time UNESCO Emergency SOS Broadcasts & SLA Handlers
    socket.on("emergency:new", (data) => {
      console.warn("🚨 [AegisGlobal] Incoming Emergency Alert:", data);
      audioAlerts.playEmergencySiren();
      audioAlerts.dispatchDesktopNotification("🚨 UNESCO Emergency SOS", {
        body: `Priority triage alert from ${data.patientName || 'Patient'}. 10-Minute SLA active!`
      });
      toast.error(
        `🚨 EMERGENCY SOS: ${data.patientName || 'Patient'} needs immediate consultation (10-Min SLA)!`,
        { autoClose: 10000, theme: "dark" }
      );
      setEmergencyAlerts((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("emergency:reassigned", (data) => {
      console.info("🔄 [AegisGlobal] Emergency Request Reassigned:", data);
      audioAlerts.playWarningChime();
      audioAlerts.dispatchDesktopNotification("🔄 Emergency Reassigned", {
        body: `Emergency request for ${data.patientName || 'Patient'} has been reassigned to another specialist.`
      });
      toast.warn(
        `🔄 Emergency Reassigned: Auto-rerouting to next available UNESCO trauma responder.`,
        { autoClose: 8000, theme: "dark" }
      );
      setEmergencyAlerts((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("penalty:applied", (data) => {
      console.error("⚠️ [AegisGlobal] Penalty Applied:", data);
      audioAlerts.playWarningChime();
      audioAlerts.dispatchDesktopNotification("⚠️ SLA Penalty Applied", {
        body: data.message || "A penalty has been deducted from your wallet balance."
      });
      toast.error(
        `⚠️ SLA PENALTY APPLIED: ${data.message || 'Missed emergency response deadline. ₹1,000 deducted.'}`,
        { autoClose: 10000, theme: "dark" }
      );
    });

    socket.on("emergency:accepted", (data) => {
      audioAlerts.playIncomingCallTone();
      toast.success("✅ Emergency Consultation Accepted! Secure Telehealth link is active.", { theme: "dark" });
    });

    return () => {
      socket.disconnect();
      setSocketConnected(false);
      socketRef.current = null;
    };
  }, [token, backendUrl]);

  // ----------------------------------------------------------------------------
  // Profile Refresh & Sync
  // ----------------------------------------------------------------------------
  const verifyToken = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken || isTokenExpired(currentToken)) {
      return false;
    }
    try {
      const res = await axios.get(`${backendUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      return !!res.data;
    } catch {
      return false;
    }
  }, [backendUrl]);

  const refreshUnreadCount = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    try {
      const res = await axios.get(`${backendUrl}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setUnreadCount(res.data?.unreadCount || 0);
    } catch {
      // silently handle
    }
  }, [backendUrl]);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${backendUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      const normalized = normalizeUserData(res.data);
      localStorage.setItem("user", JSON.stringify(normalized));
      setUser(normalized);
      setToken(currentToken);
    } catch (err) {
      console.error("Failed to sync profile:", err?.response?.data || err.message);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    const init = async () => {
      if (token) {
        await refreshUser();
        await refreshUnreadCount();
      } else {
        setLoading(false);
      }
    };
    init();
  }, [token, refreshUser]);

  // ----------------------------------------------------------------------------
  // Authentication Actions
  // ----------------------------------------------------------------------------
  const login = async (email, password) => {
    const res = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
    const normalized = normalizeUserData(res.data.user);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(normalized));
    setToken(res.data.token);
    setUser(normalized);

    return res.data;
  };

  const register = async (payload) => {
    const res = await axios.post(`${backendUrl}/api/auth/register`, payload);
    const normalized = normalizeUserData(res.data.user);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(normalized));
    setToken(res.data.token);
    setUser(normalized);

    return res.data;
  };

  const googleLogin = async (credentialResponse, intendedRole = "patient") => {
    const res = await axios.post(`${backendUrl}/api/auth/google-login`, {
      credential: credentialResponse.credential,
      role: intendedRole,
    });

    const normalized = normalizeUserData(res.data.user);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(normalized));
    setToken(res.data.token);
    setUser(normalized);

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setEmergencyAlerts([]);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      const normalized = normalizeUserData(merged);
      localStorage.setItem("user", JSON.stringify(normalized));
      return normalized;
    });
  };

  const toggleEmergencyActive = async (newStatus) => {
    if (!token || !isDoctor) return;
    try {
      const res = await axios.put(
        `${backendUrl}/api/users/emergency-status`,
        { is_emergency_active: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser({ is_emergency_active: res.data.is_emergency_active });
      return res.data;
    } catch (err) {
      console.error("Failed to toggle emergency status:", err);
      throw err;
    }
  };

  const dismissEmergencyAlert = (appointmentId) => {
    setEmergencyAlerts((prev) => prev.filter((a) => a.appointmentId !== appointmentId));
  };

  return (
    <AuthContext.Provider
      value={{
        // Session & Tokens
        user,
        token,
        loading,
        role,

        // Role-based Flags
        isPatient,
        isDoctor,
        isAdmin,
        isPremium,
        isEmergencyActive,

        // Real-Time Socket
        socket: socketRef.current,
        socketConnected,
        emergencyAlerts,
        dismissEmergencyAlert,
        unreadCount,
        setUnreadCount,
        refreshUnreadCount,
        verifyToken,

        // Theme
        theme,
        toggleTheme,
        setTheme,

        // Actions
        login,
        register,
        googleLogin,
        logout,
        updateUser,
        refreshUser,
        toggleEmergencyActive,
        backendUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
