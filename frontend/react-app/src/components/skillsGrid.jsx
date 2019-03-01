import React from "react";
import InputList from "./inputList.jsx";
import Input from "./input.jsx";

const SkillsGrid = ({
  skills,
  aliases,
  skillsName,
  aliasesName,
  helperFunctions,
  numCols
}) => {
  let keys = Object.keys(skills);
  console.log("creating grid with keys: ", keys);
  let numRows = Math.ceil(keys.length / parseFloat(numCols));

  let cols = [];
  let i = 0;
  while (cols.push(i++) < numCols) {}

  let rows = [];
  i = 0;
  while (rows.push(i++) < numRows) {}

  let index;
  let nxtKey;
  return (
    <div className="container">
      {rows.map(row => {
        return (
          <div key={row * row} className="row">
            {cols.map(col => {
              index = row * numCols + col;
              nxtKey = keys[index];

              return (
                <div key={row + col} className="col-lg">
                  {index >= keys.length ? (
                    <h1 />
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
