import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import axios from "axios";
import { ROOT_URL } from "../constants/api";
import {
  Layout,
  Text,
  Divider,
  Button,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  IndexPath,
  Input,
} from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

const filter = (item, query) => {
  return item.toLowerCase().startsWith(query.toLowerCase());
};

const VehicleInput = () => {
  const navigation = useNavigation();
  // Hnadle Vehicle Button
  const handleVehicleButton = () => {
    if (
      mpg != null &&
      fuelCapacity != null &&
      mpg != "Not Found" &&
      fuelCapacity != "Not Found"
    ) {
      // const finalModel = variation ? variation : model;
      const vehicle = [year, make, finalModel].join(" ");

      navigation.navigate("LocationInput", {
        vehicleSet: true,
        vehicle: vehicle,
        fuelCap: fuelCapacity,
        mpg: mpg,
      });
    }
  };
  // For the Year Autocomplete
  const [initialYears, setInitialYears] = useState(["loading"]);
  const [year, setYear] = useState(null);
  const [yearList, setYearList] = useState(initialYears);
  const onSelect = (index) => {
    setYear(yearList[index]);
  };
  const onChangeText = (query) => {
    setYear(query);
    setYearList(initialYears.filter((item) => filter(item, query)));
  };
  // For the Make Autocomplete
  const [initialMakes, setInitialMakes] = useState(["loading"]);
  const [make, setMake] = useState(null);
  const [makeList, setMakeList] = useState(initialMakes);
  const onSelectMake = (index) => {
    setMake(makeList[index]);
  };
  const onChangeMake = (query) => {
    setMake(query);
    setMakeList(initialMakes.filter((item) => filter(item, query)));
  };

  // For the Model Select
  const [modelIndex, setModelIndex] = React.useState(new IndexPath(0));
  const [modelList, setModelList] = useState([]);
  const model = modelList[modelIndex.row];

  // For the Variation Select

  const [variationIndex, setVariationIndex] = React.useState(new IndexPath(0));
  const [variationList, setVariationList] = useState([]);
  const variation = variationList[variationIndex.row];

  const finalModel = variation ? variation : model ? model : null;

  // For MPG

  const [mpg, setMPG] = useState("");
  const [fuelCapacity, setFuelCapacity] = useState("");

  // Axios Calls
  const carAPI = axios.create({
    baseURL: "https://www.carqueryapi.com/api/0.3",
  });

  // Fetch Available Car Years

  useEffect(() => {
    async function fetchYears() {
      const request = await carAPI.get("/?&cmd=getYears");

      const max = request.data.Years.max_year;
      const total = max - request.data.Years.min_year + 1;
      setInitialYears(
        Array.from(new Array(total), (x, i) => (Number(max) - i).toString())
        // ["4", "5", "6"]
      );
      setYearList(
        Array.from(new Array(total), (x, i) => (Number(max) - i).toString())
      );
      return request;
    }
    fetchYears();
  }, []);

  // Fetch Makes for selected Year

  useEffect(() => {
    async function fetchMakes() {
      const request = await carAPI.get(`/?&cmd=getMakes&year=${year}`);
      if (request.data) {
        const makes = request.data.Makes.map((obj) => obj["make_display"]);

        setInitialMakes(makes);
        setMakeList(makes);
      }
      return request;
    }
    if (year) {
      fetchMakes();
    }
  }, [year]);

  // Fetch Models for selected Year and Make

  useEffect(() => {
    async function fetchModels() {
      try {
        const formattedMake = make.split(" ").join("-");
        const req = `/?&cmd=getModels&make=${formattedMake}&year=${year}`;
        const response = await carAPI.get(
          `/?&cmd=getModels&make=${formattedMake}&year=${year}`
        );
        // console.log("Sending Model Fetch Request: ");
        // console.log(req);
        // console.log(response)
        if (response.data) {
          // console.log("Response had Data");
          // console.log(response.data);
          const models = response.data.Models.map((obj) => obj["model_name"]);
          setModelList(models);
          setModelIndex(new IndexPath(0));
        }
        return response;
      } catch (e) {
        // console.log("Error in Models Fetch");
        console.log(e);
      }
    }
    if (year && make) {
      fetchModels();
    }
  }, [year, make]);

  // Fetch MPG for selected Model

  useEffect(() => {
    async function fetchMPG() {
      if (model) {
        const req = `${ROOT_URL}/api/vehicle/${make}/${model}/${year}`;
        // const response = await axios.get(req);
        axios
          .get(req)
          .then((response) => {
            setVariationList([]);
            setFuelCapacity(response.data.fuelCap.toString());
            setMPG(response.data.mpg.toString());
          })
          .catch((error) => {
            if (error.response && error.response.data.length > 0) {
              const variationArray = error.response.data;

              setVariationList(variationArray);
              setVariationIndex(new IndexPath(0));
            } else {
              setFuelCapacity("Not Found");
              setMPG("Not Found");
            }
          });
      }
    }
    fetchMPG();
  }, [model]);

  // Fetch MPG for Model Variation
  useEffect(() => {
    async function fetchVariations() {
      try {
        const req = `${ROOT_URL}/api/vehicle/${make}/${variation}/${year}`;
        const response = await axios.get(req);
        if (response.data) {
          // console.log(response.data);
          setFuelCapacity(response.data.fuelCap.toString());
          setMPG(response.data.mpg.toString());
        }
        return response;
      } catch (e) {
        console.log(e);
      }
    }

    if (year && make && model && variation) {
      fetchVariations();
    }
  }, [variation]);

  return (
    <Layout style={styles.container}>
      <Autocomplete
        style={styles.autocomplete}
        placeholder="Enter Year"
        value={year}
        onSelect={onSelect}
        onChangeText={onChangeText}
        label="Year"
        keyboardType={
          Platform.OS == "android" ? "numeric" : "numbers-and-punctuation"
        }
      >
        {yearList.map((year, index) => (
          <AutocompleteItem key={index} title={year} />
        ))}
      </Autocomplete>
      <Autocomplete
        style={styles.autocomplete}
        placeholder="Enter Make"
        label="Make"
        value={make}
        onSelect={onSelectMake}
        onChangeText={onChangeMake}
      >
        {makeList.map((make, index) => (
          <AutocompleteItem key={index} title={make} />
        ))}
      </Autocomplete>
      <View style={styles.viewHorizontal}>
        <Select
          label="Model"
          disabled={!year || !make}
          style={styles.select1}
          placeholder="Select Model"
          value={model ? model : "No Models Found"}
          selectedIndex={modelIndex}
          onSelect={(index) => setModelIndex(index)}
        >
          {modelList.map((model, idx) => (
            <SelectItem key={idx} title={model} />
          ))}
        </Select>
        <Select
          label="Variation"
          disabled={variationList.length == 0}
          style={styles.select2}
          placeholder="Variety"
          value={variation ? variation : "N/A"}
          selectedIndex={variationIndex}
          onSelect={(index) => setVariationIndex(index)}
        >
          {variationList.map((variation, idx) => (
            <SelectItem key={idx} title={variation} />
          ))}
        </Select>
      </View>

      <Divider style={styles.divider}></Divider>
      <View style={styles.dataView}>
        <View>
          <Text category="h6" style={styles.subtitle}>
            {year && make && finalModel
              ? `${year} ${make} ${finalModel}:`
              : "No Vehicle Selected"}
          </Text>
          <Input
            style={styles.mpgInput}
            label="MPG"
            size="large"
            placeholder="MPG"
            value={mpg}
            disabled="true"
          />
          <Input
            style={styles.mpgInput}
            size="large"
            label="Fuel Capacity"
            placeholder="Fuel Capacity"
            value={fuelCapacity}
            disabled="true"
          />
        </View>

        <Button style={styles.buttonBot} onPress={() => handleVehicleButton()}>
          Set Vehicle
        </Button>
      </View>
    </Layout>
  );
};
const styles = StyleSheet.create({
  viewHorizontal: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 10,
  },
  dataView: {
    flex: 1,
    width: "90%",
    flexDirection: "column",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  select1: {
    // width: "40%",
    width: "42%",
  },
  select2: {
    // width: "40%",
    width: "46%",
  },
  container: {
    paddingTop: 8,
    flex: 1,
    alignItems: "center",
  },
  mpgInput: {
    width: " 50 %",
    alignSelf: "center",
  },
  subtitle: {
    paddingLeft: 10,
    marginBottom: 10,
    alignSelf: "center",
  },
  divider: {
    marginVertical: 8,
    width: "95 %",
  },
  autocomplete: {
    width: "80%",
    paddingBottom: 20,
  },
  buttonBot: {
    alignSelf: "center",
    width: "80%",
    marginVertical: 10,
  },
});
export default VehicleInput;
