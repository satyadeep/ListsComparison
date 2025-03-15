import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import * as d3 from "d3";

const VennDiagram = ({ lists, results }) => {
  const vennRef = useRef(null);
  const containerRef = useRef(null);
  const theme = useTheme();
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });

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

  useEffect(() => {
    if (!lists || lists.length < 2 || !results || !vennRef.current) return;

    // Clear previous content
    d3.select(vennRef.current).selectAll("*").remove();

    try {
      // Get the unique values for each list and common values
      const uniqueResults = results.filter((r) => r.listId !== "common");
      const commonResult = results.find((r) => r.listId === "common");

      // Set up dimensions
      const width = dimensions.width;
      const height = dimensions.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Scale radius based on container size
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

        // Normalize circle sizes based on item counts
        const radius1 =
          baseRadius * (0.8 + 0.2 * (count1 / Math.max(count1, count2, 10)));
        const radius2 =
          baseRadius * (0.8 + 0.2 * (count2 / Math.max(count1, count2, 10)));

        // Position circles with some overlap - make sure they fit on small screens
        const offset = Math.min(radius1, radius2) * (width < 400 ? 0.6 : 0.8);

        // Draw circles
        const circle1 = svg
          .append("circle")
          .attr("cx", centerX - offset)
          .attr("cy", centerY)
          .attr("r", radius1)
          .style("fill", colors[0])
          .style("fill-opacity", 0.5)
          .style("stroke", d3.rgb(colors[0]).darker())
          .style("stroke-width", 2);

        const circle2 = svg
          .append("circle")
          .attr("cx", centerX + offset)
          .attr("cy", centerY)
          .attr("r", radius2)
          .style("fill", colors[1])
          .style("fill-opacity", 0.5)
          .style("stroke", d3.rgb(colors[1]).darker())
          .style("stroke-width", 2);

        // Responsive font sizes
        const fontSize = width < 400 ? 10 : width < 600 ? 12 : 14;

        // Add labels for the sets
        svg
          .append("text")
          .attr("x", centerX - offset * 1.5)
          .attr("y", centerY - radius1 * 0.7)
          .attr("text-anchor", "middle")
          .style("font-size", `${fontSize}px`)
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
          .style("font-size", `${fontSize}px`)
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
          .style("font-size", `${fontSize}px`)
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

        const count1 = result1 ? result1.uniqueValues.length : 0;
        const count2 = result2 ? result2.uniqueValues.length : 0;
        const count3 = result3 ? result3.uniqueValues.length : 0;
        const commonCount = commonResult ? commonResult.uniqueValues.length : 0;

        // Adjust radius based on screen size
        const radius = width < 400 ? baseRadius * 0.7 : baseRadius * 0.9;

        // Calculate positions for a triangle arrangement - more compact for small screens
        const distanceFromCenter = width < 400 ? radius * 0.6 : radius * 0.7;

        const positions = [
          { x: centerX, y: centerY - distanceFromCenter }, // top
          {
            x: centerX - distanceFromCenter * Math.cos(Math.PI / 6),
            y: centerY + distanceFromCenter * Math.sin(Math.PI / 6),
          }, // bottom left
          {
            x: centerX + distanceFromCenter * Math.cos(Math.PI / 6),
            y: centerY + distanceFromCenter * Math.sin(Math.PI / 6),
          }, // bottom right
        ];

        // Draw circles
        const circles = lists.map((list, i) => {
          const pos = positions[i];
          return svg
            .append("circle")
            .attr("cx", pos.x)
            .attr("cy", pos.y)
            .attr("r", radius)
            .style("fill", colors[i])
            .style("fill-opacity", 0.5)
            .style("stroke", d3.rgb(colors[i]).darker())
            .style("stroke-width", 2);
        });

        // Responsive font sizes
        const fontSize = width < 400 ? 9 : width < 600 ? 11 : 14;

        // Calculate optimal label positions for each list based on screen size
        const labelOffsets =
          width < 400
            ? [
                { x: 0, y: -radius * 1.2 }, // top label
                { x: -radius * 1.2, y: radius * 0.8 }, // bottom left
                { x: radius * 1.2, y: radius * 0.8 }, // bottom right
              ]
            : [
                { x: 0, y: -radius * 1.1 }, // top label
                { x: -radius, y: radius * 0.7 }, // bottom left
                { x: radius, y: radius * 0.7 }, // bottom right
              ];

        // Add labels for each circle
        lists.forEach((list, i) => {
          const pos = positions[i];
          const offset = labelOffsets[i];
          const result = uniqueResults.find((r) => r.listId === list.id);
          const count = result ? result.uniqueValues.length : 0;

          svg
            .append("text")
            .attr("x", pos.x + offset.x)
            .attr("y", pos.y + offset.y)
            .attr("text-anchor", "middle")
            .style("font-size", `${fontSize}px`)
            .style("font-weight", "bold")
            .style("fill", theme.palette.text.primary)
            .text(() => {
              const name = list.name || `List ${list.id}`;
              // Truncate long names on small screens
              return width < 400
                ? (name.length > 8 ? name.substring(0, 6) + "..." : name) +
                    ` (${count})`
                : `${name} (${count})`;
            });
        });

        // Add label for the center intersection
        svg
          .append("text")
          .attr("x", centerX)
          .attr("y", centerY)
          .attr("text-anchor", "middle")
          .style("font-size", `${fontSize}px`)
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
          .style("stroke-width", 2);

        // Responsive font size
        const fontSize = width < 400 ? 10 : width < 600 ? 12 : 14;
        const smallFontSize = width < 400 ? 8 : width < 600 ? 10 : 12;

        svg
          .append("text")
          .attr("x", centerX)
          .attr("y", centerY)
          .attr("text-anchor", "middle")
          .style("font-size", `${fontSize}px`)
          .style("font-weight", "bold")
          .style("fill", theme.palette.mode === "dark" ? "#fff" : "#000")
          .text(
            `Common (${commonResult ? commonResult.uniqueValues.length : 0})`
          );

        // Draw surrounding circles for each list - adapt for small screens
        const listCount = lists.length;
        const radius = width < 400 ? baseRadius * 0.3 : baseRadius * 0.4;
        const distanceFromCenter =
          width < 400
            ? baseRadius * 1.0 + (listCount > 4 ? radius * 0.5 : 0)
            : baseRadius * 1.2 + (listCount > 4 ? radius * 0.5 : 0);

        lists.forEach((list, i) => {
          const angle = (2 * Math.PI * i) / listCount;
          const x = centerX + Math.cos(angle) * distanceFromCenter;
          const y = centerY + Math.sin(angle) * distanceFromCenter;

          const result = uniqueResults.find((r) => r.listId === list.id);
          const count = result ? result.uniqueValues.length : 0;

          svg
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius)
            .style("fill", colors[i % colors.length])
            .style("fill-opacity", 0.6)
            .style("stroke", d3.rgb(colors[i % colors.length]).darker())
            .style("stroke-width", 2);

          // Draw connection line to center
          svg
            .append("line")
            .attr("x1", centerX)
            .attr("y1", centerY)
            .attr("x2", x)
            .attr("y2", y)
            .style("stroke", "#aaa")
            .style("stroke-width", 1.5)
            .style("stroke-dasharray", "5,5")
            .style("stroke-opacity", 0.6);

          // Add label
          svg
            .append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", "middle")
            .style("font-size", `${smallFontSize}px`)
            .style("font-weight", "bold")
            .style("fill", theme.palette.mode === "dark" ? "#fff" : "#000")
            .text(() => {
              const name = list.name || `List ${list.id}`;
              // Truncate long names on small screens
              return width < 400
                ? name.length > 6
                  ? name.substring(0, 4) + "..."
                  : name
                : name.length > 12
                ? name.substring(0, 10) + "..."
                : name;
            });

          // Add count below name
          svg
            .append("text")
            .attr("x", x)
            .attr("y", y + (width < 400 ? 12 : 16))
            .attr("text-anchor", "middle")
            .style("font-size", `${smallFontSize - 1}px`)
            .style("fill", theme.palette.mode === "dark" ? "#ddd" : "#333")
            .text(`(${count})`);
        });

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
      }

      // Add legend - make it more compact on small screens
      if (width >= 400) {
        const legendX = 20;
        const legendY = height - (lists.length * 25 + 40);
        const legendFontSize = width < 600 ? 11 : 14;

        svg
          .append("text")
          .attr("x", legendX)
          .attr("y", legendY)
          .style("font-size", `${legendFontSize}px`)
          .style("font-weight", "bold")
          .style("fill", theme.palette.text.primary)
          .text("Legend:");

        lists.forEach((list, i) => {
          svg
            .append("rect")
            .attr("x", legendX)
            .attr("y", legendY + 15 + i * 25)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", colors[i % colors.length])
            .style("fill-opacity", 0.6);

          svg
            .append("text")
            .attr("x", legendX + 25)
            .attr("y", legendY + 15 + i * 25 + 12)
            .style("font-size", `${legendFontSize - 2}px`)
            .style("fill", theme.palette.text.primary)
            .text(list.name || `List ${list.id}`);
        });
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
  }, [lists, results, theme, dimensions]);

  return (
    <Box
      sx={{
        mt: 4,
        p: { xs: 1, sm: 2 },
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        width: "100%",
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
    </Box>
  );
};

export default VennDiagram;
