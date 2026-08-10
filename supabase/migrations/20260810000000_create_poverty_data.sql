-- Create poverty_data table for NTB-PIS
-- This table stores aggregated poverty data at desa/village level

CREATE TABLE IF NOT EXISTS public.poverty_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER CHECK (month >= 1 AND month <= 12),
  desa_name VARCHAR(255) NOT NULL,
  kabupaten_name VARCHAR(255) NOT NULL,
  total_population INTEGER DEFAULT 0,
  total_poor INTEGER DEFAULT 0,
  percentage DECIMAL(5, 2) DEFAULT 0,
  poverty_line DECIMAL(10, 2) DEFAULT 0,
  data_source VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_poverty_data_year ON public.poverty_data(year);
CREATE INDEX IF NOT EXISTS idx_poverty_data_month ON public.poverty_data(month);
CREATE INDEX IF NOT EXISTS idx_poverty_data_desa ON public.poverty_data(desa_name);
CREATE INDEX IF NOT EXISTS idx_poverty_data_kabupaten ON public.poverty_data(kabupaten_name);
CREATE INDEX IF NOT EXISTS idx_poverty_data_year_month ON public.poverty_data(year, month);
CREATE INDEX IF NOT EXISTS idx_poverty_data_percentage ON public.poverty_data(percentage);

-- Enable Row Level Security
ALTER TABLE public.poverty_data ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read poverty data (public aggregate data)
CREATE POLICY "poverty_data_select_policy" ON public.poverty_data
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert poverty data
CREATE POLICY "poverty_data_insert_policy" ON public.poverty_data
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only users who created the record can update it
CREATE POLICY "poverty_data_update_policy" ON public.poverty_data
  FOR UPDATE
  USING (auth.uid() = created_by OR auth.role() = 'admin')
  WITH CHECK (auth.uid() = created_by OR auth.role() = 'admin');

-- Policy: Only users who created the record or admins can delete it
CREATE POLICY "poverty_data_delete_policy" ON public.poverty_data
  FOR DELETE
  USING (auth.uid() = created_by OR auth.role() = 'admin');

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_poverty_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER poverty_data_updated_at_trigger
BEFORE UPDATE ON public.poverty_data
FOR EACH ROW
EXECUTE FUNCTION public.update_poverty_data_updated_at();

-- Create trigger to set updated_by to current user
CREATE OR REPLACE FUNCTION public.set_poverty_data_updated_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER poverty_data_updated_by_trigger
BEFORE UPDATE ON public.poverty_data
FOR EACH ROW
EXECUTE FUNCTION public.set_poverty_data_updated_by();

-- Create trigger to set created_by on insert
CREATE OR REPLACE FUNCTION public.set_poverty_data_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER poverty_data_created_by_trigger
BEFORE INSERT ON public.poverty_data
FOR EACH ROW
EXECUTE FUNCTION public.set_poverty_data_created_by();

-- Grant permissions
GRANT SELECT ON public.poverty_data TO anon;
GRANT SELECT ON public.poverty_data TO authenticated;
GRANT ALL ON public.poverty_data TO authenticated;
