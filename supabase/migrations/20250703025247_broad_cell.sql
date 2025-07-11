/*
  # Restructure Lists to Projects with Workstreams hierarchy

  1. Schema Changes
    - Rename `lists` table to `projects`
    - Add `project_id` foreign key to `workstreams` table
    - Update `tasks` table to reference workstreams instead of lists directly
    - Add `workstream_id` column to `tasks` table

  2. Data Migration
    - Migrate existing lists to projects
    - Create default workstreams for existing projects
    - Update task references

  3. Security
    - Update RLS policies for new structure
    - Maintain user isolation

  4. Relationships
    - Projects -> Workstreams (one-to-many)
    - Workstreams -> Tasks (one-to-many)
    - Projects -> Tasks (through workstreams)
*/

-- First, create the new projects table (renamed from lists)
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Add project_id to workstreams table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workstreams' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE workstreams ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add workstream_id to tasks table (optional, for direct workstream association)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'workstream_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN workstream_id uuid REFERENCES workstreams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Migrate existing lists to projects
INSERT INTO projects (id, title, description, color, created_at, updated_at, user_id)
SELECT id, title, description, color, created_at, updated_at, user_id
FROM lists
ON CONFLICT (id) DO NOTHING;

-- Create default workstreams for existing projects
INSERT INTO workstreams (title, project_id, user_id, position)
SELECT 
  CONCAT(p.title, ' - Main Workstream') as title,
  p.id as project_id,
  p.user_id,
  0 as position
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM workstreams w WHERE w.project_id = p.id
);

-- Update tasks to reference the new workstreams
UPDATE tasks 
SET workstream_id = (
  SELECT w.id 
  FROM workstreams w 
  WHERE w.project_id = tasks.list_id 
  LIMIT 1
)
WHERE workstream_id IS NULL AND list_id IS NOT NULL;

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update workstreams policies to include project relationship
DROP POLICY IF EXISTS "Users can view their own workstreams" ON workstreams;
DROP POLICY IF EXISTS "Users can create their own workstreams" ON workstreams;
DROP POLICY IF EXISTS "Users can update their own workstreams" ON workstreams;
DROP POLICY IF EXISTS "Users can delete their own workstreams" ON workstreams;

CREATE POLICY "Users can view their own workstreams"
  ON workstreams
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects WHERE projects.id = workstreams.project_id AND projects.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create their own workstreams"
  ON workstreams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects WHERE projects.id = workstreams.project_id AND projects.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can update their own workstreams"
  ON workstreams
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects WHERE projects.id = workstreams.project_id AND projects.user_id = auth.uid()
    ))
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects WHERE projects.id = workstreams.project_id AND projects.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can delete their own workstreams"
  ON workstreams
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects WHERE projects.id = workstreams.project_id AND projects.user_id = auth.uid()
    ))
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS workstreams_project_id_idx ON workstreams(project_id);
CREATE INDEX IF NOT EXISTS tasks_workstream_id_idx ON tasks(workstream_id);

-- Create triggers for projects table
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for workstreams -> projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workstreams_project_id_fkey'
  ) THEN
    ALTER TABLE workstreams 
    ADD CONSTRAINT workstreams_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for tasks -> workstreams
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_workstream_id_fkey'
  ) THEN
    ALTER TABLE tasks 
    ADD CONSTRAINT tasks_workstream_id_fkey 
    FOREIGN KEY (workstream_id) REFERENCES workstreams(id) ON DELETE SET NULL;
  END IF;
END $$;