import { Slot } from 'expo-router';
import { View, Text } from 'react-native';


export default function Layout() {
  const targetDate = new Date('2025-09-19');
  const today = new Date();
  const diff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const ddayText = `2025학년도 전국기능경기대회     D-${diff}`;

  return (
    <View style={{ flex: 1 }}>
      <View style={{
        paddingTop: 20,
        paddingBottom: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
      }}>
        <Text style={{
          fontSize: 28,              // ✅ 더 큰 글씨
          fontWeight: 'bold',
          color: '#4da688'          // ✅ 지정된 색상
        }}>
          {ddayText}
        </Text>
      </View>
      <Slot />
    </View>
  );
}
