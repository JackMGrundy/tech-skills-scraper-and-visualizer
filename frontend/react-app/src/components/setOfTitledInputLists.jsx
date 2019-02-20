import React, { Component } from "react";
import TitledInputList from "./titledInputList.jsx";

class SetOfTitledInputLists extends Component {
  state = {
    lists: {
      0: {
        titleLable: "",
        title: "",
        inputs: {
          0: "ay",
          1: "hmmm"
        },
        inputListLabel: "Alias"
      }
    }
  };

  handleTitleChange = ({ key: key, currentTarget: input }) => {
    const lists = { ...this.state.lists };
    lists[this.handleChange.index].title = input.value;
    this.setState({ lists });
  };

  handleChange = ({ currentTarget: input }) => {
    const lists = { ...this.state.lists };
    lists[this.handleChange.index].inputs[input.id] = input.value;
    this.setState({ lists });
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
    const inputs = {};
    this.setState({ inputs });
  };

  render() {
    return (
      <div>
        {Object.keys(this.state.lists).map(key => (
          <TitledInputList
            key={key}
            index={key}
            titleLable={this.state.lists[0].titleLable}
            title={this.state.lists[0].title}
            handleTitleChange={key => this.handleTitleChange(key)}
            inputs={this.state.lists[0].inputs}
            inputListLabel={this.state.lists[0].inputListLabel}
            handleChange={this.handleChange}
            handleCreate={this.handleCreate}
            handleDelete={this.handleDelete}
            handleClear={this.handleClear}
          />
        ))}
      </div>
    );
  }
}

export default SetOfTitledInputLists;
