import React, { Component } from "react";
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
  Markers,
  Marker
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import colors from '../../style/colors';

class Map extends Component {
  constructor() {
    super();
    this.state = {
      // ComposableMap specs
      width: 90,
      height: 70,
      projection: "albersUsa",
      scale: 90,
      // ZoomableGroup specs
      zoom: 1,
      center: [0, 0],
      // Geographies specs
      geographies: "/usa_topo.json",
      // Marker specs
      rgba: "rgba(255,87,34,0.8)",
      size: "count"
    };
  }

  componentDidMount() {
  }

  render() {
    const { data } = this.props;
    const markers = data;
    ReactTooltip.rebuild();

    return (
      <div>
        <ComposableMap
          projection={this.state.projection}
          projectionConfig={{
            scale: this.state.scale
          }}
          width={this.state.width}
          height={this.state.height}
          style={{
            width: "100%",
            height: "100%"
          }}
        >
          <ZoomableGroup>
            <Geographies
              geography={process.env.PUBLIC_URL + this.state.geographies}
            >
              {(geographies, projection) =>
                geographies.map((geography, i) => {
                  return (
                    <Geography
                      key={i}
                      data-tip={"ay"}
                      geography={geography}
                      projection={projection}
                      style={{
                        default: {
                          stroke: "#607D8B",
                          strokeWidth: 0.1,
                          outline: "none"
                        },
                        hover: {
                          fill: "#607D8B",
                          stroke: "#607D8B",
                          strokeWidth: 0.75,
                          outline: "none"
                        },
                        pressed: {
                          fill: "#FF5722",
                          stroke: "#607D8B",
                          strokeWidth: 0.75,
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
            <Markers>
              {markers.map((marker, i) => {
                return (
                  <Marker
                    key={i}
                    data-tip={"React-tooltip"}
                    marker={{ coordinates: marker.coordinates }}
                    style={{
                      default: { fill: colors.decoration },
                      hover: {
                        fill: "#FF5722",
                        stroke: "#FF5722",
                        strokeWidth: 0.75,
                        outline: "none"
                      },
                      // pressed: { fill: "#FF5722" }
                    }}
                  >
                    <circle
                      cx={0}
                      cy={0}
                      r={marker.size}
                      // style={{
                      // stroke: "#FF5722",
                      // strokeWidth: 3,
                      // opacity: 0.9
                      // }}
                    />
                    {/* <text
                    textAnchor="middle"
                    y={marker.markerOffset}
                    style={{
                      fontFamily: "Roboto, sans-serif",
                      fill: "#607D8B",
                      fontSize: .2
                    }}
                  >
                    {marker.name}
                  </text> */}
                  </Marker>
                );
              })}
            </Markers>
            <ReactTooltip />
          </ZoomableGroup>
        </ComposableMap>
        <ReactTooltip />
      </div>
    );
  }
}

export default Map;
