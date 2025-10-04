-- ==============
-- USERS (필수)
-- ==============
INSERT INTO auth.users (id)
VALUES
('5c67f445-2a5c-458d-8bc0-0e2761cccd65')
ON CONFLICT DO NOTHING;

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (name, description)
VALUES
('근력 강화', '근력 중심의 프로그램'),
('다이어트', '체중 감량용 프로그램'),
('재활 트레이닝', '부상 후 회복을 위한 프로그램'),
('체형 교정', '바른 자세 교정'),
('유산소', '지구력 향상용 트레이닝');

-- =========================
-- TRAINERS
-- =========================
INSERT INTO trainers (avatar_file, name, location, program, proceed, schedule, intro, description, stats, profile_id, category_id)
VALUES
('/avatars/tr1.png', '홍길동', '서울 강남구', '1:1 PT', '센터 방문', '월~금', '열정적인 트레이너', '10년 경력', '{"views":10,"reviews":2}', '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 1),
('/avatars/tr2.png', '김철수', '서울 서초구', '그룹 PT(2-3인)', '센터 방문', '화~토', '친절한 트레이너', '체형 교정 전문', '{"views":15,"reviews":4}', '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 2),
('/avatars/tr3.png', '이영희', '서울 송파구', '1:1 PT', '방문 PT', '월수금', '정확한 자세 교정', '운동 과학 기반 지도', '{"views":7,"reviews":1}', '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 3),
('/avatars/tr4.png', '박민수', '서울 마포구', '그룹 PT(2-3인)', '센터 방문', '화목토', '재활 전문가', '물리치료학 전공', '{"views":9,"reviews":3}', '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 4),
('/avatars/tr5.png', '정다은', '서울 강동구', '1:1 PT', '센터 방문', '월~토', '다이어트 코치', '식단 관리 포함', '{"views":20,"reviews":5}', '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 5);

-- =========================
-- GYMS
-- =========================
INSERT INTO gyms (title, location, views)
VALUES
('엔오엔짐', '경기 용인시 기흥구 석성로 257 1층', 341),
('크로스핏 터틀', '경기 용인시 기흥구 구성로 176 삼광빌딩 B1', 34),
('리가휘트니스', '경기 용인시 기흥구 언남동 259-7', 31),
('재일짐', '경기 용인시 기흥구 구성로 102 푸른종합상가 2층 210호', 314),
('빌리프짐', '경기 용인시 기흥구 구성로 103 상록멀티프라자 B1', 114),
('하이클래스짐', '경기 용인시 기흥구 구성로 80 6층 7층', 121),
('카인드짐', '경기 용인시 기흥구 죽전로 20 죽전누리에뜰 4층', 261),
('한경국립대 지역문화복합관', '경기 안성시 중앙로 327 1층', 443),
('스포데이 안성석정점', '경기 안성시 중앙로 274-36 라파엘빌딩 3층', 241);

-- =========================
-- PROTEINS
-- =========================
INSERT INTO proteins (title, weight, avatar_file, topic, taste, price, date)
VALUES
('마이프로틴 WPC', '5kg', '/proteins/choco.png', 'wpc', '', '67000', '2023-11-19'),
('마이프로틴 WPI', '2.5kg', '/proteins/vanilla.png', 'wpi', '', '68000', '2025-09-30'),
('컴뱃', '2.268kg', '/proteins/strawberry.png', 'wpcwpi', '초콜릿', '58000', '2024-03-10'),
('올맥스', '1kg', '/proteins/cookie.png', 'creatine', '무맛', '36000', '2024-03-10'),
('beta-alanine', '0.5kg', '/proteins/green.png', 'beta-alanine', '무맛', '36000', '2024-03-10');

-- =========================
-- REVIEWS
-- =========================
INSERT INTO reviews (trainer_id, profile_id, rating, review)
VALUES
(1, '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 5, '정말 친절하고 꼼꼼합니다.'),
(2, '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 4, '체형 교정에 도움 됐어요.'),
(3, '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 5, '전문적인 자세 교정!'),
(4, '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 3, '조금 빡셌지만 효과 좋아요.'),
(5, '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 5, '다이어트 성공했어요!');

-- =========================
-- BODY_PARTS
-- =========================
INSERT INTO body_parts (name)
VALUES
('가슴'),
('등'),
('어깨'),
('하체'),
('유산소');

-- =========================
-- DIARY_ENTRIES
-- =========================
INSERT INTO diary_entries (profile_id, date, sleep_level, condition_level, activity_level, comment)
VALUES
('5c67f445-2a5c-458d-8bc0-0e2761cccd65', '2025-10-01', 'mid', 'high', 'mid', '오늘은 상태 좋음'),
('5c67f445-2a5c-458d-8bc0-0e2761cccd65', '2025-09-30', 'high', 'high', 'mid', '컨디션 최고'),
('5c67f445-2a5c-458d-8bc0-0e2761cccd65', '2025-09-29', 'mid', 'mid', 'mid', '보통 하루'),
('5c67f445-2a5c-458d-8bc0-0e2761cccd65', '2025-09-28', 'low', 'mid', 'low', '피곤함'),
('5c67f445-2a5c-458d-8bc0-0e2761cccd65', '2025-09-27', 'mid', 'mid', 'mid', '꾸준히 운동 중');

-- =========================
-- DIARY_EXERCISES
-- =========================
INSERT INTO diary_exercises (diary_id, name)
VALUES
(1, '벤치프레스'),
(1, '렛풀다운'),
(2, '스쿼트'),
(3, '숄더프레스'),
(4, '플랭크');

-- =========================
-- DIARY_EXERCISE_SETS
-- =========================
INSERT INTO diary_exercise_sets (exercise_id, weight, reps)
VALUES
(1, '60kg', '10'),
(1, '65kg', '8'),
(2, '80kg', '10'),
(3, '20kg', '12'),
(4, '맨몸', '60');

-- =========================
-- DIARY_SELECTED_BODY_PARTS
-- =========================
INSERT INTO diary_selected_body_parts (diary_id, body_part_id)
VALUES
(1, 1);

-- =========================
-- GYMS_LIKES
-- =========================
INSERT INTO gyms_likes (gym_id, profile_id)
VALUES
(1, '5c67f445-2a5c-458d-8bc0-0e2761cccd65');

-- =========================
-- PROTEINS_LIKES
-- =========================
INSERT INTO proteins_likes (protein_id, profile_id)
VALUES
(1, '5c67f445-2a5c-458d-8bc0-0e2761cccd65');

-- =========================
-- TRAINER_UPVOTES
-- =========================
INSERT INTO trainer_upvotes (trainer_id, profile_id)
VALUES
(1, '5c67f445-2a5c-458d-8bc0-0e2761cccd65');

-- =========================
-- FOLLOWS
-- =========================
INSERT INTO follows (follower_id, following_id)
VALUES
('5c67f445-2a5c-458d-8bc0-0e2761cccd65', '5c67f445-2a5c-458d-8bc0-0e2761cccd65');

-- =========================
-- MESSAGE_ROOMS
-- =========================
INSERT INTO message_rooms DEFAULT VALUES;
INSERT INTO message_room_members (message_room_id, profile_id)
VALUES
(1, '5c67f445-2a5c-458d-8bc0-0e2761cccd65');

INSERT INTO messages (message_room_id, sender_id, content)
VALUES
(1, '5c67f445-2a5c-458d-8bc0-0e2761cccd65', '안녕하세요!');

-- =========================
-- NOTIFICATIONS
-- =========================
INSERT INTO notifications (source_id, trainer_id, target_id, type)
VALUES
('5c67f445-2a5c-458d-8bc0-0e2761cccd65', 1, '5c67f445-2a5c-458d-8bc0-0e2761cccd65', 'follow');
