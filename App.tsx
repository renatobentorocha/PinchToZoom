import 'react-native-gesture-handler';

import React, { useRef } from 'react';

import { StyleSheet, View } from 'react-native';
import { 
  State, 
  PanGestureHandler, 
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
  PinchGestureHandler, 
  PinchGestureHandlerGestureEvent, 
  PinchGestureHandlerStateChangeEvent 
} from "react-native-gesture-handler";

import 
  Animated, { 
  Value, 
  add,
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
  useCode
} from "react-native-reanimated";

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
  const transX = useRef(new Value(0)).current;
  const offsetX = useRef(new Value(0)).current;
  
  const transY = useRef(new Value(0)).current;
  const offsetY = useRef(new Value(0)).current;

  const scaleXY = useRef(new Value<number>(1)).current;
  const offset = useRef(new Value<number>(1)).current;
  
  const _scaleTiming = useRef(new Value<number>(0)).current;
  const _scale = multiply(offset, scaleXY);
  
  const reset = () => 
    block([
      // set(transX, 0),
      // set(offsetX, 0),
      // set(transY, 0),
      // set(offsetY, 0),
      set(offset, 1),
      set(scaleXY, 1),
    ]);

  useCode(() => block([
    set(_scaleTiming, _scale),
  ]), [_scale])

  const _onPanchGestureEvent = event<PanGestureHandlerGestureEvent & PanGestureHandlerStateChangeEvent>([{
    nativeEvent: ({translationX, translationY, state, oldState}) => block([
      cond(eq(state, State.ACTIVE), [
        set(transX, add(offsetX, translationX)),
        set(transY, add(offsetY, translationY)),
      ]),
      cond(eq(oldState, State.ACTIVE), [
        set(offsetX, transX),
        set(offsetY, transY),
      ]),
    ])
  }]);

  const _onPinchGestureEvent = event<PinchGestureHandlerGestureEvent & PinchGestureHandlerStateChangeEvent>([{
    nativeEvent: ({ scale, state, oldState }) => block([
      cond(eq(state, State.ACTIVE), set(scaleXY, scale)),
      cond(eq(oldState, State.ACTIVE), [
        set(_scaleTiming, _scale), 
        set(offset, _scale)
      ])
    ])
  }]);

  const _onHandlerStateChange = event<TapGestureHandlerStateChangeEvent>([{
    nativeEvent: ({state}) => block([
      // runTimming(clock, _scale),
      cond(eq(state, State.END), set(_scaleTiming, runTimming(clock, _scaleTiming, reset)))
    ])
    
    
  }]);

  return (
    <View style={styles.container}>
    <PanGestureHandler 
      onGestureEvent={_onPanchGestureEvent} 
      onHandlerStateChange={_onPanchGestureEvent}>
      <Animated.View 
        style={[
          {backgroundColor: "green"}, 
          {
            transform: [
              {translateX: transX},
              {translateY: transY},
            ]
          }]}>
        <TapGestureHandler onHandlerStateChange={_onHandlerStateChange} numberOfTaps={2}>
          <Animated.View>
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
                        { perspective: 1000 },
                        
                        { scale: _scaleTiming },
                      ],
                    },
                  ]}
                />
            </PinchGestureHandler>
          </Animated.View>
        </TapGestureHandler>
      </Animated.View>
    </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  pinchableImage: {
    width: 182,
    height: 180,
    backgroundColor: "#ddd",
  }

})

export default App;