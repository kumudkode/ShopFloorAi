# ShopFloor AI - Worker Productivity Dashboard

**Author:** Kumud Ranjan

An AI-powered manufacturing analytics platform that ingests computer vision events from CCTV cameras and displays real-time worker productivity metrics.

## ⚙️ Technology Stack

- **Runtime:** Bun v1.3+ (required for native SQLite support)
- **Framework:** Next.js 16.0 with App Router & Turbopack
- **Database:** SQLite via `bun:sqlite` (embedded, zero-configuration)
- **ORM:** Drizzle ORM for type-safe queries
- **UI:** React, Tailwind CSS, shadcn/ui components
- **Deployment:** Docker with multi-stage builds

> **Important:** This application uses `bun:sqlite` which is Bun-specific and requires Bun runtime. Production builds should be done using Docker (which includes Bun) or locally with Bun installed.

## 🎥 Demo-Video

![demo-site](demo.gif)

## 🔗 Quick Links

- **GitHub Repository:** [https://github.com/kumudkode/ShopFloorAi]
- **Live Demo:** [https://shopfloor-ai.example.com](https://shopfloor-ai.example.com) _(Update with your deployment URL)_
- **Documentation:** Full API reference and deployment guide below

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Metric Definitions](#metric-definitions)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Assumptions and Tradeoffs](#assumptions-and-tradeoffs)
- [Theoretical Questions](#theoretical-questions)
- [Docker Deployment](#docker-deployment)

---

## 🏗️ Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        EDGE LAYER                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Camera 1 │  │ Camera 2 │  │ Camera 3 │  │ Camera N │        │
│  │   + CV   │  │   + CV   │  │   + CV   │  │   + CV   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       └─────────────┴─────────────┴─────────────┘               │
│                      │ JSON Events (HTTPS)                       │
└──────────────────────┼───────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes                           │   │
│  │  POST /events │ GET /metrics │ POST /seed                │   │
│  │       ▼              ▼              ▼                     │   │
│  │  ┌─────────────────────────────────────────┐             │   │
│  │  │   Business Logic & Metrics Computation  │             │   │
│  │  └──────────────┬──────────────────────────┘             │   │
│  │                 ▼                                         │   │
│  │  ┌─────────────────────────────────────────┐             │   │
│  │  │ SQLite Database (bun:sqlite)            │             │   │
│  │  │ Workers │ Workstations │ Events         │             │   │
│  │  └─────────────────────────────────────────┘             │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         React Dashboard (Next.js 16)                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │   │
│  │  │ KPI Cards│  │  Worker  │  │ Station  │               │   │
│  │  │ (Factory)│  │  Table   │  │  Table   │               │   │
│  │  └──────────┘  └──────────┘  └──────────┘               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Runtime:** Bun (fast JavaScript runtime)
- **Framework:** Next.js 16 (React App Router)
- **Database:** SQLite with Drizzle ORM (bun:sqlite)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** SWR (stale-while-revalidate)
- **Language:** TypeScript

---

## 🗄️ Database Schema

### Tables

#### Workers

| Column     | Type | Constraints | Description            |
| ---------- | ---- | ----------- | ---------------------- |
| worker_id  | TEXT | PRIMARY KEY | Unique ID (e.g., "W1") |
| name       | TEXT | NOT NULL    | Display name           |
| created_at | TEXT | NOT NULL    | ISO 8601 timestamp     |

#### Workstations

| Column     | Type | Constraints | Description             |
| ---------- | ---- | ----------- | ----------------------- |
| station_id | TEXT | PRIMARY KEY | Unique ID (e.g., "S1")  |
| name       | TEXT | NOT NULL    | Display name            |
| type       | TEXT | NOT NULL    | Assembly, QC, Packaging |
| created_at | TEXT | NOT NULL    | ISO 8601 timestamp      |

#### Events

| Column         | Type    | Constraints     | Description                       |
| -------------- | ------- | --------------- | --------------------------------- |
| id             | INTEGER | PRIMARY KEY     | Auto-increment                    |
| timestamp      | TEXT    | NOT NULL        | Event occurrence time             |
| worker_id      | TEXT    | FK→workers      | Worker reference                  |
| workstation_id | TEXT    | FK→workstations | Station reference                 |
| event_type     | TEXT    | NOT NULL        | working/idle/absent/product_count |
| confidence     | REAL    | NOT NULL        | ML confidence (0-1)               |
| count          | INTEGER | NULLABLE        | Units produced                    |
| created_at     | TEXT    | DEFAULT NOW     | Ingestion time                    |

---

## 📊 Metric Definitions

### Worker Metrics

| Metric              | Formula                                                   |
| ------------------- | --------------------------------------------------------- |
| **Active Time**     | Sum of durations where `event_type = 'working'`           |
| **Idle Time**       | Sum of durations where `event_type IN ('idle', 'absent')` |
| **Utilization %**   | `(Active Time / Total Time) × 100`                        |
| **Units Produced**  | Sum of `count` from `product_count` events                |
| **Production Rate** | `Units Produced / Active Hours`                           |

### Workstation Metrics

| Metric             | Formula                               |
| ------------------ | ------------------------------------- |
| **Occupancy Time** | Duration with any worker present      |
| **Utilization %**  | `(Working Time / 8-hour shift) × 100` |
| **Throughput**     | `Units Produced / Occupancy Hours`    |

### Factory Metrics

| Metric                      | Formula                                |
| --------------------------- | -------------------------------------- |
| **Total Productive Time**   | Sum of all worker active times         |
| **Average Utilization**     | Mean of worker utilization percentages |
| **Average Production Rate** | `Total Units / Total Active Hours`     |

---

## 🚀 Quick Start

### Prerequisites

- **Bun** v1.3+ ([Install](https://bun.sh/)) - Required for local development
- **Docker** (optional) - For containerized deployment

### Development

```bash
# Clone repository
git clone https://github.com/kumud-ranjan/shopfloor-ai.git
cd shopfloor-ai

# Install dependencies
bun install

# Start dev server (auto-seeds database on first run)
bun run dev

# Open http://localhost:3000

# Note: The dev script uses 'bun --bun' to ensure access to Bun's native modules
```

### Docker (Recommended for Production)

The application uses `bun:sqlite` which requires Bun runtime. While you can run `bun dev` locally, production builds are designed to run in Docker:

```bash
# Build image
docker build -f docker/Dockerfile -t shopfloor-ai .

# Run container
docker run -d -p 3000:3000 shopfloor-ai

# Or use docker-compose
docker-compose up -d
```

> **Note:** Running `bun run build` locally may fail if using Node.js-based Next.js build workers. Use Docker for production builds, which includes the Bun runtime.

---

## 🔌 API Reference

### POST /api/events

Ingest AI event from CV system.

```json
{
  "timestamp": "2026-01-15T10:15:30Z",
  "worker_id": "W1",
  "workstation_id": "S3",
  "event_type": "working",
  "confidence": 0.93,
  "count": null
}
```

### GET /api/metrics

Fetch dashboard data (factory, workers, workstations).

### GET /api/events

Query event history with filters.

### POST /api/seed

Refresh sample data.

---

## ⚖️ Assumptions and Tradeoffs

### Assumptions

1. **Event Ordering:** Sort by source timestamp, not ingestion time
2. **State Duration:** Maintained until next event
3. **Product Events:** Instantaneous, don't affect time calculations
4. **Shift Duration:** 8-hour standard shift
5. **Confidence:** All events accepted (CV pre-filters)

### Tradeoffs

| Decision              | Pro                | Con                  | Mitigation             |
| --------------------- | ------------------ | -------------------- | ---------------------- |
| **SQLite**            | Fast, zero config  | Limited scale        | Upgrade to TimescaleDB |
| **Real-time compute** | Always accurate    | Higher latency       | Add Redis cache        |
| **No auth**           | Faster development | Not production-ready | Add JWT/API keys       |
| **Append-only**       | Audit trail        | Potential duplicates | UNIQUE constraint      |
| **Monolith**          | Rapid development  | Harder to scale      | Microservices later    |

---

## 🧠 Theoretical Questions

### Q1: Handling Intermittent Connectivity

**Problem:** Cameras lose connection, events queue locally.

**Solution:**

- Use source timestamps, not server time
- Implement idempotent batch ingestion with `event_uuid`
- UPSERT to handle duplicates
- Sort by timestamp before metric computation

### Q2: Detecting Model Drift

**Problem:** AI performance degrades over time.

**Solution:**

- Monitor confidence score trends (alert if <0.85)
- Track event distribution shifts (chi-squared test)
- Detect temporal anomalies (events/hour deviation)
- Collect human feedback (false positive tracking)
- Trigger retraining on: confidence drift, low accuracy, user corrections

### Q3: Scaling to 100+ Cameras

**Problem:** 10,000 events/hour overwhelms current setup.

**Solution:**

- **Phase 1:** TimescaleDB + Redis cache + Kubernetes
- **Phase 2:** Kafka message queue + ClickHouse + worker pool
- **Database:** Hypertables with continuous aggregates
- **Caching:** 10-second TTL on metrics
- **Horizontal scaling:** Auto-scale API servers

### Q4: Multi-Site Deployment

**Problem:** 10 factories globally with data sovereignty.

**Solution:**

- **Edge-cloud hybrid:** Local servers per site
- **Data residency:** Raw events stay on-site
- **Aggregation sync:** Only hourly metrics to cloud
- **Multi-tenancy:** Row-level security per factory
- **Global dashboard:** Cross-site analytics in central cloud
- **Federated ML:** Privacy-preserving model training

---

## 🐳 Docker Deployment

```bash
# Quick start
docker-compose up -d

# Manual build
docker build -f docker/Dockerfile -t shopfloor-ai .
docker run -d -p 3000:3000 --name shopfloor-ai shopfloor-ai

# Production
docker run -d \
  -p 3000:3000 \
  --memory="512m" \
  --cpus="1.0" \
  --restart=always \
  shopfloor-ai
```

---

## 📁 Project Structure

```
shopfloor-ai/
├── .github/workflows/    # CI/CD with Bun
├── app/
│   ├── api/             # Backend routes
│   └── page.tsx         # Dashboard
├── backend/
│   ├── database.ts      # SQLite + Drizzle
│   ├── metrics.ts       # Computation logic
│   └── schema.ts        # DB schema
├── components/          # React components
├── docker/              # Docker configs
├── hooks/               # Custom hooks
└── package.json         # Dependencies
```

---

## 📝 License

MIT © Kumud Ranjan

---

## 📧 Contact

**Author:** Kumud Ranjan  
**GitHub:** [@kumud-ranjan](https://github.com/kumudkode)

---

**Built with ❤️ using Bun + Next.js + TypeScript**
