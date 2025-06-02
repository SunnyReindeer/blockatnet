import streamlit as st

st.title("My dApp Embedded in Streamlit")
st.write("Interact with the dApp below:")
st.components.v1.iframe("http://localhost:3000", height=800, scrolling=True)