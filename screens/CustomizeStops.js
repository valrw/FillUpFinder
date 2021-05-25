import React, { Component } from "react";
import { Text, Button, Icon, withStyles } from "@ui-kitten/components";
import LocationInputText from "../components/LocationInputText";
import { getLocation, getPlace } from "../services/LocationService.js";
import { StyleSheet, Image, View, ScrollView, LogBox } from "react-native";
LogBox.ignoreLogs(['VirtualizedLists should never be nested inside plain ScrollViews with the same orientation - use another VirtualizedList-backed container instead.'])

class CustomizeStops extends Component {
    constructor(props) {
        super(props);
        this.startingInputRef = React.createRef();
    }

    state = {
        startingLat: 33.8121,
        startingLong: -117.919,
        startingPlaceId: "",
        endingPlaceId: "",
        placeIdsList: [],

        stops: [],
        stopCount: 0,
      };

    
    componentDidMount() {
        var params = this.props.route.params;
        var start = params.startingPlaceId;
        var end = params.endingPlaceId;
        var latitude = params.startingLat;
        var longitude = params.startingLong;

        if (start !== "") {
            this.setState({ startingPlaceId: start });
        }

        if (latitude !== "") {
            this.setState({ startingLat: latitude });
        }

        if (longitude !== "") {
            this.setState({ startingLat: longitude });
        }

        if (end !== "") {
            this.setState({ endingPlaceId: end });
        }
    }


    getPlaceInfo = (place, details, index) => {
        let currPlaceIds = this.state.placeIdsList

        if (index == 0) {
          // Starting Location
          var location = details.geometry.location;
          this.setState({
            startingPlaceId: place.place_id,
            startingLat: location.lat,
            startingLong: location.lng,
          });
        } else if (index == 100) {
          // Ending Location
          this.setState({ endingPlaceId: place.place_id });
        } else {
          currPlaceIds[index - 1] = place.place_id
          this.setState({ placeIdsList: currPlaceIds })
        }
    };


    addStop = () => {
        this.setState({
            stops: this.state.stops.concat(this.state.stopCount),
            stopCount: this.state.stopCount + 1,
        });
    };


    renderStops = (item, index) => {
        const themedColors = {
            bgColor: this.props.eva.theme["background-basic-color-2"],
            textColor: this.props.eva.theme["text-basic-color"],
            borderColor: this.props.eva.theme["border-basic-color-5"],
        };
        
        let stopNumber = index + 1
        return (
            <View key={stopNumber} style={{ width: "100%", alignItems: "center" }}>
                <Text style={styles.inputTitle}>Stop {stopNumber}:</Text>
                <LocationInputText
                onSelectLocation={(data, details) =>
                    this.getPlaceInfo(data, details, stopNumber)
                }
                themedColors={themedColors}
                stylesInput={this.props.eva.style.themedInputBox}
                listViewStyle={{ width: "120%"}}
                stylesContainer={{ width: "85%", height: 40 }}
                />
            </View>
        );
    };


    renderDoneButton = () => {
        if (this.state.startingPlaceId !== "" && this.state.endingPlaceId !== "") {
            return (
                <Button
                    style={styles.navigateButton}
                    size="large"
                    onPress={this.doneCustomizing}
                >
                    Done
                </Button>
            )
        }
    };


    doneCustomizing = () => {
        this.props.navigation.navigate("LocationInput", {
          startingLat: this.state.startingLat,
          startingLong: this.state.startingLong,
          startingPlaceId: this.state.startingPlaceId,
          endingPlaceId: this.state.endingPlaceId,
          placeIdsList: this.state.placeIdsList
        });
    };


    render() {
        const themedColors = {
            bgColor: this.props.eva.theme["background-basic-color-2"],
            textColor: this.props.eva.theme["text-basic-color"],
            borderColor: this.props.eva.theme["border-basic-color-5"],
        };

        return (
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps='always'>
                <Text style={styles.inputTitle}>Starting point:</Text>
                <View style={
                    Platform.OS == "android"
                    ? styles.startingInputContainer
                    : [styles.startingInputContainer, { zIndex: 5 }]
                }>
                    <LocationInputText
                    onSelectLocation={(data, details) =>
                        this.getPlaceInfo(data, details, 0)
                    }
                    input_ref={this.startingInputRef}
                    themedColors={themedColors}
                    stylesInput={this.props.eva.style.themedInputBox}
                    stylesContainer={{ width: "85%", height: 40}}
                    />
                    <Button
                        size="small"
                        accessoryLeft={() => (
                        <Image
                            source={require("../assets/target_white.png")}
                            style={{ width: 25, height: 25 }}
                        ></Image>
                        )}
                        onPress={async () => {
                        const loc = await getLocation();
                        const lat = loc.coords.latitude;
                        const lng = loc.coords.longitude;
                        const place = await getPlace(lat, lng);

                        this.setState({
                            startingPlaceId: place.place_id,
                            startingLat: lat,
                            startingLong: lng,
                        });

                        this.startingInputRef.current?.setAddressText(place.address);
                        }}
                    ></Button>
                </View>

                {this.state.stops.map((stop, index) => {
                    return this.renderStops(stop, index);
                })}

                <Text style={styles.inputTitle}>Destination:</Text>
                <LocationInputText
                onSelectLocation={(data, details) =>
                    this.getPlaceInfo(data, details, 100)
                }
                themedColors={themedColors}
                stylesInput={this.props.eva.style.themedInputBox}
                stylesContainer={{ width: "85%", height: 40 }}
                />

                <Button style={styles.addStopsButton} onPress={this.addStop}>
                <Icon
                    style={styles.addStopsIcon}
                    fill="#ffffff"
                    name="plus-square-outline"
                />
                </Button>

                {this.renderDoneButton()}
                
            </ScrollView>
        );
    }
}

export default CustomizeStops = withStyles(CustomizeStops, (theme) => ({
    themedInputBox: {
        paddingHorizontal: 10,
        height: 40,
        borderWidth: 1,
        borderRadius: 3,
        backgroundColor: theme["background-basic-color-2"],
        marginBottom: 4,
        zIndex: 5,

        color: theme["text-basic-color"],
    },
}));

const styles = StyleSheet.create({
    scrollContainer: {
      alignItems: "center",
    },
  
    inputTitle: {
      marginTop: "5%",
      width: "86%",
      fontSize: 12,
      color: "#8F9BB3",
      textAlign: "left",
    },
  
    inputBox: {
      paddingHorizontal: 10,
      height: 40,
      borderWidth: 1,
      borderRadius: 3,
      borderColor: "#e4e9f2",
      backgroundColor: "#F7F9FC",
      marginBottom: 4,
    },
    
    addStopsButton: {
        width: 80,
        height: 50,
        marginVertical: 20,
    },

    addStopsIcon: {
        width: 35, 
        height: 35,
    },

    startingInputContainer: {
        width: "86%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
  });