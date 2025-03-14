import React, { createContext, useState, useContext, useEffect } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";

// Create the context
export const ThemeContext = createContext();

// Color schemes options
export const COLOR_SCHEMES = {
  blue: {
    name: "Blue",
    primary: "#1976d2",
    secondary: "#dc004e",
    accent: "#3f51b5",
    listColors: ["#bbdefb", "#c8e6c9", "#f8bbd0", "#d1c4e9", "#ffecb3"],
    listBorders: ["#1976d2", "#388e3c", "#d81b60", "#512da8", "#ff8f00"],
  },
  teal: {
    name: "Teal",
    primary: "#009688",
    secondary: "#ff5722",
    accent: "#4db6ac",
    listColors: ["#b2dfdb", "#c8e6c9", "#ffccbc", "#b3e5fc", "#f0f4c3"],
    listBorders: ["#00796b", "#388e3c", "#e64a19", "#0288d1", "#afb42b"],
  },
  purple: {
    name: "Purple",
    primary: "#673ab7",
    secondary: "#ffc107",
    accent: "#9c27b0",
    listColors: ["#d1c4e9", "#bbdefb", "#fff9c4", "#f8bbd0", "#c8e6c9"],
    listBorders: ["#512da8", "#1976d2", "#ffa000", "#c2185b", "#388e3c"],
  },
  dark: {
    name: "Dark",
    primary: "#bb86fc",
    secondary: "#03dac6",
    accent: "#cf6679",
    listColors: ["#333333", "#424242", "#4f4f4f", "#3d3d3d", "#383838"],
    listBorders: ["#bb86fc", "#03dac6", "#cf6679", "#8bc34a", "#ff9800"],
  },
};

export function ThemeProvider({ children }) {
  // Check for saved theme preferences
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "light";
  });

  const [colorScheme, setColorScheme] = useState(() => {
    const savedScheme = localStorage.getItem("colorScheme");
    return savedScheme || "blue";
  });

  // Create the theme based on current mode and color scheme
  const theme = React.useMemo(() => {
    const selectedScheme = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.blue;

    return createTheme({
      palette: {
        mode: mode,
        primary: {
          main: selectedScheme.primary,
        },
        secondary: {
          main: selectedScheme.secondary,
        },
        background: {
          default: mode === "light" ? "#f5f5f5" : "#121212",
          paper: mode === "light" ? "#ffffff" : "#1e1e1e",
        },
      },
      listColors: selectedScheme.listColors,
      listBorders: selectedScheme.listBorders,
    });
  }, [mode, colorScheme]);

  // Save theme preferences when they change
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
    localStorage.setItem("colorScheme", colorScheme);
  }, [mode, colorScheme]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const setThemeColorScheme = (schemeName) => {
    if (COLOR_SCHEMES[schemeName]) {
      setColorScheme(schemeName);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colorScheme,
        toggleColorMode,
        setThemeColorScheme,
        colorSchemes: COLOR_SCHEMES,
      }}
    >
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

// Custom hook for using the theme context
export function useTheme() {
  return useContext(ThemeContext);
}
