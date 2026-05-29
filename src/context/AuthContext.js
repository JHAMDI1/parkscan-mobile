import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@worker_session');
        if (storedUser) {
          setWorker(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (workerData) => {
    try {
      await AsyncStorage.setItem('@worker_session', JSON.stringify(workerData));
      setWorker(workerData);
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@worker_session');
      setWorker(null);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ worker, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
