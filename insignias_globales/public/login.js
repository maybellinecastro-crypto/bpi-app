
document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- Elementos del DOM ---
    const loginForm = document.getElementById('loginSection');
    const registerForm = document.getElementById('registerSection');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const registerNameInput = document.getElementById('regName');
    const registerEmailInput = document.getElementById('regEmail');
    const registerPasswordInput = document.getElementById('regPassword');
    const messageElement = document.getElementById('message');

    // --- Botones ---
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const showLoginButton = document.getElementById('showLoginButton');
    const showRegisterButton = document.getElementById('showRegisterButton');

    // --- Navegación entre formularios ---
    const showLogin = () => {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    };

    const showRegister = () => {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    };

    // --- Lógica de Inicio de Sesión ---
    const loginUser = async () => {
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;
        if (!email || !password) {
            messageElement.textContent = 'Por favor, completa todos los campos.';
            return;
        }

        try {
            messageElement.textContent = ''; // Limpiar mensaje de error
            await auth.signInWithEmailAndPassword(email, password);
            // NO HAY REDIRECCIÓN AQUÍ. auth-manager.js se encargará de ello.
        } catch (error) {
            console.error('Error de inicio de sesión:', error.code);
            if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
                messageElement.textContent = 'Correo o contraseña incorrectos.';
            } else {
                messageElement.textContent = 'Hubo un error al iniciar sesión.';
            }
        }
    };

    // --- Lógica de Registro ---
    const registerUser = async () => {
        const name = registerNameInput.value;
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;

        if (!name || !email || !password) {
            messageElement.textContent = 'Por favor, completa todos los campos.';
            return;
        }
        if (password.length < 6) {
            messageElement.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            return;
        }

        try {
            messageElement.textContent = ''; // Limpiar mensaje de error
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Crear perfil de usuario en Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                isAdmin: false,
                xp: 0,
                badges: [],
                missions: {},
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            // NO HAY REDIRECCIÓN AQUÍ. auth-manager.js se encargará de ello.
        } catch (error) {
            console.error('Error de registro:', error.code);
            if (error.code === 'auth/email-already-in-use') {
                messageElement.textContent = 'Este correo ya está registrado. Intenta iniciar sesión.';
            } else {
                messageElement.textContent = 'Hubo un error durante el registro.';
            }
        }
    };

    // --- Asignación de Eventos ---
    if(loginButton) loginButton.addEventListener('click', loginUser);
    if(registerButton) registerButton.addEventListener('click', registerUser);
    if(showLoginButton) showLoginButton.addEventListener('click', showLogin);
    if(showRegisterButton) showRegisterButton.addEventListener('click', showRegister);

    // Estado inicial
    showLogin();
});
