import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ListCard from "../../components/ListCard";

// Mock utility functions
jest.mock("../../utils/listUtils", () => ({
  getListItemCount: jest.fn((content) => (content ? 5 : 0)),
  getDuplicatesCount: jest.fn(() => 2),
}));

describe("ListCard", () => {
  const mockList = {
    id: 1,
    name: "Test List",
    content: "item1\nitem2\nitem3",
  };

  const defaultProps = {
    list: mockList,
    compareMode: "text",
    caseSensitive: false,
    immediateInput: "item1\nitem2\nitem3",
    onInputChange: jest.fn(),
    onOpenSettings: jest.fn(),
    onOpenFilter: jest.fn(),
    onRename: jest.fn(),
    onRemove: jest.fn(),
    onClear: jest.fn(),
    onTrimDuplicates: jest.fn(),
    onCopyContent: jest.fn(),
    onSort: jest.fn(),
    getThemedListColor: jest.fn(() => "#f0f0f0"),
    getListContent: jest.fn((id) => mockList.content),
    canRemove: true,
    setLists: jest.fn(),
  };

  test("renders list name and stats", () => {
    render(<ListCard {...defaultProps} />);

    // Check if list name is displayed
    expect(screen.getByText("Test List")).toBeInTheDocument();

    // Check if list stats are displayed
    expect(screen.getByText("Total: 5")).toBeInTheDocument();
    expect(screen.getByText("Duplicates: 2")).toBeInTheDocument();
  });

  test("handles rename button click", () => {
    render(<ListCard {...defaultProps} />);

    const renameButton = screen.getByRole("button", { name: /rename list/i });
    fireEvent.click(renameButton);

    expect(defaultProps.onRename).toHaveBeenCalledWith(mockList);
  });

  test("handles input change", () => {
    render(<ListCard {...defaultProps} />);

    const textField = screen.getByRole("textbox");
    fireEvent.change(textField, { target: { value: "new content" } });

    expect(defaultProps.onInputChange).toHaveBeenCalledWith(1, "new content");
  });
});
