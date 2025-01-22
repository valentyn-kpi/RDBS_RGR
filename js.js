

var currentTable = null;
var recordsPerPage = 10;
var currentPage = 1;


document.addEventListener("DOMContentLoaded", () => {
    const Button1 = document.querySelector('button[opt="vol"]');
    const Button2 = document.querySelector('button[opt="org"]');
    const Button3 = document.querySelector('button[opt="event"]');
    const buttons = [Button1, Button2, Button3];

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            buttons.forEach(btn => btn.classList.remove('disabled'));
            button.classList.add('active');
            button.classList.add('disabled');
            switch (button.getAttribute('opt')) {
                case 'vol':
                    currentTable = 'volunteers';
                    break;
                case 'org':
                    currentTable = 'organizations';
                    break;
                case 'event':
                    currentTable = 'events';
                    break;
            }
            currentPage = 1;
            renderCurrentTable('table-container', recordsPerPage, currentTable);
            renderPageSelector('page-selector', recordsPerPage, currentTable);
        });
    });
    if (768 > window.innerWidth) {
        const elements = document.querySelectorAll("[data-bss-disabled-mobile]");
        elements.forEach(element => {
            element.classList.remove("animated");
            element.removeAttribute("data-bss-hover-animate");
            element.removeAttribute("data-aos");
            element.removeAttribute("data-bss-parallax-bg");
            element.removeAttribute("data-bss-scroll-zoom");
        });
    }
});

function renderPageSelector(destinationElementId, recordsPerPage, currentTable, id) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'handler.php?what=getPageNum&npp=' + recordsPerPage + '&table=' + currentTable+'&id='+id, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const totalPages = parseInt(xhr.responseText, 10);
    
            const pageSelector = document.getElementById(destinationElementId);
            pageSelector.innerHTML = '';

            const createPageButton = (page) => {
                const pageButton = document.createElement('button');
                pageButton.textContent = page;
                pageButton.classList.add('btn', 'btn-secondary');
                if (page === currentPage) {
                    pageButton.classList.add('active');
                }
                pageButton.addEventListener('click', () => {
                    currentPage = page;
                    renderCurrentTable('table-container', recordsPerPage, currentTable);
                    renderPageSelector(destinationElementId, recordsPerPage, currentTable, id);
                });
                return pageButton;
            };

            const createNavButton = (text, targetPage) => {
                const navButton = document.createElement('button');
                navButton.textContent = text;
                navButton.classList.add('btn', 'btn-secondary');
                navButton.addEventListener('click', () => {
                    currentPage = targetPage;
                    renderCurrentTable('table-container', recordsPerPage, currentTable);
                    renderPageSelector(destinationElementId, recordsPerPage, currentTable, id);
                });
                return navButton;
            };

            if (currentPage > 1) {
                pageSelector.appendChild(createNavButton('<', currentPage - 1));
            }

            if (totalPages <= 10) {
                for (let i = 1; i <= totalPages; i++) {
                    pageSelector.appendChild(createPageButton(i));
                }
            } else {
                pageSelector.appendChild(createPageButton(1));
                if (currentPage > 4) {
                    const ellipsis = document.createElement('span');
                    ellipsis.textContent = '...';
                    pageSelector.appendChild(ellipsis);
                }
                for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
                    pageSelector.appendChild(createPageButton(i));
                }
                if (currentPage < totalPages - 3) {
                    const ellipsis = document.createElement('span');
                    ellipsis.textContent = '...';
                    pageSelector.appendChild(ellipsis);
                }
                pageSelector.appendChild(createPageButton(totalPages));
            }

            if (currentPage < totalPages) {
                pageSelector.appendChild(createNavButton('>', currentPage + 1));
            }
        }
    }
}
function renderTable(destinationElementId, endpoint, headers, processRecord) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `handler.php?what=${endpoint}&npp=${recordsPerPage}&p=${currentPage}`, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const table = document.createElement('table');
            table.classList.add('table', 'table-striped', 'table-hover', 'table-bordered', 'text-center');

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');

            data.forEach(record => {
                const row = document.createElement('tr');
                row.addEventListener('click', () => {
                    const checkbox = row.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    row.classList.toggle('selected');
                });

                const selectCell = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.addEventListener('click', (event) => {
                    event.stopPropagation();
                });
                selectCell.appendChild(checkbox);
                row.appendChild(selectCell);

                processRecord(record, row);

                const actionCell = document.createElement('td');
                const actionButton = document.createElement('button');
                actionButton.textContent = 'Action';
                actionButton.classList.add('btn', 'btn-primary');
                actionButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    checkbox.checked = !checkbox.checked;
                    row.classList.toggle('selected');
                    showActionPopup(Array.from(tbody.querySelectorAll('.selected')).map(row => data[row.rowIndex - 1]));
                    tbody.querySelectorAll('.selected').forEach(row => {
                        row.classList.remove('selected');
                        row.querySelector('input[type="checkbox"]').checked = false;
                    });
                });
                actionCell.appendChild(actionButton);
                row.appendChild(actionCell);

                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            const destinationElement = document.querySelectorAll(`#${destinationElementId}`);
            const lastElement = destinationElement[destinationElement.length - 1];
            lastElement.innerHTML = '';
            lastElement.appendChild(table);
        }
    };
}
function renderVolunteers(destinationElementId, recordsPerPage, currentTable) {
    const headers = ['', 'ID', 'Name', 'Surname', 'E-mail', 'Birth Date', 'Organization', 'Action'];
    renderTable(destinationElementId, 'getVolunteers', headers, (record, row) => {
        Object.keys(record).forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = record[key].length > 35 ? record[key].substring(0, 30) + '...' : record[key];
            row.appendChild(cell);
        });
    });
}

function renderOrganizations(destinationElementId, recordsPerPage, currentTable) {
    const headers = ['', 'Name', 'E-Mail', 'Country', 'Registration date', 'Action'];
    renderTable(destinationElementId, 'getOrganizations', headers, (record, row) => {
        Object.keys(record).forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = record[key].length > 35 ? record[key].substring(0, 30) + '...' : record[key];
            row.appendChild(cell);
        });
    });
}

function renderEvents(destinationElementId, recordsPerPage, currentTable) {
    const headers = ['', 'ID', 'Name', 'Start', 'End', 'Location', 'Action'];
    renderTable(destinationElementId, 'getEvents', headers, (record, row) => {
        Object.keys(record).forEach(key => {
            const cell = document.createElement('td');
            if (record[key] === null) {
                cell.textContent = 'null';
            } else if (key === 'start_date' || key === 'end_date') {
                const date = new Date(record[key]);
                cell.textContent = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
            } else if (key === 'location') {
                const locationDiv = document.createElement('div');
                locationDiv.textContent = record[key].length > 35 ? record[key].substring(0, 30) + '...' : record[key];
                locationDiv.style.whiteSpace = 'pre-wrap';
                const locationButton = document.createElement('button');
                locationButton.textContent = 'View on Maps';
                locationButton.classList.add('btn', 'btn-info');
                locationButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    viewOnGoogleMaps(record[key]);
                });
                cell.appendChild(locationDiv);
                cell.appendChild(locationButton);
            } else {
                cell.textContent = record[key].length > 35 ? record[key].substring(0, 30) + '...' : record[key];
            }
            row.appendChild(cell);
        });
    });
}
function viewOnGoogleMaps(address) {
    const overlay = document.createElement('div');
    overlay.classList.add('maps-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const mapsBox = document.createElement('div');
    mapsBox.classList.add('maps-box');
    mapsBox.style.backgroundColor = '#2b2b2b';
    mapsBox.style.padding = '20px';
    mapsBox.style.borderRadius = '5px';
    mapsBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    mapsBox.innerHTML = `
        <div class="maps-header" style="margin-bottom: 10px;">
            <h5>View on Google Maps</h5>
        </div>
        <div class="maps-content" style="margin-bottom: 10px;">
            <iframe
            width="600"
            height="450"
            style="border:0"
            loading="lazy"
            allowfullscreen
            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyApWNPv8ZQ7trcawbID4SCQEHSK-dDz-DY&q=${encodeURIComponent(address)}&maptype=satellite">
            </iframe>
        </div>
        <div class="maps-buttons" style="text-align: right;">
            <button class="btn btn-secondary maps-close">Close</button>
        </div>
        `;

    overlay.appendChild(mapsBox);
    document.body.appendChild(overlay);

    overlay.querySelector('.maps-close').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
}

function renderCurrentTable(destinationElementId, recordsPerPage, currentTable) {
    switch (currentTable) {
        case 'volunteers':
            renderVolunteers(destinationElementId, recordsPerPage, currentTable);
            break;
        case 'organizations':
            renderOrganizations(destinationElementId, recordsPerPage, currentTable);
            break;
        case 'events':
            renderEvents(destinationElementId, recordsPerPage, currentTable);
            break;
    }
}

function showActionPopup(records) {
    const overlay = document.createElement('div');
    overlay.classList.add('action-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const actionBox = document.createElement('div');
    actionBox.classList.add('action-box');
    actionBox.style.backgroundColor = '#2b2b2b';
    actionBox.style.padding = '20px';
    actionBox.style.borderRadius = '5px';
    actionBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    actionBox.innerHTML = `
        <div class="action-header" style="margin-bottom: 10px;">
            <h5>Available Actions</h5>
        </div>
        <div class="action-content" style="margin-bottom: 10px;">
            <p>${records.length} record${records.length > 1 ? 's' : ''} selected</p>
            <button class="btn btn-info view-details" style="${records.length > 1 ? 'display: none;' : ''}">View Details</button>
            <button class="btn btn-warning edit-record" style="${records.length > 1 ? 'display: none;' : ''}">Edit</button>
            <button class="btn btn-danger delete-record">Delete</button>
        </div>
        <div class="action-buttons" style="text-align: right;">
            <button class="btn btn-secondary action-close">Close</button>
        </div>
        `;

    overlay.appendChild(actionBox);
    document.body.appendChild(overlay);

    overlay.querySelector('.action-close').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    overlay.querySelector('.view-details').addEventListener('click', () => {
        console.log('View details for:', records);
        switch (records[0].hasOwnProperty('surname') ? 'volunteers' : records[0].hasOwnProperty('country') ? 'organizations' : 'events') {
            case 'volunteers':
                viewVolunteerDetails(records[0]);
                break;
            case 'organizations':
                viewOrganizationDetails(records[0]);
                break;
            case 'events':
                viewEventDetails(records[0]);
                break;
        }  document.body.removeChild(overlay);
    });

    overlay.querySelector('.edit-record').addEventListener('click', () => {
        if (records.length === 1) {
            console.log('Edit record:', records[0]);
        }
        document.body.removeChild(overlay);
    });

    overlay.querySelector('.delete-record').addEventListener('click', () => {
        console.log('Delete records:', records);
        switch (records[0].hasOwnProperty('surname') ? 'volunteers' : records[0].hasOwnProperty('country') ? 'organizations' : 'events') {
            case 'volunteers':
                deleteVolunteers(records);
                break;
            case 'organizations':
                deleteOrganizations(records);
                break;
            case 'events':
                deleteEvent(records);
                break;
        }
        document.body.removeChild(overlay);
    });
}

function viewVolunteerDetails(volunteer) {
    const overlay = document.createElement('div');
    overlay.classList.add('details-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const detailsBox = document.createElement('div');
    detailsBox.classList.add('details-box');
    detailsBox.style.backgroundColor = '#2b2b2b';
    detailsBox.style.padding = '20px';
    detailsBox.style.borderRadius = '5px';
    detailsBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    detailsBox.innerHTML = `
        <div class="details-header" style="margin-bottom: 10px;">
            <h5>Volunteer Details</h5>
        </div>
        <div class="details-content" style="margin-bottom: 10px;">
            <p><strong>ID:</strong> ${volunteer.id}</p>
            <p><strong>Name:</strong> ${volunteer.name}</p>
            <p><strong>Surname:</strong> ${volunteer.surname}</p>
            <p><strong>E-mail:</strong> ${volunteer.email}</p>
            <p><strong>Birth Date:</strong> ${volunteer.birth_date}</p>
            <p><strong>Organization:</strong> ${volunteer.organization}</p>
            <button class="btn btn-info view-events">View Events</button>
            <button class="btn btn-info view-organization">View Organizations</button>
        </div>
        <div class="details-buttons" style="text-align: right;">
            <button class="btn btn-secondary details-close">Close</button>
        </div>
        <div class="container-sm table-responsive" id="volunteer-events" style="--bs-body-color: #d4d4d4; border-radius: 3px; border-color: #3a3a3a; border-left: 0px solid rgb(58, 58, 58); padding-top: 0px; margin-top: -19px; font-size: 0.9rem; line-height: 1.2;"></div>
        <div class="container-sm text-end custom-button-group" id="volunteer-events-pgp"></div>
    `;

    overlay.appendChild(detailsBox);
    document.body.appendChild(overlay);

    const savedState = {
        currentPage,
        recordsPerPage,
        currentTable
    };

    currentPage = 1;
    recordsPerPage = 5;
    currentTable = null;

    overlay.querySelector('.details-close').addEventListener('click', () => {
        currentPage = savedState.currentPage;
        recordsPerPage = savedState.recordsPerPage;
        currentTable = savedState.currentTable;
        document.body.removeChild(overlay);
    });

    overlay.querySelector('.view-events').addEventListener('click', () => {
        viewVolunteerEvents(volunteer.id);
    });

    overlay.querySelector('.view-organization').addEventListener('click', () => {
        viewVolunteerOrganization(volunteer.id);
    });
}

function viewOrganizationDetails(organization) {
    const overlay = document.createElement('div');
    overlay.classList.add('details-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const detailsBox = document.createElement('div');
    detailsBox.classList.add('details-box');
    detailsBox.style.backgroundColor = '#2b2b2b';
    detailsBox.style.padding = '20px';
    detailsBox.style.borderRadius = '5px';
    detailsBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    detailsBox.innerHTML = `
        <div class="details-header" style="margin-bottom: 10px;">
            <h5>Organization Details</h5>
        </div>
        <div class="details-content" style="margin-bottom: 10px;">
            <p><strong>Name:</strong> ${organization.name}</p>
            <p><strong>E-Mail:</strong> ${organization.email}</p>
            <p><strong>Country:</strong> ${organization.country}</p>
            <p><strong>Registration Date:</strong> ${organization.reg_date}</p>
            <button class="btn btn-info view-volunteers">View Volunteers</button>
            <button class="btn btn-info view-events">View Events</button>
        </div>
        <div class="details-buttons" style="text-align: right;">
            <button class="btn btn-secondary details-close">Close</button>
        </div>
        <div class="container-sm table-responsive" id="table-container-orgvol" style="--bs-body-color: #d4d4d4; border-radius: 3px; border-color: #3a3a3a; border-left: 0px solid rgb(58, 58, 58); padding-top: 0px; margin-top: -19px; font-size: 0.9rem; line-height: 1.2;"></div>
        <div class="container-sm text-end custom-button-group" id="page-selector-orgvol"></div>
    `;

    overlay.appendChild(detailsBox);
    document.body.appendChild(overlay);

    const savedState = {
        currentPage,
        recordsPerPage,
        currentTable
    };

    currentPage = 1;
    recordsPerPage = 5;
    currentTable = null;

    overlay.querySelector('.details-close').addEventListener('click', () => {
        currentPage = savedState.currentPage;
        recordsPerPage = savedState.recordsPerPage;
        currentTable = savedState.currentTable;
        document.body.removeChild(overlay);
    });

    overlay.querySelector('.view-volunteers').addEventListener('click', () => {
        viewOrganizationVolunteers(organization.name);
    });

    overlay.querySelector('.view-events').addEventListener('click', () => {
        viewOrganizationEvents(organization.name);
    });
}

function viewOrganizationVolunteers(organizationname) {
    const headers = ['','ID', 'Name', 'Surname', 'E-mail', 'Birth Date', 'Action'];
    renderTable('table-container-orgvol', `getOrganizationVolunteers&id=${organizationname}`, headers, (record, row) => {
        Object.keys(record).forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = record[key].length > 35 ? record[key].substring(0, 30) + '...' : record[key];
            row.appendChild(cell);
        });
    });
    renderPageSelector('page-selector-orgvol', recordsPerPage, 'org_vol', organizationname);
}

function viewOrganizationEvents(organizationname) {
    const headers = ['', 'ID', 'Name', 'Start', 'End', 'Location', 'Action'];
    renderTable('table-container-orgvol', `getOrganizationEvents&name=${organizationname}`, headers, (record, row) => {
        Object.keys(record).forEach(key => {
            const cell = document.createElement('td');
            if (key === 'start_date' || key === 'end_date') {
                const date = new Date(record[key]);
                cell.textContent = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                cell.textContent = record[key].length > 35 ? record[key].substring(0, 30) + '...' : record[key];
            }
            row.appendChild(cell);
        });
    });
    renderPageSelector('page-selector-orgvol', recordsPerPage, 'org_event');
}

function viewVolunteerEvents(volunteerId) {
    const headers = ['','ID', 'Name', 'Start', 'End', 'Location',''];
    renderTable('volunteer-events', `getVolunteerEvents&id=${volunteerId}`, headers, (record, row) => {
        Object.keys(record).forEach(key => {
            const cell = document.createElement('td');
            if (key === 'start_date' || key === 'end_date') {
                const date = new Date(record[key]);
                cell.textContent = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                cell.textContent = record[key].length > 35 ? record[key].substring(0, 30) + '...' : record[key];
            }
            row.appendChild(cell);
        });
    });
    renderPageSelector('volunteer-events-pgp', recordsPerPage, 'vol_event', volunteerId);
}

function viewVolunteerOrganization(volunteerId) {
    const headers = ['','Name', 'Stard date', 'End Date','Action'];
    renderTable('volunteer-events', `getVolunteerOrganization&id=${volunteerId}`, headers, (record, row) => {
        Object.keys(record).forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = record[key].length > 35 ? record[key].substring(0, 30) + '...' : record[key];
            row.appendChild(cell);
        });
    });
    renderPageSelector('volunteer-events-pgp', recordsPerPage, 'vol_org', volunteerId);
}

function viewEventDetails(event) {
    const overlay = document.createElement('div');
    overlay.classList.add('details-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const detailsBox = document.createElement('div');
    detailsBox.classList.add('details-box');
    detailsBox.style.backgroundColor = '#2b2b2b';
    detailsBox.style.padding = '20px';
    detailsBox.style.borderRadius = '5px';
    detailsBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    detailsBox.innerHTML = `
        <div class="details-header" style="margin-bottom: 10px;">
            <h5>Event Details</h5>
        </div>
        <div class="details-content" style="margin-bottom: 10px;">
            <p><strong>ID:</strong> ${event.id}</p>
            <p><strong>Name:</strong> ${event.name}</p>
            <p><strong>Start:</strong> ${new Date(event.start_date).toLocaleString()}</p>
            <p><strong>End:</strong> ${new Date(event.end_date).toLocaleString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <button class="btn btn-info view-volunteers">View Volunteers</button>
            <button class="btn btn-info view-organization">View Organization</button>
        </div>
        <div class="details-buttons" style="text-align: right;">
            <button class="btn btn-secondary details-close">Close</button>
        </div>
        <div class="container-sm table-responsive" id="table-container-evdet" style="--bs-body-color: #d4d4d4; border-radius: 3px; border-color: #3a3a3a; border-left: 0px solid rgb(58, 58, 58); padding-top: 0px; margin-top: -19px; font-size: 0.9rem; line-height: 1.2;"></div>
        <div class="container-sm text-end custom-button-group" id="page-selector-evdet"></div>
    `;

    overlay.appendChild(detailsBox);
    document.body.appendChild(overlay);

    const savedState = {
        currentPage,
        recordsPerPage,
        currentTable
    };

    currentPage = 1;
    recordsPerPage = 5;
    currentTable = null;

    overlay.querySelector('.details-close').addEventListener('click', () => {
        currentPage = savedState.currentPage;
        recordsPerPage = savedState.recordsPerPage;
        currentTable = savedState.currentTable;
        document.body.removeChild(overlay);
    });

    overlay.querySelector('.view-volunteers').addEventListener('click', () => {
        viewEventVolunteers(event.id);
    });

    overlay.querySelector('.view-organization').addEventListener('click', () => {
        viewEventOrganization(event.id);
    });
}

function viewEventVolunteers(eventId, currentPage = 1, recordsPerPage = 5) {
    const headers = ['', 'ID', 'Name', 'Surname', 'E-mail', 'Birth Date', 'Organization', 'Action'];
    renderTable('table-container-evdet', `getEventVolunteers&id=${eventId}`, headers, (record, row) => {
        Object.keys(record).forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = record[key].length > 35 ? record[key].substring(0, 30) + '...' : record[key];
            row.appendChild(cell);
        });
    });
    renderPageSelector('page-selector-evdet', recordsPerPage, 'event_volunteer');
}

function viewEventOrganization(eventId, currentPage = 1, recordsPerPage = 5) {
    const headers = ['','Name', 'E-Mail', 'Country', 'Registration date', 'Action'];
    renderTable('table-container-evdet', `getEventOrganizations&id=${eventId}`, headers, (record, row) => {
        Object.keys(record).forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = record[key].length > 35 ? record[key].substring(0, 30) + '...' : record[key];
            row.appendChild(cell);
        });
    });
    renderPageSelector('page-selector-evdet', recordsPerPage, 'org_event');
}
//clear-db-btn clear-table-btn handle 
/*        <button type="button" class="btn btn-danger" id="clear-db-btn">Clear DB</button>
        <button type="button" class="btn btn-danger" id="clear-table-btn">Clear table</button>
        <button type="button" class="btn btn-warning" id="generate-data-btn">Generate data</button>*/

function clearDB() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'handler.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('what=cleardb');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            showError(xhr.responseText);
        }
    }
}

function clearTable(table_name) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'handler.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`what=cleartable&table=${table_name}`);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            showError(xhr.responseText);
        }
    }
}

function showError(message) {
    const overlay = document.createElement('div');
    overlay.classList.add('error-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const errorBox = document.createElement('div');
    errorBox.classList.add('error-box');
    errorBox.style.backgroundColor = '#2b2b2b';
    errorBox.style.padding = '20px';
    errorBox.style.borderRadius = '5px';
    errorBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    errorBox.innerHTML = `
        <div class="error-message">${message}</div>
        <div class="error-buttons" style="margin-top: 10px; text-align: right;">
            <button class="btn btn-secondary error-ok">OK</button>
        </div>
    `;

    overlay.appendChild(errorBox);
    document.body.appendChild(overlay);

    overlay.querySelector('.error-ok').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
}

function showConfirmation(message, callback) {
    const overlay = document.createElement('div');
    overlay.classList.add('confirmation-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const confirmationBox = document.createElement('div');
    confirmationBox.classList.add('confirmation-box');
    confirmationBox.style.backgroundColor = '#2b2b2b';
    confirmationBox.style.padding = '20px';
    confirmationBox.style.borderRadius = '5px';
    confirmationBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    confirmationBox.innerHTML = `
        <div class="confirmation-message">${message}</div>
        <div class="confirmation-buttons" style="margin-top: 10px; text-align: right;">
            <button class="btn btn-danger confirm-yes" style="margin-right: 10px;">Yes</button>
            <button class="btn btn-secondary confirm-no">No</button>
        </div>
    `;

    overlay.appendChild(confirmationBox);
    document.body.appendChild(overlay);

    overlay.querySelector('.confirm-yes').addEventListener('click', () => {
        callback(true);
        document.body.removeChild(overlay);
    });

    overlay.querySelector('.confirm-no').addEventListener('click', () => {
        callback(false);
        document.body.removeChild(overlay);
    });
}

document.getElementById('clear-db-btn').addEventListener('click', () => {
    showConfirmation('Are you sure you want to clear the database?', (confirmed) => {
        if (confirmed) {
            clearDB();
        }
    });
});

document.getElementById('clear-table-btn').addEventListener('click', () => {
    if(!currentTable){
        showError('No table selected');
        return;
    }
    showConfirmation(`Are you sure you want to clear the table ${currentTable}?`, (confirmed) => {
        if (confirmed) {
            clearTable(currentTable);
        }
    });
});

document.getElementById('records-per-page').addEventListener('change', (event) => {
    recordsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
    renderCurrentTable('table-container', recordsPerPage, currentTable);
    renderPageSelector('page-selector', recordsPerPage, currentTable);
});

/********************action edit*******************/
/*
        <button type="button" class="btn btn-warning" id="add-record-btn">Add record</button>
        <button type="button" class="btn btn-warning" id="generate-data-btn">Generate data</button>
*/

document.getElementById('add-record-btn').addEventListener('click', () => {
    switch (currentTable) {
        case 'volunteers':
            addVolunteer();
            break;
        case 'organizations':
            addOrganization();
            break;
        case 'events':
            addEvent();
            break;
    }
}
);

document.getElementById('generate-data-btn').addEventListener('click', () => {
    switch (currentTable) {
        case 'volunteers':
            generateVolunteers();
            break;
        case 'organizations':
            generateOrganizations();
            break;
        case 'events':
            generateEvents();
            break;
    }
}
);

function addVolunteer() {
    const overlay = document.createElement('div');
    overlay.classList.add('add-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const addBox = document.createElement('div');
    addBox.classList.add('add-box');
    addBox.style.backgroundColor = '#2b2b2b';
    addBox.style.padding = '20px';
    addBox.style.borderRadius = '5px';
    addBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    addBox.innerHTML = `
        <div class="add-header" style="margin-bottom: 10px;">
            <h5>Add Volunteer</h5>
        </div>
        <div class="add-content" style="margin-bottom: 10px;">
            <form id="add-volunteer-form">
                <div class="form-group">
                    <label for="volunteer-name">Name</label>
                    <input type="text" class="form-control" id="volunteer-name" required>
                </div>
                <div class="form-group">
                    <label for="volunteer-surname">Surname</label>
                    <input type="text" class="form-control" id="volunteer-surname" required>
                </div>
                <div class="form-group">
                    <label for="volunteer-email">E-mail</label>
                    <input type="email" class="form-control" id="volunteer-email" required>
                </div>
                <div class="form-group">
                    <label for="volunteer-birth-date">Birth Date</label>
                    <input type="date" class="form-control" id="volunteer-birth-date" required>
                </div>
                <div class="form-group">
                    <label for="volunteer-organization">Organization</label>
                    <input type="text" class="form-control" id="volunteer-organization" required>
                    <div id="organization-suggestions" class="list-group"></div>
                </div>
            </form>
        </div>
        <div class="add-buttons" style="text-align: right;">
            <button class="btn btn-secondary add-close">Close</button>
            <button class="btn btn-primary add-save">Save</button>
        </div>
    `;

    overlay.appendChild(addBox);
    document.body.appendChild(overlay);

    const organizationInput = document.getElementById('volunteer-organization');
    const suggestionsBox = document.getElementById('organization-suggestions');

    organizationInput.addEventListener('input', () => {
        const query = organizationInput.value;
        if (query.length >= 3) {
            fetchOrganizations(query);
        } else {
            suggestionsBox.innerHTML = '';
        }
    });

    overlay.querySelector('.add-close').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    overlay.querySelector('.add-save').addEventListener('click', () => {
        const form = document.getElementById('add-volunteer-form');
        if (form.checkValidity()) {
            const volunteer = {
                name: document.getElementById('volunteer-name').value,
                surname: document.getElementById('volunteer-surname').value,
                email: document.getElementById('volunteer-email').value,
                birth_date: document.getElementById('volunteer-birth-date').value,
                organization: document.getElementById('volunteer-organization').value
            };
            saveVolunteer(volunteer);
            document.body.removeChild(overlay);
        } else {
            form.reportValidity();
        }
    });
}

function fetchOrganizations(query) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `handler.php?what=searchOrganizations&query=${encodeURIComponent(query)}`, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const organizations = JSON.parse(xhr.responseText);
            const suggestionsBox = document.getElementById('organization-suggestions');
            suggestionsBox.innerHTML = '';
            organizations.forEach(org => {
                const suggestionItem = document.createElement('a');
                suggestionItem.classList.add('list-group-item', 'list-group-item-action');
                suggestionItem.textContent = org.name;
                suggestionItem.addEventListener('click', () => {
                    document.getElementById('volunteer-organization').value = org.name;
                    suggestionsBox.innerHTML = '';
                });
                suggestionsBox.appendChild(suggestionItem);
            });
        }
    };
}

function saveVolunteer(volunteer) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'handler.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`what=addVolunteer&name=${encodeURIComponent(volunteer.name)}&surname=${encodeURIComponent(volunteer.surname)}&email=${encodeURIComponent(volunteer.email)}&birth_date=${encodeURIComponent(volunteer.birth_date)}&organization=${encodeURIComponent(volunteer.organization)}`);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            showError(xhr.responseText);
            renderCurrentTable('table-container', recordsPerPage, currentTable);
            renderPageSelector('page-selector', recordsPerPage, currentTable);
        }
    }
}

function addOrganization() {
    const overlay = document.createElement('div');
    overlay.classList.add('add-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const addBox = document.createElement('div');
    addBox.classList.add('add-box');
    addBox.style.backgroundColor = '#2b2b2b';
    addBox.style.padding = '20px';
    addBox.style.borderRadius = '5px';
    addBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    addBox.innerHTML = `
        <div class="add-header" style="margin-bottom: 10px;">
            <h5>Add Organization</h5>
        </div>
        <div class="add-content" style="margin-bottom: 10px;">
            <form id="add-organization-form">
                <div class="form-group">
                    <label for="organization-name">Name</label>
                    <input type="text" class="form-control" id="organization-name" required>
                </div>
                <div class="form-group">
                    <label for="organization-email">E-mail</label>
                    <input type="email" class="form-control" id="organization-email" required>
                </div>
                <div class="form-group">
                    <label for="organization-country">Country</label>
                    <input type="text" class="form-control" id="organization-country" required>
                </div>
            </form>
        </div>
        <div class="add-buttons" style="text-align: right;">
            <button class="btn btn-secondary add-close">Close</button>
            <button class="btn btn-primary add-save">Save</button>
        </div>
    `;

    overlay.appendChild(addBox);
    document.body.appendChild(overlay);

    overlay.querySelector('.add-close').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    overlay.querySelector('.add-save').addEventListener('click', () => {
        const form = document.getElementById('add-organization-form');
        if (form.checkValidity()) {
            const organization = {
                name: document.getElementById('organization-name').value,
                email: document.getElementById('organization-email').value,
                country: document.getElementById('organization-country').value,
            };
            saveOrganization(organization);
            document.body.removeChild(overlay);
        } else {
            form.reportValidity();
        }
    });
}

function saveOrganization(organization) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'handler.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`what=addOrganization&name=${encodeURIComponent(organization.name)}&email=${encodeURIComponent(organization.email)}&country=${encodeURIComponent(organization.country)}`);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            showError(xhr.responseText);
            renderCurrentTable('table-container', recordsPerPage, currentTable);
            renderPageSelector('page-selector', recordsPerPage, currentTable);
        }
    }
}

function addEvent() {
    const overlay = document.createElement('div');
    overlay.classList.add('add-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const addBox = document.createElement('div');
    addBox.classList.add('add-box');
    addBox.style.backgroundColor = '#2b2b2b';
    addBox.style.padding = '20px';
    addBox.style.borderRadius = '5px';
    addBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    addBox.innerHTML = `
        <div class="add-header" style="margin-bottom: 10px;">
            <h5>Add Event</h5>
        </div>
        <div class="add-content" style="margin-bottom: 10px;">
            <form id="add-event-form">
                <div class="form-group">
                    <label for="event-name">Name</label>
                    <input type="text" class="form-control" id="event-name" required>
                </div>
                <div class="form-group">
                    <label for="event-start-date">Start Date</label>
                    <input type="datetime-local" class="form-control" id="event-start-date" required>
                </div>
                <div class="form-group">
                    <label for="event-end-date">End Date</label>
                    <input type="datetime-local" class="form-control" id="event-end-date" required>
                </div>
                <div class="form-group">
                    <label for="event-location">Location</label>
                    <input type="text" class="form-control" id="event-location" required>
                    <button type="button" class="btn btn-info" id="pick-location-btn">Pick on Map</button>
                </div>
                <div class="form-group">
                    <label for="event-volunteers">Volunteers</label>
                    <input type="text" class="form-control" id="event-volunteers" placeholder="Search volunteers">
                    <div id="volunteer-suggestions" class="list-group"></div>
                    <div id="selected-volunteers" class="selected-tags"></div>
                </div>
                <div class="form-group">
                    <label for="event-organization">Organizations</label>
                    <input type="text" class="form-control" id="event-organization" placeholder="Search organizations">
                    <div id="organization-suggestions" class="list-group"></div>
                    <div id="selected-organizations" class="selected-tags"></div>
                </div>
            </form>
        </div>
        <div class="add-buttons" style="text-align: right;">
            <button class="btn btn-secondary add-close">Close</button>
            <button class="btn btn-primary add-save">Save</button>
        </div>
    `;

    overlay.appendChild(addBox);
    document.body.appendChild(overlay);

    const volunteerInput = document.getElementById('event-volunteers');
    const volunteerSuggestionsBox = document.getElementById('volunteer-suggestions');
    const selectedVolunteersBox = document.getElementById('selected-volunteers');
    const organizationInput = document.getElementById('event-organization');
    const organizationSuggestionsBox = document.getElementById('organization-suggestions');
    const selectedOrganizationsBox = document.getElementById('selected-organizations');

    volunteerInput.addEventListener('input', () => {
        const query = volunteerInput.value;
        if (query.length >= 3) {
            fetchVolunteers(query);
        } else {
            volunteerSuggestionsBox.innerHTML = '';
        }
    });

    organizationInput.addEventListener('input', () => {
        const query = organizationInput.value;
        if (query.length >= 3) {
            fetchOrganizations(query);
        } else {
            organizationSuggestionsBox.innerHTML = '';
        }
    });

    document.getElementById('pick-location-btn').addEventListener('click', () => {
        pickLocationOnMap((location) => {
            document.getElementById('event-location').value = location;
        });
    });

    overlay.querySelector('.add-close').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    overlay.querySelector('.add-save').addEventListener('click', () => {
        const form = document.getElementById('add-event-form');
        if (form.checkValidity()) {
            const event = {
                name: document.getElementById('event-name').value,
                start_date: document.getElementById('event-start-date').value,
                end_date: document.getElementById('event-end-date').value,
                location: document.getElementById('event-location').value,
                volunteers: Array.from(selectedVolunteersBox.querySelectorAll('.tag')).map(item => item.dataset.id),
                organizations: Array.from(selectedOrganizationsBox.querySelectorAll('.tag')).map(item => item.textContent)
            };
            saveEvent(event);
            document.body.removeChild(overlay);
        } else {
            form.reportValidity();
        }
    });

    function addTag(container, text, id) {
        if (!Array.from(container.querySelectorAll('.tag')).some(tag => tag.textContent === text)) {
            const tag = document.createElement('span');
            tag.classList.add('tag', 'btn', 'btn-secondary', 'm-1');
            tag.textContent = text;
            tag.dataset.id = id;
            tag.addEventListener('click', () => {
                container.removeChild(tag);
            });
            container.appendChild(tag);
        }
    }

    function fetchVolunteers(query) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `handler.php?what=searchVolunteers&query=${encodeURIComponent(query)}`, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const volunteers = JSON.parse(xhr.responseText);
                volunteerSuggestionsBox.innerHTML = '';
                volunteers.forEach(vol => {
                    const suggestionItem = document.createElement('a');
                    suggestionItem.classList.add('list-group-item', 'list-group-item-action');
                    suggestionItem.textContent = `${vol.name} ${vol.surname} (${vol.birth_date})`;
                    suggestionItem.addEventListener('click', () => {
                        addTag(selectedVolunteersBox, `${vol.name} ${vol.surname} (${vol.birth_date})`, vol.id);
                        volunteerInput.value = '';
                        volunteerSuggestionsBox.innerHTML = '';
                    });
                    volunteerSuggestionsBox.appendChild(suggestionItem);
                });
            }
        };
    }

    function fetchOrganizations(query) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `handler.php?what=searchOrganizations&query=${encodeURIComponent(query)}`, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const organizations = JSON.parse(xhr.responseText);
                organizationSuggestionsBox.innerHTML = '';
                organizations.forEach(org => {
                    const suggestionItem = document.createElement('a');
                    suggestionItem.classList.add('list-group-item', 'list-group-item-action');
                    suggestionItem.textContent = org.name;
                    suggestionItem.addEventListener('click', () => {
                        addTag(selectedOrganizationsBox, org.name);
                        organizationInput.value = '';
                        organizationSuggestionsBox.innerHTML = '';
                    });
                    organizationSuggestionsBox.appendChild(suggestionItem);
                });
            }
        };
    }
    
    function pickLocationOnMap(callback) {
        const overlay = document.createElement('div');
        overlay.classList.add('maps-overlay');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';
    
        const mapsBox = document.createElement('div');
        mapsBox.classList.add('maps-box');
        mapsBox.style.backgroundColor = '#2b2b2b';
        mapsBox.style.padding = '20px';
        mapsBox.style.borderRadius = '5px';
        mapsBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        mapsBox.innerHTML = `
            <div class="maps-header" style="margin-bottom: 10px;">
                <h5>Pick Location on Map</h5>
            </div>
            <div id="map" style="width: 600px; height: 450px;"></div>
            <div class="maps-buttons" style="text-align: right; margin-top: 10px;">
                <button class="btn btn-secondary maps-close">Close</button>
                <button class="btn btn-primary maps-select">Select</button>
            </div>
        `;
    
        overlay.appendChild(mapsBox);
        document.body.appendChild(overlay);
    
        // Initialize Google Map
        let selectedLocation = null;
        const map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 40.73061, lng: -73.935242 }, // Default location
            zoom: 8,
        });
    
        const marker = new google.maps.Marker({
            map: map,
            draggable: true,
            position: map.getCenter(),
        });
    
        google.maps.event.addListener(map, 'click', (event) => {
            marker.setPosition(event.latLng);
            selectedLocation = event.latLng.toString();
        });
    
        overlay.querySelector('.maps-close').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
    
        overlay.querySelector('.maps-select').addEventListener('click', () => {
            if (selectedLocation) {
                callback(selectedLocation);
            } else {
                alert('Please select a location on the map.');
            }
            document.body.removeChild(overlay);
        });
    }

    function saveEvent(event) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'handler.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(`what=addEvent&name=${encodeURIComponent(event.name)}&start_date=${encodeURIComponent(event.start_date)}&end_date=${encodeURIComponent(event.end_date)}&location=${encodeURIComponent(event.location)}&volunteers=${encodeURIComponent(event.volunteers.join(','))}&organizations=${encodeURIComponent(event.organizations.join(','))}`);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                showError(xhr.responseText);
                renderCurrentTable('table-container', recordsPerPage, currentTable);
                renderPageSelector('page-selector', recordsPerPage, currentTable);
            }
        }
    }
}

function deleteEvent(records) {
    if (records.length === 0) {
        showError('No records selected');
        return;
    }

    const eventIds = records.map(record => record.id);

    showConfirmation(`Are you sure you want to delete ${eventIds.length} event(s)?`, (confirmed) => {
        if (confirmed) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'handler.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            console.log(eventIds.join(','));
            xhr.send(`what=deleteEvents&ids=${encodeURIComponent(eventIds.join(','))}`);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    showError(xhr.responseText);
                    renderCurrentTable('table-container', recordsPerPage, currentTable);
                    renderPageSelector('page-selector', recordsPerPage, currentTable);
                }
            }
        }
    });
}

function deleteOrganizations(records) {
    if (records.length === 0) {
        showError('No records selected');
        return;
    }

    const organizationNames = records.map(record => record.name);

    showConfirmation(`Are you sure you want to delete ${organizationNames.length} organization(s)?`, (confirmed) => {
        if (confirmed) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'handler.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(`what=deleteOrganizations&names=${encodeURIComponent(organizationNames.join(','))}`);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    showError(xhr.responseText);
                    renderCurrentTable('table-container', recordsPerPage, currentTable);
                    renderPageSelector('page-selector', recordsPerPage, currentTable);
                }
            }
        }
    });
}

function deleteVolunteers(records) {   
    if (records.length === 0) {
        showError('No records selected');
        return;
    }

    const volunteerIds = records.map(record => record.id);

    showConfirmation(`Are you sure you want to delete ${volunteerIds.length} volunteer(s)?`, (confirmed) => {
        if (confirmed) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'handler.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(`what=deleteVolunteers&ids=${encodeURIComponent(volunteerIds.join(','))}`);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    showError(xhr.responseText);
                    renderCurrentTable('table-container', recordsPerPage, currentTable);
                    renderPageSelector('page-selector', recordsPerPage, currentTable);
                }
            }
        }
    });
}

document.getElementById('generate-data-btn').addEventListener('click', () => {
    switch (currentTable) {
        case 'volunteers':
            generateVolunteers();
            break;
        case 'organizations':
            generateOrganizations();
            break;
        case 'events':
            generateEvents();
            break;
    }
});

let overlayOpen = false;

function generateOrganizations() {
    if (overlayOpen) return;
    num_prompt().then(num => {
        if (num !== null) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'handler.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send('what=generateOrganizations&num=' + num);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    showError(xhr.responseText);
                    renderCurrentTable('table-container', recordsPerPage, currentTable);
                    renderPageSelector('page-selector', recordsPerPage, currentTable);
                }
            }
        }
    });
}

function generateVolunteers() {
    if (overlayOpen) return;
    num_prompt().then(num => {
        if (num !== null) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'handler.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send('what=generateVolunteers&num=' + num);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    showError(xhr.responseText);
                    renderCurrentTable('table-container', recordsPerPage, currentTable);
                    renderPageSelector('page-selector', recordsPerPage, currentTable);
                }
            }
        }
    }
    );
}

function generateEvents() {
    if (overlayOpen) return;
    num_prompt().then(num => {
        if (num !== null) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'handler.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send('what=generateEvents&num=' + num);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    showError(xhr.responseText);
                    renderCurrentTable('table-container', recordsPerPage, currentTable);
                    renderPageSelector('page-selector', recordsPerPage, currentTable);
                }
            }
        }
    }
    );
}

function num_prompt() {
    return new Promise((resolve) => {
        if (overlayOpen) return;
        overlayOpen = true;

        const overlay = document.createElement('div');
        overlay.classList.add('prompt-overlay');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';

        const promptBox = document.createElement('div');
        promptBox.classList.add('prompt-box');
        promptBox.style.backgroundColor = '#2b2b2b';
        promptBox.style.padding = '20px';
        promptBox.style.borderRadius = '5px';
        promptBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        promptBox.innerHTML = `
            <div class="prompt-header" style="margin-bottom: 10px;">
                <h5>Enter the number of records to generate:</h5>
            </div>
            <div class="prompt-content" style="margin-bottom: 10px;">
                <input type="number" class="form-control" id="prompt-input" value="-1">
            </div>
            <div class="prompt-buttons" style="text-align: right;">
                <button class="btn btn-secondary prompt-cancel">Cancel</button>
                <button class="btn btn-primary prompt-ok">OK</button>
            </div>
        `;

        overlay.appendChild(promptBox);
        document.body.appendChild(overlay);

        overlay.querySelector('.prompt-cancel').addEventListener('click', () => {
            document.body.removeChild(overlay);
            overlayOpen = false;
            resolve(null);
        });

        overlay.querySelector('.prompt-ok').addEventListener('click', () => {
            const input = document.getElementById('prompt-input').value;
            document.body.removeChild(overlay);
            overlayOpen = false;
            resolve(input);
        });
    });
}