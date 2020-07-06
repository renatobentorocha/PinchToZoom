import 'react-native-gesture-handler';

import React, { useRef } from 'react';

import { StyleSheet, View } from 'react-native';
import { 
  State, 
  PanGestureHandler, 
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandler, 
  PinchGestureHandlerGestureEvent, 
  PinchGestureHandlerStateChangeEvent 
} from "react-native-gesture-handler";

import Animated, { Value, add, event, cond, eq, set, block, debug, and, multiply } from "react-native-reanimated";

const App = () => {
  const transX = useRef(new Value(0)).current;
  const offsetX = useRef(new Value(0)).current;
  
  const transY = useRef(new Value(0)).current;
  const offsetY = useRef(new Value(0)).current;

  const scaleXY = useRef(new Value(1)).current;
  const offset = useRef(new Value(1)).current;

  const _scale = multiply(offset, scaleXY);

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
      cond(eq(oldState, State.ACTIVE), set(offset, _scale))
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
                    
                    { scale: _scale },
                  ],
                },
              ]}
            />
        </PinchGestureHandler>
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