import React, { Component } from "react";
import { StyleSheet, Text, View, Button, Platform } from "react-native";
import { API_KEY } from "../constants/api-key";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const LocationInputText = (props) => {
  var session = Math.random().toString(36).substring(2);
  return (
    <View style={props.stylesContainer}>
      <GooglePlacesAutocomplete
        placeholder="Search"
        fetchDetails={true}
        onPress={(data, details) => {
          props.onSelectLocation(data, details);
        }}
        query={{
          key: API_KEY,
          language: "en",
        }}
        nearbyPlacesAPI="GooglePlacesSearch"
        styles={{
          textInput: props.stylesInput,
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
        session={session}
        debounce={200}
      />
    </View>
  );
};

export default LocationInputText;
