
var email = document.getElementById("email");
var password = document.getElementById("password");
var submitBtn = document.getElementById("loginBtn");

// // Add a submit event listener to the form
// submitBtn.addEventListener("click", function (event) {
//   event.preventDefault();
//   var email = email.value;
//   var password = password.value;

//   // Validate the username and password
//   if (!email) {
//     alert("Please enter a username.");
//   } else if(email.includes("admin@court.com")) {
//     window.location.href = "/admin_log";
//   } else {
//     window.location.href = "/homepage";
//   }
  
//   if (!password) {
//   alert("Please enter a password.");
//   return;
//   }
// });

{/* <script type = "text/javascript" src="http://localhost:3000/socket.io/socket.io.js"></script> */}

  var socket = io("http://localhost:4000/chat/socket.io/socket.io.js");
  socket.on('message', addMessages);

    $(() => {
        $("#send").click(()=>{
            sendMessage({message: $("#message").val()});
        })
        getMessages()
    })

    function addMessages(message){
        $("#messages").append(`<p> ${message}</p>`)
    }

    function getMessages(){
      $.get('http://localhost:3000/chat/messages', (data) => {
        data.forEach(addMessages);
      })
    }

    function sendMessage(message){
      $.post('http://localhost:3000/chat/messages', message)
    }

// messageForm.addEventListener('submit', e => {
//   e.preventDefault()
//   const message = messageInput.value
//   appendMessage(`${message}`)
//   socket.emit('send-chat-message', message)
//   messageInput.value = ''
// })

// function appendMessage(message) {
//   const messageElement = document.createElement('div')
//   messageElement.innerText = message
//   messageContainer.append(messageElement)
// }

// function showSnackbar() {
//   var x = document.getElementById("snackbar");
//   x.className = "show";
//   setTimeout(function () {
//     x.className = x.className.replace("show", "");
//   }, 3000);
// }