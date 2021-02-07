import React, { Component } from "react";
import { StyleSheet, Text, View, Button, Platform } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import axios from "axios";

const ROOT_URL = "https://fillupfinder.herokuapp.com"

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

            axios.get(`${ROOT_URL}/api/vehicle/${this.state.make}/${this.state.model}/${this.state.year}`)
                .then((response) => {
                    console.log(response);
                    if (response.status == 200) {
                        // OK
                        vehicle = [response.data.year, response.data.make, response.data.model].join(' ');

                        this.props.navigation.navigate("LocationInput", {
                            vehicleSet: true,
                            vehicle: vehicle,
                        });
                    }
                })
                .catch((error) => {
                    console.log(error);
                    if (error.response) {
                        if (error.response.status == 300) {
                            // just show what the options are for now
                            this.setState({ instruction: "Did you mean one of these?: " + error.response.data.join(', ')});
                        }
                        else if (error.response.status == 404) {
                            this.setState({ instruction: "Couldn't find that vehicle." });
                        } else {
                            this.setState({ instruction: "Server error" })
                        }
                    }
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