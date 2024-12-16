// API Key OpenWeatherMap
const apiKey = 'd69b232e7e3933b8a95cf879337eaaa1';

// Inisialisasi peta
const map = L.map('map').setView([-3.528435966366207, 116.5278919953454], 6);

// Tambahkan basemap OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Lapisan OpenWeatherMap
const cloudsLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid=${apiKey}`,
    {
        attribution: '&copy; OpenWeatherMap',
        opacity: 0.6,
    }
);

const radarLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=${apiKey}`,
    {
        attribution: '&copy; OpenWeatherMap',
        opacity: 0.6,
    }
);

const temperatureLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/temp/{z}/{x}/{y}.png?appid=${apiKey}`,
    {
        attribution: '&copy; OpenWeatherMap',
        opacity: 0.6,
    }
);

cloudsLayer.addTo(map);
radarLayer.addTo(map);

// Layer Poligon Indonesia dari GeoServer (WMS)
var indonesiaLayer = L.tileLayer.wms('http://localhost:8080/geoserver/responsi/wms?', {
    layers: 'responsi:Export_Output_2',
    styles: 'indostyle',               
    format: 'image/png',
    transparent: true,
    attribution: 'GeoServer WMS'
});

// Tambahkan Layer ke Kontrol Layer
var overlayMaps = {
    "Awan": cloudsLayer,
    "Radar (Hujan)": radarLayer,
    "Suhu": temperatureLayer,
    "Poligon Indonesia": indonesiaLayer
};

// Kontrol Layer
L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

// Menambahkan GeoJSON Sungai
fetch('data/aliransungai.geojson')
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        // Menambahkan GeoJSON ke peta dengan style khusus
        L.geoJSON(data, {
            style: function (feature) {
                return {
                    color: '#34baeb',
                    weight: 2,
                    opacity: 0.3
                };
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(feature.properties.name);
                }
            }
        }).addTo(map);
    })
    .catch(function (error) {
        console.log('Error memuat GeoJSON: ' + error);
    });


// Fungsi untuk mendapatkan data cuaca berdasarkan koordinat
async function getWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Fungsi untuk mendapatkan data prakiraan cuaca (forecast) berdasarkan koordinat
async function getForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        return null;
    }
}

// Fungsi untuk mendapatkan data cuaca berdasarkan nama kota
async function getWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Variabel untuk menyimpan marker saat ini
let currentMarker = null;

// Event listener untuk klik pada peta
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;

    // Hapus marker lama jika ada
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Tambahkan marker baru di lokasi yang diklik
    currentMarker = L.marker([lat, lng]).addTo(map);

    // Ambil data cuaca berdasarkan koordinat
    const weather = await getWeather(lat, lng);

    // Ambil data prakiraan cuaca (forecast)
    const forecast = await getForecast(lat, lng);

    // Analisis risiko banjir
    const { totalPrecipitation, floodRisk } = await analyzeFloodRisk(forecast);

    const buttonHTML = `<button class='add-data-btn' style="padding: 10px 20px; background-color: #94b9ff; color: white; font-weight: bold; font-size: 14px; border: none; border-radius: 20px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); cursor: pointer; transition: all 0.3s ease-in-out;" onmouseover="this.style.backgroundColor='#769ced'; this.style.boxShadow='0px 6px 8px rgba(0, 0, 0, 0.15)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.backgroundColor='#94b9ff'; this.style.boxShadow='0px 4px 6px rgba(0, 0, 0, 0.1)'; this.style.transform='translateY(0px)';">Add Data</button>`;

    // Buat konten popup
    const popupContent = weather && forecast
        ? `
      <h3>Informasi Cuaca</h3>
      <p><strong>Lokasi:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
      <p><strong>Cuaca Saat Ini:</strong> ${weather.weather[0].description}</p>
      <p><strong>Suhu:</strong> ${weather.main.temp}°C</p>
      <p><strong>Kelembapan:</strong> ${weather.main.humidity}%</p>
      <p><strong>Total Prakiraan Curah Hujan (24 jam ke depan):</strong> ${totalPrecipitation.toFixed(2)} mm</p>
      <p><strong>Risiko Banjir:</strong> ${floodRisk}</p>
      ${buttonHTML}
    `
        : `<p>Gagal memuat data cuaca atau prakiraan untuk lokasi ini.</p>`;

    // Tambahkan popup ke marker
    currentMarker.bindPopup(popupContent).openPopup();

    // Event listener untuk tombol di dalam popup
    map.once('popupopen', () => {
        const addDataBtn = document.querySelector('.add-data-btn'); // Selektor kelas
        if (addDataBtn) {
            addDataBtn.addEventListener('click', () => {
                const newPopupOverlay = document.createElement('div');
                newPopupOverlay.className = 'new-popup';
                newPopupOverlay.innerHTML = `
                <div class="popup-content">
                    <span id="close-new-popup" class="close-btn">&times;</span>
                    <h2>Tambah Data ke Database</h2>
                    <label for="keterangan">Keterangan:</label>
                    <input type="text" id="keterangan" name="keterangan" placeholder="Masukkan keterangan" style="width: 100%; padding: 10px; margin-top: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px;">
                    <button id="submit-data" style="padding: 10px 20px; background-color: #94b9ff; color: white; font-weight: bold; font-size: 14px; border: none; border-radius: 20px; cursor: pointer;">Add</button>
                </div>
            `;
    
                document.body.appendChild(newPopupOverlay);
    
                // Tampilkan popup baru
                newPopupOverlay.style.display = 'flex';
    
                // Tambahkan event listener untuk menutup popup saat klik di luar konten popup
                newPopupOverlay.addEventListener('click', (e) => {
                    if (e.target === newPopupOverlay) {
                        newPopupOverlay.style.display = 'none';
                        document.body.removeChild(newPopupOverlay);
                    }
                });
    
                // Tambahkan event listener untuk tombol tutup
                const closeBtn = document.getElementById('close-new-popup');
                closeBtn.addEventListener('click', () => {
                    newPopupOverlay.style.display = 'none';
                    document.body.removeChild(newPopupOverlay);
                });
    
                // Tambahkan event listener untuk tombol Add
                const submitDataBtn = document.getElementById('submit-data');
                if (submitDataBtn) {
                    submitDataBtn.addEventListener('click', async () => {
                        const keterangan = document.getElementById('keterangan').value.trim();
                        if (!keterangan) {
                            alert('Keterangan tidak boleh kosong!');
                            return;
                        }
    
                        // Kirim data ke server menggunakan fetch
                        try {
                            const response = await fetch('add_data.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    longitude: currentMarker.getLatLng().lng,
                                    latitude: currentMarker.getLatLng().lat,
                                    keterangan: keterangan,
                                }),
                            });
    
                            const result = await response.json();
                            if (response.ok && result.success) {
                                alert('Data berhasil ditambahkan ke database!');
                                newPopupOverlay.style.display = 'none';
                                document.body.removeChild(newPopupOverlay);
                            } else {
                                alert(`Gagal: ${result.error || 'Terjadi kesalahan'}`);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            alert('Terjadi kesalahan saat mengirim data. Periksa koneksi atau server Anda.');
                        }
                    });
                }
            });
        }
    });
});


// Fungsi untuk menganalisis risiko banjir
async function analyzeFloodRisk(forecast) {
    let totalPrecipitation = 0;
    const currentTime = Math.floor(Date.now() / 1000); // Waktu saat ini dalam Unix timestamp
    const next24hTime = currentTime + 24 * 60 * 60; // Timestamp untuk 24 jam ke depan

    if (forecast && forecast.list && forecast.list.length > 0) {
        forecast.list.forEach(forecastEntry => {
            if (forecastEntry.dt <= next24hTime) {
                if (forecastEntry.rain && forecastEntry.rain['3h']) {
                    totalPrecipitation += forecastEntry.rain['3h'];
                }
            }
        });
    }

    // Menentukan tingkat risiko banjir
    let floodRisk = 'Rendah';

    if (totalPrecipitation > 50) {
        floodRisk = 'Tinggi';
    } else if (totalPrecipitation > 20) {
        floodRisk = 'Sedang';
    }

    return { totalPrecipitation, floodRisk };
}

// Chatbot Logika
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotMessages = document.getElementById('chatbot-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
// Tombol toggle chatbot
const chatbotToggle = document.getElementById('chatbot-toggle');

// Event listener untuk membuka/menutup chatbot
chatbotToggle.addEventListener('click', () => {
    if (chatbotContainer.style.display === 'none' || !chatbotContainer.style.display) {
        chatbotContainer.style.display = 'flex';
    } else {
        chatbotContainer.style.display = 'none';
    }
});

// Tambahkan pesan ke area pesan chatbot
function addMessage(message, isBot = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(isBot ? 'bot-message' : 'user-message');
    messageElement.textContent = message;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Array untuk menyimpan data laporan cuaca
const weatherReports = [];

// Daftar kota yang akan dianalisis
const cityList = [
    'Banda Aceh', 'Lhokseumawe', 'Langsa', 'Meulaboh', // Aceh
    'Medan', 'Binjai', 'Pematangsiantar', 'Tebing Tinggi', // Sumatera Utara
    'Padang', 'Bukittinggi', 'Payakumbuh', 'Pariaman', // Sumatera Barat
    'Pekanbaru', 'Dumai', // Riau
    'Jambi', 'Sungai Penuh', // Jambi
    'Palembang', 'Lubuklinggau', 'Prabumulih', 'Pagar Alam', // Sumatera Selatan
    'Bengkulu', // Bengkulu
    'Bandar Lampung', 'Metro', // Lampung
    'Pangkalpinang', // Kepulauan Bangka Belitung
    'Tanjung Pinang', 'Batam', // Kepulauan Riau
    'Jakarta', // DKI Jakarta
    'Bandung', 'Bekasi', 'Bogor', 'Depok', 'Cimahi', // Jawa Barat
    'Semarang', 'Surakarta', 'Tegal', 'Magelang', // Jawa Tengah
    'Yogyakarta', // DI Yogyakarta
    'Surabaya', 'Malang', 'Kediri', 'Madiun', 'Blitar', // Jawa Timur
    'Tangerang', 'Cilegon', 'Serang', 'South Tangerang', // Banten
    'Denpasar', // Bali
    'Mataram', 'Bima', // Nusa Tenggara Barat
    'Kupang', // Nusa Tenggara Timur
    'Pontianak', 'Singkawang', // Kalimantan Barat
    'Palangka Raya', // Kalimantan Tengah
    'Banjarmasin', 'Banjarbaru', // Kalimantan Selatan
    'Samarinda', 'Balikpapan', 'Bontang', // Kalimantan Timur
    'Tanjung Selor', 'Tarakan', // Kalimantan Utara
    'Manado', 'Bitung', 'Tomohon', // Sulawesi Utara
    'Palu', // Sulawesi Tengah
    'Makassar', 'Parepare', 'Palopo', // Sulawesi Selatan
    'Kendari', 'Bau-Bau', // Sulawesi Tenggara
    'Gorontalo', // Gorontalo
    'Mamuju', // Sulawesi Barat
    'Ambon', 'Tual', // Maluku
    'Ternate', 'Tidore', // Maluku Utara
    'Jayapura', // Papua
    'Manokwari', 'Sorong', // Papua Barat
    'Nabire', // Papua Tengah
    'Wamena', // Papua Pegunungan
    'Merauke', // Papua Selatan
    'Fakfak' // Papua Barat Daya
];

const provinceList = [
    "Aceh",
    "Sumatera Utara",
    "Sumatera Barat",
    "Riau",
    "Jambi",
    "Sumatera Selatan",
    "Bengkulu",
    "Lampung",
    "Kepulauan Bangka Belitung",
    "Kepulauan Riau",
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "Yogyakarta",
    "Jawa Timur",
    "Banten",
    "Bali",
    "Nusa Tenggara Barat",
    "Nusa Tenggara Timur",
    "Kalimantan Barat",
    "Kalimantan Tengah",
    "Kalimantan Selatan",
    "Kalimantan Timur",
    "Kalimantan Utara",
    "Sulawesi Utara",
    "Sulawesi Tengah",
    "Sulawesi Selatan",
    "Sulawesi Tenggara",
    "Gorontalo",
    "Sulawesi Barat",
    "Maluku",
    "Maluku Utara",
    "Papua",
];



// Event listener untuk mengirim pesan
sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (!message) return;

    // Tampilkan pesan pengguna
    addMessage(message);

    // Logika bot
    // Pola untuk "cuaca [kota] [jam] jam ke depan"
    const forecastPattern = /cuaca (.+) (\d+) jam ke depan/i;
    const forecastMatch = message.match(forecastPattern);

    if (forecastMatch) {
        const cityName = forecastMatch[1].trim();
        const hoursAhead = parseInt(forecastMatch[2], 10);

        // Validasi jam
        if (isNaN(hoursAhead) || hoursAhead <= 0) {
            addMessage('Jam harus berupa angka positif.', true);
            return;
        }

        // Ambil koordinat kota menggunakan geocoding API
        const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
        try {
            const geoResponse = await fetch(geocodingUrl);
            if (!geoResponse.ok) {
                throw new Error(`Error ${geoResponse.status}: ${geoResponse.statusText}`);
            }
            const geoData = await geoResponse.json();
            if (geoData && geoData.length > 0) {
                const { lat, lon } = geoData[0];

                // Ambil prakiraan cuaca
                const forecast = await getForecast(lat, lon);

                // Cari data prakiraan pada waktu tertentu
                const targetTime = Math.floor(Date.now() / 1000) + hoursAhead * 60 * 60;
                const forecastEntry = forecast.list.find(entry => entry.dt >= targetTime);

                if (forecastEntry) {
                    const botResponse = `
                    Prakiraan cuaca di ${cityName} untuk ${hoursAhead} jam ke depan:
                    Cuaca: ${forecastEntry.weather[0].description},
                    Suhu: ${forecastEntry.main.temp}°C,
                    Kelembapan: ${forecastEntry.main.humidity}%,
                    Curah Hujan: ${(forecastEntry.rain && forecastEntry.rain['3h']) ? forecastEntry.rain['3h'] + ' mm' : 'Tidak ada'}`;
                    addMessage(botResponse, true);
                } else {
                    addMessage('Maaf, saya tidak menemukan data prakiraan untuk waktu tersebut.', true);
                }
            } else {
                addMessage('Maaf, saya tidak dapat menemukan lokasi tersebut.', true);
            }
        } catch (error) {
            console.error('Error fetching geocoding data:', error);
            addMessage('Maaf, terjadi kesalahan saat mengambil data.', true);
        }
    } else if (message.toLowerCase().includes('cuaca di')) {
        const cityName = message.split('cuaca di')[1]?.trim();
        if (cityName) {
            const weather = await getWeatherByCity(cityName);
            if (weather) {
                const botResponse = `
                Cuaca di ${cityName}:
                ${weather.weather[0].description},
                Suhu: ${weather.main.temp}°C,
                Kelembapan: ${weather.main.humidity}%`;
                addMessage(botResponse, true);
            } else {
                addMessage('Maaf, saya tidak dapat menemukan informasi cuaca untuk kota tersebut.', true);
            }
        } else {
            addMessage('Tolong sebutkan nama kota setelah "cuaca di".', true);
        }
    } else if (message.toLowerCase().includes('banjir di')) {
        const cityName = message.split('banjir di')[1]?.trim();
        if (cityName) {
            // Ambil koordinat kota menggunakan geocoding API
            const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
            try {
                const geoResponse = await fetch(geocodingUrl);
                if (!geoResponse.ok) {
                    throw new Error(`Error ${geoResponse.status}: ${geoResponse.statusText}`);
                }
                const geoData = await geoResponse.json();
                if (geoData && geoData.length > 0) {
                    const { lat, lon } = geoData[0];
                    const forecast = await getForecast(lat, lon);
                    const { totalPrecipitation, floodRisk } = await analyzeFloodRisk(forecast);

                    const botResponse = `
                    Risiko banjir di ${cityName} dalam 24 jam ke depan adalah ${floodRisk}.
                    Total prakiraan curah hujan: ${totalPrecipitation.toFixed(2)} mm.`;

                    addMessage(botResponse, true);
                } else {
                    addMessage('Maaf, saya tidak dapat menemukan lokasi tersebut.', true);
                }
            } catch (error) {
                console.error('Error fetching geocoding data:', error);
                addMessage('Maaf, terjadi kesalahan saat mengambil data.', true);
            }
        } else {
            addMessage('Tolong sebutkan nama kota setelah "banjir di".', true);
        }
    } else if (message.toLowerCase().includes('risiko banjir tinggi')) {
        addMessage('Sedang memproses daftar kota dengan risiko banjir tinggi...', true);
        const highRiskCities = await getCitiesByFloodRisk('Tinggi');
        const botResponse = highRiskCities.length > 0
            ? `Kota dengan risiko banjir tinggi:\n- ${highRiskCities.join('\n- ')}`
            : 'Tidak ada kota dengan risiko banjir tinggi saat ini.';
        addMessage(botResponse, true);
    } else if (message.toLowerCase().includes('risiko banjir sedang')) {
        addMessage('Sedang memproses daftar kota dengan risiko banjir sedang...', true);
        const mediumRiskCities = await getCitiesByFloodRisk('Sedang');
        const botResponse = mediumRiskCities.length > 0
            ? `Kota dengan risiko banjir sedang:\n- ${mediumRiskCities.join('\n- ')}`
            : 'Tidak ada kota dengan risiko banjir sedang saat ini.';
        addMessage(botResponse, true);
    } else {
        addMessage('Maaf, saya hanya dapat memberikan informasi cuaca dan risiko banjir.', true);
    }

    // Kosongkan input pengguna
    userInput.value = '';
});

// Fungsi untuk mendapatkan daftar kota berdasarkan tingkat risiko banjir
async function getCitiesByFloodRisk(riskLevel) {
    const citiesWithRisk = [];
    for (const city of cityList) {
        // Ambil koordinat kota menggunakan geocoding API
        const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
        try {
            const geoResponse = await fetch(geocodingUrl);
            if (!geoResponse.ok) {
                throw new Error(`Error ${geoResponse.status}: ${geoResponse.statusText}`);
            }
            const geoData = await geoResponse.json();
            if (geoData && geoData.length > 0) {
                const { lat, lon } = geoData[0];
                const forecast = await getForecast(lat, lon);
                const { floodRisk } = await analyzeFloodRisk(forecast);

                if (floodRisk === riskLevel) {
                    citiesWithRisk.push(city);
                }
            }
        } catch (error) {
            console.error(`Error processing city ${city}:`, error);
        }
    }
    return citiesWithRisk;
}

// Fungsi untuk mengambil data cuaca untuk semua kota dalam cityList
async function fetchWeatherReportsForCities() {
    for (let i = 0; i < cityList.length; i++) {
        const city = cityList[i];
        try {
            const weather = await getWeatherByCity(city);
            const forecast = await getForecast(weather.coord.lat, weather.coord.lon);
            const { totalPrecipitation, floodRisk } = await analyzeFloodRisk(forecast);

            // Simpan data ke weatherReports
            weatherReports.push({
                lokasi: city,
                cuaca: weather.weather[0].description,
                suhu: weather.main.temp,
                kelembapan: weather.main.humidity,
                totalCurahHujan: totalPrecipitation.toFixed(2),
                risikoBanjir: floodRisk
            });

            // Tambahkan jeda 1 detik antara permintaan
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error fetching data for city ${city}:`, error);
        }
    }
}

// Fungsi untuk mengonversi data ke CSV
function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr);

    return array.map(row => {
        return Object.values(row).map(value => {
            // Jika nilai mengandung koma, bungkus dengan tanda kutip
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            return value;
        }).join(',');
    }).join('\r\n');
}

// Event listener untuk tombol unduh
const downloadButton = document.getElementById('download-button');

downloadButton.addEventListener('click', async () => {
    if (weatherReports.length !== cityList.length) {
        // Tampilkan pesan kepada pengguna
        alert('Mengambil data cuaca. Ini mungkin memerlukan beberapa saat. Silakan tunggu...');

        // Ambil data cuaca untuk semua kota
        await fetchWeatherReportsForCities();
    }

    // Setelah data diambil, langsung unduh laporan
    const csvData = convertToCSV(weatherReports);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'laporan_cuaca.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});


// Fungsi untuk mengambil data intensitas hujan berdasarkan daftar provinsi
async function getRainIntensityByProvince() {
    const provinceRainData = [];
    for (const province of provinceList) {
        try {
            // Ambil data geolokasi provinsi menggunakan Geocoding API
            const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${province}&limit=1&appid=${apiKey}`;
            const geoResponse = await fetch(geocodingUrl);
            const geoData = await geoResponse.json();

            if (geoData && geoData.length > 0) {
                const { lat, lon } = geoData[0];

                // Ambil data prakiraan cuaca menggunakan One Call API
                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                const forecastResponse = await fetch(forecastUrl);
                const forecastData = await forecastResponse.json();

                // Totalkan curah hujan dalam 24 jam
                let totalRain = 0;
                if (forecastData && forecastData.list) {
                    forecastData.list.forEach((entry) => {
                        if (entry.rain && entry.rain['3h']) {
                            totalRain += entry.rain['3h'];
                        }
                    });
                }

                // Simpan data curah hujan provinsi
                provinceRainData.push({ province, totalRain: totalRain.toFixed(2) });
            }
        } catch (error) {
            console.error(`Error fetching rain data for province ${province}:`, error);
        }
    }
    return provinceRainData;
}

// Fungsi untuk membuat grafik menggunakan Chart.js
async function createRainIntensityChartByProvince() {
    try {
        const rainData = await getRainIntensityByProvince(); // Pastikan fungsi ini tersedia dan benar

        // Validasi apakah data tersedia
        if (!rainData || rainData.length === 0) {
            console.error('Data tidak tersedia atau kosong');
            return;
        }

        // Ekstrak nama provinsi dan data curah hujan
        const labels = rainData.map((data) => data.province);
        const data = rainData.map((data) => parseFloat(data.totalRain) || 0); // Tambahkan default 0 jika data invalid

        // Ambil konteks canvas
        const ctx = document.getElementById('rainIntensityChart').getContext('2d');

        // Buat gradien untuk warna batang
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(60, 184, 63, 0.8)'); // Gradien putih ke kuning terang

        // Buat grafik menggunakan Chart.js
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels, // Label sumbu X
                datasets: [
                    {
                        label: 'Total Intensitas Hujan (mm)',
                        data: data, // Data curah hujan
                        backgroundColor: gradient, // Gradien warna batang
                        borderColor: 'rgba(255, 255, 255, 1)', // Warna border putih
                        borderWidth: 2, // Ketebalan border
                        borderRadius: 10, // Radius pada batang grafik
                        hoverBackgroundColor: 'rgba(255, 255, 255, 0.9)', // Warna saat hover
                        hoverBorderColor: 'rgba(60, 184, 63, 0.8)', // Warna border saat hover
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff', // Warna teks legend putih
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: 'Arial, sans-serif',
                            },
                        },
                    },
                    tooltip: {
                        backgroundColor: '#ffffff', // Warna latar tooltip putih
                        titleFont: {
                            size: 14,
                            family: 'Arial, sans-serif',
                            weight: 'bold',
                            color: '#003e7e', // Warna teks tooltip
                        },
                        bodyFont: {
                            size: 12,
                            family: 'Arial, sans-serif',
                            color: '#003e7e', // Warna isi teks tooltip
                        },
                        bodyColor: '#003e7e',
                        borderWidth: 1,
                        borderColor: '#BDDAB1', // Warna border tooltip kuning terang
                        padding: 10,
                        cornerRadius: 6,
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff', // Warna teks sumbu X putih
                            font: {
                                size: 12,
                                family: 'Arial, sans-serif',
                                weight: 'bold',
                            },
                        },
                        title: {
                            display: true,
                            text: 'Provinsi',
                            color: '#ffffff', // Warna judul putih
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: 'Arial, sans-serif',
                            },
                        },
                        grid: {
                            display: false, // Hilangkan garis grid di sumbu X
                        },
                    },
                    y: {
                        ticks: {
                            color: '#ffffff', // Warna teks sumbu Y putih
                            font: {
                                size: 12,
                                family: 'Arial, sans-serif',
                                weight: 'bold',
                            },
                        },
                        title: {
                            display: true,
                            text: 'Curah Hujan (mm)',
                            color: '#ffffff', // Warna judul putih
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: 'Arial, sans-serif',
                            },
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.3)', // Warna garis grid putih transparan
                            borderDash: [5, 5], // Garis putus-putus
                        },
                        beginAtZero: true,
                        suggestedMax: 100, // Batas maksimum sumbu Y
                    },
                },
            },
        });
    } catch (error) {
        console.error('Terjadi kesalahan saat membuat grafik:', error);
    }
}


// Panggil fungsi untuk membuat grafik
createRainIntensityChartByProvince();

// Script untuk tabel
async function loadTableData() {
    try {
        const response = await fetch('get_data.php');
        const result = await response.json();

        if (response.ok && result.success) {
            const data = result.data;

            // Tambahkan data ke tabel
            const tbody = document.querySelector('#location-table tbody');
            tbody.innerHTML = '';
            data.forEach((item, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.latitude}</td>
                        <td>${item.longitude}</td>
                        <td>${item.keterangan}</td>
                        <td>
                            <button class="delete-btn" data-id="${item.no}" style="padding: 5px 10px; background-color: #FF6347; color: white; border: none; border-radius: 5px; cursor: pointer;">Hapus</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            // Tambahkan event listener untuk tombol hapus
            const deleteButtons = document.querySelectorAll('.delete-btn');
            deleteButtons.forEach((button) => {
                button.addEventListener('click', async (e) => {
                    const no = e.target.getAttribute('data-id'); // Ambil ID dari atribut data
                    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                        await deleteData(no);
                        loadTableData(); // Refresh tabel setelah penghapusan
                    }
                });
            });
        } else {
            alert('Gagal mengambil data dari server.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengambil data.');
    }
}

async function deleteData(no) {
    try {
        const response = await fetch('delete_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `no=${no}`, // Kirim ID untuk penghapusan
        });

        const result = await response.json();
        if (result.success) {
            alert('Data berhasil dihapus.');
        } else {
            alert(`Gagal menghapus data: ${result.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menghapus data.');
    }
}

loadTableData();


// Menampilkan titik data tabel
async function loadDataToMap() {
    try {
        const response = await fetch('get_data.php');
        const result = await response.json();

        if (response.ok && result.success) {
            const data = result.data;

            // Tambahkan marker ke peta berdasarkan data
            data.forEach((item) => {
                const marker = L.marker([item.latitude, item.longitude]).addTo(map);
                marker.bindPopup(`
                    <h3>Informasi Lokasi</h3>
                    <p><strong>Keterangan:</strong> ${item.keterangan}</p>
                    <p><strong>Latitude:</strong> ${item.latitude}</p>
                    <p><strong>Longitude:</strong> ${item.longitude}</p>
                `);
            });
        } else {
            alert('Gagal mengambil data dari server.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengambil data.');
    }
}

loadDataToMap();
