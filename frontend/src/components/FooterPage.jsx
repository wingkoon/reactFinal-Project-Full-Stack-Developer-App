import { useState, useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { Link, useResolvedPath } from "react-router-dom";
import { GeneralContext } from "../App";
import "../styles/Navbar.css";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Groups2Icon from "@mui/icons-material/Groups2";
import HandymanIcon from "@mui/icons-material/Handyman";
import EventIcon from '@mui/icons-material/Event';

export const RoleTypes = {
  none: 0,
  user: 1,
  IsBusiness: 2,
  isAdmin: 3,
};

export const checkPermissions = (permissions, userRoleType) => {
  return permissions.includes(userRoleType);
};

const pages = [

  {
    route: "/dailyOperation",
    title: (
      <Box>
        <FavoriteIcon />
        <span style={{ color: "inherit" }} id="textFooter">
          תפעול יומי
        </span>
      </Box>
    ),
    permissions: [RoleTypes.user, RoleTypes.IsBusiness, RoleTypes.isAdmin],
  },
    {
    route: "/incrementalOperation",
    title: (
      <Box>
        <EventIcon />
        <span style={{ color: "inherit" }} id="textFooter">
          תפעול מצטבר        
          </span>
      </Box>
    ),
    permissions: [RoleTypes.user, RoleTypes.IsBusiness, RoleTypes.isAdmin],
  },
  {
    route: "/operationTeams",
    title: (
      <Box>
        <Groups2Icon />
        <span id="textFooter" style={{ color: "inherit" }}>
          תפעול צוותי
        </span>
      </Box>
    ),
    permissions: [RoleTypes.IsBusiness, RoleTypes.isAdmin],
  },
  {
    route: "/centralizedOperation",
    title: (
      <Box>
        <HandymanIcon />
        <span id="textFooter">תפעול מוקדי</span>
      </Box>
    ),
    permissions: [RoleTypes.isAdmin],
  },
    {
    route: "/about",
    title: (
      <Box>
        <HomeIcon />
        <span id="textFooter">יעדים</span>
      </Box>
    ),
  },
];

export default function FooterPage() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const { userRoleType } = useContext(GeneralContext);

  const path = useResolvedPath().pathname;

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  return (
    <AppBar id="myNavBarFooter" position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}>
              {pages
                .filter(
                  (p) =>
                    !p.permissions ||
                    checkPermissions(p.permissions, userRoleType)
                )
                .map((p) => (
                  <Link
                    key={p.route}
                    to={p.route}
                    style={{ textDecoration: "none", color: "inherit" }}>
                    <MenuItem onClick={handleCloseNavMenu}>
                      <Typography component="div" textAlign="center">
                        {p.title}
                      </Typography>
                    </MenuItem>
                  </Link>
                ))}
            </Menu>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}>
            {pages
              .filter(
                (p) =>
                  !p.permissions ||
                  checkPermissions(p.permissions, userRoleType)
              )
              .map((p) => (
                <Link
                  key={p.route}
                  to={p.route}
                  style={{ textDecoration: "none", color: "inherit" }}>
                  <Button
                    id="myNavBarBtn"
                    onClick={handleCloseNavMenu}
                    sx={{
                      my: 2,
                      color: "inherit",
                      display: "block",
                      backgroundColor: p.route === path ? "#7c7b7b" : "",
                      borderRadius: "10px",
                    }}>
                    {p.title}
                  </Button>
                </Link>
              ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
