import React, { Component } from "react";
import AliasedInput from "./aliasedInput";
const shortid = require("shortid");

class ListAliasedInputs extends Component {
  state = {
    inputs: {},
    errors: {}
  };

  componentDidMount() {
    const id = shortid.generate();
    const inputs = {
      id: { title: "", aliases: [] }
    };
    this.setState({ inputs });
  }

  handleTitleChange = ({ currentTarget: input }) => {
    let inputs = { ...this.state.inputs };
    inputs[input.name].title = input.value;
    this.setState({ inputs });
  };

  handleAliasChange = ({ currentTarget: input }) => {
    let inputs = { ...this.state.inputs };
    let aliases = input.value.split(",");
    // aliases = aliases.map(Function.prototype.call, String.prototype.trim);
    inputs[input.name].aliases = aliases;
    this.setState({ inputs });
    console.log(this.state.inputs);
  };

  handleCreate = () => {
    const id = shortid.generate();
    let inputs = { ...this.state.inputs };
    inputs[id] = { title: "", aliases: [] };
    this.setState({ inputs });
  };

  handleDelete = key => {
    const inputs = { ...this.state.inputs };
    delete inputs[key];
    this.setState({ inputs });
  };

  handleClear = key => {
    const inputs = { ...this.state.inputs };
    inputs[key].title = "";
    inputs[key].aliases = [];
    this.setState({ inputs });
  };

  render() {
    const { inputs } = this.state;

    return (
      <div>
        {Object.keys(inputs).map(key => (
          <div key={"div-" + key}>
            <AliasedInput
              key={key}
              name={key}
              title={inputs[key].title}
              aliases={inputs[key].aliases}
              handleTitleChange={this.handleTitleChange}
              handleAliasChange={this.handleAliasChange}
            />
            <button
              key={"btn-del" + key}
              onClick={() => {
                this.handleDelete(key);
              }}
              className="btn-sm btn-danger mt-0 ml-1"
            >
              -
            </button>
            <button
              key={"btn-clear-" + key}
              onClick={() => this.handleClear(key)}
              className="btn-sm btn-warning mt-3 ml-2"
            >
              Clear
            </button>
          </div>
        ))}
        <button onClick={this.handleCreate} className="btn-lg btn-success mt-3">
          +
        </button>
      </div>
    );
  }
}

export default ListAliasedInputs;
