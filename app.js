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

function Add_User() {
    set(ref(db, 'User/' + username.value), {
        password: password.value
    }).then(() => {
        alert("Sign Up Successfully");
        console.log("Success !");
    }).catch(() => {
        alert("Error !");
        console.log(Error);
    })
}

function Check_Login() {
    const dbRef = ref(db);

    get(child(dbRef, 'User/' + username.value)).then((snapshot) => {
        if (snapshot.exists()) {
            let password_db = snapshot.val().password;
            if (password.value === password_db) {
                alert("Berhasil Login");
                console.log("Berhasil Login");
                sessionStorage.setItem("username", username.value)
                window.location.href = 'map.html';
            }
            else {
                alert("Wrong username or password !");
                console.log("Kesalahan data")
            }
        }
        else {
            alert("Error : Something Wrong !");
            console.log("error data");
        }
    }).catch(() => {
        alert("Error !");
        console.log(Error);
    })
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

    // Ambil username dari sessionStorage
    const username = sessionStorage.getItem("username");

    if (!username) {
        console.log("Username tidak ditemukan, pastikan user sudah login.");
        return;
    }

    if (!search_name) {
        console.log("Elemen search_name tidak ditemukan.");
        return;
    }

    const searchNameValue = search_name.value;

    // Cek jika user mencoba berteman dengan dirinya sendiri
    if (searchNameValue === username) {
        alert("Anda tidak bisa berteman dengan diri sendiri!");
        return;
    }

    get(child(dbRef, 'User/' + searchNameValue)).then((snapshot) => {
        if (snapshot.exists()) {
            // Mengambil data teman pengguna (username)
            get(child(dbRef, 'friend/' + username)).then((friendSnapshot) => {
                let friends = friendSnapshot.exists() ? friendSnapshot.val() : {};

                // Jika teman belum ada, tambahkan teman baru
                if (!friends[searchNameValue]) {
                    friends[searchNameValue] = true; // Menambahkan teman baru

                    // Update data teman untuk pengguna (A)
                    update(ref(db, 'friend/' + username), friends);

                    // Mengambil data teman untuk pengguna (B)
                    get(child(dbRef, 'friend/' + searchNameValue)).then((friendBSnapshot) => {
                        let friendsB = friendBSnapshot.exists() ? friendBSnapshot.val() : {};

                        // Tambahkan username pengguna A ke teman B
                        if (!friendsB[username]) {
                            friendsB[username] = true;
                            update(ref(db, 'friend/' + searchNameValue), friendsB);
                        }
                    });

                    console.log("Update menambah teman berhasil!");
                    alert("Berhasil berteman dengan " + searchNameValue);
                } else {
                    alert("Anda sudah berteman dengan " + searchNameValue);
                }
            }).catch((error) => {
                console.log("Error fetching friend data: " + error);
            });
        } else {
            alert("User tidak ada");
        }
    }).catch((error) => {
        alert("Error!");
        console.log("Terjadi kesalahan: " + error);
    });
}

if (cari_btn) {
    cari_btn.addEventListener('click', Add_Friend);
}

// Fungsi untuk mendapatkan teman dan lokasi mereka dari Firebase
export function getFriendsLocation(username) {
    const dbRef = ref(db);

    return new Promise((resolve, reject) => {
        // Ambil data teman dari Firebase berdasarkan username
        get(child(dbRef, 'friend/' + username))
            .then(snapshot => {
                if (snapshot.exists()) {
                    const friends = snapshot.val();
                    let friendsData = [];

                    // Iterasi untuk setiap teman yang ada di 'friend/username'
                    Object.keys(friends).forEach(friendName => {
                        // Ambil data lokasi teman dari path 'location/{friendName}'
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

                    // Resolusi data setelah semua teman diproses
                    setTimeout(() => resolve(friendsData), 1000);
                } else {
                    reject("No friends data found");
                }
            })
            .catch(err => reject(err));
    });
}