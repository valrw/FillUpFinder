import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { ROOT_URL } from "../constants/api";
import colors from "../constants/colors";
import StopInfo from "../components/StopInfo";
import ConfirmModal from "../components/ConfirmModal";
import ErrorModal from "../components/ErrorModal";
// import * as Location from "expo-location";
import GpsDisplay from "../components/GpsDisplay";
import { getLocation } from "../services/LocationService.js";
import haversine from "haversine-distance";
import { nightStyle } from "../constants/mapStyles.js";
import { StoreContext } from "../contexts/StoreContext";
import debounce from "lodash.debounce";

const ANIMATED_VAL = 310;

class MapDisplay extends Component {
  state = {
    segments: [],
    start: { latitude: 0, longitude: 0 },
    end: { latitude: 0, longitude: 0 },
    stops: 0,
    stopsList: [],
    calcOnGas: true,
    GpsMode: false,

    isStopShown: false,
    currStopIndex: 0,
    currSegIndex: [0, 0],
    slideAnimate: new Animated.Value(ANIMATED_VAL),
    timeLeft: 0,

    showingModal: false,
    showingError: false,
    replacingStop: false,

    location: null,
    fineLocation: null,
  };

  static contextType = StoreContext;
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
      altitude: 10000,
      zoom: 30,
    };
    this.mapComponent.animateCamera(camera, 5);
  };

  componentDidMount() {
    let params = this.props.route.params;
    let start = params.startingPlaceId;
    let end = params.endingPlaceId;
    let fuelLeft = params.fuelLeft;
    let fuelCap = params.fuelCap;
    let mpg = params.mpg;
    let mpgCity = params.mpgCity ? params.mpgCity : mpg;
    let mpgHighway = params.mpgHighway ? params.mpgHighway : mpg;
    let calcOnGas = true;
    if (params.calcOnGas == 1) calcOnGas = false;
    let numStops = params.numStops;

    this.setState({ calcOnGas });

    getLocation().then((loc) => {
      this.setState({ location: loc });
    });

    this.getPositionUpdate = debounce(this.getPositionUpdate, 200);

    this.getDirections(
      start,
      end,
      fuelLeft,
      fuelCap,
      mpg,
      calcOnGas,
      numStops,
      mpgCity,
      mpgHighway
    );

    this.watchId = navigator.geolocation.watchPosition(
      this.getPositionUpdate,
      (error) => console.log(error),
      { timeout: 3000 }
    );
  }

  getPositionUpdate = (position) => {
    if (!position) return;

    const MIN_DIST = 50;
    let pos = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    let currLoc = {
      latitude: this.state.location?.coords.latitude,
      longitude: this.state.location?.coords.longitude,
    };

    // update position when you have moved sufficiently
    if (
      !this.state.location ||
      this.state.timeLeft == 0 ||
      haversine(pos, currLoc) > MIN_DIST
    ) {
      if (!this.state.GpsMode) return;
      let closest = this.getClosestPoint(pos);
      if (!closest) return;
      this.updateTimeLeft(closest);
      this.setState({ location: position, currSegIndex: closest });
    }
  };

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
  }

  // Call the back end api to get the route
  async getDirections(
    startPos,
    endPos,
    fuelLeft,
    fuelCap,
    mpg,
    calcOnGas,
    numStops,
    mpgCity = mpg,
    mpgHighway = mpg
  ) {
    try {
      var url = `${ROOT_URL}/api/directions/${startPos}/${endPos}/${fuelLeft}/${fuelCap}/${mpg}/${calcOnGas}/`;
      if (!calcOnGas) url = url + `${numStops}/`;
      else url = url + `?mpgCity=${mpgCity}&mpgHighway=${mpgHighway}`;

      let resp = await fetch(url);

      if (resp.status == 422) {
        this.setState({ showingError: true });
      }

      else {
        let respJson = await resp.json();
        let segments = respJson.route;
  
        let stops = respJson.stops;
        let stopsList = respJson.stopsList;
  
        var start = segments[0].coords[0];
        var lastSeg = segments[segments.length - 1];
        var end = lastSeg.coords[lastSeg.coords.length - 1];

        let timeLeft = 0;
        segments.forEach((seg) => {
          timeLeft += seg.duration;
        });
  
        this.setState({ segments, start, end, stops, stopsList });
        // Zoom out the map
        this.mapComponent.animateToRegion(respJson.zoomBounds);
        this.getPositionUpdate(this.state.location);
  
        return segments;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  getClosestPoint = (pos) => {
    const MAX_DISTANCE = 50;

    if (this.state.segments.length == 0) return;

    // check the next 10 points
    let minPoint = this.state.currSegIndex;
    let [currSeg, currPoint] = this.state.currSegIndex;
    let testPoints = 25;
    let minDist = 1000;

    for (let i = 0; i < testPoints; i++) {
      let pointIndex = currPoint + i;
      if (
        currPoint + i > this.state.segments[currSeg].length &&
        currSeg < this.state.segments.length
      ) {
        currSeg += 1;
        pointIndex =
          (currPoint + i) % this.state.segments[currSeg].coords.length;
      }
      const thisSegment = this.state.segments[currSeg];
      let thisDist = haversine(pos, thisSegment.coords[pointIndex]);
      if (thisDist < minDist) {
        minDist = thisDist;
        minPoint = [currSeg, pointIndex];
      }
    }

    if (minDist < MAX_DISTANCE) {
      return minPoint;
    }

    // if distance too high, check all points
    minDist = haversine(pos, this.state.segments[0].coords[0]);
    minPoint = [0, 0];
    this.state.segments.forEach((segment, sIndex) => {
      segment.coords.forEach((point, pIndex) => {
        let newDist = haversine(pos, point);
        if (newDist < minDist) {
          minDist = newDist;
          minPoint = [sIndex, pIndex];
        }
      });
    });
    return minPoint;
  };

  getDistArray = () => {
    this.distArray = [];
    for (let i = 0; i < this.state.segments.length; i++) {
      let currDists = [];
      this.distArray.push(currDists);
      const currSegment = this.state.segments[i].coords;
      let totalDist = 0;
      for (let i = 0; i < currSegment.length - 1; i++) {
        currDists.push(totalDist);
        totalDist += haversine(currSegment[i], currSegment[i + 1]);
      }
      currDists.push(totalDist);
    }
  };

  updateTimeLeft = async (point) => {
    if (!this.state.segments) return;

    let timeLeft = 0;

    if (!this.distArray || this.distArray.length == 0) this.getDistArray();

    const currDist = this.distArray[point[0]][point[1]];
    const totalDist = this.distArray[point[0]][
      this.distArray[point[0]].length - 1
    ];
    timeLeft +=
      (1 - currDist / totalDist) * this.state.segments[point[0]].duration;

    for (let i = point[0] + 1; i < this.state.segments.length; i++) {
      timeLeft += this.state.segments[i].duration;
    }

    this.setState({ timeLeft });
  };

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

      let fuelCap = this.props.route.params.fuelCap;
      let mpg = this.props.route.params.mpg;
      let mpgCity = this.props.route.params.mpgCity
        ? this.props.route.params.mpgCity
        : mpg;
      let mpgHighway = this.props.route.params.mpgHighway
        ? this.props.route.params.mpgHighway
        : mpg;

      // if you are going from start to first stop, start with less gas
      let fuelLeft = fuelCap;
      if (removedStopIndex == 0) fuelLeft = this.props.route.params.fuelLeft;

      let url = `${ROOT_URL}/api/directions/${start}/${end}/${fuelLeft}/${fuelCap}/${mpg}/true/0/${stopToReplace}?mpgCity=${mpgCity}&mpgHighway=${mpgHighway}`;
      if (!this.state.calcOnGas)
        url = `${ROOT_URL}/api/directions/${start}/${end}/${fuelLeft}/${fuelCap}/${mpg}/false/1/${stopToReplace}`;

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

  renderTimeLeft = () => {
    if (this.state.segments.length == 0 || this.state.isStopShown) return null;

    return (
      <GpsDisplay
        gpsMode={this.state.GpsMode}
        timeLeft={this.state.timeLeft}
        onStart={() => {
          this.setState({ GpsMode: true });
        }}
      />
    );
  };

  getMapRegion = () => {
    if (this.state.GpsMode && this.state.location != undefined) {
      let loc = this.state.fineLocation;
      if (!loc) {
        loc = {
          latitude: this.state.location.coords.latitude,
          longitude: this.state.location.coords.longitude,
        };
      }
      return {
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
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
          provider={PROVIDER_GOOGLE}
          ref={(ref) => (this.mapComponent = ref)}
          style={{ width: "100%", height: "100%", zIndex: -1 }}
          initialRegion={{
            latitude: parseFloat(this.props.route.params.startingLat),
            longitude: parseFloat(this.props.route.params.startingLong),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          region={this.getMapRegion()}
          onPress={this.onMapPress}
          showsUserLocation={true}
          onUserLocationChange={(e) => {
            this.setState({
              fineLocation: {
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
              },
            });
          }}
          customMapStyle={this.context.theme === "dark" ? nightStyle : []}
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

          {/* {this.state.segments.length > 0 && (
            <MapView.Polyline
              coordinates={this.state.segments.map((seg) => seg.coords).flat(1)}
              strokeWidth={4}
              strokeColor="#0000ff"
            ></MapView.Polyline>
          )} */}

          {this.state.segments.map((seg, index) => {
            const transparent = "#0000ff30";
            const regular = "#0000ff";
            if (index == this.state.currSegIndex[0]) {
              const pointIndex = this.state.currSegIndex[1];
              return (
                <>
                  <MapView.Polyline
                    key={index}
                    coordinates={seg.coords.slice(0, pointIndex + 1)}
                    strokeWidth={4}
                    strokeColor={transparent}
                  />
                  <MapView.Polyline
                    key={index + 0.1}
                    coordinates={seg.coords.slice(pointIndex)}
                    strokeWidth={4}
                    strokeColor={regular}
                  />
                </>
              );
            }
            let color = regular;
            if (index < this.state.currSegIndex[0]) color = transparent;
            return (
              <MapView.Polyline
                key={index}
                coordinates={seg.coords}
                strokeWidth={4}
                strokeColor={color}
              />
            );
          })}
        </MapView>

        <TouchableOpacity
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

        <ErrorModal
          visible={this.state.showingError}
          title={"No Route Found"}
          subtitle={
            "Sorry, no route was found between those locations."
          }
          onConfirm={() => {
            this.setState({ showingModal: false });
            this.props.navigation.navigate("LocationInput");
          }}
        />

        <StopInfo
          anim={slideAnimation}
          currStop={currStop}
          onDeleteStop={this.onDeletePress}
        />

        {this.renderTimeLeft()}
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

  timeLeft: {
    position: "absolute",
    fontSize: 12,
    right: 10,
    top: 10,
  },
});
