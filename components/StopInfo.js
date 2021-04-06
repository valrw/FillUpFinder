import React from "react";
import { API_KEY } from "../constants/api";
import {
  StyleSheet,
  View,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Text } from "@ui-kitten/components";

function StopInfo(props) {
  if (props.currStop == undefined) return <View />;
  return (
    <Animated.View style={[styles.cardView, props.anim]}>
      <View style={styles.titleAndRating}>
        <Text style={styles.cardTitle}> {props.currStop.name}</Text>
        {renderRatingsInfo(props.currStop.rating)}
      </View>
      <Text> {props.currStop.vicinity}</Text>
      {renderStopImage(props.currStop.photos)}
      <TouchableOpacity onPress={props.onDeleteStop}>
        <Image source={require("../assets/delete_icon.png")} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default StopInfo;

const renderRatingsInfo = (rating) => {
  if (rating == undefined) return;
  return (
    <View style={styles.ratingView}>
      <Image
        style={styles.starIcon}
        resizeMode="contain"
        source={require("../assets/star.png")}
      />
      <Text>{rating + "/5"}</Text>
    </View>
  );
};

// Render the overview image for each stop
const renderStopImage = (photos) => {
  if (photos == undefined || photos.length == 0) return;

  let photo = photos[0];
  if (photo.photo_reference == undefined) return;

  let maxheight = 300;
  let currUri = `https://maps.googleapis.com/maps/api/place/photo?maxheight=${maxheight}&photoreference=`;
  currUri = currUri + photo.photo_reference;
  currUri = currUri + "&key=" + API_KEY;
  return <Image source={{ uri: currUri }} style={styles.cardImage} />;
};

const styles = StyleSheet.create({
  cardView: {
    width: "90%",
    height: "35%",
    position: "absolute",
    bottom: 20,
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 20,
    flexDirection: "column",
  },

  titleAndRating: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  cardTitle: {
    width: "80%",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },

  ratingView: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  starIcon: {
    height: 15,
    width: 15,
    right: 3,
  },

  cardScroll: {
    height: "60%",
    width: "100%",
  },

  cardImage: {
    marginTop: 10,
    marginRight: 8,
    height: "70%",
    resizeMode: "contain",
  },
});