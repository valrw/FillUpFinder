import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Platform,
  ImageBackground,
  Button,
  StatusBarIOS,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import colors from "../constants/colors";

function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      style={styles.container}
      source={require("../assets/images/map-bg.jpg")}
    >
      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeText}>FillUpFinder</Text>
      </View>

      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => onMapButtonPress(navigation)}
      >
        <Text style={styles.mapButtonText}>Get started</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

function onMapButtonPress(navigation) {
  navigation.navigate("LocationInput");
}

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    height: "100%",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  welcomeText: {
    color: "white",
    fontSize: 38,
    fontWeight: "bold",
    width: "80%",
    textAlign: "center",
  },

  authorText: {
    paddingTop: "8%",
    color: "white",
    fontSize: 20,
    width: "100%",
    textAlign: "center",
  },

  welcomeTextContainer: {
    width: "90%",
    height: "10%",
    flexDirection: "column",
    alignItems: "center",
    bottom: "20%",
    marginBottom: "5%",
  },

  mapButton: {
    backgroundColor: colors.defaultBlue,
    paddingHorizontal: "15%",
    paddingVertical: "5%",
    borderRadius: 15,
  },

  mapButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

//backgroundColor: "#32ba47",
