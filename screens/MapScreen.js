import React, { useState, useRef, useContext } from "react";
import { StyleSheet, Image, TouchableOpacity } from "react-native";

import MapDisplay from "../components/MapDisplay";
import StopInfo from "../components/StopInfo";
import GpsDisplay from "../components/GpsDisplay";
import { StoreContext } from "../contexts/StoreContext";

const getMarkerIcon = (stop) => {
  // console.log(stop);
  return require("../assets/map_marker.png");

  // if (this.state.isStopShown && index == this.state.currStopIndex) {
  //   return require("../assets/map_marker2.png");
  // } else return require("../assets/map_marker.png");
};

function MapScreen(props) {
  const [currStop, setCurrStop] = useState(null);
  const storeContext = useContext(StoreContext);

  // const mapRef = useRef()

  return (
    <>
      <MapDisplay
        params={props.route.params}
        setCurrStop={setCurrStop}
        // ref={mapRef}
      />
      {currStop && (
        <StopInfo
          // anim={slideAnimation}
          currStop={currStop}
          onDeleteStop={props.onDeletePress}
        />
      )}

      {/* {!currStop && (
        //Previous version from MapDisplay.js

        <GpsDisplay
          gpsMode={this.state.GpsMode}
          timeLeft={this.state.timeLeft}s
          onStart={() => {
            this.setState({ GpsMode: true });
          }}
        />

        Still need to implement functionality, right now it's not doing anything
        <GpsDisplay
          gpsMode={false}
          timeLeft={0}
          onStart={() => {
            this.setState({ GpsMode: true });
          }}
        />
      )} */}

      <TouchableOpacity
        onPress={() => mapRef.current.zoomToUserLocation("currentLocation")}
        style={{
          ...styles.fab,
          backgroundColor: storeContext.theme === "light" ? "white" : "#383838",
        }}
      >
        <Image
          source={require("../assets/target.png")}
          style={styles.fabIcon}
        ></Image>
      </TouchableOpacity>
    </>
  );
}

export default MapScreen;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    borderRadius: 99,
    width: 65,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 35,
    elevation: 3,
    zIndex: 3,
  },

  fabIcon: {
    width: 30,
    height: 30,
  },
});
