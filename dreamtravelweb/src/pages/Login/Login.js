import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, TextField, Paper, Typography, Box } from "@mui/material";
import axios from "axios";
import "./Login.css";

function Login() {
  const [nic, setNic] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ nic: "", password: "" });
  
  const history = useHistory();

  async function handleLogin(event) {
    event.preventDefault();

    // Reset errors
    setErrors({ nic: "", password: "" });

    // Validation
    const nicpattern = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/m;
    let isValid = true;
    if (!nic.trim()) {
      setErrors((prev) => ({ ...prev, nic: "NIC is required." }));
      isValid = false;
    } else if (!nicpattern.test(nic)) {
      setErrors((prev) => ({ ...prev, nic: "NIC invalid." }));
      isValid = false;
    }

    if (!password.trim()) {
      setErrors((prev) => ({ ...prev, password: "Password is required." }));
      isValid = false;
    }

    // If validation fails, return early
    if (!isValid) return;

    const config = {
      headers: {
        "content-Type": "application/json",
      },
    };
    console.log(nic, password);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/Users/login",
        { nic, password },
        config
      );

      //setting the patient authorization token
      localStorage.setItem("authToken", data.token);
      // localStorage.setItem("role", data.role);
      localStorage.setItem("role", 3);

      history.push("/");
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        alert(error.response.data);
      } else {
        alert("Authentication Failed");
      }
    }
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Paper elevation={3} className="login-container">
        <Typography variant="h5" align="center">
          Dream Travels Login
        </Typography>

        <TextField
          label="National Identification Card (NIC)"
          variant="outlined"
          value={nic}
          onChange={(e) => setNic(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.nic}
          helperText={errors.nic}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          fullWidth
        >
          Login
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;
