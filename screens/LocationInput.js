import React, { Component } from "react";
import { StyleSheet, View, Platform, Keyboard, ScrollView } from "react-native";
// import { TouchableOpacity } from "react-native-gesture-handler";
import colors from "../constants/colors";
import LocationInputText from "../components/LocationInputText";
import {
  Layout,
  Divider,
  Select,
  SelectItem,
  IndexPath,
  Input,
  Text,
  Button,
} from "@ui-kitten/components";

import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Carousel from "react-native-snap-carousel";
import VehicleCard from "../components/VehicleCard";

class LocationInput extends Component {
  state = {
    startingLat: 33.8121,
    startingLong: -117.919,
    startingPlaceId: "",
    endingPlaceId: "",
    fuelCap: 17,
    mpg: 15,

    selectedIndex: new IndexPath(0),
    numberOfStops: 0,

    fuelPercent: 75,
    fuelPercentContinuous: 75,

    cars: [
      // { name: "Vehicle 1", mpg: "37", fuelCap: "13" },
      // { name: "Vehicle 2", mpg: "12", fuelCap: "18" },
      // { name: "Vehicle 3", mpg: "26", fuelCap: "9" },
    ],
    carsLoaded: false,
  };

  componentDidMount() {
    // AsyncStorage.setItem("@cars", JSON.stringify(this.state.cars));

    AsyncStorage.getItem("@cars").then((stored_cars) => {
      if (stored_cars !== null) {
        const cars = JSON.parse(stored_cars);
        this.setState({ cars: cars, carsLoaded: true });
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.route.params == null) return;
    if (this.props.route.params != prevProps.route.params) {
      const params = this.props.route.params;
      this.addCar({
        name: params.vehicle,
        mpg: params.mpg,
        fuelCap: params.fuelCap,
      });
    }
  }

  // Save current car list to async storage
  saveCars = () => {
    const { cars } = this.state;
    AsyncStorage.removeItem("@cars").then(() => {
      AsyncStorage.setItem("@cars", JSON.stringify(cars));
    });
  };

  // Add a car and then update the car list in async storage
  addCar = (car) => {
    const { cars } = this.state;
    const newCars = [...cars, car];
    this.setState({ cars: newCars }, this.saveCars);
  };

  // Delete car and then update the car list in async storage
  deleteCar = () => {
    const { cars } = this.state;
    let newCars = cars;
    newCars.splice(this._carousel._activeItem, 1);

    this.setState({ cars: newCars }, this.saveCars);
  };

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
        <>
          {!this.state.carsLoaded && this.state.cars.length == 0 && (
            <Button
              appearance="outline"
              size="large"
              style={{ marginTop: 25 }}
              onPress={() => {
                this.props.navigation.navigate("VehicleInput");
              }}
            >
              Add Vehicle
            </Button>
          )}

          {this.state.cars.length > 0 && (
            <>
              <Divider style={styles.divider}></Divider>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-around",
                  marginTop: 8,
                }}
              >
                <Text category="h6"> Select Vehicle: </Text>
                <Button
                  appearance="outline"
                  size="small"
                  onPress={() => {
                    this.props.navigation.navigate("VehicleInput");
                  }}
                >
                  Add Vehicle
                </Button>
              </View>

              <Carousel
                ref={(c) => {
                  this._carousel = c;
                }}
                data={this.state.cars}
                renderItem={({ item, index }) => (
                  <VehicleCard
                    car={item}
                    index={index}
                    deleteCar={this.deleteCar}
                  />
                )}
                sliderWidth={900}
                itemWidth={200}
                containerCustomStyle={{ flexGrow: 0 }}
              />
              <Text
                appearance="hint"
                category="s2"
                style={{ alignSelf: "flex-start", marginLeft: 38 }}
              >
                Remaining Fuel:
              </Text>
              <View
                flexDirection="row"
                style={{ width: "86%", alignItems: "center" }}
              >
                <Slider
                  ref={this.sliderRef}
                  style={{ width: "88%", height: 40, alignSelf: "center" }}
                  minimumValue={1}
                  maximumValue={100}
                  step={1}
                  onValueChange={(val) =>
                    this.setState({ fuelPercentContinuous: val })
                  }
                  value={this.state.fuelPercent}
                  onSlidingComplete={(val) => {
                    console.log(val);
                    this.setState({ fuelPercent: val });
                  }}
                  minimumTrackTintColor={colors.defaultBlue}
                  thumbTintColor={colors.defaultBlue}
                  maximumTrackTintColor="#8F9BB3"
                />
                <Text category="p1">
                  {" "}
                  {`${this.state.fuelPercentContinuous} %`}
                </Text>
              </View>
            </>
          )}
        </>
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

        <View
          style={{
            flex: 1,
            width: "100%",
            flexDirection: "column-reverse",
          }}
        >
          <Button
            style={styles.navigateButton}
            size="giant"
            onPress={() => {
              this.props.navigation.navigate("MapDisplay", {
                startingLat: this.state.startingLat,
                startingLong: this.state.startingLong,
                startingPlaceId: this.state.startingPlaceId,
                endingPlaceId: this.state.endingPlaceId,
                fuelLeft: this.state.fuelPercent * 0.01 * this.state.fuelCap,
                fuelCap: this.state.fuelCap,
                mpg: this.state.mpg,
                calcOnGas: this.state.selectedIndex.row,
                numStops: this.state.numberOfStops,
              });
            }}
          >
            Get Directions
          </Button>
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
    paddingTop: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
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
    width: "86%",
  },

  calcOnGasView: {
    width: " 86%",
  },

  fixedStopsView: {
    top: 5,
    width: "86%",
  },

  fixedStopsInput: {
    top: 5,
  },

  navigateButton: {
    marginBottom: 22,
    alignSelf: "center",
    height: 55,
    width: "75%",
  },

  vehicleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  divider: {
    marginTop: 24,
    width: "90%",
  },

  carousel: {
    flexGrow: 0,
  },
});
