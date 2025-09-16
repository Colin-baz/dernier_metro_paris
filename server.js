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

function nextArrival(headwayMin = 3) {
    const now = new Date();
    const next = new Date(now.getTime() + headwayMin * 60 * 1000);
    const hh = String(next.getHours()).padStart(2, '0');
    const mm = String(next.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

app.get("/next-metro", (req, res) => {
    const station = (req.query.station || '').toString().trim();


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