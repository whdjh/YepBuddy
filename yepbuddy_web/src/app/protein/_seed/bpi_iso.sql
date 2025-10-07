-- SEED: BPI ISOHD 아이솔레이트
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
  'BPI ISOHD 아이솔레이트',
  2268,
  'https://lvjrfmwsdnfkvawnzqst.supabase.co/storage/v1/object/public/protein/bpi_iso_hd.png',
  'wpi',
  '초콜릿 브라우니',
  '',
  32,
  25,
  1,
  '2024-07-17'
);

-- BPI ISOHD 아이솔레이트 가격 히스토리 데이터
INSERT INTO protein_prices_daily (protein_id, observed_date, price)
VALUES
(28, '2024-07-17', 63140),
(28, '2024-07-25', 61460),
(28, '2024-08-15', 63620),
(28, '2024-09-09', 62780),
(28, '2024-09-20', 60550),
(28, '2024-10-10', 71090),
(28, '2024-11-11', 60180),
(28, '2024-11-29', 62930),
(28, '2024-12-12', 75160),
(28, '2025-01-01', 66640),
(28, '2025-01-10', 78310),
(28, '2025-02-02', 64070),
(28, '2025-02-14', 83430),
(28, '2025-03-03', 77910),
(28, '2025-03-20', 82380),
(28, '2025-05-05', 78190),
(28, '2025-06-06', 78190),
(28, '2025-06-19', 78870),
(28, '2025-07-07', 78750),
(28, '2025-08-08', 80970),
(28, '2025-09-17', 67000);
