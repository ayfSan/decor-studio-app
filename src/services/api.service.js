import NProgress from "nprogress";

const API_URL = "http://localhost:3000/api";

async function fetchFromApi(endpoint, options = {}) {
  NProgress.start();
  try {
    const config = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_URL}/${endpoint}`, config);

    if (!response.ok) {
      document.querySelector("#nprogress .bar").style.backgroundColor =
        "#dc3545";
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      document.querySelector("#nprogress .bar").style.backgroundColor =
        "#28a745";
    }

    return await response.json();
  } catch (error) {
    if (document.querySelector("#nprogress .bar")) {
      document.querySelector("#nprogress .bar").style.backgroundColor =
        "#dc3545";
    }
    console.error(`Could not fetch from endpoint: ${endpoint}`, error);
    throw error;
  } finally {
    NProgress.done();
  }
}

export default {
  testApi() {
    return fetchFromApi("test");
  },
  getEvents() {
    return fetchFromApi("events");
  },
  getEvent(id) {
    return fetchFromApi(`events/${id}`);
  },
  getEventCategories() {
    return fetchFromApi("event-categories");
  },
  getVenues() {
    return fetchFromApi("venues");
  },
  getCustomers() {
    return fetchFromApi("customers");
  },
  createEvent(eventData) {
    return fetchFromApi("events", {
      method: "POST",
      body: eventData,
    });
  },
  updateEvent(id, eventData) {
    return fetchFromApi(`events/${id}`, {
      method: "PUT",
      body: eventData,
    });
  },
  getTeamMembers() {
    return fetchFromApi("team-members");
  },
  getEventParticipants(eventId) {
    return fetchFromApi(`events/${eventId}/participants`);
  },
  addParticipant(eventId, uniqueId) {
    return fetchFromApi(`events/${eventId}/participants`, {
      method: "POST",
      body: { uniqueId },
    });
  },
};
