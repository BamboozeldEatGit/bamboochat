// Replace these placeholders with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCnipQLIPAe8ey1AKMGAQO9CGAdiSIqauU",
    authDomain: "momandmechat-196f2.firebaseapp.com",
    databaseURL: "https://momandmechat-196f2-default-rtdb.firebaseio.com",
    projectId: "momandmechat-196f2",
    storageBucket: "momandmechat-196f2.appspot.com",
    messagingSenderId: "634171816302",
    appId: "1:634171816302:web:f84da0c9c9b9aa4a33697f",
    measurementId: "G-YBRNK2TYH7"
};

// Initialize Firebase with the configuration
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

