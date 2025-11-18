-- =====================================================
-- Branch-Departments Junction Table
-- =====================================================
-- สร้างความสัมพันธ์ระหว่าง branches กับ departments
-- =====================================================

-- สร้าง junction table
CREATE TABLE IF NOT EXISTS public.branch_departments (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(branch_id, department_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_branch_departments_branch_id ON public.branch_departments(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_departments_department_id ON public.branch_departments(department_id);

-- Add comments
COMMENT ON TABLE public.branch_departments IS 'Junction table linking branches to departments';
COMMENT ON COLUMN public.branch_departments.branch_id IS 'Reference to branches table';
COMMENT ON COLUMN public.branch_departments.department_id IS 'Reference to departments table';

-- ลบข้อมูลเก่า (ถ้ามี)
DELETE FROM public.branch_departments;

-- เพิ่มข้อมูลความสัมพันธ์

-- สาขาจุฬา (branch_id: 1) มีทั้งหมด 21 ศูนย์
INSERT INTO public.branch_departments (branch_id, department_id) VALUES
(1, 1),   -- สุขภาพสตรี
(1, 2),   -- ระบบทางเดินอาหารและตับ
(1, 3),   -- เบาหวานและต่อมไร้ท่อ
(1, 4),   -- โรคระบบทางเดินปัสสาวะ
(1, 5),   -- ผิวหนัง
(1, 6),   -- โรคระบบทางเดินหายใจ
(1, 7),   -- กระดูกและข้อ
(1, 8),   -- รังสีวินิจฉัย X-Ray
(1, 9),   -- ศัลยกรรม
(1, 10),  -- อายุรกรรม
(1, 11),  -- ตา
(1, 12),  -- หัวใจ
(1, 13),  -- โรคระบบประสาทและสมอง
(1, 14),  -- เวชศาสตร์ฟื้นฟูและกายภาพบำบัด
(1, 15),  -- กุมารเวช
(1, 16),  -- หู คอ จมูก
(1, 17),  -- วัคซีน
(1, 18),  -- ส่งเสริมสุขภาพและอาชีวเวชศาสตร์
(1, 19),  -- ทันตกรรม
(1, 20),  -- จิตเวช
(1, 21);  -- คลินิกส่องกล้อง

-- สาขาพหลโยธิน (branch_id: 2) มี 7 ศูนย์
INSERT INTO public.branch_departments (branch_id, department_id) VALUES
(2, 10),  -- อายุรกรรม
(2, 15),  -- กุมารเวช
(2, 1),   -- สุขภาพสตรี
(2, 16),  -- หู คอ จมูก
(2, 5),   -- ผิวหนัง
(2, 17),  -- วัคซีน
(2, 18);  -- ส่งเสริมสุขภาพและอาชีวเวชศาสตร์

-- ตรวจสอบผลลัพธ์
SELECT
  b.name AS branch_name,
  d.name AS department_name,
  bd.created_at
FROM public.branch_departments bd
JOIN public.branches b ON bd.branch_id = b.id
JOIN public.departments d ON bd.department_id = d.id
ORDER BY b.id, d.id;

-- สรุป:
-- สาขาจุฬา: 21 ศูนย์
-- สาขาพหลโยธิน: 7 ศูนย์
-- ศูนย์ที่ซ้ำกันทั้ง 2 สาขา: 3 ศูนย์ (อายุรกรรม, กุมารเวช, สุขภาพสตรี)
