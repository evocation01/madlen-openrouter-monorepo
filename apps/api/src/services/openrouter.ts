import axios from "axios";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";

const FALLBACK_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/devstral-2512:free",
  "google/gemma-2-9b-it:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "microsoft/phi-3-medium-128k-instruct:free",
];

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

  async chat(messages: any[], model: string, allowFallback = true) {
    if (!this.apiKey) {
        console.error("OpenRouter API Key is missing!");
        throw new Error("OpenRouter API Key is missing");
    }

    // Prioritize the requested model, then unique fallbacks
    const modelsToTry = [model];
    if (allowFallback) {
        FALLBACK_MODELS.forEach(m => {
            if (m !== model) modelsToTry.push(m);
        });
    }

    let lastError;

    for (const currentModel of modelsToTry) {
        try {
            if (currentModel !== modelsToTry[0]) {
                console.log(`Fallback: Attempting chat with model: ${currentModel}`);
            }

            const response = await axios.post(
                `${OPENROUTER_API_URL}/chat/completions`,
                {
                    model: currentModel,
                    messages,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3001", // Required by OpenRouter
                        "X-Title": "Madlen Chat", // Optional
                    },
                }
            );
            
            // If we used a fallback, we might want to inform the caller
            if (currentModel !== model) {
                 if (response.data.choices && response.data.choices[0]?.message) {
                     response.data.choices[0].message.content = 
                        (response.data.choices[0].message.content || "") + 
                        `\n\n*[System: Original model rate-limited. Switched to ${currentModel}]*`;
                 }
            }

            return response.data;
        } catch (error: any) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.warn(`Failed with model ${currentModel}: ${errorMsg}`);
            lastError = error;
            
            // If it's an Auth error (401), don't retry other models, they will all fail.
            if (error.response?.status === 401) {
                throw error;
            }
            
            // Continue to next model
        }
    }

    console.error("All models failed.");
    throw lastError;
  }
}

export const openRouterService = new OpenRouterService();
