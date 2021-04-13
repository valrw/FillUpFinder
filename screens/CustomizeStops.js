import React, { Component } from "react";
import { StyleSheet, Platform, ScrollView, View } from "react-native";
import LocationInputText from "../components/LocationInputText";
import {
  Layout,
  Text,
  Button,
  Icon,
} from "@ui-kitten/components";

class CustomizeStops extends Component {
    state = {
        startingLat: 33.8121,
        startingLong: -117.919,
        startingPlaceId: "",
        endingPlaceId: "",

        stops: [],
        stopCount: 3,
        stopAdded: false,
      };
    
    componentDidMount() {
        if (this.state.stopAdded) {
            this.setState({ stopAdded: false });
        }

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
        } else if (index == 1) {
          // Ending Location
          this.setState({ endingPlaceId: place.place_id });
        }
      };

    addStop = () => {
        this.setState({
            stopCount: this.state.stopCount + 1,
            stopAdded: true,
            stops: this.state.stops.concat(this.state.stopCount)
        });
    };

    renderStops = () => {
        if (this.state.stopAdded) {
            let childKey1 = this.state.stopCount + 1
            let childKey2 = this.state.stopCount + 100
            let index = this.state.stopCount - 1
            
            return (
                this.state.stops.map((stopNumber) => 
                    <>
                        <Text key={childKey1} style={styles.inputTitle}>Stop {stopNumber}:</Text>
                        <LocationInputText
                        key={childKey2}
                        onSelectLocation={(data, details) =>
                            this.getPlaceInfo(data, details, {index})
                        }
                        stylesInput={styles.inputBox}
                        stylesContainer={
                            Platform.OS == "android"
                            ? { width: "86%", height: 40 }
                            : { width: "86%", height: 40, zIndex: 5 }
                        }
                        />
                    </>
                )
            )
        }

        
    }


    render() {
        return (
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.inputTitle}>Stop 1:</Text>
                <LocationInputText
                onSelectLocation={(data, details) =>
                    this.getPlaceInfo(data, details, 0)
                }
                stylesInput={styles.inputBox}
                stylesContainer={
                    Platform.OS == "android"
                    ? { width: "86%", height: 40 }
                    : { width: "86%", height: 40, zIndex: 5 }
                }
                />

                <Text style={styles.inputTitle}>Stop 2:</Text>
                <LocationInputText
                onSelectLocation={(data, details) =>
                    this.getPlaceInfo(data, details, 1)
                }
                stylesInput={styles.inputBox}
                stylesContainer={
                    Platform.OS == "android"
                    ? { width: "86%", height: 40 }
                    : { width: "86%", height: 40, zIndex: 5 }
                }
                />

                {this.renderStops()}

                <Button 
                style={styles.addStopsButton} 
                onPress={this.addStop}>
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
      flexDirection: "column",
      justifyContent: "flex-start",
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
      marginTop: 6,
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
  });