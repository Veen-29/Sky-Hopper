import streamlit as st
import google.generativeai as genai

# 1. Setup your Google AI Studio API Key
# (In Streamlit, you'll put this in "Advanced Settings" so it's secure)
genai.configure(api_key=st.secrets["GEMINI_API_KEY"])

st.title("My Sky-Hopper AI App")

# 2. Create a text box for the user
user_input = st.text_input("Ask the AI something:")

if user_input:
    # 3. Call the Gemini model
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(user_input)
    
    # 4. Show the answer on your webpage
    st.write(response.text)
