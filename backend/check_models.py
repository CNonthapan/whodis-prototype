import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyAx2TyLw41cpIhqlz520B6_gVUOgjxo1Es")

print("Listing available models...")
for m in genai.list_models():
    # Only show models that support the generate_content method
    if 'generateContent' in m.supported_generation_methods:
        print(f"Model Name: {m.name}")