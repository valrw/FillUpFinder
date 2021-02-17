import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableWithoutFeedback } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { API_KEY, ROOT_URL } from "../constants/api";
import PolyLine from "@mapbox/polyline";

class MapDisplay extends Component {
  state = {
    coords: [],
    start: { latitude: 0, longitude: 0 },
    end: { latitude: 0, longitude: 0 },
    stops: 0,
  };

  componentDidMount() {
    var params = this.props.route.params;
    var start = params.startingPlaceId;
    var end = params.endingPlaceId;
    var fuelLeft = params.fuelLeft;
    var fuelCap = params.fuelCap;
    var mpg = params.mpg;
    this.getDirections(start, end, fuelLeft, fuelCap, mpg);
  }

  async getDirections(startId, destinationId, fuelLeft, fuelCap, mpg) {
    try {
      let resp = await fetch(
        `${ROOT_URL}/api/directions/${startId}/${destinationId}/${fuelLeft}/${fuelCap}/${mpg}/true`
      );
      let respJson = await resp.json();
      let coords = respJson.route;

      // TODO: Display the number of stops on the screen
      console.log(respJson.stops);
      let stops = respJson.stops;

      var start = coords[0];
      var end = coords[coords.length - 1];
      this.setState({ coords, start, end, stops });
      return coords;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MapView
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
            title="start"
            coordinate={{
              latitude: this.state.end.latitude,
              longitude: this.state.end.longitude,
            }}
          />

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
        <Text
        style={{ backgroundColor: 'white' }}>
        Total stops: {this.state.stops}
        </Text>
      </View>
    );
  }
}

export default MapDisplay;
