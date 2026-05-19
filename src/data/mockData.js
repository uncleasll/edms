export const USERS = [
  { id: 1, username: "direktor", password: "1234", name: "Abdullayev Jamshid", role: "director", department: "Rahbariyat", position: "Direktor", avatar: "DJ" },
  { id: 2, username: "ombor1", password: "1234", name: "Karimov Bekzod", role: "warehouse", department: "Ombor 1", position: "Ombor mudiri", avatar: "KB" },
  { id: 3, username: "ombor2", password: "1234", name: "Toshmatov Sanjar", role: "warehouse", department: "Ombor 2", position: "Ombor mudiri", avatar: "TS" },
  { id: 4, username: "ombor3", password: "1234", name: "Nazarov Ulugbek", role: "warehouse", department: "Ombor 3", position: "Ombor mudiri", avatar: "NU" },
  { id: 5, username: "ishlab1", password: "1234", name: "Raxmatullayev Firdavs", role: "production", department: "1-Ishlab chiqarish", position: "Bo'lim boshlig'i", avatar: "RF" },
  { id: 6, username: "ishlab2", password: "1234", name: "Yusupova Dilnoza", role: "production", department: "2-Ishlab chiqarish", position: "Bo'lim boshlig'i", avatar: "YD" },
  { id: 7, username: "ishlab3", password: "1234", name: "Mirzayev Sherzod", role: "production", department: "3-Ishlab chiqarish", position: "Bo'lim boshlig'i", avatar: "MS" },
  { id: 8, username: "rejalar", password: "1234", name: "Holmatov Nodir", role: "planning", department: "Rejalashtirish bo'limi", position: "Bosh mutaxassis", avatar: "HN" },
  { id: 9, username: "qayta", password: "1234", name: "Ergasheva Maftuna", role: "reprocessing", department: "Qayta ishlash bo'limi", position: "Bo'lim boshlig'i", avatar: "EM" },
  { id: 10, username: "tayyor", password: "1234", name: "Sodiqov Jasur", role: "finished", department: "Tayyor mahsulotlar ombori", position: "Ombor mudiri", avatar: "SJ" },
];

export const DOCUMENT_TYPES = [
  { id: "XB-1", name: "Xom ashyo buyurtma shakli", code: "XB-1", department: "Rejalashtirish bo'limi", deadlineDays: 3 },
  { id: "01-QQD", name: "Xaridlarni qabul qilish dalolatnomasi", code: "01-QQD", department: "Ombor 1", deadlineDays: 2 },
  { id: "1-MKO", name: "Material kirim orderi", code: "1-MKO", department: "Ombor 2", deadlineDays: 2 },
  { id: "2-QD", name: "Qaytarish dalolatnomasi", code: "2-QD", department: "Ombor 3", deadlineDays: 3 },
  { id: "3-QID", name: "Qayta ishashga berish dalolatnomasi", code: "3-QID", department: "Qayta ishlashga berish", deadlineDays: 2 },
  { id: "4-QO", name: "Qayta ishlovdan mahsulot qabul hisoboti", code: "4-QO", department: "Qayta ishlashga berish", deadlineDays: 3 },
  { id: "5-TYX", name: "Talabnoma yuk xati", code: "5-TYX", department: "1,2,3-Ishlab chiqarish", deadlineDays: 2 },
  { id: "6-QD", name: "TMZlarni qaytarish dalolatnomasi", code: "6-QD", department: "1,2,3-Ishlab chiqarish", deadlineDays: 2 },
  { id: "1-ICHH", name: "1-Ishlab chiqarish sexi hisoboti", code: "1-ICHH", department: "1-Ishlab chiqarish", deadlineDays: 5 },
  { id: "2-ICHAH", name: "2-Ishlab chiqarish aylanma hisoboti", code: "2-ICHAH", department: "2-Ishlab chiqarish", deadlineDays: 5 },
  { id: "3-ICHH", name: "3-Ishlab chiqarish sexi hisoboti", code: "3-ICHH", department: "3-Ishlab chiqarish", deadlineDays: 5 },
  { id: "02-TM", name: "Tayyor mahsulotlarni kirim orderi", code: "02-TM", department: "Tayyor mahsulotlar ombori", deadlineDays: 2 },
  { id: "03-YTM", name: "Yarim tayyor mahsulotlar kirim orderi", code: "03-YTM", department: "Yarim tayyor mahsulotlar", deadlineDays: 2 },
  { id: "001-BM", name: "Brak mahsulotlar kirim orderi", code: "001-BM", department: "Brak mahsulotlar", deadlineDays: 2 },
  { id: "8-QKO", name: "Qayta ishlashga qabul kirim orderi", code: "8-QKO", department: "Qayta ishlashga qabul", deadlineDays: 2 },
  { id: "9-QIH", name: "Qayta ishlangan mahsulot qaytarish hisoboti", code: "9-QIH", department: "Qayta ishlashga qabul", deadlineDays: 3 },
  { id: "10-QQD", name: "Materiallarni ortga qaytarish dalolatnomasi", code: "10-QQD", department: "Qayta ishlashga qabul", deadlineDays: 3 },
  { id: "01-UIH", name: "Umumiy ishlab chiqarish hisoboti", code: "01-UIH", department: "Rahbariyat", deadlineDays: 7 },
  { id: "005-QOH", name: "Qayta ishlashga qabul bo'limi hisoboti", code: "005-QOH", department: "Qayta ishlashga qabul", deadlineDays: 5 },
  { id: "010-QBH", name: "Qayta ishlashga berish bo'limi hisoboti", code: "010-QBH", department: "Qayta ishlashga berish", deadlineDays: 5 },
];

const today = new Date();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().split('T')[0]; };
const subDays = (d, n) => addDays(d, -n);

export const INITIAL_DOCUMENTS = [
  {
    id: "DOC-001", typeId: "XB-1", docNumber: "XB-001", title: "Xom ashyo buyurtma shakli",
    createdBy: 8, createdAt: subDays(today, 5), deadline: subDays(today, 2),
    status: "pending", rows: [
      { id: 1, orderNo: "1", date: subDays(today, 5), rawMaterial: "Paxta ip", type: "A-sifat", unit: "kg", quantity: 500, supplier: "Namangan Tekstil", department: "1-Ishlab chiqarish", note: "" }
    ],
    editRequests: [], signatures: [], lockedBy: null, editApproved: false,
  },
  {
    id: "DOC-002", typeId: "01-QQD", docNumber: "01-QQD-045", title: "Xaridlarni qabul qilish dalolatnomasi",
    createdBy: 2, createdAt: subDays(today, 7), deadline: subDays(today, 5),
    status: "approved",
    rows: [
      { id: 1, no: "1", date: subDays(today, 7), itemName: "Paxta ip", type: "Premium", unit: "kg", docQty: 300, actualQty: 295, diff: -5, defect: 0, otherReturn: "" },
    ],
    editRequests: [], signatures: [{ userId: 2, name: "Karimov Bekzod", time: subDays(today, 6) }],
    supplier: "Namangan Tekstil", receiver: "Ombor 1", ttnNo: "TTN-2025-001",
    lockedBy: null, editApproved: false,
  },
  {
    id: "DOC-003", typeId: "1-ICHH", docNumber: "1-ICHH-012", title: "1-Ishlab chiqarish hisoboti",
    createdBy: 5, createdAt: subDays(today, 3), deadline: addDays(today, 2),
    status: "draft",
    month: "May 2025",
    rows: [
      { id: 1, no: "1", model: "Model-A", name: "Ko'ylak", ordered: 200, produced: 185, diff: -15, reprocessed: 5, defects: 3, waste: 2 },
    ],
    editRequests: [], signatures: [], lockedBy: null, editApproved: false,
  },
  {
    id: "DOC-004", typeId: "01-QQD", docNumber: "01-QQD-046", title: "Xaridlarni qabul qilish dalolatnomasi",
    createdBy: 2, createdAt: subDays(today, 10), deadline: subDays(today, 8),
    status: "signed",
    rows: [
      { id: 1, no: "1", date: subDays(today, 10), itemName: "Gazlama", type: "B", unit: "m", docQty: 1000, actualQty: 1000, diff: 0, defect: 10, otherReturn: "" },
    ],
    editRequests: [], signatures: [{ userId: 2, name: "Karimov Bekzod", time: subDays(today, 9) }, { userId: 1, name: "Abdullayev Jamshid", time: subDays(today, 8) }],
    supplier: "Fergana Textil", receiver: "Ombor 1", ttnNo: "TTN-2025-002",
    lockedBy: null, editApproved: false,
  },
  {
    id: "DOC-005", typeId: "2-QD", docNumber: "2-QD-008", title: "Qaytarish dalolatnomasi",
    createdBy: 4, createdAt: subDays(today, 2), deadline: subDays(today, 0),
    status: "pending",
    rows: [
      { id: 1, no: "1", itemName: "Ip", type: "Sintetik", unit: "kg", qty: 50, returnReason: "Sifatsiz" },
    ],
    editRequests: [], signatures: [], lockedBy: null, editApproved: false,
  },
  {
    id: "DOC-006", typeId: "5-TYX", docNumber: "5-TYX-023", title: "Talabnoma yuk xati",
    createdBy: 5, createdAt: subDays(today, 1), deadline: addDays(today, 1),
    status: "draft",
    model: "Model-B",
    rows: [
      { id: 1, no: "1", itemName: "Ip", type: "Paxta", unit: "kg", qty: 100 },
      { id: 2, no: "2", itemName: "Tugma", type: "Plastik", unit: "dona", qty: 500 },
    ],
    editRequests: [], signatures: [], lockedBy: null, editApproved: false,
  },
  {
    id: "DOC-007", typeId: "02-TM", docNumber: "02-TM-031", title: "Tayyor mahsulotlar kirim orderi",
    createdBy: 10, createdAt: subDays(today, 15), deadline: subDays(today, 13),
    status: "signed",
    rows: [
      { id: 1, no: "1", itemName: "Ko'ylak", sort: "1-sort", type: "Yozgi", unit: "dona", qty: 150 },
    ],
    editRequests: [], signatures: [{ userId: 10, name: "Sodiqov Jasur", time: subDays(today, 14) }],
    lockedBy: null, editApproved: false,
  },
];
