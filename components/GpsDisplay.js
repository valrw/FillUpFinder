import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Text, Button, useTheme } from "@ui-kitten/components";

function GpsDisplay(props) {
  const theme = useTheme();
  let timeTitle = props.gpsMode ? "Time Left" : "Total Time";

  const minutes = Math.floor(props.timeLeft / 60);
  let timeDisplay = `${minutes % 60} min`;
  if (minutes / 60 > 1)
    timeDisplay = `${Math.floor(minutes / 60)} hr ` + timeDisplay;

  const renderButton = () => {
    return props.gpsMode ? (
      <Button
        style={styles.startButton}
        onPress={props.onStart}
        appearance="outline"
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </Button>
    ) : (
      <Button style={styles.startButton} onPress={props.onStart}>
        <Text style={{ ...styles.buttonText, color: "white" }}>Start</Text>
      </Button>
    );
  };

  return (
    <View
      style={[
        Platform.OS == "android"
          ? styles.displayContainer
          : { ...styles.displayContainer, paddingBottom: 25 },
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <View style={styles.textContainer}>
        <Text style={styles.largeText}>{timeTitle}</Text>
        <Text style={styles.textDisplay}>{timeDisplay}</Text>
      </View>
      {renderButton()}
    </View>
  );
}

const styles = StyleSheet.create({
  displayContainer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 105,
  },

  textContainer: {
    marginLeft: 30,
    flex: 4,
  },

  largeText: {
    fontSize: 25,
    marginBottom: 2,
  },

  textDisplay: {
    fontSize: 18,
  },

  startButton: {
    marginEnd: 20,
    flex: 1,
  },

  buttonText: {
    fontSize: 20,
  },
});

export default GpsDisplay;
