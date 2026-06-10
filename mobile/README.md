# YepBuddy Mobile

YepBuddy의 Expo/React Native 모바일 앱입니다.

운동일지, 운동 템포, 프로틴 가격 확인을 제공하고, 사용자가 직접 켠 설정에 한해서만 알림과 백그라운드 위치 권한을 요청합니다.

## 실행

레포지토리 루트에서 실행합니다.

```bash
bun run mobile
bun run mobile:ios
bun run mobile:android
```

`mobile` 디렉터리에서 직접 실행할 수도 있습니다.

```bash
bun install
bun run start
bun run ios
bun run android
```

## 환경변수

로컬 환경변수는 루트의 `.env.local`과, 필요한 경우 `mobile/.env.local`에서 읽습니다. 루트 스크립트는 두 파일을 함께 로드하고, Expo 설정은 [app.config.js](app.config.js)에서 공개 환경변수를 앱 extra 값으로 전달합니다.

`.env`, `.env.local` 같은 로컬 설정 파일과 인증 정보는 커밋하지 않습니다.

App Store 제출용 production 빌드에는 다음 공개 환경변수가 필요합니다.

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_PRIVACY_POLICY_URL
EXPO_PUBLIC_SUPPORT_URL
```

## 자주 쓰는 명령어

### simulator 실행
```bash
bunx expo run:ios --device "iPhone 14 Plus"
```

### build 명령어
#### Eas 빌드(iOS)
```bash
npx --yes eas-cli@latest build --platform ios --profile production --local --output /private/tmp/my-app.ipa  

npx --yes eas-cli@latest submit --platform ios --path /private/tmp/my-app.ipa  
```

#### Eas 클라우드빌드(android)
```bash
pnpm dlx eas-cli@latest build --platform android --profile production
```

#### Eas 빌드 우회(IOS)
```bash
printf "App-specific password: "
  read -rs ASC_PASSWORD
  printf "\n"

  xcrun altool --upload-package /private/tmp/my-app.ipa \
    --platform ios \
    -u "실제email작성" \
    -p "$ASC_PASSWORD" \
    --show-progress \
    --output-format json

  unset ASC_PASSWORD
```