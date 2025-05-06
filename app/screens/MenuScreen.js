import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();
  const { userJob } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>무엇을 드시겠어요?</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: '/drink', params: { userJob } })}
      >
        <Text style={styles.buttonText}>🥤 음료 선택</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: '/snack', params: { userJob } })}
      >
        <Text style={styles.buttonText}>🍪 간식 선택</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: '/my-orders', params: { userJob } })}
      >
        <Text style={styles.buttonText}>📄 신청 목록 보기</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#9e9e9e' }]}
        onPress={() => router.replace('/login')}
      >
        <Text style={styles.buttonText}>🔄 종목 다시 입력</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, marginBottom: 40 },
  button: {
    backgroundColor: '#4da688',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: 220,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18 },
});
