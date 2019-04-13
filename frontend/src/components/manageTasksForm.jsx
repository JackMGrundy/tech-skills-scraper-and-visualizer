import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import tasksColumns from "./tables/tasksTable.js";
import DataTable from "./tables/dataTable.jsx";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    height: "100%",
    width: "100%"
  },
  card: {
    minWidth: 450,
    marginBottom: 12
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
});

class ManageTasksForm extends Component {
  onRowClick = params => {
    const { _id, active } = params.rowData;
    this.props.updateStatus(_id, active);
  };

  render() {
    const { tasks } = this.props;

    let data = [];
    tasks.forEach(task => {
      let temp = {
        ...task,
        taskName: task.taskName,
        searchTerm: task.jobTitle,
        targetCities: task.selectedCities.join(", "),
        creationDate: task.created,
        lastScraped: task.lastScraped,
        numScrapes: "" + task.totalScrapes,
        numPosts: "" + task.totalJobsScraped,
        status: task.active ? "Scraping" : "Stopped",
        controlButton: "Start/stop"
      };
      data.push(temp);
    });

    return (
      <div>
        <DataTable
          data={data}
          columns={tasksColumns}
          height={201}
          onRowClick={this.onRowClick}
          header="Tasks"
          footer="Click to start or stop scraping"
        />
      </div>
    );
  }
}

export default withStyles(styles)(ManageTasksForm);
