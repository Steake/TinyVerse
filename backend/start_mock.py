import sys
sys.modules['tinytroupe'] = type(sys)('tinytroupe')
sys.modules['tinytroupe.agent'] = type(sys)('tinytroupe.agent')
sys.modules['tinytroupe.environment'] = type(sys)('tinytroupe.environment')
sys.modules['tinytroupe.openai_utils'] = type(sys)('tinytroupe.openai_utils')

class TinyPerson:
    def __init__(self, name):
        self.name = name
    def define(self, key, value):
        pass

class TinyWorld:
    def __init__(self, name):
        self.name = name
    def add_agent(self, agent):
        pass
    def remove_agent(self, agent):
        pass
    def run(self, steps):
        pass

class OpenAIClient:
    def __init__(self, cache_api_calls=False, cache_file_name=""):
        pass
    def _setup_from_config(self):
        pass

def register_client(client):
    pass

def force_api_type(api_type):
    pass

sys.modules['tinytroupe.agent'].TinyPerson = TinyPerson
sys.modules['tinytroupe.environment'].TinyWorld = TinyWorld
sys.modules['tinytroupe.openai_utils'].OpenAIClient = OpenAIClient
sys.modules['tinytroupe.openai_utils'].register_client = register_client
sys.modules['tinytroupe.openai_utils'].force_api_type = force_api_type

import uvicorn
from app.main import app

uvicorn.run(app, host="0.0.0.0", port=8000, log_level="error")
