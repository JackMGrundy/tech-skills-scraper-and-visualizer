import React, { Component } from "react";
import Input from "./input.jsx";

const InputList = ({
  inputs,
  handleChange,
  handleDelete,
  handleCreate,
  handleClear,
  label
}) => {
  return (
    <div>
      {Object.keys(inputs).map(key => (
        <React.Fragment key={"rf" + key}>
          <Input
            key={key}
            label={
              typeof label == "undefined"
                ? ""
                : label + " " + (1 + parseInt(key))
            }
            name={key}
            value={inputs[key]}
            onChange={handleChange}
            sizeClass={"form-control-sm ml-5"}
          />
          <button
            onClick={() => handleDelete(key)}
            className="btn-sm btn-danger mt-0 ml-5"
          >
            -
          </button>
        </React.Fragment>
      ))}
      <div />
      <button onClick={handleCreate} className="btn-sm btn-success mt-3">
        +
      </button>
      <button onClick={handleClear} className="btn-sm btn-warning mt-3 ml-2">
        Clear
      </button>
    </div>
  );
};

export default InputList;
