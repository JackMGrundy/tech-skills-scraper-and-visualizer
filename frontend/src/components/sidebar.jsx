import React from "react";
import { NavLink } from "react-router-dom";
import routes from "../routes.js";

// Services
import authService from "../services/authService";

// Style
import sidebarStyle from "../style/sidebarStyle.jsx";
import colors from '../style/colors';

// Components
import withStyles from "@material-ui/core/styles/withStyles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import ListIcon from "@material-ui/icons/List";

// Helpers
const shortid = require("shortid");

const Sidebar = ({ ...props }) => {
  const { classes, handle } = props;

  const token = authService.getToken();

  return (
    <div>
      <div className={classes.drawerPaper}>
        <Drawer anchor="left" variant="permanent" open>
          <IconButton onClick={handle}>
            <ListIcon style={{ transform: "scale(3)", color: colors.decoration }}/>
          </IconButton>
          <List className={classes.list}>
            {routes.map(route => {
              const { show } = route;
              return (
                <div key={shortid.generate()}>
                  {show === "always" ||
                  (token && show === "loggedIn") ||
                  (!token && show === "loggedOut") ? (
                    <NavLink to={route.path} className={classes.item}>
                      <ListItem button className={classes.itemLink}>
                        <ListItemText primary={route.name} />
                      </ListItem>
                    </NavLink>
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </List>
        </Drawer>
      </div>
    </div>
  );
};

export default withStyles(sidebarStyle)(Sidebar);
