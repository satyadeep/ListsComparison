import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  Grid,
  Paper,
  useMediaQuery,
  List,
  ListItem,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Custom tooltip for pie chart to show actual entries with scrolling support
const CustomPieTooltip = ({ active, payload, itemMap, showTooltips }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  // If tooltips are disabled, return null
  if (!showTooltips) return null;

  if ((active || isHovered) && payload && payload.length && itemMap) {
    const data = payload[0];
    const listId = data?.payload?.listId;
    if (!listId) return null;

    const entries = itemMap[listId] || [];

    const maxEntriesToShow = 100; // Show more since we have scrolling
    const hasMoreEntries = entries.length > maxEntriesToShow;
    const displayEntries = entries.slice(0, maxEntriesToShow);

    return (
      <Paper
        elevation={4}
        sx={{
          padding: "12px",
          backgroundColor: theme.palette.background.paper,
          maxWidth: "280px",
          zIndex: 9999,
          pointerEvents: "auto", // Enable mouse events for scrolling
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Typography variant="subtitle2" color="textPrimary">
          {data.name}: {data.value} items
        </Typography>
        <Box
          sx={{
            mt: 1,
            maxHeight: "250px",
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
            {displayEntries.map((item, index) => (
              <ListItem key={index} dense sx={{ py: 0.5 }}>
                <Typography variant="caption" color="textSecondary">
                  {item}
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
    );
  }
  return null;
};

// Custom tooltip for bar chart to show actual entries with scrolling support
const CustomBarTooltip = ({
  active,
  payload,
  itemMap,
  commonItems,
  showTooltips,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  // If tooltips are disabled, return null
  if (!showTooltips) return null;

  if ((active || isHovered) && payload && payload.length && itemMap) {
    const listId = payload[0]?.payload?.listId;
    if (!listId || !itemMap[listId]) return null;

    const totalItems =
      payload.find((p) => p.name === "Total Items")?.value || 0;
    const uniqueItems =
      payload.find((p) => p.name === "Unique Items")?.value || 0;
    const commonItemsCount =
      payload.find((p) => p.name === "Common Items")?.value || 0;

    const entries = itemMap[listId] || [];
    const commonEntriesList = commonItems || [];

    const maxEntriesToShow = 100; // Show more since we have scrolling

    return (
      <Paper
        elevation={4}
        sx={{
          padding: "12px",
          backgroundColor: theme.palette.background.paper,
          maxWidth: "280px",
          zIndex: 9999,
          pointerEvents: "auto", // Enable mouse events for scrolling
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Typography variant="subtitle2" color="textPrimary">
          {payload[0].payload.name}
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ display: "block", mb: 1 }}
        >
          Total Items: {totalItems} | Unique Items: {uniqueItems} | Common
          Items: {commonItemsCount}
        </Typography>

        <Box
          sx={{
            mt: 1,
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
          {/* Unique items section */}
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", display: "block" }}
          >
            Unique items:
          </Typography>
          <List dense disablePadding>
            {entries.slice(0, maxEntriesToShow).map((item, index) => (
              <ListItem key={index} dense sx={{ py: 0.5 }}>
                <Typography variant="caption" color="textSecondary">
                  {item}
                </Typography>
              </ListItem>
            ))}
          </List>
          {entries.length > maxEntriesToShow && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ fontStyle: "italic", display: "block" }}
            >
              And {entries.length - maxEntriesToShow} more unique items...
            </Typography>
          )}

          {/* Common items section */}
          {commonEntriesList.length > 0 && (
            <>
              <Typography
                variant="caption"
                sx={{ fontWeight: "bold", display: "block", mt: 1 }}
              >
                Common items:
              </Typography>
              <List dense disablePadding>
                {commonEntriesList
                  .slice(0, maxEntriesToShow)
                  .map((item, index) => (
                    <ListItem key={`common-${index}`} dense sx={{ py: 0.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        {item}
                      </Typography>
                    </ListItem>
                  ))}
              </List>
              {commonEntriesList.length > maxEntriesToShow && (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontStyle: "italic", display: "block" }}
                >
                  And {commonEntriesList.length - maxEntriesToShow} more common
                  items...
                </Typography>
              )}
            </>
          )}
        </Box>
      </Paper>
    );
  }
  return null;
};

const ListStatistics = ({ lists, results, showTooltips = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isExtraSmall = useMediaQuery("(max-width:400px)");

  // Get common items
  const commonItems = useMemo(() => {
    const commonResult = results.find((result) => result.listId === "common");
    return commonResult ? commonResult.uniqueValues : [];
  }, [results]);

  // Create a map of list IDs to their unique values for tooltips
  const itemMap = useMemo(() => {
    const map = {};

    // Add unique values for each list
    results.forEach((result) => {
      // Skip the common result as we handle it separately
      if (result.listId !== "common") {
        map[result.listId] = result.uniqueValues;
      }
    });

    return map;
  }, [results]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    if (!lists || !results) return { pieData: [], barData: [] };

    // Data for pie chart - shows the proportion of unique items per list
    const pieData = results
      .filter((result) => result.listId !== "common")
      .map((result) => {
        const list = lists.find((list) => list.id === result.listId);
        return {
          name: list ? list.name || `List ${list.id}` : `List ${result.listId}`,
          value: result.uniqueValues.length,
          listId: result.listId,
        };
      });

    // Add common values
    const commonResult = results.find((result) => result.listId === "common");
    if (commonResult) {
      pieData.push({
        name: "Common Items",
        value: commonResult.uniqueValues.length,
        listId: "common",
      });
    }

    // Data for bar chart - compare list sizes, unique items, and common items
    const barData = lists.map((list) => {
      const result = results.find((r) => r.listId === list.id);
      const items = list.content
        ? list.content.split(/[\n,]+/).filter((item) => item.trim())
        : [];
      return {
        name: list.name || `List ${list.id}`,
        "Total Items": items.length,
        "Unique Items": result ? result.uniqueValues.length : 0,
        "Common Items": commonResult ? commonResult.uniqueValues.length : 0,
        listId: list.id,
      };
    });

    return { pieData, barData };
  }, [lists, results]);

  // Generate colors for the charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Custom renderer for pie chart labels to prevent cutoff
  const renderCustomizedLabel = (props) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
      name,
      value,
    } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * (isExtraSmall ? 1.3 : isMobile ? 1.4 : 1.5);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // For very small screens or small segments, just show percentage
    if (isExtraSmall || percent < 0.05) {
      return (
        <text
          x={x}
          y={y}
          fill={theme.palette.text.primary}
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize={isExtraSmall ? 9 : 10}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    }

    // For other cases, show name and value
    return (
      <text
        x={x}
        y={y}
        fill={theme.palette.text.primary}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={isExtraSmall ? 9 : isMobile ? 10 : 12}
      >
        {`${name.length > 10 ? name.substring(0, 8) + "..." : name}: ${value}`}
      </text>
    );
  };

  return (
    <Box sx={{ mt: 4, width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Statistical Analysis
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: "100%", mx: 0 }}>
        {/* Pie Chart */}
        <Grid item xs={12} md={6} sx={{ width: "100%" }}>
          <Paper
            elevation={2}
            sx={{ p: { xs: 1, sm: 2 }, height: "100%", width: "100%" }}
          >
            <Typography variant="subtitle1" align="center" gutterBottom>
              Distribution of Unique Items
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: { xs: 280, sm: 300 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    // Adjust the inner and outer radius based on screen size
                    outerRadius={isExtraSmall ? 60 : isMobile ? 70 : 90}
                    innerRadius={isExtraSmall ? 25 : isMobile ? 30 : 40}
                    fill="#8884d8"
                    labelLine={!isExtraSmall} // Hide label lines on very small screens
                    label={renderCustomizedLabel}
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      showTooltips
                        ? (props) => (
                            <CustomPieTooltip
                              {...props}
                              itemMap={itemMap}
                              showTooltips={showTooltips}
                            />
                          )
                        : undefined
                    }
                  />
                  {/* Move legend below the chart on mobile */}
                  <Legend
                    layout={isMobile ? "horizontal" : "vertical"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    align={isMobile ? "center" : "right"}
                    wrapperStyle={isMobile ? { paddingTop: 10 } : {}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6} sx={{ width: "100%" }}>
          <Paper
            elevation={2}
            sx={{ p: { xs: 1, sm: 2 }, height: "100%", width: "100%" }}
          >
            <Typography variant="subtitle1" align="center" gutterBottom>
              List Items Breakdown
            </Typography>
            <Box sx={{ width: "100%", height: { xs: 250, sm: 300 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.barData}
                  margin={{
                    top: 20,
                    right: 10,
                    left: 0,
                    bottom: isExtraSmall ? 80 : isMobile ? 60 : 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: isExtraSmall ? 8 : isMobile ? 10 : 12 }}
                    height={60}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: isExtraSmall ? 10 : 12 }} />
                  <Tooltip
                    content={
                      showTooltips
                        ? (props) => (
                            <CustomBarTooltip
                              {...props}
                              itemMap={itemMap}
                              commonItems={commonItems}
                              showTooltips={showTooltips}
                            />
                          )
                        : undefined
                    }
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: 10 }}
                    verticalAlign="top"
                  />
                  <Bar dataKey="Total Items" fill="#8884d8" />
                  <Bar dataKey="Unique Items" fill="#82ca9d" />
                  <Bar dataKey="Common Items" fill="#ff8042" />{" "}
                  {/* New bar for common items */}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ListStatistics;
