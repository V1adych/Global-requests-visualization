from typing import Dict, List, Any
import json
import requests

from flask import Flask, jsonify
from flask_cors import CORS

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

app = Flask(__name__)
CORS(app)

DATA_SERVER_URL = "http://data-server:3000/get-single-entry/"
IP_COUNT_LIMIT = 5000

def store_data(data: List[Dict[str, Any]]):
    logger.info("Storing data...")
    with open("traffic_data.json", "w") as f:
        json.dump(data, f, indent=4)
    logger.info("Data stored successfully.")


def retreive_data() -> List[Dict[str, Any]]:
    ip_addresses = []
    for i in range(IP_COUNT_LIMIT):
        try:
            response = requests.get(f"{DATA_SERVER_URL}/{i}")
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Retrieved data: {data}")
                ip_addresses.append(data)
            else:
                logger.error(f"Failed to retrieve datapoint {i}: {response.status_code}. Stopping")
                break
        except Exception as e:
            logger.error(f"Request failed: {e}") 
            break   

    return ip_addresses


def load_data() -> List[Dict[str, Any]]:
    try:
        logger.info("Loading data...")
        with open("traffic_data.json", "r") as f:
            return json.load(f)
        logger.info("Data loaded successfully.")
        logger.info(f"Data: {str(data)[:100]}...")  

    except Exception as e:
        logger.warning(f"Error loading data: {e}")
        return []


@app.route("/get-data", methods=["GET"])
def send_data():
    data = load_data()
    return jsonify(data), 200


if __name__ == "__main__":
    logger.info("Retreiving data...")
    data = retreive_data()
    store_data(data)

    logger.info("Starting Flask server...")
    app.run("0.0.0.0", 8000, debug=True)