import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 서버에서 주문 내역을 가져오는 API 호출
    fetch('http://192.168.0.111:3000/orders')
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.log('주문 내역 가져오기 실패', error));
  }, []); // 화면이 처음 렌더링될 때 한 번만 호출

  return (
    <View style={styles.container}>
      <Text style={styles.title}>주문 내역</Text>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text>{item.menu}</Text>
            <Text>{item.quantity}개</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});
