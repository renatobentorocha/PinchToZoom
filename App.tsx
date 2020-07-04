import 'react-native-gesture-handler';

import React, { useRef } from 'react';

import { StyleSheet } from 'react-native';
import { State, PinchGestureHandler, PinchGestureHandlerGestureEvent, PinchGestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import Animated, { Value, add, event, cond, eq, set, interpolate, block, useCode } from "react-native-reanimated";

const App = () => {
  const scaleXY = useRef(new Value(1)).current;
  const offset = useRef(new Value(0)).current;

  const _onPinchGestureEvent = event<PinchGestureHandlerGestureEvent & PinchGestureHandlerStateChangeEvent>([{
    nativeEvent: ({ scale, state, oldState }) => block([
      cond(eq(state, State.ACTIVE), set(scaleXY, add(offset, scale))),
      cond(eq(oldState, State.ACTIVE), set(offset, scale))
    ])
  }]);

  return (
    <PinchGestureHandler
      onGestureEvent={_onPinchGestureEvent}
      onHandlerStateChange={_onPinchGestureEvent}
      >
      <Animated.View style={styles.container} collapsable={false}>
        <Animated.Image
          resizeMode="stretch"
          source={require("./avatar.png")}
          style={[
            styles.pinchableImage,
            {
              transform: [
                { perspective: 1000 },
                { scale: scaleXY },
              ],
            },
          ]}
        />
      </Animated.View>
    </PinchGestureHandler>
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
    height: 180
  }

})

export default App;