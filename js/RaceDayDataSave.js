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

export class RaceCalendarConnection {

    constructor(raceId, calendarId) {
        this.raceId = raceId;
        this.calendarId = calendarId;
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
        ]).select("id");

        if (error) {
            console.error("Insert error:", error);
            return null;
        }

        //this.invalidateRaceSaveData();

        return data[0].id;
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

        await this.deleteAllConnectionsRace(race.id)
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

    async addRaceToCalendar(raceID, raceCalendarID) {

        const {data, error} = await supabase
            .from("race_calendar_race")
            .insert(
                [{
                    race_id : raceID,
                    calendar_id : raceCalendarID
                }]
            ).select();

        if (error) {
            alert("Error saving data");
            console.log("Error saving data: " + error);
            return;
        }

        //this.invalidateRaceSaveData();
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

    async getAllRaceCalendarConnections() {
        const {data, error} = await supabase.from("race_calendar_race").select('*');

        if (error) {
            alert("Error saving data");
            console.error(error);
            return;
        }

        return data.map(row => new RaceCalendarConnection(row.race_id, row.calendar_id));
    }

    async updateRaceCalendarConnection(raceId, oldCalendarIds, newCalendarIds) {
        const toAdd = newCalendarIds.filter(id => !oldCalendarIds.includes(id));
        const toRemove = oldCalendarIds.filter(id => !newCalendarIds.includes(id));

        if (toRemove.length > 0) {
            const { error: deleteError } = await supabase
                .from("race_calendar_race")
                .delete()
                .eq("race_id", raceId)
                .in("calendar_id", toRemove);

            if (deleteError) {
                console.error("Error deleting old connections:", deleteError);
                return;
            }
        }

        if (toAdd.length > 0) {
            const rows = toAdd.map(id => ({ race_id: raceId, calendar_id: id }));
            const { error: insertError } = await supabase
                .from("race_calendar_race")
                .insert(rows);

            if (insertError) {
                console.error("Error inserting new connections:", insertError);
                return;
            }
        }

        this.invalidateRaceCalanderData();
    }

    async deleteAllConnectionsRace(raceId) {
        const {data, error} = await supabase.from("race_calendar_race").delete().eq("race_id", raceId);

        if (error) {
            alert("Error deleting old connections");
            console.error(error);
        }
    }

    fromRowToRaceCalendar(row) {
        return new RaceCalendar(row.name, row.id);
    }

    createChain() {
        return new Chain();
    }

}

class Chain {

    constructor(chain=null) {
        this.chain = chain ?? supabase.from("race_with_calendars").select('*');
    }

    fromDateToDate(startDate, endDate) {
        const start = startDate.toISOString().split("T")[0];
        const end = endDate.toISOString().split("T")[0];

        return new Chain(
            this.chain.gte("race_date", start).lte("race_date", end)
        );
    }
    /**
     * Hier moet een array met de namen worden meegegeven.
     */
    raceCalendarEq(names) {
        return new Chain(this.chain.in("calendar_name", names));
    }

    async getData() {
        const { data, error } = await this.chain;

        if (error) {
            alert("Error fetching data");
            console.error(error);
            return { races: [], connections: {} };
        }

        const raceMap = new Map();
        const connections = {}; // dictionary: race_id -> [calendar_id, ...]

        for (let row of data) {
            // Create race if it doesn't exist yet
            if (!raceMap.has(row.race_id)) {
                const race = new Race(
                    row.race_name,
                    row.place,
                    Number(row.distance),
                    new Date(row.race_date),
                    row.color,
                    row.race_id,
                    row.travel_time
                );
                raceMap.set(row.race_id, race);
            }

            // Add calendar ID to connections array
            if (row.calendar_id != null) {
                if (!connections[row.race_id]) {
                    connections[row.race_id] = [];
                }
                connections[row.race_id].push(row.calendar_id);
            }
        }

        const races = Array.from(raceMap.values());

        return { races, connections };
    }


}

class ConnectionRaceAndCalendar {

    constructor(race, raceCalendar) {
        this.race = race;
        this.raceCalendar = raceCalendar;
    }
}


export {SaveData, Race};