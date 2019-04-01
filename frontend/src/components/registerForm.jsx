import React from "react";
import { toast } from "react-toastify";
import Form from "../common/form.jsx";
import authService from "../services/authService";
import config from "../config.json";
const Joi = require("joi");

class RegistrationForm extends Form {
  state = {
    data: { username: "", password: "", confirmPassword: "" },
    errors: {}
  };

  componentDidMount() {
    this.onMount();
  }

  componentWillUnmount(){
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
      const {username, password} = this.state.data;
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
        <h1 className="mt-4">Register</h1>
        {this.renderInput("username", "Username")}
        {this.renderInput("password", "Password")}
        {this.renderInput("confirmPassword", "Confirm Password")}
        {this.renderSubmitButton("Submit", "btn-lg btn-primary mt-1")}
      </React.Fragment>
    );
  }
}

export default RegistrationForm;
