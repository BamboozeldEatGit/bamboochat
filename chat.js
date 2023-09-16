var db = firebase.database();
var messagesRef;
var currentRoom = "default";
var messaging = firebase.messaging();

function sendMessage() {
    var messageInput = document.getElementById("messageInput");
    var messageText = messageInput.value.trim();

    if (messageText !== "") {
        var user = firebase.auth().currentUser;

        if (user) {
            var message = {
                text: messageText,
                sender: user.displayName,
                timestamp: new Date().getTime(),
            };

            messagesRef.push(message);
            messageInput.value = "";

            sendPushNotification(currentRoom, user.displayName, messageText);
        } else {
            alert("You are not signed in. Please sign in to send messages.");
        }
    }
}

function signOut() {
    firebase.auth().signOut().then(function() {
        alert("You have been signed out.");
    }).catch(function(error) {
        console.error("Sign out error:", error);
    });
}

function signInWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

function createRoom() {
    var roomInput = document.getElementById("roomInput");
    var roomName = roomInput.value.trim();

    if (roomName !== "") {
        db.ref("rooms/" + roomName).set({
            created_at: new Date().toISOString(),
        });

        currentRoom = roomName;
        initializeRoom();
        roomInput.value = "";
    } else {
        alert("Please enter a room name.");
    }
}

function joinRoom() {
    var joinRoomInput = document.getElementById("joinRoomInput");
    var roomCode = joinRoomInput.value.trim();

    if (roomCode !== "") {
        currentRoom = roomCode;
        initializeRoom();
        joinRoomInput.value = "";
    } else {
        alert("Please enter a room code.");
    }
}

function subscribeToRoom(roomId) {
    const user = firebase.auth().currentUser;

    if (user) {
        const userId = user.uid;

        db.ref(`roomSubscriptions/${roomId}/${userId}`).set(true);
    }
}

function sendPushNotification(userId, senderName, messageText) {
    messaging.getToken()
        .then(function(currentToken) {
            if (currentToken) {
                const notificationPayload = {
                    title: `New message from ${senderName}`,
                    body: messageText,
                };

                fetch("https://fcm.googleapis.com/fcm/send", {
                    method: "POST",
                    headers: {
                        "Authorization": "key=AAAAk6eV-W4:APA91bG7VbSNnCsAkC_oX_eGy1m7rcGqiEXADYYTawQJrPFgRtJLde2EVBIo6qP1qyXKD9_waKNNWv42UFsO5B7LUGpPnygpZIKxVD1ZClD9WlEhgUkxzVtwsFD8OOTbZl51gWffNqwf",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        to: currentToken,
                        data: {
                            notification: JSON.stringify(notificationPayload),
                        },
                    }),
                })
                .then(function(response) {
                    console.log("Notification sent successfully:", response);
                })
                .catch(function(error) {
                    console.error("Error sending notification:", error);
                });
            }
        })
        .catch(function(error) {
            console.error("Error getting FCM token:", error);
        });
}

function initializeRoom() {
    messagesRef = db.ref("rooms/" + currentRoom + "/messages");

    var messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    messagesRef.on("child_added", function(snapshot) {
        var message = snapshot.val();
        var messageDiv = document.createElement("div");
        messageDiv.textContent = message.sender + ": " + message.text;
        messagesDiv.appendChild(messageDiv);
    });

    subscribeToRoom(currentRoom);
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        alert("Welcome, " + user.displayName + "!");
        initializeRoom();
    } else {
        alert("You are not signed in. Please sign in.");
    }
});
