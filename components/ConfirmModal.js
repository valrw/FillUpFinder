import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { Text, Button } from "@ui-kitten/components";

function ConfirmModal(props) {
  return (
    <Modal animationType="slide" transparent={true} visible={props.visible}>
      <View style={styles.mainContainer}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{props.title}</Text>
          <Text style={styles.modalSubtitle}>{props.subtitle}</Text>
          <View style={styles.buttonContainer}>
            <Button
              style={styles.modalButton}
              onPress={props.onCancel}
              appearance="outline"
            >
              Cancel
            </Button>
            <Button style={styles.modalButton} onPress={props.onConfirm}>
              Confirm
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
    minWidth: 270,
    // width: 300,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 20,
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
    width: "45%",
  },
});

export default ConfirmModal;
