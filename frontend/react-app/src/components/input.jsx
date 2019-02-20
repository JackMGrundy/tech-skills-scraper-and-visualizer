import React, { Component } from "react";

const Input = ({ name, label, value, onChange, sizeClass }) => {
  return (
    <div className="form-group">
      <label className="ml-5 mt-4" htmlFor={name}>
        {label}
      </label>
      <input
        autoComplete="off"
        value={value}
        onChange={onChange}
        id={name}
        type="text"
        className={"form-control " + sizeClass}
      />
    </div>
  );
};

export default Input;
