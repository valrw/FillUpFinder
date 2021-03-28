import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  Animated,
} from "react-native";
import { Text } from "@ui-kitten/components";
import MapView, { Marker, Callout } from "react-native-maps";
import { API_KEY, ROOT_URL } from "../constants/api";
import PolyLine from "@mapbox/polyline";
import colors from "../constants/colors";
import { ScrollView } from "react-native-gesture-handler";
import { useEffect } from "react";

class MapDisplay extends Component {
  state = {
    coords: [],
    start: { latitude: 0, longitude: 0 },
    end: { latitude: 0, longitude: 0 },
    stops: 0,
    stopsList: [],

    isStopShown: false,
    currStopIndex: 0,
    slideAnimate: new Animated.Value(260),
  };

  constructor(props) {
    super(props);
    this.mapComponent = null;
  }

  componentDidMount() {
    var params = this.props.route.params;
    var start = params.startingPlaceId;
    var end = params.endingPlaceId;
    var fuelLeft = params.fuelLeft;
    var fuelCap = params.fuelCap;
    var mpg = params.mpg;
    var calcOnGas = true;
    if (params.calcOnGas == 1) calcOnGas = false;
    var numStops = params.numStops;

    this.getDirections(start, end, fuelLeft, fuelCap, mpg, calcOnGas, numStops);
  }

  // Call the back end api to get the route
  async getDirections(start, end, fuelLeft, fuelCap, mpg, calcOnGas, numStops) {
    try {
      var url = `${ROOT_URL}/api/directions/${start}/${end}/${fuelLeft}/${fuelCap}/${mpg}/`;
      if (calcOnGas) url = url + "true";
      else url = url + "false/" + numStops;

      let resp = await fetch(url);
      let respJson = await resp.json();
      let coords = respJson.route;

      let stops = respJson.stops;
      let stopsList = respJson.stopsList;

      var start = coords[0];
      var end = coords[coords.length - 1];

      this.setState({ coords, start, end, stops, stopsList });
      // Zoom out the map
      this.mapComponent.animateToRegion(respJson.zoomBounds);

      return coords;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // load in the loading spinner when the route is loading
  loadingSpinner() {
    if (this.state.coords.length == 0) {
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

    this.setState({ currStopIndex: index, isStopShown: true });

    // Animate the slide in entrance of the stop information view
    if (!this.state.isStopShown) slideInAnimation.start();
  };

  // Render the overview image for each stop
  renderStopImage = (photos) => {
    if (photos == undefined || photos.length == 0) return;

    let photo = photos[0];
    if (photo.photo_reference == undefined) return;

    let maxheight = 300;
    let currUri = `https://maps.googleapis.com/maps/api/place/photo?maxheight=${maxheight}&photoreference=`;
    currUri = currUri + photo.photo_reference;
    currUri = currUri + "&key=" + API_KEY;
    return <Image source={{ uri: currUri }} style={styles.cardImage} />;
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
      toValue: 260,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  renderRatingsInfo = (rating) => {
    if (rating == undefined) return;
    return (
      <View style={styles.ratingView}>
        <Image
          style={styles.starIcon}
          resizeMode="contain"
          source={require("../assets/star.png")}
        />
        <Text>{rating + "/5"}</Text>
      </View>
    );
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

          <MapView.Polyline
            coordinates={this.state.coords.slice(
              0,
              Math.floor(this.state.coords.length / 2) + 1
            )}
            strokeWidth={4}
            strokeColor="blue"
          />
          <MapView.Polyline
            coordinates={this.state.coords.slice(
              Math.floor(this.state.coords.length / 2),
              this.state.coords.length
            )}
            strokeWidth={4}
            strokeColor="blue"
          />
        </MapView>
        {this.loadingSpinner()}

        <Animated.View style={[styles.cardView, slideAnimation]}>
          <View style={styles.titleAndRating}>
            <Text style={styles.cardTitle}> {currStop.name}</Text>
            {this.renderRatingsInfo(currStop.rating)}
          </View>
          <Text> {currStop.vicinity}</Text>
          {this.renderStopImage(currStop.photos)}
        </Animated.View>
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

  cardView: {
    width: "90%",
    height: "30%",
    position: "absolute",
    bottom: 20,
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 20,
    flexDirection: "column",
  },

  titleAndRating: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  cardTitle: {
    width: "80%",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },

  ratingView: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  starIcon: {
    height: 15,
    width: 15,
    right: 3,
  },

  cardScroll: {
    height: "60%",
    width: "100%",
  },

  cardImage: {
    marginTop: 10,
    marginRight: 8,
    height: "70%",
    resizeMode: "contain",
  },
});
