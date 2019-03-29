import React from "react";
import { Route, Redirect } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ path, component: Component, render, ...rest }) => {
  return (
    <Route
      path={path}
      {...rest}
      render={props => {
        if (!authService.getToken()) return <Redirect to="/login" />;
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

export default ProtectedRoute;
