import React, { Component } from "react";
import { StyleSheet, Text, View, Button, Platform } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import colors from "../constants/colors";

class LocationInput extends Component {
  state = {
    startingLat: 33.8121,
    startingLong: -117.919,
    endingLat: 0,
    endingLong: 0,
    vehicle: null,
    vehicleSet: false,
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.route.params?.vehicle !== prevState.vehicle) {
        this.setState({
            vehicleSet: true,
            vehicle: this.props.route.params?.vehicle,
        })
    }
  }

  updateLatLng = (value, inputType) => {
    var newVal = parseFloat(value, 10);
    if (isNaN(newVal)) return;
    if (newVal > 180 || newVal < -180) return;
    if (inputType % 2 == 0 && (newVal > 90 || newVal < -90)) return;

    if (inputType == 0) this.setState({ startingLat: value });
    else if (inputType == 1) this.setState({ startingLong: value });
    else if (inputType == 2) this.setState({ endingLat: value });
    else if (inputType == 3) this.setState({ endingLong: value });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.inputTitle}>Starting Latitude:</Text>
        <TextInput
          style={styles.inputBox}
          keyboardType={
            Platform.OS == "android" ? "numeric" : "numbers-and-punctuation"
          }
          onChangeText={(text) => this.updateLatLng(text, 0)}
        />
        <Text style={styles.inputTitle}>Starting Longitude:</Text>
        <TextInput
          style={styles.inputBox}
          keyboardType={
            Platform.OS == "android" ? "numeric" : "numbers-and-punctuation"
          }
          onChangeText={(text) => this.updateLatLng(text, 1)}
        />
        <Text style={styles.inputTitle}>Ending Latitude:</Text>
        <TextInput
          style={styles.inputBox}
          keyboardType={
            Platform.OS == "android" ? "numeric" : "numbers-and-punctuation"
          }
          onChangeText={(text) => this.updateLatLng(text, 2)}
        />
        <Text style={styles.inputTitle}>Ending Longitude:</Text>
        <TextInput
          style={styles.inputBox}
          keyboardType={
            Platform.OS == "android" ? "numeric" : "numbers-and-punctuation"
          }
          onChangeText={(text) => this.updateLatLng(text, 3)}
        />

        <Text style={styles.inputTitle}>Vehicle:</Text>
        { this.state.vehicleSet ? (
            <Text>Current vehicle: {this.state.vehicle}</Text>
        ) : (
            <Text>No vehicle set</Text>
        )}
        <TouchableOpacity
          style={styles.vehicleButton}
          title="Set Vehicle"
          onPress={() => {
              this.props.navigation.navigate("VehicleInput");
            }
          }
        >
          { this.state.vehicleSet ? (
                <Text style={{fontSize: 12, color: "white"}}>Change vehicle</Text>
            ) : (
                <Text style={{fontSize: 12, color: "white"}}>Add vehicle</Text>
          )}
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.navigateButton}
            title="Go to Map"
            onPress={() =>
              this.props.navigation.navigate("MapDisplay", {
                startingLat: this.state.startingLat,
                startingLong: this.state.startingLong,
                endingLat: this.state.endingLat,
                endingLong: this.state.endingLong,
              })
            }
          >
            <Text
                style={styles.buttonText}
                disabled={!this.state.vehicleSet}>
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
    width: "80%",
    fontSize: 18,
    textAlign: "left",
  },

  inputBox: {
    paddingHorizontal: 10,
    marginTop: 6,
    width: "80%",
    height: 30,
    borderWidth: 1,
    borderColor: "#c4c4c4",
    backgroundColor: "white",
    marginBottom: 4,
  },

  buttonContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    marginBottom: "10%",
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
