import React from "react";
import AliasedInput from "./aliasedInput.jsx";

const SkillInput = ({
  id,
  title,
  aliases,
  handleSkillTitleChange,
  handleSkillAliasChange,
  handleDelete,
  handleClear
}) => {
  return (
    <div key={"div-" + id}>
      <div key={id}>
        <AliasedInput
          titleLabel="Skill"
          name={id}
          title={title}
          aliases={aliases}
          handleTitleChange={handleSkillTitleChange}
          handleAliasChange={handleSkillAliasChange}
        />
      </div>
      <button
        key={"btn-del" + id}
        onClick={() => {
          handleDelete(id);
        }}
        className="btn-sm btn-danger mt-0 ml-1"
      >
        -
      </button>
      <button
        key={"btn-clear-" + id}
        onClick={() => handleClear(id)}
        className="btn-sm btn-warning mt-3 ml-2"
      >
        Clear
      </button>
    </div>
  );
};

export default SkillInput;
