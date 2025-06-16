import React, { useState, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const [eccentricValue, setEccentricValue] = useState('');
  const [concentricValue, setConcentricValue] = useState('');
  const [repsValue, setRepsValue] = useState('');
  const router = useRouter();

  // 모든 필드가 채워졌을 때 자동 이동
  useEffect(() => {
    if (eccentricValue && concentricValue && repsValue) router.push('/set');
  }, [eccentricValue, concentricValue, repsValue]);

  return (
    <View className="flex-col justify-center items-center p-5 bg-white">
      <View className="flex-col justify-center items-center mb-4 space-y-3">
        <Text>신장성 수축(초): </Text>
        <TextInput
          className="border border-gray-400 rounded w-20 h-9 px-2"
          keyboardType="numeric"
          value={eccentricValue}
          onChangeText={setEccentricValue}
        />

        <Text>단축성 수축(초): </Text>
        <TextInput
          className="border border-gray-400 rounded w-20 h-9 px-2"
          keyboardType="numeric"
          value={concentricValue}
          onChangeText={setConcentricValue}
        />

        <Text>RepsValue: </Text>
        <TextInput
          className="border border-gray-400 rounded w-20 h-9 px-2"
          keyboardType="numeric"
          value={repsValue}
          onChangeText={setRepsValue}
        />
      </View>
    </View>
  );
}
