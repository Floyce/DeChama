import socketio
import os

# Using standard memory manager for local dev without Redis
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')


@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

async def emit_update(event_name: str, data: dict, room: str = None):
    await sio.emit(event_name, data, room=room)
