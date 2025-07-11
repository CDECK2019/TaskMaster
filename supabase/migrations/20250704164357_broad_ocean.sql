/*
  # Add starred field to tasks

  1. Changes
    - Add `starred` column to `tasks` table with default value false
    - Add `starred` column to `workstream_tasks` table with default value false
    - Add index for better performance when filtering starred tasks

  2. Security
    - No changes to RLS policies needed
*/

-- Add starred column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'starred'
  ) THEN
    ALTER TABLE tasks ADD COLUMN starred boolean DEFAULT false;
  END IF;
END $$;

-- Add starred column to workstream_tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workstream_tasks' AND column_name = 'starred'
  ) THEN
    ALTER TABLE workstream_tasks ADD COLUMN starred boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_starred_idx ON tasks(starred);
CREATE INDEX IF NOT EXISTS workstream_tasks_starred_idx ON workstream_tasks(starred);