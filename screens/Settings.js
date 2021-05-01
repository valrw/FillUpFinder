import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  Layout,
  Toggle,
  Text,
  Divider,
  Input,
  IndexPath,
  Select,
  SelectItem,
  Button,
  useTheme,
} from "@ui-kitten/components";
import { HeaderBackButton } from "@react-navigation/stack";
import { StoreContext } from "../contexts/StoreContext";

const Settings = ({ navigation }) => {
  const storeContext = React.useContext(StoreContext);

  const units = ["US", "Metric"];

  const theme = useTheme();
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton
          onPress={() => navigation.navigate("LocationInput")}
          tintColor={theme["text-basic-color"]}
        />
      ),
    });
  }, [navigation, theme]);

  return (
    <Layout style={styles.container}>
      <TouchableOpacity
        onPress={storeContext.toggleTheme}
        style={styles.segment}
      >
        <Text style={styles.text}> Night Mode</Text>
        <Toggle
          checked={storeContext.theme === "light" ? false : true}
          onChange={storeContext.toggleTheme}
          style={styles.toggle}
        ></Toggle>
      </TouchableOpacity>
      {/* <Divider style={styles.divider}></Divider>
      <Text style={styles.text} category="h2">
        Gas
      </Text>
      <Input
        placeholder="Enter Gas Amount"
        value={value}
        onChangeText={(nextValue) => setValue(nextValue)}
        keyboardType={
          Platform.OS == "android" ? "numeric" : "numbers-and-punctuation"
        }
        style={styles.input}
      /> */}
      <Divider style={styles.divider}></Divider>
      <Text style={styles.text} category="h6">
        Units
      </Text>
      <Select
        selectedIndex={new IndexPath(storeContext.unitIndex)}
        onSelect={(index) => {
          // storeContext.toggleUnit();
          // console.log(storeContext.unitIndex);
          storeContext.setUnitIndex(index.row);
          // setSelectedIndex(index);
        }}
        style={styles.input}
        value={units[storeContext.unitIndex]}
      >
        <SelectItem title={units[0]} />
        <SelectItem title={units[1]} />
      </Select>
      <Divider style={styles.divider}></Divider>
    </Layout>
  );
};

const styles = StyleSheet.create({
  text: {
    paddingHorizontal: 10,
  },
  segment: {
    height: 65,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  toggle: {
    paddingRight: 12,
  },
  container: {
    flex: 1,
    paddingTop: 10,
  },
  section: {
    paddingTop: 32,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  divider: {
    marginBottom: 7,
  },
});

export default Settings;
