const raceMenuView = `
  <div id="add_race_menu">
    <div id="top_race_menu">
      <span>Race info</span>
      <button id="race_menu_close_button" onclick="closeRaceMenu()">X</button>
    </div>
    <label for="race_name_input" class="menuLabel">Race name:</label>
    <input type="text" id="race_name_input" class="menuInput" placeholder="3000m Brugge exp.">
    <label for="location_input" class="menuLabel">Location:</label>
    <input type="text" id="location_input" class="menuInput" placeholder="Brugge belfort exp.">
    <label for="distance_input" class="menuLabel">Distance:</label>
    <div id="distance_input_container">
      <input type="number" id="distance_input" class="menuInputSmall" placeholder="3000">
      <select name="distance_type" id="distance_type_select">
        <option value="m">m</option>
        <option value="km">km</option>
        <option value="mile">mile</option>
      </select>
    </div>
    <label for="date_input" class="menuLabel">Date:</label>
    <input type="date" id="date_input" class="menuInput">
    <button id="addButton" onclick="clickSaveRace()">Save</button>
  </div>
`;


/**
 * Als er in het menu op de knop add Race wordt geklikt moet het menu veranderen:
 */
function clickAddRace() {
    const menu = document.getElementById("menu");

    menu.innerHTML = raceMenuView;

    const nameInput = document.getElementById("race_name_input");
    const dateInput = document.getElementById("date_input");
    const distanceInput = document.getElementById("distance_input");
    const distanceTypeInput = document.getElementById("distance_type_select");
    const locationInput = document.getElementById("location_input");
    const inputs = [nameInput, dateInput, distanceInput, distanceTypeInput, locationInput];

    for (let input of inputs) {
        input.addEventListener("change", function (event) {
            input.classList.remove("menuInputError");
        })
    }

}

/**
 * Ook moet er een aantal checks worden uitgevoerd.
 */
function clickSaveRace() {

    const nameInput = document.getElementById("race_name_input");
    const dateInput = document.getElementById("date_input");
    const distanceInput = document.getElementById("distance_input");
    const distanceTypeInput = document.getElementById("distance_type_select");
    const locationInput = document.getElementById("location_input");
    const inputs = [nameInput, dateInput, distanceInput, distanceTypeInput, locationInput];

    function checkInput(input) {
        if (input.value.trim() === "") {
            input.classList.add("menuInputError");
            return false;
        }

        return true;
    }

    let valid = true;

    for (let input of inputs) {
        if (! checkInput(input)) {
            valid = false;
        }
    }

    if (! valid) {
        return;
    }

    function toMeters(distance, type) {
        if (type === "m") {
            return distance;
        } else if (type === "km") {
            return distance * 1000;
        } else if (type === "mile") {
            return distance * 1610;
        }
    }

    const distanceValue = toMeters(Number(distanceInput.value), distanceTypeInput.value);

    const id = document.getElementById("add_race_menu").getAttribute("data-race-id");
    let race;
    if (id) {
        race = new Race(
            nameInput.value,
            locationInput.value,
            distanceValue,
            new Date(dateInput.value),
            parseInt(id)
        );

        saveData.removeRace(parseInt(id), race);
    } else {
        race = new Race(
            nameInput.value,
            locationInput.value,
            distanceValue,
            new Date(dateInput.value)
        );
    }

    //race opslaan in het geheugen:

    saveData.saveRace(race);
    closeRaceMenu();
}

function closeRaceMenu() {
    const menu = document.getElementById("menu");
    menu.innerHTML = standardMenuView;
}

function addData(race) {
    const nameInput = document.getElementById("race_name_input");
    const dateInput = document.getElementById("date_input");
    const distanceInput = document.getElementById("distance_input");
    const distanceTypeInput = document.getElementById("distance_type_select");
    const locationInput = document.getElementById("location_input");
    const addRaceMenuDiv = document.getElementById("add_race_menu");

    addRaceMenuDiv.setAttribute("data-race-id", race.id);

    nameInput.value = race.name;
    distanceInput.value = race.distance;
    distanceTypeInput.value = "m";
    locationInput.value = race.place;
    dateInput.value =
        `${race.date.getFullYear()}-${String(race.date.getMonth() + 1).padStart(2, "0")}-${String(race.date.getDate()).padStart(2, "0")}`;

}
