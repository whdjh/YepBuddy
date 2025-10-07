-- SEED: 나우푸드 베타알라닌 (단백질 함량 없음)
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
  '나우푸드 베타알라닌',
  1000,
  'https://lvjrfmwsdnfkvawnzqst.supabase.co/storage/v1/object/public/protein/nowfoods_beta_alanine.png',
  'beta-alanine',
  '무맛',
  '낮 시간대에 약간 더 저렴한 경향이 있음',
  NULL,
  NULL,
  1,
  '2025-04-11'
);

-- 나우푸드 베타알라닌 가격 히스토리 데이터
INSERT INTO protein_prices_daily (protein_id, observed_date, price)
VALUES
(35, '2025-04-11', 39990),
(35, '2025-05-11', 36890),
(35, '2025-06-11', 36950),
(35, '2025-07-11', 38190),
(35, '2025-08-11', 38480),
(35, '2025-09-11', 38480);
