var sideMenu = document.getElementById("side-menu");
var menuToggle = document.getElementById("menuToggle");
var postsWrapper = document.getElementById("posts-wrapper");
var database = firebase.database();
var uid;
var fileName = location.pathname.substring(location.pathname.lastIndexOf('/')+1);
var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
var listID = queries[0].substring(7);
var listStatus = queries[1].substring(7);



firebase.auth().onAuthStateChanged(function(user) {
		if (user) {  
			// User is signed in.
			uid = user.uid;
			console.log("user " + uid + " is signed in");
			setUpSideMenu();
			
			if(listStatus == "following"){
				showListOfFollowing(listID);
			}else if(listStatus == "follower"){
				showListOfFollowers(listID);
			}else if(listStatus == "likes"){
				showListOfLikes(listID);
			}
			
			
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




function showListOfFollowing(userID){
	var ref = database.ref("users");
	var userListWrapper = document.getElementById("user-list-wrapper");
	var ul = document.getElementById("list-ul");
	ref.orderByChild("userID").equalTo(userID).on("child_added", function(snapshot){
		database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
			
			var arrayID = getArrayOfID(snapshot.val().following);
			arrayID.forEach(function(ID){
				ref.orderByChild("userID").equalTo(ID).on("child_added", function(snapshot){
					database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
						var li = document.createElement("li");
						li.id = snapshot.val().userID;
						li.addEventListener("click", function(){
							goToUser(snapshot.val().userID);
						});
						var img = document.createElement("img");
						img.id = "list-img";
						img.src = snapshot.val().photoURL;
						var p = document.createElement("p");
						p.id = "list-name";
						p.innerHTML = snapshot.val().username;
				
						li.appendChild(img);
						li.appendChild(p);
				
						ul.appendChild(li);
				
						userListWrapper.appendChild(ul);
					});
				});
					
			});
		});
	});
}


function showListOfFollowers(userID){
	var ref = database.ref("users");
	var userListWrapper = document.getElementById("user-list-wrapper");
	var ul = document.getElementById("list-ul");
	ref.orderByChild("userID").equalTo(userID).on("child_added", function(snapshot){
		database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
			
			var arrayID = getArrayOfID(snapshot.val().followers);
			arrayID.forEach(function(ID){
				ref.orderByChild("userID").equalTo(ID).on("child_added", function(snapshot){
					database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
						var li = document.createElement("li");
						li.id = snapshot.val().userID;
						li.addEventListener("click", function(){
							goToUser(snapshot.val().userID);
						});
						var img = document.createElement("img");
						img.id = "list-img";
						img.src = snapshot.val().photoURL;
						var p = document.createElement("p");
						p.id = "list-name";
						p.innerHTML = snapshot.val().username;
				
						li.appendChild(img);
						li.appendChild(p);
				
						ul.appendChild(li);
				
						userListWrapper.appendChild(ul);
					});
				});
					
			});
		});
	});
}


function showListOfLikes(postkey){
	var ref = database.ref("posts");
	var userListWrapper = document.getElementById("user-list-wrapper");
	var ul = document.getElementById("list-ul");
	ref.orderByKey().equalTo(postkey).on("child_added", function(snapshot){
			
		var postKeys = getArrayOfID(snapshot.val().likes);
			postKeys.forEach(function(ID){
				console.log(ID);
				database.ref("users").orderByChild("userID").equalTo(ID).on("child_added", function(snapshot){
					database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
						var li = document.createElement("li");
						li.id = snapshot.val().userID;
						li.addEventListener("click", function(){
							goToUser(snapshot.val().userID);
						});
						var img = document.createElement("img");
						img.id = "list-img";
						img.src = snapshot.val().photoURL;
						var p = document.createElement("p");
						p.id = "list-name";
						p.innerHTML = snapshot.val().username;
				
						li.appendChild(img);
						li.appendChild(p);
				
						ul.appendChild(li);
				
						userListWrapper.appendChild(ul);
					});
				});
					
			});
	});
}

// Get number of followers or following or number of likes
function getUserFollowersOrFollowing(string){
	return string.split("/").length-1;
}

// Get number of user posts
function getNumberOfUserPost(){
	var ref = database.ref("posts");
	return  new Promise(function(resolve, reject){
		ref.orderByChild("userID").equalTo(uid).once("value").then(function(snapshot){
			resolve(snapshot.numChildren());
		});
	});

}

// Get array of users
function getArrayOfID(string){
	var arrayID = string.split("/");
	return arrayID;
}



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

// Set up side-menu profile pic
function setUpSideMenu(){
	var ref = database.ref("users");
	ref.orderByChild("userID").equalTo(uid).on("child_added", function(snapshot){
		database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
			document.getElementById("side-menu-profile-pic").src = snapshot.val().photoURL;
		});
	});
}