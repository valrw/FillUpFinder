import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";
import { API_KEY } from "../constants/api-key";
import PolyLine from "@mapbox/polyline";

class MapDisplay extends Component {
  state = { coords: [] };

  componentDidMount() {
    var params = this.props.route.params;
    var start = params.startingLat + "," + params.startingLong;
    var end = params.endingLat + "," + params.endingLong;
    console.log(start + " " + end);
    this.getDirections(start, end);
  }

  async getDirections(startLoc, destinationLoc) {
    try {
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${API_KEY}`
      );
      let respJson = await resp.json();
      let points = PolyLine.decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1],
        };
      });
      this.setState({ coords: coords });
      return coords;
    } catch (error) {
      return error;
    }
  }

  render() {
    return (
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: parseFloat(this.props.route.params.startingLat),
          longitude: parseFloat(this.props.route.params.startingLong),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <MapView.Polyline
          coordinates={this.state.coords}
          strokeWidth={4}
          strokeColor="blue"
        />
      </MapView>
    );
  }
}

export default MapDisplay;
