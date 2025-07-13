import { z } from 'zod';

// Task validation schema
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title must be less than 120 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  listId: z.string().min(1, 'List is required'),
  assignee: z.string().max(100, 'Assignee name must be less than 100 characters').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
  starred: z.boolean().optional(),
  completed: z.boolean().optional()
});

// Project validation schema
export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  color: z.string().min(1, 'Color is required')
});

// List validation schema
export const listSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  color: z.string().min(1, 'Color is required')
});

// Workstream validation schema
export const workstreamSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  projectId: z.string().optional()
});

// Auth validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Validation helper function
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return {
      success: false,
      errors: ['Validation failed']
    };
  }
};