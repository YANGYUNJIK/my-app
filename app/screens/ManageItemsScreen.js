// ✅ screens/ManageItemsScreen.js (최종 수정본)
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, StyleSheet, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const SERVER_URL = 'https://my-app-pzfp.onrender.com';

export default function ManageItemsScreen() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('drink');
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [stock, setStock] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchItems = async () => {
    const res = await fetch(`${SERVER_URL}/items`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const getBase64 = async (uri) => {
    if (Platform.OS === 'web') {
      const blob = await (await fetch(uri)).blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });
    } else {
      return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    }
  };

  const addItem = async () => {
    let imageBase64 = image ? await getBase64(image.uri) : null;
    const res = await fetch(`${SERVER_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, imageBase64, stock: true }),
    });
    const data = await res.json();
    if (data.success) {
      setName('');
      setImage(null);
      fetchItems();
    }
  };

  const openEdit = (item) => {
    setEditId(item._id);
    setName(item.name);
    setType(item.type);
    setStock(item.stock ?? true);
    setImage(null);
    setModalVisible(true);
  };

  const updateItem = async () => {
    let imageBase64 = image ? await getBase64(image.uri) : null;
    const res = await fetch(`${SERVER_URL}/items/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, imageBase64, stock: !!stock }),
    });
    const data = await res.json();
    if (data.success) {
      setModalVisible(false);
      setName('');
      setImage(null);
      fetchItems();
    }
  };

  const deleteItem = async (id) => {
    await fetch(`${SERVER_URL}/items/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 항목 관리</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="이름 입력"
      />

      <View style={styles.typeRow}>
        {['drink', 'snack'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setType(t)}
            style={[styles.typeButton, type === t && styles.selected]}
          >
            <Text style={type === t ? styles.selectedText : styles.buttonText}>
              {t === 'drink' ? '🥤 음료' : '🍪 간식'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
        <Text style={styles.buttonText}>{image ? '📸 이미지 선택 완료' : '📷 이미지 선택'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={addItem} style={styles.addButton}>
        <Text style={styles.addButtonText}>등록</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={{ flex: 1 }}>
              <Text>{item.name} ({item.type === 'drink' ? '🥤' : '🍪'})</Text>
              <Text style={{ fontSize: 12, color: item.stock === false ? 'red' : 'green' }}>
                {item.stock === false ? '품절' : '재고 있음'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.editButton}>
              <Text style={{ color: '#fff' }}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteItem(item._id)} style={styles.deleteButton}>
              <Text style={{ color: '#fff' }}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>항목 수정</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <View style={styles.typeRow}>
              {['drink', 'snack'].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={[styles.typeButton, type === t && styles.selected]}
                >
                  <Text style={type === t ? styles.selectedText : styles.buttonText}>
                    {t === 'drink' ? '🥤 음료' : '🍪 간식'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
              {[{ label: '재고 있음', value: true }, { label: '품절', value: false }].map(opt => (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => setStock(opt.value)}
                  style={{
                    backgroundColor: stock === opt.value ? '#4caf50' : '#eee',
                    padding: 10,
                    marginHorizontal: 5,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: stock === opt.value ? '#fff' : '#000' }}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
              <Text style={styles.buttonText}>📷 새 이미지 선택</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={updateItem} style={styles.addButton}>
              <Text style={styles.addButtonText}>수정 완료</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#888', marginTop: 10 }}>취소</Text>
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
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 10 },
  typeRow: { flexDirection: 'row', marginBottom: 10 },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#4caf50',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  selected: { backgroundColor: '#4caf50' },
  buttonText: { textAlign: 'center', color: '#000' },
  selectedText: { textAlign: 'center', color: '#fff' },
  imageButton: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: '#fff' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
  },
  itemImage: { width: 50, height: 50, marginRight: 10, borderRadius: 8 },
  editButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: 300,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});
