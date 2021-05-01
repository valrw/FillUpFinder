import React from "react";

const units = ["US", "Metric"];
export const StoreContext = React.createContext({
  theme: "light",
  toggleTheme: () => {},
  unitIndex: 0,
  setUnitIndex: () => {},
});
