# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json

# Configure the Flask app and CORS
app = Flask(__name__)
CORS(app)

genai.configure(api_key="AIzaSyAx2TyLw41cpIhqlz520B6_gVUOgjxo1Es")

# Create the Gemini Pro model instance
# Make sure to replace with the model name you found!
model = genai.GenerativeModel('gemini-2.5-flash')

# This is the new, customized prompt
SYSTEM_PROMPT = """

---

**Part 1: Light Conversation Starters**

"Let’s start simple — tell me about your day! What have you been up to today or yesterday?"

Follow with:
- "Have you ever had moments where you walked into a room and forgot why?"
- "How often do you misplace things like your phone or keys?"
- "Any funny or frustrating memory mix-ups lately?"

---

**Part 2: Memory Check-ins**

"Let’s try a little memory game! I’ll say three words: **lemon**, **carpet**, **cloud**. Try to remember them — I’ll ask again later."

Then:
- "Can you name the days of the week backwards?"
- "If I gave you $5 and you bought something for $3.25, how much would you have left?"
- (Optional visual task for in-person version): “Draw a clock showing 9:10. How did it go?”

---

**Part 3: Daily Function and Feelings**

"Everyone forgets things sometimes — but I’m curious how you're feeling about everyday stuff."

Ask:
- "Do you ever feel confused doing things that used to be easy, like using a microwave or sending a message?"
- "Have you needed more help recently with tasks like taking medicine or paying bills?"
- "Do you feel more down, anxious, or irritated than usual?"

---

**Part 4: Delayed Recall**

"Alright! Remember those three words from earlier? What were they again?"

---

**Part 5: Gentle Summary & Suggestions**

“Thanks for sharing with me — you’ve done great. Based on our little chat, I noticed a few things that might be worth checking with a doctor. Memory changes can happen for lots of reasons, but it’s always good to catch things early.”

If needed:
> “You might want to schedule a memory screening test with a healthcare professional, just to be sure. You’re not alone, and getting help early makes a big difference.”

If all seems fine:
> “Sounds like your memory’s holding up just fine right now — great job! If anything changes later on, I’m here to check in anytime.”

---

**Wrap-up**

"Would you like me to check in again next month? Or remind someone you trust to follow up? Either way, you’ve taken a great first step today."

---

### 🔧 Key Instructions for Implementation:

- **Tone:** Conversational, respectful, non-clinical
- **Persona:** Supportive peer — think helpful grandchild or friendly neighbor
- **Ethics:** Clearly state it’s not a diagnosis; suggest professional help if needed
- **Adaptability:** Use branching logic to go deeper based on responses
- **Privacy:** Remind users this chat is confidential and data is not shared without consent

---

Let me know if you'd like this version adapted for seniors, caregivers, voice interfaces, or in Thai!
"""

@app.route('/api/chatbot', methods=['POST'])
def chatbot_endpoint():
    try:
        user_message = request.json['message']
    except (TypeError, KeyError):
        return jsonify({'error': 'Invalid request format'}), 400

    print(f"Received message from client: '{user_message}'")

    try:
        # Create the full prompt by combining the system prompt and the user's message
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_message}"
        
        # Send the full prompt to the Gemini API
        chat_response = model.generate_content(full_prompt)
        ai_response_text = chat_response.text
        
        # We need to extract the JSON from the AI's response
        try:
            # Find the JSON part of the response
            json_start = ai_response_text.find("```json")
            json_end = ai_response_text.find("```", json_start + 1)
            json_string = ai_response_text[json_start + 7:json_end]
            ai_analysis = json.loads(json_string)
        except (json.JSONDecodeError, ValueError, IndexError):
            # If the AI doesn't return a perfect JSON, we just use the raw text
            ai_analysis = {"observation": ai_response_text, "conclusion": "Continue conversation"}
            
        # A more advanced system would have the AI score itself based on the prompt.
        ai_score = 7

        return jsonify({
            'response': ai_analysis['observation'],
            'score': ai_score
        })

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({
            'response': "Sorry, I'm having trouble with the conversation. Please try again later.",
            'score': 0
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)