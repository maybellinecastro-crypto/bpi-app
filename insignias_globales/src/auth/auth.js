function showMessage(msg, isError = true) {
  const el = document.getElementById('message');
  el.textContent = msg;
  el.className = isError ? 'text-red-500 text-sm mt-3 text-center' : 'text-green-500 text-sm mt-3 text-center';
}

async function registerUser() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  if (!name || !email || !password) return showMessage("Completa todos los campos");

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    await db.collection("users").doc(user.uid).set({
      name: name,
      email: email,
      xp: 0,
      level: "Explorador Global",
      badges: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error(error);
    showMessage("Error: " + (error.message || "Registro fallido"));
  }
}

async function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) return showMessage("Completa todos los campos");

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error(error);
    showMessage("Error: credenciales inválidas");
  }
}

// Redirigir si ya está logueado
auth.onAuthStateChanged(user => {
  if (user && window.location.pathname === '/dashboard.html') {
    // Ya en dashboard, ok
  } else if (user) {
    window.location.href = "dashboard.html";
  }
});