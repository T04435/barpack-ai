// create a supabase service class that can be used in any route
// Path: apps/web/src/services/supabaseService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import { nanoid } from 'nanoid';
import { slugIt } from '../utils/stringFormat';

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  }

  async uploadImage(folder: string, image: string, storageBucket = 'cocktails') {
    try {

      const id = nanoid(10);
      const { data, error } = await this.supabase
          .storage
          .from(storageBucket)
          .upload(`${slugIt(folder)}/${id}.webp`, decode(image), {
            contentType: 'image/webp',
          });

      if (error) {
        throw error;
      }

      if (data) {
        return data.path;
      }
    } catch (error) {
      console.error(error);
    }
  }
}
