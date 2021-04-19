import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Text, Icon, Button } from "@ui-kitten/components";
import MapView, { Marker } from "react-native-maps";
import { API_KEY, ROOT_URL } from "../constants/api";
import colors from "../constants/colors";
import StopInfo from "../components/StopInfo";
import ConfirmModal from "../components/ConfirmModal";
// import * as Location from "expo-location";
import { getLocation } from "../services/LocationService.js";

const ANIMATED_VAL = 310;

class MapDisplay extends Component {
  state = {
    segments: [],
    start: { latitude: 0, longitude: 0 },
    end: { latitude: 0, longitude: 0 },
    stops: 0,
    stopsList: [],

    isStopShown: false,
    currStopIndex: 0,
    slideAnimate: new Animated.Value(ANIMATED_VAL),

    showingModal: false,
    replacingStop: false,

    location: null,
  };

  constructor(props) {
    super(props);
    this.mapComponent = null;
  }

  zoomToUserLocation = () => {
    if (this.state.location === null) return;
    const camera = {
      center: {
        latitude: this.state.location.coords.latitude,
        longitude: this.state.location.coords.longitude,
      },
      // pitch: number,
      // heading: number,

      // Only on iOS MapKit, in meters. The property is ignored by Google Maps.
      altitude: 14,

      // Only when using Google Maps.
      zoom: 14,
    };
    this.mapComponent.animateCamera(camera, 5);
  };

  componentDidMount() {
    var params = this.props.route.params;
    var start = params.startingPlaceId;
    var end = params.endingPlaceId;
    var fuelLeft = params.fuelLeft;
    var fuelCap = params.fuelCap;
    var mpg = params.mpg;
    var mpgCity = params.mpgCity ? params.mpgCity : mpg;
    var mpgHighway = params.mpgHighway ? params.mpgHighway : mpg;
    var calcOnGas = true;
    if (params.calcOnGas == 1) calcOnGas = false;
    var numStops = params.numStops;

    getLocation().then((loc) => {
      this.setState({ location: loc });
    });

    this.getDirections(start, end, fuelLeft, fuelCap, mpg, calcOnGas, numStops, mpgCity, mpgHighway);
  }

  // Call the back end api to get the route
  async getDirections(start, end, fuelLeft, fuelCap, mpg, calcOnGas, numStops, mpgCity = mpg, mpgHighway = mpg) {
    try {
      var url = `${ROOT_URL}/api/directions/${start}/${end}/${fuelLeft}/${fuelCap}/${mpg}/${calcOnGas}`;
      if (calcOnGas) url = url + `/${numStops}`;
      url = url + `?mpgCity=${mpgCity}&mpgHighway=${mpgHighway}`;

      let resp = await fetch(url);
      let respJson = await resp.json();
      let segments = respJson.route;

      let stops = respJson.stops;
      let stopsList = respJson.stopsList;

      var start = segments[0].coords[0];
      var lastSeg = segments[segments.length - 1];
      var end = lastSeg.coords[lastSeg.coords.length - 1];

      this.setState({ segments, start, end, stops, stopsList });
      // Zoom out the map
      this.mapComponent.animateToRegion(respJson.zoomBounds);

      return segments;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  onDeletePress = () => {
    this.setState({ showingModal: true });
  };

  deleteStop = async (removedStopIndex) => {
    this.onMapPress();
    let newStops = [];
    try {
      this.setState({ replacingStop: true });
      const stopToReplace = this.state.stopsList[removedStopIndex].placeId;

      // the start will be either the previous gas station or the route start
      let start = this.props.route.params.startingPlaceId;
      if (removedStopIndex > 0)
        start = this.state.stopsList[removedStopIndex - 1].placeId;

      // the end will be either the next gas station of the route destination
      let end = this.props.route.params.endingPlaceId;
      if (removedStopIndex < this.state.stopsList.length - 1)
        end = this.state.stopsList[removedStopIndex + 1].placeId;

      let fuelCap = this.props.route.params.fuelCap * 1.1;
      let mpg = this.props.route.params.mpg;
      let mpgCity = this.props.route.params.mpgCity ? this.props.route.params.mpgCity : mpg;
      let mpgHighway = this.props.route.params.mpgHighway ? this.props.route.params.mpgHighway : mpg;

      // if you are going from start to first stop, start with less gas
      let fuelLeft = fuelCap;
      if (removedStopIndex == 0) fuelLeft = this.props.route.params.fuelLeft;

      let url = `${ROOT_URL}/api/directions/${start}/${end}/${fuelLeft}/${fuelCap}/${mpg}/true/0/${stopToReplace}?mpgCity=${mpgCity}&mpgHighway=${mpgHighway}`;
      let resp = await fetch(url);
      let respJson = await resp.json();

      this.setState({ replacingStop: false });
      if (respJson.route == undefined) return;
      let newSegments = respJson.route;
      let newRoute = [...this.state.segments];

      newRoute.splice(removedStopIndex, 2, ...newSegments);

      newStops = respJson.stopsList;
      let newStopsList = [...this.state.stopsList];

      // If we added an existing stop, delete the stop
      let lastStop = newStops[newStops.length - 1];
      if (
        removedStopIndex < this.state.stopsList.length - 1 &&
        lastStop != undefined
      ) {
        let nextStopInRoute = this.state.stopsList[removedStopIndex + 1];
        if (nextStopInRoute.placeId == lastStop.placeId) {
          newStops.pop();
        }
      }

      newStopsList.splice(removedStopIndex, 1, ...newStops);

      this.setState({ segments: newRoute, stopsList: newStopsList });
    } catch (error) {
      console.log(error);
      return error;
    }
    if (newStops.length > 0) this.onMarkerClick(removedStopIndex);
  };

  // load in the loading spinner when the route is loading
  loadingSpinner() {
    if (this.state.segments.length == 0 || this.state.replacingStop) {
      return (
        <ActivityIndicator
          style={styles.loadingSpinner}
          size="large"
          color={colors.defaultBlue}
        />
      );
    }
  }

  // Show the stop information view
  onMarkerClick = (index) => {
    let slideInAnimation = Animated.timing(this.state.slideAnimate, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    });

    // Animate the slide in entrance of the stop information view
    if (!this.state.isStopShown) slideInAnimation.start();

    this.setState({ currStopIndex: index, isStopShown: true });
  };

  // Get blue icons for all icons, light blue for the selected icon
  getMarkerIcon = (index) => {
    if (this.state.isStopShown && index == this.state.currStopIndex) {
      return require("../assets/map_marker2.png");
    } else return require("../assets/map_marker.png");
  };

  // When randomly pressing on the map, dismiss the stop information view
  onMapPress = () => {
    if (this.state.isStopShown) {
      this.setState({ isStopShown: false });
    }
    Animated.timing(this.state.slideAnimate, {
      toValue: ANIMATED_VAL,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  customizeStops = () => {
    this.props.navigation.navigate("CustomizeStops");
  };

  render() {
    const slideAnimation = {
      transform: [{ translateY: this.state.slideAnimate }],
    };

    let currStop = { name: "", vicinity: "" };

    if (this.state.isStopShown)
      currStop = this.state.stopsList[this.state.currStopIndex];

    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={(ref) => (this.mapComponent = ref)}
          style={{ width: "100%", height: "100%", zIndex: -1 }}
          initialRegion={{
            latitude: parseFloat(this.props.route.params.startingLat),
            longitude: parseFloat(this.props.route.params.startingLong),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={this.onMapPress}
        >
          <MapView.Marker
            title="Start"
            coordinate={{
              latitude: this.state.start.latitude,
              longitude: this.state.start.longitude,
            }}
          />
          <MapView.Marker
            title="End"
            coordinate={{
              latitude: this.state.end.latitude,
              longitude: this.state.end.longitude,
            }}
          />

          {this.state.location != null && (
            <MapView.Marker
              title="Your Location"
              coordinate={{
                latitude: this.state.location.coords.latitude,
                longitude: this.state.location.coords.longitude,
              }}
            >
              <Image
                source={require("../assets/current-location.png")}
                style={styles.locationMarker}
              />
            </MapView.Marker>
          )}

          {this.state.stopsList.map((station, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              onPress={(e) => {
                e.stopPropagation();
                this.onMarkerClick(index);
              }}
            >
              <Image
                source={this.getMarkerIcon(index)}
                style={styles.mapMarkerIcon}
              />
            </Marker>
          ))}

          {this.state.segments.map((seg, index) => (
            <MapView.Polyline
              key={index}
              coordinates={seg.coords}
              strokeWidth={4}
              strokeColor="blue"
            />
          ))}
        </MapView>
        
        <View style={styles.customStopsButton}>
          {/* <Text style={styles.customStopsButtonTitle}>Customize Stops</Text> */}
          <TouchableOpacity
            onPress={this.customizeStops}>
            <Icon
              style={styles.customStopsIcon}
              fill={colors.defaultBlue}
              name="brush-outline"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.fab} onPress={this.zoomToUserLocation}>
          <Image
            source={require("../assets/target.png")}
            style={styles.fabIcon}
          ></Image>
        </TouchableOpacity>

        {this.loadingSpinner()}

        <ConfirmModal
          visible={this.state.showingModal}
          title={"Delete Stop"}
          subtitle={
            "Are you sure you want to remove this stop from your route?"
          }
          onConfirm={() => {
            this.setState({ showingModal: false });
            this.deleteStop(this.state.currStopIndex);
          }}
          onCancel={() => {
            this.setState({ showingModal: false });
          }}
        />

        <StopInfo
          anim={slideAnimation}
          currStop={currStop}
          onDeleteStop={this.onDeletePress}
        />
      </View>
    );
  }
}

export default MapDisplay;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    color: colors.defaultBlue,
  },

  loadingSpinner: {
    position: "absolute",
    alignSelf: "center",
    top: "40%",
  },

  mapMarkerIcon: {
    width: 30,
    height: 30,
  },

  locationMarker: {
    width: 60,
    height: 60,
  },

  fab: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 99,
    width: 65,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    right: 30,
    bottom: 35,
    elevation: 3,
    zIndex: 3,
  },

  fabIcon: {
    width: 30,
    height: 30,
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
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 99,
    width: 65,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    right: 30,
    top: 35,
    elevation: 4,
    zIndex: 4,
  },

  customStopsIcon: {
    width: 30,
    height: 30,
  },

});
