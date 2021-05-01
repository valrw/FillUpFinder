import React, { Component } from "react";
import { StyleSheet, View, Platform, ScrollView, Image } from "react-native";
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
  withStyles,
} from "@ui-kitten/components";

import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Carousel from "react-native-snap-carousel";
import VehicleCard from "../components/VehicleCard";

import { getLocation, getPlace } from "../services/LocationService.js";

class LocationInput extends Component {
  constructor(props) {
    super(props);
    this.startingInputRef = React.createRef();
  }

  state = {
    startingLat: 33.8121,
    startingLong: -117.919,
    startingPlaceId: "",
    endingPlaceId: "",
    currentLocation: false,

    selectedIndex: new IndexPath(0),
    numberOfStops: 0,

    fuelPercent: 75,
    fuelPercentContinuous: 75,

    cars: [],
    finishedLoading: false,

    startAtUserLocation: false,

    placeIdsList: []
  };

  componentDidMount() {
    AsyncStorage.getItem("@cars").then((stored_cars) => {
      if (stored_cars !== null) {
        const cars = JSON.parse(stored_cars);
        this.setState({ cars: cars, finishedLoading: true });
      } else {
        this.setState({ finishedLoading: true });
      }
    });

    // var params = this.props.route.params;
    // if (params !== undefined) {
    //   var start = params.startingPlaceId;
    //   var end = params.endingPlaceId;
    //   var latitude = params.startingLat;
    //   var longitude = params.startingLong;
    //   var placeIDs = params.placeIdsList;

    //   if (start !== "") {
    //       this.setState({ startingPlaceId: start });
    //   }

    //   if (latitude !== "") {
    //       this.setState({ startingLat: latitude });
    //   }

    //   if (longitude !== "") {
    //       this.setState({ startingLat: longitude });
    //   }

    //   if (end !== "") {
    //       this.setState({ endingPlaceId: end });
    //   }

    //   this.setState({ placeIdsList: placeIDs });
    // }
    // console.log('START: ', start)
    // console.log('END: ', end)
  }


  componentDidUpdate(prevProps, prevState) {
    if (this.props.route.params == null) return;
    if (this.props.route.params != prevProps.route.params) {
      const params = this.props.route.params;
      this.addCar({
        name: params.vehicle,
        mpg: params.mpg,
        mpgCity: params.mpgCity,
        mpgHighway: params.mpgHighway,
        fuelCap: params.fuelCap,
      });

      var start = params.startingPlaceId;
      var end = params.endingPlaceId;
      var latitude = params.startingLat;
      var longitude = params.startingLong;
      var placeIDs = params.placeIdsList;

      if (start !== "") {
          this.setState({ startingPlaceId: start });
      }

      if (latitude !== "") {
          this.setState({ startingLat: latitude });
      }

      if (longitude !== "") {
          this.setState({ startingLat: longitude });
      }

      if (end !== "") {
          this.setState({ endingPlaceId: end });
      }

      this.setState({ placeIdsList: placeIDs });
    }
    // console.log('START: ', start)
    // console.log('END: ', end)
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
    const newCars = [car, ...cars];
    this.setState({ cars: newCars }, () => {
      this.saveCars();
      this._carousel.snapToItem(0);
    });
  };


  // Delete car and then update the car list in async storage
  deleteCar = () => {
    const { cars } = this.state;
    let newCars = cars;
    newCars.splice(this._carousel._activeItem, 1);

    this.setState({ cars: newCars }, this.saveCars);
  };


  getDirections = () => {
    var fuelCap = 0,
      mpg = 0;
    var calcOnGas = this.state.selectedIndex.row;
    if (calcOnGas == 0) {
      const currentCar = this.state.cars[this._carousel._activeItem];
      fuelCap = currentCar.fuelCap;
      mpg = currentCar.mpg;
      var mpgCity = currentCar.mpgCity;
      var mpgHighway = currentCar.mpgHighway;
    }
    this.props.navigation.navigate("MapDisplay", {
      startingLat: this.state.startingLat,
      startingLong: this.state.startingLong,
      startingPlaceId: this.state.startingPlaceId,
      endingPlaceId: this.state.endingPlaceId,
      placeIdsList: this.state.placeIdsList,
      fuelLeft: this.state.fuelPercent * 0.01 * fuelCap,
      fuelCap: fuelCap,
      mpg: mpg,
      mpgCity: mpgCity,
      mpgHighway: mpgHighway,
      calcOnGas: this.state.selectedIndex.row,
      numStops: this.state.numberOfStops,
      currentLocation: this.state.currentLocation,
    });
  };


  getPlaceInfo = (place, details, index) => {
    if (index == 0) {
      // Starting Location
      var location = details.geometry.location;
      this.setState({
        startingPlaceId: place.place_id,
        startingLat: location.lat,
        startingLong: location.lng,
        currentLocation: false,
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
          {this.state.cars.length == 0 && this.state.finishedLoading && (
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
              <Divider style={styles.divider2}></Divider>
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
                  style={{ width: "88%", height: 30, alignSelf: "center" }}
                  minimumValue={1}
                  maximumValue={100}
                  step={1}
                  onValueChange={(val) =>
                    this.setState({ fuelPercentContinuous: val })
                  }
                  value={this.state.fuelPercent}
                  onSlidingComplete={(val) => {
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


  customizeStops = () => {
    this.props.navigation.navigate("CustomizeStops", {
      startingLat: this.state.startingLat,
      startingLong: this.state.startingLong,
      startingPlaceId: this.state.startingPlaceId,
      endingPlaceId: this.state.endingPlaceId,
    });
  };

  render() {
    const options = ["Get Stops Based On Gas", "Set Fixed Number of Stops"];

    const themedColors = {
      bgColor: this.props.eva.theme["background-basic-color-2"],
      textColor: this.props.eva.theme["text-basic-color"],
      borderColor: this.props.eva.theme["border-basic-color-5"],
    };

    return (
      <Layout style={styles.container1}>
        <Text style={styles.inputTitle}>Starting point:</Text>
        <View
          style={
            Platform.OS == "android"
              ? styles.startingInputContainer
              : [styles.startingInputContainer, { zIndex: 5 }]
          }
        >
          <LocationInputText
            // theme={this.props.eva.theme}
            onSelectLocation={(data, details) =>
              this.getPlaceInfo(data, details, 0)
            }
            input_ref={this.startingInputRef}
            themedColors={themedColors}
            stylesInput={this.props.eva.style.themedInputBox}
            listViewStyle={{ width: "120%" }}
            stylesContainer={{ width: "85%", height: 40 }}
          />
          <Button
            size="small"
            accessoryLeft={() => (
              <Image
                source={require("../assets/target_white.png")}
                style={{ width: 25, height: 25 }}
              ></Image>
            )}
            onPress={async () => {
              const loc = await getLocation();
              const lat = loc.coords.latitude;
              const lng = loc.coords.longitude;
              const place = await getPlace(lat, lng);

              this.setState({
                startingPlaceId: place.place_id,
                startingLat: lat,
                startingLong: lng,
                currentLocation: true,
              });

              this.startingInputRef.current?.setAddressText(place.address);
            }}
          ></Button>
        </View>

        <Text style={styles.inputTitle}>Destination:</Text>
        <LocationInputText
          // theme={this.props.eva.theme}
          themedColors={themedColors}
          onSelectLocation={(data, details) =>
            this.getPlaceInfo(data, details, 1)
          }
          stylesInput={this.props.eva.style.themedInputBox}
          stylesContainer={
            Platform.OS == "android"
              ? { width: "86%", height: 40 }
              : { width: "86%", height: 40, zIndex: 4 }
          }
        />

        <Divider style={styles.divider1}></Divider>

        <View style={styles.container2}>
          <View style={{ flex: 2 }}>
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
          </View>
          <View style={{ flex: 1 }}>
          <Text style={styles.customStopsButtonTitle}>Customize Stops</Text>
          <Button 
          style={styles.customStopsButton} 
          onPress={this.customizeStops}>
          <Icon
            style={styles.customStopsIcon}
            fill="#ffffff"
            name="brush-outline"
          />
          </Button>
          </View>
        </View>

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
            onPress={this.getDirections}
          >
            Get Directions
          </Button>
        </View>
      </Layout>
    );
  }
}

export default LocationInput = withStyles(LocationInput, (theme) => ({
  themedInputBox: {
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderRadius: 3,
    backgroundColor: theme["background-basic-color-2"],
    marginBottom: 4,
    zIndex: 5,

    color: theme["text-basic-color"],
  },
}));

const styles = StyleSheet.create({
  container1: {
    width: "100%",
    height: "100%",
    paddingTop: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },

  container2: {
    width: "100%",
    paddingTop: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  startingInputContainer: {
    width: "86%",
    flexDirection: "row",
    justifyContent: "space-between",
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

  selectTripTypeTitle: {
    width: "86%",
    fontSize: 12,
    color: "#8F9BB3",
    alignSelf: "center",
    zIndex: -1,
  },

  customStopsButtonTitle: {
    marginTop: "3%",
    marginBottom: "3%",
    width: "86%",
    fontSize: 12,
    color: "#8F9BB3",
    zIndex: -1,
  },

  customStopsButton: {
    width: "70%",
    height: "10%",
  },

  customStopsIcon: {
    width: 24,
    height: 24,
  },

  selectTripType: {
    top: 5,
    width: "86%",
    alignSelf: "center",
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
    marginBottom: 18,
    alignSelf: "center",
    height: 55,
    width: "75%",
  },

  vehicleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  divider1: {
    marginTop: 24,
    width: "90%",
  },

  divider2: {
    marginTop: "2%",
    width: "90%",
  },

  carousel: {
    flexGrow: 0,
  },
});
