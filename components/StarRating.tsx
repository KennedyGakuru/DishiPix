import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  runOnJS
} from 'react-native-reanimated';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function StarRating({ 
  rating, 
  onRatingChange, 
  size = 24, 
  readonly = false 
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const handleStarPress = (star: number) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(star);
  };

  const StarComponent = ({ star }: { star: number }) => {
    const scale = useSharedValue(1);
    const filled = star <= rating;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      if (readonly || !onRatingChange) return;
      
      scale.value = withSequence(
        withSpring(1.2, { duration: 150 }),
        withSpring(1, { duration: 150 })
      );
      
      // Delay the rating change to sync with animation
      setTimeout(() => {
        handleStarPress(star);
      }, 50);
    };

    if (readonly) {
      return (
        <Star
          size={size}
          color={filled ? '#FDB833' : '#E2E8F0'}
          fill={filled ? '#FDB833' : 'transparent'}
          strokeWidth={2}
        />
      );
    }

    return (
      <AnimatedTouchableOpacity
        onPress={handlePress}
        style={[styles.starButton, animatedStyle]}
        activeOpacity={0.7}
      >
        <Star
          size={size}
          color={filled ? '#FDB833' : '#E2E8F0'}
          fill={filled ? '#FDB833' : 'transparent'}
          strokeWidth={2}
        />
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <StarComponent key={star} star={star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
});