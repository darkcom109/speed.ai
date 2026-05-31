import { systemPrompt } from "../assistant/assistant-prompt.js"

// Temporary memory
export const memory = 
    {
        messages:[ 
            {
                role: "system",
                content: systemPrompt,
            }
        ],
        summary: ""
    }
