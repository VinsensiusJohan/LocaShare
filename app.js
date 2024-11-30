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

let login_btn = document.getElementById("login");
let sign_btn = document.getElementById("signup");

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

if(sign_btn){
    sign_btn.addEventListener('click', Add_User);
}
if(login_btn){
    login_btn.addEventListener('click', Check_Login);
}

export function Update_Location_User(lat, lng, current_time, username){
    set(ref(db, 'LocationUser/' + username),{
        latitude : lat,
        longitude : lng,
        last_update : current_time
    }).then(()=>{
        console.log("update lokasi berhasil : " + current_time);
    }).catch(()=>{
        console.log(Error)
    })
}


