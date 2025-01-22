<?php

require_once './model/db.php';
require_once './model/names.php';

class model {
    private $db;

    public function __construct() {
        $this->db = new dataBase();
    }

    public function testConnection() {
       return $this->db->testConnection();
    } //debug function\\

    public function clearTables() {
        $conn = $this->db->connect();
        $query = "TRUNCATE TABLE volunteer, \"Organization\", event, org_event, event_volunteer, volunteering_for";
        $result = pg_query($conn, $query);
        pg_close($conn);
        return $result;
    }

    public function clearTable($table) {
        $conn = $this->db->connect();
        $query = "TRUNCATE TABLE \"$table\"";
        $result = pg_query($conn, $query);
        pg_close($conn);
        return $result;
    }

    public function searchOrganizations($search) {
        $conn = $this->db->connect();
        $query = "SELECT * FROM \"Organization\" WHERE name ILIKE '%$search%'";
        $result = pg_query($conn, $query);
        $Organizations = pg_fetch_all($result);
        pg_close($conn);
        return $Organizations;
    }

    public function searchVolunteers($search) {
        $conn = $this->db->connect();
        $query = "SELECT * FROM volunteer WHERE name ILIKE '%$search%' OR surname ILIKE '%$search%'";
        $result = pg_query($conn, $query);
        $volunteers = pg_fetch_all($result);
        pg_close($conn);
        return $volunteers;
    }

    //random data generation

    //generate Organizations using sql random 
    public function generateOrganizations($count) {
        global $organizationNames;
        $conn = $this->db->connect();
        $query = "INSERT INTO \"Organization\" (name, email, country) 
                  SELECT (array[" . implode(',', array_map(fn($name) => "'$name'", $organizationNames)) . "])[ceil(random() * " . count($organizationNames) . ")] || md5(random()::text), 
                           (array[" . implode(',', array_map(fn($name) => "'$name'", $organizationNames)) . "])[ceil(random() * " . count($organizationNames) . ")] || '.' || md5(random()::text) || '@gmail.com', 
                         (array['USA', 'Canada', 'UK', 'Germany', 'France'])[ceil(random() * 5)] 
                  FROM generate_series(1, $count)";
        $result = pg_query($conn, $query);
        pg_close($conn);
        return $result;
    }

    //generate volunteers using sql random birth data between 1950 and 2014 getting random Organization from existing
    public function generateVolunteers($count) {
        global $firstNames, $surnames;
        $conn = $this->db->connect();
        $query = "INSERT INTO volunteer (name, surname, email, birth_date, organization) 
                  SELECT (array[" . implode(',', array_map(fn($name) => "'$name'", $firstNames)) . "])[ceil(random() * " . count($firstNames) . ")] AS name, 
                         (array[" . implode(',', array_map(fn($surname) => "'$surname'", $surnames)) . "])[ceil(random() * " . count($surnames) . ")] AS surname, 
                         md5(random()::text) || '@example.com' AS email, 
                         timestamp '1950-01-01 00:00:00' + random() * (timestamp '2014-01-01 00:00:00' - timestamp '1950-01-01 00:00:00') AS birth_date, 
                         (SELECT name FROM \"Organization\" ORDER BY random() LIMIT 1) AS organization 
                  FROM generate_series(1, $count)";
        $result = pg_query($conn, $query);
        pg_close($conn);
        return $result;
    }

    //get limited number of volunteers in pages order by id
    public function getVolunteersPage($page, $limit) {
        $conn = $this->db->connect();
        $offset = ($page - 1) * $limit;
        $query = "SELECT * FROM volunteer ORDER BY id LIMIT $limit OFFSET $offset";
        $result = pg_query($conn, $query);
        $volunteers = pg_fetch_all($result);
        pg_close($conn);
        return $volunteers;
    }

    //get number of volunteers
    public function getCount($table) {
        $conn = $this->db->connect();
        $query = "SELECT COUNT(*) FROM \"$table\"";
        $result = pg_query($conn, $query);
        $count = pg_fetch_row($result);
        pg_close($conn);  
        return $count[0];
    }
    
    //make a new volunteer
    public function createVolunteer($name, $surname, $email, $birth_date, $Organization) {
        $conn = $this->db->connect();
        $query = "INSERT INTO volunteer (name, surname, email, birth_date, organization) VALUES ('$name', '$surname', '$email', '$birth_date', '$Organization') RETURNING id";
        $result = pg_query($conn, $query);
        $id = pg_fetch_result($result, 0, 'id');
        pg_close($conn);  
        return $id;
    }

    //delete multiple volunteers with their connections transaction
    public function deleteVolunteers($ids) {
        $conn = $this->db->connect();
        pg_query($conn, "BEGIN");
        try {
            $query = "DELETE FROM volunteer WHERE id IN (".implode(',', $ids).")";
            pg_query($conn, $query);
            $query = "DELETE FROM event_volunteer WHERE volunteer_id IN (".implode(',', $ids).")";
            pg_query($conn, $query);
            $query = "DELETE FROM volunteering_for WHERE volunteer_id IN (".implode(',', $ids).")";
            pg_query($conn, "COMMIT");
        } catch (Exception $e) {
            pg_query($conn, "ROLLBACK");
            throw $e;
        }
    }

    //update a volunteer
    public function updateVolunteer($id, $name, $surname, $email, $birth_date, $Organization) {
        $conn = $this->db->connect();
        $query = "UPDATE volunteer SET name = '$name', surname = '$surname', email = '$email', birth_date = '$birth_date',\"Organization\" = '$Organization' WHERE id = '$id'";
        $result = pg_query($conn, $query);
        pg_close($conn);  
        return $result;
    }

    //get limited number of Organizations in pages order by id
    public function getOrganizationsPage($page, $limit) {
        $conn = $this->db->connect();
        $offset = ($page - 1) * $limit;
        $query = "SELECT * FROM \"Organization\" ORDER BY name LIMIT $1 OFFSET $2";
        $result = pg_query_params($conn, $query, array($limit, $offset));
        $Organizations = pg_fetch_all($result);
        pg_close($conn);
        return $Organizations;
    }

    //get number of Organizations
    public function getOrganizationsCount() {
        $conn = $this->db->connect();
        $query = "SELECT COUNT(*) FROM\"Organization\"";
        $result = pg_query($conn, $query);
        $count = pg_fetch_row($result);
        pg_close($conn);  
        return $count[0];
    }

    //make a new Organization
    public function createOrganization($name, $email, $country){
        $conn = $this->db->connect();
        $query = "INSERT INTO \"Organization\" (name, email, country) VALUES ('$name', '$email', '$country')";
        $result = pg_query($conn, $query);
        if (!$result) {
            $error = pg_last_error($conn);
            pg_close($conn);
            return "Error: " . $error;
        }
        pg_close($conn);  
        return $result;
    }

    //delete multiple Organizations
    public function deleteOrganizations($ids) {
        $conn = $this->db->connect();
        pg_query($conn, "BEGIN");
        try {
            $idsArray = array_map(fn($id) => "'" . pg_escape_string($id) . "'", explode(',', $ids));
            $query = "DELETE FROM volunteering_for WHERE org_name IN (".implode(',', $idsArray).")";
            if (!pg_query($conn, $query)) {
                throw new Exception(pg_last_error($conn));
            }
            $query = "DELETE FROM org_event WHERE org_name IN (".implode(',', $idsArray).")";
            if (!pg_query($conn, $query)) {
                throw new Exception(pg_last_error($conn));
            }
            $query = "DELETE FROM \"Organization\" WHERE name IN (".implode(',', $idsArray).")";
            if (!pg_query($conn, $query)) {
                throw new Exception(pg_last_error($conn));
            }
            $result = pg_query($conn, "COMMIT");
        } catch (Exception $e) {
            pg_query($conn, "ROLLBACK");
            pg_close($conn);
            return "Error: " . $e->getMessage();
        }
        pg_close($conn);  
        return $result; 
    }

    //update an Organization
    public function updateOrganization($id, $name, $email, $country, $reg_date) {
        $conn = $this->db->connect();
        $query = "UPDATE Organization SET name = '$name', email = '$email', country = '$country', reg_date = '$reg_date' WHERE id = '$id'";
        $result = pg_query($conn, $query);
        pg_close($conn);  
        return $result;
    }

    //get limited number of events in pages order by id
    public function getEventsPage($page, $limit) {
        $conn = $this->db->connect();
        $offset = ($page - 1) * $limit;
        $query = "SELECT * FROM event ORDER BY id LIMIT '$limit' OFFSET '$offset'";
        $result = pg_query($conn, $query);
        $events = pg_fetch_all($result);
        pg_close($conn);
        return $events;
    }

    //get number of events
    public function getEventsCount() {
        $conn = $this->db->connect();
        $query = "SELECT COUNT(*) FROM event";
        $result = pg_query($conn, $query);
        $count = pg_fetch_row($result);
        pg_close($conn);  
        return $count[0];
    }

    //make a new event
    public function createEvent($name, $start_date, $end_date, $location, $organizations, $volunteers) {
        $conn = $this->db->connect();
        pg_query($conn, "BEGIN");
        try {
            $query = "INSERT INTO event (name, start_date, end_date, location) VALUES ('$name', '$start_date', '$end_date', '$location') RETURNING id";
            $result = pg_query($conn, $query);
            $eventId = pg_fetch_result($result, 0, 'id');

            $Organizations = explode(',', $organizations);
            foreach ($Organizations as $OrganizationId) {
                $query = "INSERT INTO org_event (event_id, org_name) VALUES ('$eventId', '$OrganizationId')";
                pg_query($conn, $query);
            }

            $volunteers = explode(',', $volunteers);
            foreach ($volunteers as $volunteerId) {
                $query = "INSERT INTO event_volunteer (event_id, volunteer_id) VALUES ('$eventId', '$volunteerId')";
                pg_query($conn, $query);
            }

            pg_query($conn, "COMMIT");
        } catch (Exception $e) {
            pg_query($conn, "ROLLBACK");
            throw $e;
        }
    }

    //delete multiple events and all their connections
    public function deleteEvents($ids) {
        $conn = $this->db->connect();

        pg_query($conn, "BEGIN");
        try {
            $idsArray = explode(',', $ids);
            $query = "DELETE FROM event_volunteer WHERE event_id IN (".implode(',', array_map('intval', $idsArray)).")";
            pg_query($conn, $query);
            $query = "DELETE FROM org_event WHERE event_id IN (".implode(',', array_map('intval', $idsArray)).")";
            pg_query($conn, $query);
            $query = "DELETE FROM event WHERE id IN (".implode(',', array_map('intval', $idsArray)).")";
            pg_query($conn, $query);
            pg_query($conn, "COMMIT");
            return "done deleting ".$ids;
        } catch (Exception $e) {
            pg_query($conn, "ROLLBACK");
            return $e;
        }
    }

    //update an event
    public function updateEvent($id, $name, $start_date, $end_date, $Organizations) {
        $conn = $this->db->connect();
        pg_query($conn, "BEGIN");
        try {
            $query = "UPDATE event SET name = '$name', start_date = '$start_date', end_date = '$end_date' WHERE id = '$id'";
            pg_query($conn, $query);
            $query = "DELETE FROM org_event WHERE event_id = '$id'";
            pg_query($conn, $query);
            foreach ($Organizations as $OrganizationId) {
                $query = "INSERT INTO org_event (event_id, Organization_id) VALUES ('$id', '$OrganizationId') ON CONFLICT DO NOTHING";
                pg_query($conn, $query);
            }
            pg_query($conn, "COMMIT");
        } catch (Exception $e) {
            pg_query($conn, "ROLLBACK");
            throw $e;
        }
    }

    //start volunteering for an event
    public function startVolunteering($volunteerIds, $eventId) {
        $conn = $this->db->connect();
        pg_query($conn, "BEGIN");
        try {
            foreach ($volunteerIds as $volunteerId) {
                $query = "INSERT INTO event_volunteer (event_id, volunteer_id) VALUES ('$eventId', '$volunteerId') ON CONFLICT DO NOTHING";
                pg_query($conn, $query);
            }
            pg_query($conn, "COMMIT");
        } catch (Exception $e) {
            pg_query($conn, "ROLLBACK");
            throw $e;
        }
    }

    //stop volunteering for an event
    public function stopVolunteering($volunteerIds, $eventId) {
        $conn = $this->db->connect();
        pg_query($conn, "BEGIN");
        try {
            foreach ($volunteerIds as $volunteerId) {
                $query = "DELETE FROM event_volunteer WHERE event_id = '$eventId' AND volunteer_id = '$volunteerId'";
                pg_query($conn, $query);
            }
            pg_query($conn, "COMMIT");
        } catch (Exception $e) {
            pg_query($conn, "ROLLBACK");
            throw $e;
        }
    }

    //get limited number volunteers for an event
    public function getEventVolunteersPage($eventId, $page, $limit) {
        $conn = $this->db->connect();
        $offset = ($page - 1) * $limit;
        $query = "SELECT * FROM volunteer WHERE id IN (SELECT volunteer_id FROM event_volunteer WHERE event_id = $1) ORDER BY id LIMIT $2 OFFSET $3";
        $result = pg_query_params($conn, $query, array($eventId, $limit, $offset));
        $volunteers = pg_fetch_all($result);
        pg_close($conn);
        return $volunteers;
    }


    //get limited number of events for a volunteer
    public function getVolunteerEventsPage($volunteerId, $page, $limit) {
        $conn = $this->db->connect();
        $offset = ($page - 1) * $limit;
        $query = "SELECT * FROM event WHERE id IN (SELECT event_id FROM event_volunteer WHERE volunteer_id = $1) ORDER BY id LIMIT $2 OFFSET $3";
        $result = pg_query_params($conn, $query, array($volunteerId, $limit, $offset));
        $events = pg_fetch_all($result);
        pg_close($conn);
        return $events;
    }

    //get page number for getVolunteerEventsPage
    public function getVolunteerEventsPageNum($volunteerId, $limit) {
        $conn = $this->db->connect();
        $query = "SELECT COUNT(*) FROM event WHERE id IN (SELECT event_id FROM event_volunteer WHERE volunteer_id = $1)";
        $result = pg_query_params($conn, $query, array($volunteerId));
        $count = pg_fetch_row($result);
        pg_close($conn);
        return ceil($count[0] / $limit);
    }


    //get limited number of Organizations for a volunteer
    public function getVolunteerOrganizationsPage($volunteerId, $page, $limit) {
        $conn = $this->db->connect();
        $query = "SELECT o.name, vf.start_date, vf.end_date 
                  FROM volunteering_for vf 
                  JOIN \"Organization\" o ON vf.org_name = o.name 
                  WHERE vf.volunteer_id = $1";
        $result = pg_query_params($conn, $query, array($volunteerId));
        $details = pg_fetch_all($result);
        pg_close($conn);
        return $details;
    }

    public function getVolunteerOrganizationsPageNum($volunteerId, $limit) {
        $conn = $this->db->connect();
        $query = "SELECT COUNT(*) FROM volunteering_for WHERE volunteer_id = $1";
        $result = pg_query_params($conn, $query, array($volunteerId));
        $count = pg_fetch_row($result);
        pg_close($conn);
        return ceil($count[0] / $limit);
    }

    //get limited number of volunteers for an Organization
    public function getOrganizationVolunteersPage($OrganizationId, $page, $limit) {
        $conn = $this->db->connect();
        $offset = ($page - 1) * $limit;
        $query = "SELECT * FROM volunteer WHERE organization = $1 ORDER BY id LIMIT $2 OFFSET $3";
        $result = pg_query_params($conn, $query, array($OrganizationId, $limit, $offset));
        $volunteers = pg_fetch_all($result);
        pg_close($conn);
        return $volunteers;
    }

    public function getOrganizationVolunteersPageNum($OrganizationId, $limit) {
        $conn = $this->db->connect();
        $query = "SELECT COUNT(*) FROM volunteer WHERE organization = $1";
        $result = pg_query_params($conn, $query, array($OrganizationId));
        $count = pg_fetch_row($result);
        pg_close($conn);
        return ceil($count[0] / $limit);
    }

    //get limited number of events for an Organization
    public function getOrganizationEventsPage($Organizationname, $page, $limit) {
        $conn = $this->db->connect();
        $offset = ($page - 1) * $limit;
        $query = "SELECT * FROM event WHERE id IN (SELECT event_id FROM org_event WHERE org_name = $1) ORDER BY id LIMIT $2 OFFSET $3";
        $result = pg_query_params($conn, $query, array($Organizationname, $limit, $offset));
        if ($result === false) {
            pg_close($conn);
            return false;
        }
        $events = pg_fetch_all($result);
        pg_close($conn);
        return $events;
    }

    //get limited number of Organizations for an event
    public function getEventOrganizationsPage($eventId, $page, $limit) {
        $conn = $this->db->connect();
        $offset = ($page - 1) * $limit;
        $query = "SELECT * FROM \"Organization\" WHERE name IN (SELECT org_name FROM org_event WHERE event_id = $1) ORDER BY name LIMIT $2 OFFSET $3";
        $result = pg_query_params($conn, $query, array($eventId, $limit, $offset));
        $Organizations = pg_fetch_all($result);
        pg_close($conn);
        return $Organizations;
    }    

    public function generateEvents($num){
        $conn = $this->db->connect();
        $query = "INSERT INTO event (name, start_date, end_date, location) 
                  SELECT md5(random()::text), 
                         timestamp '2021-01-01 00:00:00' + random() * (timestamp '2021-12-31 00:00:00' - timestamp '2021-01-01 00:00:00') AS start_date, 
                         timestamp '2021-01-01 00:00:00' + random() * (timestamp '2021-12-31 00:00:00' - timestamp '2021-01-01 00:00:00') AS end_date, 
                         (array['USA', 'Canada', 'UK', 'Germany', 'France'])[ceil(random() * 5)] AS location 
                  FROM generate_series(1, $num)";
        $result = pg_query($conn, $query);
        pg_close($conn);
        return $result;
    }
}
?>