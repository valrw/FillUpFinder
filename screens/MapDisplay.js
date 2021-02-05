import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { API_KEY } from "../constants/api-key";
import PolyLine from "@mapbox/polyline";

class MapDisplay extends Component {
  state = {
    coords: [],
    start: { latitude: 0, longitude: 0 },
    end: { latitude: 0, longitude: 0 },
  };

  componentDidMount() {
    var params = this.props.route.params;
    var start = params.startingPlaceId;
    var end = params.endingPlaceId;
    this.getDirections(start, end);
  }

  async getDirections(startId, destinationId) {
    try {
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${startId}&destination=place_id:${destinationId}&key=${API_KEY}`
      );
      let respJson = await resp.json();
      let points = PolyLine.decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1],
        };
      });

      var start = coords[0];
      var end = coords[coords.length - 1];
      this.setState({ coords, start, end });
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
          coordinates={this.state.coords}
          strokeWidth={4}
          strokeColor="blue"
        />
      </MapView>
    );
  }
}

export default MapDisplay;
