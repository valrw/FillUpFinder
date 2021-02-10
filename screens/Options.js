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
} from "@ui-kitten/components";
import { ThemeContext } from "../contexts/theme-context";

const Options = () => {
  const themeContext = React.useContext(ThemeContext);

  const units = ["Miles, Gallons", "Meters, Litres"];
  const [value, setValue] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0));

  const selectedUnit = units[selectedIndex.row];

  return (
    <Layout style={styles.container}>
      <TouchableOpacity
        onPress={themeContext.toggleTheme}
        style={styles.segment}
      >
        <Text style={styles.text}> Night Mode</Text>
        <Toggle
          checked={themeContext.theme === "light" ? false : true}
          onChange={themeContext.toggleTheme}
          style={styles.toggle}
        ></Toggle>
      </TouchableOpacity>
      <Divider style={styles.divider}></Divider>
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
      />
      <Divider style={styles.divider}></Divider>
      <Text style={styles.text} category="h2">
        Units
      </Text>
      <Select
        selectedIndex={selectedIndex}
        onSelect={(index) => setSelectedIndex(index)}
        style={styles.input}
        value={selectedUnit}
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

export default Options;
