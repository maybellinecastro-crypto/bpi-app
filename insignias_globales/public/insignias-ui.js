
document.addEventListener('userReady', async () => {
    const userData = window.currentUserData;
    if (!userData) {
        console.error("Error: No se pudieron cargar los datos del usuario para actualizar las insignias.");
        return;
    }

    const userXP = document.getElementById('user-xp');
    if (userXP) {
        userXP.textContent = `XP: ${userData.xp || 0}`;
    }

    // Mapa de equivalencia de IDs antiguos a nuevos
    const badgeIdMap = {
        'challenge-de-nivelacion-global': 'explorador-global',
        'nivelacion-global': 'explorador-global',
        'publicacion-internacional': 'investigador-colaborador',
        'innovacion-internacional': 'lider-innovacion',
        'clase-espejo': 'comunicador-bilingue',
        'proyecto-coil': 'constructor-puentes',
        'interculturalidad': 'constructor-puentes',
        'proyecto-ods-global': 'lider-innovacion',
        'representacion-global': 'embajador-nunista',
        'estancia-academica': 'embajador-nunista'
    };

    // Mapea IDs y convierte todo a minúsculas para una comparación a prueba de errores de mayúsculas.
    const userBadges = (userData.badges || []).map(id => (badgeIdMap[id.toLowerCase().replace(/ /g, '-')] || id.toLowerCase().replace(/ /g, '-')));
    console.log("Insignias del usuario (en minúsculas y mapeadas):", userBadges);

    const badgeCards = document.querySelectorAll('.badge-card');

    badgeCards.forEach(card => {
        const badgeId = card.dataset.badgeId;
        if (userBadges.includes(badgeId)) {
            console.log(`El usuario tiene la insignia: ${badgeId}. Actualizando UI.`);
            const image = card.querySelector('.badge-image');
            const status = card.querySelector('.badge-status');

            if (image) {
                image.classList.remove('filter', 'grayscale');
            }
            if (status) {
                status.textContent = '¡Desbloqueada!';
                status.classList.remove('text-gray-500');
                status.classList.add('text-green-600', 'font-semibold');
            }
        }
    });
});
