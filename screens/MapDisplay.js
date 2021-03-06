import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  Button,
} from "react-native";
import { Text } from "@ui-kitten/components";
import MapView, { Marker, Callout } from "react-native-maps";
import { API_KEY, ROOT_URL } from "../constants/api";
import PolyLine from "@mapbox/polyline";
import colors from "../constants/colors";
import { ScrollView } from "react-native-gesture-handler";

class MapDisplay extends Component {
  state = {
    coords: [],
    start: { latitude: 0, longitude: 0 },
    end: { latitude: 0, longitude: 0 },
    stops: 0,
    stopsList: [],

    isStopShown: false,
    currentStop: 0,
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

  onMarkerClick = (index) => {
    this.setState({
      currentStop: index,
      isStopShown: true,
    });
  };

  showStopInfo = () => {
    if (!this.state.isStopShown) return;

    let currStop = this.state.stopsList[this.state.currentStop];

    return (
      <View style={styles.cardView}>
        <Text style={styles.cardTitle}> {currStop.name}</Text>
        <Text> {currStop.vicinity}</Text>
        {this.renderStopImage(currStop.photos)}
      </View>
    );
  };

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

  getMarkerIcon = (index) => {
    if (this.state.isStopShown && index == this.state.currentStop) {
      return require("../assets/map_marker2.png");
    } else return require("../assets/map_marker.png");
  };

  render() {
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
          onPress={() => {
            if (this.state.isStopShown) this.setState({ isStopShown: false });
          }}
        >
          <MapView.Marker
            title="start"
            coordinate={{
              latitude: this.state.start.latitude,
              longitude: this.state.start.longitude,
            }}
          />
          <MapView.Marker
            title="end"
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
        {this.showStopInfo()}
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

  cardTitle: {
    width: "100%",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
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
