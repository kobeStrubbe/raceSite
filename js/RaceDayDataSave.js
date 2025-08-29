let currentId = parseInt(localStorage.getItem("id"));

/*
Alle data omtrent de wedstrijden worden locaal in de browser op datum opgeslagen.
 */
class Race {
    /**
     * Een klasse die de opslag van een race voorstelt.
     * @param name : een string die de naam bijhoudt.
     * @param place : een string met de locatie
     * @param distance : een number met de afstand in m.
     * @param date : een Date met de datum van de race
     */
    constructor(name, place, distance, date) {
        if (
            typeof name !== "string"
            || typeof place !== "string"
            || typeof distance !== "number"
            || !(date instanceof Date)
        ) {
            alert("Geen juiste dataTypes meegegeven met de klasse Race");
            throw new Error("Geen juiste dataTypes meegegeven met de klasse Race");
        }

        this.name = name;
        this.place = place;
        this.distance = distance;
        this.date = date;
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
        return rawArray.map(raceObj => new Race(raceObj.name, raceObj.place, raceObj.distance, new Date(raceObj.date)));
    }

    invalidateSaveData() {
        for (let listener of this.listeners) {
            listener.handleChangeSaveData();
        }
    }
}