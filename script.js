function mulai() {

    // Ambil nama yang diketik
    let nama =
        document.getElementById("nama").value;


    // Kalau nama kosong
    if (nama.trim() === "") {

        alert("Tulis namamu dulu yaa 💗");

        return;

    }


    // Masukkan nama ke halaman ulang tahun
    document.getElementById("namaTampil").innerText = nama;


    // Hilangkan cover
    document.getElementById("cover").style.display = "none";


    // Tampilkan halaman ulang tahun
    document.getElementById("halaman1").style.display = "flex";

}


function bukaHalaman2() {

    document.getElementById("halaman1").style.display = "none";

    document.getElementById("halaman2").style.display = "flex";

}


function bukaHalaman3() {

    document.getElementById("halaman2").style.display = "none";

    document.getElementById("halaman3").style.display = "flex";

}