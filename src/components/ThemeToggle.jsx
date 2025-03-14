import React from "react";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import PaletteIcon from "@mui/icons-material/Palette";
import CheckIcon from "@mui/icons-material/Check";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const {
    mode,
    colorScheme,
    toggleColorMode,
    setThemeColorScheme,
    colorSchemes,
  } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSchemeSelect = (scheme) => {
    setThemeColorScheme(scheme);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Theme Settings">
        <IconButton onClick={handleClick} color="inherit">
          {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ zIndex: 2000 }}
      >
        <MenuItem onClick={toggleColorMode}>
          <ListItemIcon>
            {mode === "dark" ? (
              <Brightness7Icon fontSize="small" />
            ) : (
              <Brightness4Icon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {mode === "dark" ? "Light Mode" : "Dark Mode"}
          </ListItemText>
        </MenuItem>

        <Divider />

        <ListItemText sx={{ p: 1, opacity: 0.7, fontSize: "0.8rem" }}>
          Color Schemes
        </ListItemText>

        {Object.keys(colorSchemes).map((scheme) => (
          <MenuItem
            key={scheme}
            onClick={() => handleSchemeSelect(scheme)}
            selected={colorScheme === scheme}
          >
            <ListItemIcon>
              <PaletteIcon
                fontSize="small"
                sx={{ color: colorSchemes[scheme].primary }}
              />
            </ListItemIcon>
            <ListItemText>{colorSchemes[scheme].name}</ListItemText>
            {colorScheme === scheme && (
              <CheckIcon fontSize="small" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeToggle;
