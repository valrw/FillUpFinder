import { units, types } from "../constants/units";

const MPG_WORDS = ["MPG", "kml"];
const FUEL_WORDS = ["Gallons", "Liters"];

const mpgToKml = (mpg) => {
  return mpg / 2.3521458412464;
};

const gallonsToLiters = (gallons) => {
  return gallons * 3.7854;
};

const kmlToMPG = (kml) => {
  return kml * 2.3521458412464;
};
const litersToGallons = (liters) => {
  return liters / 3.7854;
};

// Returns a string with the iunput number rounded to 2 decimals max.
// Returns the input if it's not a number or parsable to a number
export const rounded = (val) => {
  const num_val = parseFloat(val);
  if (isNaN(num_val)) {
    return val;
  }
  return (num_val.toFixed(2) * 1).toString();
};

export const converted = (val, type, inputUnits, selectedUnits) => {
  if (isNaN(parseFloat(val))) return val;

  if (inputUnits === selectedUnits) {
    return val;
  }
  if (type == types.MPG) {
    // Convert MPG Values
    if (inputUnits == units.US) {
      return mpgToKml(val);
    } else {
      return kmlToMPG(val);
    }
  } else if (type == types.Fuel) {
    // Convert fuel Values
    if (inputUnits == units.US) {
      return gallonsToLiters(val);
    } else {
      return litersToGallons(val);
    }
  }
};

export const mpgWord = (idx) => {
  return MPG_WORDS[idx];
};

export const fuelWord = (idx) => {
  return FUEL_WORDS[idx];
};

export const convert = {
  mpgToKml: (mpg) => {
    return mpg / 2.3521458412464;
  },

  gallonsToLiters: (gallons) => {
    return gallons * 3.7854;
  },

  kmlToMPG: (kml) => {
    return kml * 2.3521458412464;
  },
  litersToGallons: (liters) => {
    return liters / 3.7854;
  },
};
