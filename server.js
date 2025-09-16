"use strict";
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });

app.get("/health", (req, res) => {
   return res.status(200).json({
        message : "Server OK",
        status : "success"
   })
})

function nextArrival(now = new Date(), headwayMin = 3) {
    const tz = "Europe/Paris";
    const toHM = d =>
        String(d.getHours()).padStart(2, "0") +
        ":" +
        String(d.getMinutes()).padStart(2, "0");

    const start = new Date(now);
    start.setHours(5, 30, 0, 0); 
    const end = new Date(now);
    end.setHours(1, 15, 0, 0); 
    const lastWindow = new Date(now);
    lastWindow.setHours(0, 45, 0, 0); 

    const hour = now.getHours();
    const minute = now.getMinutes();
    const afterStart = hour > 5 || (hour === 5 && minute >= 30);
    const beforeEnd = hour < 1 || (hour === 1 && minute <= 15);
    const serviceOpen = afterStart || beforeEnd;

    if (!serviceOpen) {
        return { service: "closed", tz };
    }

    const next = new Date(now.getTime() + headwayMin * 60 * 1000);

    return {
        nextArrival: toHM(next),
        isLast: now >= lastWindow,
        headwayMin,
        tz,
    };
}

app.get("/next-metro", (req, res) => {
    const station = req.query.station;

    if (!station) {
        return res.status(400).json({ error: "mising station" });
    }

    const result = nextArrival(new Date(), 3);

    if (result.service === "closed") {
        return res.status(200).json(result);
    }

    return res.status(200).json({
        station,
        line: "M1",
        headwayMin: result.headwayMin,
        nextArrival: result.nextArrival,
        isLast: result.isLast,
        tz: result.tz,
    });
});

app.use((req, res) => {
    return res.status(404).json({
        message: "Route not found",
        error: "Not Found"
    });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})