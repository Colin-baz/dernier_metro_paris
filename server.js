"use strict";
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;


app.get("/health", (req, res) => {
   return res.status(200).json({
        message : "Server OK",
        status : "success"
   })
})

function nextArrival(now = new Date(), headwayMin = 3) {
    const tz = 'Europe/Paris';
    const toHM = d => String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    const end = new Date(now); end.setHours(1,15,0,0);         // 01:15
    const lastWindow = new Date(now); lastWindow.setHours(0,45,0,0); // 00:45
    
    if (now > end) return { service: 'closed', tz };

    const next = new Date(now.getTime() + headwayMin*60*1000);

    return { nextArrival: toHM(next), isLast: now >= lastWindow, headwayMin, tz };
  }

app.get("/next-metro", (req, res) => {
    const station = req.query.station;

    if (!station) {
        return res.status(400).json({
            message: "Station is required",
            error: "Station is missing"
        });
    }

    const result = {
        station: "Chatelet",
        ligne: "M7",
        headwayMin: 3,
        nextArrival: "12:34",
        isLast: false,
        tz: "Europe/Paris"
    };

    return res.status(200).json(result);    
})

app.use((req, res) => {
    return res.status(404).json({
        message: "Route not found",
        error: "Not Found"
    });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})