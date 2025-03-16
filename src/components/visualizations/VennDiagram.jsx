import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Typography,
  useTheme,
  Paper,
  List,
  ListItem,
  Fade,
} from "@mui/material";
import * as d3 from "d3";
// Import the compareSelectedLists function from listUtils
import { compareSelectedLists } from "../../utils/listUtils";

// Custom tooltip component for showing entries with scrolling support
const VennTooltip = ({ title, entries, position, onLock, isLocked }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const maxEntriesToShow = 100; // Show more since we have scrolling
  const hasMoreEntries = entries.length > maxEntriesToShow;
  const displayEntries = entries.slice(0, maxEntriesToShow);

  // Handle click to toggle lock state
  const handleTooltipClick = (e) => {
    e.stopPropagation(); // Stop propagation to prevent chart click
    if (onLock) onLock();
  };

  return (
    <Fade in={true}>
      <Paper
        elevation={4}
        className="venn-tooltip"
        sx={{
          position: "fixed",
          left: position.x + 15,
          top: position.y + 10,
          padding: "12px",
          backgroundColor: theme.palette.background.paper,
          maxWidth: "280px",
          maxHeight: "350px",
          borderRadius: 1,
          boxShadow: 3,
          pointerEvents: "all", // Enable mouse events for scrolling
          zIndex: 10000,
          border: isLocked ? `2px solid ${theme.palette.primary.main}` : "none",
          boxShadow: isLocked
            ? `0 0 0 2px ${theme.palette.primary.main}, ${theme.shadows[4]}`
            : theme.shadows[4],
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleTooltipClick}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
          {title} ({entries.length})
          {isLocked && (
            <span
              style={{
                fontSize: "0.8rem",
                marginLeft: "8px",
                color: theme.palette.text.secondary,
              }}
            >
              (Click to unlock)
            </span>
          )}
          {!isLocked && (
            <span
              style={{
                fontSize: "0.8rem",
                marginLeft: "8px",
                color: theme.palette.text.secondary,
              }}
            >
              (Click to lock)
            </span>
          )}
        </Typography>
        <Box
          sx={{
            maxHeight: "300px",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.mode === "dark" ? "#555" : "#ccc",
              borderRadius: "4px",
            },
          }}
        >
          <List dense disablePadding>
            {displayEntries.map((entry, idx) => (
              <ListItem key={idx} dense sx={{ py: 0.5 }}>
                <Typography variant="caption" color="textSecondary">
                  {entry}
                </Typography>
              </ListItem>
            ))}
          </List>
          {hasMoreEntries && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mt: 1, fontStyle: "italic", display: "block" }}
            >
              And {entries.length - maxEntriesToShow} more items...
            </Typography>
          )}
        </Box>
      </Paper>
    </Fade>
  );
};

// Create a connection bridge element to help with hover transitions
const TooltipBridge = ({ from, to }) => {
  const bridgeStyle = {
    position: "fixed",
    pointerEvents: "none",
    width: Math.abs(from.x - to.x) + 40,
    height: Math.abs(from.y - to.y) + 40,
    left: Math.min(from.x, to.x) - 20,
    top: Math.min(from.y, to.y) - 20,
    zIndex: 9998,
  };

  return <div style={bridgeStyle} />;
};

const VennDiagram = ({
  lists,
  results,
  showTooltips = true,
  compareMode = "text", // Add default compareMode
  caseSensitive = false, // Add default caseSensitive
}) => {
  const vennRef = useRef(null);
  const containerRef = useRef(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; // Add this line to define isDarkMode
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const [tooltip, setTooltip] = useState({
    show: false,
    title: "",
    entries: [],
    position: { x: 0, y: 0 },
    isLocked: false,
    sourcePosition: { x: 0, y: 0 },
  });
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const tooltipTimeoutRef = useRef(null);

  // Add console logs to debug when the diagram should render
  useEffect(() => {
    console.log("VennDiagram rendering with:", {
      lists: lists?.length,
      results: results?.length,
      hasVennRef: !!vennRef.current,
    });
  }, [lists, results]);

  // Track the current mouse position for smooth tooltip movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };

      // If tooltip is showing but not locked, we don't update position anymore
      // This helps make it easier to reach the tooltip
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Clear any pending timeout when component unmounts
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Resize observer to make the diagram responsive
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Get the container width and set appropriate dimensions
        const width = entry.contentRect.width;
        const height = Math.min(width * 0.75, 400); // Height proportional to width with a max

        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Replace the findIntersectionItems function to directly match what's used in AppContent.jsx
  const findIntersectionItems = useCallback(
    (listIds) => {
      // Handle the common items case (same as before)
      if (listIds.includes("common")) {
        const commonResult = results.find((r) => r.listId === "common");
        return commonResult ? commonResult.uniqueValues : [];
      }

      console.log("Finding intersection for lists:", listIds);

      // This is the key change - use lists directly without content modification
      // We'll let compareSelectedLists handle the content processing

      // This is EXACTLY how CustomComparisonSection calculates intersection
      return compareSelectedLists(
        lists, // Pass the original lists array
        listIds, // Pass the list IDs we want to compare
        compareMode, // Now properly captured from props
        caseSensitive, // Now properly captured from props
        "intersection" // Always want intersections for Venn diagrams
      );
    },
    // The closure correctly includes all variables used in the callback
    [lists, results, compareMode, caseSensitive]
  );

  // Main diagram rendering function
  useEffect(() => {
    if (!lists || lists.length < 2 || !results || !vennRef.current) return;

    // Clear previous content
    const container = d3.select(vennRef.current);
    container.selectAll("*").remove();

    console.log("Rendering Venn diagram with", lists.length, "lists");

    try {
      // Get the unique values for each list and common values
      const uniqueResults = results.filter((r) => r.listId !== "common");
      const commonResult = results.find((r) => r.listId === "common");
      const commonItems = commonResult ? commonResult.uniqueValues : [];

      // Set up dimensions
      const width = dimensions.width;
      const height = dimensions.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Calculate radius based on container size
      const baseRadius = Math.min(width, height) * 0.2;

      // Create SVG
      const svg = container
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

      // Colors for the circles
      const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

      if (lists.length === 2) {
        // For 2 lists, create 2 overlapping circles
        const list1 = lists[0];
        const list2 = lists[1];
        const result1 = uniqueResults.find((r) => r.listId === list1.id);
        const result2 = uniqueResults.find((r) => r.listId === list2.id);

        const count1 = result1 ? result1.uniqueValues.length : 0;
        const count2 = result2 ? result2.uniqueValues.length : 0;
        const commonCount = commonResult ? commonResult.uniqueValues.length : 0;

        const list1Items = result1 ? result1.uniqueValues : [];
        const list2Items = result2 ? result2.uniqueValues : [];

        // Detect if there are actually shared items between the two lists
        const intersectionItems = findIntersectionItems([list1.id, list2.id]);
        console.log("Two-list intersectionItems:", intersectionItems);
        const hasIntersection = intersectionItems.length > 0;

        // Normalize circle sizes based on item counts
        const radius1 =
          baseRadius * (0.8 + 0.2 * (count1 / Math.max(count1, count2, 10)));
        const radius2 =
          baseRadius * (0.8 + 0.2 * (count2 / Math.max(count1, count2, 10)));

        // Position circles with appropriate overlap based on whether they share items
        // Much stronger overlap when items are shared (0.5), wider separation when no shared items (1.5)
        const offsetFactor = hasIntersection ? 0.5 : 1.5;
        const offset = Math.min(radius1, radius2) * offsetFactor;

        // Responsive font sizes
        const responsiveFontSize = width < 400 ? 10 : width < 600 ? 12 : 14;

        // Draw circles with improved event handlers
        const circle1 = svg
          .append("circle")
          .attr("cx", centerX - offset)
          .attr("cy", centerY)
          .attr("r", radius1)
          .style("fill", colors[0])
          .style("fill-opacity", 0.5)
          .style("stroke", d3.rgb(colors[0]).darker())
          .style("stroke-width", 2)
          .style("cursor", showTooltips ? "pointer" : "default");

        // Add event handlers for circle1
        if (showTooltips) {
          circle1
            .on("mouseenter", function (event) {
              if (!tooltip.isLocked) {
                if (tooltipTimeoutRef.current) {
                  clearTimeout(tooltipTimeoutRef.current);
                  tooltipTimeoutRef.current = null;
                }

                const tooltipPos = { x: event.clientX, y: event.clientY };
                setTooltip({
                  show: true,
                  title: list1.name || `List ${list1.id}`,
                  entries: list1Items,
                  position: tooltipPos,
                  sourcePosition: tooltipPos,
                  isLocked: false,
                });
              }
            })
            .on("mouseleave", function () {
              if (!tooltip.isLocked) {
                tooltipTimeoutRef.current = setTimeout(() => {
                  setTooltip((prev) => ({ ...prev, show: false }));
                }, 500); // Longer timeout for better usability
              }
            });
        }

        const circle2 = svg
          .append("circle")
          .attr("cx", centerX + offset)
          .attr("cy", centerY)
          .attr("r", radius2)
          .style("fill", colors[1])
          .style("fill-opacity", 0.5)
          .style("stroke", d3.rgb(colors[1]).darker())
          .style("stroke-width", 2)
          .style("cursor", showTooltips ? "pointer" : "default");

        // Add event handlers for circle2
        if (showTooltips) {
          circle2
            .on("mouseenter", function (event) {
              if (!tooltip.isLocked) {
                if (tooltipTimeoutRef.current) {
                  clearTimeout(tooltipTimeoutRef.current);
                  tooltipTimeoutRef.current = null;
                }

                const tooltipPos = { x: event.clientX, y: event.clientY };
                setTooltip({
                  show: true,
                  title: list2.name || `List ${list2.id}`,
                  entries: list2Items,
                  position: tooltipPos,
                  sourcePosition: tooltipPos,
                  isLocked: false,
                });
              }
            })
            .on("mouseleave", function () {
              if (!tooltip.isLocked) {
                tooltipTimeoutRef.current = setTimeout(() => {
                  setTooltip((prev) => ({ ...prev, show: false }));
                }, 500);
              }
            });
        }

        // Create the intersection area as a path
        if (hasIntersection) {
          // Calculate intersection lens (the shape created by two overlapping circles)
          // First, calculate the distance between circle centers
          const distance = offset * 2;

          // Calculate lens points where the circles intersect
          // This is based on the circle-circle intersection formula
          const a =
            (radius1 * radius1 - radius2 * radius2 + distance * distance) /
            (2 * distance);
          const h = Math.sqrt(radius1 * radius1 - a * a);

          // Calculate the two intersection points
          const intersectionPoint1 = {
            x:
              centerX -
              offset +
              (a * (centerX + offset - (centerX - offset))) / distance,
            y: centerY + h,
          };

          const intersectionPoint2 = {
            x:
              centerX -
              offset +
              (a * (centerX + offset - (centerX - offset))) / distance,
            y: centerY - h,
          };

          // Create a proper intersection shape using SVG path
          // We'll draw the intersection lens shape using two arcs
          const intersectionPath = [
            "M",
            intersectionPoint1.x,
            intersectionPoint1.y,
            "A",
            radius1,
            radius1,
            0,
            0,
            1,
            intersectionPoint2.x,
            intersectionPoint2.y,
            "A",
            radius2,
            radius2,
            0,
            0,
            1,
            intersectionPoint1.x,
            intersectionPoint1.y,
            "Z",
          ].join(" ");

          // Create the intersection area as a path
          const intersectionArea = svg
            .append("path")
            .attr("d", intersectionPath)
            .style("fill", "rgba(128, 0, 128, 0.6)") // More vivid purple for better visibility
            .style("stroke", "rgba(128, 0, 128, 0.8)") // Add stroke for better definition
            .style("stroke-width", 1)
            .style("cursor", showTooltips ? "pointer" : "default")
            .style("pointer-events", "all") // Important for event capturing
            .attr("class", "intersection-area");

          // Add event handlers for the intersection
          if (showTooltips) {
            intersectionArea
              .on("mouseenter", function (event) {
                if (!tooltip.isLocked) {
                  if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                    tooltipTimeoutRef.current = null;
                  }

                  const tooltipPos = { x: event.clientX, y: event.clientY };
                  setTooltip({
                    show: true,
                    title: `${list1.name || `List ${list1.id}`} ∩ ${
                      list2.name || `List ${list2.id}`
                    }`,
                    entries: intersectionItems,
                    position: tooltipPos,
                    sourcePosition: tooltipPos,
                    isLocked: false,
                  });
                }
              })
              .on("mouseleave", function () {
                if (!tooltip.isLocked) {
                  tooltipTimeoutRef.current = setTimeout(() => {
                    setTooltip((prev) => ({ ...prev, show: false }));
                  }, 500);
                }
              });
          }
        }

        // Add labels
        svg
          .append("text")
          .attr("x", centerX - offset * 1.5)
          .attr("y", centerY - radius1 * 0.7)
          .attr("text-anchor", "middle")
          .style("font-size", `${responsiveFontSize}px`)
          .style("font-weight", "bold")
          .style("fill", theme.palette.text.primary)
          .text(() => {
            const name = list1.name || `List ${list1.id}`;
            return width < 400
              ? (name.length > 10 ? name.substring(0, 8) + "..." : name) +
                  ` (${count1})`
              : `${name} (${count1})`;
          });

        svg
          .append("text")
          .attr("x", centerX + offset * 1.5)
          .attr("y", centerY - radius2 * 0.7)
          .attr("text-anchor", "middle")
          .style("font-size", `${responsiveFontSize}px`)
          .style("font-weight", "bold")
          .style("fill", theme.palette.text.primary)
          .text(() => {
            const name = list2.name || `List ${list2.id}`;
            return width < 400
              ? (name.length > 10 ? name.substring(0, 8) + "..." : name) +
                  ` (${count2})`
              : `${name} (${count2})`;
          });

        svg
          .append("text")
          .attr("x", centerX)
          .attr("y", centerY)
          .attr("text-anchor", "middle")
          .style("font-size", `${responsiveFontSize}px`)
          .style("font-weight", "bold")
          .style("fill", theme.palette.mode === "dark" ? "#fff" : "#000")
          .text(`Common (${commonCount})`);

        // Add background for better text visibility
        svg.selectAll("text").each(function () {
          const text = d3.select(this);
          const bbox = this.getBBox();

          svg
            .insert("rect", "text")
            .attr("x", bbox.x - 5)
            .attr("y", bbox.y - 2)
            .attr("width", bbox.width + 10)
            .attr("height", bbox.height + 4)
            .attr("rx", 2)
            .attr("ry", 2)
            .style("fill", theme.palette.background.paper)
            .style("fill-opacity", 0.7);

          this.parentNode.appendChild(this);
        });
      } else if (lists.length === 3) {
        // For 3 lists, create a proper 3-circle Venn diagram
        const list1 = lists[0];
        const list2 = lists[1];
        const list3 = lists[2];

        const result1 = uniqueResults.find((r) => r.listId === list1.id);
        const result2 = uniqueResults.find((r) => r.listId === list2.id);
        const result3 = uniqueResults.find((r) => r.listId === list3.id);

        const list1Items = result1 ? result1.uniqueValues : [];
        const list2Items = result2 ? result2.uniqueValues : [];
        const list3Items = result3 ? result3.uniqueValues : [];

        const count1 = list1Items.length;
        const count2 = list2Items.length;
        const count3 = list3Items.length;

        // Check for actual intersections between each pair of lists
        const intersection12 =
          findIntersectionItems([list1.id, list2.id]).length > 0;
        const intersection23 =
          findIntersectionItems([list2.id, list3.id]).length > 0;
        const intersection13 =
          findIntersectionItems([list1.id, list3.id]).length > 0;

        // Determine if any intersections exist
        const hasAnyIntersection =
          intersection12 || intersection23 || intersection13;

        // Calculate angles and positions for a proper 3-circle Venn diagram
        const angle = (2 * Math.PI) / 3;
        const radius = baseRadius * 0.8;

        // Adjust offset based on whether there are intersections
        // Make overlap more pronounced when there are intersections (0.5), wider when none (1.5)
        const offsetFactor = hasAnyIntersection ? 0.5 : 1.5;
        const offset = radius * offsetFactor;

        // Calculate positions
        const x1 = centerX;
        const y1 = centerY - offset;

        const x2 = centerX + offset * Math.sin(angle);
        const y2 = centerY + offset * Math.cos(angle);

        const x3 = centerX - offset * Math.sin(angle);
        const y3 = centerY + offset * Math.cos(angle);

        // Store circle centers and ids for intersection calculations
        const circleData = [
          {
            id: list1.id,
            name: list1.name || `List ${list1.id}`,
            x: x1,
            y: y1,
            items: list1Items,
          },
          {
            id: list2.id,
            name: list2.name || `List ${list2.id}`,
            x: x2,
            y: y2,
            items: list2Items,
          },
          {
            id: list3.id,
            name: list3.name || `List ${list3.id}`,
            x: x3,
            y: y3,
            items: list3Items,
          },
        ];

        // Create an array to store all SVG elements to manage z-index properly
        let svgElements = [];

        // Create clipping paths for each circle first
        const clipPaths = circleData.map((circle, i) => {
          const clipId = `clip-circle-${i}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          const clipPath = svg
            .append("clipPath")
            .attr("id", clipId)
            .append("circle")
            .attr("cx", circle.x)
            .attr("cy", circle.y)
            .attr("r", radius);

          return {
            id: clipId,
            circle: circle,
          };
        });

        // Calculate pairwise intersections
        const pairwiseIntersections = [
          {
            pair: [0, 1],
            clipId1: clipPaths[0].id,
            clipId2: clipPaths[1].id,
            ids: [circleData[0].id, circleData[1].id],
            names: [circleData[0].name, circleData[1].name],
          },
          {
            pair: [1, 2],
            clipId1: clipPaths[1].id,
            clipId2: clipPaths[2].id,
            ids: [circleData[1].id, circleData[2].id],
            names: [circleData[1].name, circleData[2].name],
          },
          {
            pair: [0, 2],
            clipId1: clipPaths[0].id,
            clipId2: clipPaths[2].id,
            ids: [circleData[0].id, circleData[2].id],
            names: [circleData[0].name, circleData[2].name],
          },
        ];

        // Draw the three base circles first (lowest z-index)
        circleData.forEach((circle, i) => {
          const circleEl = svg
            .append("circle")
            .attr("cx", circle.x)
            .attr("cy", circle.y)
            .attr("r", radius)
            .style("fill", colors[i])
            .style("fill-opacity", 0.5)
            .style("stroke", d3.rgb(colors[i]).darker())
            .style("stroke-width", 2)
            .style("cursor", "pointer");

          svgElements.push({
            element: circleEl,
            type: "base",
            zIndex: 1,
            data: {
              id: circle.id,
              name: circle.name,
              items: circle.items,
            },
          });

          // Add tooltip for individual circles
          if (showTooltips) {
            circleEl
              .on("mouseenter", function (event) {
                if (!tooltip.isLocked) {
                  const tooltipPos = { x: event.clientX, y: event.clientY };
                  setTooltip({
                    show: true,
                    title: circle.name,
                    entries: circle.items,
                    position: tooltipPos,
                    sourcePosition: tooltipPos,
                    isLocked: false,
                  });
                }
              })
              .on("mouseleave", function () {
                if (!tooltip.isLocked) {
                  tooltipTimeoutRef.current = setTimeout(() => {
                    setTooltip((prev) => ({ ...prev, show: false }));
                  }, 3000);
                }
              });
          }
        });

        pairwiseIntersections.forEach((intersection) => {
          const [i, j] = intersection.pair;
          const pairIntersectionItems = findIntersectionItems(intersection.ids);
          console.log(
            `Intersection between ${intersection.names[0]} and ${intersection.names[1]}:`,
            pairIntersectionItems.length
          );

          // Create a clipped area that represents the actual intersection
          // First circle clipped by second circle
          const intersectionArea = svg
            .append("circle")
            .attr("cx", circleData[j].x)
            .attr("cy", circleData[j].y)
            .attr("r", radius)
            .attr("clip-path", `url(#${intersection.clipId1})`)
            .style("fill", "rgba(128, 0, 128, 0.3)")
            .style("stroke", "none")
            .style("cursor", "pointer")
            .style("pointer-events", "all");

          svgElements.push({
            element: intersectionArea,
            type: "pairwise",
            zIndex: 2,
            data: {
              ids: intersection.ids,
              names: intersection.names,
              items: pairIntersectionItems,
            },
          });

          // Add tooltip for intersection area
          if (showTooltips) {
            intersectionArea
              .on("mouseenter", function (event) {
                if (!tooltip.isLocked) {
                  const tooltipPos = { x: event.clientX, y: event.clientY };
                  setTooltip({
                    show: true,
                    title: `${intersection.names[0]} ∩ ${intersection.names[1]}`,
                    entries: pairIntersectionItems,
                    position: tooltipPos,
                    sourcePosition: tooltipPos,
                    isLocked: false,
                  });
                }
              })
              .on("mouseleave", function () {
                if (!tooltip.isLocked) {
                  tooltipTimeoutRef.current = setTimeout(() => {
                    setTooltip((prev) => ({ ...prev, show: false }));
                  }, 500);
                }
              });
          }
        });

        // Create the three-way intersection in the center (highest z-index)
        // For the three-way intersection, we need to clip the last circle with both previous clips
        const threeWayItems = findIntersectionItems([
          list1.id,
          list2.id,
          list3.id,
        ]);

        // Create a special clip path for the three-way intersection
        const clip12Id = `clip-12-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        svg
          .append("clipPath")
          .attr("id", clip12Id)
          .append("circle")
          .attr("cx", circleData[1].x)
          .attr("cy", circleData[1].y)
          .attr("r", radius)
          .attr("clip-path", `url(#${clipPaths[0].id})`);

        // Now use this combined clip path on the third circle
        const threeWayArea = svg
          .append("circle")
          .attr("cx", circleData[2].x)
          .attr("cy", circleData[2].y)
          .attr("r", radius)
          .attr("clip-path", `url(#${clip12Id})`)
          .style("fill", "rgba(128, 0, 128, 0.5)")
          .style("stroke", "none")
          .style("cursor", "pointer")
          .style("pointer-events", "all");

        svgElements.push({
          element: threeWayArea,
          type: "threeway",
          zIndex: 3,
          data: {
            title: "Three-way Intersection",
            items: threeWayItems,
          },
        });

        if (showTooltips) {
          threeWayArea
            .on("mouseenter", function (event) {
              if (!tooltip.isLocked) {
                const tooltipPos = { x: event.clientX, y: event.clientY };
                setTooltip({
                  show: true,
                  title: "Three-way Intersection",
                  entries: threeWayItems,
                  position: tooltipPos,
                  sourcePosition: tooltipPos,
                  isLocked: false,
                });
              }
            })
            .on("mouseleave", function () {
              if (!tooltip.isLocked) {
                tooltipTimeoutRef.current = setTimeout(() => {
                  setTooltip((prev) => ({ ...prev, show: false }));
                }, 500);
              }
            });
        }

        // Now reappend all elements in correct z-index order
        svgElements.sort((a, b) => a.zIndex - b.zIndex);
        svgElements.forEach((item) => {
          const node = item.element.node();
          if (node && node.parentNode) {
            node.parentNode.appendChild(node); // Move to end (top)
          }
        });

        // Add labels for each circle
        const fontSize = width < 400 ? 10 : 12;
        svg
          .append("text")
          .attr("x", x1)
          .attr("y", y1 - radius - 10)
          .attr("text-anchor", "middle")
          .style("font-size", fontSize)
          .style("fill", theme.palette.text.primary)
          .text(`${list1.name || `List ${list1.id}`} (${count1})`);

        svg
          .append("text")
          .attr("x", x2 + 10)
          .attr("y", y2 + radius + 15)
          .attr("text-anchor", "middle")
          .style("font-size", fontSize)
          .style("fill", theme.palette.text.primary)
          .text(`${list2.name || `List ${list2.id}`} (${count2})`);

        svg
          .append("text")
          .attr("x", x3 - 10)
          .attr("y", y3 + radius + 15)
          .attr("text-anchor", "middle")
          .style("font-size", fontSize)
          .style("fill", theme.palette.text.primary)
          .text(`${list3.name || `List ${list3.id}`} (${count3})`);
      } else {
        // For more than 3 lists, create a modified overlapping circles visualization
        console.log("Rendering for", lists.length, "lists");

        // Store all circle data for intersection calculations
        const circleData = [];

        // Precompute intersections between all list pairs to determine positioning
        const intersectionMatrix = {};
        let maxIntersectionSize = 0;
        for (let i = 0; i < lists.length; i++) {
          for (let j = i + 1; j < lists.length; j++) {
            const list1 = lists[i];
            const list2 = lists[j];
            const intersectionItems = findIntersectionItems([
              list1.id,
              list2.id,
            ]);

            const key = `${list1.id}-${list2.id}`;
            intersectionMatrix[key] = intersectionItems.length;

            // Track the maximum intersection size for scaling
            maxIntersectionSize = Math.max(
              maxIntersectionSize,
              intersectionItems.length
            );
          }
        }

        // First determine the number of connections and total shared items for each list
        const connectionCounts = {};
        const sharedItemCounts = {};
        lists.forEach((list, i) => {
          connectionCounts[list.id] = 0;
          sharedItemCounts[list.id] = 0;

          lists.forEach((otherList, j) => {
            if (i !== j) {
              const key =
                i < j
                  ? `${list.id}-${otherList.id}`
                  : `${otherList.id}-${list.id}`;

              const intersectionSize = intersectionMatrix[key] || 0;

              if (intersectionSize > 0) {
                connectionCounts[list.id]++;
                sharedItemCounts[list.id] += intersectionSize;
              }
            }
          });
        });

        // Position lists in a circular layout with appropriate spacing
        // Calculate the ideal angle between lists that share items
        const totalLists = lists.length;
        const baseAngleStep = (2 * Math.PI) / totalLists;

        // Create a connection strength matrix to determine how close circles should be
        const angleMatrix = {};
        for (let i = 0; i < lists.length; i++) {
          for (let j = 0; j < lists.length; j++) {
            if (i !== j) {
              const list1 = lists[i];
              const list2 = lists[j];
              const key =
                i < j ? `${list1.id}-${list2.id}` : `${list2.id}-${list1.id}`;

              // Connection strength based on number of shared items
              const sharedItems = intersectionMatrix[key] || 0;
              angleMatrix[`${list1.id}-${list2.id}`] =
                sharedItems > 0 ? sharedItems / maxIntersectionSize : 0;
            }
          }
        }

        lists.forEach((list, i) => {
          const result = uniqueResults.find((r) => r.listId === list.id);
          const listItems = result ? result.uniqueValues : [];
          const connectionCount = connectionCounts[list.id] || 0;
          const sharedItemCount = sharedItemCounts[list.id] || 0;

          // Calculate angle - standard equidistant positioning
          const angle = (2 * Math.PI * i) / totalLists;

          // Calculate distance from center - stronger pull to center for lists with connections
          const maxConnections = Math.max(
            ...Object.values(connectionCounts),
            1
          );
          const connectionRatio = connectionCount / maxConnections;

          // Significantly reduce distance for lists with shared items - brings them closer to center
          // Use a more aggressive multiplier to ensure overlap
          const distanceMultiplier = 1.0 - connectionRatio * 0.8; // Increased from 0.6 to 0.8
          const distance = baseRadius * distanceMultiplier;

          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;

          // Make circle size proportional to item count but also increase for lists with shared items
          const itemCount = listItems.length;
          const maxItems = Math.max(
            ...lists.map(
              (l) =>
                uniqueResults.find((r) => r.listId === l.id)?.uniqueValues
                  .length || 0
            ),
            1 // Avoid division by zero
          );

          // Increase size factor for lists with more shared items
          const listSizeRatio = itemCount / maxItems;
          // Increase size multiplier based on shared connections to create more overlap
          const sharedItemRatio =
            maxIntersectionSize > 0
              ? sharedItemCount / (maxIntersectionSize * 2)
              : 0;

          // Ensure minimum size is bigger to create more overlap opportunity
          // Make all circles a bit bigger overall to encourage overlap
          const sizeMultiplier =
            0.8 + 0.3 * listSizeRatio + 0.4 * Math.min(1, connectionRatio * 3); // Increased size factors
          const radius = baseRadius * sizeMultiplier;

          // Store circle data
          circleData.push({
            id: list.id,
            name: list.name || `List ${list.id}`,
            x: x,
            y: y,
            angle: angle,
            items: listItems,
            radius: radius,
            connections: connectionCount,
            sharedItems: sharedItemCount,
          });
        });

        // Draw circles first (lower z-index)
        circleData.forEach((circle, i) => {
          svg
            .append("circle")
            .attr("cx", circle.x)
            .attr("cy", circle.y)
            .attr("r", circle.radius)
            .style("fill", colors[i % colors.length])
            .style("fill-opacity", 0.5)
            .style("stroke", d3.rgb(colors[i % colors.length]).darker())
            .style("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseenter", function (event) {
              if (!tooltip.isLocked && showTooltips) {
                const tooltipPos = { x: event.clientX, y: event.clientY };
                setTooltip({
                  show: true,
                  title: circle.name,
                  entries: circle.items,
                  position: tooltipPos,
                  sourcePosition: tooltipPos,
                  isLocked: false,
                });
              }
            })
            .on("mouseleave", function () {
              if (!tooltip.isLocked && showTooltips) {
                tooltipTimeoutRef.current = setTimeout(() => {
                  setTooltip((prev) => ({ ...prev, show: false }));
                }, 500);
              }
            });
        });

        // Create clipping paths for all circles
        const clipPaths = circleData.map((circle, i) => {
          const clipId = `clip-circle-${i}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          const clipPath = svg
            .append("clipPath")
            .attr("id", clipId)
            .append("circle")
            .attr("cx", circle.x)
            .attr("cy", circle.y)
            .attr("r", circle.radius);

          return {
            id: clipId,
            circle: circle,
          };
        });

        // Create intersections between circles (higher z-index)
        if (showTooltips) {
          // Process all possible pairs of lists
          for (let i = 0; i < circleData.length; i++) {
            for (let j = i + 1; j < circleData.length; j++) {
              const circle1 = circleData[i];
              const circle2 = circleData[j];

              // Find the intersection items for this pair
              const pairIntersectionItems = findIntersectionItems([
                circle1.id,
                circle2.id,
              ]);

              // Only create intersection if there are items
              if (pairIntersectionItems.length > 0) {
                // Calculate distance between circles
                const dx = circle2.x - circle1.x;
                const dy = circle2.y - circle1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Circles physically overlap if the distance is less than the sum of their radii
                // Use a fully relaxed condition for overlap to ensure visual overlap
                const circlesOverlap =
                  distance < circle1.radius + circle2.radius;

                if (circlesOverlap) {
                  // Create the actual geometric intersection area using clipping
                  const intersectionArea = svg
                    .append("circle")
                    .attr("cx", circle2.x)
                    .attr("cy", circle2.y)
                    .attr("r", circle2.radius)
                    .attr("clip-path", `url(#${clipPaths[i].id})`)
                    .style("fill", "rgba(128, 0, 128, 0.6)") // More vivid purple
                    .style("stroke", "rgba(128, 0, 128, 0.4)")
                    .style("stroke-width", 1.5)
                    .style("cursor", "pointer")
                    .style("pointer-events", "all")
                    .on("mouseenter", function (event) {
                      if (!tooltip.isLocked) {
                        const tooltipPos = {
                          x: event.clientX,
                          y: event.clientY,
                        };
                        setTooltip({
                          show: true,
                          title: `${circle1.name} ∩ ${circle2.name}`,
                          entries: pairIntersectionItems,
                          position: tooltipPos,
                          sourcePosition: tooltipPos,
                          isLocked: false,
                        });
                      }
                    })
                    .on("mouseleave", function () {
                      if (!tooltip.isLocked) {
                        tooltipTimeoutRef.current = setTimeout(() => {
                          setTooltip((prev) => ({ ...prev, show: false }));
                        }, 500);
                      }
                    });
                } else {
                  // For non-overlapping circles with common items, use a weaker connection line
                  // This keeps the diagram cleaner while still showing relationships
                  svg
                    .append("line")
                    .attr("x1", circle1.x)
                    .attr("y1", circle1.y)
                    .attr("x2", circle2.x)
                    .attr("y2", circle2.y)
                    .style("stroke", "rgba(128, 0, 128, 0.15)")
                    .style(
                      "stroke-width",
                      Math.max(1, Math.min(3, pairIntersectionItems.length / 5))
                    )
                    .style("stroke-dasharray", "3,3")
                    .attr("pointer-events", "none");

                  // Create a small interaction area in the middle of the line for tooltip
                  const midX = (circle1.x + circle2.x) / 2;
                  const midY = (circle1.y + circle2.y) / 2;

                  svg
                    .append("circle")
                    .attr("cx", midX)
                    .attr("cy", midY)
                    .attr("r", 8)
                    .style("fill", "rgba(128, 0, 128, 0.2)")
                    .style("stroke", "none")
                    .style("cursor", "pointer")
                    .style("pointer-events", "all")
                    .on("mouseenter", function (event) {
                      if (!tooltip.isLocked) {
                        const tooltipPos = {
                          x: event.clientX,
                          y: event.clientY,
                        };
                        setTooltip({
                          show: true,
                          title: `${circle1.name} ∩ ${circle2.name}`,
                          entries: pairIntersectionItems,
                          position: tooltipPos,
                          sourcePosition: tooltipPos,
                          isLocked: false,
                        });
                      }
                    })
                    .on("mouseleave", function () {
                      if (!tooltip.isLocked) {
                        tooltipTimeoutRef.current = setTimeout(() => {
                          setTooltip((prev) => ({ ...prev, show: false }));
                        }, 500);
                      }
                    });
                }
              }
            }
          }
        }

        // Draw labels for each list
        circleData.forEach((circle) => {
          // Create label near the circle
          const labelOffset = circle.radius * 0.7;
          const labelX = circle.x + Math.cos(circle.angle) * labelOffset;
          const labelY = circle.y + Math.sin(circle.angle) * labelOffset;

          svg
            .append("text")
            .attr("x", labelX)
            .attr("y", labelY)
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .style("font-size", 11)
            .style("font-weight", "bold")
            .style("fill", theme.palette.text.primary)
            .text(
              circle.items.length > 0
                ? `${circle.name} (${circle.items.length})`
                : circle.name
            );

          // Add count in center of circle
          svg
            .append("text")
            .attr("x", circle.x)
            .attr("y", circle.y)
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .style("font-size", 10)
            .style("font-weight", "bold")
            .style("fill", isDarkMode ? "#fff" : "#000")
            .text(circle.items.length);
        });

        // Create a "common to all" indicator if needed
        const commonToAllItems = commonItems.length > 0 ? commonItems : [];
        if (commonToAllItems.length > 0) {
          // Find an optimal position for the common indicator
          // This would ideally be in the center of all intersecting circles,
          // but for simplicity we'll put it in the center
          svg
            .append("text")
            .attr("x", centerX)
            .attr("y", centerY)
            .attr("text-anchor", "middle")
            .style("font-size", 11)
            .style("font-weight", "bold")
            .style("fill", theme.palette.text.primary)
            .text(`Common to all: ${commonToAllItems.length}`);

          // Add interaction area for common items
          svg
            .append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", 15)
            .style("fill", "transparent")
            .style("stroke", "rgba(128, 0, 128, 0.3)")
            .style("stroke-width", 2)
            .style("cursor", "pointer")
            .style("pointer-events", "all")
            .on("mouseenter", function (event) {
              if (!tooltip.isLocked && showTooltips) {
                const tooltipPos = { x: event.clientX, y: event.clientY };
                setTooltip({
                  show: true,
                  title: "Common to All Lists",
                  entries: commonToAllItems,
                  position: tooltipPos,
                  sourcePosition: tooltipPos,
                  isLocked: false,
                });
              }
            })
            .on("mouseleave", function () {
              if (!tooltip.isLocked && showTooltips) {
                tooltipTimeoutRef.current = setTimeout(() => {
                  setTooltip((prev) => ({ ...prev, show: false }));
                }, 500);
              }
            });
        }
      }
    } catch (error) {
      console.error("Error creating Venn diagram:", error);
      d3.select(vennRef.current)
        .append("div")
        .attr("class", "venn-error")
        .style("color", "red")
        .style("text-align", "center")
        .style("padding", "20px")
        .text(`Couldn't render diagram: ${error.message}`);
    }
  }, [
    lists,
    results,
    theme,
    dimensions,
    showTooltips,
    tooltip.isLocked,
    findIntersectionItems,
  ]);

  // Toggle tooltip lock state
  const toggleTooltipLock = () => {
    setTooltip((prev) => ({
      ...prev,
      isLocked: !prev.isLocked,
    }));
  };

  // Handle document click to close locked tooltip when clicked outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (tooltip.show && tooltip.isLocked) {
        // Check if click is inside tooltip or venn diagram
        const tooltipElement = document.querySelector(".venn-tooltip");
        const vennElement = vennRef.current;

        let isInsideTooltip = false;
        let isInsideVenn = false;

        if (tooltipElement && tooltipElement.contains(e.target)) {
          isInsideTooltip = true;
        }

        if (vennElement && vennElement.contains(e.target)) {
          isInsideVenn = true;
        }

        // If click is outside both tooltip and venn, unlock and hide tooltip
        if (!isInsideTooltip && !isInsideVenn) {
          setTooltip((prev) => ({
            ...prev,
            show: false,
            isLocked: false,
          }));
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [tooltip.show, tooltip.isLocked]);

  return (
    <Box
      sx={{
        mt: 4,
        p: { xs: 1, sm: 2 },
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        width: "100%",
        position: "relative",
      }}
      ref={containerRef}
    >
      <Typography variant="h6" gutterBottom>
        Venn Diagram Visualization
      </Typography>
      <Box
        ref={vennRef}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: { xs: 300, sm: 400 },
          width: "100%",
          overflow: "hidden",
        }}
      >
        {lists.length < 2 && (
          <Typography variant="body1" color="text.secondary">
            At least two lists are required for a Venn diagram visualization
          </Typography>
        )}
      </Box>

      {/* Create a visual connection between the source and tooltip */}
      {showTooltips && tooltip.show && tooltip.sourcePosition && (
        <TooltipBridge from={tooltip.sourcePosition} to={tooltip.position} />
      )}

      {/* Show tooltip when active */}
      {showTooltips && tooltip.show && (
        <VennTooltip
          title={tooltip.title}
          entries={tooltip.entries}
          position={tooltip.position}
          isLocked={tooltip.isLocked}
          onLock={toggleTooltipLock}
          className="venn-tooltip"
        />
      )}
    </Box>
  );
};

export default VennDiagram;
