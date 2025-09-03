import {createClient} from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = "https://yifcxedpefprnaohpjsv.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZmN4ZWRwZWZwcm5hb2hwanN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjIwNDEsImV4cCI6MjA3MjIzODA0MX0.BDh9lR2aa8yM2_Qa0xDI7OMCW9LAkBBk1ewTz9XerOw"
const supabase = createClient(supabaseUrl, supabaseKey)


/*
Alle data omtrent de wedstrijden worden lokaal in de browser op datum opgeslagen.
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
        this.id = id;
        this.name = name;
        this.place = place;
        this.distance = distance;
        this.date = date;
        this.color = color;
        this.travelTime = travelTime ?? getTravelTime(startLocation, place).duration;
    }


}

export class RaceCalendar {

    constructor(name, id=null) {
        this.name = name;
        this.id = id;
    }

}


class SaveData {

    constructor() {
        this.raceListeners = [];
        this.raceCalendarListeners = [];
    }

    addRaceListener(listener) {
        this.raceListeners.push(listener);
    }

    addRaceCalendarListener(listener) {
        this.raceCalendarListeners.push(listener);
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

    fromRowToRace(row) {
        return new Race(
            row.name,
            row.place,
            Number(row.distance),
            new Date(row.race_date),
            row.color,
            row.id,
            row.travel_time
        )
    }

    /**
     * Hier moet als param een object van het type Race worden meegegeven.
     * @param race
     */
    async saveRace(race) {
        if (!(race instanceof Race)) {
            alert("geen Race klasse meegegeven met de functie.")
            throw new Error("geen Race klasse");
        }

        const key = this.formatDateKey(race.date);
        const {data, error} = await supabase.from("race_table").insert([
        {
            name: race.name,
            place: race.place,
            distance: race.distance,
            race_date: race.date.toISOString().split("T")[0],
            color: race.color,
            travel_time: race.travelTime
        }
        ]).select();

        if (error) {
            console.error("Insert error:", error);
            return null;
        }

        this.invalidateRaceSaveData();
    }

    async updateRace(newRaceData) {
        const {data, error} = await supabase
            .from("race_table")
            .update({
                name: newRaceData.name,
                place: newRaceData.place,
                distance: newRaceData.distance,
                race_date: newRaceData.date.toISOString().split("T")[0], // YYYY-MM-DD
                color: newRaceData.color,
                travel_time: newRaceData.travelTime
            })
            .eq("id", newRaceData.id)
            .select(); // returns updated rows

        if (error) {
            console.error("Update error:", error);
            alert("Error updating data");
            return null;
        }

        if (data.length === 0) {
            alert("No race found with this ID");
            return null;
        }

        this.invalidateRaceSaveData();
    }

    /**
     * Deze haalt alle races op, op een bepaalde dag.
     * @param date
     * @returns {Race[]}
     */
    async getRacesOnDate(date) {
        const formattedDate = this.formatDateKey(date);

        const { data, error } = await supabase
            .from("race_table")
            .select("*")
            .eq("race_date", formattedDate);

        if (error) {
            console.error(error);
            alert("Error fetching data");
            return [];
        }

        if (data.length === 0) {
            return [];
        }


        // Convert DB rows into Race instances
        return data.map(row => this.fromRowToRace(row));
    }

    async getRacesFromToDate(startDate, endDate) {
        const startFormatted = startDate.toISOString().split("T")[0] + "T00:00:00Z";
        const endFormatted = endDate.toISOString().split("T")[0] + "T23:59:59Z";

        const { data, error } = await supabase
            .from("race_table")
            .select("*")
            .gte("race_date", startFormatted)
            .lte("race_date", endFormatted);

        if (error) {
            console.error(error);
            alert("Error fetching data");
            return [];
        } else {
            return data.map(
                row => this.fromRowToRace(row)
            );
        }
    }

    invalidateRaceSaveData() {
        for (let listener of this.raceListeners) {
            listener();
        }
    }

    invalidateRaceCalanderData() {
        for (let listener of this.raceCalendarListeners) {
            listener();
        }
    }

    async removeRace(race) {
        const {data, error} = await supabase
            .from('race_table')
            .delete()
            .eq("id", race.id)
            .select();

        if (error) {
            alert("Error updating data");
        }

        this.invalidateRaceSaveData();
    }

    clearDate(date) {
        const key = this.formatDateKey(date);
        localStorage.removeItem(key);

        this.invalidateRaceSaveData();
    }

    async saveRaceCalendar(raceCalendar) {
        if (!( raceCalendar instanceof RaceCalendar) ) {
            alert("geen Race klasse");
            return;
        }

        const {data, error} = await supabase.from("race_calendar").insert(
            [{
                    name : raceCalendar.name
            }]
        ).select();

        if (error) {
            alert("Error saving data");
            console.log("Error saving data: " + error);
            return;
        }

        this.invalidateRaceCalanderData();

        return data[0].id;
    }

    async addRaceToCalendar(race, raceCalendar) {

        const {data, error} = await supabase
            .from("race_calendar_race")
            .insert(
                [{
                    race_id : race.id,
                    calendar_id : raceCalendar.id
                }]
            ).select();

        if (error) {
            alert("Error saving data");
            console.log("Error saving data: " + error);
            return;
        }

        this.invalidateRaceCalanderData();
    }

    async getAllRaceCalendars() {
        const {data, error} = await supabase.from("race_calendar").select('*');

        if (error) {
            alert("Error saving data");
            console.error(error);

            return;
        }

        return data.map(row => this.fromRowToRaceCalendar(row));
    }

    fromRowToRaceCalendar(row) {
        return new RaceCalendar(row.name, row.id);
    }

}

export {SaveData, Race};