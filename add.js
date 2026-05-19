const addUrl = "https://script.google.com/macros/s/AKfycbweDQoeUCJ6nwF-zasiRK3iDD77IhOM0Voi45TcghmWhHvkihOfW3FVRkJvCOwf3_91/exec";

document.getElementById("modeAjout").addEventListener("change", function(){
  document.getElementById("photoSection").style.display =
    this.value === "photo" ? "block" : "none";
});

document.getElementById("photoAvant").addEventListener("change", function(){
  previewImage(this, "previewAvant");
});

document.getElementById("photoArriere").addEventListener("change", function(){
  previewImage(this, "previewArriere");
});

function previewImage(input, previewId){
  const file = input.files[0];
  if(!file) return;

  const preview = document.getElementById(previewId);
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
}

async function lireOCR(){
  const avant = document.getElementById("photoAvant").files[0];
  const arriere = document.getElementById("photoArriere").files[0];
  const status = document.getElementById("ocrStatus");

  if(!avant && !arriere){
    alert("Ajoute au moins une photo.");
    return;
  }

  status.innerHTML = "🔍 Lecture OCR en cours...";

  let texteComplet = "";

  if(avant){
    const resultAvant = await Tesseract.recognize(avant, "fra+eng");
    texteComplet += "\n" + resultAvant.data.text;
  }

  if(arriere){
    const resultArriere = await Tesseract.recognize(arriere, "fra+eng");
    texteComplet += "\n" + resultArriere.data.text;
  }

  remplirFormulaireDepuisTexte(texteComplet);

  status.innerHTML = "✅ Lecture terminée. Vérifie les champs avant d’ajouter.";
}

function remplirFormulaireDepuisTexte(texte){
  const lignes = texte
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 2);

  const texteMin = texte.toLowerCase();

  const annee = texte.match(/\b(19[5-9][0-9]|20[0-3][0-9])\b/);
  if(annee){
    document.getElementById("millesime").value = annee[0];
  }

  if(texteMin.includes("champagne")){
    document.getElementById("type").value = "Champagne";
  }
  else if(texteMin.includes("rosé") || texteMin.includes("rose")){
    document.getElementById("type").value = "Rosé";
  }
  else if(texteMin.includes("blanc")){
    document.getElementById("type").value = "Blanc";
  }
  else if(texteMin.includes("rouge")){
    document.getElementById("type").value = "Rouge";
  }
  else if(texteMin.includes("mousseux") || texteMin.includes("prosecco") || texteMin.includes("spumante")){
    document.getElementById("type").value = "Mousseux";
  }
  else if(texteMin.includes("liquoreux") || texteMin.includes("moelleux")){
    document.getElementById("type").value = "Liquoreux";
  }

  if(texteMin.includes("75 cl") || texteMin.includes("750 ml") || texteMin.includes("0.75")){
    document.getElementById("contenance").value = "75 cl";
  }
  else if(texteMin.includes("37.5") || texteMin.includes("375 ml")){
    document.getElementById("contenance").value = "37.5 cl";
  }
  else if(texteMin.includes("150 cl") || texteMin.includes("magnum")){
    document.getElementById("contenance").value = "150 cl Magnum";
  }

  const regions = [
    "Valais","Bordeaux","Bourgogne","Champagne","Toscane","Piémont",
    "Rioja","Ribera del Duero","Alsace","Loire","Vénétie","Suisse",
    "France","Italie","Espagne"
  ];

  for(const region of regions){
    if(texteMin.includes(region.toLowerCase())){
      document.getElementById("region").value = region;
      break;
    }
  }

  if(!document.getElementById("vin").value && lignes.length){
    const ligneProbable = lignes.find(l =>
      !/\b(19[5-9][0-9]|20[0-3][0-9])\b/.test(l) &&
      !l.toLowerCase().includes("alcool") &&
      !l.toLowerCase().includes("contient") &&
      !l.toLowerCase().includes("mis en bouteille") &&
      l.length < 45
    );

    if(ligneProbable){
      document.getElementById("vin").value = ligneProbable;
    }
  }

  document.getElementById("particularites").value =
    (document.getElementById("particularites").value + " " + texte)
    .trim()
    .slice(0, 500);
}

function ajouterBouteille(){
  const vin = document.getElementById("vin").value.trim();
  const millesime = document.getElementById("millesime").value.trim();
  const type = document.getElementById("type").value.trim();
  const contenance = document.getElementById("contenance").value.trim();
  const quantite = document.getElementById("quantite").value.trim();
  const emplacement = document.getElementById("emplacement").value.trim();

  if(!vin || !millesime || !type || !contenance || !quantite || !emplacement){
    alert("⚠️ Merci de compléter tous les champs obligatoires.");
    return;
  }

  const data = new URLSearchParams();

  data.append("action", "addNew");
  data.append("vin", vin);
  data.append("millesime", millesime);
  data.append("type", type);
  data.append("region", document.getElementById("region").value);
  data.append("contenance", contenance);
  data.append("quantite", quantite);
  data.append("emplacement", emplacement);
  data.append("particularites", document.getElementById("particularites").value);
  data.append("offertPar", document.getElementById("offertPar").value);
  data.append("prix", document.getElementById("prix").value);
  data.append("notes", document.getElementById("notes").value);

  fetch(addUrl, {
    method:"POST",
    mode:"no-cors",
    body:data
  });

  alert("🍷 Bouteille ajoutée à la cave");
  window.location.href = "index.html";
}
