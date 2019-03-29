import React, { Component } from "react";
import config from "../config.json";
import { toast } from "react-toastify";
import SkillsGrid from "./skillsGrid";
import InputList from "./inputList.jsx";
import Input from "./input.jsx";
import httpService from "../services/httpService";
import authService from "../services/authService";
import validateService from "../services/validateService";
// import keyService from "../services/keyService";
const shortid = require("shortid");
const Joi = require("joi");

class ScraperForm extends Component {
  state = {
    taskName: "",
    jobTitle: "",
    jobAliases: "",
    skills: {},
    aliases: {},
    errors: {},
    active: true
  };

  schema = {
    taskName: Joi.string()
      .required()
      .label("Task title"),
    jobTitle: Joi.string()
      .required()
      .label("Job title"),
    jobAliases: Joi.any().label("Job aliases"),
    skills: Joi.any().label("Skills"),
    aliases: Joi.object().label("Aliases"),
    active: Joi.bool(),
    errors: Joi.object()
  };

  componentDidMount() {
    // Clear errors on escape key
    document.addEventListener("keydown", this.clearErrorsOnEscape, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.clearErrorsOnEscape, false);
  }

  clearErrorsOnEscape = (event) => {
    const state = this.state;
    if (event.keyCode === 27) {
      state["errors"] = {};
    }
    this.setState(state)
  };

  // Format state into payload for backend
  preparePayload = () => {
    let params = {};
    params["jobTitle"] = this.state.jobTitle ? this.state.jobTitle : "";
    params["taskName"] = this.state.taskName ? this.state.taskName : "";
    params["jobAliases"] = this.state.jobAliases
      ? this.state.jobAliases.split(",")
      : "";
    params["skills"] = [];

    Object.keys(this.state.skills).forEach(key => {
      var temp = [this.state.skills[key]];
      if (
        this.state.aliases[key].length > 0 &&
        this.state.aliases[key] !== ""
      ) {
        temp = temp.concat(this.state.aliases[key].split(","));
      }
      params["skills"].push(temp);
    });

    // By default, scraper will start collecting data for this task
    params["active"] = this.state.active;

    // Set the username
    params["username"] = authService.getUsername();

    return JSON.stringify(params);
  };

  // Submit new scraper task to backend
  handleSubmit = async e => {
    e.preventDefault();

    // Validate
    const errors = validateService.validateState(this.state, this.schema);
    this.setState({ errors: errors || {} });
    if (errors) return;

    // Prepare payload
    let payload = this.preparePayload();

    // Attempt to submit new scraper task
    try {
      await httpService
        .post(config.scraperServerAPIEndpoint, {
          payload
        })
        .then(function(response) {
          // handle success
          toast.success(response.data, config.toastSettings);
        });
    } catch (ex) {
      let status = ex.response.status;
      if (status >= 400 && status < 500) {
        toast.error(ex.response.data, config.toastSettings);
      }
      if (status === 200) {
        toast.error("Connection error", config.toastSettings);
      }
    }
  };

  // Functionality
  handleChange = (e, id = null) => {
    const { name, value } = e.currentTarget;

    // Validate
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

    // Changing a piece of state that is a string or a number
    if (id === null) {
      this.setState({ [name]: value, errors: errors });
    }
    // Changing a piece of state that is an element in an array
    else {
      let temp = this.state[name];
      temp[id] = value;
      this.setState({ [name]: temp, errors: errors });
    }
  };

  handleCreateSkill = () => {
    const id = shortid.generate();
    let skills = { ...this.state.skills };
    let aliases = { ...this.state.aliases };
    skills[id] = "";
    aliases[id] = "";
    this.setState({ skills: skills, aliases: aliases });
  };

  handleDeleteSkill = id => {
    let skills = { ...this.state.skills };
    let aliases = { ...this.state.aliases };
    delete skills[id];
    delete aliases[id];
    this.setState({ skills: skills, aliases: aliases });
  };

  handleCheckChange = () => {
    const newState = !this.state.active;
    this.setState({
      active: newState
    });
  };

  render() {
    const {
      errors,
      taskName,
      jobTitle,
      jobAliases,
      skills,
      aliases
    } = this.state;
    const helperFunctions = {
      handleChange: this.handleChange,
      handleDeleteComponent: this.handleDeleteSkill
    };

    return (
      <div>
        <h3 className="mt-5">Create new task</h3>
        <Input
          label="Task title"
          name="taskName"
          value={taskName}
          onChange={e => this.handleChange(e)}
          margin=""
          size={"form-control-lg"}
          error={errors.taskName}
        />
        <Input
          label="Job title"
          name="jobTitle"
          value={jobTitle}
          onChange={e => this.handleChange(e)}
          margin=""
          size={"form-control-lg"}
          error={errors.jobTitle}
        />
        <InputList
          values={jobAliases}
          name="jobAliases"
          id={null}
          helperFunctions={helperFunctions}
        />
        <div className="form-check">
          <input
            className="form-check-input mt-4"
            type="checkbox"
            name="form-check-input"
            id="inlineCheckbox1"
            checked={this.state.active}
            onChange={this.handleCheckChange}
          />
          <label className="form-check-label mt-3" htmlFor="exampleRadios1">
            Set scraping status to active
          </label>
        </div>

        <div>
          <h3 className="mt-5">Skills</h3>
          <button
            onClick={this.handleCreateSkill}
            className="btn-lg btn-success mt-1"
          >
            Add skill
          </button>{" "}
          <SkillsGrid
            skills={skills}
            aliases={aliases}
            skillsName="skills"
            aliasesName="aliases"
            helperFunctions={helperFunctions}
            numCols={3}
            error={errors.skills}
          />
        </div>
        <button onClick={this.handleSubmit} className="btn-lg btn-primary mt-5">
          Submit
        </button>
      </div>
    );
  }
}

export default ScraperForm;
