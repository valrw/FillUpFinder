import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Icon, useTheme } from "@ui-kitten/components";
import { useContext } from "react";
import { StoreContext } from "../contexts/StoreContext";
import { converted, rounded } from "../utils/numbers";
import { units, types } from "../constants/units";

const BORDER_RADIUS = 8;

function VehicleCard(props) {
  const { index, car } = props;

  const theme = useTheme();
  const storeContext = useContext(StoreContext);

  const styles = StyleSheet.create({
    card: {
      width: "95%",
      justifyContent: "space-evenly",
      marginVertical: 10,
      height: 150,
      elevation: 4,
      shadowColor: "#333",
      shadowOffset: { width: 1, height: 1 },
      borderRadius: BORDER_RADIUS,
      shadowRadius: 3,
      shadowOpacity: 0.3,
    },

    cardHeader: {
      flex: 2,
      backgroundColor: theme["background-basic-color-2"],
      borderTopLeftRadius: BORDER_RADIUS,
      borderTopRightRadius: BORDER_RADIUS,
    },

    cardTitle: {
      marginVertical: 4,
      marginHorizontal: 3,
      fontSize: 20,
      fontFamily: "OpenSans_700Bold",
      alignSelf: "center",
      textAlign: "center",
    },

    cardFooter: {
      flex: 1,
      backgroundColor: theme["color-primary-500"],
      borderBottomRightRadius: BORDER_RADIUS,
      borderBottomLeftRadius: BORDER_RADIUS,
    },

    footerBlock: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    footerText: {
      fontWeight: "bold",
      marginBottom: 2,
    },

    footerTextDescription: {},

    footerDivider: {
      width: 1.5,
      backgroundColor: "rgba(255,255,255, 0.9)",
      height: "75%",
      alignSelf: "center",
    },

    cardIcon: {
      width: 24,
      height: 24,
      alignSelf: "flex-end",
      marginTop: 6,
      marginHorizontal: 6,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon
          style={styles.cardIcon}
          fill={theme["text-basic-color"]}
          name="trash-2-outline"
          onPress={props.deleteCar}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text category="h5" style={styles.cardTitle}>
            {car.name}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={{ flexDirection: "row", flex: 1 }}>
          <View style={styles.footerBlock}>
            <Text category="h6" status="control" style={styles.footerText}>
              {rounded(
                converted(
                  car.mpg,
                  types.MPG,
                  units.US,
                  units.unitsList[storeContext.unitIndex]
                )
              )}
            </Text>

            <Text category="s2" status="control" style={{ letterSpacing: 1 }}>
              {storeContext.unitIndex == 0 ? "MPG" : "km/l"}
            </Text>
          </View>

          <View style={styles.footerDivider}></View>

          <View style={styles.footerBlock}>
            <Text category="h6" status="control" style={styles.footerText}>
              {rounded(
                converted(
                  car.fuelCap,
                  types.Fuel,
                  units.US,
                  units.unitsList[storeContext.unitIndex]
                )
              )}
            </Text>

            <Text category="s2" status="control" style={{ letterSpacing: 1 }}>
              {storeContext.unitIndex == 0 ? "Gallons" : "Liters"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default VehicleCard;
