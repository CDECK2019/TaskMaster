/*
  # Create workstreams tables for Kanban board functionality

  1. New Tables
    - `workstreams`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)
    
    - `workstream_columns`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `color` (text, required)
      - `position` (integer, required)
      - `workstream_id` (uuid, foreign key to workstreams)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `workstream_tasks`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `priority` (enum: low, medium, high)
      - `due_date` (date, optional)
      - `tags` (text array, optional)
      - `column_id` (uuid, foreign key to workstream_columns)
      - `position` (integer, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Relationships
    - Foreign key constraints between tables
    - Cascade deletes for proper cleanup
*/

-- Create workstreams table
CREATE TABLE IF NOT EXISTS workstreams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create workstream_columns table
CREATE TABLE IF NOT EXISTS workstream_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  position integer NOT NULL,
  workstream_id uuid REFERENCES workstreams(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workstream_tasks table
CREATE TABLE IF NOT EXISTS workstream_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  priority priority_level DEFAULT 'medium',
  due_date date,
  tags text[],
  column_id uuid REFERENCES workstream_columns(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE workstreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE workstream_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE workstream_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for workstreams table
CREATE POLICY "Users can view their own workstreams"
  ON workstreams
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workstreams"
  ON workstreams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workstreams"
  ON workstreams
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workstreams"
  ON workstreams
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for workstream_columns table
CREATE POLICY "Users can view columns in their workstreams"
  ON workstream_columns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workstreams 
      WHERE workstreams.id = workstream_columns.workstream_id 
      AND workstreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create columns in their workstreams"
  ON workstream_columns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workstreams 
      WHERE workstreams.id = workstream_columns.workstream_id 
      AND workstreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update columns in their workstreams"
  ON workstream_columns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workstreams 
      WHERE workstreams.id = workstream_columns.workstream_id 
      AND workstreams.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workstreams 
      WHERE workstreams.id = workstream_columns.workstream_id 
      AND workstreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete columns in their workstreams"
  ON workstream_columns
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workstreams 
      WHERE workstreams.id = workstream_columns.workstream_id 
      AND workstreams.user_id = auth.uid()
    )
  );

-- Create policies for workstream_tasks table
CREATE POLICY "Users can view tasks in their workstream columns"
  ON workstream_tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workstream_columns 
      JOIN workstreams ON workstreams.id = workstream_columns.workstream_id
      WHERE workstream_columns.id = workstream_tasks.column_id 
      AND workstreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their workstream columns"
  ON workstream_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workstream_columns 
      JOIN workstreams ON workstreams.id = workstream_columns.workstream_id
      WHERE workstream_columns.id = workstream_tasks.column_id 
      AND workstreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their workstream columns"
  ON workstream_tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workstream_columns 
      JOIN workstreams ON workstreams.id = workstream_columns.workstream_id
      WHERE workstream_columns.id = workstream_tasks.column_id 
      AND workstreams.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workstream_columns 
      JOIN workstreams ON workstreams.id = workstream_columns.workstream_id
      WHERE workstream_columns.id = workstream_tasks.column_id 
      AND workstreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their workstream columns"
  ON workstream_tasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workstream_columns 
      JOIN workstreams ON workstreams.id = workstream_columns.workstream_id
      WHERE workstream_columns.id = workstream_tasks.column_id 
      AND workstreams.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS workstreams_user_id_idx ON workstreams(user_id);
CREATE INDEX IF NOT EXISTS workstreams_created_at_idx ON workstreams(created_at DESC);
CREATE INDEX IF NOT EXISTS workstream_columns_workstream_id_idx ON workstream_columns(workstream_id);
CREATE INDEX IF NOT EXISTS workstream_columns_position_idx ON workstream_columns(position);
CREATE INDEX IF NOT EXISTS workstream_tasks_column_id_idx ON workstream_tasks(column_id);
CREATE INDEX IF NOT EXISTS workstream_tasks_position_idx ON workstream_tasks(position);
CREATE INDEX IF NOT EXISTS workstream_tasks_due_date_idx ON workstream_tasks(due_date);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_workstreams_updated_at
  BEFORE UPDATE ON workstreams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workstream_columns_updated_at
  BEFORE UPDATE ON workstream_columns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workstream_tasks_updated_at
  BEFORE UPDATE ON workstream_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();