import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterDialog from "../../components/FilterDialog";

describe("FilterDialog", () => {
  const mockList = {
    id: 1,
    name: "Test List",
    content: "apple\nbanana\ncherry\ndate",
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    list: mockList,
    onApplyFilter: jest.fn(),
  };

  test("renders dialog with list name when open", () => {
    render(<FilterDialog {...defaultProps} />);

    // Check if dialog title includes list name
    expect(screen.getByText(/Filter List: Test List/i)).toBeInTheDocument();

    // Check if filter options are available
    expect(screen.getByLabelText(/Filter Pattern/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Plain Text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wildcard/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Regular Expression/i)).toBeInTheDocument();
  });

  test("handles filter pattern input", () => {
    render(<FilterDialog {...defaultProps} />);

    const patternInput = screen.getByLabelText(/Filter Pattern/i);
    fireEvent.change(patternInput, { target: { value: "a" } });

    // Should show preview
    expect(screen.getByText(/Filter Preview/i)).toBeInTheDocument();
  });

  test("applies filter when apply button is clicked", () => {
    render(<FilterDialog {...defaultProps} />);

    // Enter a pattern
    const patternInput = screen.getByLabelText(/Filter Pattern/i);
    fireEvent.change(patternInput, { target: { value: "a" } });

    // Click Apply button
    const applyButton = screen.getByRole("button", { name: /Apply/i });
    fireEvent.click(applyButton);

    expect(defaultProps.onApplyFilter).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ pattern: "a" })
    );
  });
});
