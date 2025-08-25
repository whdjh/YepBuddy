export interface CardData {
  id: number;
  author: string;
  location: string;
  tags: string[];
  thumbnail?: string;
}

// TODO: API 교체 예정 - 현재는 목데이터로 개발
export const MOCK_CARDS: CardData[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  author: `트레이너${index + 1}`,
  location: ['nongym', 'gym', 'home', 'outdoor'][index % 4],
  tags: [
    ['등신', '다이어트신', '벌크업신', '무산소', '유산소'],
    ['요가', '필라테스', '스트레칭', '재활운동'],
    ['크로스핏', '기능성운동', '체력증진'],
    ['복싱', '킥복싱', '무에타이', '격투기'],
    ['수영', '러닝', '자전거', '등산'],
    ['댄스', '줌바', '에어로빅'],
    ['웨이트', '파워리프팅', '바디빌딩'],
    ['보디빌딩', '피트니스', '헬스'],
    ['테니스', '골프', '축구', '농구'],
    ['마라톤', '트라이애슬론', '철인3종'],
  ][index % 10],
  thumbnail: "ic_logo.svg",
}));