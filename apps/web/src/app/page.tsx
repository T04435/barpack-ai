import { PrismaClient } from '@prisma/client';
import { Cocktail } from 'model';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { getBlurDataURL } from '../utils/image';


export default async function Home() {

  // get cocktails from prisma
  const prisma = new PrismaClient();
  const cocktails = await prisma.cocktail.findMany({
    select: {
      name: true,
      slug: true,
      images: true,
    },
  });


  return (
      <main>
        {/* display all cocktails and their images*/}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}>
          {cocktails.map((cocktail) => <CocktailCard {...cocktail} key={cocktail.slug} />)}
        </div>
      </main>
  );


  function CocktailCard({ name, slug, images }: Pick<Cocktail, 'name' | 'slug' | 'images'>) {

    return (<Link href={`/cocktail/${slug}`}>
      <Image src={`${images[0]}`} alt={`image for ${name}`} width={300} height={300} placeholder={'empty'}/>
      <h3 style={{
        fontWeight: '700',
      }}>{name}</h3>
    </Link>);
  };
}
