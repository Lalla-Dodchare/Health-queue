-- Insert Mock Doctors Data (V3 - Correct Schema!)
-- Branch 1 (จุฬา): 68 doctors across 21 departments
-- Branch 2 (พหลโยธิน): 27 doctors across 7 departments
-- Total: 95 doctors
--
-- Correct columns: contact_name, contact_email, phone, specialty, status, contact_type, branch_id, department_id
--

-- จุฬา - สุขภาพสตรี (4 คน)
INSERT INTO doctors (id, contact_name, contact_email, specialty, status, contact_type, department_id, branch_id) VALUES
(gen_random_uuid(), 'นพ.วิชัย สุขสันต์', 'wichai.suksan@hospital.com', 'สูติ-นรีเวชกรรม', 'active', 'direct', 1, 1),
(gen_random_uuid(), 'พญ.สุดา เจริญผล', 'suda.charoenphon@hospital.com', 'สูติ-นรีเวชกรรม', 'active', 'direct', 1, 1),
(gen_random_uuid(), 'นพ.ประสิทธิ์ ใจดี', 'prasit.jaidee@hospital.com', 'มะเร็งนรีเวช', 'active', 'direct', 1, 1),
(gen_random_uuid(), 'พญ.รัตนา สว่างใจ', 'rattana.sawangjai@hospital.com', 'เวชศาสตร์มารดาและทารกในครรภ์', 'active', 'direct', 1, 1),

-- จุฬา - ระบบทางเดินอาหารและตับ (3 คน)
(gen_random_uuid(), 'นพ.สมชาย พิทักษ์', 'somchai.pithak@hospital.com', 'โรคตับ', 'active', 'direct', 2, 1),
(gen_random_uuid(), 'พญ.อรุณี แก้วมณี', 'arunee.kaewmanee@hospital.com', 'โรคระบบทางเดินอาหาร', 'active', 'direct', 2, 1),
(gen_random_uuid(), 'นพ.เกรียงศักดิ์ วงศ์ไทย', 'kriangksak.wongthai@hospital.com', 'โรคตับและตับอ่อน', 'active', 'direct', 2, 1),

-- จุฬา - เบาหวานและต่อมไร้ท่อ (3 คน)
(gen_random_uuid(), 'พญ.นภา ศรีสุข', 'napa.srisuk@hospital.com', 'โรคเบาหวาน', 'active', 'direct', 3, 1),
(gen_random_uuid(), 'นพ.สุรศักดิ์ ทองดี', 'surasak.thongdee@hospital.com', 'ต่อมไร้ท่อ', 'active', 'direct', 3, 1),
(gen_random_uuid(), 'พญ.วิภา แสงทอง', 'wipha.saengthong@hospital.com', 'โรคต่อมไทรอยด์', 'active', 'direct', 3, 1),

-- จุฬา - โรคระบบทางเดินปัสสาวะ (3 คน)
(gen_random_uuid(), 'นพ.ธนา ศรีประจันต์', 'thana.sriprachan@hospital.com', 'โรคไต', 'active', 'direct', 4, 1),
(gen_random_uuid(), 'พญ.สุภาพร สุวรรณ', 'supaporn.suwan@hospital.com', 'ไตวาย', 'active', 'direct', 4, 1),
(gen_random_uuid(), 'นพ.อนุชา ปานกลาง', 'anucha.panklang@hospital.com', 'ศัลยกรรมทางเดินปัสสาวะ', 'active', 'direct', 4, 1),

-- จุฬา - ผิวหนัง (3 คน)
(gen_random_uuid(), 'พญ.ชนิดา ใจงาม', 'chanida.jaingam@hospital.com', 'โรคผิวหนัง', 'active', 'direct', 5, 1),
(gen_random_uuid(), 'นพ.รัชพล วัฒนา', 'ratchaphon.watthana@hospital.com', 'ผิวหนังเด็ก', 'active', 'direct', 5, 1),
(gen_random_uuid(), 'พญ.มณีรัตน์ สุขใส', 'maneerat.suksai@hospital.com', 'ความงามผิวหนัง', 'active', 'direct', 5, 1),

-- จุฬา - โรคระบบทางเดินหายใจ (3 คน)
(gen_random_uuid(), 'นพ.สมศักดิ์ ใจหาญ', 'somsak.jaihan@hospital.com', 'โรคปอด', 'active', 'direct', 6, 1),
(gen_random_uuid(), 'พญ.ประภา เพ็ชรดี', 'prapha.phetdee@hospital.com', 'หอบหืด', 'active', 'direct', 6, 1),
(gen_random_uuid(), 'นพ.วีระ มั่นคง', 'weera.mankhong@hospital.com', 'ระบบหายใจวิกฤต', 'active', 'direct', 6, 1),

-- จุฬา - กระดูกและข้อ (4 คน)
(gen_random_uuid(), 'นพ.ชัยยา กล้าหาญ', 'chaiya.klahan@hospital.com', 'ศัลยกรรมกระดูก', 'active', 'direct', 7, 1),
(gen_random_uuid(), 'พญ.สุนิสา ทรงพล', 'sunisa.songphon@hospital.com', 'โรคข้อ', 'active', 'direct', 7, 1),
(gen_random_uuid(), 'นพ.ธีระ ศรีทอง', 'theera.srithong@hospital.com', 'กระดูกสันหลัง', 'active', 'direct', 7, 1),
(gen_random_uuid(), 'พญ.อัญชลี บุญมี', 'anchalee.boonmee@hospital.com', 'กายภาพบำบัดกระดูก', 'active', 'direct', 7, 1),

-- จุฬา - รังสีวินิจฉัย X-Ray (2 คน)
(gen_random_uuid(), 'นพ.ปิยะ สุขสม', 'piya.suksom@hospital.com', 'รังสีวิทยา', 'active', 'direct', 8, 1),
(gen_random_uuid(), 'พญ.นันทนา วิมล', 'nanthana.wimon@hospital.com', 'รังสีวินิจฉัย', 'active', 'direct', 8, 1),

-- จุฬา - ศัลยกรรม (5 คน)
(gen_random_uuid(), 'นพ.วิทยา ชัยศรี', 'witthaya.chaisri@hospital.com', 'ศัลยกรรมทั่วไป', 'active', 'direct', 9, 1),
(gen_random_uuid(), 'พญ.สุพัตรา กมลพันธ์', 'supatra.kamonphan@hospital.com', 'ศัลยกรรมตกแต่ง', 'active', 'direct', 9, 1),
(gen_random_uuid(), 'นพ.ประพันธ์ มีชัย', 'praphan.meechai@hospital.com', 'ศัลยกรรมหลอดเลือด', 'active', 'direct', 9, 1),
(gen_random_uuid(), 'นพ.สุเมธ บุญล้อม', 'sumet.boonlom@hospital.com', 'ศัลยกรรมอุบัติเหตุ', 'active', 'direct', 9, 1),
(gen_random_uuid(), 'พญ.อัมพร สายสุด', 'amporn.saisut@hospital.com', 'ศัลยกรรมมะเร็ง', 'active', 'direct', 9, 1),

-- จุฬา - อายุรกรรม (5 คน)
(gen_random_uuid(), 'นพ.สมบูรณ์ ทองคำ', 'somboon.thongkham@hospital.com', 'อายุรกรรมทั่วไป', 'active', 'direct', 10, 1),
(gen_random_uuid(), 'พญ.จุฬาลักษณ์ ศิริ', 'chulalak.siri@hospital.com', 'โรคติดเชื้อ', 'active', 'direct', 10, 1),
(gen_random_uuid(), 'นพ.ธนพล รุ่งเรือง', 'thanaphon.rungrueng@hospital.com', 'ผู้สูงอายุ', 'active', 'direct', 10, 1),
(gen_random_uuid(), 'พญ.ศิริพร แสงดาว', 'siriporn.saengdao@hospital.com', 'โรคภูมิแพ้', 'active', 'direct', 10, 1),
(gen_random_uuid(), 'นพ.กิตติ ใจกล้า', 'kitti.jaiklang@hospital.com', 'โรคเลือด', 'active', 'direct', 10, 1),

-- จุฬา - ตา (3 คน)
(gen_random_uuid(), 'นพ.วสันต์ เจริญ', 'wasan.charoen@hospital.com', 'จักษุวิทยา', 'active', 'direct', 11, 1),
(gen_random_uuid(), 'พญ.กนกวรรณ สว่าง', 'kanokwan.sawang@hospital.com', 'ตาต้อหิน', 'active', 'direct', 11, 1),
(gen_random_uuid(), 'นพ.ปรีชา แก้วใส', 'preecha.kaewsai@hospital.com', 'จอประสาทตา', 'active', 'direct', 11, 1),

-- จุฬา - หัวใจ (4 คน)
(gen_random_uuid(), 'นพ.ธนกร ใจซื่อ', 'thanakorn.jaisue@hospital.com', 'โรคหัวใจ', 'active', 'direct', 12, 1),
(gen_random_uuid(), 'พญ.สุดารัตน์ พรหม', 'sudarat.phrom@hospital.com', 'หัวใจเต้นผิดจังหวะ', 'active', 'direct', 12, 1),
(gen_random_uuid(), 'นพ.พิชิต วงษ์ใหญ่', 'pichit.wongyai@hospital.com', 'สวนหัวใจ', 'active', 'direct', 12, 1),
(gen_random_uuid(), 'พญ.ปราณี สุขสวัสดิ์', 'pranee.suksawat@hospital.com', 'ศัลยกรรมหัวใจ', 'active', 'direct', 12, 1),

-- จุฬา - โรคระบบประสาทและสมอง (3 คน)
(gen_random_uuid(), 'นพ.ชาญชัย สติกุล', 'chanchai.satikul@hospital.com', 'โรคระบบประสาท', 'active', 'direct', 13, 1),
(gen_random_uuid(), 'พญ.วิไลพร ชัยมงคล', 'wilaiporn.chaimongkol@hospital.com', 'โรคหลอดเลือดสมอง', 'active', 'direct', 13, 1),
(gen_random_uuid(), 'นพ.อดิศักดิ์ สุขใส', 'adisak.suksai@hospital.com', 'ศัลยกรรมสมอง', 'active', 'direct', 13, 1),

-- จุฬา - เวชศาสตร์ฟื้นฟูและกายภาพบำบัด (2 คน)
(gen_random_uuid(), 'พญ.รัชนี พัฒนา', 'ratchanee.patthana@hospital.com', 'เวชศาสตร์ฟื้นฟู', 'active', 'direct', 14, 1),
(gen_random_uuid(), 'นพ.สุชาติ เข็มทอง', 'suchat.khemthong@hospital.com', 'กายภาพบำบัด', 'active', 'direct', 14, 1),

-- จุฬา - กุมารเวช (4 คน)
(gen_random_uuid(), 'พญ.วิภาดา อ่อนละมุน', 'vipada.onlamoon@hospital.com', 'กุมารเวชทั่วไป', 'active', 'direct', 15, 1),
(gen_random_uuid(), 'นพ.ณัฐพล มงคล', 'nattaphon.mongkhon@hospital.com', 'เด็กแรกเกิด', 'active', 'direct', 15, 1),
(gen_random_uuid(), 'พญ.สุภาวดี สิริวัฒน์', 'supawadee.siriwat@hospital.com', 'ระบบทางเดินหายใจเด็ก', 'active', 'direct', 15, 1),
(gen_random_uuid(), 'นพ.ไกรสร สุขสันต์', 'kraisorn.suksan@hospital.com', 'โรคหัวใจเด็ก', 'active', 'direct', 15, 1),

-- จุฬา - หู คอ จมูก (3 คน)
(gen_random_uuid(), 'นพ.ณรงค์ศักดิ์ ศรีสุข', 'narongsak.srisuk@hospital.com', 'หู คอ จมูก', 'active', 'direct', 16, 1),
(gen_random_uuid(), 'พญ.พิมพ์ชนก ประดิษฐ์', 'pimchanok.pradit@hospital.com', 'หูตึง', 'active', 'direct', 16, 1),
(gen_random_uuid(), 'นพ.ชยพล วงศ์ษา', 'chayaphon.wongsa@hospital.com', 'ศัลยกรรมหูคอจมูก', 'active', 'direct', 16, 1),

-- จุฬา - วัคซีน (2 คน)
(gen_random_uuid(), 'พญ.อรทัย พูนสุข', 'orathai.poonsuk@hospital.com', 'วัคซีนและภูมิคุ้มกัน', 'active', 'direct', 17, 1),
(gen_random_uuid(), 'นพ.ประยุทธ จรัสกุล', 'prayut.charaskul@hospital.com', 'โรคติดต่อและวัคซีน', 'active', 'direct', 17, 1),

-- จุฬา - ส่งเสริมสุขภาพและอาชีวเวชศาสตร์ (2 คน)
(gen_random_uuid(), 'พญ.สุมาลี จิตต์งาม', 'sumalee.jitngam@hospital.com', 'เวชศาสตร์ป้องกัน', 'active', 'direct', 18, 1),
(gen_random_uuid(), 'นพ.ธีรพงศ์ สุขศรี', 'theerapong.suksri@hospital.com', 'อาชีวเวชศาสตร์', 'active', 'direct', 18, 1),

-- จุฬา - ทันตกรรม (3 คน)
(gen_random_uuid(), 'ทพ.สมพร ทันใจ', 'somporn.thanjai@hospital.com', 'ทันตกรรมทั่วไป', 'active', 'direct', 19, 1),
(gen_random_uuid(), 'ทพญ.นิภา ยิ้มสด', 'nipha.yimsod@hospital.com', 'ทันตกรรมจัดฟัน', 'active', 'direct', 19, 1),
(gen_random_uuid(), 'ทพ.วรินทร์ แก้วขาว', 'warin.kaewkhao@hospital.com', 'ศัลยกรรมช่องปาก', 'active', 'direct', 19, 1),

-- จุฬา - จิตเวช (2 คน)
(gen_random_uuid(), 'นพ.วิศาล สงบใจ', 'wisan.songbjai@hospital.com', 'จิตเวชทั่วไป', 'active', 'direct', 20, 1),
(gen_random_uuid(), 'พญ.กานต์ธิดา รักสม', 'kanthida.raksom@hospital.com', 'จิตเวชเด็ก', 'active', 'direct', 20, 1),

-- จุฬา - คลินิกส่องกล้อง (2 คน)
(gen_random_uuid(), 'นพ.อนันต์ พรทิพย์', 'anan.pornthip@hospital.com', 'ส่องกล้องระบบทางเดินอาหาร', 'active', 'direct', 21, 1),
(gen_random_uuid(), 'พญ.ชลธิชา เลิศล้ำ', 'chonticha.lertlam@hospital.com', 'ส่องกล้องวินิจฉัย', 'active', 'direct', 21, 1),

-- พหลโยธิน - อายุรกรรม (5 คน)
(gen_random_uuid(), 'นพ.ชัยวัฒน์ รุ่งโรจน์', 'chaiwat.rungroj@hospital.com', 'อายุรกรรมทั่วไป', 'active', 'direct', 10, 2),
(gen_random_uuid(), 'พญ.รัชดา สว่างกุล', 'ratchada.sawangkul@hospital.com', 'โรคเบาหวาน', 'active', 'direct', 10, 2),
(gen_random_uuid(), 'นพ.ปกรณ์ ศรีวัฒน์', 'pakorn.sriwat@hospital.com', 'โรคความดัน', 'active', 'direct', 10, 2),
(gen_random_uuid(), 'พญ.สุชาดา มีสุข', 'suchada.meesuk@hospital.com', 'โรคไต', 'active', 'direct', 10, 2),
(gen_random_uuid(), 'นพ.สันติ บุญยัง', 'santi.boonyang@hospital.com', 'โรคหัวใจ', 'active', 'direct', 10, 2),

-- พหลโยธิน - กุมารเวช (5 คน)
(gen_random_uuid(), 'พญ.พรรณี ใจดี', 'pannee.jaidee@hospital.com', 'กุมารเวชทั่วไป', 'active', 'direct', 15, 2),
(gen_random_uuid(), 'นพ.ธนวัฒน์ สุขสำราญ', 'thanawat.suksumran@hospital.com', 'วัคซีนเด็ก', 'active', 'direct', 15, 2),
(gen_random_uuid(), 'พญ.วิลาสินี พรหมมา', 'wilasinee.phromma@hospital.com', 'โภชนาการเด็ก', 'active', 'direct', 15, 2),
(gen_random_uuid(), 'นพ.เจษฎา วงษ์สุข', 'jetsada.wongsuk@hospital.com', 'เด็กแรกเกิด', 'active', 'direct', 15, 2),
(gen_random_uuid(), 'พญ.อารยา สุขเกษม', 'araya.sukkasem@hospital.com', 'พัฒนาการเด็ก', 'active', 'direct', 15, 2),

-- พหลโยธิน - สุขภาพสตรี (4 คน)
(gen_random_uuid(), 'พญ.ศิริลักษณ์ รักษ์ดี', 'sirilak.rakdee@hospital.com', 'สูติ-นรีเวชกรรม', 'active', 'direct', 1, 2),
(gen_random_uuid(), 'นพ.จิตติพัฒน์ สุดใจ', 'jittipat.sudjai@hospital.com', 'ฝากครรภ์', 'active', 'direct', 1, 2),
(gen_random_uuid(), 'พญ.อุษา ทองอินทร์', 'usa.thong-in@hospital.com', 'คลอด', 'active', 'direct', 1, 2),
(gen_random_uuid(), 'พญ.ปิยนุช สมศรี', 'piyanuch.somsri@hospital.com', 'วางแผนครอบครัว', 'active', 'direct', 1, 2),

-- พหลโยธิน - หู คอ จมูก (4 คน)
(gen_random_uuid(), 'นพ.สุทธิพงษ์ สุขแสง', 'sutthiphong.suksaeng@hospital.com', 'หู คอ จมูก', 'active', 'direct', 16, 2),
(gen_random_uuid(), 'พญ.ณัฐณิชา วงษ์ทอง', 'natnicha.wongthong@hospital.com', 'ไซนัส', 'active', 'direct', 16, 2),
(gen_random_uuid(), 'นพ.ภาณุพงศ์ สว่างศรี', 'phanupong.sawangsri@hospital.com', 'หูตึงเด็ก', 'active', 'direct', 16, 2),
(gen_random_uuid(), 'พญ.กมลวรรณ แจ่มใส', 'kamonwan.jaemsai@hospital.com', 'เสียงและคอหอย', 'active', 'direct', 16, 2),

-- พหลโยธิน - ผิวหนัง (3 คน)
(gen_random_uuid(), 'พญ.สุภาพร ชัยรัตน์', 'supaporn.chairat@hospital.com', 'โรคผิวหนัง', 'active', 'direct', 5, 2),
(gen_random_uuid(), 'นพ.ธนากร บุญเจริญ', 'thanakorn.booncharoen@hospital.com', 'สิว', 'active', 'direct', 5, 2),
(gen_random_uuid(), 'พญ.อรนุช สุขศรี', 'oranuch.suksri@hospital.com', 'โรคผิวหนังแพ้', 'active', 'direct', 5, 2),

-- พหลโยธิน - วัคซีน (3 คน)
(gen_random_uuid(), 'พญ.รติกร สุวรรณ', 'ratikorn.suwan@hospital.com', 'วัคซีนเด็กและผู้ใหญ่', 'active', 'direct', 17, 2),
(gen_random_uuid(), 'นพ.วิชัย ประดิษฐ์', 'wichai.pradit@hospital.com', 'วัคซีนป้องกันโรค', 'active', 'direct', 17, 2),
(gen_random_uuid(), 'พญ.สุพิชชา ใจมั่น', 'supicha.jaiman@hospital.com', 'ภูมิคุ้มกัน', 'active', 'direct', 17, 2),

-- พหลโยธิน - ส่งเสริมสุขภาพและอาชีวเวชศาสตร์ (3 คน)
(gen_random_uuid(), 'นพ.ศุภชัย สุขใส', 'supachai.suksai@hospital.com', 'ตรวจสุขภาพทั่วไป', 'active', 'direct', 18, 2),
(gen_random_uuid(), 'พญ.วราพร ทรงศรี', 'waraporn.songsri@hospital.com', 'สุขภาพองค์กร', 'active', 'direct', 18, 2),
(gen_random_uuid(), 'นพ.กิตติ พงษ์ไพโรจน์', 'kitti.phongpiroj@hospital.com', 'ตรวจสุขภาพก่อนทำงาน', 'active', 'direct', 18, 2);
