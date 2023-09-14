const projectId = 'cinkxdjsznvhryahvosm'; // your supabase project id

export default function supabaseLoader({ src, width = 300, quality = 1, bucket = 'cocktails'}: { src: string, width?: number, quality?: number, bucket?: string }) {
  return `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${src}?width=${width}&quality=${quality}`;
}
