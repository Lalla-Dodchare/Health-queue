-- Create function to get departments by branch
-- This bypasses RLS and relationship issues

CREATE OR REPLACE FUNCTION get_departments_by_branch(branch_id_param INTEGER)
RETURNS TABLE (
  id INTEGER,
  name TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.name
  FROM departments d
  INNER JOIN branch_departments bd ON d.id = bd.department_id
  WHERE bd.branch_id = branch_id_param
  ORDER BY d.name;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_departments_by_branch(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_departments_by_branch(INTEGER) TO authenticated;

-- Test the function
SELECT * FROM get_departments_by_branch(1);
