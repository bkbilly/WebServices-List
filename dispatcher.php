<?php
	class MyDB extends SQLite3 {function __construct(){$this->open('services.db');}}
	$db = new MyDB();
	if(!$db){
		echo $db->lastErrorMsg();
		return 0;
	}

	switch($action){
		case 'getImage' : getImage($db); break;
		default: echo "Not an Option"; break;
	}

	function getImage(){
		$id = $_REQUEST['id'];
		$sql = "SELECT * FROM images WHERE img_id=$id";
		$ret = $db->query($sql);
		$row = $ret->fetchArray(SQLITE3_ASSOC);

		header("Content-type: image/png");
		echo $row['img_upload'];
	}

	function updateOrder(){
		$new_order = $_POST;
		foreach ($new_order['positions'] as $value) {
			$sv_id = $value['sv_id'];
			$sv_order = $value['sv_order'];
			$sql = "UPDATE services SET sv_order=$sv_order WHERE sv_id=$sv_id";
			$ret = $db->exec($sql);
			if(!$ret){
				echo $db->lastErrorMsg();
			} else {
				echo $db->changes(), " Record updated successfully";
			}
		}
	}

	function getServices(){
		$sql = "SELECT * FROM services ORDER BY sv_order ASC";
		$ret = $db->query($sql);
		$services = array();
		while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
			$services[] = $row;
		}
		echo(json_encode($services));
	}
?>