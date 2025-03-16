import React, { useEffect, useRef, useState } from "react";
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

// Custom tooltip component for showing entries with scrolling support
const VennTooltip = ({ title, entries, position }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const maxEntriesToShow = 100; // Show more since we have scrolling
  const hasMoreEntries = entries.length > maxEntriesToShow;
  const displayEntries = entries.slice(0, maxEntriesToShow);

  return (
    <Fade in={true}>
      <Paper
        elevation={4}
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
          pointerEvents: "auto", // Enable mouse events for scrolling
          zIndex: 10000,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
          {title} ({entries.length})
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

const VennDiagram = ({ lists, results, showTooltips = true }) => {
  const vennRef = useRef(null);
  const containerRef = useRef(null);
  const theme = useTheme();
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const [tooltip, setTooltip] = useState({
    show: false,
    title: "",
    entries: [],
    position: { x: 0, y: 0 },
  });
  const [tooltipLocked, setTooltipLocked] = useState(false);

  // Debug the tooltip state
  useEffect(() => {
    console.log("Tooltip state updated:", tooltip);
  }, [tooltip]);

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

  // Direct DOM event handlers for mouse movement
  useEffect(() => {
    // Only add mouse move handler if tooltips are enabled
    if (!showTooltips) return;

    const handleMouseMove = (event) => {
      // Only update position if tooltip is already showing and not locked
      if (tooltip.show && !tooltipLocked) {
        setTooltip((prev) => ({
          ...prev,
          position: { x: event.clientX, y: event.clientY },
        }));
      }
    };

    // Add document-level event listener
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [tooltip.show, tooltipLocked, showTooltips]);

  useEffect(() => {
    if (!lists || lists.length < 2 || !results || !vennRef.current) return;

    // Clear previous content
    d3.select(vennRef.current).selectAll("*").remove();

    try {
      // Get the unique values for each list and common values
      const uniqueResults = results.filter((r) => r.listId !== "common");
      const commonResult = results.find((r) => r.listId === "common");
      const commonItems = commonResult ? commonResult.uniqueValues : []; // Define commonItems here

      // Set up dimensions
      const width = dimensions.width;
      const height = dimensions.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Calculate radius based on container size
      const baseRadius = Math.min(width, height) * 0.2;

      // Create SVG
      const svg = d3
        .select(vennRef.current)
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

      // Colors for the circles
      const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

      // Draw the Venn diagram
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

        // Normalize circle sizes based on item counts
        const radius1 =
          baseRadius * (0.8 + 0.2 * (count1 / Math.max(count1, count2, 10)));
        const radius2 =
          baseRadius * (0.8 + 0.2 * (count2 / Math.max(count1, count2, 10)));

        // Position circles with some overlap - make sure they fit on small screens
        const offset = Math.min(radius1, radius2) * (width < 400 ? 0.6 : 0.8);

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

        // Only add event handlers if tooltips are enabled
        if (showTooltips) {
          circle1
            .on("mouseenter", function (event) {
              // Show tooltip for list 1
              setTooltip({
                show: true,
                title: list1.name || `List ${list1.id}`,
                entries: list1Items,
                position: { x: event.clientX, y: event.clientY },
              });
              console.log("Circle 1 mouseenter event triggered");
            })
            .on("mouseleave", function () {
              setTooltip((prev) => ({ ...prev, show: false }));
              console.log("Circle 1 mouseleave event triggered");
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

        // Only add event handlers if tooltips are enabled
        if (showTooltips) {
          circle2
            .on("mouseenter", function (event) {
              // Show tooltip for list 2
              setTooltip({
                show: true,
                title: list2.name || `List ${list2.id}`,
                entries: list2Items,
                position: { x: event.clientX, y: event.clientY },
              });
              console.log("Circle 2 mouseenter event triggered");
            })
            .on("mouseleave", function () {
              setTooltip((prev) => ({ ...prev, show: false }));
              console.log("Circle 2 mouseleave event triggered");
            });
        }

        // Create a group for the intersection with improved event handling
        // First create a clip path for the intersection
        const intersectionId =
          "intersection-mask-" + Math.random().toString(36).substr(2, 9);

        svg
          .append("clipPath")
          .attr("id", intersectionId)
          .append("circle")
          .attr("cx", centerX - offset)
          .attr("cy", centerY)
          .attr("r", radius1);

        // Create an invisible element covering the intersection area
        const intersectionCircle = svg
          .append("circle")
          .attr("cx", centerX + offset)
          .attr("cy", centerY)
          .attr("r", radius2)
          .attr("clip-path", `url(#${intersectionId})`)
          .style("fill", "rgba(255, 0, 0, 0.01)") // Very slight red tint for debugging
          .style("cursor", showTooltips ? "pointer" : "default")
          .style("pointer-events", "all"); // Important for hover events

        // Only add event handlers if tooltips are enabled
        if (showTooltips) {
          intersectionCircle
            .on("mouseenter", function (event) {
              // Show tooltip for common items
              setTooltip({
                show: true,
                title: "Common Items",
                entries: commonItems,
                position: { x: event.clientX, y: event.clientY },
              });
              console.log("Intersection mouseenter event triggered");
            })
            .on("mouseleave", function () {
              setTooltip((prev) => ({ ...prev, show: false }));
              console.log("Intersection mouseleave event triggered");
            });
        }

        // Add labels for the sets
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
            // Truncate long names on small screens
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
            // Truncate long names on small screens
            return width < 400
              ? (name.length > 10 ? name.substring(0, 8) + "..." : name) +
                  ` (${count2})`
              : `${name} (${count2})`;
          });

        // Add label for the intersection
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

          // Move text to front
          this.parentNode.appendChild(this);
        });
      } else if (lists.length === 3) {
        // For 3 lists, create a responsive 3-circle Venn diagram
        const list1 = lists[0];
        const list2 = lists[1];
        const list3 = lists[2];

        const result1 = uniqueResults.find((r) => r.listId === list1.id);
        const result2 = uniqueResults.find((r) => r.listId === list2.id);
        const result3 = uniqueResults.find((r) => r.listId === list3.id);

        const list1Items = result1 ? result1.uniqueValues : [];
        const list2Items = result2 ? result2.uniqueValues : [];
        const list3Items = result3 ? result3.uniqueValues : [];

        // Responsive font sizes
        const responsiveFontSize = width < 400 ? 9 : width < 600 ? 11 : 14;

        // ...existing code for 3 circle layout...

        // Create circles array here with proper event handlers
        const circles = [];

        // Add circles with event handlers (simplified for brevity)
        circles.push(
          svg
            .append("circle")
            .on("mouseover", function (event) {
              setTooltip({
                show: true,
                title: list1.name || `List ${list1.id}`,
                entries: list1Items,
                position: { x: event.pageX, y: event.pageY },
              });
            })
            .on("mouseout", function () {
              setTooltip({
                show: false,
                title: "",
                entries: [],
                position: { x: 0, y: 0 },
              });
            })
        );

        circles.push(
          svg
            .append("circle")
            .on("mouseover", function (event) {
              setTooltip({
                show: true,
                title: list2.name || `List ${list2.id}`,
                entries: list2Items,
                position: { x: event.pageX, y: event.pageY },
              });
            })
            .on("mouseout", function () {
              setTooltip({
                show: false,
                title: "",
                entries: [],
                position: { x: 0, y: 0 },
              });
            })
        );

        circles.push(
          svg
            .append("circle")
            .on("mouseover", function (event) {
              setTooltip({
                show: true,
                title: list3.name || `List ${list3.id}`,
                entries: list3Items,
                position: { x: event.pageX, y: event.pageY },
              });
            })
            .on("mouseout", function () {
              setTooltip({
                show: false,
                title: "",
                entries: [],
                position: { x: 0, y: 0 },
              });
            })
        );

        // ...rest of 3 circle layout code...
      } else {
        // For more than 3 lists, create a simplified representation
        // Draw a center circle with surrounding circles - scale elements for small screens
        const centerRadius = width < 400 ? baseRadius * 0.4 : baseRadius * 0.6;

        // Draw center circle for common items
        svg
          .append("circle")
          .attr("cx", centerX)
          .attr("cy", centerY)
          .attr("r", centerRadius)
          .style("fill", "#9c9c9c")
          .style("fill-opacity", 0.5)
          .style("stroke", d3.rgb("#9c9c9c").darker())
          .style("stroke-width", 2)
          .on("mouseover", function (event) {
            setTooltip({
              show: true,
              title: "Common Items",
              entries: commonItems,
              position: { x: event.pageX, y: event.pageY },
            });
          })
          .on("mouseout", function () {
            setTooltip({
              show: false,
              title: "",
              entries: [],
              position: { x: 0, y: 0 },
            });
          });

        // Responsive font sizes for multi-circle layout
        const multiCircleFontSize = width < 400 ? 10 : width < 600 ? 12 : 14;
        const smallFontSize = width < 400 ? 8 : width < 600 ? 10 : 12;

        // ... existing center circle text ...

        // Draw surrounding circles for each list
        lists.forEach((list, i) => {
          const result = uniqueResults.find((r) => r.listId === list.id);
          const listItems = result ? result.uniqueValues : [];

          const angle = (2 * Math.PI * i) / lists.length;
          const x =
            centerX +
            Math.cos(angle) *
              (width < 400 ? baseRadius * 1.0 : baseRadius * 1.2);
          const y =
            centerY +
            Math.sin(angle) *
              (width < 400 ? baseRadius * 1.0 : baseRadius * 1.2);
          const radius = width < 400 ? baseRadius * 0.3 : baseRadius * 0.4;

          // Draw the circle with tooltip
          svg
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius)
            .style("fill", colors[i % colors.length])
            .style("fill-opacity", 0.6)
            .style("stroke", d3.rgb(colors[i % colors.length]).darker())
            .style("stroke-width", 2)
            .on("mouseover", function (event) {
              setTooltip({
                show: true,
                title: list.name || `List ${list.id}`,
                entries: listItems,
                position: { x: event.pageX, y: event.pageY },
              });
            })
            .on("mouseout", function () {
              setTooltip({
                show: false,
                title: "",
                entries: [],
                position: { x: 0, y: 0 },
              });
            });

          // ...rest of circle drawing code...
        });
      }

      // ...rest of existing code...
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
  }, [lists, results, theme, dimensions, showTooltips]);

  // Add event listeners to document to manage tooltip lifecycle
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // If clicking outside tooltip and tooltip is showing
      if (tooltip.show) {
        // Check if click is inside tooltip
        const tooltipElements = document.querySelectorAll(".venn-tooltip");
        let isInsideTooltip = false;

        tooltipElements.forEach((tooltip) => {
          if (tooltip.contains(e.target)) {
            isInsideTooltip = true;
          }
        });

        if (isInsideTooltip) {
          // Lock tooltip if clicked inside it
          setTooltipLocked(true);
        } else if (tooltipLocked) {
          // Close tooltip if locked and clicked outside
          setTooltipLocked(false);
          setTooltip((prev) => ({ ...prev, show: false }));
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [tooltip.show, tooltipLocked]);

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

      {/* Show tooltip when active - debugging visibility */}
      {showTooltips && tooltip.show && (
        <>
          {/* Debugging indicator */}
          <Box
            sx={{
              position: "fixed",
              left: tooltip.position.x - 5,
              top: tooltip.position.y - 5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "red",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          />

          <VennTooltip
            title={tooltip.title}
            entries={tooltip.entries}
            position={tooltip.position}
            className="venn-tooltip" // Add class for click detection
          />
        </>
      )}
    </Box>
  );
};

export default VennDiagram;
