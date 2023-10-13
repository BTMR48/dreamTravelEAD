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
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from "@mui/material";

function MakeReservation() {
  const [schedules, setSchedules] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [reservationDate, setReservationDate] = useState("");
  const [seatCount, setSeatCount] = useState("");

  const [travelers, setTravelers] = useState([]);
  const [selectedTraveler, setSelectedTraveler] = useState(null);

  // States for error messages
  const [travelerError, setTravelerError] = useState("");
  const [reservationDateError, setReservationDateError] = useState("");
  const [seatCountError, setSeatCountError] = useState("");

  //Input validations
  const validateInputs = () => {
    let isValid = true;

    if (!selectedTraveler) {
      setTravelerError("Traveler NIC is required");
      isValid = false;
    } else {
      setTravelerError("");
    }

    if (!reservationDate) {
      setReservationDateError("Reservation date is required");
      isValid = false;
    } else {
      setReservationDateError("");
    }

    if (!seatCount || seatCount <= 0 || seatCount > 4) {
      setSeatCountError("Seat count is required and should be between 1 and 4");
      isValid = false;
    } else {
      setSeatCountError("");
    }

    return isValid;
  };

  // Calculate today's date
  const today = new Date();

  // Calculate the date one day after today for minDate
  const oneDayLater = new Date(today);
  oneDayLater.setDate(today.getDate() + 2);

  // Calculate the date 30 days after today for maxDate
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  // Convert dates to "yyyy-MM-dd" format
  const minDate = oneDayLater.toISOString().split("T")[0];
  const maxDate = thirtyDaysLater.toISOString().split("T")[0];

  const authToken = localStorage.getItem("authToken");

  const config = {
    headers: {
      "content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  //Fetch travelers and filter active ones
  useEffect(() => {
    async function fetchTravelers() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/Travelers",
          config
        );
        setTravelers(response.data.filter(traveler => traveler.isActive === true));
      } catch (error) {
        alert("Error fetching travelers");
        console.error("Error fetching travelers:", error);
      }
    }

    fetchTravelers();
  }, []);

  //Fetch published trains
  useEffect(() => {
    async function fetchSchedules() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/schedules/published-trains",
          config
        );
        setSchedules(response.data);
      } catch (error) {
        alert("Error fetching schedules");
        console.error("Error fetching schedules:", error);
      }
    }

    fetchSchedules();
  }, []);

  //when reserve button is clicked
  const handleReserve = (schedule) => {
    setCurrentSchedule(schedule);
    setOpenModal(true);
  };

  //Add booking
  const addBooking = async () => {
    if (validateInputs()) {
      try {
        const unixTimestamp = Date.now();
        const bookingObj = {
          id: "",
          bookingID: `B-${unixTimestamp}`,
          scheduleID: currentSchedule.id.toString(),
          seatCount: Number(seatCount),
          nic: selectedTraveler.nic,
          trainID: currentSchedule.train.id,
          reservationDate: new Date(reservationDate).toISOString(),
          bookingDate: new Date().toISOString(),
          status: 0,
          referenceID: `RF-${unixTimestamp}`,
        };

        const response = await axios.post(
          "http://localhost:5000/api/Bookings",
          bookingObj,
          config
        );
        if (response.status === 200 || response.status === 201) {
          alert("Reservation successful!");
          setOpenModal(false);
          setSeatCount("");
          setReservationDate("");
        }
      } catch (error) {
        alert("Error adding booking");
        console.error("Error adding booking:", error);
      }
    }
  };

  return (
    <Paper elevation={3} style={{ flex: 1, padding: "10px", margin: "10px" }}>
      <Typography
        variant="h5"
        component="h4"
        className="schedule-management-title"
      >
        Make Reservation
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Start Station</TableCell>
              <TableCell>Stopping Station</TableCell>
              <TableCell>Departure Time</TableCell>
              <TableCell>Arrival Time</TableCell>
              <TableCell>Train Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.startStation}</TableCell>
                <TableCell>{schedule.stoppingStation}</TableCell>
                <TableCell>{schedule.departureTime}</TableCell>
                <TableCell>{schedule.arrivalTime}</TableCell>
                <TableCell>{schedule.train.name}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleReserve(schedule)}
                  >
                    Reserve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle>Reserve Seats</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={travelers}
            getOptionLabel={(option) => option.nic + " - " + option.name}
            onChange={(event, newValue) => setSelectedTraveler(newValue)}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Traveler NIC"
                margin="dense"
                error={Boolean(travelerError)}
                helperText={travelerError}
              />
            )}
          />

          <TextField
            margin="dense"
            label="Reservation Date"
            type="date"
            fullWidth
            value={reservationDate}
            onChange={(e) => setReservationDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: minDate,
              max: maxDate,
            }}
            error={Boolean(reservationDateError)}
            helperText={reservationDateError}
          />

          <TextField
            margin="dense"
            label="Seat Count"
            type="number"
            fullWidth
            value={seatCount}
            inputProps={{
              min: 1,
              max: 4,
            }}
            onChange={(e) => setSeatCount(e.target.value)}
            error={Boolean(seatCountError)}
            helperText={seatCountError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={addBooking} color="primary">
            Reserve
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default MakeReservation;
