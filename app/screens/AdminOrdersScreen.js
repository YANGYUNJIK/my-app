// ✅ 정상 작동하는 AdminOrdersScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
} from 'react-native';

const SERVER_URL = 'https://delivery-server-q46f.onrender.com';

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.log('❌ 주문 조회 실패:', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${SERVER_URL}/order/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();
      if (result.success) {
        fetchOrders();
      } else {
        console.log('❌ 상태 변경 실패:', result.error);
      }
    } catch (err) {
      console.log('❌ 상태 변경 실패:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 학생 주문 목록</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemBox}>
            <Text style={styles.text}>{item.name} - {item.menu} {item.quantity}개</Text>
            <Text style={styles.text}>종류: {item.type === 'drink' ? '🥤 음료' : '🍪 간식'}</Text>
            <Text style={styles.status}>상태: {item.status === 'pending' ? '⏳ 대기중' : item.status === 'accepted' ? '✅ 수락됨' : '❌ 거절됨'}</Text>

            {item.status === 'pending' && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => updateStatus(item._id, 'accepted')}
                >
                  <Text style={{ color: '#fff' }}>수락</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => updateStatus(item._id, 'rejected')}
                >
                  <Text style={{ color: '#fff' }}>거절</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  itemBox: {
    backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10,
    marginBottom: 10,
  },
  text: { fontSize: 16, marginBottom: 5 },
  status: { fontWeight: 'bold', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  acceptButton: {
    backgroundColor: '#4caf50', paddingVertical: 6,
    paddingHorizontal: 15, borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: '#f44336', paddingVertical: 6,
    paddingHorizontal: 15, borderRadius: 8,
  },
});
