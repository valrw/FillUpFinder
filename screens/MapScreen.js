import React, { useState, useEffect } from "react";
import MapDisplay from "./MapDisplay";
import StopInfo from "../components/StopInfo";
import GpsDisplay from "../components/GpsDisplay";

function MapScreen(props) {
  //   useEffect(() => {
  //     console.log(props.route.params);
  //   }, []);

  const [currStop, setCurrStop] = useState(null);
  return (
    <>
      <MapDisplay params={props.route.params} setCurrStop={setCurrStop} />
      {currStop && (
        <StopInfo
          // anim={slideAnimation}
          currStop={currStop}
          onDeleteStop={props.onDeletePress}
        />
      )}

      {!currStop && (
        //Previous version from MapDisplay.js

        // <GpsDisplay
        //   gpsMode={this.state.GpsMode}
        //   timeLeft={this.state.timeLeft}
        //   onStart={() => {
        //     this.setState({ GpsMode: true });
        //   }}
        // />

        // Still need to implement functionality, right now it's not doing anything
        <GpsDisplay
          gpsMode={false}
          timeLeft={0}
          // onStart={() => {
          //   this.setState({ GpsMode: true });
          // }}
        />
      )}
    </>
  );
}

export default MapScreen;
