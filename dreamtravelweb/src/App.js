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

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));

  return (
    <div className="app">
      <Router>
        <Header />
        <div className="content-container">
          <Sidebar />
          <Switch>
            <Route exact path="/login">
              {authToken ? <Redirect to="/" /> : <Login />}
            </Route>
            <PrivateRoute exact path="/" component={MakeReservation} />
            {/* You can add more routes here as necessary */}
          </Switch>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
