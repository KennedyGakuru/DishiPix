import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Plus } from 'lucide-react-native';
import { Text, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#EF946C',
          borderRadius: 50,
          height: 55,
          width: '90%',
          position: 'absolute',
          bottom: 20,
          marginHorizontal: '5%',
          elevation: 5,
          borderTopWidth: 0, 
        },
        tabBarActiveTintColor: '#E5EAFA',
        tabBarInactiveTintColor: 'white',
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'index') {
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="home" size={24} color={color} />
                {focused && <Text style={{ color, marginRight: -30 }}>Home</Text>}
              </View>
            );
          }
          if (route.name === 'add') {
            return (
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 10,
                  borderRadius: 30,
                  marginBottom: 0,
                  elevation: 5,
                }}>
                <Plus size={30} color="#EF946C" strokeWidth={2.5} />
              </View>
            );
          }
          if (route.name === 'explore') {
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {focused && (
                  <Text style={{ color, marginLeft: -30  }} numberOfLines={1}>Explore</Text>
                )}
                <Ionicons name="search" size={24} color={color} />
              </View>
            );
          }
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="add" options={{ title: 'Add' }} />
      <Tabs.Screen name="explore" options={{ title: 'Search' }} />
    </Tabs>
  );
}
