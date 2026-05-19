const sheetID = "1-FZVnDsaP6YKZy6R3b4dj5-4BzmefEccusgPYvRuy94";

function getSheetUrl(){
  return `https://opensheet.elk.sh/${sheetID}/Feuille%201`;
}

function getHistoryUrl(){
  return `https://opensheet.elk.sh/${sheetID}/Historique`;
}

const stockUrl = "https://script.google.com/macros/s/AKfycbweDQoeUCJ6nwF-zasiRK3iDD77IhOM0Voi45TcghmWhHvkihOfW3FVRkJvCOwf3_91/exec";

let allWines = [];

function texteVin(vin){
  return (
    (vin["Couleur/Type"] || "") + " " +
    (vin["Région/Pays"] || "") + " " +
    (vin["Vin"] || "") + " " +
    (vin["Particularités"] || "")
  ).toLowerCase();
}

function accords(vin){
  const texte = texteVin(vin);
  if(texte.includes("champagne")) return "🥂 Apéritif, fruits de mer, saumon fumé, sushi, volaille fine.";
  if(texte.includes("blanc")) return "🐟 Poisson, fondue, raclette, fromage frais, volaille, apéritif.";
  if(texte.includes("rouge") && texte.includes("bordeaux")) return "🥩 Viande rouge, entrecôte, agneau, gibier, fromages affinés.";
  if(texte.includes("rouge") && texte.includes("italie")) return "🍝 Pâtes, pizza, viande mijotée, charcuterie, parmesan.";
  if(texte.includes("rouge")) return "🍖 Viande rouge, grillades, plats mijotés, fromage.";
  return "🍽️ Accord polyvalent : apéritif, fromage, plat convivial.";
}

function cepages(vin){
  const texte = texteVin(vin);
  if(texte.includes("bordeaux")) return "Cabernet Sauvignon, Merlot";
  if(texte.includes("champagne")) return "Pinot Noir, Chardonnay, Meunier";
  if(texte.includes("bourgogne")) return "Pinot Noir ou Chardonnay";
  if(texte.includes("barolo")) return "Nebbiolo";
  if(texte.includes("rioja")) return "Tempranillo";
  if(texte.includes("sancerre")) return "Sauvignon Blanc";
  if(texte.includes("pinot noir")) return "Pinot Noir";
  if(texte.includes("petite arvine")) return "Petite Arvine";
  if(texte.includes("amarone")) return "Corvina, Rondinella, Molinara";
  if(texte.includes("chianti")) return "Sangiovese";
  if(texte.includes("blanc")) return "Assemblage de cépages blancs";
  if(texte.includes("rouge")) return "Assemblage de cépages rouges";
  return "Cépages à déterminer";
}

function garde(vin){
  const annee = parseInt(vin["Millésime"]);
  const texte = texteVin(vin);
  if(!annee) return "ℹ️ Garde non calculée.";

  const age = new Date().getFullYear() - annee;

  if(texte.includes("champagne")) return age >= 10 ? "🔔 À boire bientôt." : "✅ Encore quelques années possibles.";
  if(texte.includes("blanc")) return age >= 6 ? "🔔 À boire maintenant." : "✅ Encore frais.";
  if(texte.includes("bordeaux") || texte.includes("barolo") || texte.includes("grand cru")){
    if(age >= 12) return "🔔 Très belle fenêtre de dégustation.";
    if(age >= 6) return "✅ Peut commencer à être ouvert.";
    return "⏳ Peut encore attendre.";
  }
  if(texte.includes("rouge")){
    if(age >= 8) return "🔔 À boire bientôt.";
    if(age >= 4) return "✅ Bon moment pour ouvrir.";
    return "⏳ Encore jeune.";
  }
  return "ℹ️ À vérifier selon le vin.";
}

function updateStats(wines){
  let total = 0, rouges = 0, blancs = 0, champagnes = 0, mousseux = 0, liquoreux = 0;

  wines.forEach(vin=>{
    const qte = Math.max(0, Number(vin["Quantité"] || 0));
    const type = (vin["Couleur/Type"] || "").toLowerCase();

    total += qte;
    if(type.includes("rouge")) rouges += qte;
    if(type.includes("blanc")) blancs += qte;
    if(type.includes("champagne")) champagnes += qte;
    if(type.includes("mousseux") || type.includes("pétillant") || type.includes("petillant")) mousseux += qte;
    if(type.includes("liquoreux") || type.includes("moelleux") || type.includes("doux")) liquoreux += qte;
  });

  document.getElementById("statsBox").innerHTML = `
    🍾 Total : ${total} bouteilles<br>
    🍷 Rouges : ${rouges}<br>
    🥂 Blancs : ${blancs}<br>
    🍾 Champagnes : ${champagnes}<br>
    ✨ Mousseux : ${mousseux}<br>
    🍯 Liquoreux : ${liquoreux}
  `;
}

async function loadHistory(){
  try{
    const response = await fetch(getHistoryUrl(), { cache: "no-store" });
    const data = await response.json();
    const derniers = data.slice(-5).reverse();

    document.getElementById("historyBox").innerHTML = `
      <h3>📜 Derniers mouvements</h3>
      ${
        derniers.length
        ? derniers.map(item => `
          <div>
            ${item["Date"] || ""}<br>
            <b>${item["Action"] || ""}</b> — ${item["Vin"] || ""}<br>
            ${item["Emplacement source"] || ""}
            ${item["Emplacement destination"] ? " → " + item["Emplacement destination"] : ""}
          </div><hr>
        `).join("")
        : "Aucun mouvement pour l’instant."
      }
    `;
  }
  catch(error){
    document.getElementById("historyBox").innerHTML =
      "Historique indisponible pour le moment.";
  }
}

function scoreRepas(vin, repas){
  const texte = texteVin(vin);
  let score = 0;

  if(repas === "viande" && texte.includes("rouge")) score += 3;
  if(repas === "viande" && (texte.includes("bordeaux") || texte.includes("barolo"))) score += 2;
  if(repas === "poisson" && texte.includes("blanc")) score += 3;
  if(repas === "poisson" && texte.includes("champagne")) score += 2;
  if(repas === "fromage" && (texte.includes("blanc") || texte.includes("rouge"))) score += 2;
  if(repas === "fromage" && texte.includes("suisse")) score += 2;
  if(repas === "apero" && (texte.includes("champagne") || texte.includes("blanc"))) score += 3;
  if(repas === "italien" && (texte.includes("italie") || texte.includes("chianti") || texte.includes("amarone"))) score += 4;
  if(repas === "italien" && texte.includes("rouge")) score += 1;
  if(repas === "dessert" && (texte.includes("doux") || texte.includes("moelleux"))) score += 4;
  if(repas === "dessert" && texte.includes("champagne")) score += 1;

  return score;
}

function afficherSuggestion(vin, prefixe){
  document.getElementById("suggestionBox").innerHTML = `
    ${prefixe} <b>${vin["Vin"]}</b><br>
    ${vin["Millésime"] || ""} • ${vin["Couleur/Type"] || ""} • ${vin["Région/Pays"] || ""}<br>
    ${garde(vin)}<br>
    ${accords(vin)}<br><br>
    <button onclick='openModal(allWines[${allWines.indexOf(vin)}])'>
      Voir la fiche complète
    </button>
  `;
}

function suggestMeal(){
  const repas = document.getElementById("mealSelect").value;
  if(!repas) return;

  const choix = allWines
    .filter(v => Number(v["Quantité"] || 0) > 0)
    .map(v => ({vin:v, score:scoreRepas(v, repas)}))
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score)[0];

  if(choix){
    afficherSuggestion(choix.vin, "🍽️ Suggestion :");
  } else {
    document.getElementById("suggestionBox").innerHTML =
      "Aucun accord évident trouvé dans la cave.";
  }
}

function suggestTonight(){
  const dispo = allWines.filter(v => Number(v["Quantité"] || 0) > 0);
  if(dispo.length === 0) return;

  const priorite = dispo.filter(v => garde(v).includes("🔔"));
  const liste = priorite.length ? priorite : dispo;
  const vin = liste[Math.floor(Math.random() * liste.length)];

  afficherSuggestion(vin, "🤖 Ce soir, je proposerais :");
}

function openModal(vin){
  document.getElementById("modalContent").innerHTML = `
    <h2>${vin["Vin"] || ""}</h2>

    <div class="info">
      🍷 Type : ${vin["Couleur/Type"] || ""}<br>
      📅 Millésime : ${vin["Millésime"] || ""}<br>
      📦 Stock : ${vin["Quantité"] || ""}<br>
      🍾 Contenance : ${vin["Contenance"] || ""}<br>
      🌍 Région/Pays : ${vin["Région/Pays"] || ""}<br>
      📍 Emplacement : ${vin["Emplacement"] || ""}<br>
      ⭐ Particularités : ${vin["Particularités"] || ""}
    </div>

    <h3>🔔 Alerte de garde</h3>
    <div class="info">${garde(vin)}</div>

    <h3>🍇 Cépages</h3>
    <div class="info">${cepages(vin)}</div>

    <h3>🍷 Accords mets/vins</h3>
    <div class="info">${accords(vin)}</div>

    <a class="photoLink" href="https://www.google.com/search?tbm=isch&q=${encodeURIComponent((vin['Vin'] || '') + ' ' + (vin['Millésime'] || ''))}" target="_blank">
      📸 Chercher une photo
    </a>

    <button class="close gold" onclick='gererBouteille(${JSON.stringify(vin["Vin"] || "")}, ${JSON.stringify(vin["Emplacement"] || "")})'>
      📦 Gérer cette bouteille
    </button>

    <a class="photoLink chatLink"
    href="https://chat.openai.com/?q=${encodeURIComponent('Donne-moi des informations détaillées sur le vin ' + vin['Vin'] + ' ' + vin['Millésime'])}"
    target="_blank">
      🤖 Demander plus d'infos à ChatGPT
    </a>

    <button class="close" onclick="closeModal()">
      Fermer la fiche
    </button>
  `;

  document.getElementById("wineModal").style.display = "block";
}

function closeModal(){
  document.getElementById("wineModal").style.display = "none";
}

async function loadWines(){
  const response = await fetch(getSheetUrl(), { cache: "no-store" });
  const data = await response.json();

  allWines = data;

  updateStats(allWines);
  buildCaveSelect();
  renderWines(allWines);
  loadHistory();
}

function buildCaveSelect(){
  const caveSelect = document.getElementById("caveSelect");
  caveSelect.innerHTML = `<option value="">🏠 Toutes les caves</option>`;

  const caves = [...new Set(
    allWines
      .map(v => v["Emplacement"])
      .filter(Boolean)
  )];

  caves.sort();

  caves.forEach(cave=>{
    const option = document.createElement("option");
    option.value = cave;
    option.textContent = "🏠 " + cave;
    caveSelect.appendChild(option);
  });
}

function renderWines(wines){
  const wineList = document.getElementById("wineList");
  wineList.innerHTML = "";

  wines
    .filter(vin => Number(vin["Quantité"] || 0) > 0)
    .forEach(vin=>{
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h2>${vin["Vin"] || ""}</h2>
        <div class="info">
          🍷 ${vin["Couleur/Type"] || ""}<br>
          📅 ${vin["Millésime"] || ""}<br>
          📦 Stock : ${vin["Quantité"] || ""}<br>
          🌍 ${vin["Région/Pays"] || ""}<br>
          📍 ${vin["Emplacement"] || ""}
          ${garde(vin).includes("🔔") ? `<div class="alert">${garde(vin)}</div>` : ""}
        </div>
      `;

      card.onclick = () => openModal(vin);
      wineList.appendChild(card);
    });
}

function applyFilters(){
  const cave = document.getElementById("caveSelect").value;
  const search = document.getElementById("search").value.toLowerCase();

  const filtered = allWines.filter(vin=>{
    const matchCave = cave === "" || vin["Emplacement"] === cave;
    const matchSearch = JSON.stringify(vin).toLowerCase().includes(search);
    return matchCave && matchSearch;
  });

  renderWines(filtered);
  updateStats(filtered);
}

function gererBouteille(nomVin, emplacement){
  const choix = prompt(
    "Que veux-tu faire avec cette bouteille ?\n\n" +
    "1 = Consommée 🍷\n" +
    "2 = Offerte 🎁\n" +
    "3 = Déplacer 🔄\n\n" +
    nomVin
  );

  if(!choix) return;

  let action = "";
  let destination = "";

  if(choix === "1"){
    action = "consume";
  }
  else if(choix === "2"){
    action = "gift";
  }
  else if(choix === "3"){
    const choixCave = prompt(
      "Déplacer vers quelle cave ?\n\n" +
      "1 = Frigo buanderie\n" +
      "2 = Cave buanderie\n" +
      "3 = Cave à voûte"
    );

    if(!choixCave) return;

    if(choixCave === "1") destination = "Frigo buanderie";
    else if(choixCave === "2") destination = "Cave buanderie";
    else if(choixCave === "3") destination = "Cave à voûte";
    else{
      alert("Choix invalide.");
      return;
    }

    action = "move";
  }
  else{
    alert("Choix invalide.");
    return;
  }

  if(confirm(
    "🍷 Gestion bouteille\n\n" +
    "Vin : " + nomVin + "\n" +
    "Emplacement actuel : " + emplacement + "\n" +
    (action === "move" ? "Nouvel emplacement : " + destination + "\n" : "") +
    "\nConfirmer l'action ?"
  )){
    fetch(stockUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body:
        "vin=" + encodeURIComponent(nomVin) +
        "&emplacement=" + encodeURIComponent(emplacement) +
        "&action=" + encodeURIComponent(action) +
        "&destination=" + encodeURIComponent(destination)
    });

    alert("Modification enregistrée 🍷");
    closeModal();

    setTimeout(()=>{
      loadWines();
    },3000);

    setTimeout(()=>{
      loadWines();
    },7000);
  }
}

function filterWine(term){
  document.querySelectorAll(".card").forEach(card=>{
    card.style.display = card.innerText.includes(term) || term === "" ? "block" : "none";
  });
}

document.getElementById("search").addEventListener("keyup", applyFilters);

document.getElementById("wineModal").addEventListener("click", function(e){
  if(e.target.id === "wineModal"){
    closeModal();
  }
});

loadWines();