import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, child, get, set, update, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyD8khNKiTHatC0Q-IvEP6OBspVP0ydjpwM",
    authDomain: "crud-test-c8dfb.firebaseapp.com",
    databaseURL: "https://crud-test-c8dfb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "crud-test-c8dfb",
    storageBucket: "crud-test-c8dfb.firebasestorage.app",
    messagingSenderId: "324355663408",
    appId: "1:324355663408:web:51f1cc880aecf5901c2ff5",
    measurementId: "G-931BK60GTQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase();
let username = document.getElementById("username");
let password = document.getElementById("password");

let search_name = document.getElementById("nama_teman");

let login_btn = document.getElementById("login");
let sign_btn = document.getElementById("signup");

let add_friend_btn = document.getElementById("add_friend");
let to_map_btn = document.getElementById("back");
let cari_btn = document.getElementById("cari");


function showAlert(type, title, text) {
    Swal.fire({
        icon: type,
        title: title,
        text: text,
    });
}


function Add_User() {
    if (!username.value || !password.value) {
        showAlert('error', 'Error', 'Username dan password harus diisi!');
        return; 
    }else{
        set(ref(db, 'User/' + username.value), {
            password: password.value
        }).then(() => {
            console.log("Success !");
            showAlert('success', 'Berhasil!', 'Akun berhasil dibuat!');
        }).catch((error) => {
            console.log(error);
            showAlert('error', 'Oops...', 'Terjadi kesalahan saat membuat akun: ' + error);
        });
    }

}

function Check_Login() {
    const dbRef = ref(db);

    if (!username.value || !password.value) {
        showAlert('error', 'Error', 'Username dan password harus diisi!');
        return;
    }

    get(child(dbRef, 'User/' + username.value)).then((snapshot) => {
        if (snapshot.exists()) {
            let password_db = snapshot.val().password;
            if (password.value === password_db) {
                console.log("Berhasil Login");
                showAlert('success', 'Berhasil!', 'Login berhasil!');
                sessionStorage.setItem("username", username.value);
                window.location.href = 'map.html';
            } else {
                showAlert('error', 'Oops...', 'Username atau password salah!');
                console.log("Password tidak cocok");
            }
        } else {
            showAlert('error', 'Error', 'Username tidak ditemukan!');
            console.log("Username tidak ditemukan");
        }
    }).catch((error) => {
        showAlert('error', 'Error', 'Gagal terhubung ke database: ' + error.message);
        console.error("Database error:", error);
    });
}

if (sign_btn) {
    sign_btn.addEventListener('click', Add_User);
}
if (login_btn) {
    login_btn.addEventListener('click', Check_Login);
}

export function Update_Location_User(lat, lng, current_time, username, akurasi) {
    set(ref(db, 'LocationUser/' + username), {
        latitude: lat,
        longitude: lng,
        last_update: current_time,
        radius : akurasi
    }).then(() => {
        console.log("update lokasi berhasil : " + current_time);
    }).catch(() => {
        console.log(Error)
    })
}

function To_Add_Friend() {
    window.location.href = 'friend.html';
}

if (add_friend_btn) {
    add_friend_btn.addEventListener('click', To_Add_Friend)
}

export function Back_To_Map() {
    window.location.href = 'map.html';
}

if (to_map_btn) {
    to_map_btn.addEventListener('click', Back_To_Map)
}

function Add_Friend() {
    const dbRef = ref(db);
    const username = sessionStorage.getItem("username");

    if (!username) {
        return showAlert('error', 'Oops...', 'Username tidak ditemukan!');
    }

    if (!search_name) {
        return showAlert('error', 'Oops...', 'Kolom pencarian tidak ditemukan!');
    }

    const searchNameValue = search_name.value;

    if (searchNameValue === username) {
        return showAlert('error', 'Oops...', 'Tidak bisa berteman dengan diri sendiri!');
    }

    get(child(dbRef, 'User/' + searchNameValue)).then((snapshot) => {
        if (snapshot.exists()) {
            get(child(dbRef, 'friend/' + username)).then((friendSnapshot) => {
                let friends = friendSnapshot.exists() ? friendSnapshot.val() : {};

                if (!friends[searchNameValue]) {
                    friends[searchNameValue] = true;
                    update(ref(db, 'friend/' + username), friends);

                    get(child(dbRef, 'friend/' + searchNameValue)).then((friendBSnapshot) => {
                        let friendsB = friendBSnapshot.exists() ? friendBSnapshot.val() : {};

                        if (!friendsB[username]) {
                            friendsB[username] = true;
                            update(ref(db, 'friend/' + searchNameValue), friendsB);
                        }
                    });

                    console.log("Update menambah teman berhasil!");
                    showAlert('success', 'Berhasil!', 'Anda berhasil berteman dengan ' + searchNameValue);
                } else {
                    showAlert('info', 'Info', 'Anda sudah berteman dengan ' + searchNameValue);
                }
            }).catch((error) => {
                console.log("Error fetching friend data: " + error);
                showAlert('error', 'Oops...', 'Terjadi kesalahan saat menambahkan teman: ' + error);
            });
        } else {
            showAlert('error', 'Oops...', 'Teman tidak ditemukan!');
        }
    }).catch((error) => {
        console.log("Terjadi kesalahan: " + error);
        showAlert('error', 'Oops...', 'Terjadi kesalahan saat mencari teman: ' + error);
    });
}

if (cari_btn) {
    cari_btn.addEventListener('click', Add_Friend);
}

// Fungsi untuk mendapatkan teman dan lokasi mereka dari Firebase
export function getFriendsLocation(username) {
    const dbRef = ref(db);

    return new Promise((resolve, reject) => {
        get(child(dbRef, 'friend/' + username))
            .then(snapshot => {
                if (snapshot.exists()) {
                    const friends = snapshot.val();
                    let friendsData = [];

                    Object.keys(friends).forEach(friendName => {
                        get(child(dbRef, 'LocationUser/' + friendName)).then(locationSnapshot => {
                            if (locationSnapshot.exists()) {
                                const locationData = locationSnapshot.val();
                                friendsData.push({
                                    name: friendName,
                                    lat: locationData.latitude,
                                    lng: locationData.longitude,
                                    lastUpdated: locationData.last_update,
                                    accuracy: locationData.radius
                                });
                            }
                        }).catch(err => reject(err));
                    });

                    setTimeout(() => resolve(friendsData), 1000);
                } else {
                    showAlert('error', 'Oops...', 'Tidak ada teman ditemukan!');
                }
            })
            .catch(err => reject(err));
    });
}