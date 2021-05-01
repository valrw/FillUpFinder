import React from "react";
import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import { StoreContext } from "./contexts/StoreContext";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import AppLoading from "expo-app-loading";
import StackNavigator from "./navigation/StackNavigator";

import { default as mapping } from "./mapping.json";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
import { StatusBar } from "expo-status-bar";

export default function App() {
  const [theme, setTheme] = useState("light");
  const [unitIndex, setUnitIndex] = useState(0);

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

  const color_light = eva[theme]["color-basic-100"];
  const color_dark = eva[theme]["color-basic-800"];

  return fontsLoaded ? (
    <StoreContext.Provider
      value={{ theme, toggleTheme, unitIndex, setUnitIndex }}
    >
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva[theme]} customMapping={mapping}>
        <SafeAreaProvider>
          <StatusBar
            backgroundColor={theme === "light" ? color_light : color_dark}
            style={theme === "light" ? "dark" : "light"}
            translucent={false}
          ></StatusBar>
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </ApplicationProvider>
    </StoreContext.Provider>
  ) : (
    <AppLoading />
  );
}
