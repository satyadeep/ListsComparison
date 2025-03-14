import { useState, useCallback } from "react";

/**
 * Custom hook for managing application notifications
 */
export function useNotification() {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showNotification = useCallback((message, severity = "info") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  return {
    notification,
    setNotification,
    showNotification,
    closeNotification,
  };
}
