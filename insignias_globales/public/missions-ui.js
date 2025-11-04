
// --- Variables Globales ---
let currentMission = null; // Guardará la misión seleccionada para el modal

document.addEventListener("DOMContentLoaded", () => {
  // --- Instancias de Firebase ---
  const auth = firebase.auth();
  const db = firebase.firestore();

  // --- Elementos del DOM para el Modal ---
  const modalBackdrop = document.getElementById('mission-modal-backdrop');
  const modalPanel = document.getElementById('mission-modal-panel');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const completeMissionBtn = document.getElementById('complete-mission-btn');

  // Cierra el modal
  const closeModal = () => {
    if (modalBackdrop && modalPanel) {
      modalBackdrop.classList.add('hidden');
      modalPanel.classList.add('hidden');
    }
  };

  if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if(modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // --- Lógica para Enviar Misión a Revisión ---
  if (completeMissionBtn) {
    completeMissionBtn.addEventListener('click', () => {
      if (!currentMission) return;

      const proofUrlInput = document.getElementById('mission-proof-url');
      const proofUrl = proofUrlInput.value;

      // Validación simple de la URL
      if (!proofUrl || !proofUrl.startsWith('http')) {
          alert("Por favor, ingresa una URL válida como evidencia.");
          return;
      }

      const user = auth.currentUser;
      if (!user) {
          alert("Error: No se ha podido identificar al usuario. Por favor, recarga la página.");
          return;
      }

      // Deshabilitar botón para evitar envíos múltiples
      completeMissionBtn.disabled = true;
      completeMissionBtn.textContent = 'Enviando...';

      // Actualizar el documento del usuario en Firestore
      const missionUpdatePath = `missions.${currentMission.id}`;
      db.collection("users").doc(user.uid).update({
        [missionUpdatePath]: {
          status: 'in-review',
          proofUrl: proofUrl,
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        }
      })
      .then(() => {
          alert("¡Misión enviada para revisión con éxito!");
          // La UI se actualizará automáticamente gracias al listener onSnapshot en profile.js
          closeModal();
      })
      .catch((error) => {
          console.error("Error al enviar la misión:", error);
          alert("Hubo un error al enviar tu misión. Por favor, inténtalo de nuevo.");
      })
      .finally(() => {
          // Volver a habilitar el botón y limpiar el input
          completeMissionBtn.disabled = false;
          completeMissionBtn.textContent = 'Completar Misión';
          if (proofUrlInput) proofUrlInput.value = '';
      });
    });
  }

  // --- Lógica de Renderizado del Mapa de Misiones ---
  // Escucha el evento que avisa cuando los datos del perfil de usuario están listos
  document.addEventListener('userProfileLoaded', (event) => {
    const userData = event.detail;
    // Solo renderizar el mapa si estamos en la página de misiones
    if (document.getElementById("mission-map")) {
      renderMissionMap(userData);
    }
  });
});

function showMissionModal(mission) {
    currentMission = mission;
    document.getElementById('mission-modal-title').textContent = mission.title;
    document.getElementById('mission-modal-description').textContent = mission.description;

    document.getElementById('mission-modal-backdrop').classList.remove('hidden');
    document.getElementById('mission-modal-panel').classList.remove('hidden');
}

function renderMissionMap(userData) {
  const missionMapContainer = document.getElementById("mission-map");
  if (!missionMapContainer) return; // Doble chequeo por si acaso

  missionMapContainer.innerHTML = ''; // Limpiar antes de renderizar

  missionCategories.forEach(category => {
    const categoryCard = document.createElement("div");
    categoryCard.className = "mission-category-card";
    
    categoryCard.innerHTML = `
      <div class="flex items-center mb-4">
        <span class="text-2xl mr-3">${category.icon}</span>
        <h3 class="text-lg font-bold text-gray-800">${category.title}</h3>
      </div>
    `;
    
    const missionsInCategory = missions.filter(m => m.categoryId === category.id);

    missionsInCategory.forEach(mission => {
        // Determinar el estado de la misión
        const isCompleted = userData.badges && userData.badges.includes(mission.id);
        const userMissionData = userData.missions ? userData.missions[mission.id] : null;
        const isInReview = userMissionData && userMissionData.status === 'in-review';
        const dependenciesMet = mission.dependencies.every(depId => userData.badges && userData.badges.includes(depId));
        const isLocked = !dependenciesMet;

        const missionElement = document.createElement('div');
        missionElement.className = 'mission-card';
        missionElement.id = `mission-${mission.id}`;

        let statusIcon = '';
        let canClick = false;

        if (isCompleted) {
            missionElement.classList.add('completed');
            statusIcon = '✅';
        } else if (isInReview) {
            missionElement.classList.add('in-review');
            statusIcon = '⏳';
        } else if (isLocked) {
            missionElement.classList.add('locked');
            statusIcon = '🔒';
        } else {
            missionElement.classList.add('unlocked');
            statusIcon = '🔑';
            canClick = true;
        }

        missionElement.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-semibold">${mission.title}</span>
                <span class="status-icon">${statusIcon}</span>
            </div>
            <p class="text-sm mt-1">+${mission.xp} XP</p>
        `;

        // Solo añadir el evento de click si la misión es clicable
        if (canClick) {
            missionElement.addEventListener('click', () => showMissionModal(mission));
        } 

        categoryCard.appendChild(missionElement);
    });

    missionMapContainer.appendChild(categoryCard);
  });
}
