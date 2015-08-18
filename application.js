hostname = window.location.hostname

$( document ).ready(function() {
	$("#header").click(function( event ) {
		location.reload();
	});
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

function getBrick(service){
	// console.log(service);
	serviceLength = Object.keys(service).length;
	name = service.sv_name;
	icon = "PHP/GetImage.php?id=" + service.img_id;
	description = service.sv_description;
	target = service.sv_target;
	secured = service.sv_secured;
	port = service.sv_port;
	url = service.sv_url;

	brick = '<div class="brick" style="background-image: url(\'{icon}\')">\
		<div class="cover">\
			<a href="{porturl}">\
				<h2>{name}</h2>\
				<h4>{description}</h4>\
				<div class="read-more">View detail ...</div>\
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
		if(target == "local"){hostname = window.location.hostname}else{hostname = target}
		porturl = porturl + hostname + ":" + port + url
		brick = brick.replace('{porturl}', porturl);
		brick = brick.replace('{icon}', icon);
	}

	brick = brick.replace('{name}', name);
	brick = brick.replace('{description}', description);
	

	return brick;
}
