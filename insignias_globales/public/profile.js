
document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const userRef = db.collection("users").doc(user.uid);
      let userData;

      try {
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          userData = userDoc.data();
          // Para la demostración, nos aseguramos de que el usuario tenga algunas insignias para mostrar
          if (!userData.badges || userData.badges.length === 0) {
            userData.badges = ['explorador_global', 'investigador'];
          }
        } else {
          console.log("Perfil no encontrado en Firestore, creando uno nuevo...");
          
          const name = user.displayName || user.email.split('@')[0];
          // Perfil inicial con insignias de demostración
          const initialProfile = {
            name: name,
            email: user.email,
            xp: 50, // XP inicial por las primeras insignias
            level: "Explorador Global",
            badges: ['explorador_global', 'investigador'], // Insignias de inicio
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          };

          await userRef.set(initialProfile);
          userData = initialProfile;
          console.log("Perfil de demostración creado exitosamente.");
        }
      } catch (error) {
        console.error("Error al interactuar con Firestore:", error.message);
        // Perfil temporal en caso de error, con insignias de demostración
        userData = {
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          xp: 50,
          level: "(No guardado)",
          badges: ['explorador_global', 'investigador'] // Insignias de inicio
        };
        console.warn("Mostrando perfil temporal con datos de demostración.");
      }

      renderUserProfile(userData);
      
      // Despacha el evento con los datos del usuario (incluyendo insignias)
      const event = new CustomEvent('userProfileLoaded', { detail: userData });
      document.dispatchEvent(event);

    } else {
      window.location.href = "index.html";
    }
  });
});

function renderUserProfile(userData) {
  const profileContainer = document.getElementById('profile-container');
  if (!profileContainer) return;

  if (!userData) {
    profileContainer.innerHTML = `<p class="text-red-500">No se pudieron cargar los datos del perfil.</p>`;
    return;
  }

  const currentLevelXP = 100;
  const xpPercentage = userData.xp ? (userData.xp / currentLevelXP) * 100 : 0;

  const profileHTML = `
    <div class="bg-white p-6 rounded-xl shadow-md">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600">${userData.name.charAt(0).toUpperCase()}</div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">Bienvenido, ${userData.name}</h2>
          <div class="flex items-center gap-4 text-sm text-gray-600 mt-1">
            <span><strong>XP:</strong> ${userData.xp}</span>
            <span><strong>Nivel:</strong> ${userData.level}</span>
          </div>
        </div>
      </div>
      
      <div class="mt-4">
        <div class="text-xs text-gray-500 mb-1">Progreso hacia el próximo nivel</div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-yellow-400 h-2.5 rounded-full" style="width: ${xpPercentage}%"></div>
        </div>
      </div>
    </div>
  `;
  
  profileContainer.innerHTML = profileHTML;
}
