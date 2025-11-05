
document.addEventListener('userReady', () => {
    const userData = window.currentUserData;

    // Elementos del perfil
    const profileName = document.getElementById('profile-name');
    const profileProgram = document.getElementById('profile-program');
    const profileRank = document.getElementById('profile-rank');
    const profileBadges = document.getElementById('profile-badges');
    const profileReviews = document.getElementById('profile-reviews');

    if (profileName) profileName.textContent = userData.name || 'Usuario';
    if (profileProgram) profileProgram.textContent = `${userData.program || 'Programa no definido'} - Semestre ${userData.semester || 'N/A'}`;
    if (profileBadges) profileBadges.textContent = userData.badges ? userData.badges.length : 0;
    
    // Lógica para el ranking y las revisiones (puedes añadirla aquí)
    if (profileRank) profileRank.textContent = '#' + (userData.rank || '-'); // Asumiendo que tienes un campo rank
    if (profileReviews) {
        // Necesitarías contar las misiones en revisión
        const db = firebase.firestore();
        db.collection('user_missions').where('userId', '==', userData.uid).where('status', '==', 'in-review').get().then(snapshot => {
            profileReviews.textContent = snapshot.size;
        });
    }
    
    // Lógica para el modal de edición de perfil
    const openModalBtn = document.getElementById('open-edit-profile-modal-btn');
    const closeModalBtn = document.getElementById('close-edit-profile-modal-btn');
    const modalBackdrop = document.getElementById('edit-profile-modal-backdrop');
    const modalPanel = document.getElementById('edit-profile-modal-panel');
    
    const editName = document.getElementById('edit-name');
    const editProgram = document.getElementById('edit-program');
    const editSemester = document.getElementById('edit-semester');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    if(openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            editName.value = userData.name;
            editProgram.value = userData.program;
            editSemester.value = userData.semester;
            modalBackdrop.classList.remove('hidden');
            modalPanel.classList.remove('hidden');
        });
    }

    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalBackdrop.classList.add('hidden');
            modalPanel.classList.add('hidden');
        });
    }

    if(saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            const newName = editName.value;
            const newProgram = editProgram.value;
            const newSemester = editSemester.value;
            
            try {
                const userRef = firebase.firestore().collection('users').doc(userData.uid);
                await userRef.update({
                    name: newName,
                    program: newProgram,
                    semester: newSemester
                });
                alert('¡Perfil actualizado con éxito!');
                window.location.reload(); // Recargar para ver los cambios
            } catch (error) {
                console.error("Error al guardar el perfil:", error);
                alert('Hubo un error al guardar. Inténtalo de nuevo.');
            }
        });
    }
});
