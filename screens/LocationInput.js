import React, { Component } from "react";
import { StyleSheet, Text, View, Button, Platform } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import colors from "../constants/colors";
import LocationInputText from "../components/LocationInputText";

class LocationInput extends Component {
  state = {
    startingLat: 33.8121,
    startingLong: -117.919,
    startingPlaceId: "",
    endingPlaceId: "",
    vehicle: null,
    vehicleSet: false,
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.route.params?.vehicle !== prevState.vehicle) {
      this.setState({
        vehicleSet: true,
        vehicle: this.props.route.params?.vehicle,
      });
    }
  }

  getPlaceInfo = (place, details, index) => {
    if (index == 0) {
      // Starting Location
      var location = details.geometry.location;
      this.setState({
        startingPlaceId: place.place_id,
        startingLat: location.lat,
        startingLong: location.lng,
      });
      return;
    } else if (index == 1) {
      // Ending Location
      this.setState({ endingPlaceId: place.place_id });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.inputTitle}>Starting Location:</Text>
        <LocationInputText
          onSelectLocation={(data, details) =>
            this.getPlaceInfo(data, details, 0)
          }
          stylesInput={styles.inputBox}
          stylesContainer={
            Platform.OS == "android"
              ? { width: "86%", height: 40 }
              : { width: "86%", height: 40, zIndex: 5 }
          }
        />

        <Text style={styles.inputTitle}>Ending Location:</Text>
        <LocationInputText
          onSelectLocation={(data, details) =>
            this.getPlaceInfo(data, details, 1)
          }
          stylesInput={styles.inputBox}
          stylesContainer={
            Platform.OS == "android"
              ? { width: "86%", height: 40 }
              : { width: "86%", height: 40, zIndex: 4 }
          }
        />

        <Text style={styles.inputTitle}>Vehicle:</Text>
        {this.state.vehicleSet ? (
          <Text>Current vehicle: {this.state.vehicle}</Text>
        ) : (
          <Text>No vehicle set</Text>
        )}
        <TouchableOpacity
          style={styles.vehicleButton}
          title="Set Vehicle"
          onPress={() => {
            this.props.navigation.navigate("VehicleInput");
          }}
        >
          {this.state.vehicleSet ? (
            <Text style={{ fontSize: 12, color: "white" }}>Change vehicle</Text>
          ) : (
            <Text style={{ fontSize: 12, color: "white" }}>Add vehicle</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.vehicleButton}
          title="Go to Options"
          onPress={() => {
            this.props.navigation.navigate("Options");
          }}
        >
          <Text style={{ fontSize: 12, color: "white" }}>Go to Options</Text>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.navigateButton}
            title="Go to Map"
            onPress={() =>
              this.props.navigation.navigate("MapDisplay", {
                startingLat: this.state.startingLat,
                startingLong: this.state.startingLong,
                startingPlaceId: this.state.startingPlaceId,
                endingPlaceId: this.state.endingPlaceId,
              })
            }
          >
            <Text style={styles.buttonText} disabled={!this.state.vehicleSet}>
              Get Directions
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default LocationInput;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },

  inputTitle: {
    marginTop: "5%",
    width: "86%",
    fontSize: 18,
    textAlign: "left",
    zIndex: -1,
  },

  inputBox: {
    paddingHorizontal: 10,
    height: 40,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#c4c4c4",
    backgroundColor: "white",
    marginBottom: 4,
    zIndex: 5,
  },

  buttonContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    marginBottom: "10%",
    zIndex: -1,
  },

  navigateButton: {
    paddingHorizontal: 40,
    paddingVertical: 22,
    backgroundColor: colors.defaultGreen,
    borderRadius: 100,
  },

  vehicleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  vehicleButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: colors.defaultGreen,
    borderRadius: 100,
    marginBottom: 11,
  },

  buttonText: {
    fontSize: 18,
    color: "white",
  },
});
