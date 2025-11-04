const firebaseConfig = {
  apiKey: "AIzaSyCB2HT_juz2wnc0tGGbxcMEpwBX6D8-Fuk",
  authDomain: "mision-global-nunista.firebaseapp.com",
  projectId: "mision-global-nunista",
  storageBucket: "mision-global-nunista.firebasestorage.app",
  messagingSenderId: "348881926739",
  appId: "1:348881926739:web:b29bd3d56c35b8651024a6",
  measurementId: "G-NNJ9GV1PKY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();