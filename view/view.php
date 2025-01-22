<?php
//JSON output management
class view{
    public function output($data){
        echo json_encode($data);
    }
}