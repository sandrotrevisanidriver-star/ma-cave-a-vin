const addUrl = "https://script.google.com/macros/s/AKfycbweDQoeUCJ6nwF-zasiRK3iDD77IhOM0Voi45TcghmWhHvkihOfW3FVRkJvCOwf3_91/exec";

document.getElementById("modeAjout").addEventListener("change", function(){

document.getElementById("photoSection").style.display =
this.value === "photo"
? "block"
: "none";

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

const resultAvant = await Tesseract.recognize(
avant,
"fra+eng"
);

texteComplet += "\n" + resultAvant.data.text;
}

if(arriere){

const resultArriere = await Tesseract.recognize(
arriere,
"fra+eng"
);

texteComplet += "\n" + resultArriere.data.text;
}

status.innerHTML =
"✅ OCR terminé. Sélectionne où envoyer chaque information.";

afficherOCR(texteComplet);

}

function afficherOCR(texte){

const lignes = texte
.split("\n")
.map(l => l.trim())
.filter(l => l.length > 2);

const container = document.getElementById("ocrResults");

container.innerHTML = "";

lignes.forEach((ligne, index)=>{

if(ligne.length < 3) return;

const div = document.createElement("div");

div.style.background = "white";
div.style.padding = "10px";
div.style.marginBottom = "10px";
div.style.borderRadius = "10px";

div.innerHTML = `

<div style="margin-bottom:8px;">
${ligne}
</div>

<select onchange="envoyerOCR(this, ${index})">

<option value="">Ignorer</option>

<option value="vin">Vin</option>

<option value="millesime">Millésime</option>

<option value="type">Couleur/Type</option>

<option value="region">Région/Pays</option>

<option value="contenance">Contenance</option>

<option value="particularites">Particularités</option>

<option value="notes">Notes perso</option>

</select>

`;

container.appendChild(div);

div.dataset.texte = ligne;

});

}

function envoyerOCR(select, index){

const texte =
document.querySelectorAll("#ocrResults div")[index]
.dataset.texte;

const champ = select.value;

if(!champ) return;

if(champ === "millesime"){

const annee = texte.match(/\b(19[5-9][0-9]|20[0-3][0-9])\b/);

if(annee){
document.getElementById("millesime").value = annee[0];
}

return;
}

if(champ === "type"){

const low = texte.toLowerCase();

if(low.includes("champagne")){
document.getElementById("type").value = "Champagne";
}
else if(low.includes("blanc")){
document.getElementById("type").value = "Blanc";
}
else if(low.includes("rouge")){
document.getElementById("type").value = "Rouge";
}
else if(low.includes("rosé") || low.includes("rose")){
document.getElementById("type").value = "Rosé";
}
else if(low.includes("mousseux")){
document.getElementById("type").value = "Mousseux";
}
else{
document.getElementById("type").value = "Autre";
}

return;
}

if(champ === "contenance"){

const low = texte.toLowerCase();

if(
low.includes("75 cl") ||
low.includes("75cl") ||
low.includes("750 ml")
){
document.getElementById("contenance").value = "75 cl";
}
else if(low.includes("37.5")){
document.getElementById("contenance").value = "37.5 cl";
}
else if(low.includes("magnum")){
document.getElementById("contenance").value = "150 cl Magnum";
}

return;
}

document.getElementById(champ).value = texte;

}

function ajouterBouteille(){

const vin = document.getElementById("vin").value.trim();
const millesime = document.getElementById("millesime").value.trim();
const type = document.getElementById("type").value.trim();
const contenance = document.getElementById("contenance").value.trim();
const quantite = document.getElementById("quantite").value.trim();
const emplacement = document.getElementById("emplacement").value.trim();

if(
!vin ||
!millesime ||
!type ||
!contenance ||
!quantite ||
!emplacement
){
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
