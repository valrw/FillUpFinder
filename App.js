import React from "react";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";

import { StoreContext } from "./contexts/storeContext";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry, Text } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import AppLoading from "expo-app-loading";

import { MainStackNavigator } from "./navigation/StackNavigator";
import DrawerNavigator from "./navigation/DrawerNavigator";

import { default as mapping } from "./mapping.json";
import units from "./constants/units";

// import { createDrawerNavigator } from "@react-navigation/drawer";

// const Drawer = createDrawerNavigator(
//   {
//     Home: { screen: Home },
//     Profile: { screen: Profile },
//     Settings: { screen: Settings },
//   },
//   {
//     initialRouteName: "Home",
//     unmountInactiveRoutes: true,
//     headerMode: "none",
//     contentComponent: (props) => <Sidebar {...props} />,
//   }
// );

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
  const [theme, setTheme] = useState("light");
  // const [color, setColor] = useState(colors.defaultBlue);
  const [unitIndex, setUnitIndex] = useState(0);
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

  // const headerColor = theme === "light" ? "color-basic-100" : "color-basic-800";
  // const tintColor = theme === "light" ? "color-basic-800" : "color-basic-100";

  return fontsLoaded ? (
    // <StoreContext.Provider value={{ theme, toggleTheme, unit, toggleUnit }}>
    <StoreContext.Provider
      value={{ theme, toggleTheme, unitIndex, setUnitIndex }}
    >
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva[theme]} customMapping={mapping}>
        <NavigationContainer>
          <DrawerNavigator />
        </NavigationContainer>
      </ApplicationProvider>
    </StoreContext.Provider>
  ) : (
    <AppLoading />
  );
}
