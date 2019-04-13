import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import routes from "./routes.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import appStyle from "./style/appStyle";
import colors from './style/colors';

import authService from "./services/authService.js";

import ProtectedRoute from "./components/protectedRoute";
import Sidebar from "./components/sidebar.jsx";
import IconButton from "@material-ui/core/IconButton";
import ListIcon from "@material-ui/icons/List";
import withStyles from "@material-ui/core/styles/withStyles";

const shortid = require("shortid");

const switchedRoutes = (
  <Switch>
    {/* Generate routes according to routes.js */}
    {routes.map(route => {
      return route.protected ? (
        <ProtectedRoute
          key={shortid.generate()}
          path={route.path}
          component={route.component}
        />
      ) : (
        <Route
          key={shortid.generate()}
          path={route.path}
          component={route.component}
        />
      );
    })}
  </Switch>
);

class App extends Component {
  state = { sidebarOpen: true };

  componentDidMount() {
    const data = authService.getAuthData();
    const token = authService.getToken();
    if (token !== null) {
      this.setState(data);
    }
  }

  handleSidebar = () => {
    let update = !this.state.sidebarOpen;
    this.setState({ sidebarOpen: update });
  };

  handle = () => {
    let update = !this.state.sidebarOpen;
    this.setState({ sidebarOpen: update });
  };

  render() {
    document.body.style = "background:" + colors.mainBackground + ";";
    const { classes } = this.props;
    const { sidebarOpen } = this.state;
    return (
      <React.Fragment>
        <ToastContainer />
        {sidebarOpen ? <Sidebar open={sidebarOpen} handle={this.handle} /> : ""}
        <div className={sidebarOpen ? classes.mainPanel : ""}>
          {!sidebarOpen ? (
            <IconButton
              onClick={this.handleSidebar}
            >
              <ListIcon className="ml-5" style={{ transform: "scale(3)", color: colors.decoration }} />
            </IconButton>
          ) : (
            ""
          )}
          <main className={"container"}>{switchedRoutes}</main>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(appStyle)(App);
