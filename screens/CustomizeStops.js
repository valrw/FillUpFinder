import React, { Component } from "react";
import { StyleSheet, Platform, View, FlatList } from "react-native";
import LocationInputText from "../components/LocationInputText";
import {
  Text,
  Button,
  Icon,
} from "@ui-kitten/components";

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

        stops: [],
        stopCount: 1,
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


    renderStops = (item, index) => {
        let stopNumber = item.item

        if (this.state.stopAdded) {            
            return (
                <View style={styles.scrollContainer}>
                    <Text style={styles.inputTitle}>Stop {stopNumber}:</Text>
                    <LocationInputText
                    onSelectLocation={(data, details) =>
                        this.getPlaceInfo(data, details, stopNumber)
                    }
                    input_ref={this.startingInputRef}
                    stylesInput={styles.inputBox}
                    listViewStyle={{ width: "120%" }}
                    stylesContainer={{ width: "85%", height: 40 }}
                    />
                </View>
            )
        }
    }


    render() {
        return (
            <FlatList 
                ListHeaderComponentStyle={styles.scrollContainer}
                ListHeaderComponent={
                <>
                    <Text style={styles.inputTitle}>Starting point:</Text>
                    <LocationInputText
                    onSelectLocation={(data, details) =>
                        this.getPlaceInfo(data, details, 0)
                    }
                    stylesInput={styles.inputBox}
                    stylesContainer={{ width: "85%", height: 40 }}
                    />
                </>}
                data={this.state.stops}
                renderItem={this.renderStops}
                keyExtractor={(item, index) => index.toString()}
                ListFooterComponentStyle={styles.scrollContainer}
                ListFooterComponent={
                <>
                    <Text style={styles.inputTitle}>Destination:</Text>
                    <LocationInputText
                    onSelectLocation={(data, details) =>
                        this.getPlaceInfo(data, details, 100)
                    }
                    stylesInput={styles.inputBox}
                    stylesContainer={{ width: "85%", height: 40 }}
                    />

                    <Button 
                    style={styles.addStopsButton} 
                    onPress={this.addStop}>
                    <Icon
                        style={styles.addStopsIcon}
                        fill="#ffffff"
                        name="plus-square-outline"
                    />
                    </Button>
                </>
                }
            />
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