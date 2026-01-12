import axios from "axios";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";

const MODEL_CATEGORIES: Record<string, string[]> = {
  reasoning: [
    "tngtech/deepseek-r1t2-chimera:free",
    "deepseek/deepseek-r1-0528:free",
    "xiaomi/mimo-v2-flash:free",
    "openai/gpt-oss-120b:free",
    "openai/gpt-oss-20b:free",
  ],
  coding: [
    "mistralai/devstral-2512:free",
    "qwen/qwen3-coder:free",
    "xiaomi/mimo-v2-flash:free",
  ],
  agentic: [
    "mistralai/devstral-2512:free",
    "qwen/qwen3-coder:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "arcee-ai/trinity-mini:free",
    "openai/gpt-oss-120b:free",
  ],
  multimodal: [
    "google/gemini-2.0-flash-exp:free",
    "google/gemma-3-27b-it:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "qwen/qwen-2.5-vl-7b-instruct:free",
  ],
  general: [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-2-9b-it:free",
    "microsoft/phi-3-medium-128k-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
  ]
};

const ALL_FALLBACKS = [
  ...MODEL_CATEGORIES.general,
  ...MODEL_CATEGORIES.multimodal,
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

    const modelsToTry = [model];
    
    if (allowFallback) {
        // 1. Identify category of requested model
        let category = "general";
        // Check exact match in categories
        for (const [cat, models] of Object.entries(MODEL_CATEGORIES)) {
            if (models.includes(model)) {
                category = cat;
                break;
            }
        }

        console.log(`Model ${model} detected as category: ${category}`);

        // 2. Add same-category models first
        if (MODEL_CATEGORIES[category]) {
            MODEL_CATEGORIES[category].forEach(m => {
                if (m !== model && !modelsToTry.includes(m)) modelsToTry.push(m);
            });
        }

        // 3. Add general fallbacks (if not already added)
        ALL_FALLBACKS.forEach(m => {
            if (!modelsToTry.includes(m)) modelsToTry.push(m);
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
            
            // If we used a fallback, append a note
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
            
            // If it's an Auth error (401), don't retry other models
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
