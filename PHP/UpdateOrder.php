<?php
	require('params.php');
	$new_order = $_POST;

	$db = new MyDB();
	if(!$db){
		echo $db->lastErrorMsg();
	} else {
		echo("test");
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
?>
