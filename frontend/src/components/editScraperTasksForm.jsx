import React, { Component } from "react";
import config from "../config.json";
import { toast } from "react-toastify";
import SkillsGrid from "./skillsGrid";
import InputList from "./inputList.jsx";
import Input from "./input.jsx";
import ScraperTasksForm from "./scraperTasksForm.jsx";
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
    active: true,
    tasks: {},
    createOrEdit: "create",
    currentTask: "",
    taskNames: []
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
    errors: Joi.object(),
    tasks: Joi.any(),
    createOrEdit: Joi.any(),
    currentTask: Joi.any(),
    taskNames: Joi.any()
  };

  componentDidMount() {
    // Clear errors on escape key
    document.addEventListener("keydown", this.clearErrorsOnEscape, false);

    // Get users tasks
    this.retrieveTasks();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.clearErrorsOnEscape, false);
  }

  clearErrorsOnEscape = event => {
    const state = this.state;
    if (event.keyCode === 27) {
      state["errors"] = {};
    }
    this.setState(state);
  };

  retrieveTasks = () => {
    try {
      const username = authService.getUsername();
      const data = { username: username };
      const payload = JSON.stringify(data);
      //   Block while getting data
      httpService
        .post(config.retrieveScraperTasksAPIEndpoint, {
          payload
        })
        .then(response => {
          let taskNames = [];
          Object.keys(response.data).map(key => {
            taskNames.push(response.data[key]["taskName"]);
          });
          this.setState({ tasks: response.data, taskNames: taskNames });
        });
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        toast.error(ex.response.data, config.toastSettings);
      }
    }
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
    console.log("Failed to validate payload: ", errors);
    if (errors) return;

    // No duplicate task names
    // If
    console.log(
      this.state.currentTask,
      this.state.taskName,
      this.state.taskNames
    );
    if (
      this.state.currentTask !== this.state.taskName &&
      this.state.taskNames.includes(this.state.taskName)
    ) {
      toast.error("Duplicate task names are not allowed", config.toastSettings);
      return;
    }

    // Prepare payload
    let payload = this.preparePayload();
    console.log("payload: ", payload);

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
    this.retrieveTasks();
    this.setState({
      taskName: "",
      jobTitle: "",
      jobAliases: "",
      skills: {},
      aliases: {},
      active: true,
      createOrEdit: "create",
      currentTask: ""
    });
  };

  // Functionality
  handleChange = (e, id = null) => {
    const { name, value } = e.currentTarget;

    // Validate
    const errors = { ...this.state.errors };
    const fieldSchema = { [name]: this.schema[name] };
    console.log("fieldSchema: ", fieldSchema);
    const errorMessage = validateService.validateProperty(
      name,
      value,
      fieldSchema
    );
    console.log("errors on change: ", errorMessage);
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

  handleClearSkills = () => {
    this.setState({
      skills: {},
      aliases: {}
    });
  };

  handleDeleteTask = key => {
    console.log("Attempting to delete task")
    console.log(key);

    // Delete from backend
    try {
      const username = authService.getUsername();
      const data = { username: username, taskName: this.state.taskName };
      const payload = JSON.stringify(data);
      //   Block while getting data
      httpService
        .delete(config.deleteScraperServerAPIEndpoint, {
          payload
        })
        .then(response => {
          console.log("Response: ", response);
        });
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        toast.error(ex.response.data, config.toastSettings);
      }
    }

    const tasks = this.state.tasks;
    delete tasks[key];
    this.setState({ tasks });
  };
  

  loadTaskInfo = key => {
    if (key === -1) {
      this.setState({
        taskName: "",
        jobTitle: "",
        jobAliases: "",
        skills: {},
        aliases: {},
        active: true,
        createOrEdit: "create",
        currentTask: ""
      });
      return;
    }

    const { jobTitle, jobAliases, taskName, skills, active } = this.state.tasks[
      key
    ];

    let activeSkill = {};
    let activeAlias = {};
    Object.keys(skills).map(key => {
      let id = shortid.generate();
      let nextSkill = skills[key][0];
      let nextAlias = "";
      if (skills[key].length > 1) {
        nextAlias = skills[key].slice(1, skills[key].length);
        nextAlias = nextAlias.join(",");
      }

      activeSkill[id] = nextSkill;
      activeAlias[id] = nextAlias;
    });

    this.setState({
      taskName: taskName,
      jobTitle: jobTitle,
      active: active,
      skills: activeSkill,
      aliases: activeAlias,
      createOrEdit: "edit",
      currentTask: taskName
    });
  };

  render() {
    const {
      errors,
      taskName,
      jobTitle,
      jobAliases,
      skills,
      aliases,
      tasks,
      createOrEdit,
      currentTask
    } = this.state;
    const helperFunctions = {
      handleChange: this.handleChange,
      handleDeleteComponent: this.handleDeleteSkill
    };

    return (
      <div>
        <div className="container">
          <div className="row">
            <div className="col-">
              <h3 className="mt-5">Your tasks</h3>

              <ScraperTasksForm
                tasks={tasks}
                changeTask={this.loadTaskInfo}
                deleteTask={this.handleDeleteTask}
              />
            </div>

            <div className="col-sm">
              <h3 className="mt-5">
                {createOrEdit === "edit" ? "Edit" : "Create"} task
                {createOrEdit === "edit" ? ": " + currentTask : ""}
              </h3>
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
                <label
                  className="form-check-label mt-3"
                  htmlFor="exampleRadios1"
                >
                  Set scraping status to active
                </label>
              </div>

              <div>
                <h3 className="mt-5">Skills</h3>
                <button
                  onClick={this.handleCreateSkill}
                  className="btn btn-success mt-1 menu"
                >
                  Add skill
                </button>{" "}
                <button
                  onClick={this.handleClearSkills}
                  className="btn btn-warning mt-1 menu"
                >
                  Clear skills
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
              <button
                onClick={this.handleSubmit}
                className="btn-lg btn-primary mt-5 mb-5"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ScraperForm;
