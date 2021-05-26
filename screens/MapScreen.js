import React, { useState, useRef } from "react";
import { StyleSheet } from "react-native";
import MapDisplay from "../components/MapDisplay";
import StopInfo from "../components/StopInfo";
import ConfirmModal from "../components/ConfirmModal";

function MapScreen(props) {
  const [currStop, setCurrStop] = useState(null);
  const [confirmModalIsDisplayed, setConfirmModalIsDisplayed] = useState(false);

  const mapRef = useRef();

  return (
    <>
      <MapDisplay
        params={props.route.params}
        setCurrStop={setCurrStop}
        ref={mapRef}
      />
      {currStop?.station && (
        <StopInfo
          // anim={slideAnimation}
          currStop={currStop.station}
          onDeleteStop={() => {
            setConfirmModalIsDisplayed(true);
          }}
        />
      )}

      {confirmModalIsDisplayed && (
        <ConfirmModal
          title={"Delete Stop"}
          subtitle={
            "Are you sure you want to remove this stop from your route?"
          }
          onConfirm={() => {
            setConfirmModalIsDisplayed(false);
            mapRef.current.deleteStop(currStop.index);
          }}
          onCancel={() => {
            setConfirmModalIsDisplayed(false);
          }}
        />
      )}
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
