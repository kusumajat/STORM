# 🌍 **STORM** 🌦️  
**Smart Tracking of Real-Time Meteorology**  
Aplikasi Web Cuaca dan Data Geospasial

---

## 📚 **Daftar Isi**  

1. [📝 Deskripsi Produk](#-deskripsi-produk)
2. [🛠️ Dibangun Dengan](#-Dibangun-Dengan)
3. [🌐 Sumber Data](#-sumber-data)
4. [📸 Tangkapan Layar](#-Screenshots)  
5. [🚀 Fitur Utama](#-Eksplorasi-Platform)   
8. [📬 Kontak](#-kontak)  

---

## 📝 **Deskripsi Produk**  
**Smart Tracking of Real-Time Meteorology** adalah platform web interaktif yang memudahkan pengguna untuk melihat **data cuaca** dan **data geospasial**. Dengan platform ini, pengguna dapat mempelajari data aliran sungai secara detail di peta, mengelola data cuaca melalui sistem backend yang kuat, serta menikmati tampilan antarmuka yang modern dan responsif.

Baik Anda seorang **peneliti**, **pengamat cuaca**, atau individu yang tertarik dengan data geografis, platform ini menyediakan alat yang Anda butuhkan untuk memahami tren cuaca dan spasial dengan lebih baik.

---

## 🛠️ **Dibangun Dengan**
### **Frontend**  
- **HTML**: Membuat struktur halaman web.
   - `indeh.html` - Halaman landing page.
   - `services.html` - Halaman informasi services website.
   - `map.html` - Halaman tampilan peta.
- **CSS**: Mendesain tata letak dan tampilan visual.   
   - `style.css` - Style untuk seluruh komponen.  
- **JavaScript**: Menambahkan interaktivitas dan fungsi dinamis.  
   - `popup.js` - Mengatur popup contact.  
   - `script.js` - Menangani logika utama website.  

### **Backend**  
- **PHP**: Pemrograman sisi server untuk operasi CRUD (Create, Read, Update, Delete):  
   - `add_data.php` - Menambahkan data baru.  
   - `delete_data.php` - Menghapus data yang ada.  
   - `get_data.php` - Mengambil data dari database.  

### **Geospatial Data**  
- **GeoJSON**: Menampilkan fitur geografis pada peta.  
   - `aliransungai.geojson` - Data garis aliran sungai.  

### **Assets**  
Elemen visual untuk meningkatkan pengalaman pengguna:  
- `background-services.png` - Gambar latar belakang untuk bagian layanan.  
- `bck-img.png` - Gambar latar belakang halaman utama.  

---

## 🌐 **Sumber Data**  
- **Badan Informasi Geospasial**:  
  Data Jaringan Sungai & Provinsi seluruh Indonesia.  

- **OpenWeatherMap**:  
   - Menyediakan data cuaca **real-time** yang meliputi:  
     - **Suhu** 
     - **Kelembapan**  
     - **Kondisi Cuaca**
     - **Awan**
   - Data diambil secara **dinamis** menggunakan **OpenWeatherMap API**.  
   - Dokumentasi API tersedia di: [OpenWeatherMap](https://openweathermap.org/api)  

---

## 📸 **Screenshots**

### 🔖 **Landing Page**  
Halaman utama menyambut pengguna dengan antarmuka yang bersih dan profesional.  
![image](https://github.com/user-attachments/assets/c3df9ba3-d70b-460e-8f92-2a494157d4da)

### 🔧 **Services Page**  
Deskripsi mendetail mengenai alat dan fitur yang tersedia dalam platform.  
![image](https://github.com/user-attachments/assets/440b5bc2-f6ad-4154-aef7-f8d413d898ac)

### 🗺️ **Interactive Map**  
Jelajahi data geospasial seperti aliran sungai dengan popup interaktif.  
![image](https://github.com/user-attachments/assets/2163a35f-0d97-40dd-930a-9b3ff0d26433)


---

## 🚀 **Eksplorasi Platform**  
### **Fitur Utama yang Tersedia:**
1. 📍 **Tabel Informasi Lokasi**
   - Tabel yang menampilkan informasi cuaca pada lokasi-lokasi tertentu:
![image](https://github.com/user-attachments/assets/2e5e6265-be50-42c0-8705-ffe4c9e38c2a)

2. 📊 **Grafik Intensitas Hujan**
   - Menampilkan **grafik batang** yang menunjukkan:  
     - **Total Curah Hujan (mm)** untuk setiap **provinsi** di Indonesia.  
   - Provinsi yang ditampilkan antara lain:  
     - Aceh, Riau, Bengkulu, Jawa Tengah, Yogyakarta, Papua, dll.
       
      ![image](https://github.com/user-attachments/assets/2b838491-9e57-434a-a6af-1c75250ce5cf)

5. **🤖 Chatbot Interaktif**  
   - **Fungsi Chatbot**:    
     - Menjawab pertanyaan seputar:  
       - Cuaca di [nama kota].
       - Cuaca [nama kota] [angka] jam ke depan.
       - Risiko banjir [sedang].  
       - Risiko banjir [tinggi].  
   - **Teknologi yang digunakan**:  
     - Implementasi chatbot berbasis JavaScript dengan dukungan backend untuk integrasi data cuaca.  
   - **Akses**:  
     - Chatbot tersedia di pojok kanan bawah halaman peta.
       
      ![image](https://github.com/user-attachments/assets/d2b02bb6-0213-4550-b5c0-852b41d396b2)

6. 📝 **Kontribusi Pengguna untuk Informasi Tambahan**  
   - Pengguna dapat menambahkan informasi lokasi baru dengan mengisi **keterangan** pada formulir input.  
   - Fitur ini memungkinkan kontribusi data dari pengguna terkait:  
     - Lokasi rawan bencana (banjir, badai, dll.).  
     - Observasi cuaca langsung.  
   - Data yang dikirimkan akan ditampilkan pada tabel **Informasi Lokasi** dan **Marker** di peta.
   ![image](https://github.com/user-attachments/assets/8e6d347b-9f35-4dae-913b-1354c89ee5c8) ![image](https://github.com/user-attachments/assets/3d562fd6-fd9b-4b11-8b61-10efe2b7aa87)

7. 🗺️ **Detail Informasi Dimanapun pada Peta**  
   - Klik pada titik lokasi pada peta untuk menampilkan **informasi cuaca terkini**:  
     - **Koordinat Lokasi**: Latitude dan Longitude.  
     - **Cuaca Saat Ini**: Kondisi cuaca (contoh: berawan, cerah, hujan).  
     - **Suhu**: Informasi suhu dalam derajat Celcius (°C).  
     - **Kelembapan**: Tingkat kelembapan udara dalam persentase.  
     - **Prakiraan Curah Hujan**: Total curah hujan dalam 24 jam ke depan (mm).  
     - **Risiko Banjir**: Status risiko banjir (Rendah, Sedang, Tinggi).
     - Fitur ini memungkinkan pengguna untuk **mengecek detail cuaca di lokasi manapun** yang ditandai pada peta.
       
     ![image](https://github.com/user-attachments/assets/92b9180b-3a18-425c-857d-b85197151904)





## **Ringkasan**  
Bagian **Eksplorasi Platform** mencakup peta interaktif dengan detail informasi cuaca terkini di titik mana saja pada peta, tabel informasi lokasi, grafik intensitas hujan, chatbot interaktif, serta kontribusi pengguna dalam menambahkan informasi tambahan. Dengan fitur ini, pengguna dapat memahami data cuaca secara real-time dengan mudah dan akurat.  

---

## 📬 **Kontak**
Jika Anda memiliki masukan atau pertanyaan, jangan ragu untuk menghubungi:
- Email: rkusumajati14@gmail.com
- GitHub: kusumajat


## 🌍 Let's make weather data and geospatial insights accessible to everyone! ✨
