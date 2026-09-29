// Chemins centralisés des photos (déposées dans public/images/, voir le README).
export const photos = {
  hero: "/images/hero-champ-montagne.jpg",
  phone: "/images/main-telephone.jpg",
  villageAerial: "/images/village-aerien.jpg",
  herders: "/images/troupeau-bergers.jpg",
  milking: "/images/traite-vache.jpg",
  crop: "/images/champ-ble-agadez.jpg",
  water: "/images/irrigation-eau.jpg",
} as const;

// Galerie « le terrain » — le 1er élément est mis en avant (grande vignette).
export const galleryPhotos = [
  { src: photos.herders, key: "herders" },
  { src: photos.water, key: "water" },
  { src: photos.crop, key: "crop" },
  { src: photos.villageAerial, key: "villageAerial" },
  { src: photos.milking, key: "milking" },
  { src: photos.phone, key: "phone" },
] as const;
