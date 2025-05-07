import React from 'react';
import { Slot, router } from 'expo-router';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

export default function Layout() {
  const targetDate = new Date('2025-09-19');
  const today = new Date();
  const diff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const ddayText = `2025학년도 전국기능경기대회   D-${diff}`;

  return (
    <View style={{ flex: 1 }}>
      {/* 홈 버튼 (이미지로 변경) */}
      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.homeButton}>
        <Image
          source={require('../assets/images/logo.png')} // 경로는 layout.js 위치 기준
          style={styles.logoIcon}
        />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.ddayText}>{ddayText}</Text>
      </View>

      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 999,
    backgroundColor: 'transparent',
    padding: 6,
  },
  logoIcon: {
    width: 38,         // 로고 크기 조정
    height: 38,
    resizeMode: 'contain',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ddayText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#4da688',
  },
});
