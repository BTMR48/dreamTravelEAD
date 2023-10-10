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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import "./TravelerManagement.css";

function TravelerManagement() {
  const [travelers, setTravelers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  const [isEditing, setIsEditing] = useState(false);

  const [userNic, setUserNic] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userDateOfBirth, setUserDateOfBirth] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [id, setID] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const [nameError, setNameError] = useState("");
  const [dobError, setDobError] = useState("");
  const [nicError, setNicError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

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

  function validateName() {
    if (!userName.trim()) {
      setNameError("Name is required.");
      return false;
    }
    setNameError("");
    return true;
  }

  function validateDob() {
    if (!userDateOfBirth) {
      setDobError("Date of Birth is required.");
      return false;
    }

    const inputDate = new Date(userDateOfBirth);
    const today = new Date();

    // Set time components to 0 to compare just the date part
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (inputDate >= today) {
      setDobError("Date of Birth should be before today.");
      return false;
    }

    setDobError("");
    return true;
  }

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

  const config = {
    headers: {
      "content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  useEffect(() => {
    async function fetchTravelers() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/Travelers",
          config
        );

        // setTravelers(response.data.filter((user) => user.role !== 0));
        setTravelers(response.data);
      } catch (error) {
        alert("Error fetching travelers");
        console.error("Error fetching travelers:", error);
      }
    }

    fetchTravelers();
  }, []);

  async function handleAddTraveler() {
    if (
      !validateNic() ||
      !validateName() ||
      !validateEmail() ||
      !validateDob() ||
      !validatePassword()
    ) {
      return; // stop here if there are validation errors
    }

    try {
      const userData = {
        id: "",
        nic: userNic,
        role: 0,
        password: userPassword,
        email: userEmail,
      };

      const response = await axios.post(
        "http://localhost:5000/api/Users/register",
        userData,
        config
      );

      if (response.status === 200) {
        // call the Travelers API
        const travelerData = {
          id: "",
          nic: userNic,
          email: userEmail,
          name: userName,
          dateOfBirth: formatDateToISO(userDateOfBirth),
        };

        const travelerResponse = await axios.post(
          "http://localhost:5000/api/Travelers/register",
          travelerData,
          config
        );

        if (travelerResponse.status === 200) {
          alert("Traveler added successfully!");

          // Append the new traveler to the travelers state
          setTravelers((prevTravelers) => [
            ...prevTravelers,
            {
              id: travelerResponse.data.id,
              nic: userNic,
              email: userEmail,
              name: userName,
              dateOfBirth: userDateOfBirth,
            },
          ]);

          // Reset input fields
          setUserNic("");
          setUserName("");
          setUserEmail("");
          setUserDateOfBirth("");
          setUserPassword("");

          setOpenModal(false); // Close the modal
        } else {
          alert("Failed to add traveler");
        }
      }
    } catch (error) {
      alert(error.response.data);
      console.error("Error adding user:", error);
    }
  }

  async function deleteTraveler(nic) {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this traveler?"
      );

      if (isConfirmed) {
        // Call the API to delete the user by NIC
        const response = await axios.delete(
          `http://localhost:5000/api/Travelers/${nic}`,
          config
        );

        // Check the status or the response data to verify the deletion
        if (response.status === 200) {
          const userResponse = await axios.delete(
            `http://localhost:5000/api/Users/${nic}`,
            config
          );

          if (userResponse.status === 200) {
            // Remove the deleted user from the state
            setTravelers((prevTravelers) =>
              prevTravelers.filter((traveler) => traveler.nic !== nic)
            );
          } else {
            alert("Unable to delete traveler.");
          }
        }
      }
    } catch (error) {
      alert("Error deleting traveler.");
      console.error("Error deleting traveler:", error);
    }
  }

  async function handleActivateTraveler(nic) {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to activate this traveler?"
      );
      if (isConfirmed) {
        const response = await axios.patch(
          `http://localhost:5000/api/Travelers/${nic}/activate`,
          {},
          config
        );
        if (response.status === 200) {
          setTravelers((prev) =>
            prev.map((item) =>
              item.nic === nic ? { ...item, isActive: true } : item
            )
          );
        }
      }
    } catch (error) {
      console.error("Error activating traveler:", error);
      alert("Failed to activate traveler.");
    }
  }

  async function handleDeactivateTraveler(nic) {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to deactivate this traveler?"
      );
      if (isConfirmed) {
        const response = await axios.patch(
          `http://localhost:5000/api/Travelers/${nic}/deactivate`,
          {},
          config
        );
        if (response.status === 200) {
          setTravelers((prev) =>
            prev.map((item) =>
              item.nic === nic ? { ...item, isActive: false } : item
            )
          );
        }
      }
    } catch (error) {
      console.error("Error deactivating traveler:", error);
      alert("Failed to deactivate traveler.");
    }
  }

  function handleEditTraveler(traveler) {
    setID(traveler.id);
    setUserNic(traveler.nic);
    setUserEmail(traveler.email);
    setUserName(traveler.name);
    const dateParts = traveler.dateOfBirth.split("T")[0];
    setUserDateOfBirth(dateParts);
    setIsActive(traveler.isActive);

    setIsEditing(true);
    setOpenModal(true);
  }

  async function handleUpdateTraveler() {
    console.log("update called");

    try {
      if (!validateName() || !validateEmail() || !validateDob()) {
        return; // stop here if there are validation errors
      }
      const travelerData = {
        id: id,
        nic: userNic,
        email: userEmail,
        name: userName,
        dateOfBirth: formatDateToISO(userDateOfBirth),
        isActive: isActive,
      };

      const response = await axios.put(
        `http://localhost:5000/api/Travelers/${userNic}`,
        travelerData,
        config
      );
      console.log(response);
      if (response.status === 200) {
        alert("Traveler updated successfully!");

        // Append the new traveler to the travelers state
        setTravelers((prevTravelers) =>
          prevTravelers.map((item) =>
            item.nic === userNic
              ? {
                  ...item,
                  id: response.data.id,
                  nic: userNic,
                  email: userEmail,
                  name: userName,
                  dateOfBirth: userDateOfBirth,
                }
              : item
          )
        );
        // Reset input fields
        setUserNic("");
        setUserName("");
        setUserEmail("");
        setUserDateOfBirth("");
        setUserPassword("");

        setOpenModal(false); // Close the modal
        setIsEditing(false);
      } else {
        alert("Failed to update traveler");
      }
    } catch (error) {
      alert(error.response.data);
      console.error("Error updating traveler:", error);
    }
  }

  function formatDateToISO(inputDate) {
    const date = new Date(inputDate);
    return date.toISOString();
  }

  function formatDateToYYYYMMDD(inputDate) {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}/${month}/${day}`;
  }

  return (
    <Paper elevation={3} style={{ flex: 1, padding: "10px", margin: "10px" }}>
      <Typography variant="h5" component="h4" className="user-management-title">
        Traveler Management
      </Typography>
      <div className="center-button">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
          startIcon={<AddIcon />}
        >
          Add Traveler
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>NIC</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {travelers.map((traveler) => (
              <TableRow key={traveler.id}>
                <TableCell>{traveler.nic}</TableCell>
                <TableCell>{traveler.name}</TableCell>
                <TableCell>{traveler.email}</TableCell>
                <TableCell>
                  {formatDateToYYYYMMDD(traveler.dateOfBirth)}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditTraveler(traveler)}>
                    <EditIcon />
                  </IconButton>
                  {(role == 2 || role == 3) &&
                    (traveler.isActive ? (
                      <IconButton
                        onClick={() => handleDeactivateTraveler(traveler.nic)}
                      >
                        <BlockIcon color="warning" />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() => handleActivateTraveler(traveler.nic)}
                      >
                        <CheckCircleIcon color="success" />
                      </IconButton>
                    ))}
                  <IconButton
                    onClick={() => deleteTraveler(traveler.nic)}
                    className="delete-icon"
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>{isEditing ? "Update User" : "Add User"}</DialogTitle>
        <DialogContent>
          {!isEditing && (
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
          )}

          <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            helperText={nameError}
            error={Boolean(nameError)}
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
            margin="dense"
            label="Date of Birth"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={userDateOfBirth}
            onChange={(e) => setUserDateOfBirth(e.target.value)}
            helperText={dobError}
            error={Boolean(dobError)}
            inputProps={{
              max: new Date().toISOString().split("T")[0], // Today's date
            }}
          />

          {!isEditing && (
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={isEditing ? handleUpdateTraveler : handleAddTraveler}
            color="primary"
          >
            {isEditing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default TravelerManagement;
