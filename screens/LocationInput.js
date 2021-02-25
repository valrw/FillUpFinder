import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import colors from "../constants/colors";
import LocationInputText from "../components/LocationInputText";
import {
  Layout,
  Divider,
  Select,
  SelectItem,
  IndexPath,
  Input,
} from "@ui-kitten/components";

class LocationInput extends Component {
  state = {
    startingLat: 33.8121,
    startingLong: -117.919,
    startingPlaceId: "",
    endingPlaceId: "",
    vehicle: null,
    vehicleSet: false,
    fuelLeft: 17, // default values may change to be more accurate
    fuelCap: 17,
    mpg: 15,

    selectedIndex: new IndexPath(0),
    numberOfStops: 0,
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.route.params == null) return;
    if (this.props.route.params?.vehicle !== prevState.vehicle) {
      var params = this.props.route.params;
      this.setState({
        vehicleSet: true,
        vehicle: params.vehicle,
        fuelCap: params.fuelCap,
        mpg: params.mpg,
        // TODO: get the fuelLeft value from Options
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

  renderTripOptions = (selectedOption) => {
    if (selectedOption == 0) {
      return (
        <View style={styles.calcOnGasView}>
          {this.state.vehicleSet ? (
            <Text style={styles.vehicleSetText}>
              Your vehicle: {this.state.vehicle}
            </Text>
          ) : (
            <Text style={styles.vehicleSetText}>Vehicle not set.</Text>
          )}
          <TouchableOpacity
            style={styles.vehicleButton}
            title="Set Vehicle"
            onPress={() => {
              this.props.navigation.navigate("VehicleInput");
            }}
          >
            {this.state.vehicleSet ? (
              <Text style={{ fontSize: 12, color: "white" }}>
                Change vehicle
              </Text>
            ) : (
              <Text style={{ fontSize: 12, color: "white" }}>Add Vehicle</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.vehicleButton}
            title="View Options"
            onPress={() => {
              this.props.navigation.navigate("Options");
            }}
          >
            <Text style={{ fontSize: 12, color: "white" }}>View Options</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          style={styles.fixedStopsView}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.inputTitle}>Select Number of Stops</Text>
          <Input
            keyboardType="number-pad"
            placeholder="Enter number"
            style={styles.fixedStopsInput}
            onChangeText={(num) =>
              this.setState({ numberOfStops: parseInt(num) })
            }
          />
        </ScrollView>
      );
    }
  };

  render() {
    const options = ["Get Stops Based On Gas", "Set Fixed Number of Stops"];
    return (
      <Layout style={styles.container}>
        <Text style={styles.inputTitle}>Starting point:</Text>
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

        <Text style={styles.inputTitle}>Destination:</Text>
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
        <Divider style={styles.divider}></Divider>

        <Text style={styles.selectTripTypeTitle}>Stop Calculation</Text>
        <Select
          style={styles.selectTripType}
          selectedIndex={this.state.selectedIndex}
          onSelect={(index) => this.setState({ selectedIndex: index })}
          value={options[this.state.selectedIndex.row]}
        >
          {options.map((item) => (
            <SelectItem key={item} title={item} />
          ))}
        </Select>

        {this.renderTripOptions(this.state.selectedIndex.row)}

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
                fuelLeft: this.state.fuelCap,
                fuelCap: this.state.fuelCap,
                mpg: this.state.mpg,
                calcOnGas: this.state.selectedIndex.row,
                numStops: this.state.numberOfStops,
              })
            }
          >
            <Text style={styles.buttonText} disabled={!this.state.vehicleSet}>
              Get Directions
            </Text>
          </TouchableOpacity>
        </View>
      </Layout>
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
    backgroundColor: "white",
  },

  inputTitle: {
    marginTop: "5%",
    width: "86%",
    fontSize: 12,
    color: "#8F9BB3",
    textAlign: "left",
    zIndex: -1,
  },

  inputBox: {
    paddingHorizontal: 10,
    height: 40,
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: "#e4e9f2",
    backgroundColor: "#F7F9FC",
    marginBottom: 4,
    zIndex: 5,
  },

  selectTripTypeTitle: {
    marginTop: "3%",
    width: "86%",
    fontSize: 12,
    color: "#8F9BB3",
    textAlign: "center",
    zIndex: -1,
  },

  selectTripType: {
    top: 5,
    width: "65%",
  },

  calcOnGasView: {
    height: "50%",
  },

  fixedStopsView: {
    top: 5,
    height: "50%",
    width: "86%",
  },

  fixedStopsInput: {
    top: 5,
  },

  buttonContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    marginBottom: "10%",
    zIndex: -1,
  },

  navigateButton: {
    paddingHorizontal: 85,
    paddingVertical: 20,
    backgroundColor: colors.defaultBlue,
    borderRadius: 3,
  },

  vehicleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  vehicleButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: colors.defaultBlue,
    borderRadius: 100,
    marginTop: 11,
    marginBottom: 11,
  },

  vehicleSetText: {
    marginTop: 20,
    color: "#8F9BB3",
  },

  buttonText: {
    fontSize: 18,
    color: "white",
  },

  divider: {
    marginTop: 28,
    width: "95%",
  },
});
