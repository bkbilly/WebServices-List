<?php
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(-1);

	class MyDB extends SQLite3 {function __construct(){$this->open('services.db');}}
	$db = new MyDB();
	if(!$db){
		echo $db->lastErrorMsg();
		return 0;
	}

	$action = $_REQUEST['action'];
	switch($action){
		case 'getImage' : getImage($db); break;
		case 'getServices' : getServices($db); break;
		case 'updateOrder' : updateOrder($db); break;
		case 'urlExists' : urlExists(); break;
		case 'login' : login($db); break;
		case 'logout' : logout(); break;
		case 'usrStatus' : usrStatus(); break;
		default: echo "Not an Option"; break;
	}

	function login($db){
		session_start();
		$user = $_REQUEST['user'];
		$pass = $_REQUEST['password'];
		$sql = "SELECT * FROM users where usr_name='$user' and usr_password='$pass'";
		$ret = $db->query($sql);
		$row = $ret->fetchArray(SQLITE3_ASSOC);
		if($row){
			$_SESSION['UserName']=$user;
			echo "successfully connected";
		}
		else{
			echo "failure connecting";
		}
	}

	function logout(){
		session_start();
		unset($_SESSION['UserName']);
		session_destroy();
		echo "successfully loged out";
	}

	function usrStatus(){
		session_start();
		if(isset($_SESSION['UserName'])){
			echo "connected";
		}
		else{
			echo "not connected";
		}
	}

	function getImage($db){
		$id = $_REQUEST['id'];
		$sql = "SELECT * FROM images WHERE img_id=$id";
		$ret = $db->query($sql);
		$row = $ret->fetchArray(SQLITE3_ASSOC);

		header("Content-type: image/png");
		echo $row['img_upload'];
	}

	function getServices($db){
		$search = $_REQUEST['search'];
		$sql = "SELECT * FROM services WHERE sv_name like '%$search%' or sv_description like '%$search%' ORDER BY sv_order ASC";
		$ret = $db->query($sql);
		$services = array();
		while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
			$services[] = $row;
		}
		echo(json_encode($services));
	}

	function updateOrder($db){
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

	function urlExists(){
		$url = $_REQUEST['url'];
		$handle = curl_init($url);
		$options = array(
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_SSL_VERIFYHOST => false,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_FOLLOWLOCATION => true,
		);
		curl_setopt_array($handle,  $options);

		curl_exec($handle);
		$httpCode = curl_getinfo($handle, CURLINFO_HTTP_CODE);
		if($httpCode == 404 or $httpCode == 0) {
			echo 'false';
		}
		else{
			echo 'true';
		}
		curl_close($handle);
	}

?>