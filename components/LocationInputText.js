import React, { Component } from "react";
import { View } from "react-native";
import Constants from "expo-constants";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

class LocationInputText extends Component {
  state = {
    sessionId: "",
    borderColor: this.props.themedColors.borderColor,
  };

  updateSessionId = () => {
    var sessionId = Math.random().toString(36).substring(2);
    this.setState({ sessionId });
  };

  componentDidMount() {
    this.updateSessionId();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.themedColors.borderColor != prevProps.themedColors.borderColor
    ) {
      this.setState({ borderColor: this.props.themedColors.borderColor });
    }
  }

  render() {
    const bgColor = this.props.themedColors.bgColor;
    const textColor = this.props.themedColors.textColor;
    const borderColor = this.props.themedColors.borderColor;

    return (
      <View style={this.props.stylesContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          textInputProps={{
            onFocus: () => this.setState({ borderColor: "#3366FF" }),
            onBlur: () =>
              this.setState({
                borderColor: borderColor,
              }),
            placeholderTextColor: "#8F9BB3",
          }}
          fetchDetails={true}
          onPress={(data, details) => {
            this.updateSessionId();
            this.props.onSelectLocation(data, details);
          }}
          ref={this.props.input_ref}
          query={{
            key: Constants.manifest.extra.API_KEY,
            language: "en",
          }}
          nearbyPlacesAPI="GooglePlacesSearch"
          styles={{
            textInput: {
              ...this.props.stylesInput,
              borderColor: this.state.borderColor,
            },
            listView: [
              {
                top: 40,
                zIndex: 15,
                position: "absolute",
              },
              this.props.listViewStyle,
            ],
            row: { backgroundColor: bgColor },
            poweredContainer: { backgroundColor: bgColor },
            description: { color: textColor },
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
