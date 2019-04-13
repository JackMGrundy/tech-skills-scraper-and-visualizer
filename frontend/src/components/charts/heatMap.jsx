import React, { Component } from "react";
import "../../App.css";

import HeatMap from "react-heatmap-grid";

class CustomHeatMap extends Component {
  render() {
    const { data, selectedTech } = this.props;
    let { background } = this.props;
    let heatData = [];
    let nxt;

    if (data.length !== 0) {
      for (let i = 0; i < selectedTech.length; i++) {
        nxt = [];
        for (let j = 0; j < selectedTech.length; j++) {
          let nxtVal = Math.round(
            100 * data[i * selectedTech.length + j].value
          );
          nxt.push(nxtVal);
        }
        heatData.push(nxt);
      }
    }

    // Use default color if none passed
    if (!background) background = "#329fff";

    const x = selectedTech;
    const y = selectedTech;
    return (
      <div>
        {heatData.length > 0 ? (
          <div>
            <HeatMap
              xLabels={x}
              yLabels={y}
              data={heatData}
              xLabelWidth={75}
              yLabelWidth={80}
              cellRender={value => value && `${value}%`}
              background={background}
            />
            <br />
            <br />
            <div>
              <p>
                {" "}
                Probabilities that given that a job post lists the row-skill, 
                it will also list the column skill
              </p>
              <small>
                i.e. ( # of jobs found requesting both row skill and column
                skill) / ( # of jobs found requesting row skill )
              </small>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
export default CustomHeatMap;
