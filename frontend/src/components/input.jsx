import React from "react";

const Input = ({ error, name, label, size, margin, id, ...rest }) => {
  return (
    <div className="form-group">
      <label className={"mt-4 " + margin} htmlFor={name}>
        {label}
      </label>
      <input
        {...rest}
        name={name}
        id={id}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        type="text"
        className={"form-control " + size + " " + margin}
      />
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Input;
