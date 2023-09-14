import { PrismaClient } from '@prisma/client';
import { Metadata } from 'next';
import Image from 'next/image';
import { getPlaiceholder } from 'plaiceholder';
import React from 'react';
import { Recipe } from 'schema-dts';
import supabaseLoader from '../../../../supabase-image-loader';
import { getBlurDataURL } from '../../../utils/image';

export async function generateStaticParams() {
  const prisma = new PrismaClient();
  const cocktails = await prisma.cocktail.findMany();

  return cocktails.map((cocktail) => ({
    params: {
      slug: cocktail.slug,
    },
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const prisma = new PrismaClient();
  const cocktail = await prisma.cocktail.findFirst({
    where: {
      slug: params.slug
    }
  });

  return {
    title: `Cocktails: ${cocktail?.name} | BarPack`
  }

}

const Cocktail = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  const prisma = new PrismaClient();
  const cocktail = await prisma.cocktail.findFirst({
    where: {
      slug,
    },
    include: {
      cocktailIngredients: {
        include: {
          ingredient: true,
        }
      },
    }
  });

  if (!cocktail) {
    return <div>no cocktail found</div>;
  }

  const { images, name, preparation, garnish, glass, cocktailIngredients } = cocktail;


  const jsonLd: Recipe = {
    '@id': `BarPackApp-${slug}`,
    '@type': 'Recipe',
    name,
    image: images.map(image => supabaseLoader({ src: image })),
    recipeIngredient: cocktailIngredients.map((cocktailIngredient) => {
      const { amount, ingredient } = cocktailIngredient;
      const { name, } = ingredient;
      return `${amount} ${name}`;
    }),
    recipeInstructions: [preparation],

    prepTime: "PT1M",
    cookTime: "PT2M",
    totalTime: "PT3M",
    recipeYield: "1 serving",
    recipeCategory: "Cocktail", // update once model has type: cocktail | mocktail | shot
  };

  const blurDataUrls = await getBlurDataURL(cocktail.images);

  return (<>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div style={{
          textAlign: 'center'
        }}>
          {cocktail.images.map((image, index) => <Image src={`${image}`} alt={`${cocktail.name}`} key={index}
                                                        width={300} height={300} placeholder={'blur'}
                                                        blurDataURL={blurDataUrls[index]}
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />)}
          <h1>{cocktail.name}</h1>
          <p>Ingredients:</p>
          {cocktail.cocktailIngredients.map((ingredient) => <Ingredient {...ingredient}
                                                                        key={ingredient.ingredientId}/>)}
          <p>{cocktail.preparation}</p>
        </div>
      </>

  );
};

const Ingredient = ({ ingredient, amount }: {ingredient: {name: string}, amount: string}) => {
  return (
      <ul>
        <li>{amount} {ingredient.name}</li>
      </ul>
  );
};
export default Cocktail;
