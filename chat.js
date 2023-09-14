// Initialize Firebase components
var db = firebase.database();
var messagesRef;
var currentRoom = "default"; // Default room

// Initialize Firebase Cloud Messaging (FCM)
var messaging = firebase.messaging();

// Function to send a message
function sendMessage() {
    var messageInput = document.getElementById("messageInput");
    var messageText = messageInput.value.trim();

    if (messageText !== "") {
        var user = firebase.auth().currentUser;

        if (user) {
            var message = {
                text: messageText,
                sender: user.displayName, // Use user's display name
                timestamp: new Date().getTime(),
            };

            messagesRef.push(message);
            messageInput.value = "";

            // Notify users in the room
            sendPushNotification(currentRoom, user.displayName, messageText);
        } else {
            // Handle authentication state (user not logged in)
            alert("You are not signed in. Please sign in to send messages.");
        }
    }
}

// Function to sign out
function signOut() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        alert("You have been signed out.");
    }).catch(function(error) {
        // An error happened.
        console.error("Sign out error:", error);
    });
}

// Function to sign in with Google using redirect
function signInWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

// Function to create a room
function createRoom() {
    var roomInput = document.getElementById("roomInput");
    var roomName = roomInput.value.trim();

    if (roomName !== "") {
        // Store the room information in the database
        db.ref("rooms/" + roomName).set({
            created_at: new Date().toISOString(),
        });

        // Set the current room to the created room
        currentRoom = roomName;
        initializeRoom();
        roomInput.value = ""; // Clear the room input field
    } else {
        alert("Please enter a room name.");
    }
}

// Function to join an existing room
function joinRoom() {
    var joinRoomInput = document.getElementById("joinRoomInput");
    var roomCode = joinRoomInput.value.trim();

    if (roomCode !== "") {
        currentRoom = roomCode;
        initializeRoom();
        joinRoomInput.value = ""; // Clear the room code input field
    } else {
        alert("Please enter a room code.");
    }
}

// Function to subscribe to room updates
function subscribeToRoom(roomId) {
    const user = firebase.auth().currentUser;

    if (user) {
        const userId = user.uid;

        // Store the user's subscription to the room in the database
        db.ref(`roomSubscriptions/${roomId}/${userId}`).set(true);
    }
}

// Function to send a push notification to a specific user
function sendPushNotification(userId, senderName, messageText) {
    // Get the user's FCM token
    messaging.getToken()
        .then(function(currentToken) {
            if (currentToken) {
                // Construct the notification payload
                const notificationPayload = {
                    title: `New message from ${senderName}`,
                    body: messageText,
                };

                // Send the notification to the user
                fetch("https://fcm.googleapis.com/fcm/send", {
                    method: "POST",
                    headers: {
                        "Authorization": "key=AAAAk6eV-W4:APA91bG7VbSNnCsAkC_oX_eGy1m7rcGqiEXADYYTawQJrPFgRtJLde2EVBIo6qP1qyXKD9_waKNNWv42UFsO5B7LUGpPnygpZIKxVD1ZClD9WlEhgUkxzVtwsFD8OOTbZl51gWffNqwf", // Replace with your server key
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
            } else {
                // Show an error or handle the case where the user doesn't have a token
            }
        })
        .catch(function(error) {
            console.error("Error getting FCM token:", error);
        });
}

// Function to initialize the selected or created room
function initializeRoom() {
    // Update messagesRef to the specific room
    messagesRef = db.ref("rooms/" + currentRoom + "/messages");

    // Clear existing messages
    var messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    // Load messages for the new room
    messagesRef.on("child_added", function(snapshot) {
        var message = snapshot.val();
        var messageDiv = document.createElement("div");
        messageDiv.textContent = message.sender + ": " + message.text;
        messagesDiv.appendChild(messageDiv);
    });

    // Subscribe to the room for push notifications
    subscribeToRoom(currentRoom);
}

// Initialize Firebase Authentication
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        alert("Welcome, " + user.displayName + "!");
        initializeRoom(); // Initialize with the default room
    } else {
        // User is signed out or hasn't signed in yet.
        alert("You are not signed in. Please sign in.");
    }
});
