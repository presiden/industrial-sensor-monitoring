
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE sensor (
  id BIGSERIAL PRIMARY KEY,
  sensor_code VARCHAR(50) UNIQUE NOT NULL,
  sensor_type VARCHAR(50) NOT NULL,
  unit VARCHAR(10) NOT NULL,
  status SMALLINT DEFAULT 1,
  location VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sensor_spec (
  sensor_id BIGINT PRIMARY KEY REFERENCES sensor(id) ON DELETE CASCADE,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  min_value DOUBLE PRECISION,
  max_value DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  resolution DOUBLE PRECISION,
  installation_date DATE,
  calibration_date DATE,
  calibration_due DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sensor_measurement (
  time TIMESTAMPTZ NOT NULL,
  sensor_id BIGINT NOT NULL REFERENCES sensor(id),
  value DOUBLE PRECISION NOT NULL,
  quality SMALLINT DEFAULT 100,
  status SMALLINT DEFAULT 0,
  PRIMARY KEY (sensor_id, time)
);

SELECT create_hypertable('sensor_measurement','time',if_not_exists=>TRUE);

ALTER TABLE sensor_measurement SET (
  timescaledb.compress,
  timescaledb.compress_segmentby='sensor_id'
);

SELECT add_compression_policy('sensor_measurement', INTERVAL '7 days');
SELECT add_retention_policy('sensor_measurement', INTERVAL '90 days');

-- Insert test data
INSERT INTO sensor (sensor_code, sensor_type, unit, location, status) VALUES
  ('TEMP-001', 'Temperature', '°C', 'Production Floor A', 1),
  ('HUM-001', 'Humidity', '%', 'Production Floor A', 1),
  ('PRESSURE-001', 'Water Pressure', 'bar', 'Water Tank', 1);

INSERT INTO sensor_spec (sensor_id, manufacturer, model, serial_number, min_value, max_value, accuracy, resolution, installation_date, calibration_date, calibration_due) 
SELECT id, 'Siemens', 'QAC31', 'SN-TEMP-00123', -20, 100, 0.5, 0.1, '2024-01-15'::DATE, '2025-01-10'::DATE, '2026-01-10'::DATE FROM sensor WHERE sensor_code = 'TEMP-001';

INSERT INTO sensor_spec (sensor_id, manufacturer, model, serial_number, min_value, max_value, accuracy, resolution, installation_date, calibration_date, calibration_due) 
SELECT id, 'Vaisala', 'GMP222', 'SN-HUM-00456', 0, 100, 2, 0.1, '2024-01-15'::DATE, '2025-02-01'::DATE, '2026-02-01'::DATE FROM sensor WHERE sensor_code = 'HUM-001';

INSERT INTO sensor_spec (sensor_id, manufacturer, model, serial_number, min_value, max_value, accuracy, resolution, installation_date, calibration_date, calibration_due) 
SELECT id, 'Hydac', 'EDS3346', 'SN-PRESS-00789', 0, 25, 0.5, 0.01, '2024-02-01'::DATE, '2025-02-15'::DATE, '2026-02-15'::DATE FROM sensor WHERE sensor_code = 'PRESSURE-001';

-- Generate sample measurement data for the last 7 days
WITH date_series AS (
  SELECT generate_series(now() - INTERVAL '7 days', now(), INTERVAL '5 minutes') as ts
),
sensor_data AS (
  SELECT 
    ts, 
    (SELECT id FROM sensor WHERE sensor_code = 'TEMP-001') as sid,
    (25 + (random() * 10 - 5))::float as value
  FROM date_series
  UNION ALL
  SELECT 
    ts, 
    (SELECT id FROM sensor WHERE sensor_code = 'HUM-001') as sid,
    (55 + (random() * 30 - 15))::float as value
  FROM date_series
  UNION ALL
  SELECT 
    ts, 
    (SELECT id FROM sensor WHERE sensor_code = 'PRESSURE-001') as sid,
    (8 + (random() * 4 - 2))::float as value
  FROM date_series
)
INSERT INTO sensor_measurement (time, sensor_id, value, quality, status)
SELECT ts, sid, value, 100, 0 FROM sensor_data WHERE sid IS NOT NULL;
