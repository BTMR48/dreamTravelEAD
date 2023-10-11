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
  DialogActions,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";

import "./CurrentReservations.css";

function CurrentReservations() {
  const [bookings, setBookings] = useState([]);

  const authToken = localStorage.getItem("authToken");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [editedReservationDate, setEditedReservationDate] = useState("");
  const [editedSeatCount, setEditedSeatCount] = useState("");

  const [reservationDateError, setReservationDateError] = useState("");
  const [seatCountError, setSeatCountError] = useState("");

  const validateInputs = () => {
    let isValid = true;

    if (!editedReservationDate) {
      setReservationDateError("Reservation date is required");
      isValid = false;
    } else {
      setReservationDateError("");
    }

    if (!editedSeatCount || editedSeatCount <= 0) {
      setSeatCountError("Seat count is required and must be greater than 0");
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

  const config = {
    headers: {
      "content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/Bookings",
          config
        );
        setBookings(response.data);
      } catch (error) {
        alert("Error fetching bookings");
        console.error("Error fetching bookings:", error);
      }
    }

    fetchBookings();
  }, []);

  //   const deleteBooking = async (bookingID) => {
  //     const isConfirmed = window.confirm(
  //       "Are you sure you want to delete this booking?"
  //     );
  //     if (isConfirmed) {
  //       try {
  //         await axios.delete(
  //           `http://localhost:5000/api/Bookings/${bookingID}`,
  //           config
  //         );
  //         setBookings((prevBookings) =>
  //           prevBookings.filter((booking) => booking.bookingID !== bookingID)
  //         );
  //         alert("Booking deleted successfully!");
  //       } catch (error) {
  //         alert("Error deleting booking");
  //         console.error("Error deleting booking:", error);
  //       }
  //     }
  //   };

  const handleOpenEditModal = (booking) => {
    const formattedDate = new Date(booking.reservationDate)
      .toISOString()
      .split("T")[0];
    setCurrentBooking(booking);
    setEditedReservationDate(formattedDate);
    setEditedSeatCount(booking.seatCount);
    setEditModalOpen(true);
  };

  const handleUpdateBooking = async () => {
    if (!validateInputs()) {
      return;
    }
    if (currentBooking) {
      try {
        // Convert the formatted date back to ISO string format
        const isoReservationDate = new Date(
          editedReservationDate
        ).toISOString();
        const updatedBooking = {
          ...currentBooking,
          reservationDate: isoReservationDate,
          seatCount: editedSeatCount,
        };
        await axios.put(
          `http://localhost:5000/api/Bookings/${currentBooking.bookingID}`,
          updatedBooking,
          config
        );
        alert("Booking updated successfully!");
        setEditModalOpen(false);
        // Optionally, you can refresh the bookings after updating
        const response = await axios.get(
          "http://localhost:5000/api/Bookings",
          config
        );
        setBookings(response.data);
      } catch (error) {
        alert("Error updating the booking.");
        console.error("Error updating the booking:", error);
      }
    }
  };

  const canCancelEditBooking = (reservationDate) => {
    const now = new Date();
    const reservation = new Date(reservationDate);
    const timeDiff = reservation - now;
    const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
    return dayDiff >= 5;
  };

  const handleCancel = async (bookingID) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await axios.patch(
          `http://localhost:5000/api/Bookings/${bookingID}/status`,
          { status: 1 },
          config
        );
        alert("Booking cancelled successfully!");
        // Refresh the bookings
        const response = await axios.get(
          "http://localhost:5000/api/Bookings",
          config
        );
        setBookings(response.data);
      } catch (error) {
        alert("Error cancelling the booking.");
        console.error("Error cancelling the booking:", error);
      }
    }
  };

  // Convert ISO date string to formatted date string
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <Paper elevation={3} style={{ flex: 1, padding: "10px", margin: "10px" }}>
      <Typography
        variant="h5"
        component="h4"
        className="current-reservation-title"
      >
        Current Reservations
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Schedule ID</TableCell>
              <TableCell>NIC</TableCell>
              <TableCell>Reserved Seats</TableCell>
              <TableCell>Reservation Date</TableCell>
              <TableCell>Booking Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.bookingID}</TableCell>
                <TableCell>{booking.scheduleID}</TableCell>
                <TableCell>{booking.nic}</TableCell>
                <TableCell>{booking.seatCount}</TableCell>
                <TableCell>{formatDate(booking.reservationDate)}</TableCell>
                <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                {canCancelEditBooking(booking.reservationDate) && (
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenEditModal(booking)}
                    >
                      EDIT
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleCancel(booking.bookingID)}
                    >
                      CANCEL
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Reservation Date"
            type="date"
            fullWidth
            value={editedReservationDate}
            onChange={(e) => setEditedSeatCount(e.target.value)}
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
            value={editedSeatCount}
            inputProps={{
              min: 1,
              max: 4,
            }}
            error={Boolean(seatCountError)}
            helperText={seatCountError}
            onChange={(e) => setEditedSeatCount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateBooking} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default CurrentReservations;
