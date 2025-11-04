
document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  // --- Elementos del DOM --- 
  const profileName = document.getElementById("profile-name");
  const profileProgram = document.getElementById("profile-program");
  const profileAvatarContainer = document.getElementById("profile-avatar-container");
  const profileRank = document.getElementById("profile-rank");
  const profileBadges = document.getElementById("profile-badges");
  const profileReviews = document.getElementById("profile-reviews");
  const topGlobalRankingContainer = document.getElementById("top-global-ranking");

  // --- Modal de Editar Perfil ---
  const openModalBtn = document.getElementById("open-edit-profile-modal-btn");
  const closeModalBtn = document.getElementById("close-edit-profile-modal-btn");
  const editProfileModalBackdrop = document.getElementById("edit-profile-modal-backdrop");
  const editProfileModalPanel = document.getElementById("edit-profile-modal-panel");
  const editNameInput = document.getElementById("edit-name");
  const editProgramInput = document.getElementById("edit-program");
  const editSemesterInput = document.getElementById("edit-semester");
  const saveProfileBtn = document.getElementById("save-profile-btn");

  let currentUser = null;
  let userId = null;
  const TOTAL_BADGES = 6;

  auth.onAuthStateChanged(user => {
    if (user) {
      userId = user.uid;
      db.collection("users").doc(userId).onSnapshot(doc => {
        if (doc.exists) {
          currentUser = { id: doc.id, ...doc.data() };
        } else {
          currentUser = { 
            id: userId, name: user.displayName || 'Estudiante', email: user.email, 
            xp: 0, missions: {}, badges: [], program: '', semester: '' 
          };
          db.collection("users").doc(userId).set(currentUser);
        }
        
        // Solo ejecutar las funciones de UI si los elementos existen en la página actual
        if (profileName) displayProfileData(currentUser);
        if (profileRank) calculateStats(userId, currentUser);
        if (topGlobalRankingContainer) loadTopGlobalRanking();

        // Disparar evento para otros scripts (como missions-ui.js)
        const event = new CustomEvent('userProfileLoaded', { detail: currentUser });
        document.dispatchEvent(event);

      }, err => console.error("Error al obtener datos del usuario:", err));
    } else {
      window.location.href = "index.html";
    }
  });

  function displayProfileData(userData) {
    const name = userData.name || "Sin nombre";
    profileName.textContent = name;
    profileProgram.textContent = `${userData.program || 'Sin Programa'} - Sem. ${userData.semester || 'N/A'}`;
    
    if (profileAvatarContainer) generateAvatar(name, profileAvatarContainer);

    // Llenar el modal con los datos actuales
    editNameInput.value = name;
    editProgramInput.value = userData.program || '';
    editSemesterInput.value = userData.semester || '';
  }

  function generateAvatar(name, container) {
      container.innerHTML = '';
      const initial = name ? name.charAt(0).toUpperCase() : '?';
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
      const colorIndex = name.length % colors.length;
      const avatar = document.createElement('div');
      avatar.style.backgroundColor = colors[colorIndex];
      avatar.className = 'w-24 h-24 rounded-full border-4 border-gray-200 flex items-center justify-center';
      avatar.innerHTML = `<span class="text-4xl font-bold text-white">${initial}</span>`;
      container.appendChild(avatar);
  }

  async function calculateStats(userId, userData) {
    const missionsInReview = Object.values(userData.missions || {}).filter(m => m.status === 'in-review').length;
    profileReviews.textContent = missionsInReview;

    const badgesCount = (userData.badges || []).length;
    profileBadges.textContent = `${badgesCount} / ${TOTAL_BADGES}`;

    const usersSnapshot = await db.collection("users").orderBy("xp", "desc").get();
    let rank = -1;
    usersSnapshot.forEach((doc, index) => {
      if (doc.id === userId) rank = index + 1;
    });
    
    profileRank.textContent = (rank !== -1 && (userData.xp || 0) > 0) ? `#${rank}` : '-';
  }

  // --- Cargar Top 3 Global ---
  async function loadTopGlobalRanking() {
      const usersSnapshot = await db.collection("users").orderBy("xp", "desc").limit(3).get();
      topGlobalRankingContainer.innerHTML = ''; // Limpiar
      usersSnapshot.forEach((doc, index) => {
          const user = doc.data();
          const rankItem = document.createElement('div');
          rankItem.className = 'flex items-center justify-between p-2 rounded-lg bg-gray-50';
          rankItem.innerHTML = `
              <div class="flex items-center gap-3">
                  <span class="font-bold text-lg text-gray-400">#${index + 1}</span>
                  <div>
                      <p class="font-semibold text-gray-800">${user.name}</p>
                      <p class="text-xs text-gray-500">${user.program || 'Programa no definido'}</p>
                  </div>
              </div>
              <span class="font-bold text-blue-600">${user.xp || 0} XP</span>
          `;
          topGlobalRankingContainer.appendChild(rankItem);
      });
  }

  // --- Lógica del Modal (solo si existe el botón) ---
  if (openModalBtn) {
    function toggleModal(show) {
        editProfileModalBackdrop.classList.toggle("hidden", !show);
        editProfileModalPanel.classList.toggle("hidden", !show);
    }

    openModalBtn.addEventListener("click", () => toggleModal(true));
    closeModalBtn.addEventListener("click", () => toggleModal(false));
    editProfileModalBackdrop.addEventListener("click", () => toggleModal(false));

    saveProfileBtn.addEventListener("click", () => {
      const updatedProfile = {
        name: editNameInput.value.trim(),
        program: editProgramInput.value.trim(),
        semester: editSemesterInput.value.trim()
      };
      
      db.collection("users").doc(userId).update(updatedProfile)
        .then(() => toggleModal(false))
        .catch(err => console.error("Error al actualizar el perfil:", err));
    });
  }
});
