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

	brick = '<div class="brick" style="background-image: url(\'{icon}\');">{{cover}}</div>';
	cover = '<div class="cover">{{link}}</div>';
	link = '<div class="brick-link"><a href="{porturl}">{{contents}}</a></div>'
	contents = '<h2> {name} </h2><div> {description} </div><div class="read-more">View detail ...</div>';
	
	brick = brick.replace('{icon}', icon);
	link = link.replace('{porturl}', porturl);
	contents = contents.replace('{name}', name);
	contents = contents.replace('{description}', description);

	link = link.replace('{{contents}}', contents);
	cover = cover.replace('{{link}}', link);
	brick = brick.replace('{{cover}}', cover);

	return brick;
}
