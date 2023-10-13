import React from "react";
import logo from "../../assets/images/logo.png";
import { useHistory } from "react-router-dom";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';

import "./Header.css";

function Header() {
  const history = useHistory();

  //Logout function
  const onLogout = () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");

    if (isConfirmed) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      history.push("/login");
    }
  };

  return (
    <AppBar position="static" color="primary" className="header-root">
      <Toolbar className="header-toolbar">
        <IconButton edge="start" color="inherit" aria-label="logo">
          <img src={logo} alt="Dream Travels Logo" width="80" />
        </IconButton>

        <Typography variant="h4" className="header-title">
          Dream Travels
        </Typography>

        <div
          className="header-right"
          onClick={onLogout}
          style={{ cursor: "pointer" }}
        >
          <Typography variant="body1" className="log-out-text">
            Log Out
          </Typography>
          <IconButton edge="end" color="inherit">
            <LogoutIcon />
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
