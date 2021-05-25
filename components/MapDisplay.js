import React, { PureComponent } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import { ROOT_URL } from "../constants/api";
import colors from "../constants/colors";
// import StopInfo from "../components/StopInfo";
import ConfirmModal from "../components/ConfirmModal";
import ErrorModal from "../components/ErrorModal";
// import GpsDisplay from "../components/GpsDisplay";
import { getLocation } from "../services/LocationService.js";
import haversine from "haversine-distance";
import { nightStyle } from "../constants/mapStyles.js";
import { StoreContext } from "../contexts/StoreContext";
import debounce from "lodash.debounce";
import MarkerPointer from "./MarkerPointer";
import { Icon } from "@ui-kitten/components";

// const ANIMATED_VAL = 310;

class MapDisplay extends Component {
  static contextType = StoreContext;
  constructor(props) {
    super(props);
    this.mapComponent = null;
    this.state = {
      segments: [],
      start: { latitude: 0, longitude: 0 },
      end: { latitude: 0, longitude: 0 },
      stopsList: [],
      calcOnGas: true,
      GpsMode: false,
      recalculating: false,

      isStopShown: false,
      currStopIndex: 0,
      currSegIndex: [0, 0],
      slideAnimate: new Animated.Value(ANIMATED_VAL),
      timeLeft: 0,

      showingModal: false,
      showingError: false,
      replacingStop: false,

      fineLocation: null,
    };
  }

  zoomToUserLocation = (coords) => {
    if (!coords) return;
    const camera = {
      center: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      altitude: 10000,
      zoom: 15,
    };
    this.mapComponent.animateCamera(camera, 5);
  };

  componentDidMount() {
    // let params = this.props.route.params;
    let params = this.props.params;
    let start = params.startingPlaceId;
    let end = params.endingPlaceId;
    let placeIds = params.placeIdsList;
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
      const newLoc = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      this.setState({ fineLocation: newLoc });
    });

    this.getPositionUpdate = debounce(this.getPositionUpdate, 500);
    this.prevLocation = {
      latitude: parseFloat(params.startingLat),
      longitude: parseFloat(params.startingLong),
    };

    this.getDirections(
      start,
      end,
      placeIds,
      fuelLeft,
      fuelCap,
      mpg,
      calcOnGas,
      numStops,
      mpgCity,
      mpgHighway
    );
  }

  // async handleStops(startPos, endPos, placeIds, fuelLeft, fuelCap, mpg, calcOnGas, numStops, mpgCity = mpg, mpgHighway = mpg) {
  //   try {
  //     console.log('BEFORE: ', placeIds)
  //     placeIds.splice(0, 1);
  //     var tempStart = [startPos]
  //     var allPlaceIds = tempStart.concat(placeIds);
  //     allPlaceIds.concat(endPos);
  //     console.log('AFTER: ', allPlaceIds)

  //     for (let stop = 0; stop < allPlaceIds.length - 1; stop++) {
  //       var url = `${ROOT_URL}/api/directions/${allPlaceIds[stop]}/${allPlaceIds[stop+1]}/${fuelLeft}/${fuelCap}/${mpg}/${calcOnGas}/`;
  //       if (!calcOnGas) url = url + `${numStops}/`;
  //       else url = url + `?mpgCity=${mpgCity}&mpgHighway=${mpgHighway}`;

  //       var resp = await fetch(url);
  //       var respJson = await resp.json();
  //       var segments = respJson.route;

  //       var stops = respJson.stops;
  //       var stopsList = respJson.stopsList;

  //       var start = segments[0].coords[0];
  //       var lastSeg = segments[segments.length - 1];
  //       var end = lastSeg.coords[lastSeg.coords.length - 1];

  //       this.setState((prevState) => {
  //         prevSegments = [...prevState.segments];
  //         prevSegments.append(segments);

  //         prevStopsList = [...prevState.stopsList];
  //         prevStopsList.append(stopsList);

  //         this.setState({ segments: prevSegments, stopsList: prevStopsList});
  //       })

  //       // this.setState({ segments, start, end, stops, stopsList });
  //     }

  //     // Zoom out the map
  //     this.mapComponent.animateToRegion(respJson.zoomBounds);
  //     this.getPositionUpdate(this.state.location);

  //     return segments;
  //   } catch (error) {
  //     console.log(error);
  //     return error;
  //   }
  // }

  getPositionUpdate = (position) => {
    if (!position) return;
    if (!this.state.GpsMode) return;

    const MIN_DIST = 50;
    const REROUTE_DIST = 300;
    let pos = {
      latitude: position.latitude,
      longitude: position.longitude,
    };

    // update position when you have moved sufficiently
    if (
      !this.state.fineLocation ||
      this.state.timeLeft == 0 ||
      haversine(pos, this.prevLocation) > MIN_DIST
    ) {
      this.prevLocation = { latitude: pos.latitude, longitude: pos.longitude };
      let closest = this.getClosestPoint(pos);
      if (!closest) return;

      const closestPoint = this.state.segments[closest[0]].coords[closest[1]];
      if (haversine(pos, closestPoint) > REROUTE_DIST) {
        this.recalculateRoute();
        return;
      }

      this.updateTimeLeft(closest);
      this.setState({ currSegIndex: closest });
    }
  };

  // Call the back end api to get the route
  async getDirections(
    startPos,
    endPos,
    placeIds,
    fuelLeft,
    fuelCap,
    mpg,
    calcOnGas,
    numStops,
    mpgCity = mpg,
    mpgHighway = mpg
  ) {
    try {
      var url = `${ROOT_URL}/api/${
        placeIds.length > 0 ? "custom-" : ""
      }directions/`;
      url =
        url +
        `${startPos}/${endPos}/${fuelLeft}/${fuelCap}/${mpg}/${calcOnGas}`;
      if (!calcOnGas) url += `/${numStops}`;
      else url += `?mpgCity=${mpgCity}&mpgHighway=${mpgHighway}`;

      if (placeIds.length > 0) {
        url += `${calcOnGas ? "&" : "?"}stop=${placeIds[0]}`;
        for (let i = 1; i < placeIds.length; i++) {
          url += `&stop=${placeIds[i]}`;
        }
      }

      let resp = await fetch(url);

      if (resp.status == 422) {
        this.setState({ showingError: true });
      } else {
        let respJson = await resp.json();
        let segments = respJson.route;

        let stopsList = respJson.stopsList;

        let start = segments[0].coords[0];
        let lastSeg = segments[segments.length - 1];
        let end = lastSeg.coords[lastSeg.coords.length - 1];

        let timeLeft = 0;
        segments.forEach((seg) => {
          timeLeft += seg.duration;
        });

        this.setState({ segments, start, end, stopsList, timeLeft });
        // Zoom out the map
        this.mapComponent.animateToRegion(respJson.zoomBounds);
        this.getPositionUpdate(this.state.fineLocation);
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
    const totalDist =
      this.distArray[point[0]][this.distArray[point[0]].length - 1];
    timeLeft +=
      (1 - currDist / totalDist) * this.state.segments[point[0]].duration;

    for (let i = point[0] + 1; i < this.state.segments.length; i++) {
      timeLeft += this.state.segments[i].duration;
    }

    this.setState({ timeLeft });
  };

  recalculateRoute = async () => {
    let nextStop = null;
    if (this.state.currSegIndex[0] == this.state.stopsList.length)
      nextStop = this.props.route.params.endingPlaceId;
    else nextStop = this.state.stopsList[this.state.currSegIndex[0]].placeId;

    const { latitude, longitude } = this.state.fineLocation;
    const url = `${ROOT_URL}/api/update/?startLat=${latitude}&startLong=${longitude}&end=${nextStop}`;

    this.setState({ recalculating: true });
    try {
      const resp = await fetch(url);
      const respJson = await resp.json();

      const segments = [
        respJson,
        ...this.state.segments.slice(this.state.currSegIndex[0] + 1),
      ];
      this.setState({ segments, currSegIndex: [0, 0] });
      this.getPositionUpdate();
    } catch (error) {
      console.log(`Error fetching position update ${error}`);
    }

    this.setState({ recalculating: false });
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
      let start = this.props.params.startingPlaceId;
      if (removedStopIndex > 0)
        start = this.state.stopsList[removedStopIndex - 1].placeId;

      // the end will be either the next gas station of the route destination
      let end = this.props.params.endingPlaceId;
      if (removedStopIndex < this.state.stopsList.length - 1)
        end = this.state.stopsList[removedStopIndex + 1].placeId;

      let fuelCap = this.props.params.fuelCap;
      let mpg = this.props.params.mpg;
      let mpgCity = this.props.params.mpgCity ? this.props.params.mpgCity : mpg;
      let mpgHighway = this.props.params.mpgHighway
        ? this.props.params.mpgHighway
        : mpg;

      // if you are going from start to first stop, start with less gas
      let fuelLeft = fuelCap;
      if (removedStopIndex == 0) fuelLeft = this.props.params.fuelLeft;

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
    // let slideInAnimation = Animated.timing(this.state.slideAnimate, {
    //   toValue: 0,
    //   duration: 300,
    //   useNativeDriver: true,
    // });
    // Animate the slide in entrance of the stop information view
    // if (!this.state.isStopShown) slideInAnimation.start();
    // this.setState({ currStopIndex: index, isStopShown: true });
  };

  // Get blue icons for all icons, light blue for the selected icon
  // getMarkerIcon = (index) => {
  //   if (this.state.isStopShown && index == this.state.currStopIndex) {
  //     return require("../assets/map_marker2.png");
  //   } else return require("../assets/map_marker.png");
  // };

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
        recalculating={this.state.recalculating}
        onStart={() => {
          this.setState((prevState) => ({ GpsMode: !prevState.GpsMode }));
          this.zoomToUserLocation(this.state.fineLocation);
        }}
      />
    );
  };

  render() {
    // const slideAnimation = {
    //   transform: [{ translateY: this.state.slideAnimate }],
    // };
    // let currStop = { name: "", vicinity: "" };
    // if (this.state.isStopShown)
    //   currStop = this.state.stopsList[this.state.currStopIndex];

    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={(ref) => (this.mapComponent = ref)}
          style={{ width: "100%", height: "100%", zIndex: -1 }}
          initialRegion={{
            latitude: parseFloat(this.props.params.startingLat),
            longitude: parseFloat(this.props.params.startingLong),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={this.onMapPress}
          showsUserLocation={true}
          zoomTapEnabled={false}
          onUserLocationChange={(e) => {
            if (this.state.GpsMode) {
              this.zoomToUserLocation(e.nativeEvent.coordinate);
              this.getPositionUpdate(e.nativeEvent.coordinate);
            }
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
              tracksViewChanges={false}
              onPress={(e) => {
                this.props.setCurrStop(station);
                e.stopPropagation();
                // this.onMarkerClick(index);
              }}
              tracksViewChanges={false}
            >
              <Image
                source={this.props.getMarkerIcon(station)}
                style={styles.mapMarkerIcon}
              />
              <Callout tooltip>
                {/* <View
                  style={{ width: 100, height: 100, backgroundColor: "white" }}
                > */}
                <MarkerPointer />
                {/* </View> */}
              </Callout>
            </Marker>
          ))}

          {this.state.segments.map((seg, index) => {
            const transparent = "#0000ff30";
            const regular = "#0000ff";
            if (index == this.state.currSegIndex[0]) {
              const pointIndex = this.state.currSegIndex[1];
              return (
                <>
                  <MapView.Polyline
                    key={seg.coords[0].latitude}
                    coordinates={seg.coords.slice(0, pointIndex + 1)}
                    strokeWidth={4}
                    strokeColor={transparent}
                  />
                  <MapView.Polyline
                    key={`alt${seg.coords[0].latitude}`}
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
                key={seg.coords[0].latitude}
                coordinates={seg.coords}
                strokeWidth={4}
                strokeColor={color}
              />
            );
          })}
        </MapView>
        <TouchableOpacity
          onPress={() => this.zoomToUserLocation(this.state.fineLocation)}
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
        </TouchableOpacity>{" "}
        */}
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
          subtitle={"Sorry, no route was found between those locations."}
          onConfirm={() => {
            this.setState({ showingModal: false });
            this.props.navigation.navigate("LocationInput");
          }}
        />
        {/* <StopInfo
          anim={slideAnimation}
          currStop={currStop}
          onDeleteStop={this.onDeletePress}
        /> */}
        {/* {this.renderTimeLeft()} */}
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
  icon: {
    width: 20,
    height: 20,
  },
  callout: {
    width: 20,
    height: 20,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: "#3fdcfc",
    bottom: 30,
    // marginBottom: -20,
    // position: "relative",
    // bottom: 100,
    // border: 13,
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
