import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Divider,
} from "@mui/material";

const ListSettingsDialog = ({
  open,
  onClose,
  list,
  categories,
  onNameChange,
  onCategoryChange,
  onAddCategory,
}) => {
  const [listName, setListName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryField, setShowNewCategoryField] = useState(false);

  // Reset state when dialog opens with new list
  useEffect(() => {
    if (open && list) {
      setListName(list.name || "");
      setCategory(list.category || "Default");
      setShowNewCategoryField(false);
    }
  }, [open, list]);

  const handleSave = () => {
    onNameChange(list.id, listName);
    onCategoryChange(list.id, category);
    onClose();
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      onAddCategory(newCategory);
      setCategory(newCategory);
      setNewCategory("");
      setShowNewCategoryField(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>List Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 1 }}>
          <TextField
            label="List Name"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            fullWidth
            variant="outlined"
          />

          <Typography variant="subtitle2" color="textSecondary">
            Organizing lists by categories helps manage multiple comparisons
          </Typography>

          {showNewCategoryField ? (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                label="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                fullWidth
                variant="outlined"
                autoFocus
              />
              <Button onClick={handleAddCategory} variant="contained">
                Add
              </Button>
              <Button onClick={() => setShowNewCategoryField(false)}>
                Cancel
              </Button>
            </Box>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
                <Divider sx={{ my: 1 }} />
                <MenuItem
                  value="__new__"
                  onClick={() => setShowNewCategoryField(true)}
                >
                  <Typography color="primary">+ Add New Category</Typography>
                </MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ListSettingsDialog;
