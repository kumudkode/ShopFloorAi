# ShopFloor AI - Worker Productivity Dashboard

An AI-powered manufacturing analytics platform that ingests computer vision events from CCTV cameras and displays real-time worker productivity metrics.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Metrics Computation](#metrics-computation)
- [Edge Cases & Reliability](#edge-cases--reliability)
- [ML Operations](#ml-operations)
- [Scaling Strategy](#scaling-strategy)
- [Docker Deployment](#docker-deployment)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EDGE LAYER                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Camera 1 │  │ Camera 2 │  │ Camera 3 │  │ Camera 4 │  │ Camera N │      │
│  │   + CV   │  │   + CV   │  │   + CV   │  │   + CV   │  │   + CV   │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │             │             │             │
│       └─────────────┴─────────────┴─────────────┴─────────────┘             │
│                                   │                                          │
│                          JSON Events (HTTPS)                                 │
│                                   ▼                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND LAYER                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Next.js API Routes                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ POST /events │  │ GET /metrics │  │ POST /seed   │               │    │
│  │  │  (Ingest)    │  │  (Dashboard) │  │  (Refresh)   │               │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────┘               │    │
│  │         │                 │                                          │    │
│  │         ▼                 ▼                                          │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │                    Business Logic                             │   │    │
│  │  │  • Event Validation  • Deduplication  • Metrics Computation  │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  │         │                                                            │    │
│  │         ▼                                                            │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │                   In-Memory Database                          │   │    │
│  │  │     Workers │ Workstations │ AI Events (time-series)         │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    React Dashboard (Next.js)                         │    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │  KPI Cards  │  │ Worker Table│  │ Station Tbl │                  │    │
│  │  │  (Factory)  │  │  (6 workers)│  │(6 stations) │                  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │    │
│  │                                                                      │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │  Search & Filter Bar (Worker/Station selection)              │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Edge**: AI-powered cameras run computer vision models locally, outputting structured JSON events
2. **Backend**: API ingests events, validates, deduplicates, stores, and computes metrics
3. **Dashboard**: Frontend fetches aggregated metrics via SWR with auto-refresh (30s intervals)

---

## Quick Start

### Prerequisites

- Node.js 20+
- bun (https://bun.sh/)

### Local Development

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Open http://localhost:3000
```

The database auto-seeds with sample data on first request.

### Refresh Sample Data

```bash
# Via API
curl -X POST http://localhost:3000/api/seed

# Or click "Refresh Data" button in the dashboard header
```

---

## API Reference

### POST /api/events - Ingest AI Event

Ingest a single event from the computer vision system.

**Request:**
```json
{
  "timestamp": "2026-01-15T10:15:00Z",
  "worker_id": "W1",
  "workstation_id": "S3",
  "event_type": "working",
  "confidence": 0.93,
  "count": 1
}
```

**Event Types:**
- `working` - Worker is actively working
- `idle` - Worker is idle/waiting
- `absent` - Worker not detected at station
- `product_count` - Unit production event (requires `count` field)

**Response (201):**
```json
{
  "success": true,
  "event_id": 42,
  "message": "Event ingested successfully"
}
```

### GET /api/metrics - Dashboard Data

Fetch computed metrics for the dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "factory": {
      "total_productive_time_minutes": 2400,
      "total_production_count": 1250,
      "average_production_rate": 31.2,
      "average_worker_utilization": 78.5,
      "active_workers": 5,
      "total_workers": 6,
      "occupied_stations": 5,
      "total_stations": 6
    },
    "workers": [...],
    "workstations": [...],
    "last_updated": "2026-01-15T14:30:00Z"
  }
}
```

### GET /api/events - Query Events

Fetch events with optional filters.

**Query Parameters:**
- `worker_id` - Filter by worker
- `workstation_id` - Filter by station
- `event_type` - Filter by event type
- `start_time` - ISO timestamp (inclusive)
- `end_time` - ISO timestamp (inclusive)

### POST /api/seed - Refresh Data

Clear and reseed the database with new sample data.

---

## Data Model

### Workers Table
| Field | Type | Description |
|-------|------|-------------|
| worker_id | string | Primary key (e.g., "W1") |
| name | string | Display name |
| created_at | timestamp | Record creation time |

### Workstations Table
| Field | Type | Description |
|-------|------|-------------|
| station_id | string | Primary key (e.g., "S1") |
| name | string | Display name |
| type | string | Category (Assembly, QC, Packaging, etc.) |
| created_at | timestamp | Record creation time |

### AI Events Table
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Auto-increment primary key |
| timestamp | timestamp | When the event occurred (from CV system) |
| worker_id | string | Foreign key to workers |
| workstation_id | string | Foreign key to workstations |
| event_type | enum | working, idle, absent, product_count |
| confidence | float | Model confidence (0-1) |
| count | integer | Units produced (for product_count events) |
| created_at | timestamp | When event was ingested |

---

## Metrics Computation

### Assumptions

1. **Time Attribution**: Duration of an event state is calculated from its timestamp until the next event
2. **Product Count Events**: Instantaneous events that don't affect time calculations
3. **Shift Duration**: 8 hours (480 minutes) for utilization calculations
4. **Last Event**: If still in a state, time is calculated until current time

### Worker Metrics

| Metric | Formula |
|--------|---------|
| Total Active Time | Sum of durations where `event_type = 'working'` |
| Total Idle Time | Sum of durations where `event_type = 'idle'` or `'absent'` |
| Utilization % | `(Active Time / Total Tracked Time) * 100` |
| Units Produced | Sum of `count` from `product_count` events |
| Units Per Hour | `Units Produced / (Active Time in Hours)` |

### Workstation Metrics

| Metric | Formula |
|--------|---------|
| Occupancy Time | Duration when any worker is at station (working or idle) |
| Utilization % | `(Active Working Time / Shift Duration) * 100` |
| Throughput Rate | `Units Produced / Occupancy Hours` |

### Factory Metrics

| Metric | Formula |
|--------|---------|
| Total Productive Time | Sum of all worker active times |
| Average Utilization | Mean of all worker utilization percentages |
| Average Production Rate | `Total Units / Total Active Hours` |

---

## Edge Cases & Reliability

### Intermittent Connectivity

```
Problem: Camera loses network connection, events queue up locally

Solutions Implemented:
┌────────────────────────────────────────────────────────────────┐
│ 1. Timestamp from Source                                       │
│    - Events include source timestamp, not server receive time  │
│    - Allows accurate time calculations even after delays       │
│                                                                │
│ 2. Idempotent Ingestion (future)                               │
│    - Add event_uuid field for deduplication                    │
│    - Store with ON CONFLICT DO NOTHING                         │
│                                                                │
│ 3. Batch Ingestion Endpoint (future)                           │
│    POST /api/events/batch                                      │
│    - Accept array of events                                    │
│    - Process in transaction                                    │
│    - Return partial success status                             │
└────────────────────────────────────────────────────────────────┘
```

### Duplicate Events

```
Problem: Network retry causes same event to be sent multiple times

Current Handling:
- Events are append-only (all stored)
- Metrics computation handles duplicates by using time ranges

Production Enhancement:
┌────────────────────────────────────────────────────────────────┐
│ Add composite unique constraint:                                │
│   UNIQUE(timestamp, worker_id, workstation_id, event_type)     │
│                                                                │
│ Or use event_uuid:                                             │
│   {                                                            │
│     "event_uuid": "550e8400-e29b-41d4-a716-446655440000",     │
│     "timestamp": "2026-01-15T10:15:00Z",                       │
│     ...                                                        │
│   }                                                            │
└────────────────────────────────────────────────────────────────┘
```

### Out-of-Order Timestamps

```
Problem: Events arrive with timestamps earlier than already processed events

Current Handling:
┌────────────────────────────────────────────────────────────────┐
│ 1. All events stored regardless of order                       │
│ 2. Queries sort by timestamp before processing                 │
│ 3. Metrics recomputed on each request (handles late arrivals)  │
│                                                                │
│ Event Processing:                                              │
│   events.sort((a, b) => a.timestamp - b.timestamp)             │
│   for (event of events) { computeMetrics(event) }              │
└────────────────────────────────────────────────────────────────┘

Production Enhancement:
- Add event_sequence_id from edge device
- Detect gaps in sequence for alerting
- Use watermarking for streaming aggregation
```

---

## ML Operations

### Model Versioning

```
┌────────────────────────────────────────────────────────────────┐
│ Event Schema Extension:                                         │
│ {                                                               │
│   "timestamp": "2026-01-15T10:15:00Z",                         │
│   "worker_id": "W1",                                           │
│   "event_type": "working",                                     │
│   "confidence": 0.93,                                          │
│   "model_version": "yolov8-worker-v2.3.1",  // NEW             │
│   "model_id": "cv-model-prod-2026-01",       // NEW            │
│   "camera_id": "CAM-FLOOR1-A3"               // NEW            │
│ }                                                               │
└────────────────────────────────────────────────────────────────┘

Benefits:
- Track which model version generated each prediction
- A/B test model versions in production
- Rollback analysis if issues detected
- Performance comparison across versions
```

### Drift Detection

```
┌────────────────────────────────────────────────────────────────┐
│ Monitoring Signals:                                             │
│                                                                │
│ 1. Confidence Distribution                                     │
│    - Track rolling average confidence                          │
│    - Alert if mean drops below threshold (e.g., 0.85)          │
│    - Detect bimodal distributions (uncertain predictions)      │
│                                                                │
│ 2. Event Type Distribution                                     │
│    - Baseline: 70% working, 20% idle, 10% other               │
│    - Alert on significant deviation (chi-squared test)         │
│                                                                │
│ 3. Temporal Patterns                                           │
│    - Expected events per hour per camera                       │
│    - Detect anomalous silence or flood                         │
│                                                                │
│ 4. Human Feedback Loop                                         │
│    - Dashboard flag button for incorrect classifications       │
│    - Store corrections for retraining dataset                  │
└────────────────────────────────────────────────────────────────┘

Implementation:
- Add /api/drift-metrics endpoint
- Compute statistics in time windows (hourly, daily)
- Push alerts to Slack/PagerDuty when thresholds breached
```

### Triggering Retraining

```
┌────────────────────────────────────────────────────────────────┐
│ Retraining Pipeline Triggers:                                   │
│                                                                │
│ Automatic Triggers:                                            │
│ ├─ Confidence drift > 10% over 7 days                          │
│ ├─ Accuracy on validation set < 90%                            │
│ ├─ New worker/station types added                              │
│ └─ Scheduled monthly refresh                                   │
│                                                                │
│ Manual Triggers:                                                │
│ ├─ Accumulated human corrections > 1000                        │
│ ├─ Factory layout change                                       │
│ └─ New uniform/equipment introduced                            │
│                                                                │
│ Pipeline:                                                       │
│ 1. Export labeled events + corrections                         │
│ 2. Trigger training job (SageMaker/Vertex/MLflow)              │
│ 3. Evaluate on held-out test set                               │
│ 4. Shadow deploy alongside current model                       │
│ 5. Compare metrics for 48 hours                                │
│ 6. Auto-promote if metrics improve, else alert                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Scaling Strategy

### 5 Cameras → 100+ Cameras → Multi-Site

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SCALE: 5 CAMERAS (Current)                                                  │
│                                                                             │
│ Architecture: Monolithic                                                    │
│ ├─ Single Next.js application                                               │
│ ├─ In-memory database (or SQLite)                                           │
│ ├─ ~500 events/hour                                                         │
│ └─ Single deployment                                                        │
│                                                                             │
│ Sufficient for: Small factory floor, prototype, pilot program               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SCALE: 100+ CAMERAS                                                         │
│                                                                             │
│ Architecture: Distributed                                                   │
│ ├─ Message Queue (Kafka/RabbitMQ) for event ingestion                       │
│ │   └─ Handles burst traffic, provides backpressure                         │
│ ├─ TimescaleDB or ClickHouse for time-series events                         │
│ │   └─ Efficient range queries, automatic partitioning                      │
│ ├─ Redis for caching aggregated metrics                                     │
│ │   └─ Cache dashboard data with 10s TTL                                    │
│ ├─ Horizontal scaling of API servers                                        │
│ │   └─ Kubernetes deployment, auto-scale on CPU                             │
│ └─ Pre-computed materialized views                                          │
│     └─ Hourly/daily aggregations for historical queries                     │
│                                                                             │
│ Events: ~10,000/hour                                                        │
│ Latency: < 100ms for dashboard queries                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SCALE: MULTI-SITE (Enterprise)                                              │
│                                                                             │
│ Architecture: Federated / Edge-Cloud Hybrid                                 │
│                                                                             │
│   Site A              Site B              Site C                            │
│ ┌─────────┐        ┌─────────┐        ┌─────────┐                          │
│ │ Edge    │        │ Edge    │        │ Edge    │                          │
│ │ Server  │        │ Server  │        │ Server  │                          │
│ │ + Local │        │ + Local │        │ + Local │                          │
│ │ Dashboard        │ Dashboard        │ Dashboard                          │
│ └────┬────┘        └────┬────┘        └────┬────┘                          │
│      │                  │                  │                                │
│      └──────────────────┼──────────────────┘                                │
│                         │                                                   │
│                         ▼                                                   │
│              ┌─────────────────────┐                                        │
│              │   Central Cloud     │                                        │
│              │   ├─ Global Dashboard                                        │
│              │   ├─ Cross-site Analytics                                    │
│              │   ├─ ML Training Pipeline                                    │
│              │   └─ Compliance/Audit Logs                                   │
│              └─────────────────────┘                                        │
│                                                                             │
│ Benefits:                                                                   │
│ ├─ Local processing = low latency dashboards                                │
│ ├─ Resilient to WAN outages (edge continues operating)                      │
│ ├─ Reduced bandwidth (only aggregates sent to cloud)                        │
│ ├─ Data sovereignty (raw data stays on-site)                                │
│ └─ Global visibility for executives                                         │
│                                                                             │
│ Events: 100,000+/hour across all sites                                      │
│ Architecture: Event sourcing with CQRS                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Scaling Path

```
SQLite (Current)
    │
    ▼ (>10K events/day)
PostgreSQL + TimescaleDB
    │ Partitioning by time
    │ Continuous aggregates
    │
    ▼ (>1M events/day)
ClickHouse / Apache Druid
    │ Column-oriented for analytics
    │ Real-time ingestion
    │
    ▼ (Multi-site)
Federated queries + Data mesh
```

---

## Docker Deployment

### Build and Run

```bash
# From project root
cd docker

# Build the image
docker build -t shopfloor-ai -f Dockerfile ..

# Run container
docker run -p 3000:3000 shopfloor-ai

# Or use docker-compose
docker-compose up -d
```

### Production Deployment

```bash
# Build with production optimizations
docker build --target runner -t shopfloor-ai:prod -f docker/Dockerfile .

# Run with resource limits
docker run -d \
  --name shopfloor-ai \
  -p 3000:3000 \
  --memory="512m" \
  --cpus="1.0" \
  --restart=unless-stopped \
  shopfloor-ai:prod
```

### Health Check

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' shopfloor-ai-dashboard

# View logs
docker logs -f shopfloor-ai-dashboard
```

---

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API routes
│   │   ├── events/        # Event ingestion
│   │   ├── metrics/       # Dashboard data
│   │   ├── seed/          # Data refresh
│   │   ├── workers/       # Worker list
│   │   └── workstations/  # Station list
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── backend/               # Backend logic
│   ├── database.ts        # In-memory DB
│   ├── metrics.ts         # Metrics computation
│   ├── seed.ts            # Sample data generation
│   └── types.ts           # Backend types
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   └── ui/                # shadcn/ui components
├── docker/                # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── frontend/              # Frontend utilities
│   ├── hooks/             # Custom React hooks
│   └── types.ts           # Frontend types
├── hooks/                 # Shared hooks
└── lib/                   # Shared utilities
```

---

## License

MIT
