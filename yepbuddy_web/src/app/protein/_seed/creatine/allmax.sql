-- SEED: Allmax 크레아틴 (단백질 함량 없음)
INSERT INTO proteins (
  title,
  weight,
  avatar_file,
  topic,
  taste,
  description,
  scoop,
  protein_per_scoop,
  base_pack_count,
  base_date
)
VALUES (
  'Allmax 크레아틴',
  1000,
  'https://lvjrfmwsdnfkvawnzqst.supabase.co/storage/v1/object/public/protein/allmax_creatine.png',
  'creatine',
  '무맛',
  '아침 시간대 구매가 저렴한 경향이 있음',
  NULL,
  NULL,
  1,
  '2025-04-11'
);

-- Allmax 크레아틴 가격 히스토리 데이터
INSERT INTO protein_prices_daily (protein_id, observed_date, price)
VALUES
(34, '2025-04-11', 46390),
(34, '2025-05-11', 43730),
(34, '2025-06-11', 41830),
(34, '2025-07-11', 43490),
(34, '2025-08-11', 42930),
(34, '2025-09-11', 39000);
