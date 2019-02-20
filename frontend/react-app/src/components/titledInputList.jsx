import React, { Component } from "react";
import InputList from "./inputList.jsx";
import Input from "./input.jsx";

class TitledInputList extends Component {
  state = {
    titleLable: "",
    title: "",
    inputs: {},
    inputListLabel: "Alias"
  };

  componentDidMount() {}

  handleTitleChange = ({ currentTarget: input }) => {
    this.setState({ title: input.value });
  };

  handleChange = ({ currentTarget: input }) => {
    const inputs = { ...this.state.inputs };
    inputs[input.id] = input.value;
    this.setState({ inputs });
  };

  handleDelete = key => {
    const inputs = { ...this.state.inputs };
    delete inputs[key];
    let updatedInputs = {};
    Object.values(inputs).forEach(function(value, i) {
      updatedInputs[i] = value;
    });
    this.setState({ inputs: updatedInputs });
  };

  handleCreate = () => {
    const inputs = { ...this.state.inputs };
    inputs[Object.keys(inputs).length] = "";
    this.setState({ inputs });
  };

  handleClear = () => {
    const inputs = {}
    this.setState({ inputs });
  }

  render() {
    return (
      <div>
        <Input
          name="title"
          label={this.state.titleLable}
          value={this.state.title}
          onChange={this.handleTitleChange}
          sizeClass={"form-control-lg"}
        />
          <h5>{this.state.inputListLabel}</h5>
        <InputList
          inputs={this.state.inputs}
          label={this.state.inputListLabel}
          handleChange={this.handleChange}
          handleDelete={this.handleDelete}
          handleCreate={this.handleCreate}
          handleClear={this.handleClear}
        />
      </div>
    );
  }
}

export default TitledInputList;