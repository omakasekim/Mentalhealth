

import os
import openai
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel

# Initialize FastAPI
app = FastAPI()

# Set OpenAI API Key
API_KEY = ""
if not API_KEY:
    raise ValueError("Missing OpenAI API Key. Set it as an environment variable.")

openai_client = openai.OpenAI(api_key=API_KEY)

# AI Moderation Prompt (Detailed Analysis)
MODERATION_PROMPT = """
You are a mental health AI assistant. Analyze the following conversation and provide a **detailed** response.

1. **Identify distress signals**, self-harm risks, or emotional distress.
2. **Classify severity** as: **low, moderate, or high**.
3. **Provide a summary** of the conversation’s emotional content.
4. **Explain the psychological state** based on tone, word choice, and emotional cues.
5. **Suggest next steps** such as self-care tips, professional help, or coping strategies.

---
**Conversation:**
{conversation}

**Response:**
"""

# Mental Health Resources (Hardcoded)
MENTAL_HEALTH_RESOURCES = {
    "US": "Call 988 (Suicide & Crisis Lifeline)",
    "UK": "Call 116 123 (Samaritans)",
    "Canada": "Call 1-833-456-4566 (Talk Suicide Canada)",
    "Australia": "Call 13 11 14 (Lifeline Australia)",
    "Global": "Visit https://findahelpline.com/"
}

class MessageInput(BaseModel):
    user_id: str
    conversation: str
    country: str


def ai_moderation_analysis(conversation):
    """Uses OpenAI GPT-4 to analyze distress levels & provide a detailed response."""
    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a mental health AI assistant."},
            {"role": "user", "content": MODERATION_PROMPT.format(conversation=conversation)}
        ]
    )
    return response.choices[0].message.content


def trigger_escalation(user_id, severity, country):
    """Logs crisis escalation messages instead of using external webhooks."""
    hotline = MENTAL_HEALTH_RESOURCES.get(country, MENTAL_HEALTH_RESOURCES["Global"])
    
    escalation_message = {
        "user_id": user_id,
        "severity": severity,
        "message": f"We detected severe distress. Please reach out: {hotline}",
        "hotline": hotline
    }

    # Save to local log file
    with open("escalation_log.txt", "a") as log_file:
        log_file.write(f"{escalation_message}\n")

    return escalation_message


@app.post("/analyze-conversation/")
async def analyze_conversation(data: MessageInput, background_tasks: BackgroundTasks):
    """Analyzes conversation & detects distress level."""
    try:
        # Step 1: AI-based moderation (detailed response)
        analysis_result = ai_moderation_analysis(data.conversation)

        # Step 2: Check for high distress & trigger escalation
        if "high" in analysis_result.lower():
            escalation_info = trigger_escalation(data.user_id, "high", data.country)
            return {
                "status": "escalation_triggered",
                "message": "High distress detected. Resources provided.",
                "ai_analysis": analysis_result,
                "escalation_info": escalation_info
            }

        return {
            "status": "moderation_complete",
            "analysis": analysis_result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    return {"message": "AI Moderation & Mental Health Support API is running!"}
