import React, { Component } from "react";
import http from "../services/httpService";
import config from "../config.json";
import { toast } from "react-toastify";
import SkillsGrid from "./skillsGrid";
import InputList from "./inputList.jsx";
import Input from "./input.jsx";
// import Sidebar from "./sidebar.jsx";
const shortid = require("shortid");
const Joi = require("joi");

class ScraperForm extends Component {
  state = {
    jobTitle: "",
    jobAliases: "",
    skills: {},
    aliases: {},
    errors: {}
  };


    // Validation
  escFunction = (event) => {
    if(event.keyCode === 27) {
      this.setState({ errors: {} });
    }
  }
  componentDidMount(){
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.escFunction, false);
  }
  
  schema = {
    // Job title cannot be blank
    jobTitle: Joi.string()
      .required()
      .label("Job title"),
    jobAliases: Joi.any().label("Job aliases"),
    skills: Joi.object()
      .pattern(/^/, Joi.string())
      .label("Skills"),
    aliases: Joi.object()
      .pattern(/^/, Joi.any())
      .label("Aliases"),
    errors: Joi.object()
  };

  fieldSchema = {
    jobTitle: Joi.string()
      .required()
      .label("Job title"),
    jobAliases: Joi.any().label("Job aliases"),
    skills: Joi.string().required().label("Skill"),
    aliases: Joi.any(),
    errors: Joi.object()
  };

  validate = () => {
    console.log("validating");
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state, this.schema, options);
    // console.log(error.details);
    // return(error);

    // const { error } = Joi.validate( {jobTitle: this.state.jobTitle}, this.schema, options);
    if (!error) return null;
    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    if (errors.hasOwnProperty("skills")) {
      errors["skills"] = "Skills cannot be blank"
    }
    return errors;
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.fieldSchema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };



  // Backend
  handleSubmit = async e => {
    console.log("handle post triggered");
    e.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    // const originalJob = this.state.job;

    try {
      await http.get(
        config.scraperServerAPIEndpoint,
        this.state.jobTitle
      ).then(function (response) {
        // handle success
        console.log(response);
        toast.success(response.data);
      });
      
    } catch (ex) {
      console.log(ex);
      toast.error("conection error");
      // this.setState({ job: originalJob });
    }
  };


  // Functionality
  handleChange = (e, id = null) => {
    const { name, value } = e.currentTarget;
    // console.log("value", value);

    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(e.currentTarget);
    if (errorMessage) {
      errors[name] = errorMessage;
      console.log("errorMessage", errorMessage, "e.currentTarget", e.currentTarget);
    } else delete errors[name];

    // console.log("current ids ", this.state.aliases);
    // console.log("Updating name ", name, " value ", value, " id ", id);
    if (id === null) {
      // console.log("updating based on just name")
      this.setState({ [name]: value, errors: errors });
    } else {
      // console.log("updating based on name and id");
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
    console.log("deleting id ", id);
    let skills = { ...this.state.skills };
    let aliases = { ...this.state.aliases };
    delete skills[id];
    delete aliases[id];
    this.setState({ skills: skills, aliases: aliases });
  };

  render() {
    const { errors, jobTitle, jobAliases, skills, aliases } = this.state;
    const helperFunctions = {
      handleChange: this.handleChange,
      handleDeleteComponent: this.handleDeleteSkill
    };

    return (
      <div>
        {/* <Sidebar></Sidebar> */}
        <h3 className="mt-5">Job title</h3>
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

        <div>
          <h3 className="mt-5">Skills</h3>
          <SkillsGrid
            skills={skills}
            aliases={aliases}
            skillsName="skills"
            aliasesName="aliases"
            helperFunctions={helperFunctions}
            numCols={3}
            error={errors.skills}
          />
          <button
            onClick={this.handleCreateSkill}
            className="btn-lg btn-success mt-5"
          >
            Add skill
          </button>{" "}
        </div>
        <button onClick={this.handleSubmit} className="btn-lg btn-primary mt-1">
          Submit
        </button>
      </div>
    );
  }
}

export default ScraperForm;
