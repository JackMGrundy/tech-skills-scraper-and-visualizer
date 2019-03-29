import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import authService from "./services/authService.js";
// import logo from "./logo.svg";
import "./App.css";
import LoginForm from "./components/loginForm.jsx";
import LogoutForm from "./components/logoutForm.jsx";
import RegisterForm from "./components/registerForm.jsx";
import EditScraperTaskForm from "./components/editScraperTasksForm.jsx";
import ScraperTasksForm from "./components/scraperTasksForm";
import NavBar from "./components/navBar.jsx";
import ProtectedRoute from "./components/protectedRoute";
import Dashboard from "./components/dashboard.jsx";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

class App extends Component {
  state = {};

  componentDidMount() {
    const data = authService.getAuthData();
    const token = authService.getToken();
    if (token !== null) {
      this.setState(data);
    }
  }

  render() {
    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar username={this.state.username} />
        <main className="container">
          <Switch>
            <Route path="/register" component={RegisterForm} />
            <Route path="/login" component={LoginForm} />
            <Route path="/logout" component={LogoutForm} />
            <Route path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/scraper" component={EditScraperTaskForm} />
            <ProtectedRoute path="/tasks" component={ScraperTasksForm} />
            {this.state.username && <Redirect from="/" exact to="/dashboard" />}
            {!this.state.username && <Redirect from="/" exact to="/login" />}
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
