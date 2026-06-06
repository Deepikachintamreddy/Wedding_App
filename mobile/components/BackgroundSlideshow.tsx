import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated, Dimensions } from 'react-native';

const IMAGES = [
  require('../assets/images/wedding_table_bg.png'),
  require('../assets/images/wedding_couple_bg.png'),
  require('../assets/images/wedding_rings_bg.png'),
  require('../assets/images/wedding_venue_bg.png')
];

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const zoomAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start Ken Burns zoom effect loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(zoomAnim, {
          toValue: 1.05,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(zoomAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      // Trigger cross-fade
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1800,
        useNativeDriver: true,
      }).start(() => {
        setIndex(nextIndex);
        setNextIndex((nextIndex + 1) % IMAGES.length);
        fadeAnim.setValue(1);
      });
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(timer);
  }, [nextIndex]);

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      {/* Background Next Image */}
      <Image
        source={IMAGES[nextIndex]}
        style={styles.image}
        resizeMode="cover"
      />
      {/* Foreground Active Image (Fading out during transition) */}
      <Animated.Image
        source={IMAGES[index]}
        style={[
          styles.image,
          {
            opacity: fadeAnim,
            transform: [{ scale: zoomAnim }]
          }
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -10,
    backgroundColor: '#0d0d1a',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 13, 26, 0.72)', // Semi-transparent dark navy overlay
    zIndex: 2,
  },
  image: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  }
});
