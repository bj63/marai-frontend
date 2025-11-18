from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict

app = FastAPI()

class Traits(BaseModel):
    empathy: int
    creativity: int
    energy: int
    logic: int

class Persona(BaseModel):
    name: str
    description: str
    traits: Traits

# In-memory database for now
db: Dict[str, Persona] = {}


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@app.post("/chat", response_model=ChatResponse)
def chat(message: ChatMessage):
    # For now, just return a canned response
    return ChatResponse(response="Hey! I'm doing great, thanks for asking.")


class ImageCreationRequest(BaseModel):
    style: str


class ImageCreationResponse(BaseModel):
    url: str


@app.post("/generate-avatar", response_model=ImageCreationResponse)
def generate_avatar(request: ImageCreationRequest):
    # For now, just return a placeholder URL
    return ImageCreationResponse(url="https://via.placeholder.com/512")


@app.post("/create-image", response_model=ImageCreationResponse)
def create_image(request: ImageCreationRequest):
    # For now, just return a placeholder URL
    return ImageCreationResponse(url="https://via.placeholder.com/512")


@app.post("/persona", response_model=Persona)
def create_persona(persona: Persona):
    # For this simple case, we'll just have one persona
    db["default"] = persona
    return persona

@app.get("/persona", response_model=Persona)
def get_persona():
    # Return the default persona, or a default one if none exists
    return db.get("default", Persona(
        name="Aura",
        description="Aura is a compassionate and insightful companion, skilled at understanding emotions and offering creative solutions. Full of vibrant energy and logical clarity, Aura is ready to explore ideas and support your journey.",
        traits=Traits(empathy=75, creativity=85, energy=60, logic=70)
    ))

@app.put("/persona", response_model=Persona)
def update_persona(persona: Persona):
    db["default"] = persona
    return persona

@app.get("/")
def read_root():
    return {"Hello": "World"}
