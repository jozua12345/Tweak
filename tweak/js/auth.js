var loginButton = document.getElementById("login-btn");
//var registerButton = document.getElementById("register-btn");
var database = firebase.database();

/*if(location.pathname.split('/').slice(-1)[0] == "index.html"){
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {  
			// User is signed in.
			var displayName = user.displayName;
			var email = user.email;
			var emailVerified = user.emailVerified;
			var photoURL = user.photoURL;
			var isAnonymous = user.isAnonymous;
			var uid = user.uid;
			var providerData = user.providerData;
			alert("user is signed in");
			document.location.href = "home.html";
		} else {
			// User is signed out.
			alert("user has sign out");
		}
	});
}else if(location.pathname.split('/').slice(-1)[0] == "register.html"){
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {  
			// User is signed in.
			var ref = database.ref("users");
			var data = {
				email: document.getElementById("email").value,
				pass: document.getElementById("password").value,
				username: document.getElementById("name").value,
				userID: user.uid,
				photoURL: "css/profile.png"
			}
			ref.push(data);
			alert("user is signed in");
			document.location.href = "home.html";
		} else {
			// User is signed out.
			alert("user has sign out");
		}
	});
}*/

loginButton.addEventListener("click", function(){
	var email = document.getElementById("email").value;
	var pass = document.getElementById("password").value;
	firebase.auth().signInWithEmailAndPassword(email, pass)
	.then(function(){
		
		document.location.href = "index.html";})
	.catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		window.alert("Error: " + errorMessage);
	});
});

function register(){
	var email = document.getElementById("email").value;
	var pass = document.getElementById("password").value;
	firebase.auth().createUserWithEmailAndPassword(email, pass)
	.then(function(){
		alert("Registration successful!");
		var ref = database.ref("users");
		var data = {
			email: document.getElementById("email").value,
			pass: document.getElementById("password").value,
			username: document.getElementById("name").value,
			userID: firebase.auth().currentUser.uid,
			followers: "",
			following: "",
			photoURL: "css/profile.png",
			bio: ""
		}
		ref.push(data);
		document.location.href = "index.html";
	})
	.catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		window.alert("Error: " + errorMessage);
	});
}

function logout(){
	firebase.auth().signOut().then(function() {
		// Sign-out successful.
		document.location.href = "index.html";
		once = false;
	}).catch(function(error) {
		// An error happened.
	});
}
