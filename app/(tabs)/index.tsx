import React, { useState, useEffect } from 'react';
import {View,Text,ScrollView,Image,SafeAreaView,TouchableOpacity,RefreshControl,} from 'react-native';
import { Calendar } from 'lucide-react-native';
import { getMealEntries, MealEntry } from 'utils/storage';
import FoodEntryCard from 'components/FoodEntryCard';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMeals = async () => {
    try {
      const entries = await getMealEntries();
      setMeals(entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMeals();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
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
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const groupMealsByDate = (meals: MealEntry[]) => {
    const groups: { [key: string]: MealEntry[] } = {};
    meals.forEach(meal => {
      const dateKey = new Date(meal.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(meal);
    });
    return groups;
  };

  const groupedMeals = groupMealsByDate(meals);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b border-slate-200">
        <View>
          <Text className="text-3xl font-bold text-orange-500">
            DishiPix
          </Text>
          <Text className="text-sm text-slate-500 -mt-1">
            Your food journey
          </Text>
        </View>
        <TouchableOpacity className="p-2 rounded-lg bg-orange-50">
          <Calendar size={24} color="#FF6B35" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {meals.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 pt-30">
            
            <Image 
                source={require('../../assets/No-data.png')} 
                className="w-64 h-64 rounded-lg"
                 resizeMode="contain"
                 />
            <Text className="text-2xl font-bold text-slate-800 text-center mb-2">
              No meals logged yet!
            </Text>
            <Text className="text-base text-slate-500 text-center leading-6">
              Start your food journey by taking a photo of your next meal
            </Text>
          </View>
        ) : (
          Object.entries(groupedMeals).map(([dateString, dayMeals]) => (
            <View key={dateString} className="mb-6">
              <Text className="text-lg font-semibold text-slate-800 mx-5 my-3">
                {formatDate(dayMeals[0].timestamp)}
              </Text>
              {dayMeals.map((meal) => (
                <FoodEntryCard key={meal.id} meal={meal} onMealDeleted={loadMeals} />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}