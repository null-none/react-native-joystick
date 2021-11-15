import React, { useLayoutEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  View,
  ViewProps,
} from "react-native";
import * as utils from "./utils";

type JoystickDirection = "FORWARD" | "RIGHT" | "LEFT" | "BACKWARD";

interface JoystickUpdateEvent {
  type: "move" | "stop" | "start";
  position: {
    x: number;
    y: number;
  };
  force: number;
  angle: {
    radian: number;
    degree: number;
  };
}

interface Props {
  onStart?: (e: JoystickUpdateEvent) => void;
  onMove?: (e: JoystickUpdateEvent) => void;
  onStop?: (e: JoystickUpdateEvent) => void;
  radius?: number;
  color?: string;
}

const AxisPad: React.FC<Props> = (props) => {
  const { onStart, onMove, onStop, color = "#000000", radius = 150 } = props;

  const wrapperRadius = radius;
  const nippleRadius = wrapperRadius / 3;

  const [x, setX] = useState(wrapperRadius - nippleRadius);
  const [y, setY] = useState(wrapperRadius - nippleRadius);

  const wrapperRef = useRef<View>(null);
  const nippleRef = useRef<View>(null);

  const handleTouchMove = (e: GestureResponderEvent) => {
    const fingerX = e.nativeEvent.locationX;
    const fingerY = e.nativeEvent.locationY;
    let coordinates = {
      x: fingerX - nippleRadius,
      y: fingerY - nippleRadius,
    };

    const angle = utils.calcAngle(
      { x: fingerX, y: fingerY },
      { x: wrapperRadius, y: wrapperRadius }
    );

    let dist = utils.calcDistance(
      { x: wrapperRadius, y: wrapperRadius },
      { x: fingerX, y: fingerY }
    );

    const force = dist / (nippleRadius * 2);

    dist = Math.min(dist, wrapperRadius);
    if (dist === wrapperRadius) {
      coordinates = utils.findCoord(
        { x: wrapperRadius, y: wrapperRadius },
        dist,
        angle
      );
      coordinates = {
        x: coordinates.x - nippleRadius,
        y: coordinates.y - nippleRadius,
      };
    }
    setX(coordinates.x);
    setY(coordinates.y);

    onMove &&
      onMove({
        position: coordinates,
        angle: {
          radian: utils.degreesToRadians(angle),
          degree: angle,
        },
        force,
        type: "move",
      });
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    setX(wrapperRadius - nippleRadius);
    setY(wrapperRadius - nippleRadius);
  };

  return (
    <View
      ref={wrapperRef}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={[
        {
          width: 2 * radius,
          height: 2 * radius,
          borderRadius: radius,
          backgroundColor: `${color}55`,
        },
        {
          transform: [{ rotateX: "180deg" }],
        },
      ]}
    >
      <View
        ref={nippleRef}
        pointerEvents="none"
        style={[
          {
            height: 2 * nippleRadius,
            width: 2 * nippleRadius,
            borderRadius: nippleRadius,
            backgroundColor: `${color}bb`,
          },
          {
            position: "absolute",
            transform: [
              {
                translateX: x,
              },
              { translateY: y },
            ],
          },
        ]}
      />
    </View>
  );
};

export default AxisPad;