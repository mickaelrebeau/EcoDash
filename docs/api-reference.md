# 📚 API Reference

Documentation des endpoints API d'EcoDash.

## Base URL

```
Développement : http://localhost:3000/api
```

---

## Energy

### `GET /api/energy`

Récupère les relevés de consommation.

| Paramètre | Type | Description |
|----------|------|-------------|
| `from` | ISO 8601 | Date de début |
| `to` | ISO 8601 | Date de fin |
| `type` | string | `electricity`, `gas`, `water` |
| `period` | string | `hour`, `day`, `month` |

**Réponse**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx123",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "type": "electricity",
      "value": 12.5,
      "unit": "kWh"
    }
  ]
}
```

### `POST /api/energy`

Crée un nouveau relevé.

```json
{
  "timestamp": "2024-01-15T14:30:00.000Z",
  "type": "electricity",
  "value": 5.7,
  "unit": "kWh"
}
```

---

## Impact

### `GET /api/impact`

Calcule l'impact écologique.

**Réponse**

```json
{
  "success": true,
  "data": {
    "consumption": { "electricity": { "value": 342.5, "unit": "kWh" } },
    "impact": {
      "co2Kg": 19.49,
      "kmEquivalent": 126.7,
      "treesNeeded": 0.89
    }
  }
}
```

---

## Alerts

### `GET /api/alerts`

Liste les alertes actives.

```json
{
  "success": true,
  "data": [
    {
      "id": "alert_001",
      "type": "threshold",
      "severity": "warning",
      "message": "Consommation 18% au-dessus de la moyenne"
    }
  ]
}
```

---

## WebSocket `/api/realtime`

```javascript
const ws = new WebSocket('ws://localhost:3000/api/realtime')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Données temps réel:', data)
}
```

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 400 | Requête invalide |
| 404 | Non trouvé |
| 500 | Erreur serveur |
