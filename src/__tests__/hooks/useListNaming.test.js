import { renderHook, act } from "@testing-library/react-hooks";
import { useListNaming } from "../../hooks/useListNaming";

describe("useListNaming hook", () => {
  const mockSetLists = jest.fn();
  const mockLists = [
    { id: 1, name: "List 1", content: "item1" },
    { id: 2, name: "List 2", content: "item2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("provides default state values", () => {
    const { result } = renderHook(() => useListNaming(mockLists, mockSetLists));

    expect(result.current.renameDialogOpen).toBe(false);
    expect(result.current.currentRenamingList).toBeNull();
    expect(result.current.newListName).toBe("");
  });

  test("opens rename dialog with correct list", () => {
    const { result } = renderHook(() => useListNaming(mockLists, mockSetLists));

    act(() => {
      result.current.openRenameDialog(mockLists[0]);
    });

    expect(result.current.renameDialogOpen).toBe(true);
    expect(result.current.currentRenamingList).toEqual(mockLists[0]);
    expect(result.current.newListName).toBe("List 1");
  });

  test("closes rename dialog", () => {
    const { result } = renderHook(() => useListNaming(mockLists, mockSetLists));

    act(() => {
      result.current.openRenameDialog(mockLists[0]);
    });

    act(() => {
      result.current.closeRenameDialog();
    });

    expect(result.current.renameDialogOpen).toBe(false);
    expect(result.current.currentRenamingList).toBeNull();
    expect(result.current.newListName).toBe("");
  });

  test("renames a list and closes dialog", () => {
    const { result } = renderHook(() => useListNaming(mockLists, mockSetLists));

    act(() => {
      result.current.openRenameDialog(mockLists[0]);
    });

    act(() => {
      result.current.setNewListName("Updated Name");
    });

    act(() => {
      result.current.renameList(mockLists[0].id, "Updated Name");
    });

    expect(mockSetLists).toHaveBeenCalled();
    expect(result.current.renameDialogOpen).toBe(false);
  });

  test("generates default list name", () => {
    const { result } = renderHook(() => useListNaming(mockLists, mockSetLists));

    const newName = result.current.getDefaultListName(mockLists);
    expect(newName).toBe("List 3");
  });
});
