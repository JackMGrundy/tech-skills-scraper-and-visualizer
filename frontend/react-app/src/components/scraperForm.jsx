import React, { Component } from "react";
import http from "../services/httpService";
import config from "../config.json";
import { toast } from "react-toastify";
import SkillsGrid from "./skillsGrid";
import InputList from "./inputList.jsx";
import Input from "./input.jsx";
const shortid = require("shortid");

class ScraperForm extends Component {
  state = {
    jobName: "",
    jobAliases: "",
    skills: {},
    aliases: {}
  };

  // handlePost = async e => {
  //   console.log("handle post triggered");
  //   e.preventDefault();

  //   const originalJob = this.state.job;

  //   try {
  //     await http.post(
  //       config.scraperServerAPIEndpoint + "/api/scraper",
  //       this.state.job
  //     );
  //   } catch (ex) {
  //     toast.error("conection error TODO: fix this message");
  //     this.setState({ job: originalJob });
  //   }
  // };


  handleChange = (e, id = null) => {
    const { name, value } = e.currentTarget;

    // console.log("name ", name, " value ", value, " id ", id);
    if (id === null) {
      // console.log("updating based on just name")
      this.setState({ [name]: value });
    } else {
      // console.log("updating based on name and id");
      let temp = this.state[name];
      temp[id] = value;
      this.setState({ [name]: temp });
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

  handleDeleteSkill = (id) => {
    let skills = { ...this.state.skills };
    let aliases = { ...this.state.aliases };
    delete skills[id];
    delete aliases[id];
    this.setState({ skills: skills, aliases: aliases });
  }

  render() {
    const { jobName, jobAliases, skills, aliases } = this.state;
    const helperFunctions = {
      handleChange: this.handleChange,
      handleDeleteComponent: this.handleDeleteSkill
    };

    return (
      <div>
        <h3 className="mt-5">Job title</h3>
        <Input
          label="Job title"
          name="jobName"
          value={jobName}
          onChange={e => this.handleChange(e)}
          margin=""
          size={"form-control-lg"}
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
          />
          <button
            onClick={this.handleCreateSkill}
            className="btn-lg btn-success mt-5"
          >
            +
          </button>{" "}
        </div>
      </div>
    );
  }
}

export default ScraperForm;
