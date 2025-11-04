
document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();
  const auth = firebase.auth();

  const rank1Container = document.getElementById("rank-1-container");
  const rank2Container = document.getElementById("rank-2-container");
  const rank3Container = document.getElementById("rank-3-container");
  const rankingList = document.getElementById("ranking-list");

  // Observador de autenticación para saber quién es el usuario actual
  auth.onAuthStateChanged(currentUser => {
    if (!currentUser) {
      // Si no hay usuario, simplemente mostramos el ranking sin resaltar a nadie
      renderRanking(null);
      return;
    }
    // Si hay un usuario, renderizamos el ranking y lo resaltamos
    renderRanking(currentUser);
  });

  function renderRanking(currentUser) {
    db.collection("users").orderBy("xp", "desc").get().then(snapshot => {
      if (snapshot.empty) {
        rankingList.innerHTML = "<p class='text-center text-gray-500'>Aún no hay participantes en el ranking.</p>";
        return;
      }

      const users = [];
      snapshot.forEach((doc, index) => {
        // Guardamos los datos del usuario y su posición en el ranking
        users.push({ id: doc.id, ...doc.data(), rank: index + 1 });
      });

      // Limpiar el contenido anterior
      rankingList.innerHTML = '';

      // --- Llenar el Podio (Top 3) ---
      const podiumUsers = users.slice(0, 3);
      
      if (podiumUsers[0]) {
        rank1Container.innerHTML = `
          <img src="${podiumUsers[0].avatar || 'https://i.imgur.com/sC211hW.png'}" alt="Avatar" class="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white">
          <span class="font-bold text-lg">1º</span>
          <p class="font-semibold truncate">${podiumUsers[0].name}</p>
          <p class="font-bold text-yellow-300 text-lg">${podiumUsers[0].xp} XP</p>
        `;
      }
      if (podiumUsers[1]) {
        rank2Container.innerHTML = `
          <img src="${podiumUsers[1].avatar || 'https://i.imgur.com/sC211hW.png'}" alt="Avatar" class="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-white">
          <span class="font-bold text-lg">2º</span>
          <p class="font-semibold truncate">${podiumUsers[1].name}</p>
          <p class="font-bold text-gray-200">${podiumUsers[1].xp} XP</p>
        `;
      }
      if (podiumUsers[2]) {
        rank3Container.innerHTML = `
          <img src="${podiumUsers[2].avatar || 'https://i.imgur.com/sC211hW.png'}" alt="Avatar" class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white">
          <span class="font-bold text-lg">3º</span>
          <p class="font-semibold truncate">${podiumUsers[2].name}</p>
          <p class="font-bold text-yellow-100">${podiumUsers[2].xp} XP</p>
        `;
      }

      // --- Llenar la Clasificación General (del 4º en adelante) ---
      const restOfUsers = users.slice(3);
      if (restOfUsers.length > 0) {
        restOfUsers.forEach(user => {
          const rankItem = document.createElement("div");
          
          // Si el usuario en la lista es el usuario que inició sesión, añadimos una clase para resaltarlo
          const isCurrentUser = currentUser && user.id === currentUser.uid;
          const highlightClass = isCurrentUser ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white';

          rankItem.className = `rank-item ${highlightClass}`;
          rankItem.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="font-bold text-gray-500 w-6 text-center">${user.rank}</span>
                <img src="${user.avatar || 'https://i.imgur.com/sC211hW.png'}" alt="Avatar" class="w-8 h-8 rounded-full">
                <span class="font-semibold text-gray-700">${user.name}</span>
            </div>
            <span class="font-bold text-blue-600">${user.xp} XP</span>
          `;
          rankingList.appendChild(rankItem);
        });
      } else if (users.length <= 3) {
        rankingList.innerHTML = "<p class='text-center text-gray-500'>No hay más participantes por ahora.</p>";
      }

    }).catch(error => {
      console.error("Error al cargar el ranking: ", error);
      rankingList.innerHTML = "<p class='text-center text-red-500'>No se pudo cargar el ranking.</p>";
    });
  }
});
