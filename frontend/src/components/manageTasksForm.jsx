import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import tasksColumns from "./tables/tasksTable.js";
import DataTable from "./tables/dataTable.jsx";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import { ClipLoader } from "react-spinners";
import colors from '../style/colors';

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
    let scraping = false;
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

      if (task.active) scraping = true;
    });

    return (
      <div>
        <Card>
          <CardContent>
            <DataTable
              data={data}
              columns={tasksColumns}
              height={201}
              onRowClick={this.onRowClick}
              header="Tasks"
              // footer="Click to start or stop scraping"
            />
            <small>
              {data.length > 0 ? "Click to start or stop scraping" : ""}
            </small>
            {scraping ? (
              <div
                className="sweet-loading"
                style={{
                  float: "right"
                }}
              >
                <ClipLoader
                  sizeUnit={"px"}
                  size={25}
                  color={colors.decoration}
                  loading={true}
                />
              </div>
            ) : (
              ""
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(ManageTasksForm);
