import React from "react";
import { toast } from "react-toastify";
import { Redirect } from "react-router-dom";
import config from "../config.json";
import Form from "../common/form.jsx";
import authService from "../services/authService";

import colors from "../style/colors";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import PolymerIcon from "@material-ui/icons/Polymer";

const Joi = require("joi");

class LoginForm extends Form {
  state = {
    data: {
      username: "",
      password: ""
    },
    errors: {}
  };

  componentDidMount() {
    this.onMount();
  }

  componentWillUnmount() {
    this.unMount();
  }

  schema = {
    username: Joi.string()
      .required()
      .label("Username"),
    password: Joi.string()
      .required()
      .label("Password")
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      const res = await authService.login(data.username, data.password);
      const { token } = res.data;
      authService.setToken(token);
      window.location = "/";
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        toast.error(ex.response.data, config.toastSettings);
      }
    }
  };

  render() {
    if (authService.getToken()) return <Redirect to="/" />;
    return (
      <React.Fragment>
        <br />
        <Card>
          <CardContent>
            <PolymerIcon
              style={{
                transform: "scale(3)",
                // color: "#43a047",
                color: colors.primary,
                float: "left",
                // width: "200px",
                width: "100%",
                height: "75px",
                // height: "100%",
                // background: "#8e8e8e",
                background: colors.background
              }}
            />
            <h2
              className="mb-5"
              style={{
                position: "relative",
                top: "18px",
                left: "10px",
                color: "white"
              }}
            >
              Login
            </h2>
            {this.renderInput("username", "Username")}
            {this.renderInput("password", "Password", "password")}
            {this.renderSubmitButton("Submit", "btn-lg btn-primary mt-1")}
          </CardContent>
        </Card>
      </React.Fragment>
    );
  }
}

export default LoginForm;
