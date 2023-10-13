import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));

  const [userNic, setUserNic] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState(1);

  const [nicError, setNicError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [roleError, setRoleError] = useState("");

  //Input nic validation
  function validateNic() {
    const nicpattern = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/m;
    if (!userNic.trim()) {
      setNicError("NIC is required.");
      return false;
    } else if (!nicpattern.test(userNic)) {
      setNicError("Invalid nic format.");
      return false;
    }
    setNicError("");
    return true;
  }

  //Input email validation
  function validateEmail() {
    // Basic email regex pattern
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

    if (!userEmail.trim()) {
      setEmailError("Email is required.");
      return false;
    } else if (!emailPattern.test(userEmail)) {
      setEmailError("Invalid email format.");
      return false;
    }
    setEmailError("");
    return true;
  }

  //Input password validation
  function validatePassword() {
    if (!userPassword) {
      setPasswordError("Password is required.");
      return false;
    } else if (userPassword.length < 6 || userPassword.length > 100) {
      setPasswordError("Password must be between 6 and 100 characters.");
      return false;
    }
    setPasswordError("");
    return true;
  }

  //Input role validation
  function validateRole() {
    if (![1, 2].includes(userRole)) {
      setRoleError("Invalid role selected.");
      return false;
    }
    setRoleError("");
    return true;
  }

  const config = {
    headers: {
      "content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  //Fetch all users 
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/Users",
          config
        );

        setUsers(response.data.filter((user) => user.role !== 0)); // Filter out users with role = 0
      } catch (error) {
        alert("Error fetching users");
        console.error("Error fetching users:", error);
      }
    }

    fetchUsers();
  }, []);

  //Add user
  async function handleAddUser() {
    if (
      !validateNic() ||
      !validateEmail() ||
      !validateRole() ||
      !validatePassword()
    ) {
      return; // stop here if there are validation errors
    }

    try {
      const userData = {
        id: "",
        nic: userNic,
        role: userRole,
        password: userPassword,
        email: userEmail,
      };

      const response = await axios.post(
        "http://localhost:5000/api/Users/register",
        userData,
        config
      );

      if (response.status === 200) {
        // Depending on the success status code returned by your API
        alert("User added successfully!");
        // Append the new user to the users state
        setUsers((prevUsers) => [
          ...prevUsers,
          {
            id: response.data.id, // If the API returns the new user's ID, use it. Otherwise, use an empty string.
            nic: userNic,
            role: userRole, // Assuming this is constant for all new users
            email: userEmail,
          },
        ]);

        // Reset input fields
        setUserNic("");
        setUserEmail("");
        setUserPassword("");

        setOpenModal(false); // Close the modal
      } else {
        alert("Failed to add user.");
      }
    } catch (error) {
      alert(error.response.data);
      console.error("Error adding user:", error);
    }
  }

  //Delete user
  async function deleteUser(nic) {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this user?"
      );

      if (isConfirmed) {
        // Call the API to delete the user by NIC
        const response = await axios.delete(
          `http://localhost:5000/api/Users/${nic}`,
          config
        );

        // Check the status or the response data to verify the deletion
        if (response.status === 200) {
          // Remove the deleted user from the state
          setUsers((prevUsers) => prevUsers.filter((user) => user.nic !== nic));
        } else {
          alert("Unable to delete user.");
        }
      }
    } catch (error) {
      alert("Error deleting user.");
      console.error("Error deleting user:", error);
    }
  }

  //Assign role names based on int
  function getRoleName(role) {
    switch (role) {
      case 0:
        return "Traveler";
      case 1:
        return "Traveler Agent";
      case 2:
        return "Back Office";
      case 3:
        return "Admin";
      default:
        return "Unknown";
    }
  }

  return (
    <Paper elevation={3} style={{ flex: 1, padding: "10px", margin: "10px" }}>
      <Typography variant="h5" component="h4" className="user-management-title">
        User Management
      </Typography>
      <div className="center-button">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
          startIcon={<AddIcon />}
        >
          Add User
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>NIC</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.nic}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleName(user.role)}</TableCell>
                <TableCell>
                  {!(user.role === 3) &&  (
                    <IconButton
                      onClick={() => deleteUser(user.nic)}
                      className="delete-icon"
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="NIC"
            type="text"
            fullWidth
            value={userNic}
            onChange={(e) => setUserNic(e.target.value)}
            helperText={nicError}
            error={Boolean(nicError)}
          />

          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            helperText={emailError}
            error={Boolean(emailError)}
          />

          <TextField
            select
            label="Role"
            value={userRole}
            onChange={(e) => setUserRole(Number(e.target.value))}
            helperText={roleError}
            error={Boolean(roleError)}
            fullWidth
            margin="dense"
          >
            <MenuItem value={1}>Traveler Agent</MenuItem>
            <MenuItem value={2}>Back Office</MenuItem>
            {/* <MenuItem value={3}>Admin</MenuItem> */}
          </TextField>

          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            helperText={passwordError}
            error={Boolean(passwordError)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddUser} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default UserManagement;
