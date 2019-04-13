import React from "react";
import { toast } from "react-toastify";
import Form from "../common/form.jsx";
import authService from "../services/authService";
import config from "../config.json";

import colors from "../style/colors";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import PolymerIcon from "@material-ui/icons/Polymer";

const Joi = require("joi");

class RegistrationForm extends Form {
  state = {
    data: { username: "", password: "", confirmPassword: "" },
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
      .label("Password"),
    confirmPassword: Joi.string()
      .required()
      .label("Password")
  };

  // Schema that depends on multiple fields
  relationshipSchema = {
    username: Joi.string()
      .required()
      .label("Username"),
    password: Joi.string()
      .required()
      .label("password"),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .options({
        language: {
          any: {
            allowOnly: "!!Passwords do not match"
          }
        }
      })
      .label("Confirm Password")
  };

  doSubmit = async () => {
    // Attempt to submit new username and password
    try {
      const { username, password } = this.state.data;
      const res = await authService.registerUser(username, password);
      authService.setToken(res.data.token);
      window.location = "/";
    } catch (ex) {
      let status = ex.response.status;
      if (status === 400) {
        toast.error(ex.response.data, config.toastSettings);
      }
    }
  };

  render() {
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
              Register
            </h2>
            {this.renderInput("username", "Username")}
            {this.renderInput("password", "Password", "password")}
            {this.renderInput(
              "confirmPassword",
              "Confirm Password",
              "password"
            )}
            {this.renderSubmitButton("Submit", "btn-lg btn-primary mt-1")}
          </CardContent>
        </Card>
      </React.Fragment>
    );
  }
}

export default RegistrationForm;
