import React from "react";
import SkillsColumn from "./skillsColumn.jsx";

const SkillsGrid = ({
  skills,
  handleSkillTitleChange,
  handleSkillAliasChange,
  handleDelete,
  handleClear,
  numCols
}) => {
  let cols=[];
  let i=0;
  while(cols.push(i++)<numCols){};
  return (
    <div className="container">
      <div className="row">
        {cols.map(col => {
          return (
            <SkillsColumn
              key={col}
              skills={skills}
              handleSkillTitleChange={handleSkillTitleChange}
              handleSkillAliasChange={handleSkillAliasChange}
              handleDelete={handleDelete}
              handleClear={handleClear}
              numCols={numCols}
              colNum={col}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SkillsGrid;
