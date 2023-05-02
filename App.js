import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';

const BIRD_SIZE = 25;
const GRAVITY = 9.8; // Acceleration due to gravity

const PIPE_WIDTH = 60;
const PIPE_HEIGHT = 60;
const GAP_SIZE = 200;
const PIPE_OFFSET = 50;

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const getRandomGapY = () => {
  const minGapY = PIPE_HEIGHT * 2;
  const maxGapY = HEIGHT - GAP_SIZE - minGapY;
  const randomGapY = Math.random() * maxGapY;
  return randomGapY + minGapY;
};

const Pipe = ({ pipeX, gapY }) => {
  const bottomPipeHeight =
    HEIGHT - gapY - GAP_SIZE / 2 - PIPE_HEIGHT / 2 + PIPE_OFFSET; // adjust the bottom pipe height
  const topPipeHeight = gapY - GAP_SIZE / 2 - PIPE_HEIGHT / 2 - PIPE_OFFSET; // adjust the top pipe height
  return (
    <>
      <Animated.View
        style={[
          styles.pipe,
          { height: topPipeHeight, left: pipeX, top: 0 },
          { transform: [{ rotate: '180deg' }] },
        ]}
      />
      <Animated.View
        style={[
          styles.pipe,
          { height: bottomPipeHeight, left: pipeX, bottom: 0 },
        ]}
      />
    </>
  );
};

const App = () => {
  const [birdY, setBirdY] = useState(new Animated.Value(0)); // Initial position of the ball
  const [currentPosition, setCurrentPosition] = useState(0); // Current position of the ball
  const PIPE_GAP = WIDTH / 3;
  const [pipes, setPipes] = useState([
    { x: new Animated.Value(WIDTH - 20), gapY: getRandomGapY() },
    { x: new Animated.Value(WIDTH + PIPE_GAP), gapY: getRandomGapY() },
    { x: new Animated.Value(WIDTH + 2 * PIPE_GAP + 20), gapY: getRandomGapY() },
  ]);

  const PIPE_SPEED = 3;

  useEffect(() => {
    Animated.timing(birdY, {
      toValue: 1, // End value
      duration: 2000, // Duration of animation in milliseconds
      useNativeDriver: true, // Use native driver for performance
    }).start(); // Start the animation
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPipes((pipes) =>
        pipes.map((pipe) => {
          const newPipe = { ...pipe };
          newPipe.x.setValue(newPipe.x._value - PIPE_SPEED);
          if (newPipe.x._value < -PIPE_WIDTH) {
            newPipe.x.setValue(WIDTH);
            newPipe.gapY = getRandomGapY();
          }
          return newPipe;
        })
      );
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
};

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
