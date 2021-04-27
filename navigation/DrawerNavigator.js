import React from "react";

import { createDrawerNavigator } from "@react-navigation/drawer";

import { MainStackNavigator, OptionsStackNavigator } from "./StackNavigator";
import {
  Drawer,
  DrawerItem,
  IndexPath,
  Avatar,
  Text,
  Layout,
} from "@ui-kitten/components";
import { View, StyleSheet } from "react-native";

const { Navigator, Screen } = createDrawerNavigator();

const renderHeader = () => (
  <Layout level="2" style={styles.header}>
    <Avatar
      size="giant"
      source={require("../assets/star.png")}
      style={{ padding: 5, marginRight: 15 }}
    />
    <Text category="h6">FillupFinder</Text>
  </Layout>
);

const DrawerContent = ({ navigation, state }) => (
  <Drawer
    // style={{ paddingTop: 25 }}
    header={renderHeader}
    selectedIndex={new IndexPath(state.index)}
    onSelect={(index) => navigation.navigate(state.routeNames[index.row])}
  >
    <DrawerItem title="Home" />
    <DrawerItem title="Settings" />
  </Drawer>
);

const DrawerNavigator = () => {
  return (
    <Navigator drawerContent={(props) => <DrawerContent {...props} />}>
      <Screen
        name="Home"
        component={MainStackNavigator}
        options={{
          swipeEnabled: false,
        }}
      />
      <Screen
        name="Settings"
        component={OptionsStackNavigator}
        options={{
          swipeEnabled: false,
        }}
      />
    </Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 128,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  // layout: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
});

export default DrawerNavigator;
