import React, { Component } from "react";

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Legend,
  Bar
} from "recharts";

var randomColor = require("randomcolor");
const shortid = require("shortid");

class CustomLineChart extends Component {
  render() {
    const { data, lines } = this.props;

    return (
      <div>
        <h3 className="ml-5 mt-5">Skill demand</h3>
        {data.length > 0 ? (
          <ResponsiveContainer
            // className="mb-5"
            width="100%"
            height={500}
          >
            <BarChart
              width={500}
              height={500}
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {lines.map(tech => {
                return (
                  <Bar
                    key={shortid.generate()}
                    type="monotone"
                    dataKey={tech}
                    fill={randomColor()}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default CustomLineChart;
