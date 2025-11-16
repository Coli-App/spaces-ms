import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

let supabaseClient: any = null;
let supabaseAdminClient: any = null;

export const createSupabaseClient = (
  configService: ConfigService,
  accessToken?: string,
) => {
  const supabaseUrl = configService.get<string>('supabase.url')!;
  const supabaseKey = configService.get<string>('supabase.key')!;

  if (accessToken) {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
};

export const createSupabaseAdminClient = (configService: ConfigService) => {
  const supabaseUrl = configService.get<string>('supabase.url')!;
  const supabaseServiceKey = configService.get<string>('supabase.serviceKey')!;

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdminClient;
};