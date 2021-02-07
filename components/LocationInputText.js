import React, { Component } from "react";
import { StyleSheet, Text, View, Button, Platform } from "react-native";
import { API_KEY } from "../constants/api";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

class LocationInputText extends Component {
  state = { sessionId: "" };

  updateSessionId = () => {
    var sessionId = Math.random().toString(36).substring(2);
    this.setState({ sessionId });
  };

  componentDidMount() {
    this.updateSessionId();
  }

  render() {
    return (
      <View style={this.props.stylesContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          fetchDetails={true}
          onPress={(data, details) => {
            this.updateSessionId();
            this.props.onSelectLocation(data, details);
          }}
          query={{
            key: API_KEY,
            language: "en",
          }}
          nearbyPlacesAPI="GooglePlacesSearch"
          styles={{
            textInput: this.props.stylesInput,
            listView: {
              top: 40,
              color: "black",
              zIndex: 15,
              position: "absolute",
            },
          }}
          onFail={(error) => console.error(error)}
          onNotFound={() => console.log("Not found")}
          onTimeout={() => console.log("timeout")}
          debounce={200}
          session={this.sessionId}
        />
      </View>
    );
  }
}

export default LocationInputText;
