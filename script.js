// Centraliza na região (Atibaia/Perdões)
const map = L.map('map').setView([-23.142, -46.322], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let markers = {};
let routeLayer;
let marketCount = 0;

// Busca por nome
async function buscar(el) {
    const query = el.value;
    if (query.length < 3) return;
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, SP, Brasil&limit=1`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data[0]) setPoint(el, data[0].lat, data[0].lon, query);
    } catch (e) { console.error("Erro na busca"); }
}

function setPoint(el, lat, lng, name) {
    el.dataset.lat = lat; 
    el.dataset.lng = lng;
    el.style.borderColor = "#10b981";
    
    if (markers[el.id]) map.removeLayer(markers[el.id]);
    markers[el.id] = L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();
}

// Clique no mapa para celular
map.on('click', function(e) {
    const active = document.activeElement;
    if (active && active.tagName === 'INPUT') {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        active.value = `Local Marcado (${lat.toFixed(3)})`;
        setPoint(active, lat, lng, "Ponto Selecionado");
    }
});

function addMarket() {
    marketCount++;
    const id = `market-${marketCount}`;
    const container = document.getElementById('markets-list');
    const div = document.createElement('div');
    div.className = 'market-entry';
    div.innerHTML = `
        <div style="flex:1">
            <label style="font-size:0.6rem">Mercado ${marketCount}</label>
            <input type="text" id="${id}" class="market-input" placeholder="Nome do mercado" onchange="buscar(this)">
        </div>
        <button onclick="this.parentElement.remove()" style="background:none; color:red; font-size:1.2rem; flex:0">✕</button>
    `;
    container.appendChild(div);
}

async function calculate() {
    const home = document.getElementById('home-input');
    const markets = document.querySelectorAll('.market-input');
    
    if (!home.dataset.lat) return alert("Toque no campo 'Casa' e depois no mapa para marcar sua localização!");

    const points = [[home.dataset.lat, home.dataset.lng]];
    markets.forEach(m => {
        if (m.dataset.lat) points.push([m.dataset.lat, m.dataset.lng]);
    });
    points.push([home.dataset.lat, home.dataset.lng]);

    const coords = points.map(p => `${p[1]},${p[0]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 'Ok') {
        const km = data.routes[0].distance / 1000;
        if (routeLayer) map.removeLayer(routeLayer);
        routeLayer = L.geoJSON(data.routes[0].geometry, {style: {color: '#10b981', weight: 6}}).addTo(map);
        map.fitBounds(routeLayer.getBounds());

        document.getElementById('res-container').style.display = 'flex';
        document.getElementById('km-val').innerText = km.toFixed(2).replace('.', ',');
        document.getElementById('money-val').innerText = 'R$ ' + (km * 0.99).toFixed(2).replace('.', ',');
    }
}