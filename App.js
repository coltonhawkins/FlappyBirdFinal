import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TouchableWithoutFeedback,
  Text,
  Dimensions,
} from 'react-native';

const BIRD_SIZE = 25;
const GRAVITY = 9.8; // Acceleration due to gravity

const PIPE_WIDTH = 60;
const PIPE_HEIGHT = 120;

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').width;

function App() {
  const getRandomGapY = () => {
    const minGapY = PIPE_HEIGHT * 2;
    const maxGapY = HEIGHT - PIPE_HEIGHT * 3;
    return minGapY + Math.random() * (maxGapY - minGapY);
  };

  const Pipe = ({ pipeX, gapY }) => {
    return (
      <>
        <Animated.View
          style={[
            styles.pipe,
            { height: gapY - PIPE_HEIGHT / 2, left: pipeX },
            { transform: [{ rotate: '180deg' }] },
          ]}
        />
        <Animated.View
          style={[
            styles.pipe,
            { height: HEIGHT - gapY - PIPE_HEIGHT / 2, left: pipeX, bottom: 0 },
          ]}
        />
      </>
    );
  };

  const [birdY, setBirdY] = useState(new Animated.Value(0)); // Initial position of the ball
  const [currentPosition, setCurrentPosition] = useState(0); // Current position of the ball

  const [pipes, setPipes] = useState([
    { x: new Animated.Value(WIDTH), gapY: getRandomGapY() },
    { x: new Animated.Value(WIDTH + WIDTH / 2), gapY: getRandomGapY() },
    { x: new Animated.Value(WIDTH + WIDTH), gapY: getRandomGapY() },
  ]);

  const PIPE_SPEED = 5;

  useEffect(() => {
    Animated.timing(birdY, {
      toValue: 1, // End value
      duration: 2000, // Duration of animation in milliseconds
      useNativeDriver: true, // Use native driver for performance
    }).start(); // Start the animation
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPipes((pipes) => {
        const newPipes = [...pipes];
        for (let i = 0; i < newPipes.length; i++) {
          newPipes[i].x.setValue(newPipes[i].x._value - PIPE_SPEED);
          if (newPipes[i].x._value < -PIPE_WIDTH) {
            newPipes[i].x.setValue(WIDTH);
            newPipes[i].gapY = getRandomGapY();
          }
        }
        return newPipes;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, []);

  const handlePress = () => {
    //Jumping up
    Animated.timing(birdY, {
      toValue: birdY._value - 0.3,
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
        {pipes.map(({ x, gapY }, i) => (
          <Pipe key={i} pipeX={x} gapY={gapY} />
        ))}
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
  pipe: {
    position: 'absolute',
    width: PIPE_WIDTH,
    backgroundColor: 'green',
  },
});

export default App;

