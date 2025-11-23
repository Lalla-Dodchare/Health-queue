-- Fix department branch_id based on branch_departments table
-- Some departments belong to multiple branches, so we need to handle this carefully

-- First, reset all branch_id to NULL
UPDATE departments SET branch_id = NULL;

-- For departments that belong to ONLY ONE branch, set that branch_id
UPDATE departments d
SET branch_id = (
  SELECT bd.branch_id
  FROM branch_departments bd
  WHERE bd.department_id = d.id
  GROUP BY bd.branch_id
  HAVING COUNT(DISTINCT bd.branch_id) = 1
  LIMIT 1
)
WHERE d.id IN (
  SELECT department_id
  FROM branch_departments
  GROUP BY department_id
  HAVING COUNT(DISTINCT branch_id) = 1
);

-- For departments that belong to MULTIPLE branches:
-- These departments will have branch_id = NULL
-- The query should use branch_departments table for these

-- Verify results
SELECT
  d.id,
  d.name,
  d.branch_id,
  COUNT(bd.branch_id) as num_branches,
  STRING_AGG(b.name, ', ') as branches
FROM departments d
LEFT JOIN branch_departments bd ON d.id = bd.department_id
LEFT JOIN branches b ON bd.branch_id = b.id
GROUP BY d.id, d.name, d.branch_id
ORDER BY d.name;
