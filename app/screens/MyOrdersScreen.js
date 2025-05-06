import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Modal, TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const SERVER_URL = 'https://delivery-server-q46f.onrender.com';

export default function MyOrdersScreen() {
  const { userJob } = useLocalSearchParams();
  const [orders, setOrders] = useState([]);
  const [editOrderId, setEditOrderId] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/orders?name=${encodeURIComponent(userJob)}`);
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.log('❌ 주문 내역 불러오기 실패:', e);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await fetch(`${SERVER_URL}/orders/${id}`, { method: 'DELETE' });
      fetchMyOrders();
    } catch (e) {
      console.log('❌ 주문 삭제 실패:', e);
    }
  };

  const openEditModal = (orderId, currentQuantity) => {
    setEditOrderId(orderId);
    setNewQuantity(currentQuantity.toString());
    setModalVisible(true);
  };

  const updateOrder = async () => {
    try {
      await fetch(`${SERVER_URL}/orders/${editOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: parseInt(newQuantity) }),
      });
      setModalVisible(false);
      fetchMyOrders();
    } catch (e) {
      console.log('❌ 주문 수정 실패:', e);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 {userJob}님의 신청 내역</Text>

      <FlatList
        data={orders}
        keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemBox}>
            <Text style={styles.text}>{item.menu} - {item.quantity}개</Text>
            <Text style={styles.text}>종류: {item.type === 'drink' ? '🥤 음료' : '🍪 간식'}</Text>
            <Text style={styles.status}>
              상태: {
                item.status === 'pending' ? '⏳ 대기중' :
                item.status === 'accepted' ? '✅ 수락됨' :
                '❌ 거절됨'
              }
            </Text>

            {item.status === 'pending' && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(item._id, item.quantity)}
                >
                  <Text style={{ color: '#fff' }}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteOrder(item._id)}
                >
                  <Text style={{ color: '#fff' }}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* 수정 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ marginBottom: 10 }}>새 수량을 입력하세요:</Text>
            <TextInput
              value={newQuantity}
              onChangeText={setNewQuantity}
              keyboardType="number-pad"
              style={styles.input}
            />
            <TouchableOpacity style={styles.updateButton} onPress={updateOrder}>
              <Text style={{ color: '#fff' }}>수정 완료</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: '#999' }}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  itemBox: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: { fontSize: 16, marginBottom: 5 },
  status: { fontWeight: 'bold', marginTop: 5 },
  buttonRow: { flexDirection: 'row', marginTop: 10 },
  editButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff', padding: 20,
    borderRadius: 10, width: '80%', alignItems: 'center',
  },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    width: '100%', padding: 10, borderRadius: 8,
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
});
