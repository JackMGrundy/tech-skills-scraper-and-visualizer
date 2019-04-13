import React, { Component } from "react";

class ScraperTasksForm extends Component {
  state = {
    tasks: {}
  };

  componentDidMount = () => {};

  componentWillUnmount = () => {};

  render() {
    const { tasks, changeTask, deleteTask, header } = this.props;
    return (
      <React.Fragment>
        <h5>{header}</h5>
        {Object.keys(tasks).map(key => {
          return (
            <React.Fragment key={"Fragment-" + key}>
              <div className="input-group-prepend mr-5" key={key}>
                { deleteTask ? 
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteTask(key)}
                >
                  Delete
                </button>
                :
                ""
                }
                <button
                  className="btn btn-success btn-block btn-sm"
                  onClick={() => changeTask(key)}
                >
                  {tasks[key]["taskName"]}
                </button>
              </div>
              <br />
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }
}

export default ScraperTasksForm;
