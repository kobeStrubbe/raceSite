import {getTravelTime, startLocation} from "./CalendarView/OpenRouteServiceAPI.js";
import {Race, RaceCalendar} from "./RaceDayDataSave.js";

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
    <label for="color_input" class="menuLabel">Color:</label>
    <select id="color_input" class="menuInput" style="height: 22px" onchange="updateBackground(this)">
          <option value="#FADADD" style="background-color:#FADADD;">Light Pink</option>
          <option value="#FFD1DC" style="background-color:#FFD1DC;">Cotton Candy</option>
          <option value="#FFE4E1" style="background-color:#FFE4E1;">Misty Rose</option>
          <option value="#FFDAB9" style="background-color:#FFDAB9;">Pastel Peach</option>
          <option value="#FFEFD5" style="background-color:#FFEFD5;">Papaya Whip</option>
          <option value="#FFF0E1" style="background-color:#FFF0E1;">Soft Apricot</option>
          <option value="#E8F8F5" style="background-color:#E8F8F5;">Mint Cream</option>
          <option value="#D6F5E3" style="background-color:#D6F5E3;">Pastel Mint</option>
          <option value="#E6F7FF" style="background-color:#E6F7FF;">Baby Blue</option>
          <option value="#E8EAFE" style="background-color:#E8EAFE;">Lavender</option>
          <option value="#FFF9D6" style="background-color:#FFF9D6;">Lemon Chiffon</option>
    </select>
    <label for="date_input" class="menuLabel">Date:</label>
    <input type="date" id="date_input" class="menuInput">
    <label for="race_calendar_select" class="menuLabel">Race calendar:</label>
    <label class="menuLabel" ></label>
    <select id="race_calendar_select" class="menuInput" style="height: 22px; margin-left: 7px" ></select>
    <Label class="menuLabel">Travel time:</Label>
    <span id="travel_time_span">...</span>
    <button class="addButton" onclick="clickSaveRace()">Save</button>
  </div>
`;

let saveData;
let standardMenuView;
let raceCalendars = [];

export async function initAddRaceMenu(config) {
    saveData = config.saveData;
    standardMenuView = config.standardMenuView;

    raceCalendars = await saveData.getAllRaceCalendars();

    saveData.addRaceCalendarListener(
        async () => {
            raceCalendars = await saveData.getAllRaceCalendars();
        }
    )
}

/**
 * Als er in het menu op de knop add Race wordt geklikt moet het menu veranderen:
 */
async function clickAddRace() {
    const menu = document.getElementById("menu");

    menu.innerHTML = raceMenuView;

    const nameInput = document.getElementById("race_name_input");
    const dateInput = document.getElementById("date_input");
    const distanceInput = document.getElementById("distance_input");
    const distanceTypeInput = document.getElementById("distance_type_select");
    const locationInput = document.getElementById("location_input");
    const colorInput = document.getElementById("color_input");
    const raceCalendarInput = document.getElementById("race_calendar_select");

    const inputs = [nameInput, raceCalendarInput , colorInput, dateInput, distanceInput, distanceTypeInput, locationInput];


    for (let input of inputs) {
        input.addEventListener("change", function (event) {
            input.classList.remove("menuInputError");
        })
    }

    for (let raceCalendar of raceCalendars) {

        const el = document.createElement("option");
        el.id = "calendar_input_" + raceCalendar.id;
        el.textContent = raceCalendar.name;
        el.setAttribute("calendar_id", raceCalendar.id);
        el.value = raceCalendar.id;

        raceCalendarInput.appendChild(el);
    }

}
window.clickAddRace = clickAddRace;

/**
 * Ook moet er een aantal checks worden uitgevoerd.
 */
async function clickSaveRace() {
    const loadingDiv = document.getElementById("loading_screen");
    loadingDiv.style.visibility = "visible";

    const nameInput = document.getElementById("race_name_input");
    const dateInput = document.getElementById("date_input");
    const distanceInput = document.getElementById("distance_input");
    const distanceTypeInput = document.getElementById("distance_type_select");
    const locationInput = document.getElementById("location_input");
    const colorInput = document.getElementById("color_input");
    const raceCalendarSelect = document.getElementById("race_calendar_select");

    // Basic input validation (omitted for brevity)

    function toMeters(distance, type) {
        if (type === "m") return distance;
        if (type === "km") return distance * 1000;
        if (type === "mile") return distance * 1610;
    }

    const distanceValue = toMeters(Number(distanceInput.value), distanceTypeInput.value);
    const travel = await getTravelTime(startLocation, locationInput.value);

    let race;
    let raceId = document.getElementById("add_race_menu").getAttribute("data-race-id");

    if (raceId) {
        await saveData.deleteAllConnectionsRace(raceId);
        // Updating existing race
        race = new Race(
            nameInput.value,
            locationInput.value,
            distanceValue,
            new Date(dateInput.value),
            colorInput.value,
            parseInt(raceId),
            travel
        );
        await saveData.updateRace(race, parseInt(raceCalendarSelect.value));
    } else {
        // Creating new race
        race = new Race(
            nameInput.value,
            locationInput.value,
            distanceValue,
            new Date(dateInput.value),
            colorInput.value,
            null,
            travel
        );

        raceId = await saveData.saveRace(race,parseInt(raceCalendarSelect.value));
    }

    closeRaceMenu();
    loadingDiv.style.visibility = "hidden";
}

window.clickSaveRace = clickSaveRace;

function closeRaceMenu() {
    const menu = document.getElementById("menu");
    menu.innerHTML = standardMenuView;
}

window.closeRaceMenu = closeRaceMenu;

function addData(race, calendarId) {
    const nameInput = document.getElementById("race_name_input");
    const dateInput = document.getElementById("date_input");
    const distanceInput = document.getElementById("distance_input");
    const distanceTypeInput = document.getElementById("distance_type_select");
    const locationInput = document.getElementById("location_input");
    const addRaceMenuDiv = document.getElementById("add_race_menu");
    const colorInput = document.getElementById("color_input");
    const travelTime = document.getElementById("travel_time_span");
    const race_calendar_select = document.getElementById("race_calendar_select");
    addRaceMenuDiv.setAttribute("data-race-id", race.id);
    addRaceMenuDiv.setAttribute("connection", JSON.stringify(calendarId));

    const optionToSelect = race_calendar_select.querySelector(`option[calendar_id="${calendarId}"]`);
    if (optionToSelect) optionToSelect.selected = true;

    nameInput.value = race.name;
    distanceInput.value = race.distance;
    distanceTypeInput.value = "m";
    locationInput.value = race.place;
    colorInput.value = race.color;
    dateInput.value =
        `${race.date.getFullYear()}-${String(race.date.getMonth() + 1).padStart(2, "0")}-${String(race.date.getDate()).padStart(2, "0")}`;
    travelTime.innerHTML = race.travelTime + " min";


}

function updateBackground(select) {
    select.style.backgroundColor = select.value;
}
window.updateBackground = updateBackground;

export {addData, raceMenuView};