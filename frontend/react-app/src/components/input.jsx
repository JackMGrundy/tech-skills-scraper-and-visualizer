import React, { Component } from "react";

const Input = ({ name, label, value, onChange, size, margin }) => {
  return (
    <div className="form-group">
      <label className={"mt-4 " + margin} htmlFor={name}>
        {label}
      </label>
      <input
        name={name}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        value={value}
        onChange={onChange}
        type="text"
        className={"form-control " + size + " " + margin}
      />
    </div>
  );
};

export default Input;
