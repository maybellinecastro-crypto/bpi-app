const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "mision-global-nunista.firebaseapp.com",
  projectId: "mision-global-nunista",
  storageBucket: "mision-global-nunista.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();