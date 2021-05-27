import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import MapDisplay from "../screens/MapDisplay";
import LocationInput from "../screens/LocationInput";
import VehicleInput from "../screens/VehicleInput";
import Settings from "../screens/Settings";
import CustomizeStops from "../screens/CustomizeStops";
import { TouchableOpacity } from "react-native";

import {
  Icon,
  useTheme,
  TopNavigationAction,
  OverflowMenu,
  MenuItem,
} from "@ui-kitten/components";

const Stack = createStackNavigator();

const MenuIcon = (props) => <Icon {...props} name="more-vertical" />;

const SettingsIcon = (props) => <Icon {...props} name="settings" />;

const StackNavigator = () => {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const toggleMenu = () => {
    console.log("Tgfg");
    setMenuVisible(!menuVisible);
  };

  const renderMenuAction = () => (
    // <TouchableOpacity
    //   onPress={() => console.log("GGG")}
    //   style={{
    //     paddingVertical: 8,
    //     backgroundColor: "pink",
    //     paddingHorizontal: 9,
    //   }}
    // >
    <TopNavigationAction
      icon={MenuIcon}
      onPress={toggleMenu}
      style={{ padding: 6 }}
      // style={{
      //   paddingVertical: 8,
      //   backgroundColor: "pink",
      //   paddingHorizontal: 9,
      // }}
    />
    // </TouchableOpacity>
  );

  const renderRightActions = (navigation) => (
    <React.Fragment>
      <OverflowMenu
        anchor={renderMenuAction}
        visible={menuVisible}
        placement="bottom end"
        onBackdropPress={toggleMenu}
        onPress={() => console.log("AAB")}
      >
        <MenuItem
          accessoryLeft={SettingsIcon}
          title="Settings"
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate("Settings");
          }}
        />
      </OverflowMenu>
    </React.Fragment>
  );

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme["background-basic-color-1"],
        },
        headerTitleStyle: {
          fontFamily: "OpenSans_700Bold",
          fontSize: 19,
        },
        headerTintColor: theme["text-basic-color"],
      }}
    >
      <Stack.Screen
        name="LocationInput"
        component={LocationInput}
        options={({ navigation }) => ({
          title: "Where are we going?",
          headerTitleAlign: "center",
          headerRight: () => renderRightActions(navigation),
        })}
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
        name="Settings"
        component={Settings}
        options={{
          title: "Settings",
          headerTitleAlign: "center",
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
