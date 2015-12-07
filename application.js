var hostname = window.location.hostname;
var bricksDiv;
var shapeshiftOptions = {enableDrag: false}
var shapeshiftObject;
var loggedIn;
var searchString = '';
var brickSampleService = '<div id="{sv_id}" class="brick">\
		<div class="brickBG" style="background-image: url(\'{icon}\')"></div>\
		<a href="{porturl}">\
			<div class="cover">\
				<div class="status"><img id="{sv_status_id}" src="images/preloader.gif"></div>\
				<h2>{name}</h2>\
				<h4>{description}</h4>\
			</div>\
		</a>\
	</div>';
var brickSampleError = '<div class="brick">\
		<div class="cover">\
			<h2>{name}</h2>\
			<h4>{description}</h4>\
		</div>\
	</div>';
var brickSampleAdmin = '<div id="{sv_id}" class="brick">\
		<div class="brickBG" style="background-image: url(\'{icon}\')"></div>\
		<a href="javascript:adminPanel({service})">\
			<div class="cover">\
				<h2>{name}</h2>\
				<h4>{description}</h4>\
			</div>\
		</a>\
	</div>';


$( document ).ready(function() {
	$('body').css('background-image','url(images/background.jpg)');
	bricksDiv = $(".shapeshift");
	setLogin();
});

$(document).on("ss-rearranged" ,function(e, selected) {
	// console.log($(selected).index());
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
			addServices(searchString);
		}
	}, "json");

});

function login(){
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
	$.getJSON("dispatcher.php?action=logout", function(response){
		setLogin();
	});
}

function searchServices(){
	if (searchString !== $("#search").val()){
		searchString = $("#search").val();
		addServices(searchString);
	}
}

function setLogin(){
	$.getJSON("dispatcher.php?action=usrStatus", function(response){
		if(response['connected'] === true){
			$('#loginBtn').css('display','none');
			$('#logoutBtn').css('display','block');
			loggedIn = true;
		}
		else{
			$('#loginBtn').css('display','block');
			$('#logoutBtn').css('display','none');
			loggedIn = false;
		}
		addServices(searchString);
	});
}

function addServices(search){
	bricksDiv.empty();
	$.getJSON( "dispatcher.php?action=getServices&search="+search, function(data) {
		for (var i = 0; i < data.length; i++) {
			var brick = getBrick(data[i]);
		};
		if(loggedIn === true){
			shapeshiftOptions.enableDrag = true;
		} else {
			shapeshiftOptions.enableDrag = false;
		}
		bricksDiv.shapeshift(shapeshiftOptions);
	});
}

function adminPanel(sv_id){
	$.getJSON( "dispatcher.php?action=getService&sv_id="+sv_id, function(data) {
		$('#editName').val(data.sv_name);
		$('#editDescription').val(data.sv_description);
		$('#editTarget').val(data.sv_target);
		$('#editURL').val(data.sv_url);
		$('#editSecured').val(data.sv_secured);
		$('#editIMG').val(data.img_id);

		$('#myModal').modal();
	});

	$("#saveServiceBTN").off( "click" );
	$("#saveServiceBTN").click(function() {
		updateServiceData = {
			'sv_id': sv_id,
			'sv_name': $('#editName').val(),
			'sv_description': $('#editDescription').val(),
			'sv_target': $('#editTarget').val(),
			'sv_url': $('#editURL').val(),
			'sv_secured': $('#editSecured').val(),
			'img_id': $('#editIMG').val()
		}
		$.post("dispatcher.php?action=updateService", updateServiceData, function(data, textStatus) {
			if(data['changed'] === true){
				addServices(searchString);
			}
		}, "json");
	});
}

function getBrick(service){
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
		var brick = brickSampleError
		brick = brick.replace('{name}', "Error");
		brick = brick.replace('{description}', "Not Found");
	} else if(loggedIn === false){
		var brick = brickSampleService;
		if(secured === "true"){http = "https://";}else{http = "http://";}
		if(target == "127.0.0.1"){hostname = window.location.hostname}else{hostname = target}
		porturl = http + hostname + ":" + port + url;
		brick = brick.replace('{porturl}', porturl);
		brick = brick.replace('{icon}', icon);
		CheckURL(sv_status_id, porturl);
	} else if(loggedIn === true){
		var brick = brickSampleAdmin;
		brick = brick.replace('{service}', sv_id);
		brick = brick.replace('{icon}', icon);
	}

	brick = brick.replace('{sv_id}', sv_service_id);
	brick = brick.replace('{sv_status_id}', sv_status_id);
	brick = brick.replace('{name}', name);
	brick = brick.replace('{description}', description);
	
	bricksDiv.append(brick);

	return brick;
}

function CheckURL(sv_status_id, porturl){
	green = "images/buttonGreen.png";
	red = "images/buttonRed.png";
	$.get("dispatcher.php?action=urlExists&url=" + porturl, function(response){
		if (response === 'true')
			$('#'+sv_status_id).attr("src", green);
		else
			$('#'+sv_status_id).attr("src", red);
	});

}