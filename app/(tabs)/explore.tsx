import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Trophy, TrendingUp, Filter } from 'lucide-react-native';
import { getMealEntries, MealEntry } from 'utils/storage';
import FoodEntryCard from 'components/FoodEntryCard';
import StarRating from 'components/StarRating';
import { useFocusEffect } from '@react-navigation/native';

const filterOptions = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lunch', label: 'Lunch', emoji: '🍛' },
  { id: 'dinner', label: 'Dinner', emoji: '🍽️' },
  { id: 'snack', label: 'Snacks', emoji: '🍿' },
];

export default function ExploreScreen() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [quickStats, setQuickStats] = useState({
    totalMeals: 0,
    averageRating: 0,
    topRatedMeal: null as MealEntry | null,
  });

  const loadMeals = async () => {
    try {
      const entries = await getMealEntries();
      setMeals(entries);
      calculateQuickStats(entries);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMeals();
    }, [])
  );

  const calculateQuickStats = (entries: MealEntry[]) => {
    const totalMeals = entries.length;
    const averageRating = totalMeals > 0 
      ? entries.reduce((sum, meal) => sum + meal.rating, 0) / totalMeals 
      : 0;

    const topRatedMeal = entries
      .filter(meal => meal.rating >= 4)
      .sort((a, b) => b.rating - a.rating)[0] || null;

    setQuickStats({
      totalMeals,
      averageRating,
      topRatedMeal,
    });
  };

  const filteredMeals = selectedFilter === 'all' 
    ? meals 
    : meals.filter(meal => meal.mealType === selectedFilter);

  const sortedMeals = [...filteredMeals].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const renderQuickStats = () => (
    <View className="px-5 mb-6">
      <View className="flex-row bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-slate-800">
            {quickStats.totalMeals}
          </Text>
          <Text className="text-xs text-slate-500 mt-1">
            Total Meals
          </Text>
        </View>
        
        <View className="w-px bg-slate-200 mx-4" />
        
        <View className="flex-1 items-center">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-slate-800">
              {quickStats.averageRating.toFixed(1)}
            </Text>
            <Text className="text-lg text-slate-400 ml-1">★</Text>
          </View>
          <Text className="text-xs text-slate-500 mt-1">
            Average Rating
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTopMeal = () => {
    if (!quickStats.topRatedMeal) return null;
    
    const meal = quickStats.topRatedMeal;
    
    return (
      <View className="px-5 mb-6">
        <View className="flex-row items-center mb-3">
          <Trophy size={18} color="#F59E0B" strokeWidth={2} />
          <Text className="text-lg font-semibold text-slate-800 ml-2">
            Top Rated
          </Text>
        </View>
        
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <View className="relative h-32">
            {meal.photoUri ? (
              <Image 
                source={{ uri: meal.photoUri }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-slate-50 items-center justify-center">
                <Text className="text-4xl">
                  {filterOptions.find(f => f.id === meal.mealType)?.emoji || '🍽️'}
                </Text>
              </View>
            )}
            <View className="absolute top-2 right-2 bg-white/90 rounded-xl px-2 py-1">
              <StarRating rating={meal.rating} size={12} readonly />
            </View>
          </View>
          <View className="p-4">
            <Text className="text-base font-semibold text-slate-800 mb-1">
              {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
            </Text>
            {meal.notes && (
              <Text className="text-sm text-slate-500" numberOfLines={2}>
                {meal.notes}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderFilterBar = () => (
    <View className="px-5 mb-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-slate-800">
          Recent Meals
        </Text>
        <TouchableOpacity
          className="flex-row items-center px-3 py-2 bg-slate-100 rounded-xl"
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} color="#64748B" strokeWidth={2} />
          <Text className="text-sm font-medium text-slate-600 ml-1">
            {selectedFilter === 'all' ? 'All' : filterOptions.find(f => f.id === selectedFilter)?.label}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View className="flex-row flex-wrap gap-2 mt-3">
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              className={`flex-row items-center px-3 py-2 rounded-xl border ${
                selectedFilter === option.id 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'bg-white border-slate-200'
              }`}
              onPress={() => {
                setSelectedFilter(option.id);
                setShowFilters(false);
              }}
            >
              <Text className="text-sm mr-1">{option.emoji}</Text>
              <Text className={`text-sm font-medium ${
                selectedFilter === option.id ? 'text-white' : 'text-slate-600'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View className="items-center px-10 pt-20">
      <Text className="text-6xl mb-4">📱</Text>
      <Text className="text-xl font-semibold text-slate-800 text-center mb-2">
        No meals yet
      </Text>
      <Text className="text-base text-slate-500 text-center leading-6">
        Start logging your meals to see them here
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-5 py-4 bg-white border-b border-slate-100">
        <Text className="text-2xl font-bold text-slate-800">
          Explore
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {meals.length > 0 ? (
          <>
            <View className="pt-6">
              {renderQuickStats()}
              {renderTopMeal()}
              {renderFilterBar()}
            </View>
            
            <View className="px-5 pb-6">
              {sortedMeals.length > 0 ? (
                <>
                  <Text className="text-sm text-slate-500 mb-4">
                    {sortedMeals.length} meal{sortedMeals.length !== 1 ? 's' : ''}
                  </Text>
                  {sortedMeals.map((meal) => (
                    <FoodEntryCard key={meal.id} meal={meal} onMealDeleted={loadMeals} />
                  ))}
                </>
              ) : (
                <View className="items-center py-10">
                  <Text className="text-base text-slate-500">
                    No {selectedFilter} meals found
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}