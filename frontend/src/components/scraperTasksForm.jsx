import React, { Component } from "react";
import config from "../config.json";
import { toast } from "react-toastify";
import httpService from "../services/httpService.js";
import authService from "../services/authService.js";
import { retrieveScraperTasksAPIEndpoint } from "../config.json";
// import { slide as Menu } from "react-burger-menu";

class ScraperTasksForm extends Component {
  state = {};

  componentDidMount = () => {
    try {
      const username = authService.getUsername();
      const data = { username: username };
      const payload = JSON.stringify(data);
      let tasks = {};
      //   Block while getting data
      httpService
        .post(retrieveScraperTasksAPIEndpoint, {
          payload
        })
        .then(response => {
          console.log("response: ", response.data);
          tasks = response.data;
          // console.log(this.state);
          this.setState(response.data);
        });
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        toast.error(ex.response.data, config.toastSettings);
      }
    }
  };

  render() {
    console.log("This.state: ", this.state);
    return (
      <React.Fragment>
        <h1 className="mt-3">Your tasks</h1>
        <div id="outer-container">
          <Menu isOpen={true}>
            <button>ayo</button>
            <button>ayo</button>
            <button>ayo</button>
            {/* <a id="home" className="menu-item" href="/home">
            Home
          </a>
          <a id="about" className="menu-item" href="/about">
            About
          </a>
          <a id="contact" className="menu-item" href="/contact">
            Contact
          </a>
          <a onClick={this.showSettings} className="menu-item--small" href="">
            Settings
          </a> */}
          </Menu>
        </div>
      </React.Fragment>
    );
  }
}

export default ScraperTasksForm;
