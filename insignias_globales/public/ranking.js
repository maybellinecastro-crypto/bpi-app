
// Este script unificado funciona tanto en el Dashboard como en la página de Ranking.
document.addEventListener('userReady', async () => {
    const db = firebase.firestore();
    const currentUserData = window.currentUserData;

    if (!currentUserData) {
        console.error("No se pueden cargar los rankings, los datos del usuario no están disponibles.");
        return;
    }

    try {
        const usersSnapshot = await db.collection('users').orderBy('xp', 'desc').get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });

        // --- Lógica para el Dashboard ---
        const profileRankEl = document.getElementById('profile-rank');
        const topGlobalRankingEl = document.getElementById('top-global-ranking');

        if (profileRankEl || topGlobalRankingEl) {
            // 1. Encontrar el ranking del usuario actual para el Dashboard
            const currentUserRank = users.findIndex(user => user.id === currentUserData.uid) + 1;
            if (profileRankEl) {
                profileRankEl.textContent = `#${currentUserRank > 0 ? currentUserRank : '-'}`;
            }

            // 2. Mostrar el Top 3 en el Dashboard
            if (topGlobalRankingEl) {
                const top3 = users.slice(0, 3);
                topGlobalRankingEl.innerHTML = ''; // Limpiar
                if (top3.length > 0) {
                    top3.forEach((user, index) => {
                        const rankItem = document.createElement('div');
                        rankItem.className = 'flex items-center justify-between p-2 rounded-lg';
                        rankItem.innerHTML = `
                            <div class="flex items-center gap-3">
                                <span class="font-bold text-lg text-gray-700">#${index + 1}</span>
                                <div>
                                    <p class="font-semibold text-gray-800">${user.name || 'Usuario Anónimo'}</p>
                                </div>
                            </div>
                            <span class="font-bold text-blue-600">${user.xp || 0} XP</span>
                        `;
                        topGlobalRankingEl.appendChild(rankItem);
                    });
                } else {
                    topGlobalRankingEl.innerHTML = '<p class="text-gray-500 text-center">Aún no hay ranking.</p>';
                }
            }
        }

        // --- Lógica para la Página de Ranking ---
        const rank1Container = document.getElementById("rank-1-container");
        const rankingList = document.getElementById("ranking-list");

        if (rank1Container || rankingList) {
            // 1. Llenar el Podio (Top 3)
            const rank2Container = document.getElementById("rank-2-container");
            const rank3Container = document.getElementById("rank-3-container");
            const podiumUsers = users.slice(0, 3);

            if (rank1Container && podiumUsers[0]) {
                 rank1Container.innerHTML = `
                    <img src="${podiumUsers[0].avatar || 'https://i.imgur.com/sC211hW.png'}" alt="Avatar" class="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white">
                    <span class="font-bold text-lg">1º</span> <p class="font-semibold truncate">${podiumUsers[0].name}</p> <p class="font-bold text-yellow-300 text-lg">${podiumUsers[0].xp} XP</p>`;
            }
            if (rank2Container && podiumUsers[1]) {
                 rank2Container.innerHTML = `
                    <img src="${podiumUsers[1].avatar || 'https://i.imgur.com/sC211hW.png'}" alt="Avatar" class="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-white">
                    <span class="font-bold text-lg">2º</span> <p class="font-semibold truncate">${podiumUsers[1].name}</p> <p class="font-bold text-gray-200">${podiumUsers[1].xp} XP</p>`;
            }
            if (rank3Container && podiumUsers[2]) {
                rank3Container.innerHTML = `
                    <img src="${podiumUsers[2].avatar || 'https://i.imgur.com/sC211hW.png'}" alt="Avatar" class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white">
                    <span class="font-bold text-lg">3º</span> <p class="font-semibold truncate">${podiumUsers[2].name}</p> <p class="font-bold text-yellow-100">${podiumUsers[2].xp} XP</p>`;
            }

            // 2. Llenar la Clasificación General (del 4º en adelante)
            if (rankingList) {
                rankingList.innerHTML = ''; // Limpiar
                const restOfUsers = users.slice(3);
                if (restOfUsers.length > 0) {
                    restOfUsers.forEach((user, index) => {
                        const rankItem = document.createElement("div");
                        const isCurrentUser = user.id === currentUserData.uid;
                        rankItem.className = `flex items-center justify-between p-3 rounded-lg ${isCurrentUser ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white'}`;
                        rankItem.innerHTML = `
                            <div class="flex items-center gap-4">
                                <span class="font-bold text-gray-500 w-6 text-center">${index + 4}</span>
                                <img src="${user.avatar || 'https://i.imgur.com/sC211hW.png'}" alt="Avatar" class="w-8 h-8 rounded-full">
                                <span class="font-semibold text-gray-700">${user.name || 'Usuario Anónimo'}</span>
                            </div>
                            <span class="font-bold text-blue-600">${user.xp || 0} XP</span>
                        `;
                        rankingList.appendChild(rankItem);
                    });
                } else {
                    rankingList.innerHTML = "<p class='text-center text-gray-500'>No hay más participantes por ahora.</p>";
                }
            }
        }

    } catch (error) {
        console.error("Error al cargar el ranking:", error);
    }
});
