-- Insert Mock Doctors Data (V2 - Fixed Schema)
-- Branch 1 (จุฬา): 68 doctors across 21 departments
-- Branch 2 (พหลโยธิน): 27 doctors across 7 departments
-- Total: 95 doctors
-- Columns: name_th, name_en, specialty_th, specialty_en, department_id, branch_id

-- จุฬา - สุขภาพสตรี (4 คน)
INSERT INTO doctors (name_th, name_en, specialty_th, specialty_en, department_id, branch_id) VALUES
('นพ.วิชัย สุขสันต์', 'Dr. Wichai Suksan', 'สูติ-นรีเวชกรรม', 'Obstetrics & Gynecology', 1, 1),
('พญ.สุดา เจริญผล', 'Dr. Suda Charoenphon', 'สูติ-นรีเวชกรรม', 'Obstetrics & Gynecology', 1, 1),
('นพ.ประสิทธิ์ ใจดี', 'Dr. Prasit Jaidee', 'มะเร็งนรีเวช', 'Gynecologic Oncology', 1, 1),
('พญ.รัตนา สว่างใจ', 'Dr. Rattana Sawangjai', 'เวชศาสตร์มารดาและทารกในครรภ์', 'Maternal-Fetal Medicine', 1, 1),

-- จุฬา - ระบบทางเดินอาหารและตับ (3 คน)
('นพ.สมชาย พิทักษ์', 'Dr. Somchai Pithak', 'โรคตับ', 'Hepatology', 2, 1),
('พญ.อรุณี แก้วมณี', 'Dr. Arunee Kaewmanee', 'โรคระบบทางเดินอาหาร', 'Gastroenterology', 2, 1),
('นพ.เกรียงศักดิ์ วงศ์ไทย', 'Dr. Kriangksak Wongthai', 'โรคตับและตับอ่อน', 'Hepatobiliary', 2, 1),

-- จุฬา - เบาหวานและต่อมไร้ท่อ (3 คน)
('พญ.นภา ศรีสุข', 'Dr. Napa Srisuk', 'โรคเบาหวาน', 'Diabetes', 3, 1),
('นพ.สุรศักดิ์ ทองดี', 'Dr. Surasak Thongdee', 'ต่อมไร้ท่อ', 'Endocrinology', 3, 1),
('พญ.วิภา แสงทอง', 'Dr. Wipha Saengthong', 'โรคต่อมไทรอยด์', 'Thyroid Disorders', 3, 1),

-- จุฬา - โรคระบบทางเดินปัสสาวะ (3 คน)
('นพ.ธนา ศรีประจันต์', 'Dr. Thana Sriprachan', 'โรคไต', 'Nephrology', 4, 1),
('พญ.สุภาพร สุวรรณ', 'Dr. Supaporn Suwan', 'ไตวาย', 'Renal Failure', 4, 1),
('นพ.อนุชา ปานกลาง', 'Dr. Anucha Panklang', 'ศัลยกรรมทางเดินปัสสาวะ', 'Urology Surgery', 4, 1),

-- จุฬา - ผิวหนัง (3 คน)
('พญ.ชนิดา ใจงาม', 'Dr. Chanida Jaingam', 'โรคผิวหนัง', 'Dermatology', 5, 1),
('นพ.รัชพล วัฒนา', 'Dr. Ratchaphon Watthana', 'ผิวหนังเด็ก', 'Pediatric Dermatology', 5, 1),
('พญ.มณีรัตน์ สุขใส', 'Dr. Maneerat Suksai', 'ความงามผิวหนัง', 'Cosmetic Dermatology', 5, 1),

-- จุฬา - โรคระบบทางเดินหายใจ (3 คน)
('นพ.สมศักดิ์ ใจหาญ', 'Dr. Somsak Jaihan', 'โรคปอด', 'Pulmonology', 6, 1),
('พญ.ประภา เพ็ชรดี', 'Dr. Prapha Phetdee', 'หอบหืด', 'Asthma Specialist', 6, 1),
('นพ.วีระ มั่นคง', 'Dr. Weera Mankhong', 'ระบบหายใจวิกฤต', 'Critical Pulmonary Care', 6, 1),

-- จุฬา - กระดูกและข้อ (4 คน)
('นพ.ชัยยา กล้าหาญ', 'Dr. Chaiya Klahan', 'ศัลยกรรมกระดูก', 'Orthopedic Surgery', 7, 1),
('พญ.สุนิสา ทรงพล', 'Dr. Sunisa Songphon', 'โรคข้อ', 'Arthritis Specialist', 7, 1),
('นพ.ธีระ ศรีทอง', 'Dr. Theera Srithong', 'กระดูกสันหลัง', 'Spine Surgery', 7, 1),
('พญ.อัญชลี บุญมี', 'Dr. Anchalee Boonmee', 'กายภาพบำบัดกระดูก', 'Orthopedic Rehabilitation', 7, 1),

-- จุฬา - รังสีวินิจฉัย X-Ray (2 คน)
('นพ.ปิยะ สุขสม', 'Dr. Piya Suksom', 'รังสีวิทยา', 'Radiology', 8, 1),
('พญ.นันทนา วิมล', 'Dr. Nanthana Wimon', 'รังสีวินิจฉัย', 'Diagnostic Radiology', 8, 1),

-- จุฬา - ศัลยกรรม (5 คน)
('นพ.วิทยา ชัยศรี', 'Dr. Witthaya Chaisri', 'ศัลยกรรมทั่วไป', 'General Surgery', 9, 1),
('พญ.สุพัตรา กมลพันธ์', 'Dr. Supatra Kamonphan', 'ศัลยกรรมตกแต่ง', 'Plastic Surgery', 9, 1),
('นพ.ประพันธ์ มีชัย', 'Dr. Praphan Meechai', 'ศัลยกรรมหลอดเลือด', 'Vascular Surgery', 9, 1),
('นพ.สุเมธ บุญล้อม', 'Dr. Sumet Boonlom', 'ศัลยกรรมอุบัติเหตุ', 'Trauma Surgery', 9, 1),
('พญ.อัมพร สายสุด', 'Dr. Amporn Saisut', 'ศัลยกรรมมะเร็ง', 'Surgical Oncology', 9, 1),

-- จุฬา - อายุรกรรม (5 คน)
('นพ.สมบูรณ์ ทองคำ', 'Dr. Somboon Thongkham', 'อายุรกรรมทั่วไป', 'Internal Medicine', 10, 1),
('พญ.จุฬาลักษณ์ ศิริ', 'Dr. Chulalak Siri', 'โรคติดเชื้อ', 'Infectious Disease', 10, 1),
('นพ.ธนพล รุ่งเรือง', 'Dr. Thanaphon Rungrueng', 'ผู้สูงอายุ', 'Geriatrics', 10, 1),
('พญ.ศิริพร แสงดาว', 'Dr. Siriporn Saengdao', 'โรคภูมิแพ้', 'Allergy & Immunology', 10, 1),
('นพ.กิตติ ใจกล้า', 'Dr. Kitti Jaiklang', 'โรคเลือด', 'Hematology', 10, 1),

-- จุฬา - ตา (3 คน)
('นพ.วสันต์ เจริญ', 'Dr. Wasan Charoen', 'จักษุวิทยา', 'Ophthalmology', 11, 1),
('พญ.กนกวรรณ สว่าง', 'Dr. Kanokwan Sawang', 'ตาต้อหิน', 'Glaucoma Specialist', 11, 1),
('นพ.ปรีชา แก้วใส', 'Dr. Preecha Kaewsai', 'จอประสาทตา', 'Retina Specialist', 11, 1),

-- จุฬา - หัวใจ (4 คน)
('นพ.ธนกร ใจซื่อ', 'Dr. Thanakorn Jaisue', 'โรคหัวใจ', 'Cardiology', 12, 1),
('พญ.สุดารัตน์ พรหม', 'Dr. Sudarat Phrom', 'หัวใจเต้นผิดจังหวะ', 'Arrhythmia Specialist', 12, 1),
('นพ.พิชิต วงษ์ใหญ่', 'Dr. Pichit Wongyai', 'สวนหัวใจ', 'Interventional Cardiology', 12, 1),
('พญ.ปราณี สุขสวัสดิ์', 'Dr. Pranee Suksawat', 'ศัลยกรรมหัวใจ', 'Cardiac Surgery', 12, 1),

-- จุฬา - โรคระบบประสาทและสมอง (3 คน)
('นพ.ชาญชัย สติกุล', 'Dr. Chanchai Satikul', 'โรคระบบประสาท', 'Neurology', 13, 1),
('พญ.วิไลพร ชัยมงคล', 'Dr. Wilaiporn Chaimongkol', 'โรคหลอดเลือดสมอง', 'Stroke Specialist', 13, 1),
('นพ.อดิศักดิ์ สุขใส', 'Dr. Adisak Suksai', 'ศัลยกรรมสมอง', 'Neurosurgery', 13, 1),

-- จุฬา - เวชศาสตร์ฟื้นฟูและกายภาพบำบัด (2 คน)
('พญ.รัชนี พัฒนา', 'Dr. Ratchanee Patthana', 'เวชศาสตร์ฟื้นฟู', 'Rehabilitation Medicine', 14, 1),
('นพ.สุชาติ เข็มทอง', 'Dr. Suchat Khemthong', 'กายภาพบำบัด', 'Physical Therapy', 14, 1),

-- จุฬา - กุมารเวช (4 คน)
('พญ.วิภาดา อ่อนละมุน', 'Dr. Vipada Onlamoon', 'กุมารเวชทั่วไป', 'General Pediatrics', 15, 1),
('นพ.ณัฐพล มงคล', 'Dr. Nattaphon Mongkhon', 'เด็กแรกเกิด', 'Neonatology', 15, 1),
('พญ.สุภาวดี สิริวัฒน์', 'Dr. Supawadee Siriwat', 'ระบบทางเดินหายใจเด็ก', 'Pediatric Pulmonology', 15, 1),
('นพ.ไกรสร สุขสันต์', 'Dr. Kraisorn Suksan', 'โรคหัวใจเด็ก', 'Pediatric Cardiology', 15, 1),

-- จุฬา - หู คอ จมูก (3 คน)
('นพ.ณรงค์ศักดิ์ ศรีสุข', 'Dr. Narongsak Srisuk', 'หู คอ จมูก', 'Otolaryngology', 16, 1),
('พญ.พิมพ์ชนก ประดิษฐ์', 'Dr. Pimchanok Pradit', 'หูตึง', 'Hearing Disorders', 16, 1),
('นพ.ชยพล วงศ์ษา', 'Dr. Chayaphon Wongsa', 'ศัลยกรรมหูคอจมูก', 'ENT Surgery', 16, 1),

-- จุฬา - วัคซีน (2 คน)
('พญ.อรทัย พูนสุข', 'Dr. Orathai Poonsuk', 'วัคซีนและภูมิคุ้มกัน', 'Vaccination & Immunization', 17, 1),
('นพ.ประยุทธ จรัสกุล', 'Dr. Prayut Charaskul', 'โรคติดต่อและวัคซีน', 'Infectious Disease & Vaccination', 17, 1),

-- จุฬา - ส่งเสริมสุขภาพและอาชีวเวชศาสตร์ (2 คน)
('พญ.สุมาลี จิตต์งาม', 'Dr. Sumalee Jitngam', 'เวชศาสตร์ป้องกัน', 'Preventive Medicine', 18, 1),
('นพ.ธีรพงศ์ สุขศรี', 'Dr. Theerapong Suksri', 'อาชีวเวชศาสตร์', 'Occupational Medicine', 18, 1),

-- จุฬา - ทันตกรรม (3 คน)
('ทพ.สมพร ทันใจ', 'Dr. Somporn Thanjai', 'ทันตกรรมทั่วไป', 'General Dentistry', 19, 1),
('ทพญ.นิภา ยิ้มสด', 'Dr. Nipha Yimsod', 'ทันตกรรมจัดฟัน', 'Orthodontics', 19, 1),
('ทพ.วรินทร์ แก้วขาว', 'Dr. Warin Kaewkhao', 'ศัลยกรรมช่องปาก', 'Oral Surgery', 19, 1),

-- จุฬา - จิตเวช (2 คน)
('นพ.วิศาล สงบใจ', 'Dr. Wisan Songbjai', 'จิตเวชทั่วไป', 'General Psychiatry', 20, 1),
('พญ.กานต์ธิดา รักสม', 'Dr. Kanthida Raksom', 'จิตเวชเด็ก', 'Child Psychiatry', 20, 1),

-- จุฬา - คลินิกส่องกล้อง (2 คน)
('นพ.อนันต์ พรทิพย์', 'Dr. Anan Pornthip', 'ส่องกล้องระบบทางเดินอาหาร', 'Gastrointestinal Endoscopy', 21, 1),
('พญ.ชลธิชา เลิศล้ำ', 'Dr. Chonticha Lertlam', 'ส่องกล้องวินิจฉัย', 'Diagnostic Endoscopy', 21, 1),

-- พหลโยธิน - อายุรกรรม (5 คน)
('นพ.ชัยวัฒน์ รุ่งโรจน์', 'Dr. Chaiwat Rungroj', 'อายุรกรรมทั่วไป', 'Internal Medicine', 10, 2),
('พญ.รัชดา สว่างกุล', 'Dr. Ratchada Sawangkul', 'โรคเบาหวาน', 'Diabetes', 10, 2),
('นพ.ปกรณ์ ศรีวัฒน์', 'Dr. Pakorn Sriwat', 'โรคความดัน', 'Hypertension', 10, 2),
('พญ.สุชาดา มีสุข', 'Dr. Suchada Meesuk', 'โรคไต', 'Nephrology', 10, 2),
('นพ.สันติ บุญยัง', 'Dr. Santi Boonyang', 'โรคหัวใจ', 'Cardiology', 10, 2),

-- พหลโยธิน - กุมารเวช (5 คน)
('พญ.พรรณี ใจดี', 'Dr. Pannee Jaidee', 'กุมารเวชทั่วไป', 'General Pediatrics', 15, 2),
('นพ.ธนวัฒน์ สุขสำราญ', 'Dr. Thanawat Suksumran', 'วัคซีนเด็ก', 'Pediatric Vaccination', 15, 2),
('พญ.วิลาสินี พรหมมา', 'Dr. Wilasinee Phromma', 'โภชนาการเด็ก', 'Pediatric Nutrition', 15, 2),
('นพ.เจษฎา วงษ์สุข', 'Dr. Jetsada Wongsuk', 'เด็กแรกเกิด', 'Neonatology', 15, 2),
('พญ.อารยา สุขเกษม', 'Dr. Araya Sukkasem', 'พัฒนาการเด็ก', 'Developmental Pediatrics', 15, 2),

-- พหลโยธิน - สุขภาพสตรี (4 คน)
('พญ.ศิริลักษณ์ รักษ์ดี', 'Dr. Sirilak Rakdee', 'สูติ-นรีเวชกรรม', 'Obstetrics & Gynecology', 1, 2),
('นพ.จิตติพัฒน์ สุดใจ', 'Dr. Jittipat Sudjai', 'ฝากครรภ์', 'Antenatal Care', 1, 2),
('พญ.อุษา ทองอินทร์', 'Dr. Usa Thong-in', 'คลอด', 'Delivery', 1, 2),
('พญ.ปิยนุช สมศรี', 'Dr. Piyanuch Somsri', 'วางแผนครอบครัว', 'Family Planning', 1, 2),

-- พหลโยธิน - หู คอ จมูก (4 คน)
('นพ.สุทธิพงษ์ สุขแสง', 'Dr. Sutthiphong Suksaeng', 'หู คอ จมูก', 'Otolaryngology', 16, 2),
('พญ.ณัฐณิชา วงษ์ทอง', 'Dr. Natnicha Wongthong', 'ไซนัส', 'Sinus Disorders', 16, 2),
('นพ.ภาณุพงศ์ สว่างศรี', 'Dr. Phanupong Sawangsri', 'หูตึงเด็ก', 'Pediatric Hearing Disorders', 16, 2),
('พญ.กมลวรรณ แจ่มใส', 'Dr. Kamonwan Jaemsai', 'เสียงและคอหอย', 'Voice & Laryngology', 16, 2),

-- พหลโยธิน - ผิวหนัง (3 คน)
('พญ.สุภาพร ชัยรัตน์', 'Dr. Supaporn Chairat', 'โรคผิวหนัง', 'Dermatology', 5, 2),
('นพ.ธนากร บุญเจริญ', 'Dr. Thanakorn Booncharoen', 'สิว', 'Acne Specialist', 5, 2),
('พญ.อรนุช สุขศรี', 'Dr. Oranuch Suksri', 'โรคผิวหนังแพ้', 'Allergic Skin Diseases', 5, 2),

-- พหลโยธิน - วัคซีน (3 คน)
('พญ.รติกร สุวรรณ', 'Dr. Ratikorn Suwan', 'วัคซีนเด็กและผู้ใหญ่', 'Vaccination (All Ages)', 17, 2),
('นพ.วิชัย ประดิษฐ์', 'Dr. Wichai Pradit', 'วัคซีนป้องกันโรค', 'Disease Prevention Vaccines', 17, 2),
('พญ.สุพิชชา ใจมั่น', 'Dr. Supicha Jaiman', 'ภูมิคุ้มกัน', 'Immunization', 17, 2),

-- พหลโยธิน - ส่งเสริมสุขภาพและอาชีวเวชศาสตร์ (3 คน)
('นพ.ศุภชัย สุขใส', 'Dr. Supachai Suksai', 'ตรวจสุขภาพทั่วไป', 'General Health Checkup', 18, 2),
('พญ.วราพร ทรงศรี', 'Dr. Waraporn Songsri', 'สุขภาพองค์กร', 'Corporate Health', 18, 2),
('นพ.กิตติ พงษ์ไพโรจน์', 'Dr. Kitti Phongpiroj', 'ตรวจสุขภาพก่อนทำงาน', 'Pre-employment Checkup', 18, 2);
