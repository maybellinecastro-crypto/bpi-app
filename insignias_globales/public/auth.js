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
    // 1. Crear el usuario en Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // 2. Guardar el nombre en el perfil de Auth (Mejora)
    await user.updateProfile({
      displayName: name
    });

    // 3. Crear el documento de perfil en Firestore
    await db.collection("users").doc(user.uid).set({
      name: name,
      email: email,
      xp: 0,
      level: "Explorador Global",
      badges: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showMessage("¡Usuario creado con éxito! Redirigiendo...", false);
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);

  } catch (error) {
    console.error("Error detallado en registro:", error);
    showMessage("Error: " + (error.message || "Registro fallido"));
  }
}

async function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) return showMessage("Completa todos los campos");

  showMessage("Iniciando sesión...", false);

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
  const isLoginPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
  
  if (user && isLoginPage) {
    window.location.href = "dashboard.html";
  }
});
