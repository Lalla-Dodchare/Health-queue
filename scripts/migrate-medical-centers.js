/**
 * Medical Centers Data
 * Contains all 21 medical centers with Thai and English translations
 */

const medicalCentersData = {
  th: [
    {
      departmentId: 10,
      name: 'อายุรกรรม',
      nameEn: 'Internal Medicine',
      icon: 'User',
      color: 'purple',
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์อายุรกรรมให้บริการตรวจวินิจฉัยและรักษาโรคทั่วไปและโรคเฉพาะทางในผู้ใหญ่อย่างครบวงจร ด้วยทีมอายุรแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์และความชำนาญในหลากหลายสาขา พร้อมเครื่องมือตรวจวินิจฉัยที่ทันสมัยและห้องปฏิบัติการที่ได้มาตรฐาน เรามุ่งเน้นการดูแลผู้ป่วยแบบองค์รวม ทั้งการรักษาโรคเฉียบพลัน การดูแลโรคเรื้อรัง และการป้องกันโรค เพื่อให้ผู้ป่วยมีสุขภาพที่ดีและสามารถใช้ชีวิตได้อย่างมีคุณภาพ',
      services: [
        'ตรวจรักษาโรคทั่วไป โรคไข้หวัดใหญ่ โรคติดเชื้อต่างๆ และโรคเฉียบพลัน',
        'รักษาและดูแลโรคเรื้อรัง เช่น โรคเบาหวาน ความดันโลหิตสูง ไขมันในเลือดสูง',
        'รักษาโรคติดเชื้อ โรคไข้เลือดออก และโรคติดเชื้อทางเดินหายใจ',
        'ตรวจสุขภาพประจำปี ตรวจคัดกรองโรค และประเมินความเสี่ยงโรคต่างๆ',
        'คำปรึกษาการดูแลสุขภาพผู้สูงอายุ โภชนาการ และการออกกำลังกายที่เหมาะสม'
      ]
    },
    {
      departmentId: 15,
      name: 'กุมารเวช',
      nameEn: 'Pediatrics',
      icon: 'Baby',
      color: 'blue',
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์กุมารเวชให้บริการดูแลสุขภาพเด็กอย่างครบวงจร ตั้งแต่แรกเกิดจนถึงวัยรุ่น ด้วยทีมกุมารแพทย์ที่มีความเชี่ยวชาญเฉพาะทางและพยาบาลที่มีประสบการณ์ในการดูแลเด็ก เรามีห้องตรวจที่ออกแบบมาเป็นพิเศษให้เด็กรู้สึกสบายใจและไม่กลัว พร้อมอุปกรณ์ทางการแพทย์ที่เหมาะสำหรับเด็กโดยเฉพาะ เรามุ่งเน้นการป้องกันโรค การส่งเสริมพัฒนาการ และการรักษาโรคในเด็ก',
      services: [
        'ตรวจสุขภาพเด็กทั่วไป ตรวจคัดกรองโรคแทรกซ้อนในทารกแรกเกิด และตรวจสุขภาพก่อนเข้าเรียน',
        'ฉีดวัคซีนป้องกันโรคตามตารางมาตรฐาน และวัคซีนเสริมสำหรับเด็กทุกช่วงวัย',
        'ติดตามและประเมินพัฒนาการเด็ก ตรวจคัดกรองความล่าช้าทางพัฒนาการ',
        'รักษาโรคเด็กทั่วไป โรคติดเชื้อ โรคภูมิแพ้ และโรคเฉพาะทางในเด็ก',
        'คำปรึกษาการเลี้ยงดูบุตร โภชนาการสำหรับเด็ก และปัญหาพฤติกรรมเด็ก'
      ]
    },
    {
      departmentId: 1,
      name: 'สุขภาพสตรี',
      nameEn: "Women's Health Center",
      icon: 'Heart',
      color: 'pink',
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์สุขภาพสตรีให้บริการตรวจรักษาโรคเฉพาะทางสตรีอย่างครบวงจร ด้วยแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์และเครื่องมือทางการแพทย์ที่ทันสมัย พร้อมดูแลสุขภาพผู้หญิงทุกช่วงวัย ตั้งแต่วัยรุ่น วัยทำงาน ไปจนถึงวัยทอง ด้วยความเอาใจใส่และความเป็นส่วนตัว เรามุ่งเน้นการป้องกันและรักษาโรคด้วยเทคโนโลยีล้ำสมัย',
      services: [
        'ตรวจสุขภาพสตรีทั่วไป และตรวจคัดกรองโรคต่างๆ',
        'ฝากครรภ์และดูแลหลังคลอด พร้อมคำปรึกษาการเลี้ยงลูกด้วยนมแม่',
        'ตรวจคัดกรองมะเร็งเต้านมและมะเร็งปากมดลูก ด้วยเครื่องมือทันสมัย',
        'รักษาโรคประจำเดือน ภาวะฮอร์โมนผิดปกติ และโรคเกี่ยวกับระบบสืบพันธุ์',
        'การวางแผนครอบครัว คำปรึกษาการคุมกำเนิด และดูแลสุขภาพก่อนตั้งครรภ์'
      ]
    },
    {
      departmentId: 16,
      name: 'หู คอ จมูก',
      nameEn: 'ENT (Ear, Nose & Throat)',
      icon: 'Ear',
      color: 'orange',
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์หู คอ จมูก ให้บริการตรวจวินิจฉัยและรักษาโรคหู คอ จมูก และระบบหายใจส่วนต้นอย่างครบวงจร ด้วยทีมแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์ พร้อมเครื่องมือตรวจและรักษาที่ทันสมัย เช่น กล้องส่องจมูก กล้องส่องหู และเครื่องตรวจการได้ยิน เรามุ่งเน้นการรักษาที่มีประสิทธิภาพและปลอดภัย',
      services: [
        'ตรวจและรักษาโรคหูอักเสบ หูน้ำหนวก ฟังไม่ชัด และโรคเกี่ยวกับการได้ยิน',
        'รักษาโรคจมูกอักเสบ ไซนัสอักเสบ โพลีปจมูก และโรคภูมิแพ้จมูก',
        'รักษาโรคคออักเสบ ต่อมทอนซิลอักเสบ และต่อมลูกระโห่งโต',
        'ตรวจและรักษาอาการนอนกรน ภาวะหยุดหายใจขณะหลับ',
        'ผ่าตัดและรักษาโรคเกี่ยวกับหู คอ จมูก ด้วยเทคนิคที่ทันสมัย'
      ]
    },
    {
      departmentId: 5,
      name: 'ผิวหนัง',
      nameEn: 'Dermatology',
      icon: 'Sparkles',
      color: 'teal',
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์ผิวหนังให้บริการตรวจวินิจฉัยและรักษาโรคผิวหนังทุกชนิด ด้วยแพทย์ผิวหนังผู้เชี่ยวชาญและเครื่องมือทางการแพทย์ที่ทันสมัย รวมถึงเทคโนโลยีเลเซอร์และการรักษาเพื่อความงาม เรามุ่งเน้นการดูแลผิวพรรณให้สุขภาพดี รักษาโรคผิวหนังอย่างมีประสิทธิภาพ และให้คำปรึกษาการดูแลผิวที่เหมาะสมกับแต่ละบุคคล',
      services: [
        'ตรวจและรักษาโรคผิวหนังทุกชนิด เช่น สิว ผื่นภูมิแพ้ โรคผิวหนังติดเชื้อ',
        'รักษาโรคเชื้อราผิวหนัง โรคกลาก และโรคผิวหนังเรื้อรัง',
        'ตรวจคัดกรองและรักษาโรคมะเร็งผิวหนัง ไฝที่ผิดปกติ',
        'การรักษาเพื่อความงาม เช่น รักษารอยแผลเป็น รอยดำ ฝ้า กระ',
        'เลเซอร์รักษาโรคผิวหนัง ลดริ้วรอย และฉีดโบท็อกซ์ ฟิลเลอร์'
      ]
    },
    {
      departmentId: 17,
      name: 'วัคซีน',
      nameEn: 'Vaccination Center',
      icon: 'Syringe',
      color: 'indigo',
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์วัคซีนเป็นศูนย์บริการฉีดวัคซีนป้องกันโรคที่ครบครันที่สุด มีวัคซีนคุณภาพสูงจากบริษัทชั้นนำทั้งในและต่างประเทศ เก็บรักษาในระบบ Cold Chain ที่ได้มาตรฐาน พร้อมทีมแพทย์และพยาบาลที่มีความเชี่ยวชาญด้านวัคซีนวิทยา เรามุ่งเน้นการให้บริการฉีดวัคซีนที่ปลอดภัย ได้มาตรฐาน และมีประสิทธิภาพสูง',
      services: [
        'วัคซีนสำหรับเด็กตามตารางมาตรฐานกระทรวงสาธารณสุข และวัคซีนเสริมคุณภาพสูง',
        'วัคซีนสำหรับผู้ใหญ่และผู้สูงอายุ เช่น วัคซีนไข้หวัดใหญ่ ปอดบวม และงูสวัด',
        'วัคซีนป้องกันโรคติดเชื้อต่างๆ เช่น วัคซีนไวรัสตับอักเสบ HPV และวัคซีน COVID-19',
        'วัคซีนก่อนเดินทางต่างประเทศ ตามประเทศปลายทาง และคำปรึกษาการป้องกันโรค',
        'คำปรึกษาเรื่องวัคซีน ตารางการฉีดวัคซีน และติดตามผลหลังฉีดวัคซีน'
      ]
    },
    {
      departmentId: 18,
      name: 'ส่งเสริมสุขภาพและอาชีวเวชศาสตร์',
      nameEn: 'Occupational Health',
      icon: 'Activity',
      color: 'lime',
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์ส่งเสริมสุขภาพและอาชีวเวชศาสตร์ให้บริการตรวจสุขภาพเชิงป้องกัน การส่งเสริมสุขภาพ และการดูแลสุขภาพในสถานประกอบการ ด้วยทีมแพทย์และบุคลากรทางการแพทย์ที่มีความเชี่ยวชาญ เรามุ่งเน้นการตรวจสุขภาพประจำปี การประเมินความเสี่ยงโรค และการให้คำปรึกษาด้านสุขภาพเพื่อป้องกันโรค',
      services: [
        'ตรวจสุขภาพประจำปีสำหรับบุคคลทั่วไปและพนักงานองค์กร',
        'ตรวจสุขภาพเพื่อขอใบอนุญาต ใบรับรอง และตรวจสุขภาพตามกฎหมาย',
        'ตรวจคัดกรองโรคเบาหวาน ความดันโลหิตสูง ไขมันในเลือดสูง และโรคเรื้อรัง',
        'ประเมินความเสี่ยงด้านสุขภาพและให้คำปรึกษาการดูแลสุขภาพเชิงป้องกัน',
        'บริการตรวจสุขภาพสำหรับผู้สูงอายุ และโปรแกรมส่งเสริมสุขภาพเฉพาะบุคคล'
      ]
    },
    {
      departmentId: 7,
      name: 'กระดูกและข้อ',
      nameEn: 'Orthopedics',
      icon: 'Bone',
      color: 'slate',
      hasBranches: false,
      description: 'ศูนย์กระดูกและข้อให้บริการตรวจวินิจฉัยและรักษาโรคกระดูก ข้อ กล้ามเนื้อ และเอ็น อย่างครบวงจร ด้วยทีมแพทย์ออร์โธปิดิกส์ผู้เชี่ยวชาญ พร้อมเครื่องมือทันสมัย เช่น เครื่อง X-ray ดิจิตอล เครื่อง MRI และห้องผ่าตัดมาตรฐานสากล เรามุ่งเน้นการรักษาที่มีประสิทธิภาพและการฟื้นฟูสมรรถภาพหลังการรักษา',
      services: [
        'ตรวจและรักษาโรคข้อเสื่อม ข้ออักเสบ ปวดหลัง ปวดคอ และโรคกระดูกพรุน',
        'รักษาการบาดเจ็บจากอุบัติเหตุ กระดูกหัก เอ็นฉีก และข้อเคลื่อน',
        'ผ่าตัดเปลี่ยนข้อเข่า ข้อสะโพก และผ่าตัดกระดูกสันหลัง',
        'ตรวจและรักษาโรคกระดูกในเด็ก การเจริญเติบโตของกระดูกที่ผิดปกติ',
        'ฟื้นฟูสมรรถภาพทางกระดูกและข้อ กายภาพบำบัด และโปรแกรมออกกำลังกาย'
      ]
    },
    {
      departmentId: 21,
      name: 'คลินิกส่องกล้อง',
      nameEn: 'Endoscopy Center',
      icon: 'Camera',
      color: 'sky',
      hasBranches: false,
      description: 'คลินิกส่องกล้องให้บริการตรวจส่องกล้องทางเดินอาหาร ทั้งส่วนบนและส่วนล่าง ด้วยแพทย์ผู้เชี่ยวชาญและกล้องส่องที่ทันสมัย มีความคมชัดสูง เรามุ่งเน้นการตรวจหาโรคในระยะเริ่มต้น การวินิจฉัยที่แม่นยำ และการรักษาด้วยกล้องส่องที่ปลอดภัย มีมาตรฐาน พร้อมดูแลความสะดวกสบายของผู้ป่วยอย่างดีที่สุด',
      services: [
        'ตรวจส่องกล้องกระเพาะอาหารและหลอดอาหาร (Gastroscopy) เพื่อวินิจฉัยและรักษา',
        'ตรวจส่องกล้องลำไส้ใหญ่ (Colonoscopy) เพื่อตรวจคัดกรองมะเร็งลำไส้',
        'ตรวจส่องกล้องและตัดติ่งเนื้อ เก็บชิ้นเนื้อเพื่อส่งตรวจทางพยาธิวิทยา',
        'รักษาเส้นเลือดขอดในหลอดอาหาร แผลในกระเพาะ ด้วยวิธีส่องกล้อง',
        'ให้คำปรึกษาการเตรียมตัวก่อนส่องกล้องและการดูแลหลังการตรวจ'
      ]
    },
    {
      departmentId: 20,
      name: 'จิตเวช',
      nameEn: 'Psychiatry',
      icon: 'Brain',
      color: 'violet',
      hasBranches: false,
      description: 'ศูนย์จิตเวชให้บริการตรวจวินิจฉัยและรักษาโรคทางจิตเวชและปัญหาสุขภาพจิต ด้วยทีมจิตแพทย์และนักจิตวิทยาคลินิกผู้เชี่ยวชาญ ในบรรยากาศที่เป็นส่วนตัวและปลอดภัย เรามุ่งเน้นการรักษาแบบองค์รวม ทั้งด้านการให้ยา การพูดคุยบำบัด และการปรับเปลี่ยนพฤติกรรม เพื่อให้ผู้ป่วยมีสุขภาพจิตที่ดีและสามารถใช้ชีวิตได้อย่างมีความสุข',
      services: [
        'ตรวจและรักษาโรคซึมเศร้า โรควิตกกังวล และโรคเครียด',
        'รักษาโรคจิตเภท โรคสองขั้ว และโรคทางจิตเวชเรื้อรัง',
        'ให้คำปรึกษาปัญหาทางจิตใจ ความสัมพันธ์ และการปรับตัว',
        'รักษาภาวะนอนไม่หลับ การติดสุรา สารเสพติด และพฤติกรรมเสพติด',
        'จิตบำบัดและให้คำปรึกษาเชิงจิตวิทยา พัฒนาศักยภาพและคุณภาพชีวิต'
      ]
    },
    {
      departmentId: 11,
      name: 'ตา',
      nameEn: 'Ophthalmology',
      icon: 'Eye',
      color: 'cyan',
      hasBranches: false,
      description: 'ศูนย์ตาเป็นศูนย์รักษาโรคตาที่ครบครันที่สุด มีจักษุแพทย์ผู้เชี่ยวชาญที่ได้รับการอบรมเฉพาะทางด้านต่างๆ พร้อมเครื่องมือและอุปกรณ์ทางการแพทย์ที่ทันสมัยที่สุด เช่น เครื่องตรวจจอประสาทตาด้วยคอมพิวเตอร์ เครื่อง OCT และห้องผ่าตัดที่ได้มาตรฐานสากล เรามุ่งมั่นที่จะดูแลสุขภาพดวงตาของคุณให้มีสายตาที่ดี',
      services: [
        'ตรวจวัดสายตา ตรวจหักเหแสง และจ่ายแว่นสายตาที่เหมาะสม',
        'รักษาโรคต้อหิน ต้อกระจก และโรคจอประสาทตาเสื่อม',
        'ผ่าตัดต้อกระจก ต้อหิน กล้ามเนื้อตา และผ่าตัดเลเซอร์แก้ไขสายตา',
        'ตรวจจอประสาทตาด้วย OCT สำหรับผู้ป่วยเบาหวานและความดันโลหิตสูง',
        'รักษาโรคตาในเด็ก โรคตาแดง ตาแห้ง และโรคตาต่างๆ ในผู้ใหญ่และผู้สูงอายุ'
      ]
    },
    {
      departmentId: 19,
      name: 'ทันตกรรม',
      nameEn: 'Dentistry',
      icon: 'Smile',
      color: 'green',
      hasBranches: false,
      description: 'ศูนย์ทันตกรรมให้บริการดูแลสุขภาพช่องปากและฟันอย่างครบวงจร ด้วยทันตแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์และทักษะสูง พร้อมด้วยเทคโนโลยีทางทันตกรรมที่ทันสมัย เช่น เครื่อง X-ray แบบดิจิตอล กล้องภายในปาก และเครื่องมือผ่าตัดที่ได้มาตรฐานสากล เรามุ่งเน้นการดูแลรักษาที่ไม่เจ็บปวด สะอาด ปลอดภัย',
      services: [
        'ตรวจสุขภาพช่องปากและฟัน ขูดหินปูน และทำความสะอาดฟันเป็นระยะ',
        'อุดฟันด้วยวัสดุคุณภาพสูง ถอนฟัน รักษารากฟัน และผ่าตัดช่องปากเล็กน้อย',
        'ทำฟันปลอมแบบต่างๆ รากฟันเทียมระบบดิจิตอล และบริดจ์ฟันที่สวยงาม',
        'จัดฟันด้วยเทคโนโลยีทันสมัย ทั้งจัดฟันแบบใส และแบบธรรมดา',
        'ฟอกสีฟันแบบมืออาชีพ ติดเพชรที่ฟัน และทำ Veneer เพื่อรอยยิ้มที่สวยงาม'
      ]
    },
    {
      departmentId: 3,
      name: 'เบาหวานและต่อมไร้ท่อ',
      nameEn: 'Endocrinology & Diabetes',
      icon: 'Pill',
      color: 'rose',
      hasBranches: false,
      description: 'ศูนย์เบาหวานและต่อมไร้ท่อให้บริการตรวจวินิจฉัยและรักษาโรคเบาหวาน โรคต่อมไร้ท่อ และความผิดปกติของฮอร์โมนอย่างครบวงจร ด้วยทีมแพทย์ผู้เชี่ยวชาญด้านต่อมไร้ท่อและเบาหวาน พร้อมนักโภชนาการและพยาบาลผู้ชำนาญการ เรามุ่งเน้นการควบคุมระดับน้ำตาลในเลือด การป้องกันภาวะแทรกซ้อน และการดูแลแบบองค์รวม',
      services: [
        'ตรวจและรักษาโรคเบาหวานทุกประเภท ควบคุมระดับน้ำตาลในเลือด',
        'รักษาโรคต่อมไทรอยด์ โรคต่อมหมวกไต และโรคต่อมไร้ท่ออื่นๆ',
        'รักษาภาวะฮอร์โมนผิดปกติ โรคอ้วน และภาวะเมตาบอลิซึมผิดปกติ',
        'ตรวจคัดกรองภาวะแทรกซ้อนจากโรคเบาหวาน เช่น โรคไต โรคตา และโรคหลอดเลือด',
        'ให้คำปรึกษาโภชนาการ การออกกำลังกาย และการดูแลตัวเองสำหรับผู้ป่วยเบาหวาน'
      ]
    },
    {
      departmentId: 2,
      name: 'ระบบทางเดินอาหารและตับ',
      nameEn: 'Gastroenterology',
      icon: 'Stethoscope',
      color: 'amber',
      hasBranches: false,
      description: 'ศูนย์ระบบทางเดินอาหารและตับเป็นศูนย์เฉพาะทางที่ให้บริการตรวจวินิจฉัยและรักษาโรคระบบทางเดินอาหาร กระเพาะอาหาร ลำไส้ ตับ ท่อน้ำดี และตับอ่อน ด้วยทีมแพทย์ผู้เชี่ยวชาญที่ผ่านการอบรมเฉพาะทาง พร้อมเครื่องมือส่องกล้องและตรวจวินิจฉัยที่ทันสมัย',
      services: [
        'ตรวจส่องกล้องระบบทางเดินอาหาร ทั้งส่องกล้องกระเพาะอาหาร และส่องกล้องลำไส้ใหญ่',
        'รักษาโรคกระเพาะอาหารอักเสบ โรคแผลในกระเพาะอาหาร และโรคลำไส้แปรปรวน',
        'รักษาโรคตับ ตับอักเสบ ตับแข็ง โรคท่อน้ำดี และโรคตับอ่อนอักเสบ',
        'ตรวจคัดกรองมะเร็งลำไส้ใหญ่ มะเร็งกระเพาะอาหาร และมะเร็งตับ',
        'คำปรึกษาโภชนาการสำหรับผู้ป่วยโรคระบบทางเดินอาหาร และโปรแกรมดูแลสุขภาพ'
      ]
    },
    {
      departmentId: 8,
      name: 'รังสีวินิจฉัย X-Ray',
      nameEn: 'Radiology & Imaging',
      icon: 'FileText',
      color: 'gray',
      hasBranches: false,
      description: 'ศูนย์รังสีวินิจฉัยให้บริการตรวจทางรังสีวิทยาและการถ่ายภาพทางการแพทย์ครบวงจร ด้วยเครื่องมือทันสมัย เช่น เครื่อง X-ray ดิจิตอล เครื่องอัลตราซาวด์ เครื่อง CT Scan และเครื่อง MRI พร้อมทีมรังสีแพทย์และนักรังสีเทคนิคผู้เชี่ยวชาญ เรามุ่งเน้นการให้บริการที่รวดเร็ว แม่นยำ และปลอดภัย',
      services: [
        'ถ่ายภาพรังสีทั่วไป (X-ray) สำหรับกระดูก ปอด หัวใจ และอวัยวะต่างๆ',
        'ตรวจอัลตราซาวด์ (Ultrasound) อวัยวะภายใน ครรภ์ และหลอดเลือด',
        'ตรวจด้วยคอมพิวเตอร์ (CT Scan) เพื่อวินิจฉัยโรคระบบต่างๆ อย่างละเอียด',
        'ตรวจด้วยคลื่นแม่เหล็กไฟฟ้า (MRI) สำหรับสมอง ไขสันหลัง และข้อ',
        'ตรวจแมมโมแกรม (Mammogram) เพื่อคัดกรองมะเร็งเต้านม'
      ]
    },
    {
      departmentId: 4,
      name: 'โรคระบบทางเดินปัสสาวะ',
      nameEn: 'Urology',
      icon: 'Droplet',
      color: 'blue',
      hasBranches: false,
      description: 'ศูนย์โรคระบบทางเดินปัสสาวะให้บริการตรวจวินิจฉัยและรักษาโรคไต กระเพาะปัสสาวะ ท่อปัสสาวะ และระบบสืบพันธุ์ในเพศชาย ด้วยทีมแพทย์ผู้เชี่ยวชาญด้านศัลยกรรมระบบทางเดินปัสสาวะ พร้อมเครื่องมือตรวจวินิจฉัยและรักษาที่ทันสมัย เรามุ่งเน้นการรักษาที่มีประสิทธิภาพและการดูแลที่เป็นส่วนตัว',
      services: [
        'ตรวจและรักษาโรคนิ่วในไต นิ่วในกระเพาะปัสสาวะ ด้วยการสลายนิ่วและผ่าตัด',
        'รักษาโรคกระเพาะปัสสาวะอักเสบ การปัสสาวะเร่งรีบ และปัสสาวะเล็ด',
        'รักษาโรคต่อมลูกหมากโต มะเร็งต่อมลูกหมาก และโรคต่อมลูกหมากอักเสบ',
        'รักษาโรคไตอักเสบ ไตวาย และโรคเกี่ยวกับระบบไต',
        'ผ่าตัดและรักษาโรคระบบทางเดินปัสสาวะด้วยกล้องส่องและเทคนิคที่ทันสมัย'
      ]
    },
    {
      departmentId: 6,
      name: 'โรคระบบทางเดินหายใจ',
      nameEn: 'Pulmonology',
      icon: 'Wind',
      color: 'emerald',
      hasBranches: false,
      description: 'ศูนย์โรคระบบทางเดินหายใจให้บริการตรวจวินิจฉัยและรักษาโรคปอด หลอดลม และระบบทางเดินหายใจ ด้วยทีมแพทย์โรคปอดและระบบทางเดินหายใจผู้เชี่ยวชาญ พร้อมเครื่องมือตรวจและรักษาที่ทันสมัย เช่น เครื่องตรวจสมรรถภาพปอด กล้องส่องหลอดลม และเครื่องช่วยหายใจ',
      services: [
        'ตรวจและรักษาโรคหอบหืด โรคปอดอุดกั้นเรื้อรัง (COPD) และโรคภูมิแพ้ทางเดินหายใจ',
        'รักษาโรคปอดบวม วัณโรค และโรคติดเชื้อทางเดินหายใจ',
        'ตรวจคัดกรองและรักษามะเร็งปอด เนื้องอกในปอด',
        'รักษาภาวะหยุดหายใจขณะหลับ นอนกรน และความผิดปกติการหายใจขณะนอน',
        'ตรวจสมรรถภาพปอด ส่องกล้องหลอดลม และให้ออกซิเจนบำบัด'
      ]
    },
    {
      departmentId: 13,
      name: 'โรคระบบประสาทและสมอง',
      nameEn: 'Neurology',
      icon: 'Brain',
      color: 'fuchsia',
      hasBranches: false,
      description: 'ศูนย์โรคระบบประสาทและสมองให้บริการตรวจวินิจฉัยและรักษาโรคทางระบบประสาท สมอง ไขสันหลัง และเส้นประสาท ด้วยทีมประสาทแพทย์ผู้เชี่ยวชาญและเครื่องมือตรวจทางระบบประสาทที่ทันสมัย เช่น เครื่อง EEG เครื่อง EMG และเครื่อง MRI สมอง เรามุ่งเน้นการวินิจฉัยที่แม่นยำและการรักษาที่มีประสิทธิภาพ',
      services: [
        'ตรวจและรักษาโรคหลอดเลือดสมอง โรคอัมพาต และโรคหลอดเลือดสมองตีบ',
        'รักษาโรคลมชัก โรคพาร์กินสัน โรคอัลไซเมอร์ และโรคสมองเสื่อม',
        'รักษาโรคไมเกรน ปวดศีรษะเรื้อรัง และอาการปวดศีรษะชนิดต่างๆ',
        'รักษาโรคเส้นประสาท เช่น โรคเส้นประสาทอักเสบ มือชา เท้าชา',
        'ตรวจคลื่นไฟฟ้าสมอง (EEG) และตรวจการนำไฟฟ้าของเส้นประสาทและกล้ามเนื้อ (EMG/NCV)'
      ]
    },
    {
      departmentId: 14,
      name: 'เวชศาสตร์ฟื้นฟูและกายภาพบำบัด',
      nameEn: 'Rehabilitation Medicine',
      icon: 'Activity',
      color: 'orange',
      hasBranches: false,
      description: 'ศูนย์เวชศาสตร์ฟื้นฟูและกายภาพบำบัดให้บริการฟื้นฟูสมรรถภาพทางร่างกายและการเคลื่อนไหว สำหรับผู้ป่วยที่มีความบกพร่องทางร่างกายจากโรคหรืออุบัติเหตุ ด้วยทีมแพทย์เวชศาสตร์ฟื้นฟู นักกายภาพบำบัด และนักกิจกรรมบำบัด พร้อมอุปกรณ์ฟื้นฟูสมรรถภาพที่ทันสมัย',
      services: [
        'กายภาพบำบัดสำหรับผู้ป่วยหลังผ่าตัด ผู้ป่วยอัมพาต และผู้ป่วยโรคระบบประสาท',
        'ฟื้นฟูสมรรถภาพผู้ป่วยบาดเจ็บกระดูกและข้อ เอ็นฉีก และกล้ามเนื้ออักเสบ',
        'รักษาอาการปวดเรื้อรัง ปวดหลัง ปวดคอ ปวดไหล่ ด้วยกายภาพบำบัด',
        'ฟื้นฟูสมรรถภาพผู้สูงอายุ เพิ่มความแข็งแรงและการทรงตัว',
        'กิจกรรมบำบัด การบำบัดด้วยการพูด และการฟื้นฟูสมรรถภาพแบบองค์รวม'
      ]
    },
    {
      departmentId: 9,
      name: 'ศัลยกรรม',
      nameEn: 'Surgery',
      icon: 'Zap',
      color: 'red',
      hasBranches: false,
      description: 'ศูนย์ศัลยกรรมให้บริการผ่าตัดและรักษาโรคทางศัลยกรรมทุกชนิด ด้วยทีมศัลยแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์สูง พร้อมห้องผ่าตัดที่ทันสมัยและได้มาตรฐานสากล เครื่องมือผ่าตัดแบบ Minimally Invasive และระบบดูแลหลังผ่าตัดที่มีคุณภาพ เรามุ่งเน้นความปลอดภัยและการฟื้นตัวที่รวดเร็ว',
      services: [
        'ผ่าตัดทางเดินอาหาร ไส้ติ่งอักเสบ ไส้เลื่อน และโรคทางเดินอาหารต่างๆ',
        'ผ่าตัดต่อมไทรอยด์ ต่อมเต้านม และต่อมน้ำเหลืองบวม',
        'ผ่าตัดนิ่วในถุงน้ำดี ผ่าตัดตับ และผ่าตัดตับอ่อน',
        'ผ่าตัดรักษาเนื้องอก มะเร็ง และผ่าตัดผิวหนังเล็กน้อย',
        'ผ่าตัดแบบส่องกล้อง (Laparoscopy) ที่มีแผลเล็ก ฟื้นตัวเร็ว'
      ]
    },
    {
      departmentId: 12,
      name: 'หัวใจ',
      nameEn: 'Cardiology',
      icon: 'Heart',
      color: 'red',
      hasBranches: false,
      description: 'ศูนย์หัวใจเป็นศูนย์ความเป็นเลิศด้านการดูแลโรคหัวใจและหลอดเลือด มีทีมแพทย์โรคหัวใจผู้เชี่ยวชาญที่ได้รับการรับรองจากสมาคมโรคหัวใจแห่งประเทศไทย พร้อมด้วยเครื่องมือตรวจวินิจฉัยและรักษาที่ทันสมัยที่สุด เรามุ่งมั่นในการให้บริการตรวจหาความเสี่ยง การป้องกัน การรักษา และการฟื้นฟูสภาพหัวใจ',
      services: [
        'ตรวจคลื่นไฟฟ้าหัวใจ (EKG/ECG) และตรวจคลื่นไฟฟ้าหัวใจขณะออกกำลังกาย (Exercise Stress Test)',
        'ตรวจอัลตราซาวด์หัวใจ (Echocardiography) เพื่อประเมินการทำงานของหัวใจ',
        'ตรวจความดันเลือด 24 ชั่วโมง (Holter Monitor) และตรวจการเต้นของหัวใจตลอด 24 ชั่วโมง',
        'รักษาโรคหัวใจและหลอดเลือด โรคความดันโลหิตสูง และโรคหัวใจเต้นผิดจังหวะ',
        'คำปรึกษาการดูแลสุขภาพหัวใจ โภชนาการ และโปรแกรมฟื้นฟูสภาพหัวใจ'
      ]
    }
  ],

  en: [
    {
      departmentId: 10,
      name: 'Internal Medicine',
      description: 'Internal Medicine Center provides comprehensive diagnosis and treatment of general and specialized adult diseases. With experienced internists who are experts in various fields, along with modern diagnostic equipment and standardized laboratories, we focus on holistic patient care including acute disease treatment, chronic disease management, and disease prevention to ensure patients have good health and quality of life.',
      services: [
        'General medical care, influenza, infectious diseases, and acute conditions treatment',
        'Chronic disease treatment and management such as diabetes, hypertension, and high cholesterol',
        'Infectious disease treatment, dengue fever, and respiratory tract infections',
        'Annual health checkups, disease screening, and risk assessment',
        'Elderly care consultation, nutrition, and appropriate exercise guidance'
      ]
    },
    {
      departmentId: 15,
      name: 'Pediatrics',
      description: 'Pediatrics Center provides comprehensive child healthcare from newborn to adolescence. With experienced pediatricians specialized in various fields and nurses experienced in child care, we have specially designed examination rooms to make children feel comfortable and safe, along with age-appropriate medical equipment. We focus on disease prevention, developmental promotion, and treatment of childhood diseases.',
      services: [
        'General health checkups, newborn screening tests, and pre-school health examinations',
        'Vaccination services according to standard schedules and additional vaccines for all age groups',
        'Developmental assessment and monitoring, developmental delay screening',
        'Treatment of common childhood diseases, infections, allergies, and specialized pediatric conditions',
        'Consultation on child rearing, pediatric nutrition, and behavioral problems'
      ]
    },
    {
      departmentId: 1,
      name: 'Women\'s Health Center',
      description: 'Women\'s Health Center provides comprehensive gynecological care with experienced specialists and modern medical equipment. We care for women\'s health at every age, from adolescence through working years to menopause, with attention and privacy. We focus on prevention and treatment using cutting-edge technology.',
      services: [
        'General women\'s health examinations and disease screening',
        'Prenatal care and postnatal care with breastfeeding consultation',
        'Breast cancer and cervical cancer screening with modern equipment',
        'Menstrual disorder treatment, hormonal imbalances, and reproductive system diseases',
        'Family planning, contraception consultation, and preconception health care'
      ]
    },
    {
      departmentId: 16,
      name: 'ENT (Ear, Nose & Throat)',
      description: 'ENT Center provides comprehensive diagnosis and treatment of ear, nose, throat, and upper respiratory tract diseases. With experienced specialist doctors and modern examination and treatment equipment such as nasal endoscopy, otoscopy, and hearing tests, we focus on effective and safe treatment.',
      services: [
        'Diagnosis and treatment of ear infections, hearing loss, tinnitus, and hearing disorders',
        'Treatment of rhinitis, sinusitis, nasal polyps, and allergic rhinitis',
        'Treatment of throat infections, tonsillitis, and adenoid enlargement',
        'Diagnosis and treatment of snoring and sleep apnea',
        'Surgery and treatment of ENT diseases using modern techniques'
      ]
    },
    {
      departmentId: 5,
      name: 'Dermatology',
      description: 'Dermatology Center provides diagnosis and treatment of all types of skin diseases with dermatology specialists and modern medical equipment, including laser technology and aesthetic treatments. We focus on skin health care, effective disease treatment, and personalized skincare consultation.',
      services: [
        'Diagnosis and treatment of all skin diseases such as acne, allergic rashes, and skin infections',
        'Treatment of fungal skin infections, psoriasis, and chronic skin diseases',
        'Skin cancer screening and treatment of abnormal moles',
        'Aesthetic treatments such as scar treatment, dark spots, melasma, and freckles',
        'Laser treatment for skin diseases, wrinkle reduction, and Botox/filler injections'
      ]
    },
    {
      departmentId: 17,
      name: 'Vaccination Center',
      description: 'Vaccination Center is the most comprehensive vaccination service center with high-quality vaccines from leading domestic and international companies, stored in standard Cold Chain systems. With a team of doctors and nurses specialized in vaccinology, we focus on safe, standardized, and highly effective vaccination services.',
      services: [
        'Pediatric vaccines according to Ministry of Public Health standards and premium supplementary vaccines',
        'Adult and elderly vaccines such as influenza, pneumonia, and shingles vaccines',
        'Infectious disease prevention vaccines such as hepatitis, HPV, and COVID-19 vaccines',
        'Travel vaccines according to destination countries and disease prevention consultation',
        'Vaccine consultation, vaccination schedules, and post-vaccination follow-up'
      ]
    },
    {
      departmentId: 18,
      name: 'Occupational Health',
      description: 'Occupational Health and Health Promotion Center provides preventive health examinations, health promotion, and workplace health care services. With experienced medical professionals, we focus on annual health checkups, disease risk assessment, and health consultation for disease prevention.',
      services: [
        'Annual health checkups for individuals and corporate employees',
        'Health examinations for licenses, certificates, and legal requirements',
        'Screening for diabetes, hypertension, high cholesterol, and chronic diseases',
        'Health risk assessment and preventive health care consultation',
        'Elderly health examinations and personalized health promotion programs'
      ]
    },
    {
      departmentId: 7,
      name: 'Orthopedics',
      description: 'Orthopedics Center provides comprehensive diagnosis and treatment of bone, joint, muscle, and tendon diseases. With experienced orthopedic specialists and modern equipment such as digital X-ray, MRI, and international standard operating rooms, we focus on effective treatment and post-treatment rehabilitation.',
      services: [
        'Diagnosis and treatment of osteoarthritis, arthritis, back pain, neck pain, and osteoporosis',
        'Treatment of accident injuries, fractures, ligament tears, and dislocations',
        'Knee replacement surgery, hip replacement, and spinal surgery',
        'Diagnosis and treatment of pediatric bone diseases and abnormal bone growth',
        'Bone and joint rehabilitation, physical therapy, and exercise programs'
      ]
    },
    {
      departmentId: 21,
      name: 'Endoscopy Center',
      description: 'Endoscopy Clinic provides upper and lower gastrointestinal endoscopy services with specialist doctors and modern, high-definition endoscopes. We focus on early disease detection, accurate diagnosis, and safe, standardized endoscopic treatment while ensuring patient comfort.',
      services: [
        'Gastroscopy for diagnosis and treatment',
        'Colonoscopy for colorectal cancer screening',
        'Endoscopic polypectomy and tissue biopsy for pathological examination',
        'Treatment of esophageal varices and gastric ulcers using endoscopic methods',
        'Pre-endoscopy preparation and post-procedure care consultation'
      ]
    },
    {
      departmentId: 20,
      name: 'Psychiatry',
      description: 'Psychiatry Center provides diagnosis and treatment of psychiatric diseases and mental health problems with experienced psychiatrists and clinical psychologists in a private and safe environment. We focus on holistic treatment including medication, psychotherapy, and behavioral modification to help patients have good mental health and live happily.',
      services: [
        'Diagnosis and treatment of depression, anxiety disorders, and stress disorders',
        'Treatment of schizophrenia, bipolar disorder, and chronic psychiatric diseases',
        'Consultation for psychological problems, relationships, and adjustment issues',
        'Treatment of insomnia, alcohol addiction, substance abuse, and behavioral addictions',
        'Psychotherapy and psychological counseling, potential development, and quality of life improvement'
      ]
    },
    {
      departmentId: 11,
      name: 'Ophthalmology',
      description: 'Ophthalmology Center is the most comprehensive eye care center with ophthalmologists specialized in various fields and the most modern medical equipment such as computerized retinal examination, OCT, and international standard operating rooms. We are committed to caring for your eye health and vision.',
      services: [
        'Vision testing, refraction testing, and appropriate eyeglass prescription',
        'Treatment of glaucoma, cataracts, and retinal degeneration',
        'Cataract surgery, glaucoma surgery, eye muscle surgery, and laser vision correction',
        'OCT retinal examination for diabetic and hypertensive patients',
        'Treatment of pediatric eye diseases, red eye, dry eye, and various eye diseases in adults and elderly'
      ]
    },
    {
      departmentId: 19,
      name: 'Dentistry',
      description: 'Dentistry Center provides comprehensive oral and dental health care with experienced and highly skilled dentists, along with modern dental technology such as digital X-ray, intraoral cameras, and international standard surgical instruments. We focus on painless, clean, and safe treatment.',
      services: [
        'Oral and dental health examinations, scaling, and regular teeth cleaning',
        'High-quality dental fillings, tooth extraction, root canal treatment, and minor oral surgery',
        'Various types of dentures, digital implant systems, and beautiful dental bridges',
        'Modern orthodontic treatment, both clear aligners and traditional braces',
        'Professional teeth whitening, tooth gems, and veneers for a beautiful smile'
      ]
    },
    {
      departmentId: 3,
      name: 'Endocrinology & Diabetes',
      description: 'Endocrinology and Diabetes Center provides comprehensive diagnosis and treatment of diabetes, endocrine diseases, and hormonal disorders. With experienced endocrinologists and diabetes specialists, along with nutritionists and skilled nurses, we focus on blood sugar control, complication prevention, and holistic care.',
      services: [
        'Diagnosis and treatment of all types of diabetes, blood sugar level control',
        'Treatment of thyroid diseases, adrenal gland diseases, and other endocrine disorders',
        'Treatment of hormonal imbalances, obesity, and metabolic disorders',
        'Screening for diabetes complications such as kidney disease, eye disease, and vascular disease',
        'Nutrition consultation, exercise guidance, and self-care for diabetic patients'
      ]
    },
    {
      departmentId: 2,
      name: 'Gastroenterology',
      description: 'Gastroenterology and Liver Center is a specialized center providing diagnosis and treatment of digestive system, stomach, intestines, liver, bile duct, and pancreas diseases. With specially trained specialist doctors and modern endoscopy and diagnostic equipment.',
      services: [
        'Digestive system endoscopy, both gastroscopy and colonoscopy',
        'Treatment of gastritis, gastric ulcers, and irritable bowel syndrome',
        'Treatment of liver disease, hepatitis, cirrhosis, bile duct disease, and pancreatitis',
        'Screening for colon cancer, stomach cancer, and liver cancer',
        'Nutritional consultation for digestive disease patients and health care programs'
      ]
    },
    {
      departmentId: 8,
      name: 'Radiology & Imaging',
      description: 'Radiology and Imaging Center provides comprehensive radiology and medical imaging services with modern equipment such as digital X-ray, ultrasound, CT Scan, and MRI machines, along with experienced radiologists and radiologic technologists. We focus on fast, accurate, and safe service.',
      services: [
        'General X-ray imaging for bones, lungs, heart, and various organs',
        'Ultrasound examination of internal organs, pregnancy, and blood vessels',
        'CT Scan for detailed diagnosis of various systems',
        'MRI examination for brain, spinal cord, and joints',
        'Mammogram for breast cancer screening'
      ]
    },
    {
      departmentId: 4,
      name: 'Urology',
      description: 'Urology Center provides diagnosis and treatment of kidney, bladder, urinary tract, and male reproductive system diseases. With urological surgery specialists and modern diagnostic and treatment equipment, we focus on effective treatment and private care.',
      services: [
        'Diagnosis and treatment of kidney stones and bladder stones through lithotripsy and surgery',
        'Treatment of cystitis, urinary urgency, and urinary incontinence',
        'Treatment of benign prostatic hyperplasia, prostate cancer, and prostatitis',
        'Treatment of nephritis, kidney failure, and kidney-related diseases',
        'Surgery and treatment of urological diseases using endoscopy and modern techniques'
      ]
    },
    {
      departmentId: 6,
      name: 'Pulmonology',
      description: 'Pulmonology Center provides diagnosis and treatment of lung, bronchus, and respiratory system diseases. With pulmonology and respiratory specialists and modern examination and treatment equipment such as pulmonary function testing, bronchoscopy, and ventilators.',
      services: [
        'Diagnosis and treatment of asthma, chronic obstructive pulmonary disease (COPD), and respiratory allergies',
        'Treatment of pneumonia, tuberculosis, and respiratory infections',
        'Screening and treatment of lung cancer and pulmonary tumors',
        'Treatment of sleep apnea, snoring, and sleep-related breathing disorders',
        'Pulmonary function testing, bronchoscopy, and oxygen therapy'
      ]
    },
    {
      departmentId: 13,
      name: 'Neurology',
      description: 'Neurology Center provides diagnosis and treatment of nervous system, brain, spinal cord, and nerve diseases. With experienced neurologists and modern neurological examination equipment such as EEG, EMG, and brain MRI, we focus on accurate diagnosis and effective treatment.',
      services: [
        'Diagnosis and treatment of cerebrovascular disease, stroke, and cerebral artery stenosis',
        'Treatment of epilepsy, Parkinson\'s disease, Alzheimer\'s disease, and dementia',
        'Treatment of migraine, chronic headaches, and various types of headaches',
        'Treatment of nerve diseases such as neuritis, hand numbness, and foot numbness',
        'EEG and nerve and muscle conduction tests (EMG/NCV)'
      ]
    },
    {
      departmentId: 14,
      name: 'Rehabilitation Medicine',
      description: 'Rehabilitation Medicine and Physical Therapy Center provides physical and mobility rehabilitation services for patients with physical disabilities from disease or accidents. With rehabilitation medicine doctors, physical therapists, and occupational therapists, along with modern rehabilitation equipment.',
      services: [
        'Physical therapy for post-surgical patients, stroke patients, and neurological disease patients',
        'Rehabilitation for bone and joint injury patients, ligament tears, and muscle inflammation',
        'Treatment of chronic pain, back pain, neck pain, and shoulder pain with physical therapy',
        'Elderly rehabilitation, strength enhancement, and balance improvement',
        'Occupational therapy, speech therapy, and holistic rehabilitation'
      ]
    },
    {
      departmentId: 9,
      name: 'Surgery',
      description: 'Surgery Center provides surgical and surgical disease treatment of all types. With highly experienced surgical specialists and modern, international standard operating rooms, minimally invasive surgical equipment, and quality post-operative care systems, we focus on safety and rapid recovery.',
      services: [
        'Gastrointestinal surgery, appendicitis, hernia, and various digestive diseases',
        'Thyroid surgery, breast surgery, and lymph node enlargement surgery',
        'Gallbladder surgery, liver surgery, and pancreatic surgery',
        'Tumor and cancer treatment surgery, and minor skin surgery',
        'Laparoscopic surgery with small incisions and rapid recovery'
      ]
    },
    {
      departmentId: 12,
      name: 'Cardiology',
      description: 'Cardiology Center is a center of excellence in cardiovascular care. With cardiologists certified by the Heart Association of Thailand, along with the most modern diagnostic and treatment equipment, we are committed to providing risk assessment, prevention, treatment, and cardiac rehabilitation services.',
      services: [
        'Electrocardiogram (EKG/ECG) and exercise stress test',
        'Echocardiography to assess heart function',
        '24-hour blood pressure monitoring (Holter Monitor) and 24-hour heart rhythm monitoring',
        'Treatment of cardiovascular disease, hypertension, and arrhythmia',
        'Cardiac health care consultation, nutrition, and cardiac rehabilitation programs'
      ]
    }
  ]
}

// Export the data
module.exports = medicalCentersData
