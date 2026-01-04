# 🏗️ Architecture Technique

Ce document décrit l'architecture technique d'EcoDash, un tableau de bord de suivi énergétique temps réel.

---

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                          NAVIGATEUR                                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Application Nuxt 3                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │ │
│  │  │  Pages   │  │Components│  │Composables│  │ State (Pinia)│   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
          ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
          │  REST API   │   │  WebSocket  │   │    SSE      │
          │  (Nuxt)     │   │  (Temps réel)│   │ (Événements)│
          └─────────────┘   └─────────────┘   └─────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
                          ┌─────────────────┐
                          │  Base de Données│
                          │  PostgreSQL     │
                          └─────────────────┘
```

---

## Stack Technique

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Nuxt 3** | 3.x | Framework SSR/SPA hybride |
| **Vue.js** | 3.x | Framework réactif |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4.x | Styling utilitaire |
| **shadcn-ui** | Vue | Composants UI |
| **Pinia** | 2.x | Gestion d'état |

### Charts & Visualisation

| Librairie | Usage |
|-----------|-------|
| **ECharts** | Graphiques complexes, heatmaps |
| **Chart.js** | Graphiques simples, légers |
| **VueUse** | Utilitaires Vue (resize, intervals) |

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Nuxt Server Routes** | - | API REST |
| **WebSocket** | - | Données temps réel |
| **SSE** | - | Événements serveur |
| **PostgreSQL** | 16.x | Base de données |
| **SQLite** | 3.x | Dev/Test |

---

## Structure des dossiers

```
ecodash/
├── 📂 .nuxt/                 # Build Nuxt (généré)
├── 📂 assets/                # Assets statiques
│   ├── css/
│   │   └── main.css          # Styles globaux
│   └── images/
│
├── 📂 components/            # Composants Vue
│   ├── 📂 charts/
│   │   ├── LineChart.vue     # Courbe consommation
│   │   ├── BarChart.vue      # Comparaison périodes
│   │   ├── HeatmapChart.vue  # Heatmap horaire
│   │   └── GaugeChart.vue    # Jauge temps réel
│   │
│   ├── 📂 kpi/
│   │   ├── KpiCard.vue       # Carte KPI générique
│   │   ├── ConsumptionKpi.vue
│   │   ├── CarbonKpi.vue
│   │   └── ComparisonKpi.vue
│   │
│   ├── 📂 layout/
│   │   ├── AppSidebar.vue    # Navigation latérale
│   │   ├── AppTopbar.vue     # Barre supérieure
│   │   ├── ThemeToggle.vue   # Dark/Light mode
│   │   └── AppLayout.vue     # Layout principal
│   │
│   └── 📂 alerts/
│       ├── AlertBanner.vue   # Bannière d'alerte
│       ├── AlertList.vue     # Liste des alertes
│       └── InsightCard.vue   # Carte insight
│
├── 📂 composables/           # Logique réutilisable
│   ├── useEnergyData.ts      # Données énergétiques
│   ├── useRealtime.ts        # Connexion temps réel
│   ├── useImpactCalculator.ts # Calculs CO₂
│   ├── useAlerts.ts          # Gestion alertes
│   └── useTheme.ts           # Gestion thème
│
├── 📂 layouts/
│   └── default.vue           # Layout par défaut
│
├── 📂 middleware/            # Middleware Nuxt
│
├── 📂 pages/
│   ├── index.vue             # Redirection → dashboard
│   └── 📂 dashboard/
│       ├── index.vue         # Vue d'ensemble
│       ├── energy.vue        # Détail énergie
│       └── ecology.vue       # Impact écologique
│
├── 📂 plugins/               # Plugins Vue/Nuxt
│   ├── charts.client.ts      # Init charts (côté client)
│   └── websocket.client.ts   # Init WebSocket
│
├── 📂 public/                # Fichiers statiques
│
├── 📂 server/                # Backend Nuxt
│   ├── 📂 api/
│   │   ├── energy.get.ts     # GET /api/energy
│   │   ├── energy.post.ts    # POST /api/energy
│   │   ├── realtime.ts       # WebSocket endpoint
│   │   └── alerts.get.ts     # GET /api/alerts
│   │
│   ├── 📂 utils/
│   │   ├── db.ts             # Connexion DB
│   │   └── calculator.ts     # Calculs serveur
│   │
│   └── 📂 middleware/
│
├── 📂 stores/                # Stores Pinia
│   ├── energy.ts             # Store énergie
│   ├── alerts.ts             # Store alertes
│   └── settings.ts           # Store paramètres
│
├── 📂 types/                 # Types TypeScript
│   ├── energy.ts
│   ├── ecology.ts
│   └── alerts.ts
│
├── 📂 utils/                 # Utilitaires
│   ├── formatters.ts         # Formatage données
│   ├── converters.ts         # Conversions unités
│   └── validators.ts         # Validation
│
├── nuxt.config.ts            # Configuration Nuxt
├── tailwind.config.ts        # Configuration Tailwind
├── tsconfig.json             # Configuration TypeScript
└── package.json
```

---

## Flux de données

### Données Temps Réel

```
┌──────────────┐    WebSocket/SSE    ┌──────────────┐
│   Serveur    │ ─────────────────▶  │   Client     │
│              │    Données JSON     │              │
│  • Mock Data │                     │  • Store     │
│  • API Ext.  │                     │  • Charts    │
└──────────────┘                     └──────────────┘
      │                                     │
      │ Interval 5s                         │ Reactive
      ▼                                     ▼
┌──────────────┐                     ┌──────────────┐
│  Générateur  │                     │   Vue Refs   │
│  de données  │                     │   Watchers   │
└──────────────┘                     └──────────────┘
```

### Schéma du flux complet

```typescript
// 1. Composable établit la connexion
const { data, isConnected } = useRealtime()

// 2. Les données sont reçues en temps réel
watch(data, (newData) => {
  // 3. Mise à jour du store
  energyStore.addReading(newData)
  
  // 4. Vérification des alertes
  alertsStore.checkThresholds(newData)
})

// 5. Les composants réagissent automatiquement
// via les refs réactives
```

---

## Composables Clés

### `useEnergyData`

Gestion des données énergétiques avec agrégation.

```typescript
// composables/useEnergyData.ts
export function useEnergyData() {
  const readings = ref<EnergyReading[]>([])
  const period = ref<'hour' | 'day' | 'month'>('day')
  
  const aggregatedData = computed(() => {
    return aggregateByPeriod(readings.value, period.value)
  })
  
  const currentConsumption = computed(() => {
    return readings.value[readings.value.length - 1]?.value ?? 0
  })
  
  const peakToday = computed(() => {
    return Math.max(...getTodayReadings(readings.value))
  })
  
  async function fetchHistory(from: Date, to: Date) {
    const data = await $fetch('/api/energy', {
      query: { from: from.toISOString(), to: to.toISOString() }
    })
    readings.value = data
  }
  
  return {
    readings,
    period,
    aggregatedData,
    currentConsumption,
    peakToday,
    fetchHistory
  }
}
```

### `useRealtime`

Connexion WebSocket pour les données live.

```typescript
// composables/useRealtime.ts
export function useRealtime() {
  const isConnected = ref(false)
  const data = ref<RealtimeData | null>(null)
  const error = ref<Error | null>(null)
  
  let ws: WebSocket | null = null
  
  function connect() {
    ws = new WebSocket('ws://localhost:3000/api/realtime')
    
    ws.onopen = () => {
      isConnected.value = true
    }
    
    ws.onmessage = (event) => {
      data.value = JSON.parse(event.data)
    }
    
    ws.onerror = (e) => {
      error.value = e as Error
    }
    
    ws.onclose = () => {
      isConnected.value = false
      // Reconnexion automatique
      setTimeout(connect, 5000)
    }
  }
  
  function disconnect() {
    ws?.close()
  }
  
  onMounted(connect)
  onUnmounted(disconnect)
  
  return { isConnected, data, error, disconnect }
}
```

### `useImpactCalculator`

Calculs d'impact écologique.

```typescript
// composables/useImpactCalculator.ts
export function useImpactCalculator() {
  // Facteurs de conversion
  const CO2_PER_KWH = 0.0569 // kg CO₂/kWh (France)
  const KM_PER_KG_CO2 = 6.5  // km voiture/kg CO₂
  const TREE_ABSORPTION = 22 // kg CO₂/arbre/an
  
  function kwhToCO2(kwh: number): number {
    return kwh * CO2_PER_KWH
  }
  
  function co2ToKm(co2Kg: number): number {
    return co2Kg * KM_PER_KG_CO2
  }
  
  function co2ToTrees(co2Kg: number): number {
    return co2Kg / TREE_ABSORPTION
  }
  
  function getImpactSummary(kwh: number) {
    const co2 = kwhToCO2(kwh)
    return {
      kwh,
      co2Kg: co2,
      kmEquivalent: co2ToKm(co2),
      treesNeeded: co2ToTrees(co2)
    }
  }
  
  return {
    kwhToCO2,
    co2ToKm,
    co2ToTrees,
    getImpactSummary
  }
}
```

---

## API Endpoints

### REST API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/energy` | Liste des relevés |
| GET | `/api/energy/:id` | Détail d'un relevé |
| POST | `/api/energy` | Créer un relevé |
| GET | `/api/alerts` | Liste des alertes |
| GET | `/api/settings` | Paramètres utilisateur |
| PUT | `/api/settings` | Modifier paramètres |

### Format des données

```typescript
// types/energy.ts
interface EnergyReading {
  id: string
  timestamp: Date
  type: 'electricity' | 'gas' | 'water'
  value: number
  unit: 'kWh' | 'm3' | 'L'
}

// types/ecology.ts
interface ImpactData {
  period: {
    from: Date
    to: Date
  }
  totalKwh: number
  totalCO2Kg: number
  kmEquivalent: number
  treesNeeded: number
  comparison: {
    nationalAverage: number
    percentDiff: number
  }
}

// types/alerts.ts
interface Alert {
  id: string
  type: 'threshold' | 'anomaly' | 'insight'
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: Date
  acknowledged: boolean
}
```

---

## Gestion d'état (Pinia)

### Store Energy

```typescript
// stores/energy.ts
export const useEnergyStore = defineStore('energy', () => {
  const readings = ref<EnergyReading[]>([])
  const isLoading = ref(false)
  const selectedPeriod = ref<Period>('day')
  
  const currentValue = computed(() => 
    readings.value[readings.value.length - 1]?.value ?? 0
  )
  
  const todayTotal = computed(() =>
    readings.value
      .filter(r => isToday(r.timestamp))
      .reduce((sum, r) => sum + r.value, 0)
  )
  
  async function fetchReadings(from: Date, to: Date) {
    isLoading.value = true
    try {
      readings.value = await $fetch('/api/energy', {
        query: { from, to }
      })
    } finally {
      isLoading.value = false
    }
  }
  
  function addReading(reading: EnergyReading) {
    readings.value.push(reading)
    // Garder seulement les dernières 24h
    const cutoff = subHours(new Date(), 24)
    readings.value = readings.value.filter(
      r => new Date(r.timestamp) > cutoff
    )
  }
  
  return {
    readings,
    isLoading,
    selectedPeriod,
    currentValue,
    todayTotal,
    fetchReadings,
    addReading
  }
})
```

---

## Design System

### Tokens de couleur

```css
/* Palette principale */
:root {
  --color-primary: 142 76% 36%;      /* Vert éco */
  --color-secondary: 221 83% 53%;    /* Bleu énergie */
  --color-accent: 38 92% 50%;        /* Orange alerte */
  
  /* Sémantique */
  --color-success: 142 76% 36%;
  --color-warning: 38 92% 50%;
  --color-danger: 0 84% 60%;
  --color-info: 221 83% 53%;
  
  /* Surfaces */
  --color-background: 0 0% 100%;
  --color-surface: 0 0% 98%;
  --color-border: 240 6% 90%;
}

.dark {
  --color-background: 222 47% 11%;
  --color-surface: 217 33% 17%;
  --color-border: 217 33% 25%;
}
```

### Composants shadcn-ui utilisés

| Composant | Variantes |
|-----------|-----------|
| `Button` | default, outline, ghost, destructive |
| `Card` | default, elevated |
| `Badge` | success, warning, danger, info |
| `Table` | default, striped |
| `Dialog` | default, fullscreen |
| `Tabs` | default, pills |
| `Select` | default |
| `Switch` | default |

---

## Performance

### Optimisations Frontend

1. **Lazy loading** des routes
2. **Code splitting** automatique par Nuxt
3. **Memoization** des calculs coûteux
4. **Debounce** des mises à jour graphiques
5. **Virtual scrolling** pour les grandes listes

### Optimisations Backend

1. **Cache** des données agrégées
2. **Indexation** de la base de données
3. **Pagination** des résultats
4. **Compression** gzip des réponses

---

## Sécurité

### Bonnes pratiques

- Validation des entrées côté serveur
- Sanitization des données
- Rate limiting sur les API
- CORS configuré correctement
- Headers de sécurité (CSP, HSTS)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    }
  }
})
```

---

## Prochaines étapes

- [Guide d'installation](./installation.md)
- [Guide de contribution](./contributing.md)
- [API Reference](./api-reference.md)
