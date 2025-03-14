import { render, renderHook } from "@testing-library/react";
import { ThemeProvider } from "./contexts/ThemeContext";

// Custom render function to wrap components in necessary providers
export function customRender(ui, options) {
  return render(ui, {
    wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    ...options,
  });
}

// Custom renderHook function to wrap hooks in necessary providers
export function customRenderHook(hook, options) {
  return renderHook(hook, {
    wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    ...options,
  });
}

// Re-export everything
export * from "@testing-library/react";
