const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const loginRoutes = require("./login");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(loginRoutes);

// Home route - GET request
app.get("/", (req, res) => {
  let data;
  try {
    data = fs.readFileSync("username.txt", "utf8");
  } catch (err) {
    data = "No chat exists";
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Send Message</title>
    </head>
    <body>
      <form id="messageForm" action="/" method="POST">
        <input id="message" type="text" name="message" placeholder="Enter your message">
        <button type="submit">Send</button>
      </form>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          document.getElementById("messageForm").onsubmit = function() {
            const username = localStorage.getItem('username');
            if (username) {
              const hiddenField = document.createElement("input");
              hiddenField.type = "hidden";
              hiddenField.name = "username";
              hiddenField.value = username;
              this.appendChild(hiddenField);
            }
          };
        });
      </script>
      <h2>Messages:</h2>
      <pre>${data}</pre>
    </body>
    </html>
  `);
});

// Route to handle message sending - POST request
app.post("/", (req, res) => {
  const username = req.body.username || "Anonymous";
  const message = req.body.message || "";

  // Append the message to username.txt
  fs.writeFileSync(
    "username.txt",
    `${username}: ${message}\n`,
    { flag: "a" },
    (err) => {
      if (err) throw err;
    }
  );

  // Prepare message data to append to messages.json
  const messageData = {
    username: username,
    message: message,
    timestamp: new Date().toISOString(),
  };

  // Append the message data to messages.json
  fs.appendFile(
    path.join(__dirname, "messages.json"),
    JSON.stringify(messageData) + "\n",
    (err) => {
      if (err) throw err;
      console.log("Message saved!");
    }
  );

  res.redirect("/");
});

// Middleware to handle 404 errors (page not found)
app.use((req, res, next) => {
  res.status(404).send("<h1>Page not found</h1>");
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
