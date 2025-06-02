import streamlit as st

# 調整 CSS，讓 iframe 更適配視窗，並添加滾動條
st.markdown("""
    <style>
        .main .block-container {
            padding: 0;
        }
        iframe {
            width: 100vw;
            height: 100vh;
            border: none;
            overflow: auto;
        }
    </style>
""", unsafe_allow_html=True)

# 調整 iframe 的寬高參數，嘗試更大的寬度
st.components.v1.iframe("http://localhost:3000", width=1920, height=1080)