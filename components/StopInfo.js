import React from "react";
import {
  StyleSheet,
  View,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Text, Icon, useTheme } from "@ui-kitten/components";
import Constants from "expo-constants";
import Carousel from "react-native-snap-carousel";

const API_KEY = Constants.manifest.extra.API_KEY;

function StopInfo(props) {
  const theme = useTheme();
  if (props.currStop == undefined) return <View />;
  return (
    <Animated.View
      style={[
        styles.cardView,
        props.anim,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <View style={styles.titleAndRating}>
        <Text style={styles.cardTitle}> {props.currStop.name}</Text>
        {renderRatingsInfo(props.currStop.rating)}
      </View>
      <Text> {props.currStop.vicinity}</Text>
      {/* {renderStopImages(props.currStop.photos)} */}
      {renderStopImage(props.currStop.photos)}
      <TouchableOpacity
        onPress={props.onDeleteStop}
        style={styles.deleteButton}
      >
        <Icon
          style={styles.trashIcon}
          fill={theme["text-basic-color"]}
          name="trash-2-outline"
        />
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

// const renderStopImage = (photo) => {
//   if (photo.photo_reference == undefined) return;

//   let maxheight = 300;
//   let currUri = `https://maps.googleapis.com/maps/api/place/photo?maxheight=${maxheight}&photoreference=`;
//   currUri = currUri + photo.photo_reference;
//   currUri = currUri + "&key=" + API_KEY;
//   return <Image source={{ uri: currUri }} style={styles.cardImage} />;
// };

const renderStopImages = (photos) => {
  if (photos == undefined || photos.length == 0) return;
  // console.log(photos.length);
  return (
    <Carousel
      data={photos}
      renderItem={({ item, index }) => renderStopImage(item)}
      sliderWidth={310}
      itemWidth={210}
      // containerCustomStyle={{ flexGrow: 0 }}
    />
  );
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
    // backgroundColor: "white",
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
    height: 100,
    // height: "65%",
    resizeMode: "contain",
  },

  deleteButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
  },

  trashIcon: {
    height: 24,
    width: 24,
  },
});
