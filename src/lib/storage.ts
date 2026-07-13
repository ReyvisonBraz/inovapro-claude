import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const STORAGE_BUCKET = 'service-order-photos';

export const isStorageConfigured = () => Boolean(supabaseUrl && supabaseServiceKey);

let _client: ReturnType<typeof createClient> | null = null;

const getClient = () => {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _client;
};

export async function uploadPhotoToStorage(
  base64DataUrl: string,
  osId: number,
  index: number
): Promise<string> {
  if (base64DataUrl.startsWith('http')) return base64DataUrl;
  const supabase = getClient();

  const matches = base64DataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) throw new Error('Formato de imagem inválido');

  const mimeType = matches[1] ?? 'image/jpeg';
  const base64Data = matches[2] ?? '';
  const ext = mimeType.split('/')[1] || 'jpg';
  const buffer = Buffer.from(base64Data, 'base64');
  const filePath = `os-${osId}/${index}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Erro no upload: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deletePhotoFromStorage(publicUrl: string): Promise<void> {
  const supabase = getClient();
  const urlObj = new URL(publicUrl);
  const pathParts = urlObj.pathname.split(`/${STORAGE_BUCKET}/`);
  if (pathParts.length < 2) return;

  const filePath = pathParts[1];
  if (filePath) await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
}
