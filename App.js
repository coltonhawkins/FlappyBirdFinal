import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Text,
  TouchableOpacity
} from 'react-native';

const BIRD_SIZE = 25;
const GRAVITY = 9.8;

const PIPE_WIDTH = 60 * 2;
const PIPE_HEIGHT = 60;
const GAP_SIZE = 200;
const PIPE_OFFSET = 0;

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const GAP_DEVIATION = 225;

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
  const PIPE_GAP = WIDTH;
  const initialGapY = getRandomGapY(HEIGHT / 2);
  const [pipeIndex, setPipeIndex] = useState(0);
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

   const handlePress = () => {
    if (!gameStarted) {
      startGame();
    } else {
      birdY.stopAnimation(() => {
        Animated.timing(birdY, {
          toValue: birdY._value - 0.19,
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

  const [score, setScore] = useState(1);

  const checkPassedPipe = () => {
    pipes.forEach((pipe) => {
      const pipeXValue = pipe.x._value;
      if (pipeXValue < BIRD_SIZE && pipeXValue + PIPE_SPEED >= BIRD_SIZE) {
        setScore((prevScore) => prevScore + 1);
      }
    });
  };

  const checkCollision = () => {
  const birdYValue = birdY._value * 500;
  const birdTop = birdYValue;
  const birdBottom = birdYValue + BIRD_SIZE;

  for (const pipe of pipes) {
    const pipeXValue = pipe.x._value;

    if (pipeXValue + PIPE_WIDTH >= 0 && pipeXValue <= BIRD_SIZE) {
      const topPipeHeight = pipe.gapY - GAP_SIZE / 2 - PIPE_HEIGHT / 2 - PIPE_OFFSET;
      const bottomPipeHeight = HEIGHT - pipe.gapY - GAP_SIZE / 2 - PIPE_HEIGHT / 2 + PIPE_OFFSET;

      if (birdTop <= topPipeHeight || birdBottom >= HEIGHT - bottomPipeHeight) {
        // Collision detected, stop the game
        setGameStarted(false);
      }
    }
  }
};


useEffect(() => {
  if (gameStarted) {
    const timer = setTimeout(() => {
      setPipeIndex((pipeIndex + 1) % pipes.length);
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [gameStarted, pipeIndex]);

useEffect(() => {
    if (gameStarted) {
      Animated.timing(birdY, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    }
  }, [gameStarted]);

useEffect(() => {
  if (gameStarted) {
    const interval = setInterval(() => {
      setPipes((pipes) =>
        pipes.map((pipe, index) => {
          const newPipe = { ...pipe };
          if (index === pipeIndex) {
            newPipe.x.setValue(newPipe.x._value - PIPE_SPEED);
            if (newPipe.x._value < -PIPE_WIDTH) {
              setPipeIndex((pipeIndex + 1) % pipes.length);
              newPipe.x.setValue(WIDTH);
              newPipe.gapY = getRandomGapY(pipes[(index + pipes.length - 1) % pipes.length].gapY);
            }
          }
          return newPipe;
        })
      );
      checkPassedPipe();
    }, 1000 / 60);

    return () => clearInterval(interval);
  }
}, [gameStarted]);


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
  <View style={styles.container}>
    {gameStarted &&
      pipes.map(({ x, gapY }, i) => (
        <Pipe key={i} pipeX={x} gapY={gapY} />
      ))}
    <Animated.View style={[styles.bird, birdStyle]} />
    {gameStarted && <Text style={styles.score}>{score}</Text>}

    {!gameStarted ? (
      <>
        <Text style={styles.title}>Budget Flappy Bird</Text>
        <TouchableOpacity onPress={handlePress} style={styles.startButton}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </>
    ) : (
      <TouchableOpacity onPress={handlePress} style={styles.jumpButton}>
        <Text style={styles.jumpButtonText}>Jump</Text>
      </TouchableOpacity>
    )}
  </View>
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
    fontSize: 35,
    fontWeight: 'bold',
    color: 'black',
  },
  title: {
    position: 'absolute',
    top: HEIGHT / 2 - 200,
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  startButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightblue',
    borderWidth: 5,
    borderColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  startButtonText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  jumpButton: {
  position: 'absolute',
  bottom: 50,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'lightblue',
  borderWidth: 5,
  borderColor: 'white',
  borderRadius: 10,
  paddingHorizontal: 40,
  paddingVertical: 20,
},
jumpButtonText: {
  fontSize: 40,
  fontWeight: 'bold',
  color: 'white',
},

});


export default App;


