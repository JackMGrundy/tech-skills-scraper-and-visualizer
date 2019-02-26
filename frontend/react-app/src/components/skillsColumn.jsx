import React from "react";
import SkillInput from './skillInput.jsx';

const SkillsColumn = ({
  skills,
  handleSkillTitleChange,
  handleSkillAliasChange,
  handleDelete,
  handleClear,
  numCols,
  colNum
}) => {
  return (
    <div className="col-lg">
      {" "}
      {Object.keys(skills).map((id, i) => {
        if (i % numCols !== colNum) {
          return null;
        }
        return (
          <SkillInput
            key={id}
            id={id}
            title={skills[id].title}
            aliases={skills[id].aliases}
            handleSkillTitleChange={handleSkillTitleChange}
            handleSkillAliasChange={handleSkillAliasChange}
            handleDelete={handleDelete}
            handleClear={handleClear}
          />
        );
      })}
    </div>
  );
};

export default SkillsColumn;
