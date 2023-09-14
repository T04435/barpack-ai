import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { OpenAiService } from '../../../../../services/openAiService';
import { SupabaseService } from '../../../../../services/supabaseService';
import { slugIt } from '../../../../../utils/stringFormat';


const prisma = new PrismaClient();
const openAiService = new OpenAiService();

/* TODO: set this as a cron job */
export async function GET(request: Request) {


  const existingNames = await prisma.cocktail.findMany({
    select: {
      name: true,
    }
  });

  const cocktailName = await openAiService.generateCocktailNewName(existingNames.map(c => c.name));
  const cocktailData = await openAiService.generateCocktailRecipe(cocktailName);
  let cocktail = null;

  if (cocktailData) {
    const imagePrompt = `A "${cocktailData.name}" cocktail in a ${cocktailData.glass} with ${cocktailData.garnish} with a professional photo`;
    const imageData = await openAiService.generateImage(imagePrompt);

    if (imageData) {
      const supabaseService = new SupabaseService();
      const data = await supabaseService.uploadImage(cocktailName, imageData);
      cocktailData.images = [];
      cocktailData.images[0] = data || '';
    }

    cocktail = await prisma.cocktail.create({
      data: {
        name: cocktailData.name,
        glass: cocktailData.glass,
        preparation: cocktailData.preparation,
        garnish: cocktailData.garnish,
        images: cocktailData.images,
        slug: slugIt(cocktailData.name),
        cocktailIngredients: {
          create: cocktailData.ingredients.map((ingredient) => ({
            ingredient: {
              connectOrCreate: {
                create: {
                  name: ingredient.name,
                },
                where: {
                  name: ingredient.name,
                },
              },
            },
            amount: ingredient.amount
          }))
        }
      }
    });

  }

  return NextResponse.json(cocktailData);

}
