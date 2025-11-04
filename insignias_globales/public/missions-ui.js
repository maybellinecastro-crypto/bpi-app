
// --- Variables y Lógica del Modal ---
let currentMission = null; // Guardará la misión seleccionada

document.addEventListener("DOMContentLoaded", () => {
  const modalBackdrop = document.getElementById('mission-modal-backdrop');
  const modalPanel = document.getElementById('mission-modal-panel');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const completeMissionBtn = document.getElementById('complete-mission-btn');

  // Función para cerrar el modal
  const closeModal = () => {
    modalBackdrop.classList.add('hidden');
    modalPanel.classList.add('hidden');
  };

  // Eventos para cerrar el modal
  closeModalBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  // Evento para el botón de completar misión
  completeMissionBtn.addEventListener('click', () => {
    if (!currentMission) return;

    const proofUrl = document.getElementById('mission-proof-url').value;
    if (!proofUrl || !proofUrl.startsWith('http')) {
        alert("Por favor, ingresa una URL válida como evidencia.");
        return;
    }

    console.log(`Completando misión: ${currentMission.title}`);
    console.log(`Evidencia (URL): ${proofUrl}`);
    
    // Aquí, en el futuro, llamaremos a Firebase para guardar el progreso.
    alert("¡Misión enviada para revisión!");
    closeModal();
    document.getElementById('mission-proof-url').value = ''; // Limpiar input
  });

  // --- Lógica de Renderizado de Misiones ---
  document.addEventListener('userProfileLoaded', (event) => {
    const userData = event.detail;
    renderMissionMap(userData);
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
  if (!missionMapContainer) return;

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
        const isCompleted = userData.badges && userData.badges.includes(mission.id);
        const dependenciesMet = mission.dependencies.every(depId => userData.badges && userData.badges.includes(depId));
        const isLocked = !dependenciesMet;

        const missionElement = document.createElement('div');
        missionElement.className = 'mission-card';

        let statusIcon = '';
        if (isCompleted) {
            missionElement.classList.add('completed');
            statusIcon = '✅';
        } else if (isLocked) {
            missionElement.classList.add('locked');
            statusIcon = '🔒';
        } else {
            missionElement.classList.add('unlocked');
            statusIcon = '🔑';
        }

        missionElement.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-semibold">${mission.title}</span>
                <span>${statusIcon}</span>
            </div>
            <p class="text-sm mt-1">+${mission.xp} XP</p>
        `;

        // Solo añadir el evento de click si la misión no está bloqueada
        if (!isLocked) {
            missionElement.addEventListener('click', () => showMissionModal(mission));
        } 

        categoryCard.appendChild(missionElement);
    });

    missionMapContainer.appendChild(categoryCard);
  });
}
