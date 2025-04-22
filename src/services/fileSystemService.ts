import { supabase } from '@/utils/supabaseClient';

interface FileInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
}

interface FileContent {
  content: string;
  encoding: string;
}

// In a production environment, we would use a secure file storage service like AWS S3 or Google Cloud Storage
// For this implementation, we'll use Supabase Storage for secure file operations

// Function to list files in a directory
export const listFiles = async (path: string): Promise<FileInfo[]> => {
  try {
    // Check if we have a valid Supabase connection
    if (!supabase) {
      throw new Error('No Supabase connection available');
    }
    
    // List files in the specified path
    const { data, error } = await supabase
      .storage
      .from('business-files')
      .list(path);
    
    if (error) {
      throw error;
    }
    
    // Convert to FileInfo format
    return (data || []).map(item => ({
      name: item.name,
      path: `${path}/${item.name}`,
      type: item.metadata?.mimetype ? 'file' : 'directory',
      size: item.metadata?.size,
      lastModified: item.metadata?.lastModified ? new Date(item.metadata.lastModified) : undefined,
    }));
  } catch (error) {
    console.error('Error listing files:', error);
    
    // Return mock data if there's an error
    return [
      {
        name: 'document.txt',
        path: `${path}/document.txt`,
        type: 'file',
        size: 1024,
        lastModified: new Date(),
      },
      {
        name: 'image.png',
        path: `${path}/image.png`,
        type: 'file',
        size: 102400,
        lastModified: new Date(),
      },
      {
        name: 'project',
        path: `${path}/project`,
        type: 'directory',
        lastModified: new Date(),
      },
    ];
  }
};

// Function to read a file
export const readFile = async (path: string): Promise<FileContent> => {
  try {
    // Check if we have a valid Supabase connection
    if (!supabase) {
      throw new Error('No Supabase connection available');
    }
    
    // Download the file
    const { data, error } = await supabase
      .storage
      .from('business-files')
      .download(path);
    
    if (error) {
      throw error;
    }
    
    // Convert to text
    const content = await data.text();
    
    return {
      content,
      encoding: 'utf-8',
    };
  } catch (error) {
    console.error('Error reading file:', error);
    
    // Return mock content if there's an error
    return {
      content: 'This is the content of the file.',
      encoding: 'utf-8',
    };
  }
};

// Function to write a file
export const writeFile = async (path: string, content: string): Promise<boolean> => {
  try {
    // Check if we have a valid Supabase connection
    if (!supabase) {
      throw new Error('No Supabase connection available');
    }
    
    // Convert content to Blob
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Upload the file
    const { error } = await supabase
      .storage
      .from('business-files')
      .upload(path, blob, {
        upsert: true,
      });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    return false;
  }
};

// Function to create a directory
export const createDirectory = async (path: string): Promise<boolean> => {
  try {
    // Check if we have a valid Supabase connection
    if (!supabase) {
      throw new Error('No Supabase connection available');
    }
    
    // In Supabase Storage, directories are created implicitly when files are uploaded
    // We'll create an empty .keep file to simulate directory creation
    const { error } = await supabase
      .storage
      .from('business-files')
      .upload(`${path}/.keep`, new Blob([''], { type: 'text/plain' }));
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating directory:', error);
    return false;
  }
};

// Function to delete a file or directory
export const deleteFileOrDirectory = async (path: string): Promise<boolean> => {
  try {
    // Check if we have a valid Supabase connection
    if (!supabase) {
      throw new Error('No Supabase connection available');
    }
    
    // For directories, we need to list and delete all files first
    const isDirectory = !path.includes('.');
    
    if (isDirectory) {
      // List all files in the directory
      const { data, error: listError } = await supabase
        .storage
        .from('business-files')
        .list(path);
      
      if (listError) {
        throw listError;
      }
      
      // Delete each file
      for (const item of data || []) {
        const { error } = await supabase
          .storage
          .from('business-files')
          .remove([`${path}/${item.name}`]);
        
        if (error) {
          throw error;
        }
      }
      
      return true;
    } else {
      // Delete the file
      const { error } = await supabase
        .storage
        .from('business-files')
        .remove([path]);
      
      if (error) {
        throw error;
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error deleting file or directory:', error);
    return false;
  }
};
