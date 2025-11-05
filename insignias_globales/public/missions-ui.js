
// --- Variables y funciones globales ---
let currentMission = null;

function showMissionModal(mission) {
    currentMission = mission;
    document.getElementById('mission-modal-title').textContent = mission.name;
    document.getElementById('mission-modal-description').textContent = mission.description;
    document.getElementById('mission-modal-backdrop').classList.remove('hidden');
    document.getElementById('mission-modal-panel').classList.remove('hidden');
    // Limpiar el input de la URL por si se abre de nuevo
    const proofUrlInput = document.getElementById('mission-proof-url');
    if (proofUrlInput) proofUrlInput.value = '';
}

function renderMissionMap(userData, allMissions, missionCategories) {
    const missionMapContainer = document.getElementById("mission-map");
    if (!missionMapContainer) return;

    missionMapContainer.innerHTML = '';

    missionCategories.forEach(category => {
        const categoryCard = document.createElement("div");
        categoryCard.className = "mission-category-card";
        
        categoryCard.innerHTML = `
          <div class="flex items-center mb-4">
            <span class="text-2xl mr-3">${category.icon}</span>
            <h3 class="text-lg font-bold text-gray-800">${category.title}</h3>
          </div>
        `;
        
        const missionsInCategory = allMissions.filter(m => m.category === category.title);

        missionsInCategory.forEach(mission => {
            const userMissions = userData.missions || {};
            const userMissionData = userMissions[mission.id];
            const status = userMissionData ? userMissionData.status : null;
            
            // Las dependencias se cumplen si el usuario tiene la INSIGNIA de la misión requerida.
            const userBadges = userData.badges || [];
            const dependenciesMet = (mission.dependencies || []).every(depId => {
                const dependencyMission = allMissions.find(m => m.id === depId);
                return dependencyMission && userBadges.includes(dependencyMission.badge);
            });

            const missionElement = document.createElement('div');
            missionElement.className = 'mission-card';
            missionElement.id = `mission-${mission.id}`;

            let statusIcon = '';
            let canClick = false;

            if (status === 'approved') {
                missionElement.classList.add('status-approved');
                statusIcon = '✅';
            } else if (status === 'in-review') {
                missionElement.classList.add('status-in-review');
                statusIcon = '⏳';
            } else if (status === 'rejected') {
                missionElement.classList.add('status-rejected');
                statusIcon = '❌';
                canClick = true; // Puede volver a intentarlo
            } else if (!dependenciesMet) {
                missionElement.classList.add('status-locked');
                statusIcon = '🔒';
            } else { // Desbloqueada y disponible
                missionElement.classList.add('status-unlocked');
                statusIcon = '🔑';
                canClick = true;
            }

            missionElement.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="font-semibold">${mission.name}</span>
                    <span class="status-icon">${statusIcon}</span>
                </div>
                <p class="text-sm mt-1">+${mission.xp} XP</p>
            `;

            if (canClick) {
                missionElement.addEventListener('click', () => showMissionModal(mission));
            } 

            categoryCard.appendChild(missionElement);
        });

        missionMapContainer.appendChild(categoryCard);
    });
}

// --- Lógica Principal de la Página de Misiones ---
document.addEventListener('userReady', async () => {
    const userData = window.currentUserData;
    const db = firebase.firestore();

    // 1. Cargar todas las misiones desde la DB para tener la info más reciente
    const missionsSnapshot = await db.collection('missions').get();
    const allMissions = missionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Definir categorías (esto podría venir de la DB también en un futuro)
    const missionCategories = [
        { id: "gobernanza", title: "Gobernanza", icon: "🌐" },
        { id: "curriculo", title: "Currículo", icon: "- C" },
        { id: "investigacion", title: "Investigación", icon: "A" },
        { id: "extension", title: "Extension", icon: "🤝" },
        { id: "movilidad", title: "Movilidad", icon: "✈️" }
    ];

    // 2. Renderizar el mapa de misiones con los datos del usuario y de las misiones
    renderMissionMap(userData, allMissions, missionCategories);

    // 3. Configurar el modal
    const modalBackdrop = document.getElementById('mission-modal-backdrop');
    const modalPanel = document.getElementById('mission-modal-panel');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const completeMissionBtn = document.getElementById('complete-mission-btn');

    const closeModal = () => {
        if (modalBackdrop && modalPanel) {
            modalBackdrop.classList.add('hidden');
            modalPanel.classList.add('hidden');
        }
    };

    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    // 4. Lógica para enviar misión a revisión
    if (completeMissionBtn) {
        completeMissionBtn.addEventListener('click', async () => {
            if (!currentMission) return;

            const proofUrlInput = document.getElementById('mission-proof-url');
            const evidenceUrl = proofUrlInput.value;

            if (!evidenceUrl || !evidenceUrl.startsWith('http')) {
                alert("Por favor, ingresa una URL válida como evidencia.");
                return;
            }

            const userId = userData.uid;
            if (!userId) {
                alert("Error: No se ha podido identificar al usuario.");
                return;
            }

            completeMissionBtn.disabled = true;
            completeMissionBtn.textContent = 'Enviando...';
            
            const timestamp = firebase.firestore.FieldValue.serverTimestamp();

            try {
                // Usamos el ID de la misión para la referencia del documento, evitando duplicados.
                const submissionRef = db.collection("user_missions").doc(`${userId}_${currentMission.id}`);
                
                await db.runTransaction(async (transaction) => {
                    // Actualizar (o crear) el documento en user_missions
                    transaction.set(submissionRef, {
                        userId: userId,
                        userName: userData.name,
                        missionId: currentMission.id,
                        missionName: currentMission.name,
                        status: 'in-review',
                        evidenceUrl: evidenceUrl,
                        submittedAt: timestamp,
                        updatedAt: timestamp
                    }, { merge: true });

                    // Actualizar el objeto anidado en el perfil del usuario
                    const userRef = db.collection("users").doc(userId);
                    const missionUpdate = {};
                    missionUpdate[`missions.${currentMission.id}`] = { status: 'in-review', submittedAt: timestamp };
                    transaction.update(userRef, missionUpdate);
                });

                alert("¡Misión enviada para revisión con éxito!");
                closeModal();
                
                // Recargamos los datos del usuario para reflejar el cambio
                const updatedUserDoc = await db.collection("users").doc(userId).get();
                window.currentUserData = { uid: userId, ...updatedUserDoc.data() };
                renderMissionMap(window.currentUserData, allMissions, missionCategories);

            } catch (error) {
                console.error("Error al enviar la misión:", error);
                alert("Hubo un error al enviar tu misión. Por favor, inténtalo de nuevo.");
            } finally {
                completeMissionBtn.disabled = false;
                completeMissionBtn.textContent = 'Completar Misión';
                if (proofUrlInput) proofUrlInput.value = '';
            }
        });
    }
});
