import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (storedUser && tokenExpiry && Date.now() > tokenExpiry) {
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("token");
      return null;
    }

    return storedUser;
  });

  const login = (userData, token, tokenExpiryDuration = 7 * 24 * 60 * 60 * 1000) => {
    const expiryTime = Date.now() + tokenExpiryDuration;
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    localStorage.setItem("tokenExpiry", expiryTime);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    setUser(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const tokenExpiry = localStorage.getItem("tokenExpiry");
      if (tokenExpiry && Date.now() > tokenExpiry) {
        logout();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
