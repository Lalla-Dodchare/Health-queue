/**
 * Add department translations for all missing locales (ru, ja, ko, zh, hi)
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Medical center translations for all languages
const translations = {
  ru: [
    { department_id: 1, name: 'Здоровье сердца', name_en: 'Heart Health Center', description: 'Комплексный уход за сердцем с современными технологиями', services: ['Электрокардиограмма (ЭКГ)', 'Эхокардиограмма', 'Стресс-тест', 'Катетеризация сердца', 'Кардиологическое консультирование'] },
    { department_id: 2, name: 'Ортопедия', name_en: 'Orthopedic Center', description: 'Лечение заболеваний костей и суставов', services: ['Замена суставов', 'Спортивная медицина', 'Хирургия позвоночника', 'Артроскопия', 'Физиотерапия'] },
    { department_id: 3, name: 'Педиатрия', name_en: 'Pediatrics', description: 'Специализированная помощь для младенцев и детей', services: ['Детская вакцинация', 'Мониторинг роста', 'Проверка развития', 'Лечение общих заболеваний', 'Неотложная помощь детям'] },
    { department_id: 4, name: 'Женское здоровье', name_en: 'Women\'s Health', description: 'Полный комплекс услуг по уходу за женским здоровьем', services: ['Акушерская помощь', 'Гинекологическая помощь', 'Скрининг рака молочной железы', 'Планирование семьи', 'Менопаузальное лечение'] },
    { department_id: 5, name: 'Офтальмология', name_en: 'Eye Center', description: 'Передовая офтальмологическая помощь и лечение', services: ['Проверка зрения', 'Хирургия катаракты', 'LASIK', 'Лечение глаукомы', 'Обследование сетчатки'] },
    { department_id: 6, name: 'Стоматология', name_en: 'Dental Clinic', description: 'Полный комплекс стоматологических услуг', services: ['Общая стоматология', 'Косметическая стоматология', 'Ортодонтия', 'Зубные имплантаты', 'Лечение корневых каналов'] },
    { department_id: 7, name: 'Дерматология', name_en: 'Dermatology Center', description: 'Уход за кожей и лечение заболеваний', services: ['Лечение акне', 'Антивозрастной уход', 'Скрининг рака кожи', 'Лазерные процедуры', 'Косметическая дерматология'] },
    { department_id: 8, name: 'Альтернативная медицина', name_en: 'Alternative Medicine', description: 'Холистические и традиционные методы лечения', services: ['Иглоукалывание', 'Траволечение', 'Тайский массаж', 'Йога-терапия', 'Натуропатия'] },
    { department_id: 9, name: 'Радиология', name_en: 'Radiology Center', description: 'Диагностическая визуализация и услуги радиологии', services: ['Рентген', 'КТ', 'МРТ', 'УЗИ', 'Маммография'] },
    { department_id: 10, name: 'Реабилитация', name_en: 'Rehabilitation Center', description: 'Физическая терапия и реабилитация', services: ['Физиотерапия', 'Трудотерапия', 'Логопедия', 'Спортивная реабилитация', 'Обезболивание'] },
    { department_id: 11, name: 'Лаборатория', name_en: 'Laboratory Services', description: 'Диагностические лабораторные тесты', services: ['Анализ крови', 'Анализ мочи', 'Биопсия', 'Микробиологические тесты', 'Патология'] },
    { department_id: 12, name: 'Неотложная помощь', name_en: 'Emergency Room', description: 'Круглосуточная неотложная медицинская помощь', services: ['Неотложная помощь при травмах', 'Неотложная кардиологическая помощь', 'Неотложная хирургия', 'Отделение интенсивной терапии', 'Реанимация'] },
    { department_id: 13, name: 'Гастроэнтерология', name_en: 'Gastroenterology', description: 'Лечение заболеваний пищеварительной системы', services: ['Эндоскопия', 'Колоноскопия', 'Лечение печени', 'Обследование пищеварительной системы', 'Управление симптомами ЖКТ'] },
    { department_id: 14, name: 'Неврология', name_en: 'Neurology Center', description: 'Лечение заболеваний нервной системы', services: ['Лечение головной боли', 'Лечение инсульта', 'Обследование эпилепсии', 'Лечение болезни Паркинсона', 'Обследование памяти'] },
    { department_id: 15, name: 'ЛОР', name_en: 'ENT Clinic', description: 'Уход за ушами, носом и горлом', services: ['Тест на слух', 'Лечение синусита', 'Тонзиллэктомия', 'Эндоскопия носа', 'Лечение нарушений голоса'] },
    { department_id: 16, name: 'Урология', name_en: 'Urology Center', description: 'Уход за мочевыводящей системой', services: ['Обследование простаты', 'Лечение камней в почках', 'Лечение недержания', 'Урологическая хирургия', 'Мужское здоровье'] },
    { department_id: 17, name: 'Онкология', name_en: 'Cancer Center', description: 'Всестороннее лечение рака', services: ['Химиотерапия', 'Радиотерапия', 'Онкологическая хирургия', 'Таргетная терапия', 'Паллиативная помощь'] },
    { department_id: 18, name: 'Психиатрия', name_en: 'Mental Health', description: 'Услуги по охране психического здоровья', services: ['Консультирование', 'Психиатрическое обследование', 'Управление медикаментами', 'Групповая терапия', 'Лечение зависимостей'] },
    { department_id: 19, name: 'Эстетика', name_en: 'Aesthetic Center', description: 'Косметические процедуры и анти-эйдж лечение', services: ['Ботокс и филлеры', 'Лазерные процедуры', 'Химические пилинги', 'Коррекция фигуры', 'Антивозрастные процедуры'] },
    { department_id: 20, name: 'Аллергология', name_en: 'Allergy Center', description: 'Диагностика и лечение аллергии', services: ['Тест на аллергию', 'Иммунотерапия', 'Лечение астмы', 'Тест на пищевую аллергию', 'Ведение синуса'] },
    { department_id: 21, name: 'Медосмотр', name_en: 'Health Checkup', description: 'Комплексные программы медосмотра', services: ['Общий медосмотр', 'Исполнительный медосмотр', 'Скрининг сердца', 'Скрининг рака', 'Корпоративный медосмотр'] }
  ],
  ja: [
    { department_id: 1, name: '心臓ヘルスセンター', name_en: 'Heart Health Center', description: '最先端技術による総合的な心臓ケア', services: ['心電図（ECG）', '心エコー図', 'ストレステスト', '心臓カテーテル検査', '心臓カウンセリング'] },
    { department_id: 2, name: '整形外科センター', name_en: 'Orthopedic Center', description: '骨と関節の治療', services: ['関節置換術', 'スポーツ医学', '脊椎手術', '関節鏡検査', '理学療法'] },
    { department_id: 3, name: '小児科', name_en: 'Pediatrics', description: '乳幼児と子供の専門ケア', services: ['小児予防接種', '成長モニタリング', '発達チェック', '一般的な病気の治療', '小児救急医療'] },
    { department_id: 4, name: '女性の健康', name_en: 'Women\'s Health', description: '女性の健康管理のための包括的なサービス', services: ['産科ケア', '婦人科ケア', '乳がん検診', '家族計画', '更年期治療'] },
    { department_id: 5, name: '眼科センター', name_en: 'Eye Center', description: '高度な眼科ケアと治療', services: ['視力検査', '白内障手術', 'LASIK', '緑内障治療', '網膜検査'] },
    { department_id: 6, name: '歯科クリニック', name_en: 'Dental Clinic', description: '包括的な歯科サービス', services: ['一般歯科', '美容歯科', '矯正歯科', '歯科インプラント', '根管治療'] },
    { department_id: 7, name: '皮膚科センター', name_en: 'Dermatology Center', description: 'スキンケアと皮膚疾患の治療', services: ['ニキビ治療', 'アンチエイジングケア', '皮膚がん検診', 'レーザー治療', '美容皮膚科'] },
    { department_id: 8, name: '代替医療', name_en: 'Alternative Medicine', description: 'ホリスティックで伝統的な治療法', services: ['鍼治療', 'ハーブ医学', 'タイ式マッサージ', 'ヨガセラピー', '自然療法'] },
    { department_id: 9, name: '放射線科センター', name_en: 'Radiology Center', description: '画像診断と放射線サービス', services: ['X線', 'CTスキャン', 'MRI', '超音波検査', 'マンモグラフィー'] },
    { department_id: 10, name: 'リハビリテーションセンター', name_en: 'Rehabilitation Center', description: '理学療法とリハビリテーション', services: ['理学療法', '作業療法', '言語聴覚療法', 'スポーツリハビリテーション', '疼痛管理'] },
    { department_id: 11, name: '検査室サービス', name_en: 'Laboratory Services', description: '診断臨床検査', services: ['血液検査', '尿検査', '生検', '微生物検査', '病理学'] },
    { department_id: 12, name: '救急室', name_en: 'Emergency Room', description: '24時間救急医療サービス', services: ['外傷救急', '心臓救急', '救急手術', '集中治療室', '蘇生'] },
    { department_id: 13, name: '消化器内科', name_en: 'Gastroenterology', description: '消化器系疾患の治療', services: ['内視鏡検査', '大腸内視鏡検査', '肝臓治療', '消化器検査', '消化器症状管理'] },
    { department_id: 14, name: '神経内科センター', name_en: 'Neurology Center', description: '神経系疾患の治療', services: ['頭痛治療', '脳卒中治療', 'てんかん評価', 'パーキンソン病治療', '記憶評価'] },
    { department_id: 15, name: '耳鼻咽喉科クリニック', name_en: 'ENT Clinic', description: '耳、鼻、喉のケア', services: ['聴力検査', '副鼻腔炎治療', '扁桃摘出術', '鼻内視鏡検査', '音声障害治療'] },
    { department_id: 16, name: '泌尿器科センター', name_en: 'Urology Center', description: '泌尿器系のケア', services: ['前立腺検査', '腎結石治療', '失禁治療', '泌尿器手術', '男性の健康'] },
    { department_id: 17, name: 'がんセンター', name_en: 'Cancer Center', description: '包括的ながん治療', services: ['化学療法', '放射線療法', 'がん手術', '標的療法', '緩和ケア'] },
    { department_id: 18, name: 'メンタルヘルス', name_en: 'Mental Health', description: 'メンタルヘルスサービス', services: ['カウンセリング', '精神科評価', '薬物管理', 'グループセラピー', '依存症治療'] },
    { department_id: 19, name: '美容センター', name_en: 'Aesthetic Center', description: '美容処置とアンチエイジング治療', services: ['ボトックスとフィラー', 'レーザー治療', 'ケミカルピーリング', 'ボディコンタリング', 'アンチエイジング処置'] },
    { department_id: 20, name: 'アレルギーセンター', name_en: 'Allergy Center', description: 'アレルギー診断と治療', services: ['アレルギー検査', '免疫療法', '喘息治療', '食物アレルギー検査', '副鼻腔管理'] },
    { department_id: 21, name: '健康診断', name_en: 'Health Checkup', description: '包括的な健康診断プログラム', services: ['一般健康診断', 'エグゼクティブ健康診断', '心臓スクリーニング', 'がんスクリーニング', '企業健康診断'] }
  ],
  ko: [
    { department_id: 1, name: '심장 건강 센터', name_en: 'Heart Health Center', description: '최첨단 기술을 이용한 종합 심장 관리', services: ['심전도(ECG)', '심장 초음파', '스트레스 테스트', '심장 카테터 삽입술', '심장 상담'] },
    { department_id: 2, name: '정형외과 센터', name_en: 'Orthopedic Center', description: '뼈와 관절 치료', services: ['관절 교체술', '스포츠 의학', '척추 수술', '관절경 검사', '물리 치료'] },
    { department_id: 3, name: '소아과', name_en: 'Pediatrics', description: '영유아 및 어린이 전문 진료', services: ['소아 예방접종', '성장 모니터링', '발달 검사', '일반 질환 치료', '소아 응급 진료'] },
    { department_id: 4, name: '여성 건강', name_en: 'Women\'s Health', description: '여성 건강 관리를 위한 종합 서비스', services: ['산과 진료', '부인과 진료', '유방암 검진', '가족 계획', '갱년기 치료'] },
    { department_id: 5, name: '안과 센터', name_en: 'Eye Center', description: '고급 안과 진료 및 치료', services: ['시력 검사', '백내장 수술', 'LASIK', '녹내장 치료', '망막 검사'] },
    { department_id: 6, name: '치과 클리닉', name_en: 'Dental Clinic', description: '종합 치과 서비스', services: ['일반 치과', '미용 치과', '교정 치과', '치과 임플란트', '근관 치료'] },
    { department_id: 7, name: '피부과 센터', name_en: 'Dermatology Center', description: '피부 관리 및 피부 질환 치료', services: ['여드름 치료', '노화 방지 관리', '피부암 검진', '레이저 치료', '미용 피부과'] },
    { department_id: 8, name: '대체 의학', name_en: 'Alternative Medicine', description: '전인적이고 전통적인 치료법', services: ['침술', '한방 의학', '타이 마사지', '요가 치료', '자연 요법'] },
    { department_id: 9, name: '영상의학과 센터', name_en: 'Radiology Center', description: '진단 영상 및 방사선 서비스', services: ['X-레이', 'CT 스캔', 'MRI', '초음파', '유방 촬영'] },
    { department_id: 10, name: '재활 센터', name_en: 'Rehabilitation Center', description: '물리 치료 및 재활', services: ['물리 치료', '작업 치료', '언어 치료', '스포츠 재활', '통증 관리'] },
    { department_id: 11, name: '임상 병리 서비스', name_en: 'Laboratory Services', description: '진단 임상 병리 검사', services: ['혈액 검사', '소변 검사', '생검', '미생물 검사', '병리학'] },
    { department_id: 12, name: '응급실', name_en: 'Emergency Room', description: '24시간 응급 의료 서비스', services: ['외상 응급', '심장 응급', '응급 수술', '중환자실', '소생술'] },
    { department_id: 13, name: '소화기내과', name_en: 'Gastroenterology', description: '소화기 질환 치료', services: ['내시경', '대장 내시경', '간 치료', '소화기 평가', '소화기 증상 관리'] },
    { department_id: 14, name: '신경과 센터', name_en: 'Neurology Center', description: '신경계 질환 치료', services: ['두통 치료', '뇌졸중 치료', '간질 평가', '파킨슨병 치료', '기억력 평가'] },
    { department_id: 15, name: '이비인후과 클리닉', name_en: 'ENT Clinic', description: '귀, 코, 목 진료', services: ['청력 검사', '부비동염 치료', '편도 절제술', '비강 내시경', '음성 장애 치료'] },
    { department_id: 16, name: '비뇨기과 센터', name_en: 'Urology Center', description: '비뇨기계 진료', services: ['전립선 검사', '신장 결석 치료', '요실금 치료', '비뇨기 수술', '남성 건강'] },
    { department_id: 17, name: '암센터', name_en: 'Cancer Center', description: '종합 암 치료', services: ['화학 요법', '방사선 요법', '암 수술', '표적 치료', '완화 치료'] },
    { department_id: 18, name: '정신 건강', name_en: 'Mental Health', description: '정신 건강 서비스', services: ['상담', '정신과 평가', '약물 관리', '그룹 치료', '중독 치료'] },
    { department_id: 19, name: '미용 센터', name_en: 'Aesthetic Center', description: '미용 시술 및 노화 방지 치료', services: ['보톡스 및 필러', '레이저 치료', '화학 박피', '바디 컨투어링', '노화 방지 시술'] },
    { department_id: 20, name: '알레르기 센터', name_en: 'Allergy Center', description: '알레르기 진단 및 치료', services: ['알레르기 검사', '면역 요법', '천식 치료', '음식 알레르기 검사', '부비동 관리'] },
    { department_id: 21, name: '건강 검진', name_en: 'Health Checkup', description: '종합 건강 검진 프로그램', services: ['일반 건강 검진', '임원 건강 검진', '심장 검진', '암 검진', '기업 건강 검진'] }
  ],
  zh: [
    { department_id: 1, name: '心脏健康中心', name_en: 'Heart Health Center', description: '采用先进技术的综合心脏护理', services: ['心电图（ECG）', '超声心动图', '压力测试', '心导管检查', '心脏咨询'] },
    { department_id: 2, name: '骨科中心', name_en: 'Orthopedic Center', description: '骨骼和关节治疗', services: ['关节置换', '运动医学', '脊柱手术', '关节镜检查', '物理治疗'] },
    { department_id: 3, name: '儿科', name_en: 'Pediatrics', description: '婴幼儿和儿童专科护理', services: ['儿童疫苗接种', '生长监测', '发育检查', '常见疾病治疗', '儿童急诊'] },
    { department_id: 4, name: '妇女健康', name_en: 'Women\'s Health', description: '女性健康护理的综合服务', services: ['产科护理', '妇科护理', '乳腺癌筛查', '计划生育', '更年期治疗'] },
    { department_id: 5, name: '眼科中心', name_en: 'Eye Center', description: '先进的眼科护理和治疗', services: ['视力检查', '白内障手术', 'LASIK', '青光眼治疗', '视网膜检查'] },
    { department_id: 6, name: '牙科诊所', name_en: 'Dental Clinic', description: '全面的牙科服务', services: ['普通牙科', '美容牙科', '正畸', '牙科种植', '根管治疗'] },
    { department_id: 7, name: '皮肤科中心', name_en: 'Dermatology Center', description: '皮肤护理和皮肤疾病治疗', services: ['痤疮治疗', '抗衰老护理', '皮肤癌筛查', '激光治疗', '美容皮肤科'] },
    { department_id: 8, name: '替代医学', name_en: 'Alternative Medicine', description: '整体和传统治疗方法', services: ['针灸', '草药医学', '泰式按摩', '瑜伽疗法', '自然疗法'] },
    { department_id: 9, name: '放射科中心', name_en: 'Radiology Center', description: '诊断影像和放射学服务', services: ['X光', 'CT扫描', 'MRI', '超声波', '乳房X光检查'] },
    { department_id: 10, name: '康复中心', name_en: 'Rehabilitation Center', description: '物理治疗和康复', services: ['物理治疗', '职业治疗', '言语治疗', '运动康复', '疼痛管理'] },
    { department_id: 11, name: '实验室服务', name_en: 'Laboratory Services', description: '诊断实验室检查', services: ['血液检查', '尿液检查', '活检', '微生物检查', '病理学'] },
    { department_id: 12, name: '急诊室', name_en: 'Emergency Room', description: '24小时急诊医疗服务', services: ['创伤急救', '心脏急救', '急诊手术', '重症监护病房', '复苏'] },
    { department_id: 13, name: '消化内科', name_en: 'Gastroenterology', description: '消化系统疾病治疗', services: ['内窥镜检查', '结肠镜检查', '肝脏治疗', '消化系统评估', '胃肠道症状管理'] },
    { department_id: 14, name: '神经科中心', name_en: 'Neurology Center', description: '神经系统疾病治疗', services: ['头痛治疗', '中风治疗', '癫痫评估', '帕金森病治疗', '记忆评估'] },
    { department_id: 15, name: '耳鼻喉科诊所', name_en: 'ENT Clinic', description: '耳、鼻、喉护理', services: ['听力测试', '鼻窦炎治疗', '扁桃体切除术', '鼻内窥镜检查', '声音障碍治疗'] },
    { department_id: 16, name: '泌尿科中心', name_en: 'Urology Center', description: '泌尿系统护理', services: ['前列腺检查', '肾结石治疗', '尿失禁治疗', '泌尿外科手术', '男性健康'] },
    { department_id: 17, name: '肿瘤中心', name_en: 'Cancer Center', description: '综合癌症治疗', services: ['化疗', '放疗', '癌症手术', '靶向治疗', '姑息治疗'] },
    { department_id: 18, name: '心理健康', name_en: 'Mental Health', description: '心理健康服务', services: ['咨询', '精神科评估', '药物管理', '团体治疗', '成瘾治疗'] },
    { department_id: 19, name: '美容中心', name_en: 'Aesthetic Center', description: '美容程序和抗衰老治疗', services: ['肉毒杆菌和填充剂', '激光治疗', '化学换肤', '身体塑形', '抗衰老程序'] },
    { department_id: 20, name: '过敏中心', name_en: 'Allergy Center', description: '过敏诊断和治疗', services: ['过敏测试', '免疫疗法', '哮喘治疗', '食物过敏测试', '鼻窦管理'] },
    { department_id: 21, name: '健康体检', name_en: 'Health Checkup', description: '综合健康体检计划', services: ['一般体检', '高级体检', '心脏筛查', '癌症筛查', '企业体检'] }
  ],
  hi: [
    { department_id: 1, name: 'हृदय स्वास्थ्य केंद्र', name_en: 'Heart Health Center', description: 'उन्नत तकनीक के साथ व्यापक हृदय देखभाल', services: ['इलेक्ट्रोकार्डियोग्राम (ईसीजी)', 'इकोकार्डियोग्राम', 'तनाव परीक्षण', 'हृदय कैथीटेराइजेशन', 'हृदय परामर्श'] },
    { department_id: 2, name: 'आर्थोपेडिक केंद्र', name_en: 'Orthopedic Center', description: 'हड्डी और जोड़ों का उपचार', services: ['संयुक्त प्रतिस्थापन', 'खेल चिकित्सा', 'रीढ़ की हड्डी की सर्जरी', 'आर्थ्रोस्कोपी', 'भौतिक चिकित्सा'] },
    { department_id: 3, name: 'बाल रोग', name_en: 'Pediatrics', description: 'शिशुओं और बच्चों के लिए विशेष देखभाल', services: ['बच्चों का टीकाकरण', 'विकास निगरानी', 'विकास जांच', 'सामान्य बीमारियों का उपचार', 'बाल आपातकालीन चिकित्सा'] },
    { department_id: 4, name: 'महिला स्वास्थ्य', name_en: 'Women\'s Health', description: 'महिलाओं के स्वास्थ्य देखभाल के लिए व्यापक सेवाएं', services: ['प्रसूति देखभाल', 'स्त्री रोग देखभाल', 'स्तन कैंसर जांच', 'परिवार नियोजन', 'रजोनिवृत्ति उपचार'] },
    { department_id: 5, name: 'नेत्र केंद्र', name_en: 'Eye Center', description: 'उन्नत नेत्र देखभाल और उपचार', services: ['दृष्टि परीक्षण', 'मोतियाबिंद सर्जरी', 'LASIK', 'ग्लूकोमा उपचार', 'रेटिना परीक्षा'] },
    { department_id: 6, name: 'दंत चिकित्सालय', name_en: 'Dental Clinic', description: 'व्यापक दंत चिकित्सा सेवाएं', services: ['सामान्य दंत चिकित्सा', 'कॉस्मेटिक दंत चिकित्सा', 'ऑर्थोडॉन्टिक्स', 'दंत प्रत्यारोपण', 'रूट कैनाल उपचार'] },
    { department_id: 7, name: 'त्वचा विज्ञान केंद्र', name_en: 'Dermatology Center', description: 'त्वचा की देखभाल और त्वचा रोगों का उपचार', services: ['मुँहासे उपचार', 'एंटी-एजिंग देखभाल', 'त्वचा कैंसर जांच', 'लेजर उपचार', 'कॉस्मेटिक त्वचा विज्ञान'] },
    { department_id: 8, name: 'वैकल्पिक चिकित्सा', name_en: 'Alternative Medicine', description: 'समग्र और पारंपरिक उपचार विधियां', services: ['एक्यूपंक्चर', 'हर्बल दवा', 'थाई मसाज', 'योग चिकित्सा', 'प्राकृतिक चिकित्सा'] },
    { department_id: 9, name: 'रेडियोलॉजी केंद्र', name_en: 'Radiology Center', description: 'नैदानिक इमेजिंग और रेडियोलॉजी सेवाएं', services: ['एक्स-रे', 'सीटी स्कैन', 'एमआरआई', 'अल्ट्रासाउंड', 'मैमोग्राफी'] },
    { department_id: 10, name: 'पुनर्वास केंद्र', name_en: 'Rehabilitation Center', description: 'भौतिक चिकित्सा और पुनर्वास', services: ['भौतिक चिकित्सा', 'व्यावसायिक चिकित्सा', 'वाक् चिकित्सा', 'खेल पुनर्वास', 'दर्द प्रबंधन'] },
    { department_id: 11, name: 'प्रयोगशाला सेवाएं', name_en: 'Laboratory Services', description: 'नैदानिक प्रयोगशाला परीक्षण', services: ['रक्त परीक्षण', 'मूत्र परीक्षण', 'बायोप्सी', 'माइक्रोबायोलॉजिकल टेस्ट', 'पैथोलॉजी'] },
    { department_id: 12, name: 'आपातकालीन कक्ष', name_en: 'Emergency Room', description: '24 घंटे आपातकालीन चिकित्सा सेवाएं', services: ['आघात आपातकालीन', 'हृदय आपातकालीन', 'आपातकालीन सर्जरी', 'गहन चिकित्सा इकाई', 'पुनर्जीवन'] },
    { department_id: 13, name: 'गैस्ट्रोएंटरोलॉजी', name_en: 'Gastroenterology', description: 'पाचन तंत्र रोगों का उपचार', services: ['एंडोस्कोपी', 'कोलोनोस्कोपी', 'यकृत उपचार', 'पाचन मूल्यांकन', 'जीआई लक्षण प्रबंधन'] },
    { department_id: 14, name: 'न्यूरोलॉजी केंद्र', name_en: 'Neurology Center', description: 'तंत्रिका तंत्र रोगों का उपचार', services: ['सिरदर्द उपचार', 'स्ट्रोक उपचार', 'मिर्गी मूल्यांकन', 'पार्किंसंस उपचार', 'स्मृति मूल्यांकन'] },
    { department_id: 15, name: 'ईएनटी क्लिनिक', name_en: 'ENT Clinic', description: 'कान, नाक और गले की देखभाल', services: ['श्रवण परीक्षण', 'साइनसाइटिस उपचार', 'टॉन्सिलेक्टोमी', 'नाक एंडोस्कोपी', 'आवाज विकार उपचार'] },
    { department_id: 16, name: 'मूत्रविज्ञान केंद्र', name_en: 'Urology Center', description: 'मूत्र प्रणाली की देखभाल', services: ['प्रोस्टेट परीक्षा', 'गुर्दे की पथरी उपचार', 'मूत्र असंयम उपचार', 'मूत्र संबंधी सर्जरी', 'पुरुष स्वास्थ्य'] },
    { department_id: 17, name: 'कैंसर केंद्र', name_en: 'Cancer Center', description: 'व्यापक कैंसर उपचार', services: ['कीमोथेरेपी', 'रेडियोथेरेपी', 'कैंसर सर्जरी', 'लक्षित चिकित्सा', 'उपशामक देखभाल'] },
    { department_id: 18, name: 'मानसिक स्वास्थ्य', name_en: 'Mental Health', description: 'मानसिक स्वास्थ्य सेवाएं', services: ['परामर्श', 'मनोरोग मूल्यांकन', 'दवा प्रबंधन', 'समूह चिकित्सा', 'व्यसन उपचार'] },
    { department_id: 19, name: 'सौंदर्य केंद्र', name_en: 'Aesthetic Center', description: 'कॉस्मेटिक प्रक्रियाएं और एंटी-एजिंग उपचार', services: ['बोटॉक्स और फिलर्स', 'लेजर उपचार', 'केमिकल पील', 'बॉडी कंटूरिंग', 'एंटी-एजिंग प्रक्रियाएं'] },
    { department_id: 20, name: 'एलर्जी केंद्र', name_en: 'Allergy Center', description: 'एलर्जी निदान और उपचार', services: ['एलर्जी परीक्षण', 'इम्यूनोथेरेपी', 'अस्थमा उपचार', 'खाद्य एलर्जी परीक्षण', 'साइनस प्रबंधन'] },
    { department_id: 21, name: 'स्वास्थ्य जांच', name_en: 'Health Checkup', description: 'व्यापक स्वास्थ्य जांच कार्यक्रम', services: ['सामान्य स्वास्थ्य जांच', 'कार्यकारी स्वास्थ्य जांच', 'हृदय जांच', 'कैंसर जांच', 'कॉर्पोरेट स्वास्थ्य जांच'] }
  ]
}

// Icon and color mappings (same for all languages)
const departmentConfig = {
  1: { icon: 'Heart', color: 'red', has_branches: false, branches: null },
  2: { icon: 'Bone', color: 'blue', has_branches: false, branches: null },
  3: { icon: 'Baby', color: 'pink', has_branches: false, branches: null },
  4: { icon: 'User', color: 'purple', has_branches: false, branches: null },
  5: { icon: 'Eye', color: 'indigo', has_branches: false, branches: null },
  6: { icon: 'Smile', color: 'green', has_branches: false, branches: null },
  7: { icon: 'Sparkles', color: 'yellow', has_branches: false, branches: null },
  8: { icon: 'Wind', color: 'teal', has_branches: false, branches: null },
  9: { icon: 'Camera', color: 'gray', has_branches: false, branches: null },
  10: { icon: 'Activity', color: 'orange', has_branches: false, branches: null },
  11: { icon: 'Microscope', color: 'cyan', has_branches: false, branches: null },
  12: { icon: 'Zap', color: 'red', has_branches: false, branches: null },
  13: { icon: 'Droplet', color: 'blue', has_branches: false, branches: null },
  14: { icon: 'Brain', color: 'purple', has_branches: false, branches: null },
  15: { icon: 'Ear', color: 'pink', has_branches: false, branches: null },
  16: { icon: 'Droplet', color: 'yellow', has_branches: false, branches: null },
  17: { icon: 'Pill', color: 'red', has_branches: false, branches: null },
  18: { icon: 'Brain', color: 'indigo', has_branches: false, branches: null },
  19: { icon: 'Sparkles', color: 'pink', has_branches: false, branches: null },
  20: { icon: 'Syringe', color: 'green', has_branches: false, branches: null },
  21: { icon: 'FileText', color: 'blue', has_branches: false, branches: null }
}

async function addTranslations() {
  console.log('🚀 Starting department translations migration...\n')

  for (const [locale, depts] of Object.entries(translations)) {
    console.log(`📝 Processing ${locale.toUpperCase()} translations...`)

    for (const dept of depts) {
      const config = departmentConfig[dept.department_id]

      const record = {
        locale: locale,
        department_id: dept.department_id,
        name: dept.name,
        name_en: dept.name_en,
        description: dept.description,
        services: dept.services,
        icon: config.icon,
        color: config.color,
        has_branches: config.has_branches,
        branches: config.branches
      }

      const { error } = await supabase
        .from('department_translations')
        .insert(record)

      if (error) {
        console.error(`   ❌ Error inserting dept ${dept.department_id} (${locale}):`, error.message)
      } else {
        console.log(`   ✅ Added: ${dept.name}`)
      }
    }

    console.log(`✅ Completed ${locale.toUpperCase()}\n`)
  }

  console.log('🎉 All translations added successfully!')
}

addTranslations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
