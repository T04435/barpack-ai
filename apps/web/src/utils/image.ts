import { getPlaiceholder } from 'plaiceholder';
import supabaseLoader from '../../supabase-image-loader';


export const getBlurDataURL = async (images: string[], width = 1920) => {
  const blurDataUrls = await Promise.all(
      images.map(async (url) => {
        const { base64 } = await getPlaiceholder(supabaseLoader({src: url, width}));
        return base64;
      })
  );

  return blurDataUrls;
}
