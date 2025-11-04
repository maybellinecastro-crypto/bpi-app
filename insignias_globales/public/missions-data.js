
const missionCategories = [
  {
    id: "gobernanza",
    title: "Gobernanza",
    icon: "🌐",
    color: "blue"
  },
  {
    id: "curriculo",
    title: "Currículo",
    icon: "-",
    color: "green"
  },
  {
    id: "investigacion",
    title: "Investigación",
    icon: "A",
    color: "purple"
  },
  {
    id: "extension",
    title: "Extension",
    icon: "🤝",
    color: "yellow"
  },
  {
    id: "movilidad",
    title: "Movilidad",
    icon: "✈️",
    color: "red"
  }
];

const missions = [
  {
    id: "nivelacion-global",
    categoryId: "gobernanza",
    title: "Challenge de Nivelación Global",
    xp: 50,
    dependencies: []
  },
  {
    id: "clase-espejo",
    categoryId: "curriculo",
    title: "Clase Espejo",
    xp: 60,
    dependencies: []
  },
  {
    id: "proyecto-coil",
    categoryId: "curriculo",
    title: "Proyecto COIL",
    xp: 100,
    dependencies: ["clase-espejo"]
  },
  {
    id: "publicacion-par-internacional",
    categoryId: "investigacion",
    title: "Publicación con Par Internacional",
    xp: 120,
    dependencies: []
  },
  {
    id: "proyecto-ods-global",
    categoryId: "extension",
    title: "Proyecto ODS Global",
    xp: 90,
    dependencies: []
  },
  {
    id: "estancia-academica-internacional",
    categoryId: "movilidad",
    title: "Estancia Académica Internacional",
    xp: 150,
    dependencies: []
  }
];
