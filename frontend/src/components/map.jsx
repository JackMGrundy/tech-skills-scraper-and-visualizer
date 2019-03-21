import React, { Component } from 'react';
import {
    ComposableMap,
    ZoomableGroup,
    Geographies,
    Geography,
    Markers,
    Marker,
  } from "react-simple-maps"
import { scaleLinear } from "d3-scale"
import axios from "axios"


class Map extends Component {
    constructor() {
        super()
        this.state = {
            // ComposableMap specs
            width: 200,
            height: 200,
            projection: "albersUsa",
            scale: 100,
            // ZoomableGroup specs
            zoom: 1,
            center: [0, 0],
            // Geographies specs
            geographies: "/usa_topo.json",
            // Marker specs
            rgba: "rgba(255,87,34,0.8)",
            size: "count",
        }
    }


    render() { 
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
                    height: "auto"
                    }}
                >
                    <ZoomableGroup>
                        <Geographies
                            geography={ process.env.PUBLIC_URL + this.state.geographies }
                            >
                            {(geographies, projection) =>
                                geographies.map((geography, i) => {
                                return (
                                    <Geography
                                    key={i}
                                    geography={geography}
                                    projection={projection}
                                    style={{
                                        default: {
                                          stroke: "#607D8B",
                                          strokeWidth: 0.75,
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

                        </Markers>
                    </ZoomableGroup>
                </ComposableMap>
            </div>
        );
    }
}
 
export default Map;