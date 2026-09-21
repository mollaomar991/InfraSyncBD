import pool from '../config/db.js';

export async function ensureAiSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_ai_estimates (
      estimate_id INT PRIMARY KEY AUTO_INCREMENT,
      project_id INT NOT NULL,
      estimate_type VARCHAR(30) NOT NULL,
      predicted_budget_usd DECIMAL(18,2) NULL,
      predicted_budget_bdt DECIMAL(18,2) NULL,
      exchange_rate DECIMAL(12,4) NULL,
      input_json JSON NULL,
      output_json JSON NULL,
      created_by_user_id INT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ai_project (project_id),
      INDEX idx_ai_type (estimate_type),
      CONSTRAINT fk_ai_project FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);
}
