var hostname = window.location.hostname;
var shapeshift;
var searchString = '';

$( document ).ready(function() {
	$('body').css('background-image','url(dispatcher.php?action=getImage&id=16)');
	shapeshift = $(".shapeshift");
	addServices(searchString);
});

$(document).on("ss-rearranged" ,function(e, selected) {
	// console.log($(selected).index());
	options = {
		enableDrag: false
	}
	positions = []
	shapeshift.children().each(function() {
		sv_id = $(this)[0].id;
		sv_order = $(this).index();
		positions.push({
			"sv_id": sv_id,
			"sv_order": sv_order
		});
	});

	$.post("dispatcher.php?action=updateOrder", {
		positions
	}).done(function( data ) {
		console.log( data );
	});
});


function searchServices(){
	if (searchString !== $("#search").val()){
		searchString = $("#search").val();
		addServices(searchString);
	}
}

function addServices(search){
	shapeshift.empty();
	$.getJSON( "dispatcher.php?action=getServices&search="+search, function(data) {
		for (var i = 0; i < data.length; i++) {
			html = getBrick(data[i]);
			shapeshift.append(html);
			shapeshift.shapeshift();
		};
	}).fail(function(d, textStatus, error) {
		brick = '<div class="brick">\
			<div class="cover">\
				<h2>{name}</h2>\
				<h4>{description}</h4>\
			</div>\
		</div>';
		brick = brick.replace('{name}', textStatus);
		brick = brick.replace('{description}', error);
		shapeshift.append(brick);
		shapeshift.shapeshift();
		console.error("getJSON failed, status: " + textStatus + ", error: " + error);
	});
}

function getBrick(service){
	// console.log(service);
	var serviceLength = Object.keys(service).length;
	var sv_id = service.sv_id
	var name = service.sv_name;
	var icon = "dispatcher.php?action=getImage&id=" + service.img_id;
	var description = service.sv_description;
	var target = service.sv_target;
	var secured = service.sv_secured;
	var port = service.sv_port;
	var url = service.sv_url;
	var http
	var porturl

	var brick = '<div id="{sv_id}" class="brick" style="background-image: url(\'{icon}\')">\
		<div class="cover">\
			<a href="{porturl}">\
				<h2>{name}</h2>\
				<h4>{description}</h4>\
			</a>\
		</div>\
	</div>';
	brick_simple = '<div class="brick">\
		<div class="cover">\
			<h2>{name}</h2>\
			<h4>{description}</h4>\
		</div>\
	</div>';
	if (serviceLength === 0) {
		brick = brick_simple
		brick = brick.replace('{name}', "Error");
		brick = brick.replace('{description}', "Not Found");
	} else {
		if(secured === "true"){http = "https://";}else{http = "http://";}
		if(target == "127.0.0.1"){hostname = window.location.hostname}else{hostname = target}
		porturl = http + hostname + ":" + port + url;
		brick = brick.replace('{porturl}', porturl);
		brick = brick.replace('{icon}', icon);
	}

	brick = brick.replace('{sv_id}', sv_id);
	brick = brick.replace('{name}', name);
	brick = brick.replace('{description}', description);
	

	return brick;
}
