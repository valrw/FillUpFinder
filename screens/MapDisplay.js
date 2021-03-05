import React, { Component } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Text } from "@ui-kitten/components";
import MapView, { Marker, Callout } from "react-native-maps";
import { API_KEY, ROOT_URL } from "../constants/api";
import PolyLine from "@mapbox/polyline";
import colors from "../constants/colors";

class MapDisplay extends Component {
  state = {
    coords: [],
    start: { latitude: 0, longitude: 0 },
    end: { latitude: 0, longitude: 0 },
    stops: 0,
    stopsList: [],
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

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={(ref) => (this.mapComponent = ref)}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: parseFloat(this.props.route.params.startingLat),
            longitude: parseFloat(this.props.route.params.startingLong),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
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
              title={station.name}
              description={station.vicinity}
              key={index}
              image={require("../assets/map_marker.png")}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
            >
              <Callout tooltip>
                <View>
                  <View style={styles.bubble}>
                    <Text category="h6">{station.name}</Text>
                    <Text category="s2">{station.vicinity}</Text>
                    {/* {station.open_now != null && (
                      <Text category={station.open_now ? "success" : "danger"}>
                        {station.open_now ? "Open" : "Closed"}{" "}
                      </Text>
                    )} */}
                  </View>
                  <View style={styles.arrowBorder} />
                  <View style={styles.arrow} />
                </View>
              </Callout>
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
        <View style={styles.totalStops}>
          <Text category="h6">Total stops: {this.state.stops}</Text>
        </View>
        {this.loadingSpinner()}
      </View>
    );
  }
}

export default MapDisplay;

const styles = StyleSheet.create({
  totalStops: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "white",
    width: "100%",
    padding: 10,
  },

  container: {
    flexDirection: "column",
    color: colors.defaultBlue,
  },

  loadingSpinner: {
    position: "absolute",
    alignSelf: "center",
    top: "40%",
  },
  // Callout bubble
  bubble: {
    flexDirection: "column",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 0.5,
    padding: 10,
  },
  // Arrow below the bubble
  arrow: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: "#fff",
    borderWidth: 19,
    alignSelf: "center",
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: "#007a87",
    borderWidth: 16,
    alignSelf: "center",
    marginTop: -0.5,
  },
});
