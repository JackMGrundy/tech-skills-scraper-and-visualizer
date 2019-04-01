import React, { Component } from "react";

class ScraperTasksForm extends Component {
  state = {
    tasks: {}
  };

  componentDidMount = () => {};

  componentWillUnmount = () => {};

  render() {
    const { tasks, changeTask, deleteTask } = this.props;
    return (
      <React.Fragment>
        {Object.keys(tasks).map(key => {
          return (
            <React.Fragment key={"Fragment-" + key}>
              <div className="input-group-prepend mr-5" key={key}>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteTask(key)}
                >
                  -
                </button>
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
        <button className="btn btn-primary" onClick={() => changeTask(-1)}>
          Create new task
        </button>
      </React.Fragment>
    );
  }
}

// <div className="input-group-prepend" key={shortid.generate()}>
// <button
//   onClick={() => {
//     this.handleDelete(val);
//   }}
//   className="btn-sm btn-danger"
//   type="button"
// >
//   -
// </button>
// <span
//   aria-describedby="inputGroup-sizing-sm"
//   className="list-group-item"
// >
//   {val}
// </span>
// </div>

export default ScraperTasksForm;
