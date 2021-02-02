import React, { Component } from "react";
import { StyleSheet, Text, View, Button, Platform } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import axios from "axios";

class VehicleInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            make: "Honda",
            model: "Civic",
            year: "2015",
            id: 35672,
            instruction: "Please enter your vehicle information.",
        }
    }

    updateModel = (model) => {
        this.setState({model})
    }

    updateMake = (make) => {
        this.setState({make})
    }

    updateYear = (year) => {
        this.setState({year});
    }

    handleSearchButton = () => {
        if (this.state.year.length < 4) {
            this.setState({ instruction: "Please enter a valid year; e.g. 2015"});
        }
        else {
            // do the search here
            let vehicle = [this.state.year, this.state.make, this.state.model].join(' ');
            console.log(vehicle);

            // look up the ID
            let getIdUrl = `https://fueleconomy.gov/ws/rest/vehicle/menu/options?make=${this.state.make}&model=${this.state.model}&year=${this.state.year}`
            axios.get(getIdUrl)
                .then((response) => {
                    console.log(response);
                    let id;
                    if (Array.isArray(response.data.menuItem)) {
                        id = response.data.menuItem[0].value; // whichever is the first match
                    } else {
                        id = response.data.menuItem.value;
                    }

                    // use the ID to look up MPG
                    let getMPGUrl = `https://fueleconomy.gov/ws/rest/vehicle/${id}`
                    axios.get(getMPGUrl)
                        .then((response) => {
                            console.log(response);
                            let mpg = response.data.comb08; // combination city + highway for primary fuel type
                            console.log("MPG is " + mpg);
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                })
                .catch((error) => {
                    console.log(error);
                })

            this.props.navigation.navigate("LocationInput", {
                vehicleSet: true,
                vehicle: vehicle,
            });
        }
    }

    render() {
        return(
            <View style={styles.container}>
                <Text style={styles.inputTitle}>Make:</Text>
                <TextInput
                    style={styles.inputBox}
                    autoCapitalize='words'
                    onChangeText={(make) => this.updateMake(make)} />
                <Text style={styles.inputTitle}>Model:</Text>
                <TextInput
                    style={styles.inputBox}
                    autoCapitalize='words'
                    onChangeText={(model) => this.updateModel(model)} />
                <Text style={styles.inputTitle}>Year:</Text>
                <TextInput
                    style={styles.inputBox}
                    keyboardType={
                      Platform.OS == "android" ? "numeric" : "numbers-and-punctuation"
                    }
                    onChangeText={(year) => this.updateYear(year)}
                    maxLength={4}
                />
                <Text>{this.state.instruction}</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.navigateButton}
                    title="Set vehicle"
                    onPress={() => this.handleSearchButton()}>
                        <Text style={styles.buttonText}>Set vehicle</Text>
                  </TouchableOpacity>
                </View>
            </View>
        );
    }

}

export default VehicleInput;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },

  inputTitle: {
    marginTop: "5%",
    width: "80%",
    fontSize: 18,
    textAlign: "left",
  },

  inputBox: {
    paddingHorizontal: 10,
    marginTop: 8,
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#c4c4c4",
    backgroundColor: "white",
    marginBottom: 10,
  },

  buttonContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    marginBottom: "10%",
  },

  navigateButton: {
    paddingHorizontal: 40,
    paddingVertical: 22,
    backgroundColor: colors.defaultGreen,
    borderRadius: 100,
  },

  buttonText: {
    fontSize: 18,
    color: "white",
  },
});