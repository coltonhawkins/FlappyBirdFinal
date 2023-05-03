import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Text,
} from 'react-native';

const BIRD_SIZE = 25;
const GRAVITY = 9.8;

const PIPE_WIDTH = 60;
const PIPE_HEIGHT = 60;
const GAP_SIZE = 200;
const PIPE_OFFSET = 50;

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const GAP_DEVIATION = 150;

const getRandomGapY = (prevGapY) => {
  const minGapY = Math.max(PIPE_HEIGHT * 3, prevGapY - GAP_DEVIATION);
  const maxGapY = Math.min(HEIGHT - GAP_SIZE - PIPE_HEIGHT * 2, prevGapY + GAP_DEVIATION);
  const randomGapY = Math.random() * (maxGapY - minGapY) + minGapY;
  return randomGapY;
};

const Pipe = ({ pipeX, gapY }) => {
  const bottomPipeHeight =
    HEIGHT - gapY - GAP_SIZE / 2 - PIPE_HEIGHT / 2 + PIPE_OFFSET;
  const topPipeHeight = gapY - GAP_SIZE / 2 - PIPE_HEIGHT / 2 - PIPE_OFFSET;
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
  const [birdY, setBirdY] = useState(new Animated.Value(0));
  const [currentPosition, setCurrentPosition] = useState(0);
  const PIPE_GAP = WIDTH / 3;
  const initialGapY = getRandomGapY(HEIGHT / 2);
  const [pipes, setPipes] = useState([
    { x: new Animated.Value(WIDTH - 20), gapY: initialGapY },
    { x: new Animated.Value(WIDTH + PIPE_GAP), gapY: getRandomGapY(initialGapY) },
    { x: new Animated.Value(WIDTH + 2 * PIPE_GAP + 20), gapY: getRandomGapY(initialGapY) },
  ]);

  const PIPE_SPEED = 3;

  const [gameStarted, setGameStarted] = useState(false);
  const startGame = () => {
    setGameStarted(true);
  };

  useEffect(() => {
    if (gameStarted) {
      Animated.timing(birdY, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    }
  }, [gameStarted]);

  const [score, setScore] = useState(1);

  const checkPassedPipe = () => {
    pipes.forEach((pipe) => {
      const pipeXValue = pipe.x._value;
      if (pipeXValue < BIRD_SIZE && pipeXValue + PIPE_SPEED >= BIRD_SIZE) {
        setScore((prevScore) => prevScore + 1);
      }
    });
  };

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setPipes((pipes) =>
          pipes.map((pipe, index) => {
            const newPipe = { ...pipe};        
            newPipe.x.setValue(newPipe.x._value - PIPE_SPEED);
            if (newPipe.x._value < -PIPE_WIDTH) {
              newPipe.x.setValue(WIDTH);
              newPipe.gapY = getRandomGapY(pipes[(index + pipes.length - 1) % pipes.length].gapY);
            }
            return newPipe;
          })
        );
        checkPassedPipe();
      }, 1000 / 60);

      return () => clearInterval(interval);
    }
  }, [gameStarted]);

  const handlePress = () => {
    if (!gameStarted) {
      startGame();
    } else {
      birdY.stopAnimation(() => {
        Animated.timing(birdY, {
          toValue: birdY._value - 0.16,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(birdY, {
            toValue: 1,
            duration: 1345,
            useNativeDriver: true,
          }).start();
        });
      });
    }
  };

  useEffect(() => {
    setCurrentPosition(birdY._value * 500);
  }, [birdY]);

  const birdStyle = {
    transform: [
      {
        translateY: birdY.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 500],
        }),
      },
    ],
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        {gameStarted &&
          pipes.map(({ x, gapY }, i) => (
            <Pipe key={i} pipeX={x} gapY={gapY} />
          ))}
        <Animated.View style={[styles.bird, birdStyle]} />
        {gameStarted && <Text style={styles.score}>{score}</Text>}

        {!gameStarted && (
          <View style={styles.startButton}>
            <Text style={styles.startButtonText}>Start</Text>
          </View>
        )}
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
  score: {
    position: 'absolute',
    top: 50,
    left: WIDTH / 2,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  startButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightblue',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  startButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default App;




