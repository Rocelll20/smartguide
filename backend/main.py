import os
from datetime import datetime
from typing import Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"

HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

app = FastAPI(
    title="SmartGuide API",
    description="Backend API for SmartGuide IoT-assisted guide stick demo.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # okay for school demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEMO_USER_ID = "11111111-1111-1111-1111-111111111111"


class ObstacleEventIn(BaseModel):
    device_code: str = "SG-STICK-001"
    distance_cm: float


class FallEventIn(BaseModel):
    blind_user_id: str = DEMO_USER_ID
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    message: Optional[str] = "Possible fall detected by SmartGuide mobile app."


class LocationUpdateIn(BaseModel):
    blind_user_id: str = DEMO_USER_ID
    latitude: float
    longitude: float
    accuracy: Optional[float] = None


def supabase_get(table: str, params: dict = None):
    url = f"{SUPABASE_REST_URL}/{table}"
    response = requests.get(url, headers=HEADERS, params=params or {})

    if not response.ok:
        raise HTTPException(status_code=500, detail=response.text)

    return response.json()


def supabase_insert(table: str, data: dict):
    url = f"{SUPABASE_REST_URL}/{table}"
    response = requests.post(url, headers=HEADERS, json=data)

    if not response.ok:
        raise HTTPException(status_code=500, detail=response.text)

    return response.json()


def supabase_update(table: str, filters: dict, data: dict):
    url = f"{SUPABASE_REST_URL}/{table}"
    params = {}

    for key, value in filters.items():
        params[key] = f"eq.{value}"

    response = requests.patch(url, headers=HEADERS, params=params, json=data)

    if not response.ok:
        raise HTTPException(status_code=500, detail=response.text)

    return response.json()


def get_severity(distance_cm: float) -> str:
    if distance_cm <= 50:
        return "danger"
    if distance_cm <= 100:
        return "warning"
    if distance_cm <= 150:
        return "caution"
    return "safe"


@app.get("/")
def root():
    return {
        "app": "SmartGuide API",
        "status": "running",
        "message": "FastAPI backend is working."
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/users")
def get_users():
    users = supabase_get(
        "blind_users",
        {
            "select": "*",
            "order": "created_at.desc",
        }
    )

    return users


@app.get("/dashboard")
def get_dashboard():
    users = supabase_get(
        "blind_users",
        {
            "select": "*",
            "order": "created_at.desc",
        }
    )

    obstacles = supabase_get(
        "obstacle_events",
        {
            "select": "*",
            "order": "created_at.desc",
            "limit": "10",
        }
    )

    falls = supabase_get(
        "fall_events",
        {
            "select": "*",
            "order": "created_at.desc",
            "limit": "10",
        }
    )

    locations = supabase_get(
        "location_updates",
        {
            "select": "*",
            "order": "created_at.desc",
            "limit": "10",
        }
    )

    active_users = [user for user in users if user.get("status") == "active"]

    return {
        "total_users": len(users),
        "active_users": len(active_users),
        "recent_obstacle_events": obstacles,
        "recent_fall_events": falls,
        "recent_locations": locations,
    }


@app.get("/alerts/latest")
def get_latest_alert(blind_user_id: str = DEMO_USER_ID):
    obstacle = supabase_get(
        "obstacle_events",
        {
            "select": "*",
            "blind_user_id": f"eq.{blind_user_id}",
            "order": "created_at.desc",
            "limit": "1",
        }
    )

    fall = supabase_get(
        "fall_events",
        {
            "select": "*",
            "blind_user_id": f"eq.{blind_user_id}",
            "order": "created_at.desc",
            "limit": "1",
        }
    )

    return {
        "latest_obstacle": obstacle[0] if obstacle else None,
        "latest_fall": fall[0] if fall else None,
    }


@app.post("/iot/obstacle")
def create_obstacle_event(payload: ObstacleEventIn):
    device_result = supabase_get(
        "devices",
        {
            "select": "*",
            "device_code": f"eq.{payload.device_code}",
            "limit": "1",
        }
    )

    if not device_result:
        raise HTTPException(status_code=404, detail="Device not found")

    device = device_result[0]
    blind_user_id = device["blind_user_id"]
    severity = get_severity(payload.distance_cm)

    if severity == "safe":
        return {
            "saved": False,
            "severity": "safe",
            "message": "Obstacle is far enough. No alert saved."
        }

    message = f"{severity.upper()}: Obstacle detected at {payload.distance_cm} cm."

    inserted = supabase_insert(
        "obstacle_events",
        {
            "blind_user_id": blind_user_id,
            "device_code": payload.device_code,
            "distance_cm": payload.distance_cm,
            "severity": severity,
            "message": message,
        }
    )

    return {
        "saved": True,
        "event": inserted[0],
    }


@app.post("/mobile/fall")
def create_fall_event(payload: FallEventIn):
    inserted = supabase_insert(
        "fall_events",
        {
            "blind_user_id": payload.blind_user_id,
            "severity": "emergency",
            "status": "new",
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "message": payload.message,
        }
    )

    return {
        "saved": True,
        "event": inserted[0],
    }


@app.post("/mobile/location")
def create_location_update(payload: LocationUpdateIn):
    inserted = supabase_insert(
        "location_updates",
        {
            "blind_user_id": payload.blind_user_id,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "accuracy": payload.accuracy,
        }
    )

    supabase_update(
        "blind_users",
        {"id": payload.blind_user_id},
        {
            "last_latitude": payload.latitude,
            "last_longitude": payload.longitude,
            "last_location_at": datetime.utcnow().isoformat(),
        }
    )

    return {
        "saved": True,
        "location": inserted[0],
    }