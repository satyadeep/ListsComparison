import { useState, useEffect, useMemo, useCallback } from "react";
import {
  compareAllLists,
  compareSelectedLists,
  transformCommonToUppercase,
  transformCommonToLowercase,
  transformCommonToSentenceCase,
  transformCommonToCamelCase,
  transformCommonToPascalCase,
} from "../utils/listUtils";

/**
 * Custom hook for managing list comparisons and results
 */
export function useComparison() {
  const [compareMode, setCompareMode] = useState("text");
  const [comparisonType, setComparisonType] = useState("union");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [selectedLists, setSelectedLists] = useState([]);
  const [results, setResults] = useState([]);
  const [commonSelected, setCommonSelected] = useState([]);
  const [resultsSorting, setResultsSorting] = useState({});

  // Define effects and memoized functions that will be used with external list data
  const getComparisonResults = useCallback(
    (lists, getListContent) => {
      // Create a temporary list array with filtered content if provided
      const effectiveLists = lists.map((list) => ({
        ...list,
        content:
          typeof getListContent === "function"
            ? getListContent(list.id)
            : list.content,
      }));

      return compareAllLists(effectiveLists, compareMode, caseSensitive);
    },
    [compareMode, caseSensitive]
  );

  const getCommonSelectedResults = useCallback(
    (lists, getListContent) => {
      // Create a temporary list array with filtered content if provided
      const effectiveLists = lists.map((list) => ({
        ...list,
        content:
          typeof getListContent === "function"
            ? getListContent(list.id)
            : list.content,
      }));

      return compareSelectedLists(
        effectiveLists,
        selectedLists,
        compareMode,
        caseSensitive,
        comparisonType
      );
    },
    [selectedLists, compareMode, caseSensitive, comparisonType]
  );

  const transformCommonResults = useCallback(
    (transformType) => {
      switch (transformType) {
        case "uppercase":
          transformCommonToUppercase(commonSelected, setCommonSelected);
          break;
        case "lowercase":
          transformCommonToLowercase(commonSelected, setCommonSelected);
          break;
        case "sentencecase":
          transformCommonToSentenceCase(commonSelected, setCommonSelected);
          break;
        case "camelcase":
          transformCommonToCamelCase(commonSelected, setCommonSelected);
          break;
        case "pascalcase":
          transformCommonToPascalCase(commonSelected, setCommonSelected);
          break;
        default:
          break;
      }
    },
    [commonSelected]
  );

  // Handle sort for result items
  const handleSortResults = useCallback((listId, direction) => {
    setResultsSorting((prev) => ({
      ...prev,
      [listId]: direction,
    }));
  }, []);

  return {
    compareMode,
    setCompareMode,
    comparisonType,
    setComparisonType,
    caseSensitive,
    setCaseSensitive,
    selectedLists,
    setSelectedLists,
    results,
    setResults,
    commonSelected,
    setCommonSelected,
    resultsSorting,
    setResultsSorting,
    getComparisonResults,
    getCommonSelectedResults,
    transformCommonResults,
    handleSortResults,
  };
}
