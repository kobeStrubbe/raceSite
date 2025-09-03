import {Race, RaceCalendar} from './RaceDayDataSave.js'

let saveData;
let standardMenuView;

export function initAddCalendarMenu(config) {
    saveData = config.saveData;
    standardMenuView = config.standardMenuView;
}

const addRaceCalendarView = `
    <div id="top_race_menu">
      <span>Add Calendar</span>
      <button id="race_menu_close_button" onclick="closeRaceMenu()">X</button>
    </div>
    <div>
        <label for="nameInput" class="menuLabel">Name:</label>
        <input id="nameInput" type="text" class="menuInput">
        <button class="addButton" onclick="saveCalendar()">Save</button>
    </div>
`

function clickAddCalendar() {
    const menu = document.getElementById("menu");
    menu.innerHTML = addRaceCalendarView;
}

async function saveCalendar() {
    const loadingScreen = document.getElementById("loading_screen");
    loadingScreen.style.visibility = "visible";

    const name = document.getElementById("nameInput").value.trim();
    await saveData.saveRaceCalendar(new RaceCalendar(name));
    closeRaceMenu();

    loadingScreen.style.visibility = "hidden";
}

window.saveCalendar = saveCalendar;
window.clickAddCalendar = clickAddCalendar;