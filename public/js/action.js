console.log("Action.js loaded successfully");

function deleteEvent(eventId) {
    console.log("Delete function called for event:", eventId);

    if (confirm('Are you sure you want to delete this event?')) {
        fetch(`/admin/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Event removed') {
                // Remove the event card from the DOM
                const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
                if (eventCard) {
                    eventCard.remove();
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function editEvent(eventId) {
    // Get the event card element
    console.log("Edit function called for event:", eventId);

    const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
    const currentName = eventCard.querySelector('h3').textContent;
    const currentDate = eventCard.querySelector('.event-date').dataset.date;
    const currentMaxTeams = eventCard.querySelector('.event-max-teams').dataset.maxTeams;
    const currentDescription = eventCard.querySelector('.event-description').dataset.description;

    // Create edit form HTML
    const editForm = `
        <div class="edit-form">
            <input type="text" name="name" value="${currentName}" class="edit-name">
            <input type="date" name="date" value="${currentDate}" class="edit-date">
            <input type="number" name="maxTeams" value="${currentMaxTeams}" class="edit-max-teams">
            <textarea name="description" class="edit-description">${currentDescription}</textarea>
            <div class="edit-actions">
                <button onclick="saveEvent('${eventId}')" class="save-btn">Save</button>
                <button onclick="cancelEdit('${eventId}')" class="cancel-btn">Cancel</button>
            </div>
        </div>
    `;

    // Store original content before replacing
    eventCard.dataset.originalContent = eventCard.innerHTML;
    eventCard.innerHTML = editForm;
}

function saveEvent(eventId) {
    const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
    const updatedData = {
        name: eventCard.querySelector('.edit-name').value,
        date: eventCard.querySelector('.edit-date').value,
        maxTeams: eventCard.querySelector('.edit-max-teams').value,
        description: eventCard.querySelector('.edit-description').value
    };

    fetch(`/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(updatedEvent => {
        // Update the card with new data
        const updatedCard = `
            <h3>${updatedEvent.name}</h3>
            <p>Code: ${updatedEvent.code}</p>
            <p class="event-date" data-date="${updatedEvent.date}">
                Date: ${new Date(updatedEvent.date).toLocaleDateString()}
            </p>
            <p class="event-max-teams" data-max-teams="${updatedEvent.maxTeams}">
                Registered Teams: ${updatedEvent.teams.length} / ${updatedEvent.maxTeams}
            </p>
            <p class="event-description" data-description="${updatedEvent.description}">
                ${updatedEvent.description}
            </p>
            <div class="event-actions">
                <a href="/admin/events/${eventId}/teams" class="btn">View Teams</a>
                <button onclick="editEvent('${eventId}')" class="edit-btn">Edit</button>
                <button onclick="deleteEvent('${eventId}')" class="delete-btn">Delete</button>
            </div>
        `;
        eventCard.innerHTML = updatedCard;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update event. Please try again.');
    });
}

function cancelEdit(eventId) {
    const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
    if (eventCard.dataset.originalContent) {
        eventCard.innerHTML = eventCard.dataset.originalContent;
    }
}

/*module.exports = {
    deleteEvent,
    editEvent,
    saveEvent,
    cancelEdit
};*/