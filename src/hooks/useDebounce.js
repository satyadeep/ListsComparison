import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing value changes
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay time in milliseconds
 * @returns {any} Debounced value
 */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes or component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
