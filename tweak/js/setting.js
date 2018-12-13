var sideMenu = document.getElementById("side-menu");
var menuToggle = document.getElementById("menuToggle");
var imageFile = document.getElementById("imageFile");
var database = firebase.database();
var uid;
var fileName = location.pathname.substring(location.pathname.lastIndexOf('/')+1);

firebase.auth().onAuthStateChanged(function(user) {
		if (user) {  
			// User is signed in.
			uid = user.uid;
			console.log("user " + uid + " is signed in");
			setUpSettingPlaceholder();
		
			
		} else {
			// User is signed out.
			window.location.href = "login.html";
		}
});

function closeSideMenu(){
	sideMenu.style.width =  "0";
	menuToggle.style.display = "block";
	
}

menuToggle.addEventListener("click", function(){
	sideMenu.style.width = "250px";
	menuToggle.style.display = "none";
});

// Update name to server
function updateName(){
	var ref = database.ref("users");
	ref.orderByChild("userID").equalTo(uid).once("child_added", function(snapshot){
		database.ref("users/" + snapshot.key).update({ username: document.getElementById("name").value });
	});
}

// Update bio to server
function updateBio(){
	var ref = database.ref("users");
	ref.orderByChild("userID").equalTo(uid).once("child_added", function(snapshot){
		database.ref("users/" + snapshot.key).update({ bio: document.getElementById("bio").value });
	});
}

// Update password to server
function updatePassword(){
	var ref = database.ref("users");
	ref.orderByChild("userID").equalTo(uid).once("child_added", function(snapshot){
		var user = firebase.auth().currentUser;
		var newPassword = document.getElementById("password").value;
		user.updatePassword(newPassword).then(function() {
			// Update successful.
			database.ref("users/" + snapshot.key).update({ pass: newPassword });
			window.alert("Password is changed successfully!");
		}).catch(function(error) {
			// An error happened.
			var errorCode = error.code;
			var errorMessage = error.message;
			window.alert("Error: " + errorMessage);
		});
	
	});
}

// Set up placeholders in settings 
function setUpSettingPlaceholder(){
	var ref = database.ref("users");
	ref.orderByChild("userID").equalTo(uid).once("child_added", function(snapshot){
		database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
			document.getElementById("name").placeholder = snapshot.val().username;
			document.getElementById("email").placeholder = snapshot.val().email;
			document.getElementById("bio").placeholder = snapshot.val().bio;
			document.getElementById("password").placeholder = snapshot.val().pass;
			document.getElementById("profile-img").src = snapshot.val().photoURL;
			document.getElementById("side-menu-profile-pic").src = snapshot.val().photoURL;
		});
	});
}

// Show upload option
function showUploadOption(){
	document.getElementById("imageFile").style.display = "inline-block";
}

// Upload image to server
imageFile.addEventListener("change", function(e){
	//Get file
	var file = e.target.files[0];
	//Create a storage reference
	var storageRef = firebase.storage().ref("profile_images/" + file.name);
	//Upload file
	var task = storageRef.put(file);
	//Check progress
	task.on("state_changed",
	
		function progress(snapshot){
			if(snapshot.bytesTransferred == snapshot.totalBytes){
				var ref = database.ref("users");
				ref.orderByChild("userID").equalTo(uid).once("child_added", function(snapshot){
					database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
						database.ref("users/" + snapshot.key).update({ photoURL: task.snapshot.downloadURL });
					});
				});
				alert("Upload Successful!")
			}
		}
	);
		
});

// Search user by name
function searchUser(){
	var ref = database.ref("users");
	var name = document.getElementById("name-search").value;
	var searchListWrapper = document.getElementById("search-list-wrapper");
	searchListWrapper.style.display = "block";
	var ul = document.getElementById("search-ul");
	if(name != ""){
		
		ref.orderByChild("username").equalTo(name).on("child_added", function(snapshot){
			
			// Delete existing DOM
			ul.innerHTML = "";
			//Query names and create DOM
			if(snapshot.val().userID == uid){
			
			}else{
				
				var li = document.createElement("li");
				li.id = snapshot.val().userID;
				li.addEventListener("click", function(){
					goToUser(snapshot.val().userID);
				});
				var img = document.createElement("img");
				img.id = "search-list-img";
				img.src = snapshot.val().photoURL;
				var p = document.createElement("p");
				p.id = "search-name";
				p.innerHTML = snapshot.val().username;
				
				li.appendChild(img);
				li.appendChild(p);
				
				ul.appendChild(li);
				
				searchListWrapper.appendChild(ul);
			}
		});
	}
}

// Go to user profile page base on userID
function goToUser(ID){
	var queryString = "?myVar=" + ID;
	window.location.href = "user-profile.html" + queryString;
}
