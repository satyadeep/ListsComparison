import {
  parseInput,
  removeDuplicates,
  getListItemCount,
  sortListContent,
  getDuplicatesCount,
  compareAllLists,
  compareSelectedLists,
} from "../../utils/listUtils";

describe("parseInput function", () => {
  test("should parse numeric input correctly", () => {
    const input = "1,2,3\n4, 5";
    const result = parseInput(input, "numeric", false);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test("should filter out invalid numbers", () => {
    const input = "1,abc,2";
    const result = parseInput(input, "numeric", false);
    expect(result).toEqual([1, 2]);
  });

  test("should parse text input with case sensitivity", () => {
    const input = "Apple, banana\nORANGE";
    const result = parseInput(input, "text", true);
    expect(result).toEqual(["Apple", "banana", "ORANGE"]);
  });

  test("should parse text input without case sensitivity", () => {
    const input = "Apple, banana\nORANGE";
    const result = parseInput(input, "text", false);
    expect(result).toEqual(["apple", "banana", "orange"]);
  });
});

describe("removeDuplicates function", () => {
  test("should remove duplicates from numeric array", () => {
    const array = [1, 2, 2, 3, 1];
    const result = removeDuplicates(array, "numeric", false);
    expect(result).toEqual([1, 2, 3]);
  });

  test("should remove case-sensitive duplicates from text array", () => {
    const array = ["Apple", "apple", "Banana", "banana"];
    const result = removeDuplicates(array, "text", true);
    expect(result).toEqual(["Apple", "apple", "Banana", "banana"]);
  });

  test("should remove case-insensitive duplicates from text array", () => {
    const array = ["Apple", "apple", "Banana", "banana"];
    const result = removeDuplicates(array, "text", false);
    expect(result.length).toBe(2);
    expect(result).toContain("Apple"); // Keeps first occurrence
    expect(result).toContain("Banana");
  });
});

describe("getListItemCount function", () => {
  test("should count items correctly in numeric mode", () => {
    const content = "1,2,3\n4, 5, invalid";
    const count = getListItemCount(content, "numeric", false);
    expect(count).toBe(5);
  });

  test("should count items correctly in text mode", () => {
    const content = "apple, banana\norange";
    const count = getListItemCount(content, "text", false);
    expect(count).toBe(3);
  });

  test("should handle empty content", () => {
    const content = "";
    const count = getListItemCount(content, "text", false);
    expect(count).toBe(0);
  });
});

describe("sortListContent function", () => {
  test("should sort numeric content in ascending order", () => {
    const content = "3\n1\n2";
    const sorted = sortListContent(content, "asc", "numeric", false);
    expect(sorted).toBe("1\n2\n3");
  });

  test("should sort numeric content in descending order", () => {
    const content = "1\n3\n2";
    const sorted = sortListContent(content, "desc", "numeric", false);
    expect(sorted).toBe("3\n2\n1");
  });

  test("should sort text content with case sensitivity", () => {
    const content = "banana\nApple\norange";
    const sorted = sortListContent(content, "asc", "text", true);
    // Capital letters come before lowercase in ASCII
    expect(sorted).toBe("Apple\nbanana\norange");
  });

  test("should sort text content without case sensitivity", () => {
    const content = "banana\nApple\norange";
    const sorted = sortListContent(content, "asc", "text", false);
    expect(sorted).toBe("Apple\nbanana\norange");
  });
});

describe("getDuplicatesCount function", () => {
  test("should count duplicates in numeric list", () => {
    const content = "1,2,2,3,3,3";
    const count = getDuplicatesCount(content, "numeric");
    expect(count).toBe(3); // 1 duplicate of 2, 2 duplicates of 3
  });

  test("should count duplicates in text list", () => {
    const content = "apple,apple,banana,banana,banana";
    const count = getDuplicatesCount(content, "text");
    expect(count).toBe(3);
  });
});

describe("compareAllLists function", () => {
  test("should find unique and common values between lists", () => {
    const lists = [
      { id: 1, content: "apple\nbanana\ncherry" },
      { id: 2, content: "banana\ncherry\ndate" },
    ];

    const results = compareAllLists(lists, "text", true);

    // Find the result for list 1
    const list1Result = results.find((r) => r.listId === 1);
    expect(list1Result.uniqueValues).toEqual(["apple"]);

    // Find the result for list 2
    const list2Result = results.find((r) => r.listId === 2);
    expect(list2Result.uniqueValues).toEqual(["date"]);

    // Find common values
    const commonResult = results.find((r) => r.listId === "common");
    expect(commonResult.uniqueValues).toContain("banana");
    expect(commonResult.uniqueValues).toContain("cherry");
  });
});

describe("compareSelectedLists function", () => {
  const lists = [
    { id: 1, content: "apple\nbanana\ncherry" },
    { id: 2, content: "banana\ncherry\ndate" },
    { id: 3, content: "cherry\ndate\neggplant" },
  ];

  test("should find intersection of selected lists", () => {
    const selectedLists = [1, 2];
    const result = compareSelectedLists(
      lists,
      selectedLists,
      "text",
      true,
      "intersection"
    );
    expect(result).toHaveLength(2);
    expect(result).toContain("banana");
    expect(result).toContain("cherry");
  });

  test("should find union of selected lists", () => {
    const selectedLists = [1, 3];
    const result = compareSelectedLists(
      lists,
      selectedLists,
      "text",
      true,
      "union"
    );
    expect(result).toHaveLength(4);
    expect(result).toContain("apple");
    expect(result).toContain("banana");
    expect(result).toContain("cherry");
    expect(result).toContain("eggplant");
  });

  test("should return empty array when fewer than 2 lists are selected", () => {
    const selectedLists = [1];
    const result = compareSelectedLists(
      lists,
      selectedLists,
      "text",
      true,
      "union"
    );
    expect(result).toEqual([]);
  });
});
