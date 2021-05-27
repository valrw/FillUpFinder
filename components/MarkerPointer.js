import React from "react";
import { StyleSheet } from "react-native";
import { Icon } from "@ui-kitten/components";
// import { Animated } from "react-native";

const MarkerPointer = () => {
  //   const infiniteAnimationIconRef = React.useRef();

  //   React.useEffect(() => {
  //     infiniteAnimationIconRef.current.startAnimation();
  //   }, []);

  return (
    <Icon
      //   {...props}
      //   ref={infiniteAnimationIconRef}
      //   animationConfig={{ cycles: Infinity }}
      //   animation="pulse"
      name="arrow-down"
      fill="blue"
      style={styles.icon}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
  },
});

export default MarkerPointer;
