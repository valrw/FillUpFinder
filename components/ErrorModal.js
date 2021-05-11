import React from "react";
import { Modal, StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, Button, useTheme } from "@ui-kitten/components";

function ErrorModal(props) {
  const theme = useTheme();
  return (
    <Modal animationType="slide" transparent={true} visible={props.visible}>
      <View style={styles.mainContainer}>
        <View
          style={{
            ...styles.modalContainer,
            backgroundColor: theme["background-basic-color-1"],
            borderColor: theme["border-basic-color-5"],
          }}
        >
          <Text status="danger" style={styles.modalTitle}>
            {props.title}
          </Text>
          <Text style={styles.modalSubtitle}>{props.subtitle}</Text>
          <View style={styles.buttonContainer}>
            <Button style={styles.modalButton} onPress={props.onConfirm}>
              OK
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "60%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "white",
    borderStyle: "solid",
    borderWidth: 1,
    padding: 15,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
  },

  modalTitle: {
    textAlign: "center",
    fontSize: 20,
    marginBottom: 5,
  },

  modalSubtitle: {
    textAlign: "center",
    fontSize: 12,
    marginBottom: 30,
  },

  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  modalButton: {
    width: "50%",
  },
});

export default ErrorModal;
