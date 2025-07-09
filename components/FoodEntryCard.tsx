import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Clock, MessageCircle, X, Trash2, MoreHorizontal } from 'lucide-react-native';
import { MealEntry, deleteMealEntry } from 'utils/storage';
import StarRating from './StarRating';

interface FoodEntryCardProps {
  meal: MealEntry;
  onMealDeleted?: () => void;
}

const mealTypeData = {
  breakfast: { emoji: '🍳', color: '#FDB833' },
  lunch: { emoji: '🍛', color: '#FF6B35' },
  dinner: { emoji: '🍽️', color: '#8B5CF6' },
  snack: { emoji: '🍿', color: '#10B981' },
};

export default function FoodEntryCard({ meal, onMealDeleted }: FoodEntryCardProps) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const mealData = mealTypeData[meal.mealType as keyof typeof mealTypeData] || 
    { emoji: '🍽️', color: '#64748B' };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteMealEntry(meal.id);
              onMealDeleted?.();
            } catch (error) {
              console.error('Error deleting meal:', error);
            } finally {
              setIsDeleting(false);
              setShowFullImage(false);
              setShowActions(false);
            }
          }
        }
      ]
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#10B981'; // Green
    if (rating >= 3) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const hasLongNotes = meal.notes && meal.notes.length > 60;

  return (
    <>
      <View className="bg-white rounded-3xl mb-4 overflow-hidden border border-slate-100 shadow-sm">
        {/* Image Section */}
        <TouchableOpacity 
          className="relative"
          onPress={() => setShowFullImage(true)}
          activeOpacity={0.95}
        >
          <View className="h-40 bg-slate-50">
            {meal.photoUri ? (
              <Image 
                source={{ uri: meal.photoUri }} 
                className="w-full h-full" 
                resizeMode="cover" 
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Text className="text-5xl opacity-30">📸</Text>
                <Text className="text-sm text-slate-400 mt-2">No photo</Text>
              </View>
            )}
          </View>
          
          {/* Meal Type Badge */}
          <View 
            className="absolute top-3 left-3 flex-row items-center px-3 py-1.5 rounded-full shadow-sm"
            style={{ backgroundColor: mealData.color }}
          >
            <Text className="text-sm mr-1">{mealData.emoji}</Text>
            <Text className="text-xs font-semibold text-white">
              {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
            </Text>
          </View>
          
          {/* Rating Badge */}
          <View className="absolute top-3 right-3 bg-white/95 rounded-full px-2.5 py-1.5 shadow-sm">
            <View className="flex-row items-center">
              <Text className="text-sm font-bold text-slate-800 mr-1">
                {meal.rating.toFixed(1)}
              </Text>
              <Text className="text-sm" style={{ color: getRatingColor(meal.rating) }}>
                ★
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Content Section */}
        <View className="p-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center flex-1">
              <Clock size={16} color="#94A3B8" strokeWidth={2} />
              <Text className="text-sm text-slate-500 ml-2 font-medium">
                {formatDate(meal.timestamp)} • {formatTime(meal.timestamp)}
              </Text>
            </View>
            
            <TouchableOpacity 
              className="p-2 -m-2"
              onPress={() => setShowActions(!showActions)}
            >
              <MoreHorizontal size={18} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Notes */}
          {meal.notes && (
            <View className="flex-row items-start">
              <MessageCircle size={16} color="#94A3B8" strokeWidth={2} className="mt-0.5" />
              <Text className="text-sm text-slate-700 ml-2 flex-1 leading-5">
                {hasLongNotes ? `${meal.notes.substring(0, 60)}...` : meal.notes}
              </Text>
            </View>
          )}
          
          {/* Actions Menu */}
          {showActions && (
            <View className="mt-3 pt-3 border-t border-slate-100">
              <TouchableOpacity 
                className="flex-row items-center py-2"
                onPress={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                <Text className="text-sm text-red-500 ml-2 font-medium">
                  {isDeleting ? 'Deleting...' : 'Delete meal'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Full Image Modal */}
      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="absolute top-12 left-0 right-0 flex-row justify-between items-center px-5 z-10">
            <TouchableOpacity 
              className="w-12 h-12 rounded-full bg-black/50 items-center justify-center"
              onPress={() => setShowFullImage(false)}
            >
              <X size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-12 h-12 rounded-full bg-red-500/80 items-center justify-center"
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 size={22} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          {/* Image */}
          <View className="flex-1 justify-center items-center px-5">
            {meal.photoUri ? (
              <Image 
                source={{ uri: meal.photoUri }} 
                className="w-full h-full" 
                resizeMode="contain" 
              />
            ) : (
              <View className="items-center">
                <Text className="text-8xl opacity-30">📸</Text>
                <Text className="text-white text-lg mt-4">No photo available</Text>
              </View>
            )}
          </View>
          
          {/* Bottom Info */}
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-3">{mealData.emoji}</Text>
              <View className="flex-1">
                <Text className="text-xl font-semibold text-white">
                  {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                </Text>
                <Text className="text-sm text-slate-300">
                  {formatDate(meal.timestamp)} • {formatTime(meal.timestamp)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-white mr-1">
                  {meal.rating.toFixed(1)}
                </Text>
                <Text className="text-lg text-yellow-400">★</Text>
              </View>
            </View>
            
            {meal.notes && (
              <Text className="text-sm text-slate-200 leading-6">
                {meal.notes}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}