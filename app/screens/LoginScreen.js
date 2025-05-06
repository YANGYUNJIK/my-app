//screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';

const jobs = ['게임개발', '모바일앱개발', '사이버보안', '정보기술', '클라우드컴퓨팅'];

export default function LoginScreen() {
  const [userJob, setUserJob] = useState(null);
  const [showPwModal, setShowPwModal] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  const router = useRouter();

  const loginAs = (role) => {
    if (!userJob) {
      alert('직종을 선택하세요!');
      return;
    }

    if (role === 'teacher') {
      setSelectedRole(role);
      setShowPwModal(true);
      return;
    }

    // 👩‍🎓 학생은 바로 이동
    router.replace({
      pathname: '/menu',
      params: { userJob, role },
    });
  };

  const confirmPassword = () => {
    if (password === '1234') {
      setShowPwModal(false);
      setPassword('');
      router.replace({
        pathname: '/teacher-menu',
        params: { userJob, role: selectedRole },
      });
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={
          userJob
            ? require('../../assets/images/world2.png')
            : require('../../assets/images/world1.png')
        }
        style={styles.logo}
      />

      <View style={styles.dropdownWrapper}>
        <RNPickerSelect
          onValueChange={(value) => setUserJob(value)}
          value={userJob}
          placeholder={{ label: '직종을 선택하세요', value: null }}
          useNativeAndroidPickerStyle={false}
          items={jobs.map((job) => ({ label: job, value: job }))}
          style={pickerSelectStyles}
        />
      </View>

      <View style={styles.roleRow}>
        <TouchableOpacity style={styles.roleButton} onPress={() => loginAs('student')}>
          <Text style={styles.roleText}>👩‍🎓 학생</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.roleButton} onPress={() => loginAs('teacher')}>
          <Text style={styles.roleText}>👨‍🏫 선생님</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPwModal} transparent animationType="fade">
        <View style={styles.modalWrapper}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>관리자 비밀번호 입력</Text>
            <TextInput
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            <TouchableOpacity style={styles.confirmButton} onPress={confirmPassword}>
              <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPwModal(false)}>
              <Text style={{ color: '#888', marginTop: 10 }}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
    marginTop: 30,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#4da688',
    padding: 14,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  roleText: {
    color: '#fff',
    fontSize: 16,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%',
    borderRadius: 8,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#4da688',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  confirmText: { color: '#fff' },
  dropdownWrapper: {
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 40,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    width: 250,
    textAlign: 'center',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    width: 250,
    textAlign: 'center',
  },
};