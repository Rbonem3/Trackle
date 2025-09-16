let tracks = [];
let currentTrack = null;

async function loadTracks() {
    const response = await fetch('tracks.json');
    tracks = await response.json();
    pickRandomTrack();
}

function pickRandomTrack() {
    currentTrack = tracks[Math.floor(Math.random() * tracks.length)];
    document.getElementById('track-svg').innerHTML = currentTrack.svg;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateDirection(lat1, lon1, lat2, lon2) {
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    const compass = ['N','NE','E','SE','S','SW','W','NW','N'];
    return compass[Math.round(((bearing % 360) + 360) % 360 / 45)];
}

function handleGuess() {
    const guess = document.getElementById('guess-input').value.trim().toLowerCase();
    if (!guess) return;

    const distance = calculateDistance(
        currentTrack.lat, currentTrack.lon,
        getCountryLat(guess), getCountryLon(guess)
    );
    const direction = calculateDirection(
        currentTrack.lat * Math.PI / 180,
        currentTrack.lon * Math.PI / 180,
        getCountryLat(guess) * Math.PI / 180,
        getCountryLon(guess) * Math.PI / 180
    );

    const resultDiv = document.getElementById('results');
    const div = document.createElement('div');
    div.className = 'guess-result';

    if (guess === currentTrack.country.toLowerCase()) {
        div.textContent = `🎉 Correct! The track is in ${currentTrack.country}.`;
    } else {
        div.textContent = `${guess.toUpperCase()} → ${distance.toFixed(1)} km, ${direction}`;
    }

    resultDiv.prepend(div);
    document.getElementById('guess-input').value = '';
}

// These functions should ideally come from a country data file
function getCountryLat(country) {
    // TODO: replace with real lookup table
    const data = {
        "united kingdom": 55.3781,
        "italy": 41.8719,
        "japan": 36.2048,
        "brazil": -14.2350,
        "uae": 23.4241
    };
    return data[country] || 0;
}

function getCountryLon(country) {
    const data = {
        "united kingdom": -3.4360,
        "italy": 12.5674,
        "japan": 138.2529,
        "brazil": -51.9253,
        "uae": 53.8478
    };
    return data[country] || 0;
}

document.getElementById('submit-guess').addEventListener('click', handleGuess);
window.onload = loadTracks;
