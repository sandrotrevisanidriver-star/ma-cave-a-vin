const addUrl = "https://script.google.com/macros/s/AKfycbweDQoeUCJ6nwF-zasiRK3iDD77IhOM0Voi45TcghmWhHvkihOfW3FVRkJvCOwf3_91/exec";

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
