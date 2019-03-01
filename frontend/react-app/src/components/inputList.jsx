import React, { Component } from "react";
import Popup from "reactjs-popup";
const shortid = require("shortid");

class InputList extends Component {
  state = {
    newValue: "",
    name: "",
    id: ""
  };

  componentDidMount() {
    // const { id, name } = this.props;
    // this.setState({ name: name, id: id });
  }

  handleClear = () => {
    // const { name, id } = this.state;
    const { name, id, helperFunctions } = this.props;

    let obj = { currentTarget: { name: name, value: "" } };
    helperFunctions.handleChange(obj, id);
  };

  handleDelete = val => {
    const { name, id, values, helperFunctions } = this.props;

    let newValues = values.split(",");
    newValues = newValues.map(Function.prototype.call, String.prototype.trim);
    let index = newValues.indexOf(val.trim());
    if (index > -1) {
      newValues.splice(index, 1);
    }
    newValues = newValues.join(",");
    let obj = { currentTarget: { name: name, value: newValues } };
    helperFunctions.handleChange(obj, id);
  };

  handleChange = ({ currentTarget: input }) => {
    this.setState({ newValue: input.value });
  };

  handleCreate = e => {
    const { newValue } = this.state;
    const { name, id, values, helperFunctions } = this.props;
    let newValues =
      values == "" ? newValue.trim() : values + "," + newValue.trim();

    let obj = { currentTarget: { name: name, value: newValues } };
    helperFunctions.handleChange(obj, id);
    this.setState({ newValue: "" });
  };

  onKeyPress = event => {
    if (event.key === "Enter") {
      this.handleCreate();
    }
  };

  render() {
    const { values, id, helperFunctions } = this.props;
    const { newValue } = this.state;
    return (
      <div>
        <Popup
          trigger={
            <div>
              {/* <span>Aliases</span><h1></h1> */}
              <button
                onClick={this.handleClick}
                className="btn btn-primary menu"
              >
                Aliases
              </button>
              {id == null ? (
                ""
              ) : (
                <button
                  onClick={() => helperFunctions.handleDeleteComponent(id)}
                  className="btn btn-danger menu"
                >
                  Delete
                </button>
              )}
              <button
                onClick={this.handleClear}
                className="btn btn-warning"
                type="button"
              >
                Clear
              </button>
            </div>
          }
          position="bottom left"
          offsetX={0}
          offsetY={1}
          on="hover"
          closeOnDocumentClick
          mouseLeaveDelay={200}
          mouseEnterDelay={0}
          lockScroll={true}
          contentStyle={{ padding: "0px", border: "none" }}
          arrow={false}
        >
          <div className="menu aliases">
            {values.split(",").map(val => {
              if (val.trim() === "") {
                return null;
              }
              return (
                <div className="input-group-prepend" key={shortid.generate()}>
                  <button
                    onClick={() => {
                      this.handleDelete(val);
                    }}
                    className="btn-sm btn-danger"
                    type="button"
                  >
                    -
                  </button>
                  <span
                    aria-describedby="inputGroup-sizing-sm"
                    className="list-group-item list-group-item-primary"
                  >
                    {val}
                  </span>
                </div>
              );
            })}
            <div className="input-group mx-sm">
              <input
                type="text"
                className="form-control"
                placeholder="Input alias"
                value={newValue}
                onChange={this.handleChange}
                onKeyPress={this.onKeyPress}
              />
              <div className="input-group-append">
                <button
                  onClick={e => this.handleCreate(e)}
                  className="btn btn-success"
                  type="button"
                >
                  Add alias
                </button>
              </div>
            </div>
          </div>
        </Popup>
      </div>
    );
  }
}

export default InputList;
