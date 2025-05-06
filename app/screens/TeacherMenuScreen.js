import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function TeacherMenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍🏫 선생님 메뉴</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/admin-orders')}
      >
        <Text style={styles.buttonText}>📋 신청 목록 보기</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/manage-items')}
      >
        <Text style={styles.buttonText}>🛠️ 항목 등록 / 수정</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace('/login')}
      >
        <Text style={styles.logoutText}>🔄 처음으로</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  button: {
    backgroundColor: '#4da688',
    padding: 20,
    borderRadius: 10,
    marginVertical: 15,
    width: 250,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18 },
  logoutButton: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#9e9e9e',
    borderRadius: 8,
    width: 250,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
});
