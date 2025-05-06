import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import logo from '../../assets/images/logo.png';
import { useLocalSearchParams } from 'expo-router';

const SERVER_URL = 'https://delivery-server-q46f.onrender.com';
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DrinkScreen() {
  const { userJob } = useLocalSearchParams();
  const [items, setItems] = useState([]);
  const [likedItems, setLikedItems] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  const scrollRef = useRef(null);
  const scrollX = useRef(0);

  useEffect(() => {
    fetch(`${SERVER_URL}/items?type=drink`)
      .then((res) => res.json())
      .then((data) => setItems([...data, ...data])) // 자동 스크롤을 위해 중복
      .catch((err) => console.log('❌ 음료 불러오기 실패:', err));
  }, []);

  // ⏩ 자동 스크롤
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current && items.length > 0) {
        scrollX.current += 1;
        scrollRef.current.scrollTo({ x: scrollX.current, animated: false });

        // 맨 끝까지 스크롤되면 처음으로 되돌리기
        if (scrollX.current > items.length * SCREEN_WIDTH * 0.22) {
          scrollX.current = 0;
          scrollRef.current.scrollTo({ x: 0, animated: false });
        }
      }
    }, 30); // 속도 조절

    return () => clearInterval(interval);
  }, [items]);

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
      alert(`${selectedItem.name} ${quantity}개 신청 완료!`);
      setModalVisible(false);
    } catch (e) {
      alert('❌ 신청 실패');
    }
  };

  const toggleLike = (itemName) => {
    setLikedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image source={logo} style={styles.logoImage} />
        <Text style={styles.emptyText}>등록된 음료가 없어요!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.itemBox}
            onPress={() => openModal(item)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.itemName}>{item.name}</Text>

            {/* 하트 */}
            <TouchableOpacity
              onPress={() => toggleLike(item.name)}
              style={styles.heartIcon}
            >
              <FontAwesome
                name={likedItems[item.name] ? 'heart' : 'heart-o'}
                size={18}
                color={likedItems[item.name] ? 'red' : 'gray'}
              />
            </TouchableOpacity>

            {/* 재고 표시 */}
            <Text style={styles.stockTag}>
              {item.stock === 0 ? '품절' : `재고: ${item.stock}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 신청 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItem?.name} 신청</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={sendOrder} style={styles.actionButton}>
                <Text style={styles.buttonText}>신청</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.actionButton}
              >
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ✅ 스타일
const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: '#fff' },
  scrollContent: { flexDirection: 'row', alignItems: 'center' },

  itemBox: {
    width: SCREEN_WIDTH * 0.22,
    height: 220,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 130,
    resizeMode: 'contain',
    marginBottom: 8,
    borderRadius: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  heartIcon: {
    position: 'absolute',
    right: 8,
    bottom: 8,
  },
  stockTag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
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
