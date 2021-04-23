import React from "react";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeScreen from "./screens/WelcomeScreen";
import MapDisplay from "./screens/MapDisplay";
import LocationInput from "./screens/LocationInput";
import VehicleInput from "./screens/VehicleInput";
import CustomizeStops from "./screens/CustomizeStops";
import Options from "./screens/Options";
import { ThemeContext } from "./contexts/theme-context";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry, Text } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import AppLoading from "expo-app-loading";

import { default as mapping } from "./mapping.json";

// import { useFonts, Inter_900Black } from "@expo-google-fonts/inter";
import {
  OpenSans_300Light,
  OpenSans_300Light_Italic,
  OpenSans_400Regular,
  OpenSans_400Regular_Italic,
  OpenSans_600SemiBold,
  OpenSans_600SemiBold_Italic,
  OpenSans_700Bold,
  OpenSans_700Bold_Italic,
  OpenSans_800ExtraBold,
  OpenSans_800ExtraBold_Italic,
  useFonts,
} from "@expo-google-fonts/open-sans";

export default function App() {
  const Stack = createStackNavigator();
  const [theme, setTheme] = useState("light");
  // const [fontLoaded, setFontLoaded] = useState(false);

  let [fontsLoaded] = useFonts({
    OpenSans_300Light,
    OpenSans_300Light_Italic,
    OpenSans_400Regular,
    OpenSans_400Regular_Italic,
    OpenSans_600SemiBold,
    OpenSans_600SemiBold_Italic,
    OpenSans_700Bold,
    OpenSans_700Bold_Italic,
    OpenSans_800ExtraBold,
    OpenSans_800ExtraBold_Italic,
  });

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };
  const headerColor = theme === "light" ? "color-basic-100" : "color-basic-800";
  const tintColor = theme === "light" ? "color-basic-800" : "color-basic-100";

  return fontsLoaded ? (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva[theme]} customMapping={mapping}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="WelcomeScreen"
              component={WelcomeScreen}
              options={{
                title: "Welcome",
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="LocationInput"
              component={LocationInput}
              options={{
                title: "Where are we going?",
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="MapDisplay"
              component={MapDisplay}
              options={{ title: "Your Route", headerTitleAlign: "center" }}
            />
            <Stack.Screen
              name="VehicleInput"
              component={VehicleInput}
              options={{ title: "Add Vehicle", headerTitleAlign: "center" }}
            />
            <Stack.Screen
              name="CustomizeStops"
              component={CustomizeStops}
              options={{ title: "Customize your stops", headerTitleAlign: "center" }}
            />
            <Stack.Screen
              name="Options"
              component={Options}
              options={{
                title: "Options",
                headerTitleAlign: "center",
                headerTintColor: eva[theme][tintColor],
                headerStyle: {
                  backgroundColor: eva[theme][headerColor],
                },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
    </ThemeContext.Provider>
  ) : (
    <AppLoading />
  );
}
