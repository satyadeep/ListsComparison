import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";

const ListRenameDialog = ({
  open,
  onClose,
  list,
  newName,
  onNameChange,
  onRename,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onRename(list?.id, newName);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <DriveFileRenameOutlineIcon color="primary" />
        Rename List
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Current Name"
              value={list?.name || ""}
              disabled
              fullWidth
              variant="outlined"
              margin="dense"
            />
          </Box>

          <TextField
            autoFocus
            label="New Name"
            value={newName}
            onChange={(e) => onNameChange(e.target.value)}
            fullWidth
            variant="outlined"
            margin="dense"
            required
            placeholder="Enter new list name"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!newName.trim() || newName === list?.name}
          >
            Rename
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ListRenameDialog;
