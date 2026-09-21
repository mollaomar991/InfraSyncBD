# InfraSync BD AI Integration

This folder contains the two trained planning-support models used by the InfraSyncBD web application.

## Model 1 - BOQ Budget Estimator

- File: `models/infrasync_budget_boq_neural_network.pkl`
- Input config: `models/infrasync_budget_boq_input_config.json`
- Frontend: Department Officer -> Create Project
- API: `POST /api/ai/budget-estimate`
- Output: model USD budget + backend USD-to-BDT conversion
- The reviewed prediction is saved with the project when the officer creates it.

## Model 2 - Construction Material Estimator

- File: `models/infrasync_material_estimator_models.pkl`
- Input config: `models/infrasync_material_estimator_config.json`
- Frontend: Department Officer / Contractor -> AI Materials
- API: `POST /api/ai/material-estimate`
- Targets: brick, cement, aggregate and steel
- Material intensity (kg/m2) is scaled by the project's entered gross floor area.
- Brick count uses a configurable brick-weight assumption.
- Cement bags use 50 kg per bag.
- Aggregate is the source dataset's aggregate target and may combine gravel/sand/slag; do not label it as pure sand.

## Python environment

The uploaded pickle files were created with **scikit-learn 1.6.1**. Use the pinned requirements:

### Windows

```cmd
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r ai\requirements.txt
npm install
npm start
```

### Linux / WSL

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r ai/requirements.txt
npm install
npm start
```

If needed, set `AI_PYTHON` in `server/.env` to the Python executable used for the virtual environment.

## Frontend

From the project root:

```cmd
npm install
npm run dev
```

The frontend expects the API at `http://localhost:5000/api`.

## Database

At server startup, InfraSyncBD creates `project_ai_estimates` if it does not exist. It stores budget/material AI inputs and outputs linked to a project.

## Important

Both models are planning-support tools. Their results are not approved engineering estimates or procurement quantities. Verify final budgets and quantities using engineering BOQ/design calculations.
