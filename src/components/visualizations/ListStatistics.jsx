import React, { useMemo } from "react";
import { Box, Typography, useTheme, Grid, Paper } from "@mui/material";
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

const ListStatistics = ({ lists, results }) => {
  const theme = useTheme();

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

    // Data for bar chart - compare list sizes and unique items
    const barData = lists.map((list) => {
      const result = results.find((r) => r.listId === list.id);
      const items = list.content
        ? list.content.split(/[\n,]+/).filter((item) => item.trim())
        : [];
      return {
        name: list.name || `List ${list.id}`,
        "Total Items": items.length,
        "Unique Items": result ? result.uniqueValues.length : 0,
        listId: list.id,
      };
    });

    return { pieData, barData };
  }, [lists, results]);

  // Generate colors for the charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Statistical Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Distribution of Unique Items
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} items`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              List Comparison: Total vs. Unique Items
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData.barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total Items" fill="#8884d8" />
                <Bar dataKey="Unique Items" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ListStatistics;
