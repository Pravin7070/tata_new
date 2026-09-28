# Tata Innovent Project

## Overview
Tata Innovent is a full-stack autonomous vehicle project designed for terrain detection, risk analysis, and intelligent vehicle control. It combines artificial intelligence, backend APIs, frontend dashboards, and a 3D simulation environment to create a smart off-road vehicle system.

The project is built to:
- detect terrain from uploaded videos or live frames
- classify terrain types such as road, mud, water, pothole, gravel, slope, bush, and stone
- calculate terrain severity and risk levels
- recommend vehicle actions such as speed, steering, ride height, and drive mode
- display results through a web dashboard and simulation
- support analytics and reporting

---

## Project Architecture
The project consists of several major modules:

### 1. AI Engine
The AI Engine is the core intelligence layer of the project. It is responsible for:
- video preprocessing
- frame extraction
- terrain classification
- confidence scoring
- severity evaluation
- risk-based decision generation

It uses YOLOv8-based object detection to identify and analyze terrain conditions. The system can detect terrain types such as:
- Road
- Mud
- Stone
- Pothole
- Bush
- Water
- Slope
- Gravel

Based on the detected terrain, the system recommends:
- drive mode
- ride height
- steering recommendation
- recommended speed
- severity and risk rating

### 2. Backend
The backend is built with FastAPI and acts as the central hub of the entire system. It:
- receives uploaded videos
- stores files in the upload directory
- saves metadata in SQLite
- exposes REST API endpoints
- handles WebSocket communication for live data
- connects the AI engine with the frontend
- provides endpoints for upload, vehicle status, detection history, analytics, and health checks

### 3. Frontend
The frontend is a React + Vite dashboard used for:
- monitoring vehicle status
- visualizing analytics
- managing simulation controls
- displaying maps and settings
- presenting AI-generated telemetry

It includes pages for:
- Dashboard
- Vehicle
- Analytics
- Simulation
- Map
- Settings

### 4. Simulation
The simulation layer is built using React Three Fiber and Three.js. It provides:
- 3D rover visualization
- terrain rendering
- camera modes such as chase, POV, suspension, and orbit
- live telemetry updates
- vehicle control command visualization

### 5. Analytics Module
The analytics system focuses on:
- processing detection results
- generating metrics summaries
- creating charts
- exporting CSV and PDF reports
- analyzing terrain risk and historical behavior

---

## System Workflow
The typical flow of the project is:

1. A video is uploaded to the backend.
2. The backend stores the uploaded file and metadata.
3. The AI engine processes the video and extracts frames.
4. YOLOv8 identifies terrain and obstacles.
5. Severity and risk logic calculates the danger level.
6. Decision logic recommends safe driving behavior.
7. The output is produced as structured JSON telemetry.
8. The frontend dashboard and simulation consume the result for visualization and monitoring.

---

## Tech Stack
### AI / Computer Vision
- Python
- YOLOv8
- OpenCV
- ultralytics

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- WebSockets

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet
- Framer Motion

### Simulation
- Three.js
- React Three Fiber
- Rapier Physics

---

## Main Objective
The main objective of Tata Innovent is to create an intelligent autonomous off-road vehicle system that can:
- detect terrain conditions
- assess danger
- choose safe driving actions
- provide monitoring and visualization through a web dashboard
- simulate vehicle behavior in real time

---

## Summary
Tata Innovent is a smart terrain-aware autonomous vehicle project combining AI vision, backend services, analytics, and a 3D simulation for real-time vehicle decision-making and monitoring.

---

## Project Structure
```bash
tata_innovent-main/
├── README.md
├── ai-engine/
│   ├── detection/
│   ├── decision/
│   ├── inference/
│   ├── preprocessing/
│   ├── severity/
│   ├── utilities/
│   ├── main.py
│   ├── api.py
│   └── requirements.txt
├── backend/
│   ├── app/
│   ├── uploads/
│   ├── logs/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── simulation/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── analytics/
│   ├── charts/
│   ├── processing/
│   ├── reports/
│   └── utilities/
└── README.md
```

---

## Conclusion
This project demonstrates the integration of AI-driven terrain detection with vehicle control logic, real-time backend communication, and web-based simulation. It is suitable for advanced demonstrations, prototype development, and autonomous vehicle research.
