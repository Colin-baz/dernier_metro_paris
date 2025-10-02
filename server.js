"use strict";
const express = require("express");
const {Pool} = require("pg");
const app = express();
const { nextArrival } = require("./utils/time.js");
const PORT = process.env.PORT || 3000;

const dbPool = new Pool({
    user: process.env.POSTGRES_USER ,
    host: process.env.POSTGRES_HOST ,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD ,
    port: process.env.POSTGRES_PORT,
    max: 5,
	idleTimeoutMillis: 10000
});

app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });

app.get("/health", (_req, res) => {
   return res.status(200).json({
        message : "Server OK",
        status : "success"
   })
})

app.get("/db-health", async (_req, res) => {
    try {
        const result = await dbPool.query("SELECT 1 as TEST");
        res.status(200).json({ status: "ok", dbTime: result.rows[0].now });
    } catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({ status: "error", error: "Database connection failed" });
    }
})

app.get("/next-metro", (req, res) => {
    const station = (req.query.station || '').trim();
    if (!station) {
        return res.status(400).json({ error: "missing station" });
    }

    const nextTime = nextArrival(3); 

    return res.status(200).json({
        tz: "Europe/Paris",
        station,
        line: "M1",
        headwayMin: 3,
        nextArrival: nextTime
    });
});


app.get("/last-metro", async (req, res) => {
  const stationQuery = (req.query.station || "").trim().toLowerCase();
  if (!stationQuery) {
    return res.status(400).json({ error: "missing station" });
  }

  try {
    const defaultsRes = await dbPool.query(
      "SELECT value FROM config WHERE key = 'metro.defaults'"
    );
    const lastRes = await dbPool.query(
      "SELECT value FROM config WHERE key = 'metro.last'"
    );

    const defaults = defaultsRes.rows[0].value; 
    const lastMap = lastRes.rows[0].value;  
  
    const match = Object.entries(lastMap).find(
      ([key]) => key.toLowerCase() === stationQuery
    );

    if (!match) {
      return res.status(404).json({ error: "missing station" });
    }

    const [stationName, lastMetro] = match;

    console.log("defaults:", defaults, "lastMap:", lastMap, "match:", match);

    return res.status(200).json({
      station: stationName,
      lastMetro,
      line: defaults.line,
      tz: defaults.tz
    });

  } catch (err) {
    console.error("error db in /last-metro:", err);
    return res.status(500).json({ error: "internal server error" });
  }
});


app.use((_req, res) => {
    return res.status(404).json({
        message: "Route not found",
        error: "Not Found"
    });
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})