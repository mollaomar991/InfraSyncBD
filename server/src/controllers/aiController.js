import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pool from '../config/db.js';
import { ensureAiSchema } from '../services/aiSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// aiController.js is in server/src/controllers.
// The AI files are in server/src/ai.
const predictorPath = path.resolve(__dirname, '../ai/predict_ai.py');
const budgetConfigPath = path.resolve(
  __dirname,
  '../ai/models/infrasync_budget_boq_input_config.json'
);
const materialConfigPath = path.resolve(
  __dirname,
  '../ai/models/infrasync_material_estimator_config.json'
);

// Project root: InfraSyncBD/
const projectRoot = path.resolve(__dirname, '../../..');

/**
 * Select a Python interpreter reliably.
 * Priority:
 * 1) AI_PYTHON environment variable
 * 2) Project virtual environment (.venv)
 * 3) Windows Python launcher: py -3.12
 * 4) python3 on non-Windows systems
 */
function getPythonLaunch() {
  if (process.env.AI_PYTHON) {
    return {
      command: process.env.AI_PYTHON,
      prefixArgs: [],
    };
  }

  if (process.platform === 'win32') {
    const venvPython = path.join(projectRoot, '.venv', 'Scripts', 'python.exe');

    if (fs.existsSync(venvPython)) {
      return {
        command: venvPython,
        prefixArgs: [],
      };
    }

    // `py` is more reliable than `python` on many Windows installations.
    return {
      command: 'py',
      prefixArgs: ['-3.12'],
    };
  }

  const venvPython = path.join(projectRoot, '.venv', 'bin', 'python');
  if (fs.existsSync(venvPython)) {
    return {
      command: venvPython,
      prefixArgs: [],
    };
  }

  return {
    command: 'python3',
    prefixArgs: [],
  };
}

function runPrediction(mode, payload) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(predictorPath)) {
      return reject(
        new Error(`AI predictor was not found at: ${predictorPath}`)
      );
    }

    const { command, prefixArgs } = getPythonLaunch();

    const child = spawn(command, [...prefixArgs, predictorPath, mode], {
      cwd: path.dirname(predictorPath),
      env: process.env,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      const message =
        error?.code === 'ENOENT'
          ? `Python could not be started. Create the project virtual environment at ${path.join(
              projectRoot,
              '.venv'
            )} or set AI_PYTHON to a valid Python executable.`
          : `Could not start the AI Python process: ${error.message}`;

      reject(new Error(message));
    });

    child.on('close', (code) => {
      const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
      let parsed = null;

      try {
        parsed = lines.length ? JSON.parse(lines[lines.length - 1]) : null;
      } catch {
        // handled below
      }

      if (code !== 0 || !parsed?.success) {
        const message =
          parsed?.message ||
          stderr.trim() ||
          `AI prediction failed with exit code ${code}`;

        const error = new Error(message);
        error.details = parsed?.details;
        return reject(error);
      }

      resolve(parsed.prediction);
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

export const getAiMetadata = async (req, res) => {
  try {
    const budget = JSON.parse(fs.readFileSync(budgetConfigPath, 'utf8'));
    const materials = JSON.parse(fs.readFileSync(materialConfigPath, 'utf8'));

    res.json({
      success: true,
      data: {
        budget: {
          projectTypes: budget.project_types,
          inputs: budget.inputs,
          metrics: budget.metrics,
          trainingProjects: budget.training_projects,
        },
        materials: {
          metrics: materials.metrics,
          trainedTargets: materials.trained_targets,
          note: materials.important_note,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const estimateBudget = async (req, res) => {
  try {
    const prediction = await runPrediction('budget', req.body);
    const exchangeRate = Number(process.env.AI_USD_TO_BDT_RATE || 120);
    const estimatedBdt = prediction.estimated_budget_usd * exchangeRate;

    res.json({
      success: true,
      data: {
        ...prediction,
        exchange_rate_usd_to_bdt: exchangeRate,
        estimated_budget_bdt: estimatedBdt,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }
};

async function canAccessProject(userId, projectId) {
  const [rows] = await pool.query(
    `
    SELECT p.project_id
    FROM projects p
    LEFT JOIN officer_profiles op ON p.created_by_officer_id = op.officer_id
    LEFT JOIN contractor_profiles cp ON p.assigned_contractor_id = cp.contractor_id
    WHERE p.project_id = ? AND (op.user_id = ? OR cp.user_id = ?)
    LIMIT 1
  `,
    [projectId, userId, userId]
  );

  return rows.length > 0;
}

export const estimateMaterials = async (req, res) => {
  try {
    const prediction = await runPrediction('materials', req.body);
    const projectId = Number(req.body.projectId || 0);
    let saved = false;

    if (projectId) {
      if (!(await canAccessProject(req.user.userId, projectId))) {
        return res.status(403).json({
          success: false,
          message:
            'You can only save an AI material estimate to a project you own or are assigned to.',
        });
      }

      await ensureAiSchema();
      await pool.query(
        `INSERT INTO project_ai_estimates
          (project_id, estimate_type, input_json, output_json, created_by_user_id)
         VALUES (?, 'materials', ?, ?, ?)`,
        [
          projectId,
          JSON.stringify(req.body),
          JSON.stringify(prediction),
          req.user.userId,
        ]
      );
      saved = true;
    }

    res.json({ success: true, data: prediction, saved });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }
};

export const getProjectAiEstimates = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (!(await canAccessProject(req.user.userId, projectId))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project AI history.',
      });
    }

    await ensureAiSchema();

    const [rows] = await pool.query(
      `
      SELECT estimate_id, estimate_type, predicted_budget_usd, predicted_budget_bdt,
             exchange_rate, input_json, output_json, created_at
      FROM project_ai_estimates
      WHERE project_id = ?
      ORDER BY created_at DESC, estimate_id DESC
    `,
      [projectId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { runPrediction };
