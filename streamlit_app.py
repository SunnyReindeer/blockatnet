import streamlit as st


st.markdown("""
    <style>
        .main .block-container {
            padding: 0;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
            overflow: auto;
        }
    </style>
""", unsafe_allow_html=True)


st.components.v1.iframe("http://localhost:3000", width=1920, height=1080)