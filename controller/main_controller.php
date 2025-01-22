<?php
require_once './model/model.php';
require_once './view/view.php';
class mainController{
    private $model;
    private $view;
    public function __construct(){
        $this->model = new model();
        $this->view = new view();
    }
    public function testConnection(){
        try{
           $data = $this->model->testConnection();
           $this->view->output($data);   
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function searchOrganizations($search){
        try{
            $data = $this->model->searchOrganizations($search);
            $this->view->output($data);
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function searchVolunteers($search){
        try{
            $data = $this->model->searchVolunteers($search);
            $this->view->output($data);
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function addVolunteer($name, $surname, $email, $birth_date, $organization){
        try{
            $data = $this->model->createVolunteer($name, $surname, $email, $birth_date, $organization);
            $this->view->output($data);
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function addOrganization($name, $email, $country){
        try{
            $data = $this->model->createOrganization($name, $email, $country);
            $this->view->output($data);
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function addEvent($name, $start_date, $end_date, $location, $organizations, $volunteers){
        try{
            $data = $this->model->createEvent($name, $start_date, $end_date, $location, $organizations, $volunteers);
            $this->view->output($data);
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function deleteEvents($events){
        try{
            $data = $this->model->deleteEvents($events);
            $this->view->output($data);
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function generateEvents($num){
        try{
            $data = $this->model->generateEvents($num);
            $this->view->output($data);
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function deleteOrganizations($organizations){
        try{
            $data = $this->model->deleteOrganizations($organizations);
            $this->view->output($data);
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function clearTables(){
        try{
            $data = $this->model->clearTables();
            $this->view->output("DB cleared");
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function clearTable($table){
        try{
            $data = $this->model->clearTable($table);
            $this->view->output("Table $table cleared");
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }
    
    public function getVolunteersPage($page, $limit){
        try{
            $data = $this->model->getVolunteersPage($page, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getOrganizationsPage($page, $limit){
        try{
            $data = $this->model->getOrganizationsPage($page, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getEventsPage($page, $limit){
        try{
            $data = $this->model->getEventsPage($page, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getPageNum($limit, $table){
        try{
            $data = $this->model->getCount($table);
            $pages = ceil($data/$limit);
            $this->view->output($pages);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    //generation organization
    public function generateOrganizations($num){
        try{
            $data = $this->model->generateOrganizations($num);
            $this->view->output($data);
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getEventOrganizations($event_id, $page, $limit){
        try{
            $data = $this->model->getEventOrganizationsPage($event_id, $page, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getEventVolunteers($event_id, $page, $limit){
        try{
            $data = $this->model->getEventVolunteersPage($event_id, $page, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getOrganizationEvents($org_name, $page, $limit){
        try{
            $data = $this->model->getOrganizationEventsPage($org_name, $page, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getOrganizationVolunteers($org_name, $page, $limit){
        try{
            $data = $this->model->getOrganizationVolunteersPage($org_name, $page, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getOrgVolNum($org_name, $limit){
        try{
            $data = $this->model->getOrganizationVolunteersPageNum($org_name, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getVolunteerOrganizations($volunteer_id, $page, $limit){
        try{
            $data = $this->model->getVolunteerOrganizationsPage($volunteer_id, $page, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getVolunteerEvents($volunteer_id, $page, $limit){
        try{
            $data = $this->model->getVolunteerEventsPage($volunteer_id, $page, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getVolunteerEventNum($volunteer_id, $limit){
        try{
            $data = $this->model->getVolunteerEventsPageNum($volunteer_id, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    public function getVolunteerOrgNum($volunteer_id, $limit){
        try{
            $data = $this->model->getVolunteerOrganizationsPageNum($volunteer_id, $limit);
            $this->view->output($data);
        }
        catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }

    //generation volunteers
    public function generateVolunteers($num){
        try{
            $data = $this->model->generateVolunteers($num);
            $this->view->output($data);
        } catch (Exception $e){
            $this->view->output($e->getMessage());
        }
    }
}