import React, { useState, useEffect, useRef } from "react";
import { ListItem, ListItemText } from "@mui/material";

/**
 * A simple virtualized list component that only renders visible items
 */
const VirtualizedList = ({ items, itemHeight = 36, maxHeight = 400 }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef(null);

  // Calculate total list height
  const totalHeight = items.length * itemHeight;

  // Update visible items on scroll
  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const buffer = 5; // Extra items to render above and below viewport

      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
      const visibleCount = Math.ceil(maxHeight / itemHeight) + 2 * buffer;
      const end = Math.min(items.length, start + visibleCount);

      setVisibleRange({ start, end });
    }
  };

  // Add scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Calculate initial visible items
  useEffect(() => {
    handleScroll();
  }, [items]);

  // Only render items in the visible range
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      style={{
        height: Math.min(totalHeight, maxHeight),
        overflowY: "auto",
        position: "relative",
      }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: visibleRange.start * itemHeight,
            width: "100%",
          }}
        >
          {visibleItems.map((item, index) => (
            <ListItem key={visibleRange.start + index} dense>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedList;
