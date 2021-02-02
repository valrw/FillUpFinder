import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MapDisplay from "./screens/MapDisplay";
import LocationInput from "./screens/LocationInput";
import VehicleInput from "./screens/VehicleInput";

export default function App() {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="LocationInput"
          component={LocationInput}
          options={{ title: "Enter Locations", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name="MapDisplay"
          component={MapDisplay}
          options={{ title: "Map Directions" }}
        />
        <Stack.Screen
          name="VehicleInput"
          component={VehicleInput}
          options={{ title: "Enter Vehicle Info", headerTitleAlign: "center" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
