const MISSIONS = [
  { id: "clase_espejo", title: "Clase Espejo Internacional", xp: 80, badge: "comunicador_bilingue" },
  { id: "club_revista", title: "Club de Revista Global", xp: 70, badge: "comunicador_bilingue" },
  { id: "proyecto_coil", title: "Proyecto COIL con universidad aliada", xp: 120, badge: "investigador_colab" },
  { id: "movilidad_post", title: "Postulación a Movilidad", xp: 100, badge: "embajador_nunista" },
  { id: "movilidad_part", title: "Participación en Movilidad", xp: 200, badge: "embajador_nunista" },
  { id: "webinar_int", title: "Webinar Internacional", xp: 50, badge: "explorador" }
];

function loadMissions() {
  const container = document.getElementById('missions');
  container.innerHTML = '';
  MISSIONS.forEach(m => {
    const div = document.createElement('div');
    div.className = "bg-white p-4 rounded shadow";
    div.innerHTML = `
      <h3 class="font-semibold">${m.title}</h3>
      <p class="text-sm text-gray-600">+${m.xp} XP • Insignia: ${m.badge.replace(/_/g, ' ')}</p>
      <button onclick="submitMission('${m.id}')" class="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm">Enviar Evidencia</button>
    `;
    container.appendChild(div);
  });
}

async function submitMission(missionId) {
  const url = prompt("URL de evidencia (captura, certificado, etc.):");
  if (!url) return alert("Por favor ingresa una URL válida.");

  try {
    await db.collection("submissions").add({
      userId: currentUser.uid,
      missionId: missionId,
      evidenceUrl: url,
      status: "pending",
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("¡Evidencia enviada! Un coordinador la revisará pronto.");
  } catch (e) {
    alert("Error al enviar: " + e.message);
  }
}

// Cargar al inicio
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadMissions);
} else {
  loadMissions();
}