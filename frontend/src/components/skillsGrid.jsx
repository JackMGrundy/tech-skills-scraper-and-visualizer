import React from "react";
import InputList from "./inputList.jsx";
import Input from "./input.jsx";

const SkillsGrid = ({
  skills,
  aliases,
  skillsName,
  aliasesName,
  helperFunctions,
  numCols,
  error
}) => {
  let keys = Object.keys(skills),
      cols = [],
      rows = [],
      i = 0,
      numRows = Math.ceil(keys.length / parseFloat(numCols)),
      index,
      nxtKey;
   

  while (cols.push(i++) < numCols) {}
  i=0;
  while (rows.push(i++) < numRows) {}

  return (
    <div className="container">
    {error && <div className="alert alert-danger">{error}</div>}
      {rows.map(row => {
        return (
          <div key={row * row} className="row">
            {cols.map(col => {
              index = row * numCols + col;
              nxtKey = keys[index];

              return (
                <div key={row + col} className="col-lg">
                  {index >= keys.length ? (
                    <h1>{}</h1>
                  ) : (
                    <div>
                      <Input
                        label={"Skill " + (index+1)}
                        id={nxtKey}
                        name={skillsName}
                        value={skills[nxtKey]}
                        onChange={ (e) => helperFunctions.handleChange(e, keys[row * numCols + col])}
                        margin=""
                        size={"form-control-lg"}
                      />
                      <InputList
                        values={aliases[nxtKey]}
                        name={aliasesName}
                        id={nxtKey}
                        helperFunctions={helperFunctions}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default SkillsGrid;
