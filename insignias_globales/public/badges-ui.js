
document.addEventListener("DOMContentLoaded", () => {
    // Espera a que el perfil del usuario se haya cargado
    document.addEventListener('userProfileLoaded', (event) => {
        const userData = event.detail;
        renderBadgesGallery(userData);
    });
});

// Definición de todas las insignias disponibles en la plataforma
const allBadges = [
    {
        id: 'explorador_global',
        title: 'Explorador Global',
        description: 'Completa las misiones introductorias y demuestra tu curiosidad por el mundo.',
        image: '/assets/badges/explorador_global.jpeg'
    },
    {
        id: 'investigador',
        title: 'Investigador Colaborador',
        description: 'Participa en proyectos de investigación y colabora con otros para descubrir nuevo conocimiento.',
        image: '/assets/badges/investigador.jpeg'
    },
    {
        id: 'comunicador_bilingue',
        title: 'Comunicador Bilingüe',
        description: 'Domina la comunicación en más de un idioma, rompiendo barreras culturales.',
        image: '/assets/badges/comunicador_bilingue.jpeg'
    },
    {
        id: 'constructor_puentes',
        title: 'Constructor de Puentes Culturales',
        description: 'Conecta con personas de diferentes culturas y fomenta el entendimiento mutuo.',
        image: '/assets/badges/constructor_puentes.jpeg'
    },
    {
        id: 'lider_innovacion',
        title: 'Líder de Innovación Global',
        description: 'Lidera proyectos innovadores con impacto global y social.',
        image: '/assets/badges/lider_innovacion.jpeg'
    },
    {
        id: 'embajador_nunista',
        title: 'Embajador Nuñista',
        description: 'Representa los valores de la Corporación Universitaria Rafael Núñez a nivel global.',
        image: '/assets/badges/embajador.jpeg'
    }
];

function renderBadgesGallery(userData) {
    const galleryContainer = document.getElementById("badges-gallery");
    if (!galleryContainer) return;

    galleryContainer.innerHTML = ''; // Limpiar la galería

    allBadges.forEach(badge => {
        // Comprueba si el usuario ha ganado esta insignia
        const hasBadge = userData.badges && userData.badges.includes(badge.id);

        const badgeCard = document.createElement("div");
        badgeCard.className = "badge-card text-center";

        const imageClass = hasBadge ? 'badge-image' : 'badge-image locked';

        badgeCard.innerHTML = `
            <img src="${badge.image}" alt="${badge.title}" class="${imageClass} mb-4">
            <h4 class="font-bold text-gray-800">${badge.title}</h4>
            <p class="text-sm text-gray-500 mt-1">${hasBadge ? '¡Conseguida!' : 'Bloqueada'}</p>
        `;

        // Opcional: Añadir un tooltip con la descripción
        badgeCard.title = badge.description;

        galleryContainer.appendChild(badgeCard);
    });
}
