const express = require("express");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
const app = express();
const serverless = require("serverless-http");
const router = express.Router();
require("dotenv").config();

const port = process.env.PORT;
app.listen(port, () => console.log(`Starting Server at Port ${port}`));
app.use(express.static("public"));
app.use(express.json({ limit: "3mb" }));

router.get("/weatherApi/:latlon", async (request, response) => {
    const latlon = request.params.latlon.split(",");
    const api_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latlon[0]}&lon=${latlon[1]}&appid=${process.env.API_KEY}&units=metric&cnt=1`;
    const fetch_response = await fetch(api_url);
    const data_json = await fetch_response.json();
    response.json(data_json);
});

router.get("/searchApi/:city", async (request, response) => {
    const api_url = `https://api.openweathermap.org/data/2.5/forecast?q=${request.params.city}&appid=${process.env.API_KEY}&units=metric&cnt=1`;
    const fetch_response = await fetch(api_url);
    const data_json = await fetch_response.json();
    response.json(data_json);
});

app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
