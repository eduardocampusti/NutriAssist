-- Add columns for Procurement Technical Specs
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS technical_specifications TEXT,
ADD COLUMN IF NOT EXISTS unit_weight DECIMAL(10,4) DEFAULT 1.0;

-- Comment on columns
COMMENT ON COLUMN inventory_items.technical_specifications IS 'Detailed description for Termo de Referência (Licitação)';
COMMENT ON COLUMN inventory_items.unit_weight IS 'Weight of one unit in KG (if unit is UN/PCT/DZ)';

-- Update RLS to allow read/write for these new columns (already covered by existing policies if they select *)
