export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          color: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          color: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      lists: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          color: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          color: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          completed: boolean;
          priority: 'low' | 'medium' | 'high';
          due_date: string | null;
          created_at: string;
          updated_at: string;
          list_id: string;
          workstream_id: string | null;
          assignee: string | null;
          tags: string[] | null;
          user_id: string;
          starred: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          priority: 'low' | 'medium' | 'high';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          list_id: string;
          workstream_id?: string | null;
          assignee?: string | null;
          tags?: string[] | null;
          user_id: string;
          starred?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          list_id?: string;
          workstream_id?: string | null;
          assignee?: string | null;
          tags?: string[] | null;
          user_id?: string;
          starred?: boolean;
        };
      };
      workstreams: {
        Row: {
          id: string;
          title: string;
          project_id: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
          position: number;
        };
        Insert: {
          id?: string;
          title: string;
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          position?: number;
        };
        Update: {
          id?: string;
          title?: string;
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          position?: number;
        };
      };
      workstream_columns: {
        Row: {
          id: string;
          title: string;
          color: string;
          position: number;
          workstream_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          color: string;
          position: number;
          workstream_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          color?: string;
          position?: number;
          workstream_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workstream_tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high';
          due_date: string | null;
          tags: string[] | null;
          column_id: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          priority: 'low' | 'medium' | 'high';
          due_date?: string | null;
          tags?: string[] | null;
          column_id: string;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          tags?: string[] | null;
          column_id?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}