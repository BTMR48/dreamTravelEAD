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
  IconButton,
  Collapse,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";

function TrainManagement() {
  const [trains, setTrains] = useState([]);
  const [openRow, setOpenRow] = useState(null);

  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));

  const [openModal, setOpenModal] = useState(false);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  const [trainId, setTrainId] = useState("");
  const [trainName, setTrainName] = useState("");
  const [currentTrainId, setCurrentTrainId] = useState(null); // to keep track of which train we're adding a schedule for
  const [scheduleId, setScheduleId] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [startStation, setStartStation] = useState("");
  const [stoppingStation, setStoppingStation] = useState("");

  // Error states for validation
  const [scheduleIdError, setScheduleIdError] = useState("");
  const [departureTimeError, setDepartureTimeError] = useState("");
  const [arrivalTimeError, setArrivalTimeError] = useState("");
  const [startStationError, setStartStationError] = useState("");
  const [stoppingStationError, setStoppingStationError] = useState("");
  const [trainIdError, setTrainIdError] = useState("");
  const [trainNameError, setTrainNameError] = useState("");

  const validateInputs = () => {
    let isValid = true;

    if (trainId.trim() === "") {
      setTrainIdError("Train ID is required");
      isValid = false;
    } else {
      setTrainIdError("");
    }

    if (trainName.trim() === "") {
      setTrainNameError("Train Name is required");
      isValid = false;
    } else {
      setTrainNameError("");
    }

    return isValid;
  };

  const config = {
    headers: {
      "content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  useEffect(() => {
    async function fetchTrains() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/Trains",
          config
        );
        setTrains(response.data);
      } catch (error) {
        alert("Failed to fetch trains");
        console.error("Error fetching trains:", error);
      }
    }

    fetchTrains();
  }, []);

  const fetchSchedule = async (trainId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/schedules/train/${trainId}`,
        config
      );
      return response.data;
    } catch (error) {
      alert("Failed to fetch schedule");
      console.error("Error fetching schedules for train:", error);
    }
    return [];
  };

  const handleExpandClick = async (trainId) => {
    if (openRow === trainId) {
      setOpenRow(null);
    } else {
      const schedules = await fetchSchedule(trainId);
      setTrains((prevTrains) =>
        prevTrains.map((train) =>
          train.id === trainId ? { ...train, schedules } : train
        )
      );
      setOpenRow(trainId);
    }
  };

  const handleAddTrain = async () => {
    if (validateInputs()) {
      try {
        const newTrain = {
          id: trainId,
          name: trainName,
          isPublished: false,
        };

        const response = await axios.post(
          "http://localhost:5000/api/Trains",
          newTrain,
          config
        );

        if (response.status === 200 || response.status === 201) {
          alert("Train added successfully!");
          setOpenModal(false);
          setTrainId("");
          setTrainName("");
          setTrains((prevTrains) => [...prevTrains, newTrain]);
        }
      } catch (error) {
        if (error.response.status == 500) {
          alert(error.response.data.details);
        } else {
          alert("Failed to add train");
        }
        console.error("Error adding train:", error);
      }
    }
  };

  const handleAddSchedule = async () => {
    if (validateScheduleInputs()) {
      const newSchedule = {
        id: Number(scheduleId),
        departureTime: convertTo12HourFormat(departureTime),
        arrivalTime: convertTo12HourFormat(arrivalTime),
        startStation: startStation,
        stoppingStation: stoppingStation,
        availableCount: 0,
        reservationCount: 0,
        train: {
          id: currentTrainId,
          name: trains.find((t) => t.id === currentTrainId).name,
          isPublished: true,
        },
      };

      try {
        const response = await axios.post(
          `http://localhost:5000/api/schedules/${currentTrainId}`,
          newSchedule,
          config
        );

        if (response.status === 200 || response.status === 201) {
          alert("Schedule added successfully!");
          setOpenScheduleModal(false);

          // Reset Fields
          setScheduleId("");
          setDepartureTime("");
          setArrivalTime("");
          setStartStation("");
          setStoppingStation("");
        }
      } catch (error) {
        if (error.response.status == 400) {
          alert(error.response.data);
        } else {
          alert("Failed to add schedule");
        }
        console.error("Error adding schedule:", error);
      }
    }
  };

  const validateScheduleInputs = () => {
    let isValid = true;

    if (scheduleId.trim() === "") {
      setScheduleIdError("Schedule ID is required");
      isValid = false;
    } else {
      setScheduleIdError("");
    }

    if (departureTime.trim() === "") {
      setDepartureTimeError("Departure Time is required");
      isValid = false;
    } else {
      setDepartureTimeError("");
    }

    if (arrivalTime.trim() === "") {
      setArrivalTimeError("Arrival Time is required");
      isValid = false;
    } else {
      setArrivalTimeError("");
    }

    if (startStation.trim() === "") {
      setStartStationError("Start Station is required");
      isValid = false;
    } else {
      setStartStationError("");
    }

    if (stoppingStation.trim() === "") {
      setStoppingStationError("Stopping Station is required");
      isValid = false;
    } else {
      setStoppingStationError("");
    }

    if (departureTime.trim() === "") {
      setDepartureTimeError("Departure Time is required");
      isValid = false;
    } else {
      setDepartureTimeError("");
    }

    if (arrivalTime.trim() === "") {
      setArrivalTimeError("Arrival Time is required");
      isValid = false;
    } else if (arrivalTime <= departureTime) {
      // Checking if the arrival time is before or equal to the departure time
      setArrivalTimeError("Arrival Time should be after Departure Time");
      isValid = false;
    } else {
      setArrivalTimeError("");
    }

    return isValid;
  };

  async function handlePublishTrain(id) {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to publish this Train?"
      );
      if (isConfirmed) {
        const response = await axios.patch(
          `http://localhost:5000/api/Trains/${id}/activate`,
          {},
          config
        );
        if (response.status === 200) {
          setTrains((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, isPublished: true } : item
            )
          );
        }
      }
    } catch (error) {
      console.error("Error publishing Train:", error);
      alert("Failed to publish Train.");
    }
  }

  const validateUpdateScheduleInputs = () => {
    let isValid = true;

    // Check for departure time
    if (departureTime.trim() === "") {
      setDepartureTimeError("Departure Time is required");
      isValid = false;
    } else {
      setDepartureTimeError("");
    }

    // Check for arrival time
    if (arrivalTime.trim() === "") {
      setArrivalTimeError("Arrival Time is required");
      isValid = false;
    } else if (arrivalTime <= departureTime) {
      // Checking if the arrival time is before or equal to the departure time
      setArrivalTimeError("Arrival Time should be after Departure Time");
      isValid = false;
    } else {
      setArrivalTimeError("");
    }

    // Check for start station
    if (startStation.trim() === "") {
      setStartStationError("Start Station is required");
      isValid = false;
    } else {
      setStartStationError("");
    }

    // Check for stopping station
    if (stoppingStation.trim() === "") {
      setStoppingStationError("Stopping Station is required");
      isValid = false;
    } else {
      setStoppingStationError("");
    }

    return isValid;
  };

  const handleEditScheduleClick = (schedule) => {
    console.log(schedule);
    setIsEditingSchedule(true);
    setOpenScheduleModal(true);
    setScheduleId(schedule.id);
    setDepartureTime(convertTo24HourFormat(schedule.departureTime));
    setArrivalTime(convertTo24HourFormat(schedule.arrivalTime));
    setStartStation(schedule.startStation);
    setStoppingStation(schedule.stoppingStation);
  };

  const handleUpdateSchedule = async () => {
    if (validateUpdateScheduleInputs()) {
      const updatedSchedule = {
        id: 0, // since it's not being changed
        departureTime: convertTo12HourFormat(departureTime),
        arrivalTime: convertTo12HourFormat(arrivalTime),
        startStation: startStation,
        stoppingStation: stoppingStation,
        train: {
          id: "",
          name: "",
          isPublished: true,
        },
      };

      try {
        const response = await axios.put(
          `http://localhost:5000/api/schedules/${scheduleId}`,
          updatedSchedule,
          config
        );
        if (response.status === 200) {
          alert("Schedule updated successfully!");
          setOpenScheduleModal(false);

          setOpenRow(null);

          setDepartureTime("");
          setArrivalTime("");
          setStartStation("");
          setStoppingStation("");
          // ... refresh the schedule data or modify the local state here.
        }
      } catch (error) {
        alert("Failed to update schedule");
        console.error("Error updating schedule:", error);
      }
    }
  };

  async function handleUnpublishTrain(id) {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to unpublish this Train?"
      );
      if (isConfirmed) {
        const response = await axios.patch(
          `http://localhost:5000/api/Trains/${id}/deactivate`,
          {},
          config
        );
        if (response.status === 200) {
          setTrains((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, isPublished: false } : item
            )
          );
        }
      }
    } catch (error) {
      console.error("Error unpublishing Train:", error);
      alert("Failed to unpublish Train.");
    }
  }

  const convertTo12HourFormat = (time) => {
    let hour = parseInt(time.split(":")[0]);
    let min = time.split(":")[1];
    let ampm = hour >= 12 ? "PM" : "AM";

    if (hour > 12) hour -= 12;
    else if (hour === 0) hour = 12;

    return `${String(hour).padStart(2, "0")}:${min} ${ampm}`;
  };

  const convertTo24HourFormat = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");

    hours = parseInt(hours);
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  const resetErrors = () => {
    setTrainIdError("");
    setTrainNameError("");
    setScheduleIdError("");
    setDepartureTimeError("");
    setArrivalTimeError("");
    setStartStationError("");
    setStoppingStationError("");
  };

  return (
    <Paper elevation={3} style={{ flex: 1, padding: "10px", margin: "10px" }}>
      <Typography variant="h5" component="h4" className="user-management-title">
        Train Management
      </Typography>
      <div className="center-button">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
          startIcon={<AddIcon />}
        >
          Add Train
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trains.map((train) => (
              <React.Fragment key={train.id}>
                <TableRow>
                  <TableCell>
                    <IconButton onClick={() => handleExpandClick(train.id)}>
                      {openRow === train.id ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{train.name}</TableCell>
                  <TableCell>
                    {train.isPublished ? "Published" : "Not Published"}
                  </TableCell>
                  <TableCell>
                    {train.isPublished ? (
                      <Button
                        startIcon={<BlockIcon color="warning" />}
                        onClick={() => handleUnpublishTrain(train.id)}
                        variant="outlined"
                        color="warning"
                        size="small"
                        style={{ width: '120px' }} // <-- add this line
                      >
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        startIcon={<CheckCircleIcon color="success" />}
                        onClick={() => handlePublishTrain(train.id)}
                        variant="outlined"
                        color="success"
                        size="small"
                        style={{ width: '120px' }} // <-- add this line
                      >
                        Publish
                      </Button>
                    )}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setCurrentTrainId(train.id);
                        setOpenScheduleModal(true);
                      }}
                      variant="outlined"
                      color="primary"
                      size="small"
                    >
                      Add Schedule
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={4}
                  >
                    <Collapse
                      in={openRow === train.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box margin={1}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Departure Time</TableCell>
                              <TableCell>Arrival Time</TableCell>
                              <TableCell>Start Station</TableCell>
                              <TableCell>Stopping Station</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {train.schedules?.map((schedule) => (
                              <TableRow key={schedule.id}>
                                <TableCell>{schedule.departureTime}</TableCell>
                                <TableCell>{schedule.arrivalTime}</TableCell>
                                <TableCell>{schedule.startStation}</TableCell>
                                <TableCell>
                                  {schedule.stoppingStation}
                                </TableCell>
                                <TableCell>
                                  {" "}
                                  <IconButton
                                    onClick={() =>
                                      handleEditScheduleClick(schedule)
                                    }
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Add New Train</DialogTitle>

        <DialogContent>
          <TextField
            error={Boolean(trainIdError)}
            helperText={trainIdError}
            margin="dense"
            label="Train ID"
            type="text"
            fullWidth
            value={trainId}
            onChange={(e) => setTrainId(e.target.value)}
          />

          <TextField
            error={Boolean(trainNameError)}
            helperText={trainNameError}
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={trainName}
            onChange={(e) => setTrainName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenModal(false);
              resetErrors();
            }}
            color="primary"
          >
            Cancel
          </Button>

          <Button onClick={handleAddTrain} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
      >
        <DialogTitle>Add New Schedule</DialogTitle>
        <DialogContent>
          {!isEditingSchedule && (
            <TextField
              error={Boolean(scheduleIdError)}
              helperText={scheduleIdError}
              margin="dense"
              label="Schedule ID"
              type="text"
              fullWidth
              value={scheduleId}
              onChange={(e) => setScheduleId(e.target.value)}
            />
          )}

          <TextField
            error={Boolean(departureTimeError)}
            helperText={departureTimeError}
            margin="dense"
            label="Departure Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
          />

          <TextField
            error={Boolean(arrivalTimeError)}
            helperText={arrivalTimeError}
            margin="dense"
            label="Arrival Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
          />

          <TextField
            error={Boolean(startStationError)}
            helperText={startStationError}
            margin="dense"
            label="Start Station"
            type="text"
            fullWidth
            value={startStation}
            onChange={(e) => setStartStation(e.target.value)}
          />

          <TextField
            error={Boolean(stoppingStationError)}
            helperText={stoppingStationError}
            margin="dense"
            label="Stopping Station"
            type="text"
            fullWidth
            value={stoppingStation}
            onChange={(e) => setStoppingStation(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenScheduleModal(false);
              resetErrors();
            }}
            color="primary"
          >
            Cancel
          </Button>

          <Button
            onClick={
              isEditingSchedule ? handleUpdateSchedule : handleAddSchedule
            }
            color="primary"
          >
            {isEditingSchedule ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default TrainManagement;
