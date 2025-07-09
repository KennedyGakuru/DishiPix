import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MealEntry {
  id: string;
  photoUri: string;
  mealType: string;
  rating: number;
  notes: string;
  timestamp: string;
}

const MEALS_STORAGE_KEY = '@dishipix_meals';

export const saveMealEntry = async (mealData: Omit<MealEntry, 'id'>): Promise<void> => {
  try {
    const existingMeals = await getMealEntries();
    const newMeal: MealEntry = {
      ...mealData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    const updatedMeals = [...existingMeals, newMeal];
    await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
  } catch (error) {
    console.error('Error saving meal entry:', error);
    throw new Error('Failed to save meal entry');
  }
};

export const getMealEntries = async (): Promise<MealEntry[]> => {
  try {
    const mealsJson = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
    return mealsJson ? JSON.parse(mealsJson) : [];
  } catch (error) {
    console.error('Error getting meal entries:', error);
    return [];
  }
};

export const deleteMealEntry = async (mealId: string): Promise<void> => {
  try {
    const existingMeals = await getMealEntries();
    const updatedMeals = existingMeals.filter(meal => meal.id !== mealId);
    await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
  } catch (error) {
    console.error('Error deleting meal entry:', error);
    throw new Error('Failed to delete meal entry');
  }
};

export const updateMealEntry = async (mealId: string, updatedData: Partial<MealEntry>): Promise<void> => {
  try {
    const existingMeals = await getMealEntries();
    const updatedMeals = existingMeals.map(meal => 
      meal.id === mealId 
        ? { ...meal, ...updatedData }
        : meal
    );
    await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
  } catch (error) {
    console.error('Error updating meal entry:', error);
    throw new Error('Failed to update meal entry');
  }
};

export const clearAllMeals = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MEALS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing meals:', error);
    throw new Error('Failed to clear meals');
  }
};