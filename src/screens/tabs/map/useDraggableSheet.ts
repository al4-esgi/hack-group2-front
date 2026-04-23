/* eslint-disable react-hooks/immutability */
import { useMemo } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

function clamp(value: number, min: number, max: number) {
  'worklet'
  return Math.max(min, Math.min(max, value))
}

function getNearestSnap(value: number, snapPoints: number[]) {
  'worklet'
  let closest = snapPoints[0]
  for (let i = 1; i < snapPoints.length; i += 1) {
    const current = snapPoints[i]
    if (Math.abs(current - value) < Math.abs(closest - value)) {
      closest = current
    }
  }
  return closest
}

function getNextSnap(current: number, collapsed: number, expanded: number) {
  'worklet'
  const currentSnap = getNearestSnap(current, [collapsed, expanded])
  return currentSnap === collapsed ? expanded : collapsed
}

type Params = {
  windowHeight: number
  collapsedHeight: number
}

export function useDraggableSheet({ windowHeight, collapsedHeight }: Params) {
  const expandedHeight = Math.max(240, Math.round(windowHeight * 0.50))

  const currentHeight = useSharedValue(collapsedHeight)
  const baseHeight = useSharedValue(collapsedHeight)
  const didMove = useSharedValue(0)
  const sheetGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          didMove.value = 0
          baseHeight.value = currentHeight.value
        })
        .onUpdate((event) => {
          if (Math.abs(event.translationY) > 1) {
            didMove.value = 1
          }
          const nextHeight = clamp(
            baseHeight.value - event.translationY,
            collapsedHeight,
            expandedHeight,
          )
          currentHeight.value = nextHeight
        })
        .onEnd((event) => {
          if (
            didMove.value === 0 &&
            Math.abs(event.translationY) < 5 &&
            Math.abs(event.velocityY) < 80
          ) {
            const next = getNextSnap(
              currentHeight.value,
              collapsedHeight,
              expandedHeight,
            )
            currentHeight.value = withSpring(next, {
              damping: 22,
              stiffness: 220,
              mass: 0.7,
            })
            return
          }

          const projected = clamp(
            baseHeight.value - event.translationY - event.velocityY * 0.12,
            collapsedHeight,
            expandedHeight,
          )
          const target = getNearestSnap(projected, [collapsedHeight, expandedHeight])
          currentHeight.value = withSpring(target, {
            damping: 22,
            stiffness: 220,
            mass: 0.7,
          })
        }),
    [
      baseHeight,
      collapsedHeight,
      currentHeight,
      didMove,
      expandedHeight,
    ],
  )

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    height: currentHeight.value,
  }))

  return {
    sheetGesture,
    sheetAnimatedStyle,
  }
}
