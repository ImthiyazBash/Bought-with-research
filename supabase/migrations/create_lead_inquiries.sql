-- Create table for storing lead inquiries from the request information button
CREATE TABLE IF NOT EXISTS lead_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id INTEGER REFERENCES "Hamburg Targets"(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on company_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_lead_inquiries_company_id ON lead_inquiries(company_id);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_lead_inquiries_created_at ON lead_inquiries(created_at DESC);

-- Create index on email for potential duplicate checking
CREATE INDEX IF NOT EXISTS idx_lead_inquiries_email ON lead_inquiries(email);

-- Enable Row Level Security
ALTER TABLE lead_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public can submit inquiries)
CREATE POLICY "Anyone can submit lead inquiries" ON lead_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to read (for admin dashboard later)
CREATE POLICY "Authenticated users can view lead inquiries" ON lead_inquiries
  FOR SELECT
  USING (auth.role() = 'authenticated');
