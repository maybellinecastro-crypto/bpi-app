
document.addEventListener('DOMContentLoaded', () => {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {
        const path = window.location.pathname.split('/').pop() || 'index.html';

        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (!userDoc.exists) {
                    return auth.signOut();
                }

                const userData = { uid: user.uid, ...userDoc.data() };
                window.currentUserData = userData;

                // --- ARREGLO BUCLE INFINITO: Forzar y PERSISTIR el rol de admin ---
                let isAdmin = userData.isAdmin === true;
                if (userData.email === 'admin@campusuninunez.edu.co') {
                    isAdmin = true;
                    window.currentUserData.isAdmin = true; // <-- La corrección clave
                    console.log('Auth Manager: Rol de admin forzado globalmente.');
                }
                // ------------------------------------------------------------------

                if (isAdmin) {
                    if (path !== 'admin.html') {
                        return window.location.replace('/admin.html');
                    }
                } else {
                    if (path === 'admin.html' || path === 'index.html' || path === '') {
                        return window.location.replace('/dashboard.html');
                    }
                }

                const onScriptsReady = () => {
                    document.dispatchEvent(new CustomEvent('userReady'));
                };

                if (path === 'dashboard.html' && !isAdmin) {
                    const scriptContainer = document.getElementById('user-specific-scripts');
                    if (scriptContainer) {
                        try {
                            const config = JSON.parse(scriptContainer.textContent);
                            const scripts = config.scripts;
                            let loadedCount = 0;
                            if (!scripts || scripts.length === 0) return onScriptsReady();

                            scripts.forEach(src => {
                                const script = document.createElement('script');
                                script.src = src;
                                script.onload = () => {
                                    loadedCount++;
                                    if (loadedCount === scripts.length) onScriptsReady();
                                };
                                document.body.appendChild(script);
                            });
                        } catch (e) { onScriptsReady(); }
                    }
                } else {
                    onScriptsReady();
                }

            } catch (error) {
                console.error("Error fatal de autenticación:", error); auth.signOut();
            }
        } else {
            if (path !== 'index.html' && path !== '') {
                window.location.replace('/index.html');
            }
        }
    });

    window.signOut = () => {
        auth.signOut().catch(error => console.error("Error al cerrar sesión:", error));
    };
});
