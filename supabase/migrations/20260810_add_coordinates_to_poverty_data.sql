-- Add geolocation columns to poverty_data table for GIS mapping
ALTER TABLE poverty_data ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7);
ALTER TABLE poverty_data ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

-- Create index for geographic queries
CREATE INDEX IF NOT EXISTS idx_poverty_data_coordinates ON poverty_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_poverty_data_desa_geo ON poverty_data(desa_name, latitude, longitude);

-- Add comment for documentation
COMMENT ON COLUMN poverty_data.latitude IS 'Latitude coordinate of desa (WGS84)';
COMMENT ON COLUMN poverty_data.longitude IS 'Longitude coordinate of desa (WGS84)';
