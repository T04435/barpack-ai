
interface Ingredient {
  id: string;
  name: string;
  amount: string;
}

export interface Cocktail {
  id: number;
  name: string;
  slug: string;
  preparation: string;
  ingredients: Ingredient[];
  glass: string;
  garnish: string;
  images: string[];
}


