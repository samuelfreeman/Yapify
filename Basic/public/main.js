// connecting to socket io
const socket = io("");


//  getting the elements : { Total client ,Message Container, Name Input , Message Input ,Message Form }
const clientsTotal = document.getElementById("client-total");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageInput = document.getElementById("message-input");
const messageForm = document.getElementById("message-form");
//  importing an audio 
const messageTone = new Audio('./message-tone.mp3')
//  adding an eventlistener to  submit  messages
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

socket.on("clients-total", (data) => {
  clientsTotal.innerHTML = `Total Clients: ${data}`;
});

function sendMessage() {
  if (messageInput.value === "") {
    return;
  }
  //  arranging the messages
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  //  emmiting the message  with data to the server 
  socket.emit("message", data);

  addMessageToUI(true, data);
  messageInput.value = "";
  messageTone.play()
}

//  hancling chat-message 
socket.on("chat-message", (data) => {
  messageTone.play()
  addMessageToUI(false, data);
  scrollToBottom();
});

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const element = `
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
        <p class="message">
          ${data.message}
          <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
        </p>
      </li>
      `;

  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

messageInput.addEventListener("focus", (e) => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("keypress", (e) => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback", {
    feedback: "",
  });
});

socket.on("feedback", (data) => {
  clearFeedback();
  const element = `
    <li class="message-feedback">
    <p class="feedback" id="feedback">${data.feedback}</p>
  </li>
    `;

  messageContainer.innerHTML += element;
});

function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
