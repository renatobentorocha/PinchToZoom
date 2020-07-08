import 'react-native-gesture-handler';

import React, { useRef } from 'react';

import { StyleSheet } from 'react-native';
import { 
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
  PinchGestureHandler, 
  PinchGestureHandlerGestureEvent, 
  PinchGestureHandlerStateChangeEvent 
} from "react-native-gesture-handler";

import 
  Animated, { 
  Value,
  event, 
  cond, 
  eq, 
  set, 
  block, 
  timing, 
  not, 
  multiply, 
  Clock, 
  Easing, 
  clockRunning, 
  startClock,
  stopClock,
  useCode,
  sub
} from "react-native-reanimated";

const IMAGE_DIMENSIONS = {width: 182, height: 180,}
const CENTER = {x: IMAGE_DIMENSIONS.width / 2, y: IMAGE_DIMENSIONS.height / 2}

const runTimming = (clock: Clock, from: Animated.Value<number>, reset: () => Animated.Node<number>) => {

  const state: Animated.TimingState  = { 
    finished: new Animated.Value(0), 
    position: from, 
    frameTime: new Animated.Value(0),
    time: new Animated.Value(0) 
  };

  const config: Animated.TimingConfig = { 
    toValue: new Animated.Value(1), 
    duration: 1000, 
    easing: Easing.inOut(Easing.ease) 
  };

  return block([
    cond(not(clockRunning(clock)), [
      set(state.frameTime, 0),
      set(state.time, 0),
      set(state.finished, 0),
      startClock(clock),
    ], timing(clock, state, config)),

    cond(state.finished, [
      reset(),
      set(state.finished, 0),
      set(state.frameTime, 0),
      set(state.time, 0),
      stopClock(clock),
    ]),
    state.position
  ]);
};

const App = () => {
  const clock = useRef(new Clock()).current;

  const scaleXY = useRef(new Value<number>(1)).current;
  const offset = useRef(new Value<number>(1)).current;
  
  const _scaleTiming = useRef(new Value<number>(0)).current;
  const _scale = multiply(offset, scaleXY);
  
  const origin = useRef({x: new Value<number>(0), y: new Value<number>(0)}).current;
  
  const reset = () => 
    block([
      set(offset, 1),
      set(scaleXY, 1),
    ]);

  useCode(() => block([
    set(_scaleTiming, _scale),
  ]), [_scale])

  const _onPinchGestureEvent = event<PinchGestureHandlerGestureEvent & PinchGestureHandlerStateChangeEvent>([{
    nativeEvent: ({ scale, state, oldState, focalX, focalY }) => block([
      cond(eq(state, State.ACTIVE), [
        set(scaleXY, scale),
        set(origin.x, sub(focalX, CENTER.x)),
        set(origin.y, sub(focalY, CENTER.y)),
      ]),
      cond(eq(oldState, State.ACTIVE), [
        set(_scaleTiming, _scale), 
        set(offset, _scale)
      ])
    ])
  }]);

  const _onHandlerStateChange = event<TapGestureHandlerStateChangeEvent>([{
    nativeEvent: ({state}) => block([
      cond(eq(state, State.END), [
        set(_scaleTiming, runTimming(clock, _scaleTiming, reset)),
      ])
    ])
  }]);

  return (
    <TapGestureHandler onHandlerStateChange={_onHandlerStateChange} numberOfTaps={2}>
      <Animated.View style={styles.container}>
        <PinchGestureHandler
          onGestureEvent={_onPinchGestureEvent}
          onHandlerStateChange={_onPinchGestureEvent}>
            <Animated.Image
              resizeMode="stretch"
              source={require("./avatar.png")}
              style={[
                styles.pinchableImage,
                {
                  transform: [
                    {translateX: origin.x},
                    {translateY: origin.y},
                    { scale: _scaleTiming },
                    {translateX: multiply(-1, origin.x)},
                    {translateY: multiply(-1, origin.y)},

                  ],
                },
              ]}
            />
        </PinchGestureHandler>
      </Animated.View>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  pinchableImage: {
    width: IMAGE_DIMENSIONS.width,
    height: IMAGE_DIMENSIONS.height,
    backgroundColor: "#ddd",
  }

})

export default App;