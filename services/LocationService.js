import axios from "axios";
import * as Location from "expo-location";
import Constants from "expo-constants";

export const getLocation = async () => {
  let { status } = await Location.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Location Permission Denied");
    return;
  }

  const location = await Location.getCurrentPositionAsync({});
  return location;
};

export const getPlace = async (lat, long) => {
  const key = Constants.manifest.extra.API_KEY;
  const req = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${key}`;
  const response = await axios.get(req);
  const place = {
    address: response.data.results[0].formatted_address,
    place_id: response.data.results[0].place_id,
  };
  return place;
};
