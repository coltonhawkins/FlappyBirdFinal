import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';

const birdImage = require('./assets/birdPNGImage.png');
const BIRD_SIZE = 20;
const GRAVITY = 9.8;

const PIPE_WIDTH = 60 * 2;
const PIPE_HEIGHT = 60;
const GAP_SIZE = 200;
const PIPE_OFFSET = 0;

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const GAP_DEVIATION = 200;

const getRandomGapY = (prevGapY) => {
  const minGapY = Math.max(PIPE_HEIGHT * 3, prevGapY - GAP_DEVIATION);
  const maxGapY = Math.min(
    HEIGHT - GAP_SIZE - PIPE_HEIGHT * 2,
    prevGapY + GAP_DEVIATION
  );
  const randomGapY = Math.random() * (maxGapY - minGapY) + minGapY;
  return randomGapY;
};

const Hitbox = ({ x, y, width, height }) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
      }}
    >
      <Image source={birdImage} style={{ width: '140%', height: '140%' }} />
    </View>
  );
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

      {/* Uncomment to see hitboxes for pipes (dont forget the bird hitbox)
      <Hitbox
        x={pipeX._value - PIPE_WIDTH / 4 +50}
        y={-20}
        width={PIPE_WIDTH}
        height={topPipeHeight}
      />
      <Hitbox
        x={pipeX._value - PIPE_WIDTH / 4 + 50}
        y={HEIGHT - bottomPipeHeight +20}
        width={PIPE_WIDTH}
        height={bottomPipeHeight}
      />
      */}

    </>
  );
};

const App = () => {
  const [birdY, setBirdY] = useState(new Animated.Value(0));
  const [currentPosition, setCurrentPosition] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const PIPE_GAP = WIDTH;
  const initialGapY = getRandomGapY(HEIGHT / 2);
  const [pipeIndex, setPipeIndex] = useState(0);
  const [pipes, setPipes] = useState([
    { x: new Animated.Value(WIDTH - 20), gapY: initialGapY },
    {
      x: new Animated.Value(WIDTH + PIPE_GAP),
      gapY: getRandomGapY(initialGapY),
    },
    {
      x: new Animated.Value(WIDTH + 2 * PIPE_GAP + 20),
      gapY: getRandomGapY(initialGapY),
    },
  ]);
  const [gameReady, setGameReady] = useState(false);
  const PIPE_SPEED = 3;

  const [gameStarted, setGameStarted] = useState(false);
  const startGame = () => {
    setGameReady(true);
  };

const handlePress = () => {
  if (!gameStarted && gameReady) {
    setGameStarted(true);
  } else if (!gameStarted) {
    startGame();
  } else {
    birdY.stopAnimation(() => {
      Animated.timing(birdY, {
        toValue: birdY._value - 0.19,
        duration: 150,
      }).start(() => {
        Animated.timing(birdY, {
          toValue: 1,
          duration: 1345,
        }).start();
      });
    });
  }
};


  const [score, setScore] = useState(1);

  const resetGame = () => {
  setBirdY(new Animated.Value(0));
  setCurrentPosition(0);
  setGameOver(false);
  setPipeIndex(0);
  setPipes([
    { x: new Animated.Value(WIDTH - 20), gapY: initialGapY },
    {
      x: new Animated.Value(WIDTH + PIPE_GAP),
      gapY: getRandomGapY(initialGapY),
    },
    {
      x: new Animated.Value(WIDTH + 2 * PIPE_GAP + 20),
      gapY: getRandomGapY(initialGapY),
    },
  ]);
  setGameReady(false);
  setGameStarted(false);
  setScore(1);
};

  const checkCollision = () => {
    pipes.forEach((pipe) => {
      const pipeX = pipe.x._value; //pixel of
      const gapTopY =
        HEIGHT - (pipe.gapY - GAP_SIZE / 2 - PIPE_HEIGHT / 2 - PIPE_OFFSET); //y value of pixel of the bottom of the top pipe
      const gapBottomY =
        HEIGHT - pipe.gapY - GAP_SIZE / 2 - PIPE_HEIGHT / 2 + PIPE_OFFSET; //y value of pixel of the top of the bottom pipe

      const birdX = WIDTH / 2;
      const birdYY = (birdY._value * -HEIGHT) / 2 + HEIGHT / 2;

      if (
        birdX + BIRD_SIZE / 2 - 30 > pipeX - PIPE_WIDTH / 2 &&
        birdX - BIRD_SIZE / 2 + 30 < pipeX + PIPE_WIDTH / 2
      ) {
        if (
          birdYY - BIRD_SIZE / 2 > gapTopY + 20 ||
          birdYY + BIRD_SIZE / 2 < gapBottomY - 20
        ) {
          console.log(gapBottomY + ' ' + birdYY + ' ' + gapTopY);
          console.log('Collision Detected');
          setGameOver(true); 
          setTimeout(() => {
            resetGame(); // Call resetGame function after a 1-second delay
          }, 1000);
        }
      }
    });
  };

  const checkPassedPipe = () => {
    pipes.forEach((pipe) => {
      const pipeXValue = pipe.x._value;
      if (pipeXValue < BIRD_SIZE && pipeXValue + PIPE_SPEED >= BIRD_SIZE) {
        setScore((prevScore) => prevScore + 1);
        console.log('Passed Pipe');
      }
    });
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
    }).start();
  }
}, [gameStarted]);


  useEffect(() => {
    if (gameStarted && !gameOver) {
      const interval = setInterval(() => {
        setPipes((pipes) =>
          pipes.map((pipe, index) => {
            const newPipe = { ...pipe };
            if (index === pipeIndex) {
              newPipe.x.setValue(newPipe.x._value - PIPE_SPEED);
              if (newPipe.x._value < -PIPE_WIDTH) {
                setPipeIndex((pipeIndex + 1) % pipes.length);
                newPipe.x.setValue(WIDTH);
                newPipe.gapY = getRandomGapY(
                  pipes[(index + pipes.length - 1) % pipes.length].gapY
                );
              }
            }
            return newPipe;
          })
        );
        checkPassedPipe();
        checkCollision();
      }, 1000 / 60);

      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    setCurrentPosition(birdY._value * 500);
  }, [birdY]);

const birdStyle = {
  transform: [
    {
      translateY: birdY.interpolate({
        inputRange: [0, 1],
        outputRange: [-250, 250],
      }),
    },
  ],
};


  return (
    <View
      style={[
        styles.container,
        score >= 5 && { backgroundColor: 'yellow' },
        score >= 10 && { backgroundColor: 'lightblue' },
        score >= 15 && { backgroundColor: 'yellow' },
      ]}>
      {gameStarted &&
        pipes.map(({ x, gapY }, i) => <Pipe key={i} pipeX={x} gapY={gapY} />)}
      <Animated.View style={[styles.bird, birdStyle]} />
      {gameStarted && <Text style={styles.score}>{score}</Text>}
      <Hitbox
      x={WIDTH / 2}
      y={(birdY._value * HEIGHT) / 2 + HEIGHT / 2 - BIRD_SIZE / 2}
      width={BIRD_SIZE+25}
      height={BIRD_SIZE+25}
      />

      
      {!gameStarted && gameReady ? (
        <TouchableOpacity onPress={handlePress} style={styles.jumpButton}>
          <Text style={styles.jumpButtonText}>Jump</Text>
        </TouchableOpacity>
      ) : (
        !gameStarted && (
          <>
            <Text style={styles.title}>Budget Flappy Bird</Text>
            <TouchableOpacity onPress={handlePress} style={styles.startButton}>
              <Text style={styles.jumpButtonText}>Start</Text>
            </TouchableOpacity>
          </>
        )
      )}

      {gameStarted && (
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
