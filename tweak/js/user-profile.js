var queryString = decodeURIComponent(window.location.search);
var otherUserID = queryString.substring(7);
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
			setUpProfilePlaceholder();
			setUpSideMenu();
			getUserPosts();
			
			
		} else {
			// User is signed out.
			window.location.href = "login.html";
		}
});




// Upload a post to server
/*function upload(){
	var ref = database.ref("posts");
	var data = {
		content: document.getElementById("newpost").value,
		likes: "",
		time: new Date().toString(),
		userID: uid,
	}
	ref.push(data);
}*/



function closeSideMenu(){
	sideMenu.style.width =  "0";
	menuToggle.style.display = "block";
	
}

menuToggle.addEventListener("click", function(){
	sideMenu.style.width = "250px";
	menuToggle.style.display = "none";
});



// Set up placeholders in profile
function setUpProfilePlaceholder(){
	var ref = database.ref("users");
	ref.orderByChild("userID").equalTo(otherUserID).on("child_added", function(snapshot){
		database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
			document.getElementById("name").innerHTML = snapshot.val().username;
			document.getElementById("bio").innerHTML = snapshot.val().bio;
			document.getElementById("profile-img").src = snapshot.val().photoURL;
			document.getElementById("followers").innerHTML = getUserFollowersOrFollowing(snapshot.val().followers);
			document.getElementById("following").innerHTML = getUserFollowersOrFollowing(snapshot.val().following);
			getNumberOfUserPost().then(function(value){
				document.getElementById("posts").innerHTML = value;
			});
			if(snapshot.val().followers.includes(uid)){
				document.getElementById("followorfollowing").innerHTML = "Following";
			}else{
				document.getElementById("followorfollowing").innerHTML = "Follow";
			}
			
		});
	});
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

// Get number of followers or following or number of likes
function getUserFollowersOrFollowing(string){
	return string.split("/").length-1;
}

// Get number of user posts
function getNumberOfUserPost(){
	var ref = database.ref("posts");
	return  new Promise(function(resolve, reject){
		ref.orderByChild("userID").equalTo(otherUserID).once("value").then(function(snapshot){
			resolve(snapshot.numChildren());
		});
	});

}

// Get array of users
function getArrayOfID(string){
	var arrayID = string.split("/");
	return arrayID;
}


// Get users posts
function getUserPosts(){
	var ref = database.ref("posts");
	ref.orderByChild("userID").equalTo(otherUserID).on("child_added", function(snapshot){
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
		var para1 = document.createElement("p");
		para1.id = "time-post";
		para1.innerHTML = snapshot.val().time;
		var icon1 = document.createElement("i");
		icon1.className = "fas fa-heart";
		icon1.id = snapshot.key;
		icon1.addEventListener("click", function(){
			likePost(snapshot.key);
		});
		var icon2 = document.createElement("i");
		icon2.id = "whoLikes";
		icon2.addEventListener("click", function(){
			showLikes(snapshot.key);
		});
		var heading2 = document.createElement("div");
		heading2.id = "post";
		heading2.innerHTML = snapshot.val().content;
		
		if(getUserFollowersOrFollowing(snapshot.val().likes) == ""){
			
		}else{
			icon2.innerHTML = getUserFollowersOrFollowing(snapshot.val().likes);
		}
		
		getArrayOfID(snapshot.val().likes).forEach(function(ID){
			if(ID == uid){
				icon1.style.color = "red";
			}
		});
		
		database.ref("users").orderByChild("userID").equalTo(otherUserID).on("child_added", function(snapshot){
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

// Follow a user
function followUser(){
	var ref = database.ref("users");
	ref.orderByChild("userID").equalTo(uid).on("child_added", function(snapshot){
		database.ref("users/" + snapshot.key).once("value").then(function(snapshot){
			// If already followed, unfollow
			if(snapshot.val().following.includes(otherUserID)){
				database.ref("users/" + snapshot.key).update({ following: snapshot.val().following.replace(otherUserID + "/", "")});
				ref.orderByChild("userID").equalTo(otherUserID).on("child_added", function(snapshot){
					database.ref("users/" + snapshot.key).update({ followers: snapshot.val().followers.replace(uid + "/", "")});
				});
				document.getElementById("followorfollowing").innerHTML = "Follow";
			}else{
				database.ref("users/" + snapshot.key).update({ following: snapshot.val().following + otherUserID + "/"});
				ref.orderByChild("userID").equalTo(otherUserID).on("child_added", function(snapshot){
					database.ref("users/" + snapshot.key).update({ followers: snapshot.val().followers + uid + "/"});
				});
				document.getElementById("followorfollowing").innerHTML = "Following";
			}
			
		});
	});
}

function showFollower(){
	var myVar1 = otherUserID;
	var myVar2= "follower";
	var queryString = "?myVar1=" + myVar1 + "&myVar2=" + myVar2;
	window.location.href = "list.html" + queryString;
}

function showFollowing(){
	var myVar1 = otherUserID;
	var myVar2= "following";
	var queryString = "?myVar1=" + myVar1 + "&myVar2=" + myVar2;
	window.location.href = "list.html" + queryString;
}

function showLikes(postkey){
	var myVar1 = postkey;
	var myVar2= "likes";
	var queryString = "?myVar1=" + myVar1 + "&myVar2=" + myVar2;
	window.location.href = "list.html" + queryString;
}