require("dotenv").config();
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage"
);

app.post("/auth/google", async (req, res) => {
  try {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // Exchange code for tokens
    console.log("Tokens received:", tokens);
    res.json(tokens);
  } catch (error) {
    console.error("Error exchanging tokens:", error);
    res.status(500).send("Authentication failed");
  }
});

app.post("/auth/google/refresh-token", async (req, res) => {
  try {
    const { credentials } = await oAuth2Client.refreshAccessToken(req.body.refreshToken); // Obtain new tokens
    console.log("New tokens:", credentials);
    res.json(credentials);
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    res.status(500).send("Failed to refresh tokens");
  }
});

app.listen(3001, () => console.log("Server is running on port 3001"));
