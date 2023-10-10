import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

import "./App.css";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar/Sidebar";
import Login from "./pages/Login/Login";
import MakeReservation from "./pages/MakeReservation/MakeReservation";
import UserManagement from "./pages/UserManagement/UserManagement";
import TravelerManagement from "./pages/TravelerManagement/TravelerManagement";

function App() {
  // const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));

  return (
    <div className="app">
      <Router>
          <Switch>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route path="/">
        <Header />
        <div className="content-container">
          <Sidebar />
            <PrivateRoute exact path="/" component={MakeReservation} />
            <PrivateRoute exact path="/user-management" component={UserManagement} />
            <PrivateRoute exact path="/traveler-management" component={TravelerManagement} />
        </div>
        <Footer />

            </Route>
          </Switch>
      </Router>
    </div>
  );
}

export default App;
