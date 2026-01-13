export interface Model {
    id: string;
    name: string;
    created: string;
    context: string;
    description: string;
    tags: string[];
}

export const models: Model[] = [
    {
        id: "google/gemini-2.0-flash-exp:free",
        name: "Gemini Flash 2.0 (Exp)",
        created: "Dec 11, 2024",
        context: "1.05M",
        description:
            "Significantly faster TTFT, enhanced multimodal understanding, coding, and agentic capabilities.",
        tags: ["Multimodal", "Coding", "Agentic", "Free"],
    },
    {
        id: "xiaomi/mimo-v2-flash:free",
        name: "Xiaomi MiMo V2 Flash",
        created: "Dec 14, 2025",
        context: "262k",
        description:
            "309B MoE model excelling at reasoning, coding, and agent scenarios. Hybrid-thinking toggle.",
        tags: ["Reasoning", "Coding", "Agentic", "Free"],
    },
    {
        id: "mistralai/devstral-2512:free",
        name: "Mistral Devstral 2",
        created: "Dec 9, 2025",
        context: "262k",
        description:
            "123B dense model specializing in agentic coding, repository-level reasoning, and bug fixing.",
        tags: ["Coding", "Agentic", "Free"],
    },
    {
        id: "qwen/qwen3-coder:free",
        name: "Qwen3 Coder",
        created: "Jul 23, 2025",
        context: "262k",
        description:
            "480B MoE optimized for agentic coding, function calling, and long-context reasoning.",
        tags: ["Coding", "Agentic", "Free"],
    },
    {
        id: "nvidia/nemotron-3-nano-30b-a3b:free",
        name: "Nemotron 3 Nano",
        created: "Dec 14, 2025",
        context: "256k",
        description:
            "Small MoE model with high compute efficiency for specialized agentic AI systems.",
        tags: ["Agentic", "Free"],
    },
    {
        id: "tngtech/deepseek-r1t2-chimera:free",
        name: "DeepSeek R1T2 Chimera",
        created: "Jul 8, 2025",
        context: "163k",
        description:
            "671B MoE assembled from DeepSeek checkpoints. Strong reasoning, faster than original R1.",
        tags: ["Reasoning", "Free"],
    },
    {
        id: "deepseek/deepseek-r1-0528:free",
        name: "DeepSeek R1 (0528)",
        created: "May 28, 2025",
        context: "163k",
        description:
            "Updates to original R1. Performance on par with OpenAI o1. Fully open reasoning tokens.",
        tags: ["Reasoning", "Free"],
    },
    {
        id: "arcee-ai/trinity-mini:free",
        name: "Trinity Mini",
        created: "Dec 1, 2025",
        context: "131k",
        description:
            "26B sparse MoE engineered for efficient reasoning over long contexts and multi-step workflows.",
        tags: ["Reasoning", "Agentic", "Free"],
    },
    {
        id: "openai/gpt-oss-120b:free",
        name: "GPT OSS 120B",
        created: "Aug 5, 2025",
        context: "131k",
        description:
            "117B MoE from OpenAI. High-reasoning, agentic, native tool use, and structured outputs.",
        tags: ["Reasoning", "Agentic", "Free"],
    },
    {
        id: "openai/gpt-oss-20b:free",
        name: "GPT OSS 20B",
        created: "Aug 5, 2025",
        context: "131k",
        description:
            "21B MoE optimized for lower-latency. Supports reasoning configuration and agentic capabilities.",
        tags: ["Reasoning", "Agentic", "Free"],
    },
    {
        id: "google/gemma-3-27b-it:free",
        name: "Gemma 3 27B",
        created: "Mar 12, 2025",
        context: "128k",
        description:
            "Successor to Gemma 2. Multimodal support (vision-language), improved math, and reasoning.",
        tags: ["Multimodal", "Reasoning", "Coding", "Free"],
    },
    {
        id: "meta-llama/llama-3.3-70b-instruct:free",
        name: "Llama 3.3 70B",
        created: "Dec 6, 2024",
        context: "128k",
        description:
            "Optimized for multilingual dialogue. Outperforms many open and closed chat models.",
        tags: ["Chat", "Free"],
    },
    {
        id: "meta-llama/llama-3.1-405b-instruct:free",
        name: "Llama 3.1 405B",
        created: "Jul 23, 2024",
        context: "128k",
        description:
            "Frontier-level open model. Optimized for high quality dialogue and general capabilities.",
        tags: ["Chat", "Free"],
    },
    {
        id: "nvidia/nemotron-nano-12b-v2-vl:free",
        name: "Nemotron Nano 2 VL",
        created: "Oct 28, 2025",
        context: "128k",
        description:
            "12B multimodal reasoning model. Video understanding, document intelligence, OCR.",
        tags: ["Multimodal", "Reasoning", "Free"],
    },
    {
        id: "mistralai/mistral-small-3.1-24b-instruct:free",
        name: "Mistral Small 3.1",
        created: "Mar 17, 2025",
        context: "128k",
        description:
            "24B parameters with advanced multimodal capabilities. Image analysis, programming, math.",
        tags: ["Multimodal", "Coding", "Reasoning", "Free"],
    },
    {
        id: "allenai/molmo-2-8b:free",
        name: "Molmo 2 8B",
        created: "Jan 9, 2026",
        context: "37k",
        description:
            "Open vision-language model. State-of-the-art on short videos, counting, and captioning.",
        tags: ["Multimodal", "Free"],
    },
    {
        id: "qwen/qwen-2.5-vl-7b-instruct:free",
        name: "Qwen 2.5 VL 7B",
        created: "Aug 28, 2024",
        context: "32k",
        description:
            "Multimodal LLM. SoTA image understanding, video understanding (>20min), agentic capabilities.",
        tags: ["Multimodal", "Agentic", "Free"],
    },
    {
        id: "google/gemma-3n-e4b-it:free",
        name: "Gemma 3n E4B",
        created: "May 20, 2025",
        context: "32k",
        description:
            "Optimized for mobile/low-resource. Multimodal inputs (text, visual, audio).",
        tags: ["Multimodal", "Free"],
    },
];
