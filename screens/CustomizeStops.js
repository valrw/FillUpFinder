import React, { Component } from "react";
import { Text, Button, Icon, withStyles } from "@ui-kitten/components";
import LocationInputText from "../components/LocationInputText";
import { getLocation, getPlace } from "../services/LocationService.js";
import { StyleSheet, Image, View, ScrollView, LogBox } from "react-native";
LogBox.ignoreLogs(['VirtualizedLists should never be nested inside plain ScrollViews with the same orientation - use another VirtualizedList-backed container instead.'])

class CustomizeStops extends Component {
    constructor(props) {
        super(props);

        const params = props.route.params;

        this.startingInputRef = React.createRef();
        this.destInputRef = React.createRef();
        this.stopInputRefs = [];
        
        this.startingRef = React.createRef();
        this.destRef = React.createRef();
        this.stopRefs = [];

        this.state = {
            startingLat: params.startingLat,
            startingLong: params.startingLong,
            startingPlaceId: params.startingPlaceId,
            endingPlaceId: params.endingPlaceId,
            startText: params.startText,
            endText: params.endText,
            placeIdsList: params.placeIdsList,
            stopsText: params.stopsText,

            stops: [],
            stopCount: 0,
        };
    }

    
    async componentDidMount() {
        this.startingRef.current?.updateAddressText(this.state.startText);
        this.destRef.current?.updateAddressText(this.state.endText);
        for (let i = 0; i < this.stopRefs.length; i++) {
            this.stopRefs[i].current?.updateAddressText(this.state.stopsText[i]);
        }
    }


    getPlaceInfo = (place, details, index) => {
        let currPlaceIds = this.state.placeIdsList;
        let currStopText = this.state.stopsText;

        if (index == 0) {
          // Starting Location
          var location = details.geometry.location;
          this.startingRef.current?.updateAddressText(place.description);
          this.setState({
            startingPlaceId: place.place_id,
            startingLat: location.lat,
            startingLong: location.lng,
            startText: this.startingInputRef.current?.getAddressText()
          });
        } else if (index == 100) {
          // Ending Location
          this.destRef.current?.updateAddressText(place.description);
          this.setState({ endingPlaceId: place.place_id });
        } else {
          this.stopRefs[index - 1].current?.updateAddressText(place.description);
          currPlaceIds[index - 1] = place.place_id;
          currStopText[index - 1] = place.description;
          this.setState({
              placeIdsList: currPlaceIds,
              stopsText: currStopText,
              endText: this.destInputRef.current?.getAddressText(),
          })
        }
    };


    addStop = () => {
        this.setState(prevState => ({
            placeIdsList: prevState.placeIdsList.concat(""),
            stops: prevState.stops.concat(this.state.stopCount),
            stopCount: prevState.stopCount + 1,
        }));
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
                input_ref={(ref) => this.stopInputRefs[index] = ref}
                ref={(ref) => this.stopRefs[index] = ref}
                initText={this.state.stopsText[index]}
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

    renderClearButton = () => {
        if (this.state.placeIdsList.length > 0) {
            return (
                <Button
                    style={{marginTop: 20, backgroundColor: "grey", borderColor: "grey"}}
                    size="medium"
                    onPress={this.clearStops}
                >
                    Clear Stops
                </Button>
            )
        }
    }


    doneCustomizing = () => {
        this.props.navigation.navigate("LocationInput", {
          startingLat: this.state.startingLat,
          startingLong: this.state.startingLong,
          startingPlaceId: this.state.startingPlaceId,
          endingPlaceId: this.state.endingPlaceId,
          startText: this.state.startText,
          endText: this.state.endText,
          placeIdsList: this.state.placeIdsList,
          stopsText: this.state.stopsText,
          prevScreen: "CustomizeStops",
        });
    };

    clearStops = () => {
        this.setState({
            placeIdsList: [],
            stops: [],
            stopCount: 0,
        });
    }


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
                    ref={this.startingRef}
                    initText={this.state.startText}
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

                {this.state.placeIdsList.map((stop, index) => {
                    return this.renderStops(stop, index);
                })}

                <Text style={styles.inputTitle}>Destination:</Text>
                <LocationInputText
                input_ref={this.destInputRef}
                ref={this.destRef}
                onSelectLocation={(data, details) =>
                    this.getPlaceInfo(data, details, 100)
                }
                initText={this.state.endText}
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
                {this.renderClearButton()}
                
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