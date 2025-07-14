# app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# Configure your Flask app and CORS (Cross-Origin Resource Sharing)
app = Flask(__name__)
CORS(app)

# Configure the Gemini API key from an environment variable
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

@app.route('/api/chatbot', methods=['POST'])
def chatbot_endpoint():
    try:
        user_message = request.json['message']
        
        # Call the Gemini API
        response = model.generate_content(user_message)
        
        if response and response.text:
            ai_response = response.text
            # You would implement your scoring logic here based on the conversation
            # For this prototype, we'll return a placeholder score
            score = 7 
            return jsonify({'response': ai_response, 'score': score})
        else:
            return jsonify({'response': 'Sorry, I could not generate a response.', 'score': 0}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)