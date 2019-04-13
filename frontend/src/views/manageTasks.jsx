import React, { Component } from "react";
import config from "../config.json";
import "../App.css";
import colors from "../style/colors";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Paper from "@material-ui/core/Paper";
import PolymerIcon from "@material-ui/icons/Polymer";

import { toast } from "react-toastify";
import SkillsGrid from "../components/skillsGrid";
import InputList from "../components/inputList.jsx";
import Input from "../components/input.jsx";
import ScraperTasksForm from "../components/scraperTasksForm.jsx";
import MultipleSelect from "../components/multiSelect.jsx";
import coordinatesList from "../components/charts/bigCities";
import httpService from "../services/httpService";
import validateService from "../services/validateService";

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
    currentTaskID: "",
    taskNames: [],
    cities: [],
    selectedCities: []
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
    taskNames: Joi.any(),
    currentTaskID: Joi.any(),
    cities: Joi.any(),
    selectedCities: Joi.any()
  };

  componentDidMount() {
    // Clear errors on escape key
    document.addEventListener("keydown", this.clearErrorsOnEscape, false);

    // Get users tasks
    this.retrieveTasks();

    // Retrieve available cities
    this.setState({ cities: coordinatesList });
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
      httpService.get(config.scrapertaskEndpoint + "/").then(response => {
        let taskNames = [];
        Object.keys(response.data).forEach(key => {
          taskNames.push(response.data[key].taskName);
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
    params.jobTitle = this.state.jobTitle ? this.state.jobTitle : "";
    params.taskName = this.state.taskName ? this.state.taskName : "";
    params.jobAliases = this.state.jobAliases
      ? this.state.jobAliases.split(",")
      : "";
    params.skills = [];

    Object.keys(this.state.skills).forEach(key => {
      var temp = [this.state.skills[key]];
      if (
        this.state.aliases[key].length > 0 &&
        this.state.aliases[key] !== ""
      ) {
        temp = temp.concat(this.state.aliases[key].split(","));
      }
      params.skills.push(temp);
    });

    // State if this is an edit or a create
    params.operation = this.state.createOrEdit;

    // Send mongo id of task
    params.id = this.state.currentTaskID;

    // By default, scraper will start collecting data for this task
    params.active = this.state.active;

    // Send list of cities to focus on
    let cityList = [];
    const { selectedCities } = this.state;
    if (selectedCities.length > 0)
      selectedCities.forEach(city => {
        cityList.push(city.value);
      });
    params.selectedCities = cityList;

    return JSON.stringify(params);
  };

  // Submit new scraper task to backend
  handleSubmit = async e => {
    e.preventDefault();

    // Validate
    const errors = validateService.validateState(this.state, this.schema);
    this.setState({ errors: errors || {} });
    if (errors) return;

    // No duplicate task names
    if (
      this.state.currentTask !== "" &&
      this.state.currentTask !== this.state.taskName &&
      this.state.taskNames.includes(this.state.taskName)
    ) {
      toast.error("Duplicate task names are not allowed", config.toastSettings);
      return;
    }

    // Prepare payload
    let payload = this.preparePayload();

    // Attempt to submit new scraper task
    try {
      await httpService
        .put(config.scrapertaskEndpoint, {
          payload
        })
        .then(function(response) {
          // handle success
          toast.success(response.data, config.toastSettings);
        });
    } catch (ex) {
      if (!ex.response) {
        return;
      }
      let status = ex.response.status;
      if (status >= 400 && status < 500) {
        toast.error(ex.response.data, config.toastSettings);
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
      currentTask: "",
      selectedCities: []
    });
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

  handleClearSkills = () => {
    this.setState({
      skills: {},
      aliases: {}
    });
  };

  handleDeleteTask = key => {
    const taskId = this.state.tasks[key]._id;

    // Delete from backend
    try {
      httpService
        .delete(config.scrapertaskEndpoint + "/" + taskId)
        .then(response => {
          toast.success(response.data, config.toastSettings);
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

  changeTask = key => {
    if (key === -1) {
      this.setState({
        taskName: "",
        jobTitle: "",
        jobAliases: "",
        skills: {},
        aliases: {},
        active: true,
        createOrEdit: "create",
        currentTask: "",
        currentTaskID: "",
        selectedCities: []
      });

      return;
    }

    const {
      jobTitle,
      taskName,
      skills,
      active,
      selectedCities,
      _id
    } = this.state.tasks[key];

    let activeSkill = {};
    let activeAlias = {};
    let cityList = [];
    selectedCities.forEach(city => {
      let temp = { value: city, label: city };
      cityList.push(temp);
    });
    Object.keys(skills).forEach(key => {
      let reactKey = shortid.generate();
      let nextSkill = skills[key][0];
      let nextAlias = "";
      if (skills[key].length > 1) {
        nextAlias = skills[key].slice(1, skills[key].length);
        nextAlias = nextAlias.join(",");
      }

      activeSkill[reactKey] = nextSkill;
      activeAlias[reactKey] = nextAlias;
    });

    this.setState({
      taskName: taskName,
      jobTitle: jobTitle,
      active: active,
      skills: activeSkill,
      aliases: activeAlias,
      createOrEdit: "edit",
      currentTask: taskName,
      selectedCities: cityList,
      currentTaskID: _id
    });
  };

  handleCitySelect = event => {
    let selectedCities = [];
    Object.keys(event).forEach(key => {
      selectedCities.push(event[key]);
    });
    this.setState({ selectedCities });
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
      currentTask,
      cities,
      selectedCities
    } = this.state;
    const helperFunctions = {
      handleChange: this.handleChange,
      handleDeleteComponent: this.handleDeleteSkill
    };

    const citySuggestions = cities.map(city => {
      return { value: city, label: city };
    });

    return (
      <div>
        <div className="container">
          <div className="row">
            <div className="col-">
              <br />
              <Card>
                <CardContent>
                  <h3 className="mt-3">Your tasks</h3>

                  <ScraperTasksForm
                    tasks={tasks}
                    changeTask={this.changeTask}
                    deleteTask={this.handleDeleteTask}
                  />
                  <button
                    className="btn btn-primary"
                    // className="btn-test"
                    onClick={() => this.changeTask(-1)}
                  >
                    New task
                  </button>
                </CardContent>
              </Card>
            </div>

            <div className="col-lg">
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
                    {createOrEdit === "edit" ? "Edit" : "Create"} task
                    {createOrEdit === "edit" ? ": " + currentTask : ""}
                  </h2>{" "}
                  {/* <h3 className="mt-3">
                    {createOrEdit === "edit" ? "Edit" : "Create"} task
                    {createOrEdit === "edit" ? ": " + currentTask : ""}
                  </h3> */}
                  <div>
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
                      label="Search term"
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
                    <br />
                  </div>
                </CardContent>
              </Card>
              <div>
                <br />
                <Card>
                  <CardContent>
                    <h3>Skills</h3>
                    <button
                      onClick={this.handleCreateSkill}
                      className="btn btn-success mt-1 menu"
                      tabIndex={-1}
                    >
                      Add skill
                    </button>{" "}
                    <button
                      onClick={this.handleClearSkills}
                      className="btn btn-warning mt-1 menu"
                      tabIndex={-1}
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
                    {Object.keys(aliases).length > 0 ? (
                      <div>
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                      </div>
                    ) : (
                      ""
                    )}
                  </CardContent>
                </Card>
              </div>
              <br />
              <Card>
                <CardContent>
                  <h3>Cities</h3>
                  <p>
                    If no cities are selected, the scraper will randomly search
                    for jobs across the United States
                  </p>
                  <MultipleSelect
                    suggestions={citySuggestions}
                    multi={selectedCities}
                    handleChange={this.handleCitySelect}
                    label="cities"
                    height={200}
                  />
                  <button
                    onClick={this.handleSubmit}
                    className="btn-lg btn-primary mb-5"
                  >
                    Submit
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ScraperForm;
