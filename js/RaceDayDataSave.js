
/*
Alle data omtrent de wedstrijden worden locaal in de browser op datum opgeslagen.
 */

class Race {
    /**
     * Een klasse die de opslag van een race voorstelt.
     * @param name :  string die de naam bijhoudt.
     * @param place :  string met de locatie
     * @param distance :  number met de afstand in m.
     * @param date :  Date met de datum van de race
     * @param id Int dit is de unieke id van elke race.
     */
    constructor(name, place, distance, date, color, id= null, travelTime = null) {
        if (
            typeof name !== "string"
            || typeof place !== "string"
            || typeof distance !== "number"
            || !(date instanceof Date)
        ) {
            alert("Geen juiste dataTypes meegegeven met de klasse Race");
            throw new Error("Geen juiste dataTypes meegegeven met de klasse Race");
        }

        this.id = id ?? saveData.getNextId();
        this.name = name;
        this.place = place;
        this.distance = distance;
        this.date = date;
        this.color = color;
        this.travelTime = travelTime ?? getTravelTime(startLocation, place).duration;
    }


}


class SaveData {

    constructor() {
        this.listeners = [];
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    /**
     * Deze functie is dan om de datum in de juiste manier worden opgeslagen
     * De maanden zijn 1-12.
     * @param date
     * @returns {string}
     */
    formatDateKey(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    /**
     * Hier moet als param een object van het type Race worden meegegeven.
     * @param race
     */
    saveRace(race) {
        if (!(race instanceof Race)) {
            alert("geen Race klasse meegegeven met de functie.")
            throw new Error("geen Race klasse");
        }
        const racesArr = this.getRacesOnDate(race.date);

        racesArr.push(race);
        const key = saveData.formatDateKey(race.date);
        localStorage.setItem(key, JSON.stringify(racesArr));

        loadMonth(yearMonthObservable.getYear(), yearMonthObservable.getMonth());
    }

    /**
     * Deze haalt alle races op, op een bepaalde dag.
     * @param date
     * @returns {Race[]}
     */
    getRacesOnDate(date) {
        const key = this.formatDateKey(date);
        const rawArray = JSON.parse(localStorage.getItem(key)) || [];
        return rawArray.map(raceObj => new Race(raceObj.name,
            raceObj.place,
            raceObj.distance,
            new Date(raceObj.date),
            raceObj.color,
            parseInt(raceObj.id),
            raceObj.travelTime
        ));
    }

    invalidateSaveData() {
        for (let listener of this.listeners) {
            listener.handleChangeSaveData();
        }
    }

    removeRace(id, race) {
        const arr = this.getRacesOnDate(race.date);

        const index = arr.findIndex(r => r.id === id);

        if (index !== -1) {
            arr.splice(index, 1); // verwijder element
        }
        const key = saveData.formatDateKey(race.date);
        localStorage.setItem(key, JSON.stringify(arr));
    }

    clearDate(date) {
        const key = this.formatDateKey(date);
        localStorage.removeItem(key)
    }

    /**
     * Dit is om de unieke id van elke race te gaan opvragen.
     * @returns {string}
     */
    getNextId() {
        const nextId = parseInt(localStorage.getItem("id"));
        localStorage.setItem("id", nextId + 1);
        return nextId;
    }
}