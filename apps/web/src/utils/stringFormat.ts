import slugify from 'slugify';

export const slugIt = (str: string) => {
  return slugify(str, {
    lower: true,
    strict: true,
    trim: true,
    locale: 'en',
  });

}
