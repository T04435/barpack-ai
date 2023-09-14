import { Cocktail } from 'model/cocktail';
import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';
import { CreateImageRequest } from 'openai/api';

const MAX_TOKENS: number = 1024;
const config = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export class OpenAiService {
  async generateCocktailRecipe(cocktailName: string): Promise<Cocktail> {
    const request: CreateChatCompletionRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Pretend you are a expert mixologist' },
        {
          role: 'user', content: `Get data for cocktail named ${cocktailName}
          Do not include any explanations, only provide a  RFC8259 compliant JSON response  following this format without deviation.
          interface Ingredient {
            name: string;
            amount: string;
          }
          interface Cocktail {
            id: number;
            name: string;
            preparation: string;
            ingredients: Ingredient[];
            glass: string;
            garnish: string;
          }
          The JSON response:
        `
        },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.05,
      top_p: 0.5,
      n: 1,
      stream: false,
    };

    const completion = await openai.createChatCompletion(request);
    // check the content of the response
    if (!completion.data.choices[0]?.message?.content) {
      throw new Error(`failed to generate cocktail recipe for ${cocktailName}`);
    }

    console.info(`completion stats: ${JSON.stringify(completion.data, null, 2)}`);

    return JSON.parse(completion.data.choices[0].message.content) as Cocktail;
  }

  async generateCocktailNewName(existingNames: string[]): Promise<string> {
    const REQ_NEW_DRINK: ChatCompletionRequestMessage = {
      role: 'user',
      content: '+'
    };
    const previousMessages: ChatCompletionRequestMessage[] = [];
    existingNames.map((name) => (
        previousMessages.push(
            REQ_NEW_DRINK,
            {
              role: 'assistant',
              content: name
            }
        )));

    const request: CreateChatCompletionRequest = {
      model: 'gpt-3.5-turbo',
      max_tokens: MAX_TOKENS,
      temperature: 0.2,
      top_p: 0.5,
      n: 1,
      stream: false,
      messages: [
        { role: 'system', content: 'Pretend you are a expert mixologist.' },
        { role: 'system', content: 'Always respond with a new cocktail, mocktail or shot name.' },
        { role: 'system', content: 'Do not include any explanations, only provide a string without deviation.'},
        ...previousMessages,
        REQ_NEW_DRINK
      ],
    };

    const completion = await openai.createChatCompletion(request);
    // check the content of the response
    if (!completion.data.choices[0]?.message?.content) {
      throw new Error(`failed to generate cocktail name`);
    }
    const name = completion.data.choices[0].message.content;
    console.info(`new cocktail name: ${name}`);
    console.info(`completion stats: ${JSON.stringify(completion.data.usage, null, 2)}`);
    return name;
  }

  async generateImage(prompt: string) {
    try {

      const request: CreateImageRequest = {
        prompt,
        size: '512x512',
        user: 'T04435',
        response_format: 'b64_json',
      };

      const imageResp = await openai.createImage(request);
      if (!imageResp.data.data[0].b64_json) return;
      return imageResp.data.data[0].b64_json;
    } catch (error) {
      console.error(error);
    }
  }
}

