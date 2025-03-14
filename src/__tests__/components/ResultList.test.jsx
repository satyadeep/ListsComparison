import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ResultList from "../../components/ResultList";

// Mock the VirtualizedList component
jest.mock("../../components/VirtualizedList", () => {
  return ({ items }) => (
    <div data-testid="mocked-virtualized-list">
      {items.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  );
});

describe("ResultList", () => {
  const defaultProps = {
    title: "Test Results",
    items: ["item1", "item2", "item3"],
    listId: "test-list",
    origListId: 1,
    resultsSorting: {},
    setResultsSorting: jest.fn(),
    compareMode: "text",
    caseSensitive: false,
    onCopyToClipboard: jest.fn(),
  };

  test("renders title and items", () => {
    render(<ResultList {...defaultProps} />);

    expect(screen.getByText("Test Results")).toBeInTheDocument();
    expect(screen.getByText("item1")).toBeInTheDocument();
    expect(screen.getByText("item2")).toBeInTheDocument();
    expect(screen.getByText("item3")).toBeInTheDocument();
  });

  test("should handle copy button click", () => {
    render(<ResultList {...defaultProps} />);

    const copyButton = screen.getByRole("button", {
      name: /copy to clipboard/i,
    });
    fireEvent.click(copyButton);

    expect(defaultProps.onCopyToClipboard).toHaveBeenCalledWith(
      defaultProps.items
    );
  });

  test("should handle sort ascending button click", () => {
    render(<ResultList {...defaultProps} />);

    const sortAscButton = screen.getByRole("button", {
      name: /sort ascending/i,
    });
    fireEvent.click(sortAscButton);

    expect(defaultProps.setResultsSorting).toHaveBeenCalled();
  });
});
