import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: "AIzaSyAg6k3kQ8-8JCd5BrgzKkCHvqZGD7H3ahE",
  authDomain: "alert-a0f36.firebaseapp.com",
  projectId: "alert-a0f36",
  storageBucket: "alert-a0f36.appspot.com",
  messagingSenderId: "275707070826",
  appId: "1:275707070826:web:4eb494ec07d408eb447d13",
  measurementId: "G-LV0DE9NYCC"
};

const app = firebase.initializeApp(firebaseConfig);
export default app;