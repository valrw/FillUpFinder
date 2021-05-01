import axios from "axios";
import * as Location from "expo-location";
import Constants from "expo-constants";

export const getLocation = async () => {
  const { status } = await Location.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Location Permission Denied");
    return;
  }

  try {
    const location = await Location.getCurrentPositionAsync({});
    return location;
  } catch (error) {
    alert(
      "We could not find your position. Please make sure your location service provider is on"
    );
    console.log("Error while trying to get location: ", e);
    return;
  }
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
