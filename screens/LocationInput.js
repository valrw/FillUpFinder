import React, { Component } from "react";
import { StyleSheet, View, Platform, Keyboard, ScrollView } from "react-native";
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
  Text,
  Button,
  Icon,
} from "@ui-kitten/components";

import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Carousel from "react-native-snap-carousel";

class LocationInput extends Component {
  state = {
    startingLat: 33.8121,
    startingLong: -117.919,
    startingPlaceId: "",
    endingPlaceId: "",
    // vehicle: null,
    // vehicleSet: false,
    fuelLeft: 17, // default values may change to be more accurate
    fuelCap: 17,
    mpg: 15,

    selectedIndex: new IndexPath(0),
    numberOfStops: 0,

    fuelPercent: 75,
    fuelPercentContinuous: 75,

    // carIndex: new IndexPath(0),
    cars: [
      { name: "Car1", mpg: "33", fuelCap: "14" },
      { name: "Car2", mpg: "40", fuelCap: "10" },
      { name: "Car3", mpg: "40", fuelCap: "10" },
      { name: "Car4", mpg: "40", fuelCap: "10" },
      { name: "Car5", mpg: "40", fuelCap: "10" },
      { name: "Car6", mpg: "40", fuelCap: "10" },
    ],
  };

  componentDidMount() {
    // AsyncStorage.setItem("@cars", JSON.stringify(this.state.cars));
    AsyncStorage.getItem("@cars").then((stored_cars) => {
      let cars = [];
      if (stored_cars !== null) {
        cars = JSON.parse(stored_cars);
      }
      this.setState({ cars: cars });
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

  renderSlide = ({ item, index }) => {
    return (
      <View style={styles.card}>
        <Icon
          style={styles.cardIcon}
          fill="#222B45"
          name="trash-2-outline"
          onPress={this.deleteCar}
        />
        <Text category="h5" style={styles.cardTitle}>
          {" "}
          {item.name}
        </Text>
        <View>
          <Text category="s1" style={styles.cardInfo}>
            MPG: {item.mpg}
          </Text>
          <Text category="s1" style={styles.cardInfo}>
            Fuel Capacity: {item.fuelCap}
          </Text>
        </View>
      </View>
    );
  };

  saveCars = () => {
    console.log("Heeey");
    const { cars } = this.state;
    console.log(cars);
    console.log("Saving this");
    AsyncStorage.removeItem("@cars").then(() => {
      AsyncStorage.setItem("@cars", JSON.stringify(cars));
    });
  };

  addCar = (car) => {
    console.log("Adding Car!!");
    const { cars } = this.state;
    const newCars = [...cars, car];
    // console.log(newCars);
    this.setState({ cars: newCars }, this.saveCars);
  };

  deleteCar = () => {
    console.log("DELETING CAR");
    const { cars } = this.state; // Assuming you set state as previously mentioned
    let newCars = cars;
    newCars.splice(this._carousel._activeItem, 1);
    console.log("NEW CARS: ");
    console.log(newCars);
    // this.setState({ cars: newCars }, () => {
    //   // this._carousel.snapToNext();
    //   this.saveCars();
    // });

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
          {/* <View style={styles.calcOnGasView}> */}
          {/* {this.state.vehicleSet ? (
            <Text style={styles.vehicleSetText}>
              Your vehicle: {this.state.vehicle}
            </Text>
          ) : (
            <Text style={styles.vehicleSetText}>Vehicle not set.</Text>
          )} */}
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}
          <Button
            appearance="outline"
            size="small"
            style={{ marginTop: 16 }}
            onPress={() => {
              this.props.navigation.navigate("VehicleInput");
            }}
          >
            Add Vehicle
          </Button>
          {/* <Text
            category="h5"
            style={{
              paddingVertical: 9,
              alignSelf: "flex-start",
              paddingLeft: 20,
            }}
          >
            Vehicle:
          </Text> */}
          {this.state.cars.length > 0 && (
            <>
              <Carousel
                ref={(c) => {
                  this._carousel = c;
                }}
                data={this.state.cars}
                renderItem={this.renderSlide}
                sliderWidth={900}
                itemWidth={200}
                containerCustomStyle={{ flexGrow: 0 }}
                // style={styles.carousel}
              />
              <Text style={{ marginBottom: 5 }}>Remaining Fuel: </Text>
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
                    this.setState({ fuelPercent: val });
                    // this.setState((prev) => ({
                    //   fuelLeft: (prev.fuelCap * val) / 100,
                    // }));
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

          {/* <TouchableOpacity
            style={styles.vehicleButton}
            title="View Options"
            onPress={() => {
              this.props.navigation.navigate("Options");
            }}
          >
            <Text style={{ fontSize: 12, color: "white" }}>View Options</Text>
          </TouchableOpacity> */}
          {/* </View> */}
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
        {/* <View style={{ flexGrow: 1 }}> */}

        {/* </View> */}

        {/* <View>
          {this.state.cars.map((c, idx) => (
            <Text key={idx}>{c.name}</Text>
          ))}
        </View> */}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.navigateButton}
            title="Go to Map"
            onPress={() => {
              const selectedCar = this.state.cars[this._carousel._activeItem];
              console.log(selectedCar);
              const fuelLeft =
                (parseFloat(selectedCar.fuelCap) * this.state.fuelPercent) /
                100;
              console.log("Fuel Left: ");
              console.log(fuelLeft);
              this.props.navigation.navigate("MapDisplay", {
                startingLat: this.state.startingLat,
                startingLong: this.state.startingLong,
                startingPlaceId: this.state.startingPlaceId,
                endingPlaceId: this.state.endingPlaceId,
                fuelLeft: fuelLeft,
                fuelCap: selectedCar.fuelCap,
                mpg: selectedCar.mpg,
                calcOnGas: this.state.selectedIndex.row,
                numStops: this.state.numberOfStops,
              });
            }}
          >
            <Text
              style={styles.buttonText}
              disabled={this.state.cars.length == 0}
            >
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
    paddingTop: 10,
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
    backgroundColor: "pink",
    // height: "50%",
  },

  fixedStopsView: {
    top: 5,
    // height: "50%",
    width: "86%",
  },

  fixedStopsInput: {
    top: 5,
  },

  buttonContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    marginBottom: 23,
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

  // vehicleButton: {
  //   width: "40%",
  //   alignSelf: "center",
  //   alignItems: "center",
  //   paddingHorizontal: 20,
  //   paddingVertical: 11,
  //   backgroundColor: colors.defaultBlue,
  //   borderRadius: 100,
  //   marginTop: 11,
  //   marginBottom: 11,
  // },

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

  carousel: {
    flexGrow: 0,
  },

  card: {
    // marginVertical: 20,
    width: "95%",
    justifyContent: "space-evenly",
    // marginHorizontal: 10,
    marginVertical: 10,
    backgroundColor: "#fdfdff",
    height: 150,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#333",
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.3,
  },

  cardInfo: {
    marginHorizontal: 8,
    marginBottom: 2,
  },

  cardTitle: {
    marginVertical: 4,
    alignSelf: "center",
    textAlign: "center",
  },

  cardIcon: {
    width: 26,
    height: 26,
    alignSelf: "flex-end",
    marginTop: 6,
    marginHorizontal: 6,
  },
});
