import express from "express";
import axios from "axios";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyparser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
const _dirname = dirname(fileURLToPath(import.meta.url))
const weatherAPI = process.env.Weather_API_Key
const openuvAPI = process.env.OpenUV_API_Key

const openuvAPIEndPoint = "https://api.openuv.io/api/v1/uv"
const weatherAPIEndPoint = "https://api.openweathermap.org/data/3.0/onecall"
const jokeAPIEndPoint = 'https://sv443.net/jokeapi/v2/joke/Any?type=single'; 

app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render(_dirname+"/views/index.ejs", { content: "Click on any of these..." });
})

app.post('/weather', (req, res) => {
    res.render(_dirname+"/views/weather.ejs", { content: "Check whether it will rain tomorrow or not.." })
})

app.post('/joke', (req, res) => {
    res.render(_dirname+"/views/joke.ejs", { content: "Generate a random joke.." })
})

app.post('/openUV', (req, res) => {
    res.render(_dirname+"/views/openUV.ejs", { content: "Check if you need to apply sunscreen today.." })
})

app.post('/weather-post', async (req, res) => {
    const locationData = req.body;
    const params = {
        lat: locationData.lat,
        lon: locationData.lon,
        appid: weatherAPI,
    }
    try {
        const response = await axios.get(`${weatherAPIEndPoint}`, { params });
        const precipitation = (response.data.daily.pop) * 100;
        res.render(_dirname+'/views/weather.ejs', { content: `There is ${precipitation}% chance of precipitation.` })
    } catch (error) {
        console.error("Failed to get data:", error.message);
    }
})

app.post('/openuv-post', async (req, res) => {
    const locationData = req.body;
    const headers = {
        'x-access-token': openuvAPI,
    }
    try {
        const response = await axios.get(`${openuvAPIEndPoint}?${locationData.lat}&${locationData.lon}`, headers);
        const uv_max = response.data.uv_max
        if (uv_max >= 3) {
            res.render(_dirname+'/views/openUV.ejs', { content: "Consider using sunscreen to avoid sunburn." })
        } else {
            res.render(_dirname+'/views/openUV.ejs', { content: "Sunscreen use can be avoided." })
        }
    } catch (error) {
        console.error("Failed to get the data:", error.message);
    }
})

app.post('/joke-post', async (req, res) => {
    try {
        const response = await axios.get(jokeAPIEndPoint);
        const joke = response.data.joke;
        res.render(_dirname+'/views/joke.ejs', { content: joke })
    } catch (error) {
        console.error("Failed to get data:", error.message);
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
