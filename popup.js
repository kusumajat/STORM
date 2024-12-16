// Ambil elemen tombol dan popup
const contactBtn = document.getElementById('contact-btn');
const popup = document.getElementById('popup');
const closePopup = document.getElementById('close-popup');

// Tampilkan popup saat tombol Contact diklik
contactBtn.addEventListener('click', () => {
    popup.style.display = 'flex';
});

// Sembunyikan popup saat tombol close diklik
closePopup.addEventListener('click', () => {
    popup.style.display = 'none';
});

// Sembunyikan popup saat klik di luar konten popup
window.addEventListener('click', (e) => {
    if (e.target === popup) {
        popup.style.display = 'none';
    }
});
