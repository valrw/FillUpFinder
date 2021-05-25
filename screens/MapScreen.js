import React, { useState, useEffect, useCallback } from "react";
import MapDisplay from "../components/MapDisplay";
import StopInfo from "../components/StopInfo";
import GpsDisplay from "../components/GpsDisplay";

const getMarkerIcon = (stop) => {
  // console.log(stop);
  return require("../assets/map_marker.png");

  // if (this.state.isStopShown && index == this.state.currStopIndex) {
  //   return require("../assets/map_marker2.png");
  // } else return require("../assets/map_marker.png");
};

function MapScreen(props) {
  const [currStop, setCurrStop] = useState(null);

  // useCallback(
  //   (stop) => {
  //     callback;
  //   },
  //   [input]
  // );

  // const getMarkerIcon = (stop) => {
  //   console.log(stop);
  //   return require("../assets/map_marker.png");

  //   // if (this.state.isStopShown && index == this.state.currStopIndex) {
  //   //   return require("../assets/map_marker2.png");
  //   // } else return require("../assets/map_marker.png");
  // };

  return (
    <>
      <MapDisplay
        params={props.route.params}
        setCurrStop={setCurrStop}
        getMarkerIcon={getMarkerIcon}
      />
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

      {/* <TouchableOpacity
        onPress={this.zoomToUserLocation}
        style={[
          this.state.isStopShown || this.state.segments?.length == 0
            ? styles.fab
            : { ...styles.fab, bottom: 110 },
          {
            backgroundColor:
              this.context.theme === "light" ? "white" : "#383838",
          },
        ]}
      >
        <Image
          source={require("../assets/target.png")}
          style={styles.fabIcon}
        ></Image>
      </TouchableOpacity> */}
    </>
  );
}

export default MapScreen;
