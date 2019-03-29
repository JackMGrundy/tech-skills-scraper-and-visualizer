import React from "react";
import { NavLink } from "react-router-dom";

const NavBar = ({ username }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <NavLink className="navbar-brand" to="#">
        Navbar
      </NavLink>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNavAltMarkup"
        aria-controls="navbarNavAltMarkup"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav">
          {username && (
            <React.Fragment>
              <NavLink className="nav-item nav-link" to="/dashboard">
                Dashboard
              </NavLink>
              <NavLink className="nav-item nav-link" to="/scraper">
                Create scraper task
              </NavLink>
              <NavLink className="nav-item nav-link" to="/tasks">
                Your tasks
              </NavLink>
              <NavLink className="nav-item nav-link" to="/profile">
                Profile
              </NavLink>
              <NavLink className="nav-item nav-link" to="/logout">
                Logout
              </NavLink>
            </React.Fragment>
          )}
          {!username && (
            <React.Fragment>
              <NavLink className="nav-item nav-link" to="/login">
                Login
              </NavLink>
              <NavLink className="nav-item nav-link" to="/register">
                Register
              </NavLink>
            </React.Fragment>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
