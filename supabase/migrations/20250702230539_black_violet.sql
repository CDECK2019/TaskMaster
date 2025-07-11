/*
  # Add position column to workstreams table

  1. Changes
    - Add `position` column to `workstreams` table with default value 0
    - Update existing workstreams to have sequential positions
    - Add index for better performance when ordering

  2. Security
    - No changes to RLS policies needed
*/

-- Add position column to workstreams table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workstreams' AND column_name = 'position'
  ) THEN
    ALTER TABLE workstreams ADD COLUMN position integer DEFAULT 0;
  END IF;
END $$;

-- Update existing workstreams to have sequential positions
UPDATE workstreams 
SET position = subquery.row_number - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_number
  FROM workstreams
) AS subquery
WHERE workstreams.id = subquery.id;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS workstreams_position_idx ON workstreams(position);