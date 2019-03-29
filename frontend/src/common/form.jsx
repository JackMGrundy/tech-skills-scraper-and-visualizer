import React, { Component } from "react";
import Input from "../components/input.jsx";
import validateService from "../services/validateService";
// import keyService from "../services/keyService";

class Form extends Component {
  state = { data: {}, errors: {} };

  // Common functions to run for forms in the ComponentDidMount method
  onMount = () => {
    // Clear errors on escape key
    document.addEventListener("keydown", this.clearErrorsOnEscape, false);
  };

  clearErrorsOnEscape = (event, state) => {
    if (event.keyCode === 27) {
      state["errors"] = {};
    }
    return state;
  };

  unMount = () => {
    document.removeEventListener("keydown", this.clearErrorsOnEscape, false);
  }

  handleChange = e => {
    const { name, value } = e.currentTarget;
    const errors = { ...this.state.errors };
    const fieldSchema = { [name]: this.schema[name] };
    const errorMessage = validateService.validateProperty(
      name,
      value,
      fieldSchema
    );
    if (errorMessage) {
      errors[name] = errorMessage;
    } else delete errors[name];
    const temp = this.state.data;
    temp[name] = value;
    this.setState({ data: temp, errors: errors });
  };

  validateState = e => {
    // e.preventDefault();

    // Validate
    let errors = null;
    if (this.relationshipSchema) {
      errors = validateService.validateState(
        this.state.data,
        this.relationshipSchema
      );
    }
    if (errors === null) {
      errors = validateService.validateState(this.state.data, this.schema);
    }
    this.setState({ errors: errors || {} });
  };

  handleSubmit = e => {
    this.validateState();

    // Form specific submit details. Contained in child class
    this.doSubmit();
  };

  renderInput(name, label, type = "text") {
    const { errors } = this.state;

    return (
      <Input
        type={type}
        name={name}
        label={label}
        onChange={this.handleChange}
        error={errors[name]}
      />
    );
  }

  renderSubmitButton(label, classes) {
    return (
      <button onClick={this.handleSubmit} className={classes}>
        {label}
      </button>
    );
  }
}
export default Form;
