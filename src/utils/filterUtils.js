/**
 * Utilities for list filtering using patterns, regex, and wildcards
 */

/**
 * Convert wildcard pattern to regex pattern
 * @param {string} pattern - Wildcard pattern where * matches any characters
 * @returns {RegExp} - Equivalent regular expression
 */
export const wildcardToRegex = (pattern) => {
  // Escape special regex characters, but not the * wildcard
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  // Convert * wildcard to regex equivalent
  const regexPattern = escaped.replace(/\*/g, ".*");
  return new RegExp(`^${regexPattern}$`);
};

/**
 * Filter list items using a provided pattern
 * @param {string[]} items - Array of items to filter
 * @param {string} pattern - Filter pattern
 * @param {Object} options - Filter options
 * @returns {string[]} - Filtered items
 */
export const filterItems = (items, pattern, options = {}) => {
  const {
    isRegex = false,
    isWildcard = false,
    caseSensitive = true,
    invertMatch = false,
    matchWholeWord = false,
  } = options;

  if (!pattern) return items;

  try {
    let regex;

    if (isRegex) {
      // Use the pattern directly as a regex
      regex = new RegExp(pattern, caseSensitive ? "" : "i");
    } else if (isWildcard) {
      // Convert wildcard pattern to regex
      regex = wildcardToRegex(pattern);
      if (!caseSensitive) {
        regex = new RegExp(regex.source, "i");
      }
    } else {
      // Plain text search with optional whole word matching
      let escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (matchWholeWord) {
        escapedPattern = `\\b${escapedPattern}\\b`;
      }
      regex = new RegExp(escapedPattern, caseSensitive ? "" : "i");
    }

    return items.filter((item) => {
      const matches = regex.test(item);
      return invertMatch ? !matches : matches;
    });
  } catch (error) {
    console.error("Invalid filter pattern:", error);
    return items; // Return original items if pattern is invalid
  }
};

/**
 * Apply a filter to list content
 * @param {string} content - List content as a string
 * @param {string} pattern - Filter pattern
 * @param {Object} options - Filter options
 * @returns {string} - Filtered content as a string
 */
export const applyFilter = (content, pattern, options = {}) => {
  if (!pattern) return content;

  const items = content.split(/\n+/).filter((line) => line.trim() !== "");
  const filteredItems = filterItems(items, pattern, options);

  return filteredItems.join("\n");
};
