import React, { Component } from "react";
import http from "../services/httpService";
import config from "../config.json";
import { toast } from "react-toastify";
import AliasedInput from "./aliasedInput.jsx";
import SkillsGrid from "./skillsGrid";
const shortid = require("shortid");

class ScraperForm extends Component {
  state = {
    jobName: "",
    jobAliases: [],
    skills: {},
    errors: {}
  };

  componentDidMount() {}

  handlePost = async e => {
    console.log("handle post triggered");
    e.preventDefault();

    const originalJob = this.state.job;

    try {
      await http.post(
        config.scraperServerAPIEndpoint + "/api/scraper",
        this.state.job
      );
    } catch (ex) {
      toast.error("conection error TODO: fix this message");
      this.setState({ job: originalJob });
    }
  };

  handleJobAliasChange = ({ currentTarget: input }) => {
    this.setState({ jobAliases: input.value.split(",") });
  };

  handleTitleChange = ({ currentTarget: input }) => {
    this.setState({ jobName: input.value });
  };

  handleSkillTitleChange = ({ currentTarget: input }) => {
    let skills = { ...this.state.skills };
    skills[input.name].title = input.value;
    this.setState({ skills });
  };

  handleSkillAliasChange = ({ currentTarget: input }) => {
    let skills = { ...this.state.skills };
    let aliases = input.value.split(",");
    skills[input.name].aliases = aliases;
    this.setState({ skills });
  };

  handleDelete = id => {
    const skills = { ...this.state.skills };
    delete skills[id];
    this.setState({ skills });
  };

  handleClear = id => {
    const skills = { ...this.state.skills };
    skills[id].title = "";
    skills[id].aliases = [];
    this.setState({ skills });
  };

  handleCreate = () => {
    const id = shortid.generate();
    let skills = { ...this.state.skills };
    skills[id] = { title: "", aliases: [] };
    this.setState({ skills });
  };

  render() {
    const { jobName, jobAliases, skills } = this.state;

    return (
      <div>
        <h3 className="mt-5">Job title</h3>
        <AliasedInput
          titleLabel="Job title"
          name="job-title"
          title={jobName}
          aliases={jobAliases}
          handleTitleChange={this.handleTitleChange}
          handleAliasChange={this.handleJobAliasChange}
        />
        <div>
          <h3 className="mt-5">Skills</h3>
          <SkillsGrid
            skills={skills}
            handleSkillTitleChange={this.handleSkillTitleChange}
            handleSkillAliasChange={this.handleSkillAliasChange}
            handleDelete={this.handleDelete}
            handleClear={this.handleClear}
            numCols={3}
          />
          <button
            onClick={this.handleCreate}
            className="btn-lg btn-success mt-3"
          >
            +
          </button>
        </div>
      </div>
    );
  }
}

export default ScraperForm;
