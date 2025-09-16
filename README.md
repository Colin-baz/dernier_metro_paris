## Endpoints

- `GET /health` -> `200 { "status": "ok" }`
- `GET /next-metro?station=NAME` -> `200` JSON:{ station, line, headwayMin, nextArrival (HH:MM), isLast (bool), tz }
- si `station` manquante -> `400 { "error": "missing station" }`
- si hors plage de service -> `200 { "service": "closed", "tz": "Europe/Paris" }`
- `404` pour tout le reste -> `{ error: 'not found' }`


## Modèle métier
- Plage de service simulée : 05:30 -> 01:15 (la plage traverse minuit)
- Fréquence : 3 minutes
- `isLast` = `true` dans la fenêtre 00:45 -> 01:15
- Comportement hors-plage : renvoie `200 { service: 'closed' }` (documenté)


## Logs
Chaque requête écrit dans la sortie standard : méthode, chemin, status, durée (ms).


## Variables d'environnement
- `PORT` (par défaut 3000)


## Validation (exemples `curl`)


```bash
# health
curl -i http://localhost:3000/health


# réussite next-metro
curl -i "http://localhost:3000/next-metro?station=Chatelet"


# erreur station manquante
curl -i "http://localhost:3000/next-metro"