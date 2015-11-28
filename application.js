hostname = window.location.hostname

$( document ).ready(function() {
	$.getJSON( "PHP/GetServices.php", function(data) {
		for (var i = 0; i < data.length; i++) {
			html = getBrick(data[i]);
			$(".shapeshift").append(html);
			$(".shapeshift").shapeshift();
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
		$(".shapeshift").append(brick);
		$(".shapeshift").shapeshift();
		console.error("getJSON failed, status: " + textStatus + ", error: " + error);
	});
});

$(document).on("ss-rearranged" ,function(e, selected) {
	// console.log($(selected).index());
	options = {
		enableDrag: false
	}
	positions = []
	$(".shapeshift").children().each(function() {
		sv_id = $(this)[0].id;
		sv_order = $(this).index();
		positions.push({
			"sv_id": sv_id,
			"sv_order": sv_order
		});
	});

	$.post("PHP/UpdateOrder.php", {
		positions
	}).done(function( data ) {
		console.log( data );
	});
});

function getBrick(service){
	// console.log(service);
	serviceLength = Object.keys(service).length;
	sv_id = service.sv_id
	name = service.sv_name;
	icon = "PHP/GetImage.php?id=" + service.img_id;
	description = service.sv_description;
	target = service.sv_target;
	secured = service.sv_secured;
	port = service.sv_port;
	url = service.sv_url;

	brick = '<div id="{sv_id}" class="brick" style="background-image: url(\'{icon}\')">\
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
		if(secured == true){porturl = "https://"}else{porturl = "http://"}
		if(target == "127.0.0.1"){hostname = window.location.hostname}else{hostname = target}
		porturl = porturl + hostname + ":" + port + url
		brick = brick.replace('{porturl}', porturl);
		brick = brick.replace('{icon}', icon);
	}

	brick = brick.replace('{sv_id}', sv_id);
	brick = brick.replace('{name}', name);
	brick = brick.replace('{description}', description);
	

	return brick;
}
