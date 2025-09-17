"use strict";
const express = require("express");
const {Pool} = require("pg");
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

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

app.get("/health", async (req, res) => {
    try {
        const result = await dbPool.query("SELECT NOW() as TEST");
        res.status(200).json({ status: "ok", dbTime: result.rows[0].now });
    } catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({ status: "error", error: "Database connection failed" });
    }
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