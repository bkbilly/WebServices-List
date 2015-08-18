<?php
	// ini_set('display_errors', 1);
	// ini_set('display_startup_errors', 1);
	// error_reporting(-1);

	require('params.php');

	$db = new MyDB();
	if(!$db){
		echo $db->lastErrorMsg();
	} else {
		$sql = "SELECT * FROM services ORDER BY sv_order ASC";
		$ret = $db->query($sql);
		$services = array();
		while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
			$services[] = $row;
		}
		echo(json_encode($services));
	}
?>
