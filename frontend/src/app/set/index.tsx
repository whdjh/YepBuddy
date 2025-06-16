import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function Index() {
  return (
    <View className="flex-col justify-center items-center p-5 bg-white">
      <View className="flex-col justify-center items-center mb-4">
        <Text>세트수: </Text>
        <TextInput
          className="border border-gray-400 rounded w-16 h-9 px-2 ml-3"
          keyboardType="numeric"
        />

        <Text>휴식시간(초): </Text>
        <TextInput
          className="border border-gray-400 rounded w-16 h-9 px-2 ml-3"
          keyboardType="numeric"
        />
      </View>
    </View>
  );
}
