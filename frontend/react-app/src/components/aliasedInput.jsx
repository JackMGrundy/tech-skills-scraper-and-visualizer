import React, { Component } from "react";
import Input from "./input.jsx";

const AliasedInput = ({
  title,
  name,
  aliases,
  titleLabel,
  handleTitleChange,
  handleAliasChange
}) => {
  return (
    <div>
      <Input
        label="Skill"
        name={name}
        value={title}
        onChange={handleTitleChange}
        margin=""
        size={"form-control-lg"}
      />
      <Input
        label="Aliases"
        name={name}
        // value={aliases.join(", ")}
        value={aliases}
        onChange={handleAliasChange}
        margin="ml-5"
        size={"form-control-sm"}
      />
    </div>
  );
};

export default AliasedInput;
