import React, { Component } from "react";
import InputList from "./inputList.jsx";
import http from "../services/httpService";
import config from "../config.json";
import { toast } from "react-toastify";
import TitledInputList from "./titledInputList";

class ScraperForm extends Component {
  state = {
    job: { title: "", skill: "" },
    skills: {}
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
      toast.error("hmmm");
      this.setState({ job: originalJob });
    }
  };


  render() {
    const job = this.state;

    return (
      <div>
        <h3 className="mt-5">Job title</h3>
        <TitledInputList />
        <p></p>
        <p></p>

        <h3 className="mt-5">Skills</h3>
        <TitledInputList />
        <button onClick={this.handlePost} className="btn-lg btn-primary mt-5">
          Submit job
        </button>
      </div>
    );
  }
}

export default ScraperForm;
