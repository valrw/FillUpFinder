import React, { useState, useEffect } from "react";
import Constants from "expo-constants";
import {
  StyleSheet,
  View,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Text, Icon, useTheme } from "@ui-kitten/components";
import Carousel from "react-native-snap-carousel";
import axios from "axios";

const API_KEY = Constants.manifest.extra.API_KEY;

function StopInfo(props) {
  const theme = useTheme();
  const [photos, setPhotos] = useState([]);

  if (props.currStop == undefined) return <View />;

  // Fetch Photos to display
  useEffect(() => {
    if (props.currStop.placeId !== undefined) {
      getPhotos(props.currStop.placeId).then((res) => {
        setPhotos(res);
      });
    }
  }, [props.currStop.placeId]);

  // Render photos in a Carousel
  const renderStopImages = () => {
    if (!photos || photos.length === 0) return;
    return (
      <View
        style={{
          // backgroundColor: "pink",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Carousel
          data={photos}
          renderItem={({ item, index }) => renderStopImage(item)}
          sliderWidth={300}
          itemWidth={220}
        />
      </View>
    );
  };

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
      {renderStopImages()}
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

const getPhotos = async (placeID) => {
  const req = `https://maps.googleapis.com/maps/api/place/details/json?key=${API_KEY}&place_id=${placeID}`;
  // console.log(req);
  const response = await axios.get(req);
  const photos = response.data.result.photos;

  return photos;
};

const renderStopImage = (photo) => {
  if (photo.photo_reference == undefined) return;

  let maxheight = 300;
  let currUri = `https://maps.googleapis.com/maps/api/place/photo?maxheight=${maxheight}&photoreference=`;
  currUri = currUri + photo.photo_reference;
  currUri = currUri + "&key=" + API_KEY;
  return <Image source={{ uri: currUri }} style={styles.cardImage} />;
};

const styles = StyleSheet.create({
  cardView: {
    width: "100%",
    height: 300,
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    alignSelf: "center",
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

  // cardScroll: {
  //   height: "60%",
  //   width: "100%",
  // },

  cardImage: {
    marginTop: 10,
    marginRight: 8,
    borderRadius: 6,
    height: 120,
    resizeMode: "cover",
  },

  deleteButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },

  trashIcon: {
    height: 24,
    width: 24,
  },
});
