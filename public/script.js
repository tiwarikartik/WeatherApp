var apiData;

function getDay() {
    let day = new Date();
    return day.toLocaleString("en", { weekday: "long" });
}

function getDate() {
    return `
    ${Date().split(" ")[2]} 
    ${new Date().toLocaleString("en", {
        month: "long",
    })} 
    ${Date().split(" ")[3]}`;
}

function getCity() {
    let city, country;
    if (apiData.city.name != "") {
        city = apiData.city.name;
        country = new Intl.DisplayNames("en", {
            type: "region",
        }).of(apiData.city.country);
        return `${city}, ${country}`;
    }
    return "-";
}

function getApiData() {
    navigator.geolocation.getCurrentPosition(async (position) => {
        let lat = position.coords.latitude;
        let long = position.coords.longitude;
        const response = await fetch(
            `/.netlify/functions/api/weatherApi/${lat},${long}`
        );
        apiData = await response.json();
        addData();
    });
}

function fromSeconds(unixSec) {
    let date = new Date(0);
    date.setSeconds(unixSec);
    let hours = date.getHours();
    let AmOrPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = hours < 10 ? "0" + hours : hours;
    let minutes = date.getMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${AmOrPm}`;
}

function addData() {
    document.body.querySelector("#day").textContent = getDay();
    document.body.querySelector("#date").textContent = getDate();
    document.body.querySelector("#location").textContent = getCity();

    document.body.querySelector(
        "#icon"
    ).src = `http://openweathermap.org/img/wn/${apiData.list[0].weather[0].icon}@2x.png`;

    document.body.querySelector("#desc").textContent =
        apiData.list[0].weather[0].description;

    let ids = [
        "temp",
        "feels_like",
        "temp_min",
        "temp_max",
        "humidity",
        "sea_level",
        "grnd_level",
    ];
    let units = ["°C", "°C", "°C", "°C", "%", "hPa", "hPa"];

    for (let i = 0; i < ids.length; i++) {
        document.body.querySelector(`#${ids[i]}`).textContent = `${Math.ceil(
            apiData.list[0].main[ids[i]]
        )} ${units[i]}`;
    }

    ids = ["speed", "gust", "deg"];
    units = ["meter/sec", "meter/sec", "°"];
    for (let i = 0; i < ids.length; i++) {
        document.body.querySelector(`#${ids[i]}`).textContent = `${
            apiData.list[0].wind[ids[i]]
        } ${units[i]}`;
    }

    document.body.querySelector(
        "#clouds"
    ).textContent = `${apiData.list[0].clouds.all} %`;

    document.body.querySelector("#rise").textContent = fromSeconds(
        apiData.city.sunrise
    );

    document.body.querySelector("#set").textContent = fromSeconds(
        apiData.city.sunset
    );
}

function createChanger(param) {
    const row = document.querySelector("#button-row");
    if (param === "i") {
        row.innerHTML = `
            <td colspan="4" align="center">
                <input type="text" placeholder="Enter City Name" id="city-name" class="design" />
                <input type="button" value="Update" class="design" onclick="updateData()"/>
            </td>`;
    } else {
        row.innerHTML = `
            <td colspan="4" align="center">
                <input class="design" id="change" onclick="createChanger('i')" type="button" value="Change location" />                 />
            </td>`;
    }
}

async function updateData() {
    const city = document.getElementById("city-name").value;
    const response = await fetch(`/.netlify/functions/api/searchApi/${city}`);
    apiData = await response.json();
    addData();
}

getApiData();
