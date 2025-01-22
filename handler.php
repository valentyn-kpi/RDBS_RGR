<?php
require_once './controller/main_controller.php';

$controller = new MainController();

//request method
$method = $_SERVER['REQUEST_METHOD'];
if($method == 'GET'){
    if(!isset($_GET['what'])){
        die('What?');
    }
    $what = $_GET['what'];
        switch ($what){
            case 'testConnection':
                $controller->testConnection();
                break;
            case 'searchOrganizations':
                $search = filter_input(INPUT_GET, 'query', FILTER_SANITIZE_STRING);
                $controller->searchOrganizations($search);
                break;
            case 'searchVolunteers':
                $search = filter_input(INPUT_GET, 'query', FILTER_SANITIZE_STRING);
                $controller->searchVolunteers($search);
                break;
            case 'getVolunteers':
                $page = filter_input(INPUT_GET, 'p', FILTER_SANITIZE_NUMBER_INT);
                $perpage = filter_input(INPUT_GET, 'npp', FILTER_SANITIZE_NUMBER_INT);
                $controller->getVolunteersPage($page, $perpage);
                break;
            case 'getOrganizations':
                $page = filter_input(INPUT_GET, 'p', FILTER_SANITIZE_NUMBER_INT);
                $perpage = filter_input(INPUT_GET, 'npp', FILTER_SANITIZE_NUMBER_INT);
                $controller->getOrganizationsPage($page, $perpage);
                break;
            case 'getEvents':
                $page = filter_input(INPUT_GET, 'p', FILTER_SANITIZE_NUMBER_INT);
                $perpage = filter_input(INPUT_GET, 'npp', FILTER_SANITIZE_NUMBER_INT);
                $controller->getEventsPage($page, $perpage);
                break;
            case 'getPageNum':
                $perpage = filter_input(INPUT_GET, 'npp', FILTER_SANITIZE_NUMBER_INT);
                $table = filter_input(INPUT_GET, 'table', FILTER_SANITIZE_STRING);
                switch($table){
                    case 'volunteers':
                        $table = 'volunteer';
                        break;
                    case 'organizations':
                        $table = 'Organization';
                        break;
                    case 'events':
                        $table = 'event';
                        break;
                    case  'org_event':
                        $table = 'org_event';
                        break;
                    case 'event_volunteer':
                        $table = 'event_volunteer';
                        break;
                    case 'vol_org':
                        $volunteer_id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
                        $controller->getVolunteerOrgNum($volunteer_id, $perpage);
                        die();
                        break;
                    case 'org_vol':
                        $org_name = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_STRING);
                        $controller->getOrgVolNum($org_name, $perpage);
                        die();
                        break;
                    case 'vol_event':
                        $volunteer_id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
                        $controller->getVolunteerEventNum($volunteer_id, $perpage);
                        die();
                        break;
                    default:
                        die('What?');
                }
                $controller->getPageNum($perpage, $table);
                break;
            case 'getEventOrganizations':
                $event_id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
                $page = filter_input(INPUT_GET, 'p', FILTER_SANITIZE_NUMBER_INT);
                $perpage = filter_input(INPUT_GET, 'npp', FILTER_SANITIZE_NUMBER_INT);
                $controller->getEventOrganizations($event_id, $page, $perpage);
                break;
            case 'getEventVolunteers':
                $event_id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
                $page = filter_input(INPUT_GET, 'p', FILTER_SANITIZE_NUMBER_INT);
                $perpage = filter_input(INPUT_GET, 'npp', FILTER_SANITIZE_NUMBER_INT);
                $controller->getEventVolunteers($event_id, $page, $perpage);
                break;
            case 'getOrganizationEvents':
                $org_name = filter_input(INPUT_GET, 'name', FILTER_SANITIZE_STRING);
                $page = filter_input(INPUT_GET, 'p', FILTER_SANITIZE_NUMBER_INT);
                $perpage = filter_input(INPUT_GET, 'npp', FILTER_SANITIZE_NUMBER_INT);
                $controller->getOrganizationEvents($org_name, $page, $perpage);
                break;
            case 'getOrganizationVolunteers':
                $org_name = filter_input(INPUT_GET, 'name', FILTER_SANITIZE_STRING);
                $page = filter_input(INPUT_GET, 'p', FILTER_SANITIZE_NUMBER_INT);
                $perpage = filter_input(INPUT_GET, 'npp', FILTER_SANITIZE_NUMBER_INT);
                $controller->getOrganizationVolunteers($org_name, $page, $perpage);
                break;
            case 'getVolunteerOrganization':
                $volunteer_id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
                $page = filter_input(INPUT_GET, 'p', FILTER_SANITIZE_NUMBER_INT);
                $perpage = filter_input(INPUT_GET, 'npp', FILTER_SANITIZE_NUMBER_INT);
                $controller->getVolunteerOrganizations($volunteer_id, $page, $perpage);
                break;
            case 'getVolunteerEvents':
                $volunteer_id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
                $page = filter_input(INPUT_GET, 'p', FILTER_SANITIZE_NUMBER_INT);
                $perpage = filter_input(INPUT_GET, 'npp', FILTER_SANITIZE_NUMBER_INT);
                $controller->getVolunteerEvents($volunteer_id, $page, $perpage);
                break;
            default:
                die('What?');
        }
}
else if($method == 'POST'){
    $what = $_POST['what'];
    switch($what){
        case 'cleardb':
            $controller->clearTables();
            break;
        case 'cleartable':
            $table = filter_input(INPUT_POST, 'table', FILTER_SANITIZE_STRING);
            $controller->clearTable($table);
            break;
        case 'addVolunteer':
            $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
            $surname = filter_input(INPUT_POST, 'surname', FILTER_SANITIZE_STRING);
            $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
            $birth_date = filter_input(INPUT_POST, 'birth_date', FILTER_SANITIZE_STRING);
            $organization = filter_input(INPUT_POST, 'organization', FILTER_SANITIZE_STRING);
            $controller->addVolunteer($name, $surname, $email, $birth_date, $organization);
            break;
        case 'addOrganization':
            $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
            $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
            $country = filter_input(INPUT_POST, 'country', FILTER_SANITIZE_STRING);
            $reg_date = filter_input(INPUT_POST, 'reg_date', FILTER_SANITIZE_STRING);
            $controller->addOrganization($name, $email, $country, $reg_date);
            break;
        case 'addEvent':
            $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
            $start_date = filter_input(INPUT_POST, 'start_date', FILTER_SANITIZE_STRING);
            $end_date = filter_input(INPUT_POST, 'end_date', FILTER_SANITIZE_STRING);
            $location = filter_input(INPUT_POST, 'location', FILTER_SANITIZE_STRING);
            $volunteers = filter_input(INPUT_POST, 'volunteers', FILTER_SANITIZE_STRING);
            $organizations = filter_input(INPUT_POST, 'organizations', FILTER_SANITIZE_STRING);
            $controller->addEvent($name, $start_date, $end_date, $location, $organizations, $volunteers);
            break;
        case 'deleteEvents':
            $events = filter_input(INPUT_POST, 'ids', FILTER_SANITIZE_STRING);
            $controller->deleteEvents($events);
            break;
        case 'deleteOrganizations':
            $organizations = filter_input(INPUT_POST, 'names', FILTER_SANITIZE_STRING);
            $controller->deleteOrganizations($organizations);
            break;
        case 'generateOrganizations':
            $num = filter_input(INPUT_POST, 'num', FILTER_SANITIZE_NUMBER_INT);
            $controller->generateOrganizations($num);
            break;
        case 'generateVolunteers':
            $num = filter_input(INPUT_POST, 'num', FILTER_SANITIZE_NUMBER_INT);
            $controller->generateVolunteers($num);
            break;
        case 'generateEvents':
            $num = filter_input(INPUT_POST, 'num', FILTER_SANITIZE_NUMBER_INT);
            $controller->generateEvents($num);
            break;
        case 'generateEvents':
            $num = filter_input(INPUT_POST, 'num', FILTER_SANITIZE_NUMBER_INT);
            $controller->generateEvents($num);
            break;
        default:
            die('Post what?');
    }
}
else{
    die('Method not allowed');
}

?>