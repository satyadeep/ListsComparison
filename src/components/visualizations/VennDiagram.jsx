import React, { useEffect, useRef } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import * as d3 from "d3";

const VennDiagram = ({ lists, results }) => {
  const vennRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (!lists || lists.length < 2 || !results || !vennRef.current) return;

    // Clear previous content
    d3.select(vennRef.current).selectAll("*").remove();

    try {
      // Get the unique values for each list and common values
      const uniqueResults = results.filter((r) => r.listId !== "common");
      const commonResult = results.find((r) => r.listId === "common");

      // Set dimensions with responsive values
      const containerWidth = vennRef.current.clientWidth || 500;
      const width = Math.min(containerWidth, 500);
      const height = Math.min(width * 0.8, 400);
      const centerX = width / 2;
      const centerY = height / 2;

      // Calculate circle dimensions based on unique item counts
      const maxCount = Math.max(
        ...uniqueResults.map((r) => r.uniqueValues.length),
        1
      );
      const baseRadius = Math.min(width, height) * 0.25;

      // Create SVG
      const svg = d3
        .select(vennRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

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
        const radius1 = baseRadius * (0.7 + 0.3 * (count1 / maxCount));
        const radius2 = baseRadius * (0.7 + 0.3 * (count2 / maxCount));

        // Position circles with some overlap
        const offset = Math.min(radius1, radius2) * 0.8;

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

        // Add labels for the sets
        svg
          .append("text")
          .attr("x", centerX - offset * 1.5)
          .attr("y", centerY - radius1 * 0.7)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("fill", theme.palette.text.primary)
          .text(`${list1.name || `List ${list1.id}`} (${count1})`);

        svg
          .append("text")
          .attr("x", centerX + offset * 1.5)
          .attr("y", centerY - radius2 * 0.7)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("fill", theme.palette.text.primary)
          .text(`${list2.name || `List ${list2.id}`} (${count2})`);

        // Add label for the intersection
        svg
          .append("text")
          .attr("x", centerX)
          .attr("y", centerY)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
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
        // For 3 lists, create a 3-circle Venn diagram
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

        // Calculate radii
        const radius = baseRadius * 0.9;
        const angle = (2 * Math.PI) / 3;

        // Calculate positions for a triangle arrangement
        const positions = [
          { x: centerX, y: centerY - radius * 0.7 }, // top
          { x: centerX - radius * 0.7, y: centerY + radius * 0.5 }, // bottom left
          { x: centerX + radius * 0.7, y: centerY + radius * 0.5 }, // bottom right
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

        // Add labels for each circle
        lists.forEach((list, i) => {
          const pos = positions[i];
          const result = uniqueResults.find((r) => r.listId === list.id);
          const count = result ? result.uniqueValues.length : 0;

          svg
            .append("text")
            .attr(
              "x",
              pos.x + (i === 0 ? 0 : i === 1 ? -radius * 0.8 : radius * 0.8)
            )
            .attr("y", pos.y + (i === 0 ? -radius : radius * 0.8))
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", theme.palette.text.primary)
            .text(`${list.name || `List ${list.id}`} (${count})`);
        });

        // Add label for the center intersection
        svg
          .append("text")
          .attr("x", centerX)
          .attr("y", centerY)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
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
        // Draw a center circle with surrounding circles
        const centerRadius = baseRadius * 0.6;

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

        svg
          .append("text")
          .attr("x", centerX)
          .attr("y", centerY)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("fill", theme.palette.mode === "dark" ? "#fff" : "#000")
          .text(
            `Common (${commonResult ? commonResult.uniqueValues.length : 0})`
          );

        // Draw surrounding circles for each list
        lists.forEach((list, i) => {
          const angle = (2 * Math.PI * i) / lists.length;
          const x = centerX + Math.cos(angle) * baseRadius * 1.2;
          const y = centerY + Math.sin(angle) * baseRadius * 1.2;
          const radius = baseRadius * 0.4;

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
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", theme.palette.mode === "dark" ? "#fff" : "#000")
            .text(`${list.name || `List ${list.id}`}`);

          // Add count below name
          svg
            .append("text")
            .attr("x", x)
            .attr("y", y + 16)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
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

      // Add legend
      const legendX = 20;
      const legendY = height - (lists.length * 25 + 40);

      svg
        .append("text")
        .attr("x", legendX)
        .attr("y", legendY)
        .style("font-size", "14px")
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
          .style("font-size", "12px")
          .style("fill", theme.palette.text.primary)
          .text(`${list.name || `List ${list.id}`}`);
      });
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
  }, [lists, results, theme]);

  return (
    <Box
      sx={{
        mt: 4,
        p: { xs: 1, sm: 2 },
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        width: "100%",
      }}
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
          height: { xs: 300, sm: 400 },
          width: "100%",
          overflow: "auto",
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
