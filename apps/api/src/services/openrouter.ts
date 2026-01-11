import axios from "axios";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";

export class OpenRouterService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    if (!this.apiKey) {
      console.warn("OPENROUTER_API_KEY is not set");
    }
  }

  async getModels() {
    try {
      const response = await axios.get(`${OPENROUTER_API_URL}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  }

  async chat(messages: any[], model: string) {
    try {
      const response = await axios.post(
        `${OPENROUTER_API_URL}/chat/completions`,
        {
          model,
          messages,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in chat completion:", error);
      throw error;
    }
  }
}

export const openRouterService = new OpenRouterService();
