import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, Modal, StyleSheet,
} from 'react-native';
import logo from '../../assets/images/logo.png';
import { useLocalSearchParams } from 'expo-router';

const SERVER_URL = 'https://delivery-server-q46f.onrender.com';

export default function DrinkScreen() {
  const { userJob } = useLocalSearchParams();

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetch(`${SERVER_URL}/items?type=drink`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.log('❌ 음료 불러오기 실패:', err));
  }, []);

  const openModal = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setModalVisible(true);
  };

  const sendOrder = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userJob,
          menu: selectedItem.name,
          quantity,
          type: 'drink',
        }),
      });

      const result = await response.json();
      console.log('✅ 주문 전송 결과:', result);
      alert(`${selectedItem.name} ${quantity}개 신청 완료!`);
      setModalVisible(false);
    } catch (e) {
      console.log('❌ 주문 전송 실패:', e);
      alert('❌ 신청 실패');
    }
  };

  return (
    <View style={styles.container}>
      {items.length > 0 ? (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(_, i) => i.toString()}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemBox} onPress={() => openModal(item)}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image source={logo} style={styles.logoImage} />
          <Text style={styles.emptyText}>등록된 음료가 없어요!</Text>
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItem?.name} 신청</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity onPress={() => quantity > 1 && setQuantity(quantity - 1)} style={styles.arrowButton}>
                <Text style={styles.arrowText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.arrowButton}>
                <Text style={styles.arrowText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={sendOrder} style={styles.actionButton}>
                <Text style={styles.buttonText}>신청</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.actionButton}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  itemBox: {
    width: '48%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    alignItems: 'center',
  },
  image: { width: 80, height: 80, marginBottom: 5, resizeMode: 'contain' },
  modalView: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff', padding: 30,
    borderRadius: 20, width: '80%', alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  arrowButton: {
    padding: 10, backgroundColor: '#ddd',
    borderRadius: 5, marginHorizontal: 15,
  },
  arrowText: { fontSize: 20 },
  quantityText: { fontSize: 18 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    backgroundColor: '#4caf50', padding: 10,
    borderRadius: 8, marginHorizontal: 5,
  },
  buttonText: { color: '#fff' },
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  logoImage: {
    width: 160, height: 160,
    resizeMode: 'contain', marginBottom: 15,
  },
  emptyText: { fontSize: 16, color: '#888' },
});
