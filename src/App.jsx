import React from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppContent from "./components/AppContent";

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <AppContent />
      </div>
    </ThemeProvider>
  );
}

export default App;
