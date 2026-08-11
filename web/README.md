# YepBuddy Landing Page

YepBuddy 서비스 랜딩페이지입니다.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- Three.js
- GSAP + ScrollTrigger

## 3D 렌더링

- CC BY 4.0 라이선스로 배포된 iPhone 15 Pro Max GLB 모델을 `GLTFLoader`와 `DRACOLoader`로 불러옵니다.
- 아이폰 본체는 GLB의 기존 재질을 사용하고, 디스플레이 메시에만 `MeshBasicMaterial`로 앱 화면 텍스처를 적용합니다.
- GSAP ScrollTrigger의 스크롤 진행률에 따라 화면 텍스처와 모델의 Y축 회전값을 변경합니다.
- 포인터에 반응하는 기울기는 `requestAnimationFrame`에서 현재값과 목표값을 보간해 부드럽게 표현합니다.
- 3D 리소스는 섹션 진입 시 동적으로 불러오며, 모바일과 모션 감소 환경에서는 2D 이미지로 대체합니다.

사용 모델: *Apple iPhone 15 Pro Max Black* by Polyman_3D ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).

## 실행

```bash
pnpm dev
```
