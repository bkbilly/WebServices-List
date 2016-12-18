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
		case 'getImagesIDs' : getImagesIDs($db); break;
		case 'uploadImage' : uploadImage($db); break;
		case 'getService' : getService($db); break;
		case 'getServices' : getServices($db); break;
		case 'updateOrder' : updateOrder($db); break;
		case 'deleteService' : deleteService($db); break;
		case 'addService' : addService($db); break;
		case 'updateService' : updateService($db); break;
		case 'urlExists' : urlExists(); break;
		case 'login' : login($db); break;
		case 'logout' : logout(); break;
		case 'usrStatus' : usrStatus(); break;
		default: header('HTTP/ 500'); echo "Not an Option"; break;
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
			$status = array('credentials' => true);
		}
		else{
			$status = array('credentials' => false);
		}
		echo json_encode($status);
	}

	function logout(){
		session_start();
		unset($_SESSION['UserName']);
		session_destroy();
		$status = array('logout' => true);
		echo json_encode($status);
	}

	function usrStatus(){
		session_start();
		if(isset($_SESSION['UserName'])){
			$status = array('connected' => true);
		}
		else{
			$status = array('connected' => false);
		}
		echo json_encode($status);
	}

	function uploadImage($db){
		session_start();
		if(isset($_SESSION['UserName'])){
			print_r($_FILES);
			if($_FILES['attachment']['size'] != 0){
				$tmpImg = file_get_contents($_FILES['attachment']['tmp_name']);
	
				$sql = "INSERT INTO images (img_id, img_upload) VALUES ((SELECT max(img_id) FROM images)+1, ?)";
				$query = $db->prepare($sql);
				$query->bindValue(1, $tmpImg, SQLITE3_BLOB);
				$run=$query->execute();
	
				$sql = "SELECT max(img_id) as img_id FROM images";
				$ret = $db->query($sql);
				$row = $ret->fetchArray(SQLITE3_ASSOC);
	
				$status = array('changed' => true, 'message' => "Successfully insert image", 'img_id' => $row['img_id']);
			} else {
				$status = array('changed' => false, 'message' => "Can't upload image...");
			}
		} else {
			$status = array('changed' => false, 'message' => "User not connected");
		}
		echo json_encode($status);
	}

	function getImagesIDs($db){
		$sql = "SELECT img_id FROM images ORDER BY img_id DESC";
		$ret = $db->query($sql);
		$imgIDs = array();
		while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
			$imgIDs[] = $row['img_id'];
		}
		echo json_encode($imgIDs);
	}

	function getImage($db){
		$id = $_REQUEST['id'];
		$sql = "SELECT * FROM images WHERE img_id=$id";
		$ret = $db->query($sql);
		$row = $ret->fetchArray(SQLITE3_ASSOC);

		header("Content-type: image/png");
		echo $row['img_upload'];
	}

	function getService($db){
		$svId = $_REQUEST['sv_id'];
		$sql = "SELECT * FROM services WHERE sv_id=$svId";
		$ret = $db->query($sql);
		$service = array();
		while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
			$service = $row;
		}
		echo json_encode($service);
	}

	function getServices($db){
		$search = $_REQUEST['search'];
		$sql = "SELECT * FROM services WHERE sv_name like '%$search%' or sv_description like '%$search%' ORDER BY sv_order ASC";
		$ret = $db->query($sql);
		$services = array();
		while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
			$services[] = $row;
		}
		echo json_encode($services);
	}

	function updateOrder($db){
		session_start();
		if(isset($_SESSION['UserName'])){
			$new_order = $_POST;
			foreach ($new_order['positions'] as $value) {
				$sv_id = $value['sv_id'];
				$sv_order = $value['sv_order'];
				$sql = "UPDATE services SET sv_order=$sv_order WHERE sv_id=$sv_id";
				$ret = $db->exec($sql);
				if(!$ret){
					$status = array('changed' => false, 'message' => $db->lastErrorMsg());
					break;
				} else {
					if($db->changes() == 1){
						$status = array('changed' => true, 'message' => "Successfully changed order");
					} else{
						$status = array('changed' => false, 'message' => "Can't change order");
					}
				}
			}
		}
		else{
			$status = array('changed' => false, 'message' => "User not connected");
		}
		echo json_encode($status);
	}

	function deleteService($db){
		session_start();
		if(isset($_SESSION['UserName'])){
			$value = $_POST;
			$sv_id = $value['sv_id'];
			$sql = "DELETE FROM services WHERE sv_id = $sv_id";
			$ret = $db->exec($sql);
			if(!$ret){
				$status = array('changed' => false, 'message' => $db->lastErrorMsg());
			} else {
				if($db->changes() == 1){
					$status = array('changed' => true, 'message' => "Successfully updated service");
				} else{
					$status = array('changed' => false, 'message' => "Can't update service");
				}
			}
		}
		else{
			$status = array('changed' => false, 'message' => "User not connected");
		}
		echo json_encode($status);
	}

	function addService($db){
		session_start();
		if(isset($_SESSION['UserName'])){
			$value = $_POST;
			$sv_name = $value['sv_name'];
			$sv_description = $value['sv_description'];
			$sv_target = $value['sv_target'];
			$sv_port = $value['sv_port'];
			$sv_url = $value['sv_url'];
			$sv_secured = $value['sv_secured'];
			$img_id = $value['img_id'];
			$sql = "INSERT INTO services (sv_id, sv_name, sv_description, sv_target, sv_port, sv_url, sv_secured, img_id, sv_order) VALUES ((SELECT max(sv_id) FROM services)+1, '$sv_name', '$sv_description', '$sv_target', '$sv_port', '$sv_url', '$sv_secured', $img_id, (SELECT max(sv_order) FROM services)+1)";
			$ret = $db->exec($sql);
			if(!$ret){
				$status = array('changed' => false, 'message' => $db->lastErrorMsg());
			} else {
				if($db->changes() == 1){
					$status = array('changed' => true, 'message' => "Successfully updated service");
				} else{
					$status = array('changed' => false, 'message' => "Can't update service");
				}
			}
		}
		else{
			$status = array('changed' => false, 'message' => "User not connected");
		}
		echo json_encode($status);
	}

	function updateService($db){
		session_start();
		if(isset($_SESSION['UserName'])){
			$value = $_POST;
			$sv_id = $value['sv_id'];
			$sv_name = $value['sv_name'];
			$sv_description = $value['sv_description'];
			$sv_target = $value['sv_target'];
			$sv_port = $value['sv_port'];
			$sv_url = $value['sv_url'];
			$sv_secured = $value['sv_secured'];
			$img_id = $value['img_id'];
			$sql = "UPDATE services SET sv_name='$sv_name', sv_description='$sv_description', sv_target='$sv_target', sv_port='$sv_port', sv_url='$sv_url', sv_secured='$sv_secured', img_id=$img_id WHERE sv_id=$sv_id";
			$ret = $db->exec($sql);
			if(!$ret){
				$status = array('changed' => false, 'message' => $db->lastErrorMsg());
			} else {
				if($db->changes() == 1){
					$status = array('changed' => true, 'message' => "Successfully updated service");
				} else{
					$status = array('changed' => false, 'message' => "Can't update service");
				}
			}
		}
		else{
			$status = array('changed' => false, 'message' => "User not connected");
		}
		echo json_encode($status);
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
