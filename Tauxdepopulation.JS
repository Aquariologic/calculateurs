// =====================================
// Gestion des paramètres de cuve
// =====================================

const longueurInput = document.getElementById("longueur");
const largeurInput = document.getElementById("largeur");
const hauteurInput = document.getElementById("hauteur");

const surfaceCell = document.getElementById("surface");
const volumeCell = document.getElementById("volume");
const svCell = document.getElementById("SV");

let volume = null;
let sv = null;
let surface = null;

function updateTable() {
  const longueur = parseFloat(longueurInput.value);
  const largeur = parseFloat(largeurInput.value);
  const hauteur = parseFloat(hauteurInput.value);

  if (!isNaN(longueur) && !isNaN(largeur) && !isNaN(hauteur)) {
    surface = longueur * largeur;
    volume = (longueur * largeur * hauteur) / 1000;
    sv = surface / volume;
    surfaceCell.textContent = surface.toFixed(0) + " cm²";
    volumeCell.textContent = volume.toFixed(0) + " L";
    svCell.textContent = sv.toFixed(2);
  } else {
    surfaceCell.textContent = "—";
    volumeCell.textContent = "—";
    svCell.textContent = "—";
  }
}

longueurInput.addEventListener("input", updateTable);
largeurInput.addEventListener("input", updateTable);
hauteurInput.addEventListener("input", updateTable);

// =====================================
// Paramètres environnementaux
// =====================================

const csvTemperatureURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjr9Rud15Xf_L6Id-0VPWNfdsl4C_BsNkBsYaqaihXY6zLzaE_UqRYfXUvLo4JtWIh4GG0uR1RzJ9V/pub?gid=206780190&single=true&output=csv";
const csvFiltrationURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjr9Rud15Xf_L6Id-0VPWNfdsl4C_BsNkBsYaqaihXY6zLzaE_UqRYfXUvLo4JtWIh4GG0uR1RzJ9V/pub?gid=746736312&single=true&output=csv";

const temperatureSelect = document.getElementById("temperatureSelect");
const filtrationSelect = document.getElementById("filtrationSelect");

const cellVtemperature = document.getElementById("Vtemperature");
const cellVfiltration = document.getElementById("Vfiltration");
const cellFfiltre = document.getElementById("Ffiltre");

let Vtemperature = null;
let Vfiltration = null;
let Ffiltre = null;

function updateTableEnv() {
  if (Vtemperature !== null) cellVtemperature.textContent = Vtemperature;
  if (Vfiltration !== null) cellVfiltration.textContent = Vfiltration;
  if (Ffiltre !== null) cellFfiltre.textContent = Ffiltre.toFixed(2);
}

// Température
fetch(csvTemperatureURL)
  .then(response => response.text())
  .then(csv => {
    const lignes = csv.split(/\r?\n/).slice(1).filter(l => l.trim());
    temperatureSelect.innerHTML = '<option disabled selected>Choisir température</option>';
    lignes.forEach(ligne => {
      const [temp, val] = ligne.split(",");
      if (temp && val) {
        temperatureSelect.innerHTML += `<option value="${val}">${temp} °C</option>`;
      }
    });
    temperatureSelect.addEventListener('change', (event) => {
      Vtemperature = event.target.value;
      updateTableEnv();
      calculerFacteurs();
      calculerTauxPopulation();
      mettreAJourTableau1Et2();
    });
  });

// Filtration
fetch(csvFiltrationURL)
  .then(response => response.text())
  .then(csv => {
    const lignes = csv.split(/\r?\n/).slice(1).filter(l => l.trim());
    filtrationSelect.innerHTML = '<option disabled selected>Choisir débit</option>';
    lignes.forEach(ligne => {
      const [debit, val] = ligne.split(",");
      if (debit && val) {
        filtrationSelect.innerHTML += `<option value="${val}">${debit}</option>`;
      }
    });
    filtrationSelect.addEventListener('change', (event) => {
      Vfiltration = parseFloat(event.target.value);
      Ffiltre = Vfiltration / 100;
      updateTableEnv();
      calculerFacteurs();
      calculerTauxPopulation();
      mettreAJourTableau1Et2();
    });
  });

// =====================================
// Gestion Espèces et Population
// =====================================

const csvEspecesURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjr9Rud15Xf_L6Id-0VPWNfdsl4C_BsNkBsYaqaihXY6zLzaE_UqRYfXUvLo4JtWIh4GG0uR1RzJ9V/pub?gid=1826651703&single=true&output=csv";
let especesData = [];
const containerPopulation = document.getElementById("population-container");
const boutonAjouter = document.getElementById("ajouter-espece");
const texteBouton = document.getElementById("texte-bouton-espece");

boutonAjouter.disabled = true;
texteBouton.textContent = "Chargement des espèces...";

function boutonPret() {
  boutonAjouter.disabled = false;
  texteBouton.textContent = "+ une espèce";
}

function chargerEspeces() {
  fetch(csvEspecesURL)
    .then(response => response.text())
    .then(csv => {
      const lignes = csv.split(/\r?\n/).slice(1).filter(l => l.trim());
      especesData = lignes.map(ligne => {
        const colonnes = ligne.split(",");
        return {
          esp: colonnes[0],
          Lmax: parseFloat(colonnes[1]),
          nbMin: parseInt(colonnes[2]),
          SurfaceMin: parseFloat(colonnes[3]),
          VolumeMin: parseFloat(colonnes[4]),
          TempCible: parseFloat(colonnes[5]),
          TempMin: parseFloat(colonnes[6]),
          TempMax: parseFloat(colonnes[7]),
          Meta: parseFloat(colonnes[9]),
          Ftmax: parseFloat(colonnes[10])
        };
      });
      boutonPret();
      console.log("Espèces chargées:", especesData.length);
    });
}
chargerEspeces();

function ajouterLigneEspece() {
  const ligne = document.createElement("div");
  ligne.className = "ligne-espece";
  ligne.style.marginBottom = "10px";

  const searchContainer = document.createElement("div");
  searchContainer.style.display = "flex";
  searchContainer.style.flexDirection = "column";
  searchContainer.style.gap = "4px";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Rechercher une espèce...";
  searchInput.style.marginBottom = "4px";
  searchInput.style.borderRadius = "5px";
  searchInput.style.padding = "8px";
  searchInput.style.border = "1px solid #ccc";
  searchInput.style.fontFamily = "inherit";

  const select = document.createElement("select");
  select.innerHTML = '<option disabled selected>Choisir espèce</option>';
  especesData.forEach(espece => {
    const option = document.createElement("option");
    option.value = espece.esp;
    option.textContent = espece.esp;
    select.appendChild(option);
  });

  searchInput.addEventListener('input', () => {
    const filtre = searchInput.value.trim().toLowerCase();
    const valeurSelectionnee = select.value;
    select.innerHTML = '<option disabled selected>Choisir espèce</option>';
    especesData
      .filter(espece => espece.esp.toLowerCase().includes(filtre))
      .forEach(espece => {
        const option = document.createElement("option");
        option.value = espece.esp;
        option.textContent = espece.esp;
        select.appendChild(option);
      });
    if ([...select.options].some(o => o.value === valeurSelectionnee)) {
      select.value = valeurSelectionnee;
    } else {
      select.selectedIndex = 0;
    }
    calculerFacteurs();
    calculerTauxPopulation();
    mettreAJourTableau1Et2();
  });

  select.addEventListener('change', () => {
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));
    calculerFacteurs();
    calculerTauxPopulation();
    mettreAJourTableau1Et2();
  });

  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(select);

  const inputTaille = document.createElement("input");
  inputTaille.type = "number";
  inputTaille.placeholder = "Taille actuelle (cm)";
  inputTaille.style.marginLeft = "10px";

  const inputNombre = document.createElement("input");
  inputNombre.type = "number";
  inputNombre.placeholder = "Nombre d'individus";
  inputNombre.style.marginLeft = "10px";

  const boutonSuppr = document.createElement("button");
  boutonSuppr.textContent = "🗑️";
  boutonSuppr.style.marginLeft = "10px";
  boutonSuppr.onclick = () => {
    ligne.remove();
    calculerFacteurs();
    calculerTauxPopulation();
    mettreAJourTableau1Et2();
  };

  [select, inputTaille, inputNombre].forEach(element => {
    element.addEventListener('input', () => {
      calculerFacteurs();
      calculerTauxPopulation();
      mettreAJourTableau1Et2();
    });
    element.addEventListener('change', () => {
      calculerFacteurs();
      calculerTauxPopulation();
      mettreAJourTableau1Et2();
    });
  });

  ligne.appendChild(searchContainer);
  ligne.appendChild(inputTaille);
  ligne.appendChild(inputNombre);
  ligne.appendChild(boutonSuppr);

  containerPopulation.appendChild(ligne);

  calculerFacteurs();
  calculerTauxPopulation();
  mettreAJourTableau1Et2();
}

boutonAjouter.addEventListener("click", ajouterLigneEspece);
function mettreAJourTableau1Et2() {
  const lignes = document.querySelectorAll(".ligne-espece");
  const donneesRecommandations = [];
  lignes.forEach(ligne => {
    const select = ligne.querySelector("select");
    const nomEspece = select.value;
    const especeData = especesData.find(e => e.esp === nomEspece);
    if (especeData) {
      donneesRecommandations.push(especeData);
    }
  });

  // Tableau 1 - recommandations espèce
  const table1Body = document.querySelector("#tableau1 tbody");
  table1Body.innerHTML = "";
  donneesRecommandations.forEach(data => {
    const row = document.createElement("tr");
    const valeurs = [
      data.esp,
      data.Lmax,
      data.nbMin,
      data.SurfaceMin,
      data.VolumeMin,
      data.TempMin,
      data.TempMax,
      data.TempCible
    ];
    valeurs.forEach((val, index) => {
      const cell = document.createElement("td");
      cell.textContent = val;
      cell.style.backgroundColor = "#A6A6A6";
      cell.style.textAlign = "center";
      cell.style.fontWeight = "bold";
      cell.style.color = "#000000";
      if (index >= 5) cell.classList.add("col-temp");
      row.appendChild(cell);
    });
    table1Body.appendChild(row);
  });

  // Nettoyage alarmes population
  const containerAlertes = document.getElementById("alertes-population");
  containerAlertes.innerHTML = "";

  lignes.forEach(ligne => {
    const select = ligne.querySelector("select");
    const inputNombre = ligne.querySelector('input[type="number"]:nth-of-type(2)');
    const nomEspece = select.value;
    const nbIndividus = parseInt(inputNombre.value);
    const especeData = especesData.find(e => e.esp === nomEspece);

    if (nomEspece && especeData && !isNaN(nbIndividus) && nbIndividus > 0) {
      const seuilIndividus25 = especeData.nbMin * 0.75;
      if (nbIndividus < especeData.nbMin) {
        const alarme = document.createElement("div");
        alarme.textContent = `⚠︎ nombre d'individus insuffisant pour combler les besoins sociaux de ${nomEspece}`;
        alarme.style.color = (nbIndividus < seuilIndividus25) ? "red" : "orange";
        containerAlertes.appendChild(alarme);
      }
      if (surface && surface > 0) {
        const seuilSurface25 = especeData.SurfaceMin * 0.75;
        if (surface < especeData.SurfaceMin) {
          const alarme = document.createElement("div");
          alarme.textContent = `⚠︎ espace insuffisant à long terme pour ${nomEspece}`;
          alarme.style.color = (surface < seuilSurface25) ? "red" : "orange";
          containerAlertes.appendChild(alarme);
        }
      }
    }
  });

  // Tableau 2 - Température population
  const alerteDiv = document.querySelector("#alerteTemperature");
  if (donneesRecommandations.length > 0) {
    const TminPop = Math.max(...donneesRecommandations.map(d => parseFloat(d.TempMin)));
    const TmaxPop = Math.min(...donneesRecommandations.map(d => parseFloat(d.TempMax)));
    const TmaxReco = Math.min(...donneesRecommandations.map(d => parseFloat(d.TempCible)));

    const table2Body = document.querySelector("#tableau2 tbody");
    table2Body.innerHTML = "";
    const row = document.createElement("tr");
    [TminPop, TmaxPop, TmaxReco].forEach(val => {
      const cell = document.createElement("td");
      cell.textContent = val;
      cell.style.backgroundColor = "#A6A6A6";
      cell.style.textAlign = "center";
      cell.style.fontWeight = "bold";
      cell.style.color = "#000000";
      row.appendChild(cell);
    });
    table2Body.appendChild(row);

    // Alarme température actuelle
    const alarmeDiv = document.querySelector("#alarmeTemperature");
    if (Vtemperature !== null) {
      const tempActuelle = parseFloat(Vtemperature);
      if (tempActuelle < TminPop || tempActuelle > TmaxPop) {
        alarmeDiv.textContent = ` ⚠︎ Température actuelle (${tempActuelle} °C) est hors des limites supportées par la population !`;
        alarmeDiv.style.backgroundColor = "#820501";
        alarmeDiv.style.color = "#FFFFFF";
        alarmeDiv.style.padding = "10px";
        alarmeDiv.style.fontWeight = "bold";
        alarmeDiv.style.textAlign = "center";
      } else if (tempActuelle > TmaxReco && tempActuelle <= TmaxPop) {
        alarmeDiv.textContent = `⚠︎ Température actuelle (${tempActuelle} °C) proche de la limite maximale supportée !`;
        alarmeDiv.style.backgroundColor = "#bd4800";
        alarmeDiv.style.color = "#ffffff";
        alarmeDiv.style.padding = "10px";
        alarmeDiv.style.fontWeight = "bold";
        alarmeDiv.style.textAlign = "center";
      } else {
        alarmeDiv.textContent = "";
        alarmeDiv.style.backgroundColor = "";
        alarmeDiv.style.padding = "";
      }
    } else {
      alarmeDiv.textContent = "";
    }

    // Alerte incompatibilité température
    if (TmaxReco < TminPop || TminPop > TmaxPop) {
            alerteDiv.textContent = "⚠︎ Ces espèces sont incompatibles, elles ne vivent pas aux mêmes températures !";
        alerteDiv.style.backgroundColor = "#820501";
        alerteDiv.style.color = "#ffffff";
        alerteDiv.style.padding = "10px";
        alerteDiv.style.fontWeight = "bold";
        alerteDiv.style.textAlign = "center";
      const tableauAlerte = document.querySelector("#tableau-alerte-temp");
      tableauAlerte.innerHTML = "";
      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.width = "100%";
      table.style.marginTop = "10px";
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      ["Espèces", "Température min", "Température max", "Température max recommandée"].forEach(titre => {
        const th = document.createElement("th");
        th.textContent = titre;
        th.style.border = "1px solid black";
        th.style.backgroundColor = "#FFD6D6";
        th.style.padding = "5px";
        th.style.fontWeight = "bold";
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      donneesRecommandations.forEach(espece => {
        const row = document.createElement("tr");
        [espece.esp, espece.TempMin, espece.TempMax, espece.TempCible].forEach(val => {
          const td = document.createElement("td");
          td.textContent = val;
          td.style.border = "1px solid black";
          td.style.padding = "5px";
          td.style.textAlign = "center";
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      tableauAlerte.appendChild(table);
    } else {
      alerteDiv.textContent = "";
      document.querySelector("#tableau-alerte-temp").innerHTML = "";
    }
  } else {
    alerteDiv.textContent = "";
  }
}

// ==================== CALCULS INTERMEDIAIRES =================== //
function calculerFacteurs() {
  const lignes = document.querySelectorAll(".ligne-espece");
  const tbody = document.querySelector("#tableau3 tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  lignes.forEach(ligne => {
    const select = ligne.querySelector("select");
    const inputs = ligne.querySelectorAll('input[type="number"]');
const inputTaille = inputs[0];
const inputNombre = inputs[1];

    const nomEspece = select.value;
    if (!nomEspece || nomEspece === "Choisir espèce") return;
    const tailleActuelle = parseFloat(inputTaille.value);
    const nombre = parseInt(inputNombre.value);
    const data = especesData.find(e => e.esp === nomEspece);
    if (!data || isNaN(tailleActuelle) || isNaN(nombre)) return;

    const Fmeta = Math.round((data.Meta / 10) * 100) / 100;
    let Fta;
    if (tailleActuelle < 11) Fta = tailleActuelle;
    else if (tailleActuelle >= 10 && tailleActuelle <= 29) Fta = tailleActuelle * tailleActuelle / 10;
    else if (tailleActuelle > 29) Fta = tailleActuelle * tailleActuelle / 9.5;
    Fta = Math.round(Fta * 10) / 10;

    let Ftemp = null;
    if (Vtemperature !== null) {
      Ftemp = 0.86 + ((parseFloat(Vtemperature) - data.TempCible) / 10);
      Ftemp = Math.round(Ftemp * 100) / 100;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-temp">${nomEspece}</td>
      <td class="col-temp">${data.Meta}</td>
      <td class="col-temp">${data.Ftmax}</td>
      <td class="col-temp">${Fmeta}</td>
      <td class="col-temp">${Fta}</td>
      <td class="col-temp">${Ftemp !== null ? Ftemp : "—"}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ==================== TAUX DE POPULATION =================== //
function calculerTauxPopulation() {
console.log("calculerTauxPopulation appelée");
  console.log("volume=", volume, "sv=", sv, "Ffiltre=", Ffiltre, "Vtemperature=", Vtemperature);
  const lignes = document.querySelectorAll(".ligne-espece");
  const tbody = document.querySelector("#tableau4 tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  let sommeTPAE = 0;
  let sommeTPLTE = 0;

  lignes.forEach(ligne => {
    const select = ligne.querySelector("select");
    const inputs = ligne.querySelectorAll('input[type="number"]');
const inputTaille = inputs[0];
const inputNombre = inputs[1];

    const nomEspece = select.value;
    if (!nomEspece || nomEspece === "Choisir espèce") return;
    const tailleActuelle = parseFloat(inputTaille.value);
    const nb = parseInt(inputNombre.value);
    const data = especesData.find(e => e.esp === nomEspece);

if (!data || isNaN(tailleActuelle) || isNaN(nb) || volume === null || sv === null || Ffiltre === null || Vtemperature === null) {
    console.log("return: ",
      {nomEspece, data, tailleActuelle, nb, volume, sv, Ffiltre, Vtemperature}
    );
    return;
}

   if (!data || isNaN(tailleActuelle) || isNaN(nb) || volume === null || sv === null || Ffiltre === null || Vtemperature === null) {

    // Affiche une ligne vide ou une alerte dans le tableau pour voir si la ligne passe
    console.warn("Calcul ignoré pour cette ligne", {nomEspece, data, tailleActuelle, nb, volume, sv, Ffiltre, Vtemperature});
    return; // Remets-le après test si besoin
}

    const Fmeta = data.Meta / 10;
    let Fta;
    if (tailleActuelle < 11) Fta = tailleActuelle;
    else if (tailleActuelle <= 29) Fta = tailleActuelle ** 2 / 10;
    else Fta = tailleActuelle ** 2 / 9.5;

    const Ftemp = 0.86 + ((parseFloat(Vtemperature) - data.TempCible) / 10);

    const TPAE = ((Fta * nb * Fmeta * Ftemp * Ffiltre * (Math.sqrt(sv) * 2)) / volume) / 10;
    const TPLTE = ((data.Ftmax * nb * Fmeta * Ftemp * Ffiltre * (Math.sqrt(sv) * 2)) / volume) / 10;

    sommeTPAE += TPAE;
    sommeTPLTE += TPLTE;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nomEspece}</td>
      <td>${(TPAE * 100).toFixed(0)} %</td>
      <td>${(TPLTE * 100).toFixed(0)} %</td>
    `;
    tr.querySelectorAll("td").forEach(cell => {
      cell.style.backgroundColor = "#A6A6A6";
      cell.style.textAlign = "center";
      cell.style.fontWeight = "bold";
      cell.style.color = "#000000";
    });
    tbody.appendChild(tr);
  });
  
  

  // Affichage dans le tableau 5
  const tpaCell = document.getElementById("TPA");
  const tplCell = document.getElementById("TPLT");
  if (tpaCell && tplCell) {
    tpaCell.textContent = (sommeTPAE * 100).toFixed(0) + " %";
    tplCell.textContent = (sommeTPLTE * 100).toFixed(0) + " %";
  }

  // Alarmes
  const containerAlertesTaux = document.getElementById("alertes-taux-population");
  if (containerAlertesTaux) {
    containerAlertesTaux.innerHTML = "";
    const tpaPourcent = sommeTPAE * 100;
    const tplPourcent = sommeTPLTE * 100;
    if (tpaPourcent > 105) {
      const alarmeTPA = document.createElement("div");
      alarmeTPA.style.whiteSpace = "pre-line";
      if (tpaPourcent >= 120) {
        alarmeTPA.className = "alarme1";
        alarmeTPA.textContent = `⚠︎ Votre TP actuel est supérieur ou égal à 120% (${tpaPourcent.toFixed(0)}%) : cette situation sera difficilement tenable !
        
Il est fortement conseillé de réduire votre population.

D'ici là essayez de :
➠ diminuer la température,
➠ augmenter le débit et le volume de filtration,
➠ procéder à un entretien rigoureux de la filtration mécanique,
➠ changer régulièrement une part significative de l'eau (30–50% tous les 15 jours).`;
      } else {
        alarmeTPA.className = "alarme2"
        alarmeTPA.textContent = `⚠︎ Votre TP actuel est supérieur à 100% (${tpaPourcent.toFixed(0)}%) : 
        
        cette situation ne sera tenable à long terme qu’avec un entretien rigoureux !
        
Il est conseillé de :
➠ réduire votre population actuelle,
➠ diminuer la température,
➠ augmenter le débit et le volume de filtration,
➠ entretenir rigoureusement la filtration,
➠ changer régulièrement une part significative de l'eau (30–50% au moins 1x/mois).`;
      }
      containerAlertesTaux.appendChild(alarmeTPA);
    }
    if (tpaPourcent < 105 && tplPourcent > 105) {
      const alarmeTPLT = document.createElement("div");
      alarmeTPLT.style.whiteSpace = "pre-line";
      if (tplPourcent >= 120) {
        alarmeTPLT.className = "alarme1";
        alarmeTPLT.textContent = `⚠︎ Votre TP à long terme est supérieur ou égal à 120% (${tplPourcent.toFixed(0)}%) : 
        cette situation sera difficilement tenable !
        
Il est fortement conseillé de réduire votre population.

Si votre TP actuel dépasse les 100%, essayez de :
➠ diminuer la température,
➠ augmenter le débit et le volume de filtration,
➠ entretenir rigoureusement la filtration mécanique,
➠ changer 30–50% de l'eau tous les 15 jours.`;
      } else {
        alarmeTPLT.className = "alarme2";
        alarmeTPLT.textContent = `⚠︎ Votre TP à long terme est supérieur à 100% (${tplPourcent.toFixed(0)}%) :
        
        cette situation ne sera tenable à long terme qu’avec un entretien rigoureux !
        
Dès que le TP actuel dépasse les 100%, pensez à :
➠ réduire votre population,
➠ baisser la température,
➠ augmenter débit/volume de filtration,
➠ entretenir la filtration,
➠ changer 30–50% de l'eau au moins 1x/mois.`;
      }
      containerAlertesTaux.appendChild(alarmeTPLT);
    }
  }
  window.tauxPopulationGlobal = { TPA: sommeTPAE, TPLT: sommeTPLTE };
}

//================================================================================
//Convertisseur d'unité
//================================================================================

// Convertisseur d’unités en live
document.getElementById('conv-inches').addEventListener('input', function() {
  const v = parseFloat(this.value);
  document.getElementById('conv-inches-cm').textContent = isNaN(v) ? '= — cm' : '= ' + (v * 2.54).toFixed(0) + ' cm';
});
document.getElementById('conv-gallons').addEventListener('input', function() {
  const v = parseFloat(this.value);
  document.getElementById('conv-gallons-l').textContent = isNaN(v) ? '= — L' : '= ' + (v * 3.785).toFixed(0) + ' L';
});
document.getElementById('conv-cm').addEventListener('input', function() {
  const v = parseFloat(this.value);
  document.getElementById('conv-cm-inches').textContent = isNaN(v) ? '= — "' : '= ' + (v / 2.54).toFixed(0) + ' ”';
});
document.getElementById('conv-l').addEventListener('input', function() {
  const v = parseFloat(this.value);
  document.getElementById('conv-l-gallons').textContent = isNaN(v) ? '= — gal' : '= ' + (v / 3.785).toFixed(0) + ' gal';
});

const btnConvert = document.getElementById('toggle-convertisseur');
const blocConvert = document.getElementById('bloc-convertisseur');

btnConvert.addEventListener('click', function() {
  if (blocConvert.style.display === 'none') {
    blocConvert.style.display = 'block';
    btnConvert.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Canada_%28Pantone%29.svg" alt="Canada" style="height:1em;vertical-align:middle;margin-right:5px;">Masquer le convertisseur d’unités';
  } else {
    blocConvert.style.display = 'none';
    btnConvert.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Canada_%28Pantone%29.svg" alt="Canada" style="height:1em;vertical-align:middle;margin-right:5px;">Afficher le convertisseur d’unités';
  }
});

//================================================================================
//Bloc accordeon
//================================================================================
// JS pour toutes les sections accordéon :
document.querySelectorAll('.bloc-accordeon').forEach(details => {
  const icon = details.querySelector('.toggle-icon');
  details.addEventListener('toggle', function() {
    if (details.open) {
      icon.textContent = '−';
    } else {
      icon.textContent = '✚';
    }
  });
});


//=================================================================================
//Signature
//=================================================================================
const maintenant = new Date();
const jour = String(maintenant.getDate()).padStart(2, "0");
const mois = String(maintenant.getMonth() + 1).padStart(2, "0"); // Janvier = 0
const annee = maintenant.getFullYear();
const heure = String(maintenant.getHours()).padStart(2, "0");
const minute = String(maintenant.getMinutes()).padStart(2, "0");

const signature = `© 2025 / “Calcul du taux de population” par Alexandre Cologni version à jour au ${jour}/${mois}/${annee} - ${heure}:${minute}`;

document.getElementById("signature").textContent = signature;
