// Init variables
var hostname = window.location.hostname;
var bricksDiv;
var shapeshiftOptions = {enableDrag: false}
var shapeshiftObject;
var loggedIn;
var searchString = '';

brick_add_template = '<div id="{sv_id}" class="brick">\
	<div class="brickAdd" style="background-image: url(\'images/addService.png\')"></div>\
	<a href="javascript:servicesPanel(\'new\')">\
		<div class="cover">\
		</div>\
	</a>\
</div>';

var brick_empty_template = '<div class="brick"><div class="brickBG"></div>\
	<div class="cover">\
		<h2>{name}</h2>\
		<h4>{description}</h4>\
	</div>\
</div>';

var brick_user_template = '<div id="{sv_id}" class="brick">\
	<div class="brickBG" style="background-image: url(\'{icon}\')"></div>\
	<a href="{porturl}">\
		<div class="cover">\
			<div class="sphere" id="{sv_status_id}" style="height: 20px; width: 20px;"></div>\
			<h2>{name}</h2>\
			<h4>{description}</h4>\
		</div>\
	</a>\
</div>';

var brick_admin_template = '<div id="{sv_id}" class="brick">\
	<div class="brickBG" style="background-image: url(\'{icon}\')"></div>\
	<a href="javascript:servicesPanel({service})">\
		<div class="cover">\
			<h2>{name}</h2>\
			<h4>{description}</h4>\
		</div>\
	</a>\
</div>';

var listimage_template = '<div class="listimages">\
	<img onclick="selectImage({img_id})" src="{img_url}">\
	<button type="button" class="deleteimg close" style="color:red;" onclick="deleteImage({img_id})">\
		<span aria-hidden="true">&times;</span>\
	</button>\
</div>';


$( document ).ready(function() {
	bricksDiv = $(".shapeshiftServices");
	setLogin();
});

$(document).on("ss-rearranged" ,function(e, selected) {
	var positions = []
	bricksDiv.children().each(function() {
		var sv_id = $(this)[0].id.replace('service_', '');
		var sv_order = $(this).index();
		positions.push({
			"sv_id": sv_id,
			"sv_order": sv_order
		});
	});
	positions = {positions}

	$.post("dispatcher.php?action=updateOrder", positions, function(data, textStatus) {
		if(data['changed'] === false){
			refreshServices(searchString);
		}
	}, "json");

});

$(window).on('resize', function(){
	bricksDiv.shapeshift()
});

function login(){
	// Login to the server
	username = $('#inputUser').val();
	password = $('#inputPass').val();
	$.getJSON("dispatcher.php?action=login&user="+ username +"&password="+ password +"", function(response){
		if(response['credentials'] === true){
			$('#loginError').hide();
			setLogin();
		} else {
			$('#loginError').fadeIn();
		}
	});
}

function logout(){
	// Logout from the server
	$.getJSON("dispatcher.php?action=logout", function(response){
		setLogin();
	});
}

function searchServices(){
	// Check for changes in search box and refresh services
	if (searchString !== $("#search").val()){
		searchString = $("#search").val();
		refreshServices(searchString);
	}
}

function setLogin(){
	// Get login status and change page
	$.getJSON("dispatcher.php?action=usrStatus", function(response){
		if(response['connected'] === true){
			$('#loginBtn').css('display','none');
			$('#adminBtn').css('display','block');
			$('#logoutBtn').css('display','block');
			loggedIn = true;
		}
		else{
			$('#loginBtn').css('display','block');
			$('#adminBtn').css('display','none');
			$('#logoutBtn').css('display','none');
			loggedIn = false;
		}
		refreshServices(searchString);
	});
}

function refreshServices(search){
	// Get the searched services and based on the login status, change the properties of the shapeshift
	$.getJSON( "dispatcher.php?action=getServices&search="+search, function(data) {
		bricksDiv.empty();
		if ( data.length === 0 ) {
			var brick = getBrick();
			bricksDiv.append(brick);
		}
		for (var i = 0; i < data.length; i++) {
			var brick = getBrick(data[i]);
			bricksDiv.append(brick);
		};
		if(loggedIn === true){
			bricksDiv.append(brick_add_template)
			shapeshiftOptions.enableDrag = true;
		} else {
			shapeshiftOptions.enableDrag = false;
		}
		bricksDiv.shapeshift(shapeshiftOptions);
	});
}

function deleteImage(img_id){
	deleteImageData = {
		'img_id': img_id
	}
	$.post("dispatcher.php?action=deleteImage", deleteImageData, function(data, textStatus) {
		imagesPanel();
	}, "json");
}

function selectImage(img_id){
	var img_url = "dispatcher.php?action=getImage&id=" + img_id;
	$('#editIMG').val(img_id);
	$('#imagesModal').modal('hide');
	$('#selectedServiceImage').attr("src", img_url);
}

function adminPanel(){
	$('#adminModal').modal();
	$.getJSON( "dispatcher.php?action=getUserPass", function(data) {
		$('#editUsername').val(data.usr_name);
		$('#editPassword').val(data.usr_password);
	});
}

function saveCredentials(){
	changeCredentialsData = {
		'user': $('#editUsername').val(),
		'pass': $('#editPassword').val()
	}
	$.post("dispatcher.php?action=setUserPass", changeCredentialsData, function(data, textStatus) {
	}, "json");

}

function imagesPanel(){
	$("#allImages").empty();
	$('#imagesModal').modal();
	$.getJSON( "dispatcher.php?action=getImagesIDs", function(data) {
		for (var i = 0; i < data.length; i++) {
			var img_id = data[i]
			var img_url = "dispatcher.php?action=getImage&id=" + img_id;
			var listimage = listimage_template;
			listimage = listimage.replace(/\{img_id\}/g, img_id);
			listimage = listimage.replace(/\{img_url\}/g, img_url);
			$("#allImages").append(listimage);
		};
	});
}

function uploadIMG(event){
	event.preventDefault();
	var fileSelect = document.getElementById('inputUploadImg');
	var file = fileSelect.files[0]
	console.log(file.size);
	console.log(file);
	var formData = new FormData();
	formData.append('attachment', file, file.name);

	var xhttp = new XMLHttpRequest();
	xhttp.open('POST', 'dispatcher.php?action=uploadImage', true);
	xhttp.onreadystatechange = function () {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			data = JSON.parse(xhttp.responseText);
			$('#selectedServiceImage').attr("src", "dispatcher.php?action=getImage&id="+data.img_id);
		} else {
			console.log('An error occurred!');
		}
	};
	xhttp.send(formData);
}

function servicesPanel(sv_id){
	// Add values to the Modal PopUp window and add, delete, update services
	var action;
	// add values to modal and open it
	if(sv_id === 'new'){
		action = 'addService';
		$('#selectedServiceImage').attr("src", "images/addService.png");

		$('#servicesModal').modal();
	} else {
		action = 'updateService';
		$.getJSON( "dispatcher.php?action=getService&sv_id="+sv_id, function(data) {
			$('#editName').val(data.sv_name);
			$('#editDescription').val(data.sv_description);
			$('#editTarget').val(data.sv_target);
			$('#editPort').val(data.sv_port);
			$('#editURL').val(data.sv_url);
			$('#editSecured').val(data.sv_secured);
			$('#editIMG').val(data.img_id);
			$('#selectedServiceImage').attr("src", "dispatcher.php?action=getImage&id="+data.img_id);

			$('#servicesModal').modal();
		});
	}

	// clear save and delete events
	$("#saveServiceBTN").off( "click" );
	$("#deleteServiceBTN").off( "click" );
	$("#saveServiceBTN").click(function() {
		updateServiceData = {
			'sv_id': sv_id,
			'sv_name': $('#editName').val(),
			'sv_description': $('#editDescription').val(),
			'sv_target': $('#editTarget').val(),
			'sv_port': $('#editPort').val(),
			'sv_url': $('#editURL').val(),
			'sv_secured': $('#editSecured').val(),
			'img_id': $('#editIMG').val()
		}
		$.post("dispatcher.php?action="+action, updateServiceData, function(data, textStatus) {
			if(data['changed'] === true){
				refreshServices(searchString);
			}
		}, "json");
	});
	$("#deleteServiceBTN").click(function() {
		updateServiceData = {
			'sv_id': sv_id
		}
		$.post("dispatcher.php?action=deleteService", updateServiceData, function(data, textStatus) {
			if(data['changed'] === true){
				refreshServices(searchString);
			}
		}, "json");
	});
}

function getBrick(service=false){
	if ( service !== false ){
		// Read data from DB and return the html brick
		var serviceLength = Object.keys(service).length;
		var sv_id = service.sv_id;
		var name = service.sv_name;
		var img_id = service.img_id;
		var description = service.sv_description;
		var target = service.sv_target;
		var secured = service.sv_secured;
		var port = service.sv_port;
		var url = service.sv_url;
		var sv_service_id = "service_" + sv_id;
		var sv_status_id = "status_" + sv_id;
		var icon = "dispatcher.php?action=getImage&id=" + img_id;
		var http;
		var porturl;

		if (serviceLength === 0) {
			var brick = brick_empty_template;
			brick = brick.replace(/\{name\}/g, "Error");
			brick = brick.replace(/\{description\}/g, "Not Found");
		} else if(loggedIn === false){
			var brick = brick_user_template;
			if(secured === "true"){http = "https://";}else{http = "http://";}
			if(target == "127.0.0.1"){hostname = window.location.hostname}else{hostname = target}
			porturl = http + hostname + ":" + port + url;
			brick = brick.replace(/\{porturl\}/g, porturl);
			brick = brick.replace(/\{icon\}/g, icon);
			brick = brick.replace(/\{sv_id\}/g, sv_service_id);
			brick = brick.replace(/\{sv_status_id\}/g, sv_status_id);
			brick = brick.replace(/\{description\}/g, description);
			brick = brick.replace(/\{name\}/g, name);
			CheckURL(sv_status_id, porturl);
		} else if(loggedIn === true){
			var brick = brick_admin_template;
			brick = brick.replace(/\{service\}/g, sv_id);
			brick = brick.replace(/\{icon\}/g, icon);
			brick = brick.replace(/\{sv_id\}/g, sv_service_id);
			brick = brick.replace(/\{description\}/g, description);
			brick = brick.replace(/\{name\}/g, name);
		}
	} else {
		var brick = brick_empty_template;
		brick = brick.replace(/\{name\}/g, "Error");
		brick = brick.replace(/\{description\}/g, "Not Found");
	}
	return brick;
}

function CheckURL(sv_status_id, porturl){
	// Check the status of a service
	$.get("dispatcher.php?action=urlExists&url=" + porturl, function(response){
		if (response === 'true')
			$('#'+sv_status_id).css("background-color", "green");
		else
			$('#'+sv_status_id).css("background-color", "red");
	});

}
