import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Animated, TouchableWithoutFeedback, Text } from 'react-native';

const BIRD_SIZE = 25;
const GRAVITY = 9.8; // Acceleration due to gravity

function App() {
  const [birdY, setBirdY] = useState(new Animated.Value(0)); // Initial position of the ball
  const [currentPosition, setCurrentPosition] = useState(0); // Current position of the ball

  useEffect(() => {
    Animated.timing(birdY, {
      toValue: 1, // End value
      duration: 2000, // Duration of animation in milliseconds
      useNativeDriver: true, // Use native driver for performance
    }).start(); // Start the animation
  }, []);

  const handlePress = () => {
    //Jumping up
    Animated.timing(birdY, {
      toValue: birdY._value - .3,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      //gravity down
      Animated.timing(birdY, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    setCurrentPosition(birdY._value * 500); // Convert birdY value to current position
  }, [birdY]);

  const birdStyle = {
    transform: [
      {
        translateY: birdY.interpolate({
          inputRange: [0, 1], // Input range of the animation
          outputRange: [0, 500], // Output range of the animation (height of the screen)
        }),
      },
    ],
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <Animated.View style={[styles.bird, birdStyle]} />
        
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bird: {
    backgroundColor: 'red',
    height: BIRD_SIZE,
    width: BIRD_SIZE,
    borderRadius: BIRD_SIZE / 2,
  },
  
});

export default App;
