<?php
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(-1);

	require('params.php');
	$id = $_REQUEST['id'];

	$db = new MyDB();
	if(!$db){
		echo $db->lastErrorMsg();
	} else {
		$sql = "SELECT * FROM services where sv_id=$id";
		$ret = $db->query($sql);
		while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
			$host = $row['sv_target'];
			$port = $row['sv_port'];
			$connection = @fsockopen($host, $port);
			if (is_resource($connection)){
				echo 'Open';
				fclose($connection);
			} else {
				echo 'closed';
			}
		}
	}
?>
