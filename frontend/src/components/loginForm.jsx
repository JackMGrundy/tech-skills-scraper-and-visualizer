import React from "react";
import { toast } from "react-toastify";
import { Redirect } from "react-router-dom";
import config from "../config.json";
import Form from "../common/form.jsx";
import authService from "../services/authService";
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

  componentWillUnmount(){
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
      if (ex.response && ex.response.status===400) {
        toast.error(ex.response.data, config.toastSettings);
      }
    }
  };

  render() {
    if (authService.getToken()) return <Redirect to="/" />
    return (
      <React.Fragment>
        <h1 className="mt-4">Login</h1>
        {this.renderInput("username", "Username")}
        {this.renderInput("password", "Password")}
        {this.renderSubmitButton("Submit", "btn-lg btn-primary mt-1")}
      </React.Fragment>
    );
  }
}

export default LoginForm;
