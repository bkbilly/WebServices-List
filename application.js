hostname = window.location.hostname
/*$(function() {
	var wall = new freewall("#freewall");
	wall.reset({
		draggable: true,
		animate: true,
		cellW: 320,
		cellH: 160,
		fixSize: 0,
		onResize: function() {
			wall.refresh();
		}
	});
	wall.fitWidth();
	
	$.getJSON( "start.json", function(data) {
		for (var i = 0; i < data.services.length; i++) {
			html = getBrickURL(data.services[i]);
			wall.appendBlock(html);
		};
	}).fail(function(d, textStatus, error) {
		console.error("getJSON failed, status: " + textStatus + ", error: " + error);
	});
});*/
$( document ).ready(function() {
	$("#header").click(function( event ) {
		location.reload();
	});
	$.getJSON( "start.json", function(data) {
		for (var i = 0; i < data.services.length; i++) {
			html = getBrickURL(data.services[i]);
			$(".shapeshift").append(html);
			$(".shapeshift").shapeshift();
		};
	}).fail(function(d, textStatus, error) {
		console.error("getJSON failed, status: " + textStatus + ", error: " + error);
	});
});

function getBrickURL(service){
	icon = service.icon;
	name = service.name;
	description = service.description;
	if(service.secured == true){porturl = "https://"}else{porturl = "http://"}
	if(service.target == "local"){hostname = window.location.hostname}else{hostname = service.target}
	porturl = porturl + hostname + ":" + service.port + service.url
	
	brick = '<div class="brick" style="background-image: url(\'{icon}\')">\
		<div class="cover">\
			<a href="{porturl}">\
				<h2>{name}</h2>\
				<h4>{description}</h4>\
				<div class="read-more">View detail ...</div>\
			</a>\
		</div>\
	</div>';
	brick = brick.replace('{icon}', icon);
	brick = brick.replace('{porturl}', porturl);
	brick = brick.replace('{name}', name);
	brick = brick.replace('{description}', description);
	

	return brick;
}
