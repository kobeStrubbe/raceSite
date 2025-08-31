/**
 * Dit js document bevat alle code om met de API: https://openrouteservice.org/dev/#/api-docs te intrageren.
 * Als resultaat krijg je de reistijd terug.
 * @type {string}
 */

const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImI5NDE0NTNkNWE3YTQ5YTY4MmIwNGNiNzFlNzE0YjMzIiwiaCI6Im11cm11cjY0In0="; // <-- vervang door jouw API key
const startLocation = "Dudzele";

// Helper: plaatsnaam -> coördinaten
async function geocode(place) {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(place)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features.length === 0) throw new Error("Plaats niet gevonden: " + place);
    return data.features[0].geometry.coordinates; // [lon, lat]
}

// Helper: reistijd berekenen
async function getTravelTime1(startCoords, endCoords) {
    const url = "https://api.openrouteservice.org/v2/directions/driving-car";
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            coordinates: [startCoords, endCoords]
        })
    });
    const data = await res.json();
    const summary = data.routes[0].summary;
    return {
        distance: (summary.distance / 1000).toFixed(1), // km
        duration: (summary.duration / 60).toFixed(0)   // minuten
    };
}

async function getTravelTime(fromPlace, toPlace) {
    try {
        const fromCoords = await geocode(startLocation);
        const toCoords = await geocode(toPlace);

        const travel = await getTravelTime1(fromCoords, toCoords);
        return travel.duration;
    } catch (err) {
        alert("error " + err.message);
    }

}

