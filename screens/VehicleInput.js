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
  Icon,
  Spinner,
} from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

const filter = (item, query) => {
  return item.toLowerCase().startsWith(query.toLowerCase());
};

const StarIcon = (props) => <Icon {...props} name="star" />;

const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size="small" />
  </View>
);

const VehicleInput = () => {
  const navigation = useNavigation();
  // For manual imput option
  const [manualMPG, setManualMPG] = useState(false);

  // Header Button
  React.useLayoutEffect(() => {
    const buttonText = manualMPG ? "Vehicle Search" : "Set Manually";
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => setManualMPG((prev) => !prev)}
          appearance="ghost"
          status="info"
        >
          {buttonText}
        </Button>
      ),
    });
  }, [navigation, manualMPG]);

  // Handle Vehicle Button
  const isButtonDisabled = () => {
    if (!manualMPG) {
      return (
        !mpg ||
        !fuelCapacity ||
        mpg == "Not Found" ||
        fuelCapacity == "Not Found"
      );
    } else {
      return !manualName || !manualMPGVal || !manualFuelCap;
    }
  };

  const handleVehicleButton = () => {
    const vehicle = manualMPG
      ? manualName
      : [(year, make, finalModel)].join(" ");

    if (vehicle != null) {
      navigation.navigate("LocationInput", {
        vehicleSet: true,
        vehicle: vehicle,
        fuelCap: manualMPG ? manualFuelCap : fuelCapacity,
        mpg: manualMPG ? manualMPGVal : mpg,
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
  const [modelIsLoading, setModelIsLoading] = React.useState(false);

  // For the Variant Select
  const [variantIndex, setVariantIndex] = React.useState(new IndexPath(0));
  const [variantList, setVariantList] = useState([]);
  const [carList, setCarList] = useState([]);

  const variant = variantList[variantIndex.row];

  const finalModel = variant ? variant : model ? model : null;
  const [variantIsLoading, setVariantIsLoading] = React.useState(false);

  // For MPG
  const [mpg, setMPG] = useState("");
  const [fuelCapacity, setFuelCapacity] = useState("");

  // For Axios Calls
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
    if (year && initialYears.includes(year)) {
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
        setModelIsLoading(false);
        if (response.data) {
          const models = response.data.Models.map((obj) => obj["model_name"]);
          setModelList(models);
          setModelIndex(new IndexPath(0));
        }
        return response;
      } catch (e) {
        console.log(e);
      }
    }
    if (year && make && initialMakes.includes(make)) {
      setModelList([]);
      setVariantList([]);
      setModelIsLoading(true);
      fetchModels();
    }
  }, [year, make]);

  // Fetch MPG for selected Model
  useEffect(() => {
    async function fetchMPG() {
      if (model) {
        const req = `${ROOT_URL}/api/vehicle/${make}/${model}/${year}`;
        axios
          .get(req)
          .then((response) => {
            setVariantIsLoading(false);
            const variantArray = response.data;
            if (!variantArray || variantArray.length < 1) {
            }
            if (variantArray.length == 1) {
              const car = variantArray[0];
              setFuelCapacity(car.fuelCap.toFixed(2).toString());
              setMPG(car.mpg);
            } else if (variantArray.length > 1) {
              setCarList(variantArray);
              setVariantList(variantArray.map((x) => x.model));
              setVariantIndex(new IndexPath(0));
            }
          })
          .catch((error) => {
            setVariantIsLoading(false);
            setMPG("Not Found");
            setFuelCapacity("Not Found");
          });
      }
    }
    if (model) {
      setVariantList([]);
      setVariantIsLoading(true);
      fetchMPG();
    }
  }, [model]);

  // Set MPG for Model Variant
  useEffect(() => {
    if (carList.length > 0) {
      setMPG(carList[variantIndex.row].mpg);
      setFuelCapacity(carList[variantIndex.row].fuelCap.toFixed(2).toString());
    }
  }, [variantIndex]);

  // Manual Input View
  const [manualName, setManualName] = useState();
  const [manualMPGVal, setManualMPGVal] = useState();
  const [manualFuelCap, setManualFuelCap] = useState();

  const manualInputView = () => (
    <>
      <Input
        style={styles.input}
        label="Car Name"
        value={manualName}
        onChangeText={setManualName}
        placeholder="Enter Car Name"
      />
      <Input
        style={styles.input}
        label="MPG"
        placeholder="Enter MPG"
        value={manualMPGVal}
        onChangeText={setManualMPGVal}
        keyboardType={
          Platform.OS == "android" ? "numeric" : "numbers-and-punctuation"
        }
      />
      <Input
        style={styles.input}
        label="Fuel Capacity"
        placeholder="Enter Fuel Capacity"
        value={manualFuelCap}
        onChangeText={setManualFuelCap}
        keyboardType={
          Platform.OS == "android" ? "numeric" : "numbers-and-punctuation"
        }
      />
    </>
  );

  // Car Search View
  const carSearchView = () => (
    <>
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
      <View style={styles.selects}>
        <Select
          label="Model"
          disabled={modelList.length == 0}
          style={styles.select1}
          accessoryLeft={modelIsLoading ? LoadingIndicator : null}
          placeholder="Select Model"
          value={model ? model : "N/A"}
          selectedIndex={modelIndex}
          onSelect={(index) => setModelIndex(index)}
        >
          {modelList.map((model, idx) => (
            <SelectItem key={idx} title={model} />
          ))}
        </Select>
        <Select
          label="Variant"
          disabled={variantList.length == 0}
          accessoryLeft={variantIsLoading ? LoadingIndicator : null}
          style={styles.select2}
          placeholder="Variant"
          value={variant ? variant : "N/A"}
          selectedIndex={variantIndex}
          onSelect={(index) => setVariantIndex(index)}
        >
          {variantList.map((variant, idx) => (
            <SelectItem key={idx} title={variant} />
          ))}
        </Select>
      </View>

      <Divider style={styles.divider}></Divider>

      <Text category="h6" style={styles.subtitle}>
        {year && make && finalModel
          ? `${year} ${make} ${finalModel}:`
          : "No Vehicle Selected"}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <Input
          style={styles.mpgInput}
          label="MPG"
          size="large"
          placeholder="MPG"
          accessoryLeft={variantIsLoading ? LoadingIndicator : null}
          value={variantIsLoading ? "loading..." : mpg}
          disabled="true"
        />
        <Input
          style={styles.mpgInput}
          size="large"
          label="Fuel Capacity"
          accessoryLeft={variantIsLoading ? LoadingIndicator : null}
          placeholder="Fuel Capacity"
          value={variantIsLoading ? "loading..." : fuelCapacity}
          disabled="true"
        />
      </View>
    </>
  );

  return (
    <Layout style={styles.container}>
      <View
        style={{
          width: "100%",
          flexDirection: "row-reverse",
          // justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 15,
        }}
      ></View>
      {manualMPG ? manualInputView() : carSearchView()}
      <View
        style={{
          flexDirection: "column-reverse",
          flexGrow: 1,
          alignItems: "center",
        }}
      >
        <Button
          style={styles.buttonBot}
          onPress={() => handleVehicleButton()}
          disabled={isButtonDisabled()}
        >
          Set Vehicle
        </Button>
      </View>
    </Layout>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 3,
    flex: 1,
  },
  selects: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  dataView: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  select1: {
    width: "44%",
  },
  select2: {
    width: "50%",
  },
  mpgInput: {
    width: " 44 %",
    alignSelf: "center",
  },
  subtitle: {
    paddingLeft: 10,
    marginBottom: 10,
    alignSelf: "center",
  },
  divider: {
    marginVertical: 8,
    width: "100%",
  },
  autocomplete: {
    width: "100%",
    paddingBottom: 20,
  },
  buttonBot: {
    marginBottom: 14,
    width: "80%",
  },
  input: {
    width: "100%",
    paddingBottom: 5,
  },
  indicator: {
    justifyContent: "center",
    alignItems: "center",
  },
});
export default VehicleInput;
