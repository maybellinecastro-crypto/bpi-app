let currentUser = null;

function updateLevel(xp) {
  if (xp >= 700) return "Embajador Global";
  if (xp >= 300) return "Viajero Global";
  return "Explorador Global";
}

function getXPForNextLevel(xp) {
  if (xp >= 700) return 700; // Máximo
  if (xp >= 300) return 700; // Siguiente: Embajador
  return 300; // Siguiente: Viajero
}

function renderBadges(badges) {
  const badgeIcons = {
    explorador: "🌍",
    comunicador_bilingue: "🗣️",
    constructor_puentes: "🤝",
    investigador_colab: "🔬",
    lider_innovacion: "💡",
    embajador_nunista: "✈️"
  };
  const container = document.getElementById('badges');
  container.innerHTML = '';
  badges.forEach(b => {
    const span = document.createElement('span');
    span.className = "badge-icon text-2xl";
    span.title = b;
    span.textContent = badgeIcons[b] || '🏅';
    container.appendChild(span);
  });
}

function updateXPBar(xp) {
  const nextLevelXP = getXPForNextLevel(xp);
  const percent = Math.min(100, (xp / nextLevelXP) * 100);
  document.getElementById('xpFill').style.width = `${percent}%`;
}

auth.onAuthStateChanged(async (user) => {
  if (!user) return window.location.href = "index.html";
  currentUser = user;
  const userDoc = await db.collection("users").doc(user.uid).get();
  const data = userDoc.data();
  
  document.getElementById('welcome').textContent = `¡Hola, ${data.name}!`;
  document.getElementById('xp').textContent = data.xp;
  document.getElementById('level').textContent = data.level;
  renderBadges(data.badges || []);
  updateXPBar(data.xp);
});