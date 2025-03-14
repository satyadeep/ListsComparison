import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../App";

// Mock child components to simplify testing
jest.mock("../../components/AppContent", () => () => (
  <div data-testid="app-content" />
));

describe("App", () => {
  test("renders AppContent component within ThemeProvider", () => {
    render(<App />);
    expect(screen.getByTestId("app-content")).toBeInTheDocument();
  });
});
