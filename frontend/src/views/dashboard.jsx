import React, { Component } from "react";
import config from "../config.json";
import { toast } from "react-toastify";

import colors from "../style/colors";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import ManageTaskFrom from "../components/manageTasksForm.jsx";
import DataTable from "../components/tables/dataTable.jsx";
import jobPostsColumns from "../components/tables/jobPostsTable";
import cityTableColumns from "../components/tables/cityTable";
import CustomeSelectOne from "../components/customSelectOne";
import MultipleSelect from "../components/multiSelect.jsx";
import ScraperTasksForm from "../components/scraperTasksForm.jsx";

import dataService from "../services/dataService.js";
import httpService from "../services/httpService";

import Map from "../components/charts/map.jsx";
import HeatMap from "../components/charts/heatMap.jsx";
import CustomLineChart from "../components/charts/customLineChart.jsx";
import CustomBarChart from "../components/charts/customBarChart.jsx";

class Dashboard extends Component {
  state = {
    tasks: [],
    taskNames: [],
    data: {},
    currentTask: {},
    open: false,
    tech: [],
    selectedTech: [],
    selectedMapTech: "",
    cities: [],
    selectedCities: [],
    currentTaskLocal: null,
    barOrLine: true
  };

  async componentDidMount() {
    let { tasks, taskNames } = await this.retrieveTasks();
    this.setState({ tasks: tasks, taskNames: taskNames });
  }

  retrieveTaskData = async (taskId, localKey) => {
    if (!localKey || !taskId) return null;
    let res = {};
    try {
      await httpService
        .get(config.dataEndpoint + "/" + taskId)
        .then(response => {
          let tasks = this.state.tasks;
          // Get list of skills for this task
          let tech = [];
          tasks[localKey].skills.forEach(ele => tech.push(ele[0]));
          tech.sort().reverse();

          let selectedTech = [];
          tech.forEach(t => {
            let temp = { value: t, label: t };
            selectedTech.push(temp);
          });

          const cities = dataService.uniqueCities(response.data).sort();

          res = {
            data: response.data,
            currentTask: tasks[localKey],
            tech: tech,
            selectedTech: selectedTech,
            cities: cities,
            currentTaskLocal: localKey
          };
        });
      return res;
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        toast.error(ex.response.data, config.toastSettings);
      }
      return ex.response.data;
    }
  };

  retrieveTasks = async function() {
    try {
      let res = {};
      await httpService.get(config.scrapertaskEndpoint + "/").then(response => {
        let taskNames = [];
        Object.keys(response.data).forEach(key =>
          taskNames.push(response.data[key].taskName)
        );
        res = { tasks: response.data, taskNames: taskNames };
      });
      return res;
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        toast.error(ex.response.data, config.toastSettings);
      }
      return ex.response.data;
    }
  };

  refresh = async () => {
    let res = {};
    let { tasks, taskNames } = await this.retrieveTasks();
    res = { tasks: tasks, taskNames: taskNames };
    let temp = await this.retrieveTaskData(
      this.state.currentTask._id,
      this.state.currentTaskLocal
    );
    if (temp) {
      res = { ...res, ...temp };
      temp = { ...temp };
    }

    toast.success("Success", config.toastSettings);
    this.setState(res);
  };

  changeTask = async key => {
    const id = this.state.tasks[key]._id;
    const res = await this.retrieveTaskData(id, key);
    this.setState(res);
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSelect = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleMultiSelect = event => {
    let selectedCities = [];
    Object.keys(event).forEach(key => selectedCities.push(event[key]));
    this.setState({ selectedCities });
  };

  handleTechSelect = event => {
    this.setState({ selectedTech: event });
  };

  handleDeleteTask = (id, key) => {
    // Delete from backend
    try {
      httpService
        .delete(config.scrapertaskEndpoint + "/" + id)
        .then(response => {
          toast.success(response.data, config.toastSettings);
        });
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        toast.error(ex.response.data, config.toastSettings);
      }
    }

    const tasks = this.state.tasks;
    let taskNames = this.state.taskNames;
    taskNames = taskNames.filter(function(val, index, arr) {
      return val !== tasks[key].taskName;
    });
    delete tasks[key];

    this.setState({
      tasks: tasks,
      taskNames: taskNames,
      data: {},
      currentTask: {},
      tech: [],
      selectedTech: {},
      selectedMapTech: "",
      cities: [],
      selectedCities: [],
      currentTaskLocal: null
    });
  };

  updateStatus = async (id, active) => {
    try {
      // Flip status
      const payload = { id: id, active: !active };
      await httpService
        .post(config.scrapertaskEndpoint + "/taskstatus", {
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
    let { tasks, taskNames } = await this.retrieveTasks();
    this.setState({ tasks: tasks, taskNames: taskNames });
  };

  // Open job post when a row is clicked
  onRowClick = params => {
    const { jobkey } = params.rowData;
    window.open(jobkey);
  };

  // onColumnClick = params => {
  //   console.log(params);
  // };

  toggleBarAndLine = () => {
    const { barOrLine } = this.state;
    this.setState({ barOrLine: !barOrLine });
  };

  render() {
    const {
      tasks,
      data,
      currentTask,
      selectedTech,
      selectedMapTech,
      taskNames,
      cities,
      selectedCities,
      tech,
      barOrLine
    } = this.state;

    // Format inputs to plug into functions to generate datasets
    let techList = [];
    if (selectedTech.length > 0)
      selectedTech.forEach(tech => techList.push(tech.value));

    let cityList = [];
    if (selectedCities.length > 0)
      selectedCities.forEach(city => cityList.push(city.value));

    // Generate all required data - this must be done here rather than when the data is retrieved
    // because the data sets depend on options selected by the user
    const mapData = dataService.mapData(data, selectedMapTech);
    const heatMapData = dataService.heatMapData(data, techList, cityList);
    const jobPostsTableData = dataService.jobPostsTableData(
      data,
      cityList,
      techList
    );
    const cityTableData = dataService.cityTableData(data, selectedMapTech);
    const lineData = dataService.lineData(
      data,
      currentTask,
      cityList,
      techList
    );
    const barData = dataService.barData(data, techList, cityList);

    // Prep suggestions for autocomplete fields
    const citySuggestions = cities.map(city => {
      return { value: city, label: city };
    });

    const techSuggestions = tech.map(tech => {
      return { value: tech, label: tech };
    });

    // Prep list of skills for map select box
    let skillList = [];
    if (Object.keys(currentTask).length !== 0) {
      currentTask.skills.forEach(skills => {
        skillList.push(skills[0]);
      });
    }

    return (
      <div className="mt-5">
        {/* <Card style={{ width: "100%" }}>
          <CardContent>
            <h1>Dashboard</h1>
          </CardContent>
        </Card>
        <br /> */}
        <ManageTaskFrom
          tasks={tasks}
          taskNames={taskNames}
          handleDeleteTask={this.handleDeleteTask}
          updateStatus={this.updateStatus}
        />
        <br />

        <div className="container">
          <div className="row">
            <div className="col- mr-5" style={{ width: 225 }}>
              <button
                className="btn btn-warning mb-3"
                // style={{color: colors.decoration}}
                onClick={this.refresh}
                style={{ width: "100%" }}
              >
                Refresh
              </button>
              <Card style={{ width: "100%" }}>
                <CardContent>
                  <ScraperTasksForm
                    tasks={tasks}
                    changeTask={this.changeTask}
                    deleteTask={null}
                    header={
                      tasks.length > 0
                        ? "Load Task"
                        : "You have not created any tasks"
                    }
                  />
                </CardContent>
              </Card>
              <br />
            </div>
            <div className="col" style={{ width: "100%", height: "100%" }}>
              <small>All cities are selected by default</small>
              <MultipleSelect
                suggestions={citySuggestions}
                multi={selectedCities}
                handleChange={this.handleMultiSelect}
                label="Cities"
                height={100}
              />
              <MultipleSelect
                suggestions={techSuggestions}
                multi={selectedTech}
                handleChange={this.handleTechSelect}
                label="Skills"
                height={100}
              />
              <br />
            </div>
          </div>
          <br />

          <div className="row">
            <div className="col" style={{ width: "100%", height: "100%" }}>
              <Card>
                <CardContent>
                  {barOrLine ? (
                    <CustomLineChart data={lineData} lines={techList} />
                  ) : (
                    <CustomBarChart data={barData} lines={techList} />
                  )}
                  {data.length > 0 ? (
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={this.toggleBarAndLine}
                    >
                      Toggle
                    </button>
                  ) : (
                    ""
                  )}
                </CardContent>
              </Card>
              <br />

              <Card>
                <CardContent>
                  <h3 className="ml-5 mt-5 mb-4">Skill groups</h3>
                  {techList ? (
                    <div>
                      <HeatMap
                        data={heatMapData}
                        selectedTech={techList}
                        background={colors.heatMap}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </CardContent>
              </Card>
              <br />

              <Card>
                <CardContent>
                  <div className="row">
                    <div
                      className="col"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <h3 className="ml-5 mt-5 mb-4">Skill geography</h3>
                      <Map data={mapData} maxSize={2.0} />
                    </div>
                    <div
                      className="col"
                      style={{ width: "100%", height: "100%" }}
                    >
                      {mapData.length > 0 ? (
                        <DataTable
                          data={cityTableData}
                          columns={cityTableColumns}
                          height={400}
                          onColumnClick={this.onColumnClick}
                          // header="Job posts by city"
                          // onRowClick={this.onRowClick}
                          // footer={
                          //   "Click a row to open the job post on Indeed.com"
                          // }
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <CustomeSelectOne
                    value={selectedMapTech}
                    handleSelect={this.handleSelect}
                    items={skillList}
                    header="Select Skill"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          <br />

          <div className="row">
            <div className="col" style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
        <br />
        <Card>
          <CardContent>
            <DataTable
              data={jobPostsTableData}
              columns={jobPostsColumns}
              height={600}
              header="Job posts"
              onRowClick={this.onRowClick}
              footer={"Click a row to open the job post on Indeed.com"}
            />
          </CardContent>
        </Card>
        <br />
        <br />
        <br />
      </div>
    );
  }
}

export default Dashboard;
