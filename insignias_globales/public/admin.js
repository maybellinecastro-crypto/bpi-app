
document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();

    // --- FUNCIÓN DE CARGA DE DATOS (SEEDING) DE UN SOLO USO ---
    async function seedMissionsData() {
        const seedFlagRef = db.collection('_internal_flags').doc('missions_seeded_v2');
        try {
            const seedFlagDoc = await seedFlagRef.get();
            if (seedFlagDoc.exists) {
                // console.log("La data de misiones ya fue cargada. Omitiendo.");
                return; // Si la bandera existe, no hacer nada.
            }

            alert("Se detectó que es la primera vez que se carga esta versión. Se procederá a escribir los datos de las misiones en la base de datos. Por favor, espera a que el proceso termine.");

            const missions = [
                { id: "nivelacion-global", name: "Challenge de Nivelación Global", description: "Participar en actividades introductorias o clases espejo internacionales.", xp: 50, badge: "Explorador Global", category: "Gobernanza", badgeUrl: "https://i.imgur.com/eQJ4kSP.png" },
                { id: "comunicacion-global", name: "Misión de Comunicación Global", description: "Realizar presentaciones o proyectos académicos en otro idioma.", xp: 100, badge: "Comunicador Bilingüe", category: "Currículo", badgeUrl: "https://i.imgur.com/your-badge-url.png" },
                { id: "colaboracion-internacional", name: "Misión de Colaboración Internacional", description: "Desarrollar un proyecto COIL o investigación conjunta.", xp: 100, badge: "Investigador Colaborador Global", category: "Investigación", badgeUrl: "https://i.imgur.com/your-badge-url.png" },
                { id: "innovacion-internacional", name: "Misión de Innovación Internacional", description: "Publicar o liderar proyectos con enfoque internacional.", xp: 100, badge: "Líder de Innovación Global", category: "Investigación", badgeUrl: "https://i.imgur.com/your-badge-url.png" },
                { id: "interculturalidad", name: "Misión de Interculturalidad", description: "Participar en actividades de inclusión y diversidad cultural.", xp: 100, badge: "Constructor de Puentes Culturales", category: "Extension", badgeUrl: "https://i.imgur.com/your-badge-url.png" },
                { id: "representacion-global", name: "Misión de Representación Global", description: "Actuar como embajador institucional o apoyar la movilidad académica.", xp: 100, badge: "Embajador Nuñista", category: "Movilidad", badgeUrl: "https://i.imgur.com/your-badge-url.png" }
            ];

            const batch = db.batch();
            missions.forEach(mission => {
                const docRef = db.collection("missions").doc(mission.id);
                batch.set(docRef, mission);
            });
            batch.set(seedFlagRef, { seededOn: new Date() }); // Poner la bandera para que no se repita

            await batch.commit();
            alert("¡Éxito! Todas las misiones han sido cargadas en la base de datos. La página se recargará para aplicar los cambios.");
            window.location.reload();

        } catch (error) {
            console.error("Error crítico durante la carga de datos:", error);
            alert("Error al cargar los datos de las misiones: " + error.message);
        }
    }

    // Ejecutar el cargador de datos al inicio
    seedMissionsData().then(() => {
        // El resto del script se ejecuta después de la verificación de la carga de datos
        initializeAdminPanel();
    });

    function initializeAdminPanel(){
        // --- Elementos del DOM ---
        const loader = document.getElementById('loader');
        const adminPanel = document.getElementById('admin-panel');
        const submissionsTableBody = document.getElementById('submissions-table-body');
        const noSubmissionsMessage = document.getElementById('no-submissions');
        const logoutButton = document.getElementById('logout-button');
        const proofModal = document.getElementById('proof-modal');
        const modalProofLink = document.getElementById('modal-proof-link');
        const modalCloseButton = document.getElementById('modal-close-button');

        // --- Evento de Usuario Listo ---
        document.addEventListener('userReady', () => {
            if (window.currentUserData && window.currentUserData.isAdmin) {
                loader.style.display = 'none';
                adminPanel.style.display = 'block';
                loadSubmissions();
            } else {
                window.location.href = '/index.html';
            }
        });

        // --- Listeners de UI ---
        if (logoutButton) logoutButton.addEventListener('click', () => window.signOut && window.signOut());
        if (proofModal && modalCloseButton) {
            modalCloseButton.addEventListener('click', () => proofModal.classList.add('hidden'));
            proofModal.addEventListener('click', (e) => e.target === proofModal && proofModal.classList.add('hidden'));
        }

        // --- Lógica Principal ---
        async function loadSubmissions() {
            const submissionsRef = db.collection('user_missions').where('status', '==', 'in-review');
            const snapshot = await submissionsRef.get();

            submissionsTableBody.innerHTML = '';
            noSubmissionsMessage.style.display = snapshot.empty ? 'block' : 'none';

            if(snapshot.empty) return;

            const promises = snapshot.docs.map(async (doc) => {
                const sub = doc.data();
                const [missionDoc, userDoc] = await Promise.all([
                    db.collection('missions').doc(sub.missionId).get(),
                    db.collection('users').doc(sub.userId).get()
                ]);
                const missionName = missionDoc.exists ? missionDoc.data().name : 'M. Desconocida';
                const userName = userDoc.exists ? userDoc.data().name : 'Usuario Desconocido';
                return { ...sub, id: doc.id, missionName, userName };
            });

            const submissions = await Promise.all(promises);
            submissions.forEach(addSubmissionRow);
        }

        function addSubmissionRow(sub) {
            const row = document.createElement('tr');
            row.id = `submission-${sub.id}`;
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${sub.userName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sub.missionName}</td>
                <td class="px-6 py-4"><button class="text-indigo-600 hover:text-indigo-900 font-medium view-proof-button">Ver Prueba</button></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium action-buttons">
                    <button data-action="approved" class="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600">Aprobar</button>
                    <button data-action="rejected" class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 ml-2">Rechazar</button>
                </td>
            `;
            submissionsTableBody.appendChild(row);

            row.querySelector('.view-proof-button').addEventListener('click', () => {
                modalProofLink.href = sub.evidenceUrl;
                modalProofLink.textContent = sub.evidenceUrl;
                proofModal.classList.remove('hidden');
            });

            row.querySelector('.action-buttons').addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (button) updateSubmissionStatus(sub.id, sub.userId, sub.missionId, button.dataset.action);
            });
        }

        async function updateSubmissionStatus(submissionId, userId, missionId, newStatus) {
            const submissionRef = db.collection('user_missions').doc(submissionId);
            const userRef = db.collection('users').doc(userId);
            const missionRef = db.collection('missions').doc(missionId);

            try {
                await db.runTransaction(async (transaction) => {
                    const subDoc = await transaction.get(submissionRef);
                    if (!subDoc.exists) throw new Error("La solicitud de misión ya no existe.");

                    let missionData = null;
                    if (newStatus === 'approved') {
                        const missionDoc = await transaction.get(missionRef);
                        if (!missionDoc.exists) throw new Error(`Misión original (ID: ${missionId}) no encontrada. No se puede aprobar.`);
                        missionData = missionDoc.data();
                    }

                    const userUpdatePayload = { [`missions.${missionId}.status`]: newStatus };
                    if (newStatus === 'approved' && missionData) {
                        if (missionData.xp) userUpdatePayload.xp = firebase.firestore.FieldValue.increment(missionData.xp);
                        if (missionData.badge) userUpdatePayload.badges = firebase.firestore.FieldValue.arrayUnion(missionData.badge);
                    }
                    
                    transaction.update(submissionRef, { status: newStatus });
                    transaction.update(userRef, userUpdatePayload);
                });

                document.getElementById(`submission-${submissionId}`).remove();
                if (submissionsTableBody.children.length === 0) noSubmissionsMessage.style.display = 'block';
                alert(`La misión ha sido marcada como '${newStatus}'.`);

            } catch (error) {
                console.error("Error en transacción:", error);
                alert(`Error al procesar la solicitud: ${error.message}`);
            }
        }
    }
});
