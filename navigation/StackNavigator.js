import React from "react";
import {
  createStackNavigator,
  HeaderBackButton,
} from "@react-navigation/stack";

import MapDisplay from "../screens/MapDisplay";
import LocationInput from "../screens/LocationInput";
import VehicleInput from "../screens/VehicleInput";
import Options from "../screens/Options";
import { View, StyleSheet } from "react-native";

import {
  Icon,
  Layout,
  useTheme,
  TopNavigation,
  TopNavigationAction,
} from "@ui-kitten/components";

const Stack = createStackNavigator();

const MenuIcon = (props) => <Icon {...props} name="menu-outline" />;

// const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
// const BackAction = () => <TopNavigationAction icon={BackIcon} />;

const MainStackNavigator = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme["background-basic-color-1"],
        },
        headerTitleStyle: {
          fontFamily: "OpenSans_700Bold",
        },
        headerTintColor: theme["text-basic-color"],
        // headerBackImage: () => (
        //   <View>
        //     <Icon name="arrow-back" />
        //   </View>
        // ),
      }}
    >
      <Stack.Screen
        name="LocationInput"
        component={LocationInput}
        options={{
          title: "Where are we going?",
          headerTitleAlign: "center",
          headerLeft: () => (
            <TopNavigationAction
              icon={MenuIcon}
              onPress={() => {
                console.log("AAAAAA");
              }}
            />
          ),
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
      {/* <Stack.Screen
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
      /> */}
    </Stack.Navigator>
  );
};

const OptionsStackNavigator = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme["background-basic-color-1"],
        },
        headerTitleStyle: {
          fontFamily: "OpenSans_700Bold",
        },
        headerTintColor: theme["text-basic-color"],
      }}
    >
      <Stack.Screen
        name="Settings"
        component={Options}
        options={{
          title: "Settings",
          headerTitleAlign: "center",
          // headerLeft: (props) => {
          //   console.log(props);
          //   return (
          //     <HeaderBackButton
          //       {...props}
          //       onPress={() => {
          //         props.navigation.goBack();
          //       }}
          //     />
          //   );
          // },
        }}
      />
    </Stack.Navigator>
  );
};

const renderHeader = () => (
  <Layout style={styles.header} level="1">
    <TopNavigation
      alignment="center"
      title={"Title"}
      accessoryLeft={renderMenuAction}
      // accessoryRight={renderRightActions}
    />
  </Layout>
);

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    paddingTop: 10,
    elevation: 5,
  },
});

export { MainStackNavigator, OptionsStackNavigator };
