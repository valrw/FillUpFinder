import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MapDisplay from "./screens/MapDisplay";
import LocationInput from "./screens/LocationInput";
import VehicleInput from "./screens/VehicleInput";
import Options from "./screens/Options";
import { ThemeContext } from "./contexts/theme-context";
import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";

export default function App() {
  const Stack = createStackNavigator();
  const [theme, setTheme] = React.useState("light");

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };
  const headerColor = theme === "light" ? "color-basic-100" : "color-basic-800";
  const tintColor = theme === "light" ? "color-basic-800" : "color-basic-100";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ApplicationProvider {...eva} theme={eva[theme]}>
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
              options={{
                title: "Enter Vehicle Info",
                headerTitleAlign: "center",
              }}
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
  );
}
