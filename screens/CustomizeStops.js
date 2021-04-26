import React, { Component } from "react";
import { StyleSheet, Image, View, FlatList, ScrollView } from "react-native";
import LocationInputText from "../components/LocationInputText";
import {
  Text,
  Button,
  Icon,
} from "@ui-kitten/components";
import { getLocation, getPlace } from "../services/LocationService.js";

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
    }


    getPlaceInfo = (place, details, index) => {
        if (index == 0) {
          // Starting Location
          var location = details.geometry.location;
          this.setState({
            startingPlaceId: place.place_id,
            startingLat: location.lat,
            startingLong: location.lng,
          });
          return;
        } else if (index == 100) {
          // Ending Location
          this.setState({ endingPlaceId: place.place_id });
        } else {
          currPlaceIds = this.state.placeIdsList
          currPlaceIds[index] = place.place_id
          this.setState({ placeIdsList: currPlaceIds })
        }
      };


    addStop = () => {
        this.setState({
            stopCount: this.state.stopCount + 1,
            stops: this.state.stops.concat(this.state.stopCount),
        });
    };


    renderStops = (item, index) => {
        let stopNumber = item + 1
        return (
            <View key={stopNumber} style={{ width: "100%", alignItems: "center" }}>
                <Text style={styles.inputTitle}>Stop {stopNumber}:</Text>
                <LocationInputText
                onSelectLocation={(data, details) =>
                    this.getPlaceInfo(data, details, stopNumber)
                }
                stylesInput={styles.inputBox}
                listViewStyle={{ width: "120%"}}
                stylesContainer={{ width: "85%", height: 40, zIndex: index}}
                />
            </View>
        );
    };


    render() {
        let currZIndex = 100;
        return (
            <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                    stylesInput={styles.inputBox}
                    stylesContainer={{ width: "85%", height: 40, zIndex: currZIndex }}
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
                    return this.renderStops(stop, currZIndex - 1 - index);
                })}

                <Text style={styles.inputTitle}>Destination:</Text>
                <LocationInputText
                onSelectLocation={(data, details) =>
                    this.getPlaceInfo(data, details, 100)
                }
                stylesInput={styles.inputBox}
                stylesContainer={{ width: "85%", height: 40, zIndex: currZIndex - 1 - this.state.stops.length }}
                />

                <Button style={styles.addStopsButton} onPress={this.addStop}>
                <Icon
                    style={styles.addStopsIcon}
                    fill="#ffffff"
                    name="plus-square-outline"
                />
                </Button>
            </ScrollView>
        );
    }
}

export default CustomizeStops;

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
      zIndex: -1,
    },
  
    inputBox: {
      paddingHorizontal: 10,
      height: 40,
      borderWidth: 1,
      borderRadius: 3,
      borderColor: "#e4e9f2",
      backgroundColor: "#F7F9FC",
      marginBottom: 4,
      zIndex: 5,
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