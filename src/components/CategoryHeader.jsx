import React, { useState } from "react";
import {
  Typography,
  Chip,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const CategoryHeader = ({
  category,
  listsCount,
  onDeleteCategory,
  canDelete = true,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteCategory(category);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              color: category === "Default" ? "#1976d2" : "#303f9f",
            }}
          >
            {category}
          </Typography>
          <Chip
            size="small"
            label={`${listsCount} ${listsCount === 1 ? "list" : "lists"}`}
            sx={{ ml: 2, fontSize: "0.8rem" }}
          />
        </Box>

        {canDelete && category !== "Default" && (
          <Tooltip title="Delete Category">
            <IconButton
              color="error"
              size="small"
              onClick={handleOpenDeleteDialog}
              aria-label="delete category"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the category "{category}"? All lists
            in this category will be moved to the Default category.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategoryHeader;
