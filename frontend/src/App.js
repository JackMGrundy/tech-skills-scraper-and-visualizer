import React, { Component } from "react";
import { Route, Link, Redirect, Switch } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";
import scraperPage from "./components/scraperPage.jsx";
import NavBar from "./components/navBar.jsx";
import Dashboard from "./components/dashboard.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar />
        <main className="container">
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/scraper" component={scraperPage} />
            <Redirect from="/" exact to="/scraper" />
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
