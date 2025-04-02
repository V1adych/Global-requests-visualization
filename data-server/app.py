import pandas as pd
import logging

import flask
from flask_cors import CORS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("parser")

app = flask.Flask(__name__)
CORS(app)

df = pd.read_csv("ip_addresses.csv")

@app.route("/get-single-entry/<int:idx>", methods=["GET"])
def get_single_entry(idx: int):
    try:
        entry = df.iloc[idx].to_dict()
        logger.info(f"Retrieved entry: {entry}")
        return flask.jsonify(entry), 200
    except IndexError:
        logger.error(f"Index out of range: {idx}")
        return {"error": "Index out of range"}, 404
    except Exception as e:
        logger.error(f"Error retrieving entry: {e}")
        return {"error": "Internal server error"}, 500


if __name__ == "__main__":
    app.run("0.0.0.0", 3000, debug=True)
