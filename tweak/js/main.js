var sideMenu = document.getElementById("side-menu");
var menuToggle = document.getElementById("menuToggle");
var postsWrapper = document.getElementById("posts-wrapper");
var database = firebase.database();
var uid;
var fileName = location.pathname.substring(location.pathname.lastIndexOf('/')+1);


firebase.auth().onAuthStateChanged(function(user) {
		if (user) {  
			// User is signed in.
			uid = user.uid;
			console.log("user " + uid + " is signed in");
			setUpSideMenu();
			showNewsFeed();
			
			
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

// Like a post
function likePost(postkey){
	var ref = database.ref("posts");
	ref.orderByKey().equalTo(postkey).once("child_added", function(snapshot){
			var currentLikes = snapshot.val().likes;
			// If already liked, unlike
			if(currentLikes.includes(uid)){
				database.ref("posts/" + postkey).update({ likes: currentLikes.replace(uid + "/", "")});
				document.getElementById(postkey).style.color = "gray";
			}else{
				database.ref("posts/" + postkey).update({ likes: currentLikes + uid + "/" });
				document.getElementById(postkey).style.color = "red";
			}
	});
}

function showLikes(postkey){
	var myVar1 = postkey;
	var myVar2= "likes";
	var queryString = "?myVar1=" + myVar1 + "&myVar2=" + myVar2;
	window.location.href = "list.html" + queryString;
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

// Show news feed
function queryNewsFeedToAnArray(){
	var ref = database.ref("users");
	return  new Promise(function(resolve, reject){
		ref.orderByChild("userID").equalTo(uid).on("child_added", function(snapshot){
			database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
				
				var followingID = getArrayOfID(snapshot.val().following);
				var sortedJSON = [];
				followingID.forEach(function(ID){
					database.ref("posts").orderByChild("userID").equalTo(ID).on("child_added", function(snapshot){
						sortedJSON.push(new PostObject(snapshot.val().content, snapshot.val().likes, snapshot.val().time, snapshot.val().userID, snapshot.key));
						resolve(sortedJSON);
						console.log(sortedJSON);
					});
				});
			});
		});
	});
}

function showNewsFeed(){
	queryNewsFeedToAnArray().then(function(sortedJSON){
		sortedJSON.sort(function(a, b){
			return Date.parse(a.time) - Date.parse(b.time);
		});
		console.log(sortedJSON);
		sortedJSON.forEach(function(post){
			
			database.ref("posts").orderByKey().equalTo(post.postKey).on("child_added", function(snapshot){
				
				var div1 = document.createElement("div");
				div1.id = "post-wrapper";
				var div2 = document.createElement("div");
				div2.id = "img-name-time-wrapper";
				var img1 = document.createElement("img");
				img1.id = "profile-img";
				var div3 = document.createElement("div");
				div3.id = "name-time-wrapper";
				var heading1 = document.createElement("h1");
				heading1.id = "user-name";
				heading1.addEventListener("click", function(){
					goToUser(snapshot.val().userID);
				});
				var para1 = document.createElement("p");
				para1.id = "time-post";
				para1.innerHTML = post.time;
				var icon1 = document.createElement("i");
				icon1.className = "fas fa-heart";
				icon1.id = post.postKey;
				icon1.addEventListener("click", function(){
					likePost(post.postKey);
				});
				var icon2 = document.createElement("i");
				icon2.id = "whoLikes";
				icon2.addEventListener("click", function(){
					showLikes(post.postKey);
				});
				var heading2 = document.createElement("div");
				heading2.id = "post";
				heading2.innerHTML = post.content;
		
				if(getUserFollowersOrFollowing(snapshot.val().likes) == ""){
		
				}else{
					icon2.innerHTML = getUserFollowersOrFollowing(snapshot.val().likes);
				}
		
				getArrayOfID(post.likes).forEach(function(ID){
					if(ID == uid){
						icon1.style.color = "red";
					}
				});
		
				database.ref("users").orderByChild("userID").equalTo(post.userID).on("child_added", function(snapshot){
					img1.src = snapshot.val().photoURL;
					heading1.innerHTML = snapshot.val().username;
				});
		
				div3.appendChild(heading1);
				div3.appendChild(para1);
	
				div2.appendChild(img1);
				div2.appendChild(div3);
				div2.appendChild(icon1);
				div2.appendChild(icon2);
		
				div1.appendChild(div2);
				div1.appendChild(heading2);
		
				postsWrapper.appendChild(div1);
				
					
					
			});
		});
		
	});

}
	
			

// Create post object
function PostObject(content, likes, time, userID, postKey){
	this.content = content;
	this.likes = likes;
	this.time = time;
	this.userID = userID;
	this.postKey = postKey;
}
	



