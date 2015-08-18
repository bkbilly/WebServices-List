<?php
	require('params.php');
	$id = $_GET['id'];

	$db = new MyDB();
	if(!$db){
		echo $db->lastErrorMsg();
	} else {
		$sql = "SELECT * FROM images WHERE img_id=$id";
		$ret = $db->query($sql);
		$row = $ret->fetchArray(SQLITE3_ASSOC);

		header("Content-type: image/png");
		echo $row['img_upload'];
	}
?>
