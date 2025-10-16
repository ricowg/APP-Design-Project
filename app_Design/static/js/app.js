if ("serviceworker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceworker
      .register("static/js/serviceworker.js")
      .then((res) => console.log("Service worker registered"))
      .catch((err) => console.log("Service worker not registered", err));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("user-search");
  const searchResults = document.getElementById("search-results");
  const messageInput = document.getElementById("message-input");
  const sendMessageButton = document.getElementById("send-message-button");
  const chatMessages = document.getElementById("chat-messages");

  let lastSelectedUser = localStorage.getItem("lastSelectedUser") || null;

  async function searchUsers() {
    const query = searchInput.value.trim();
  
    if (query.length === 0) {
      console.log("Search query is empty.");
      searchResults.innerHTML = "";
      return;
    }
  
    try {
      console.log("Searching for users with query:", query);
      const response = await fetch(`/search_users?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching users:", errorData.error);
        return;
      }
      const users = await response.json();
      console.log("Search results:", users);
  
      searchResults.innerHTML = "";
  
      users.forEach((user) => {
        const li = document.createElement("li");
        li.classList.add("search-result-item");
        li.textContent = user.username;
        li.addEventListener("click", () => {
          searchInput.value = user.username;
          searchResults.innerHTML = ""; 
          console.log("Selected user:", user.username);
          lastSelectedUser = user.username;
          localStorage.setItem("lastSelectedUser", user.username);
          fetchMessages(user.username);
        });
        searchResults.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

async function fetchMessages(selectedUser) {
  try {
    if (!selectedUser) {
      console.error("No user selected for fetching messages.");
      return;
    }

    console.log("Fetching messages for user:", selectedUser);
    const response = await fetch(`/fetch_messages?selected_user=${encodeURIComponent(selectedUser)}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching messages:", errorData.error);
      return;
    }
    const data = await response.json();

    console.log("Fetched messages:", data);

    chatMessages.innerHTML = "";

    data.messages.forEach((message) => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", message.sender === data.current_user ? "sender" : "receiver");
      messageDiv.innerHTML = `
        <p class="message-sender"><strong>${message.sender}</strong></p>
        <p class="message-text">${message.text}</p>
        <span class="message-date">${message.date}</span>
      `;
      chatMessages.appendChild(messageDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

  async function sendMessage() {
    const userId = searchInput.value.trim();
    const messageText = messageInput.value.trim();

    if (!userId || !messageText) {
      alert("Please enter a username and a message.");
      return;
    }

    try {
      const response = await fetch("/send_message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          message_text: messageText,
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("Message sent successfully.");
        fetchMessages(userId);
        messageInput.value = "";
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  if (lastSelectedUser) {
    fetchMessages(lastSelectedUser);
  }

  searchInput.addEventListener("input", searchUsers);

  sendMessageButton.addEventListener("click", sendMessage);

  messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
});