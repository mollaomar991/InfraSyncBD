import json
import os
import sys
import warnings

warnings.filterwarnings("ignore")

import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")


def read_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def fail(message, details=None):
    payload = {"success": False, "message": message}
    if details is not None:
        payload["details"] = details
    print(json.dumps(payload))
    sys.exit(1)


def to_float(value, field, allow_none=False):
    if value in (None, ""):
        if allow_none:
            return None
        fail(f"{field} is required")
    try:
        number = float(value)
    except (TypeError, ValueError):
        fail(f"{field} must be numeric")
    if not np.isfinite(number):
        fail(f"{field} must be finite")
    return number


def predict_budget(payload):
    config = read_json(os.path.join(MODEL_DIR, "infrasync_budget_boq_input_config.json"))
    try:
        model = joblib.load(os.path.join(MODEL_DIR, "infrasync_budget_boq_neural_network.pkl"))
    except Exception as exc:
        fail("Budget model could not be loaded. Install server/ai/requirements.txt in the active Python environment.", str(exc))

    values = {}
    errors = []
    for field, spec in config["inputs"].items():
        if spec.get("type") == "category":
            value = str(payload.get(field, "")).strip()
            if value not in spec.get("values", []):
                errors.append(f"{field} must be one of the trained project categories")
            values[field] = value
        else:
            number = to_float(payload.get(field), field)
            lo, hi = float(spec["min"]), float(spec["max"])
            if number < lo or number > hi:
                errors.append(f"{field} must be between {lo:g} and {hi:g}")
            values[field] = number

    if errors:
        fail("Budget input is outside the model training range", errors)

    row = pd.DataFrame([values])
    prediction = float(model.predict(row)[0])
    if not np.isfinite(prediction):
        fail("Budget model returned a non-finite prediction")

    prediction = max(0.0, prediction)
    return {
        "success": True,
        "prediction": {
            "estimated_budget_usd": prediction,
            "model_r2": config.get("metrics", {}).get("r2"),
            "training_projects": config.get("training_projects"),
        },
    }


def predict_materials(payload):
    config = read_json(os.path.join(MODEL_DIR, "infrasync_material_estimator_config.json"))
    try:
        models = joblib.load(os.path.join(MODEL_DIR, "infrasync_material_estimator_models.pkl"))
    except Exception as exc:
        fail("Material model could not be loaded. Install server/ai/requirements.txt in the active Python environment.", str(exc))

    total_area = to_float(payload.get("total_floor_area_m2"), "total_floor_area_m2")
    floors = to_float(payload.get("floors"), "floors", allow_none=True)
    construction_year = to_float(payload.get("construction_year"), "construction_year", allow_none=True)
    brick_weight = to_float(payload.get("brick_weight_kg", 3.0), "brick_weight_kg")

    if total_area <= 0:
        fail("total_floor_area_m2 must be greater than 0")
    if brick_weight <= 0:
        fail("brick_weight_kg must be greater than 0")

    feature_map = config.get("feature_map", {})
    feature_cols = config.get("numeric_features", []) + config.get("categorical_features", [])
    row = {col: np.nan for col in feature_cols}

    # IMPORTANT: the trained source column named floor_area_type is mostly missing in the
    # original dataset and should not receive total area. Total area is used only to scale
    # predicted kg/m2 intensities to total project quantity.
    if feature_map.get("floors"):
        row[feature_map["floors"]] = np.nan if floors is None else floors
    if feature_map.get("construction_year"):
        row[feature_map["construction_year"]] = np.nan if construction_year is None else construction_year

    friendly_category_keys = [
        "building_type",
        "structure_type",
        "function_type",
        "country",
        "region",
        "urban_rural",
    ]
    for friendly in friendly_category_keys:
        col = feature_map.get(friendly)
        if col:
            value = payload.get(friendly)
            row[col] = "__MISSING__" if value in (None, "") else str(value)

    input_df = pd.DataFrame([row])
    for col in config.get("numeric_features", []):
        input_df[col] = pd.to_numeric(input_df[col], errors="coerce").astype("float64")
    for col in config.get("categorical_features", []):
        input_df[col] = input_df[col].astype("string").fillna("__MISSING__").astype(str)

    outputs = {}
    for material, model in models.items():
        intensity = float(model.predict(input_df)[0])
        if not np.isfinite(intensity):
            continue
        intensity = max(0.0, intensity)
        total_kg = intensity * total_area
        item = {
            "predicted_intensity_kg_per_m2": intensity,
            "estimated_total_kg": total_kg,
            "estimated_total_tonnes": total_kg / 1000.0,
            "model_r2": config.get("metrics", {}).get(material, {}).get("r2"),
        }
        if material == "cement":
            item["estimated_50kg_bags"] = total_kg / 50.0
        if material == "brick":
            item["estimated_brick_count"] = total_kg / brick_weight
            item["brick_weight_assumption_kg_each"] = brick_weight
        outputs[material] = item

    return {
        "success": True,
        "prediction": {
            "total_floor_area_m2": total_area,
            "materials": outputs,
            "important_note": config.get("important_note"),
        },
    }


def main():
    if len(sys.argv) < 2:
        fail("Prediction mode is required: budget or materials")
    mode = sys.argv[1]
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError as exc:
        fail("Invalid JSON input", str(exc))

    if mode == "budget":
        result = predict_budget(payload)
    elif mode == "materials":
        result = predict_materials(payload)
    else:
        fail("Unknown prediction mode")

    print(json.dumps(result))


if __name__ == "__main__":
    main()
