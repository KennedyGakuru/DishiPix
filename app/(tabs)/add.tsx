import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Platform, Image, Modal } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, RotateCcw, Check, X, Image as ImageIcon, AlertCircle } from 'lucide-react-native';
import { saveMealEntry } from 'utils/storage';
import StarRating from 'components/StarRating';
import { router } from 'expo-router';

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lunch', label: 'Lunch', emoji: '🍛' },
  { id: 'dinner', label: 'Dinner', emoji: '🍽️' },
  { id: 'snack', label: 'Snack', emoji: '🍿' },
];

export default function AddScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const cameraRef = useRef<CameraView>(null);

  const clearErrors = () => setErrors({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!photoUri) {
      newErrors.photo = 'Please take a photo or select from gallery';
    }
    if (!selectedMealType) {
      newErrors.mealType = 'Please select a meal type';
    }
    if (rating === 0) {
      newErrors.rating = 'Please add a rating';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePicker = async () => {
    if (Platform.OS === 'web') {
      const placeholderImages = [
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
      const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      setPhotoUri(randomImage);
      setShowPhotoPreview(true);
      clearErrors();
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setErrors({ photo: 'Gallery permission is required' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setShowPhotoPreview(true);
      clearErrors();
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      handleImagePicker();
      return;
    }

    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        setErrors({ photo: 'Camera permission is required' });
        return;
      }
    }

    setShowCamera(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setPhotoUri(photo.uri);
          setShowCamera(false);
          setShowPhotoPreview(true);
          clearErrors();
        }
      } catch (error) {
        console.error('Error taking photo:', error);
        setErrors({ photo: 'Failed to take photo' });
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await saveMealEntry({
        photoUri: photoUri!,
        mealType: selectedMealType,
        rating,
        notes: notes.trim(),
        timestamp: new Date().toISOString(),
      });

      setPhotoUri(null);
      setSelectedMealType('');
      setRating(0);
      setNotes('');
      setErrors({});

      // Use replace instead of push to avoid navigation context issues
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving meal:', error);
      setErrors({ submit: 'Failed to save meal. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPhotoUri(null);
    setSelectedMealType('');
    setRating(0);
    setNotes('');
    setShowCamera(false);
    setShowPhotoPreview(false);
    setErrors({});
  };

  const retakePhoto = () => {
    setPhotoUri(null);
    setShowPhotoPreview(false);
  };

  if (showCamera) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView 
          ref={cameraRef}
          style={{ flex: 1 }} 
          facing={facing}
        />
        {/* Camera controls positioned absolutely outside CameraView */}
        <View style={{
          position: 'absolute',
          bottom: 48,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingHorizontal: 40
        }}>
          <TouchableOpacity 
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(0,0,0,0.6)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => setShowCamera(false)}
          >
            <X size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={capturePhoto}
          >
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#FF6B35'
            }} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(0,0,0,0.6)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={toggleCameraFacing}
          >
            <RotateCcw size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ 
        paddingHorizontal: 20, 
        paddingVertical: 16, 
        backgroundColor: 'white', 
        borderBottomWidth: 1, 
        borderBottomColor: '#E5E7EB' 
      }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>Add New Meal</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: -4 }}>Capture your delicious moment</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Photo Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>📸 Photo</Text>
          
          {photoUri ? (
            <View style={{ 
              borderRadius: 12, 
              overflow: 'hidden', 
              backgroundColor: 'white', 
              borderWidth: 2, 
              borderColor: '#10B981' 
            }}>
              <Image source={{ uri: photoUri }} style={{ width: '100%', height: 192 }} resizeMode="cover" />
              <View style={{ flexDirection: 'row', padding: 12, gap: 12 }}>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 8, 
                    backgroundColor: '#FFF7ED', 
                    borderRadius: 8, 
                    gap: 6 
                  }}
                  onPress={retakePhoto}
                >
                  <Camera size={16} color="#FF6B35" strokeWidth={2} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#FF6B35' }}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 8, 
                    backgroundColor: '#FFF7ED', 
                    borderRadius: 8, 
                    gap: 6 
                  }}
                  onPress={() => setShowPhotoPreview(true)}
                >
                  <ImageIcon size={16} color="#FF6B35" strokeWidth={2} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#FF6B35' }}>Preview</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    height: 112, 
                    borderRadius: 12, 
                    borderWidth: 2, 
                    borderStyle: 'dashed', 
                    borderColor: '#D1D5DB', 
                    backgroundColor: 'white', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                  onPress={handleTakePhoto}
                >
                  <Camera size={32} color="#FF6B35" strokeWidth={2} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#FF6B35', marginTop: 8 }}>Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    height: 112, 
                    borderRadius: 12, 
                    borderWidth: 2, 
                    borderStyle: 'dashed', 
                    borderColor: '#D1D5DB', 
                    backgroundColor: 'white', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                  onPress={handleImagePicker}
                >
                  <ImageIcon size={32} color="#FF6B35" strokeWidth={2} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#FF6B35', marginTop: 8 }}>From Gallery</Text>
                </TouchableOpacity>
              </View>
              {errors.photo && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                  <AlertCircle size={16} color="#EF4444" strokeWidth={2} />
                  <Text style={{ fontSize: 14, color: '#EF4444' }}>{errors.photo}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Meal Type Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>🍽️ Meal Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={{ 
                  flex: 1, 
                  minWidth: '45%', 
                  padding: 16, 
                  borderRadius: 12, 
                  borderWidth: 2, 
                  alignItems: 'center',
                  borderColor: selectedMealType === meal.id ? '#FF6B35' : '#E5E7EB',
                  backgroundColor: selectedMealType === meal.id ? '#FFF7ED' : 'white'
                }}
                onPress={() => {
                  setSelectedMealType(meal.id);
                  clearErrors();
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 8 }}>{meal.emoji}</Text>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600',
                  color: selectedMealType === meal.id ? '#FF6B35' : '#6B7280'
                }}>
                  {meal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.mealType && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
              <AlertCircle size={16} color="#EF4444" strokeWidth={2} />
              <Text style={{ fontSize: 14, color: '#EF4444' }}>{errors.mealType}</Text>
            </View>
          )}
        </View>

        {/* Rating Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>⭐ Rating</Text>
          <StarRating 
            rating={rating} 
            onRatingChange={(newRating) => {
              setRating(newRating);
              clearErrors();
            }} 
            size={40}
          />
          {errors.rating && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
              <AlertCircle size={16} color="#EF4444" strokeWidth={2} />
              <Text style={{ fontSize: 14, color: '#EF4444' }}>{errors.rating}</Text>
            </View>
          )}
        </View>

        {/* Notes Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>📝 Notes (Optional)</Text>
          <TextInput
            style={{ 
              backgroundColor: 'white', 
              borderWidth: 1, 
              borderColor: '#E5E7EB', 
              borderRadius: 12, 
              padding: 16, 
              fontSize: 16, 
              color: '#1F2937', 
              height: 80, 
              textAlignVertical: 'top' 
            }}
            placeholder="How was it? Any special thoughts?"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'right', marginTop: 4 }}>
            {notes.length}/200
          </Text>
        </View>

        {/* Error Message */}
        {errors.submit && (
          <View style={{ 
            backgroundColor: '#FEF2F2', 
            padding: 12, 
            borderRadius: 8, 
            marginTop: 16, 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: 6 
          }}>
            <AlertCircle size={16} color="#EF4444" strokeWidth={2} />
            <Text style={{ fontSize: 14, color: '#EF4444' }}>{errors.submit}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 32, marginBottom: 32 }}>
          <TouchableOpacity 
            style={{ 
              flex: 1, 
              padding: 16, 
              borderRadius: 12, 
              backgroundColor: 'white', 
              borderWidth: 2, 
              borderColor: '#E5E7EB', 
              alignItems: 'center' 
            }}
            onPress={handleCancel}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#6B7280' }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ 
              flex: 2, 
              flexDirection: 'row', 
              padding: 16, 
              borderRadius: 12, 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8,
              backgroundColor: isSubmitting ? '#D1D5DB' : '#FF6B35'
            }}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Check size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
              {isSubmitting ? 'Saving...' : 'Save Meal'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Photo Preview Modal */}
      <Modal
        visible={showPhotoPreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPhotoPreview(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.9)', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <View style={{ width: '90%', height: '80%', position: 'relative' }}>
            <TouchableOpacity 
              style={{ 
                position: 'absolute', 
                top: 20, 
                right: 20, 
                zIndex: 10, 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(0,0,0,0.6)', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
              onPress={() => setShowPhotoPreview(false)}
            >
              <X size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            {photoUri && (
              <Image 
                source={{ uri: photoUri }} 
                style={{ width: '100%', height: '100%', borderRadius: 12 }} 
                resizeMode="contain" 
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}