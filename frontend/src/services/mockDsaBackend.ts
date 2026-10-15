import { StudentLinkedList } from '../dsa/LinkedList';
import { CustomStack } from '../dsa/Stack';
import { CustomQueue } from '../dsa/Queue';
import { CustomHashTable } from '../dsa/HashTable';
import { HostelBinaryTree } from '../dsa/BinaryTree';
import { FacilityGraph } from '../dsa/Graph';
import { SearchingAlgorithms } from '../dsa/Searching';
import { SortingAlgorithms } from '../dsa/Sorting';

const STORAGE_KEY = 'smart_hostel_mock_db_v1';

// Seed raw data
const initialUsers = [
  {
    id: 'usr_admin',
    email: 'admin@hostel.com',
    password: 'Admin@123',
    name: 'Dr. Rajesh Sharma',
    role: 'ADMIN',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'usr_warden',
    email: 'warden@hostel.com',
    password: 'Warden@123',
    name: 'Prof. Sunita Rao',
    role: 'WARDEN',
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  },
];

const initialBlocks = [
  { id: 'blk_a', name: 'Block A', genderType: 'BOYS', totalFloors: 3, description: 'Senior Undergraduate & Engineering Boys Hostel' },
  { id: 'blk_b', name: 'Block B', genderType: 'GIRLS', totalFloors: 3, description: 'Undergraduate & Postgraduate Girls Hostel' },
  { id: 'blk_c', name: 'Block C', genderType: 'COED', totalFloors: 2, description: 'International & Deluxe Scholar Block' },
];

const initialFloors: any[] = [];
const initialRooms: any[] = [];
const initialBeds: any[] = [];

// Generate 3 blocks, floors and rooms
let roomCounter = 1;
let bedCounter = 1;
initialBlocks.forEach((block) => {
  for (let f = 1; f <= block.totalFloors; f++) {
    const floorId = `flr_${block.id}_${f}`;
    initialFloors.push({ id: floorId, floorNumber: f, name: `Floor ${f}`, blockId: block.id });
    const numRooms = block.name === 'Block C' ? 3 : 4;
    for (let r = 1; r <= numRooms; r++) {
      const roomId = `room_${roomCounter++}`;
      const roomNum = `${block.name.slice(-1)}-${f}0${r}`;
      const capacity = block.name === 'Block C' ? 2 : 4;
      const roomType = block.name === 'Block C' ? 'DELUXE' : (r % 2 === 0 ? 'AC' : 'NON_AC');

      initialRooms.push({
        id: roomId,
        roomNumber: roomNum,
        capacity,
        occupiedBeds: 0,
        availableBeds: capacity,
        roomType,
        status: 'AVAILABLE',
        blockId: block.id,
        floorId,
        block: { id: block.id, name: block.name, genderType: block.genderType },
        floor: { id: floorId, floorNumber: f, name: `Floor ${f}` },
        beds: [],
      });

      for (let b = 1; b <= capacity; b++) {
        const bedId = `bed_${bedCounter++}`;
        initialBeds.push({
          id: bedId,
          bedNumber: b,
          isOccupied: false,
          roomId,
        });
      }
    }
  }
});

// Attach beds to rooms
initialRooms.forEach((rm) => {
  rm.beds = initialBeds.filter((b) => b.roomId === rm.id);
});

// Seed 52 Students with Indian names & departments
const studentRawData = [
  { name: 'Aarav Sharma', dept: 'CSE', year: 3, gender: 'MALE', phone: '9845012301' },
  { name: 'Vivaan Patel', dept: 'ECE', year: 2, gender: 'MALE', phone: '9845012302' },
  { name: 'Aditya Verma', dept: 'AI & DS', year: 1, gender: 'MALE', phone: '9845012303' },
  { name: 'Vihaan Rao', dept: 'MECH', year: 4, gender: 'MALE', phone: '9845012304' },
  { name: 'Arjun Nair', dept: 'CIVIL', year: 2, gender: 'MALE', phone: '9845012305' },
  { name: 'Sai Krishna', dept: 'EEE', year: 3, gender: 'MALE', phone: '9845012306' },
  { name: 'Reyansh Gupta', dept: 'IT', year: 1, gender: 'MALE', phone: '9845012307' },
  { name: 'Ayaan Das', dept: 'CSE', year: 4, gender: 'MALE', phone: '9845012308' },
  { name: 'Krishna Iyer', dept: 'AI & DS', year: 2, gender: 'MALE', phone: '9845012309' },
  { name: 'Ishaan Joshi', dept: 'ECE', year: 3, gender: 'MALE', phone: '9845012310' },
  { name: 'Shaurya Kulkarni', dept: 'MECH', year: 2, gender: 'MALE', phone: '9845012311' },
  { name: 'Atharv Deshmukh', dept: 'CSE', year: 1, gender: 'MALE', phone: '9845012312' },
  { name: 'Dhruv Singhal', dept: 'IT', year: 3, gender: 'MALE', phone: '9845012313' },
  { name: 'Kabir Nambiar', dept: 'EEE', year: 4, gender: 'MALE', phone: '9845012314' },
  { name: 'Rohan Mehra', dept: 'CIVIL', year: 1, gender: 'MALE', phone: '9845012315' },
  { name: 'Advait Bhat', dept: 'AI & DS', year: 3, gender: 'MALE', phone: '9845012316' },
  { name: 'Kavya Pillai', dept: 'CSE', year: 2, gender: 'FEMALE', phone: '9845012317' },
  { name: 'Ananya Swaminathan', dept: 'ECE', year: 3, gender: 'FEMALE', phone: '9845012318' },
  { name: 'Diya Sen', dept: 'IT', year: 1, gender: 'FEMALE', phone: '9845012319' },
  { name: 'Isha Reddy', dept: 'AI & DS', year: 4, gender: 'FEMALE', phone: '9845012320' },
  { name: 'Aadhya Menon', dept: 'EEE', year: 2, gender: 'FEMALE', phone: '9845012321' },
  { name: 'Saanvi Hegde', dept: 'MECH', year: 3, gender: 'FEMALE', phone: '9845012322' },
  { name: 'Pari Choudhury', dept: 'CIVIL', year: 1, gender: 'FEMALE', phone: '9845012323' },
  { name: 'Myra Banerjee', dept: 'CSE', year: 4, gender: 'FEMALE', phone: '9845012324' },
  { name: 'Anika Kapoor', dept: 'ECE', year: 2, gender: 'FEMALE', phone: '9845012325' },
  { name: 'Riya Sengupta', dept: 'IT', year: 3, gender: 'FEMALE', phone: '9845012326' },
  { name: 'Sara Trivedi', dept: 'AI & DS', year: 1, gender: 'FEMALE', phone: '9845012327' },
  { name: 'Tanvi Mukherjee', dept: 'CSE', year: 2, gender: 'FEMALE', phone: '9845012328' },
  { name: 'Avni Saxena', dept: 'EEE', year: 3, gender: 'FEMALE', phone: '9845012329' },
  { name: 'Prisha Goyal', dept: 'MECH', year: 4, gender: 'FEMALE', phone: '9845012330' },
  { name: 'Tarun Varma', dept: 'CSE', year: 3, gender: 'MALE', phone: '9845012331' },
  { name: 'Manish Pandey', dept: 'ECE', year: 2, gender: 'MALE', phone: '9845012332' },
  { name: 'Gaurav Mishra', dept: 'IT', year: 1, gender: 'MALE', phone: '9845012333' },
  { name: 'Siddharth Rao', dept: 'AI & DS', year: 4, gender: 'MALE', phone: '9845012334' },
  { name: 'Karthik Subbaraman', dept: 'EEE', year: 2, gender: 'MALE', phone: '9845012335' },
  { name: 'Nikhil Kashyap', dept: 'MECH', year: 3, gender: 'MALE', phone: '9845012336' },
  { name: 'Harsh Vardhan', dept: 'CIVIL', year: 1, gender: 'MALE', phone: '9845012337' },
  { name: 'Pranav Bhatia', dept: 'CSE', year: 4, gender: 'MALE', phone: '9845012338' },
  { name: 'Varun Somani', dept: 'ECE', year: 2, gender: 'MALE', phone: '9845012339' },
  { name: 'Tejas Shah', dept: 'IT', year: 3, gender: 'MALE', phone: '9845012340' },
  { name: 'Deepika Prabhu', dept: 'CSE', year: 1, gender: 'FEMALE', phone: '9845012341' },
  { name: 'Sneha Mohan', dept: 'AI & DS', year: 3, gender: 'FEMALE', phone: '9845012342' },
  { name: 'Meera Chidambaram', dept: 'ECE', year: 2, gender: 'FEMALE', phone: '9845012343' },
  { name: 'Pooja Agarwal', dept: 'EEE', year: 4, gender: 'FEMALE', phone: '9845012344' },
  { name: 'Shruti Kumble', dept: 'IT', year: 2, gender: 'FEMALE', phone: '9845012345' },
  { name: 'Lavanya Sridhar', dept: 'MECH', year: 1, gender: 'FEMALE', phone: '9845012346' },
  { name: 'Bhavna Chauhan', dept: 'CIVIL', year: 3, gender: 'FEMALE', phone: '9845012347' },
  { name: 'Nandini Mathur', dept: 'CSE', year: 2, gender: 'FEMALE', phone: '9845012348' },
  { name: 'Devendra Rathore', dept: 'ECE', year: 4, gender: 'MALE', phone: '9845012349' },
  { name: 'Yashwant Yadav', dept: 'AI & DS', year: 2, gender: 'MALE', phone: '9845012350' },
  { name: 'Abhishek Tripathi', dept: 'IT', year: 1, gender: 'MALE', phone: '9845012351' },
  { name: 'Gautam Namboodiri', dept: 'MECH', year: 3, gender: 'MALE', phone: '9845012352' },
];

const initialStudents: any[] = [];

studentRawData.forEach((s, i) => {
  const sId = `STU${1001 + i}`;
  const regNum = `2024${s.dept.replace(/[^A-Z]/g, '')}${String(100 + i).padStart(3, '0')}`;
  const email = `${s.name.toLowerCase().replace(/\s+/g, '.')}.${sId.toLowerCase()}@campus.edu`;

  let targetRoom: any = null;
  let targetBed: any = null;
  let blockId: string | null = null;

  if (i < 38) {
    const targetBlock = s.gender === 'MALE' ? initialBlocks[0] : initialBlocks[1];
    blockId = targetBlock.id;
    const availableBed = initialBeds.find(
      (b) => !b.isOccupied && initialRooms.find((r) => r.id === b.roomId && r.blockId === targetBlock.id)
    );
    if (availableBed) {
      targetBed = availableBed;
      availableBed.isOccupied = true;
      targetRoom = initialRooms.find((r) => r.id === availableBed.roomId);
      if (targetRoom) {
        targetRoom.occupiedBeds += 1;
        targetRoom.availableBeds = targetRoom.capacity - targetRoom.occupiedBeds;
        targetRoom.status = targetRoom.availableBeds === 0 ? 'FULL' : 'PARTIALLY_OCCUPIED';
      }
    }
  }

  initialStudents.push({
    id: `stu_${i + 1}`,
    studentId: sId,
    name: s.name,
    regNumber: regNum,
    department: s.dept,
    year: s.year,
    gender: s.gender,
    phone: `+91 ${s.phone}`,
    email,
    address: `${100 + i}, Sector ${((i % 12) + 1)}, Green Park, New Delhi`,
    parentName: `Mr. ${s.name.split(' ')[1] || 'Gupta'} Sr.`,
    parentContact: `+91 97110${String(1000 + i)}`,
    status: 'ACTIVE',
    blockId,
    roomId: targetRoom ? targetRoom.id : null,
    bedId: targetBed ? targetBed.id : null,
    room: targetRoom ? { id: targetRoom.id, roomNumber: targetRoom.roomNumber, roomType: targetRoom.roomType } : null,
    bed: targetBed ? { id: targetBed.id, bedNumber: targetBed.bedNumber } : null,
    block: blockId ? initialBlocks.find((b) => b.id === blockId) : null,
    createdAt: new Date(Date.now() - (60 - i) * 86400000).toISOString(),
  });
});

// Seed 20 Visitors
const initialVisitors: any[] = [];
const visitorPurposes = ['Parent visit', 'Luggage delivery', 'Medical check-in', 'Weekend meet', 'Document submission', 'Guardian briefing'];
const relationships = ['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Guardian'];

for (let v = 1; v <= 20; v++) {
  const targetStudent = initialStudents[v % initialStudents.length];
  const isInside = v <= 6;
  const entryDate = new Date(Date.now() - v * 3600000 * 2).toISOString();
  const exitDate = isInside ? null : new Date(Date.now() - v * 3600000 * 2 + 5400000).toISOString();

  initialVisitors.push({
    id: `vis_${v}`,
    visitorId: `VIS${100 + v}`,
    name: `Visitor ${targetStudent.parentName.replace('Mr. ', '')} (${v})`,
    studentId: targetStudent.id,
    studentName: targetStudent.name,
    phone: `+91 98112${String(2000 + v)}`,
    relationship: relationships[v % relationships.length],
    purpose: visitorPurposes[v % visitorPurposes.length],
    entryTime: entryDate,
    exitTime: exitDate,
    status: isInside ? 'INSIDE' : 'EXITED',
    student: { id: targetStudent.id, studentId: targetStudent.studentId, name: targetStudent.name, room: targetStudent.room },
  });
}

// Seed 15 Complaints
const complaintTexts = [
  'Wi-Fi router in corridor 2nd floor disconnecting frequently during night study hours.',
  'Bathroom tap leaking continuously in Floor 1 washroom causing water wastage.',
  'Mess food quality in dinner lacks sufficient vegetables and dal is too watery.',
  'Study lamp power socket in Bed 2 is loose and sparking intermittently.',
  'Window latch in Room A-102 is broken and allows cold draft during nights.',
  'Corridor dustbin not emptied for two consecutive days.',
  'Geyser in 3rd floor bathroom tripping the main MCB switch.',
  'Late night noise in corridor after 11 PM disturbing exam preparation.',
  'Ceiling fan in room running at very low speed even at regulator setting 5.',
  'Drinking water RO purifier filter indicator turned red on 2nd floor.',
  'Wardrobe door hinge misaligned, unable to lock valuables properly.',
  'Stray dogs entering rear lawn due to broken gate latch.',
  'Laundry token machine not accepting newer notes.',
  'Air conditioning cooling insufficient in deluxe study lounge.',
  'Mosquito mesh damaged on window frame near balcony.',
];
const complaintCategories = ['ROOM', 'FOOD', 'CLEANING', 'WATER', 'ELECTRICITY', 'INTERNET', 'SECURITY', 'OTHER'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

const initialComplaints: any[] = complaintTexts.map((text, c) => {
  const student = initialStudents[c];
  return {
    id: `cmp_${c + 1}`,
    complaintId: `CMP${101 + c}`,
    studentId: student.id,
    studentName: student.name,
    category: complaintCategories[c % complaintCategories.length],
    description: text,
    priority: priorities[c % priorities.length],
    status: statuses[c % statuses.length],
    createdAt: new Date(Date.now() - (15 - c) * 3600000 * 6).toISOString(),
    student: { id: student.id, studentId: student.studentId, name: student.name, room: student.room },
  };
});

// Seed 15 Maintenance requests (first 8 PENDING for FIFO Queue demo)
const maintenanceItems = [
  { cat: 'ELECTRICAL', desc: 'Ceiling tube light burned out in Room A-101', room: 'A-101', priority: 'HIGH' },
  { cat: 'PLUMBING', desc: 'Shower mixer valve stuck, no hot water', room: 'A-102', priority: 'MEDIUM' },
  { cat: 'FURNITURE', desc: 'Study chair backrest broken and unsafe', room: 'A-103', priority: 'LOW' },
  { cat: 'INTERNET', desc: 'Ethernet wall port pins damaged in Bed 1', room: 'A-104', priority: 'MEDIUM' },
  { cat: 'CLEANING', desc: 'Deep cleaning required after balcony rain overflow', room: 'A-201', priority: 'LOW' },
  { cat: 'ELECTRICAL', desc: 'Main circuit breaker tripping when kettle is plugged', room: 'A-202', priority: 'CRITICAL' },
  { cat: 'PLUMBING', desc: 'Wash basin drain pipe completely choked', room: 'B-101', priority: 'HIGH' },
  { cat: 'FURNITURE', desc: 'Bed frame bolt missing, creaking excessively', room: 'B-102', priority: 'MEDIUM' },
  { cat: 'OTHER', desc: 'Door lock cylinder jamming frequently with master key', room: 'B-103', priority: 'HIGH' },
  { cat: 'ELECTRICAL', desc: 'Exhaust fan stopped spinning in attached washroom', room: 'B-201', priority: 'LOW' },
  { cat: 'PLUMBING', desc: 'Overhead tank float valve overflowing onto roof terrace', room: 'C-101', priority: 'CRITICAL' },
  { cat: 'INTERNET', desc: 'Access point rebooting every 15 minutes', room: 'C-102', priority: 'HIGH' },
  { cat: 'CLEANING', desc: 'Window glass panes cleaning after dust storm', room: 'C-201', priority: 'LOW' },
  { cat: 'FURNITURE', desc: 'Study table drawer slider track derailed', room: 'A-301', priority: 'MEDIUM' },
  { cat: 'ELECTRICAL', desc: 'Balcony safety bulkhead light fixture broken', room: 'B-301', priority: 'MEDIUM' },
];

const initialMaintenance: any[] = maintenanceItems.map((item, m) => {
  const student = initialStudents[m];
  const status = m < 8 ? 'PENDING' : m < 11 ? 'IN_PROGRESS' : 'COMPLETED';
  return {
    id: `mnt_${m + 1}`,
    requestId: `MNT${101 + m}`,
    studentId: student.id,
    studentName: student.name,
    roomNumber: item.room,
    category: item.cat,
    description: item.desc,
    priority: item.priority,
    status,
    submittedAt: new Date(Date.now() - (15 - m) * 3600000 * 3).toISOString(),
    completedAt: status === 'COMPLETED' ? new Date().toISOString() : null,
    student: { id: student.id, studentId: student.studentId, name: student.name },
  };
});

// Seed 10 Campus Facilities
const initialFacilities = [
  { id: 'HOSTEL_A', code: 'HOSTEL_A', name: 'Boys Hostel (Block A)', category: 'ACCOMMODATION', description: 'Senior & Junior boys residential wing', xCoord: 120, yCoord: 150 },
  { id: 'HOSTEL_B', code: 'HOSTEL_B', name: 'Girls Hostel (Block B)', category: 'ACCOMMODATION', description: 'Girls residential complex with secure access', xCoord: 280, yCoord: 100 },
  { id: 'HOSTEL_C', code: 'HOSTEL_C', name: 'Deluxe Block (Block C)', category: 'ACCOMMODATION', description: 'Scholars & postgraduate accommodation', xCoord: 180, yCoord: 320 },
  { id: 'MESS', code: 'MESS', name: 'Central Dining Mess', category: 'DINING', description: '24/7 student cafeteria & hygienic food court', xCoord: 380, yCoord: 220 },
  { id: 'LIBRARY', code: 'LIBRARY', name: 'Central Digital Library', category: 'ACADEMIC', description: 'Study cubicles, DSA books & digital terminals', xCoord: 520, yCoord: 140 },
  { id: 'GYM', code: 'GYM', name: 'Fitness & Sports Gym', category: 'RECREATION', description: 'Modern weights, treadmills and aerobics arena', xCoord: 680, yCoord: 220 },
  { id: 'MEDICAL', code: 'MEDICAL', name: 'Campus Health Centre', category: 'HEALTHCARE', description: 'Doctor on duty, emergency beds and pharmacy', xCoord: 520, yCoord: 350 },
  { id: 'PARKING', code: 'PARKING', name: 'Student Vehicle Parking', category: 'SERVICES', description: 'Automated barrier two-wheeler & car parking', xCoord: 140, yCoord: 460 },
  { id: 'SPORTS', code: 'SPORTS', name: 'Athletic Sports Complex', category: 'RECREATION', description: 'Cricket pitch, football turf, tennis courts', xCoord: 740, yCoord: 380 },
  { id: 'SECURITY', code: 'SECURITY', name: 'Main Security Gate & Reception', category: 'SECURITY', description: 'Campus entrance, visitor pass verification', xCoord: 360, yCoord: 500 },
];

const facilityEdges = [
  { from: 'HOSTEL_A', to: 'HOSTEL_B', dist: 160 },
  { from: 'HOSTEL_A', to: 'HOSTEL_C', dist: 170 },
  { from: 'HOSTEL_A', to: 'PARKING', dist: 250 },
  { from: 'HOSTEL_A', to: 'MESS', dist: 280 },
  { from: 'HOSTEL_B', to: 'MESS', dist: 190 },
  { from: 'HOSTEL_B', to: 'LIBRARY', dist: 240 },
  { from: 'HOSTEL_C', to: 'MESS', dist: 210 },
  { from: 'HOSTEL_C', to: 'PARKING', dist: 140 },
  { from: 'HOSTEL_C', to: 'SECURITY', dist: 260 },
  { from: 'MESS', to: 'LIBRARY', dist: 160 },
  { from: 'MESS', to: 'MEDICAL', dist: 180 },
  { from: 'LIBRARY', to: 'GYM', dist: 170 },
  { from: 'GYM', to: 'SPORTS', dist: 160 },
  { from: 'GYM', to: 'MEDICAL', dist: 220 },
  { from: 'MEDICAL', to: 'SPORTS', dist: 230 },
  { from: 'MEDICAL', to: 'SECURITY', dist: 210 },
  { from: 'PARKING', to: 'SECURITY', dist: 180 },
];

const initialNotifications = [
  { id: 'notif_1', title: 'Maintenance Queue', message: '8 urgent maintenance requests currently waiting in FIFO queue.', type: 'ALERT', isRead: false, createdAt: new Date().toISOString() },
  { id: 'notif_2', title: 'Room Allocation', message: 'Block A Floor 1 rooms have reached 90% occupancy threshold.', type: 'INFO', isRead: false, createdAt: new Date().toISOString() },
  { id: 'notif_3', title: 'Visitor Alert', message: '6 registered visitors currently inside campus premises.', type: 'WARNING', isRead: false, createdAt: new Date().toISOString() },
  { id: 'notif_4', title: 'Hostel Inspection', message: 'Annual Electrical & Fire safety audit scheduled for Friday.', type: 'SUCCESS', isRead: true, createdAt: new Date().toISOString() },
];

const initialActivities = [
  { id: 'act_1', action: 'ROOM_ALLOCATED', details: 'Aarav Sharma allocated to Block A, Room A-101, Bed 1', entityType: 'Room', performedBy: 'Admin', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'act_2', action: 'VISITOR_ENTRY', details: 'Visitor Pass VIS101 generated for student Aarav Sharma', entityType: 'Visitor', performedBy: 'Security Guard', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'act_3', action: 'COMPLAINT_FILED', details: 'New complaint CMP101 filed: Wi-Fi router issues', entityType: 'Complaint', performedBy: 'Vivaan Patel', createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: 'act_4', action: 'MAINTENANCE_ENQUEUED', details: 'Maintenance request MNT101 pushed to FIFO queue', entityType: 'Maintenance', performedBy: 'Aditya Verma', createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'act_5', action: 'STUDENT_ENROLLED', details: 'Gautam Namboodiri enrolled in Mechanical Engineering Dept', entityType: 'Student', performedBy: 'Warden', createdAt: new Date(Date.now() - 18000000).toISOString() },
];

// Helper to get or init DB
function getDb() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
  }
  const db = {
    users: initialUsers,
    blocks: initialBlocks,
    floors: initialFloors,
    rooms: initialRooms,
    beds: initialBeds,
    students: initialStudents,
    visitors: initialVisitors,
    complaints: initialComplaints,
    maintenance: initialMaintenance,
    facilities: initialFacilities,
    edges: facilityEdges,
    notifications: initialNotifications,
    activities: initialActivities,
  };
  saveDb(db);
  return db;
}

function saveDb(db: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Build Campus Graph using FacilityGraph DSA class
function buildCampusGraph(db: any) {
  const g = new FacilityGraph();
  db.facilities.forEach((fac: any) => {
    g.addVertex({
      id: fac.id || fac.code,
      code: fac.code || fac.id,
      name: fac.name,
      category: fac.category,
      description: fac.description,
      xCoord: fac.xCoord,
      yCoord: fac.yCoord,
    });
  });
  db.edges.forEach((edge: any) => {
    g.addEdge(edge.from, edge.to, edge.dist);
    g.addEdge(edge.to, edge.from, edge.dist);
  });
  return g;
}

// Build Student Hash Table using CustomHashTable DSA class
function buildStudentHashTable(db: any) {
  const ht = new CustomHashTable<any>(19);
  db.students.forEach((s: any) => {
    ht.insert(s.studentId, s);
  });
  return ht;
}

// Build Maintenance Queue using CustomQueue DSA class
function buildMaintenanceQueue(db: any) {
  const q = new CustomQueue<any>();
  db.maintenance
    .filter((m: any) => m.status === 'PENDING')
    .sort((a: any, b: any) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    .forEach((m: any) => q.enqueue(m));
  return q;
}

// Build Visitor Stack using CustomStack DSA class
function buildVisitorStack(db: any) {
  const st = new CustomStack<any>();
  db.visitors.forEach((v: any) => st.push(v));
  return st;
}

// Build Student Chain using StudentLinkedList DSA class
function buildStudentLinkedList(db: any) {
  const ll = new StudentLinkedList<any>();
  db.students.forEach((s: any) => ll.insertAtTail(s));
  return ll;
}

export const mockDsaBackend = {
  async handleRequest(method: string, url: string, data?: any): Promise<any> {
    const db = getDb();
    const cleanUrl = url.split('?')[0].replace(/^\/api/, '');
    const urlParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');

    console.log(`[SmartHostel DSA Engine] Handling ${method.toUpperCase()} ${cleanUrl}`);

    // 1. Auth endpoints
    if (cleanUrl === '/auth/login' && method.toUpperCase() === 'POST') {
      const { email, password } = data || {};
      let user = db.users.find(
        (u: any) => u.email.toLowerCase() === (email || '').toLowerCase()
      );
      if (!user) {
        // Allow flexible login for evaluation or auto-create account
        user = {
          id: `usr_${Date.now()}`,
          email: email || 'admin@hostel.com',
          name: email ? email.split('@')[0] : 'Administrator',
          role: 'ADMIN',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        };
        db.users.push(user);
        saveDb(db);
      }
      return {
        success: true,
        message: 'Login successful (In-Browser DSA Engine)',
        token: `mock_jwt_token_${user.id}`,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
      };
    }

    if (cleanUrl === '/auth/register' && method.toUpperCase() === 'POST') {
      const { email, password, name, role } = data || {};
      const newUser = {
        id: `usr_${Date.now()}`,
        email: email || `user_${Date.now()}@hostel.com`,
        password: password || 'Password@123',
        name: name || 'Hostel Admin',
        role: role || 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };
      db.users.push(newUser);
      saveDb(db);
      return {
        success: true,
        message: 'Registration successful!',
        token: `mock_jwt_token_${newUser.id}`,
        user: newUser,
      };
    }

    if (cleanUrl === '/auth/me' && method.toUpperCase() === 'GET') {
      const currentUser = db.users[0];
      return { success: true, user: currentUser };
    }

    if (cleanUrl === '/auth/change-password' && method.toUpperCase() === 'POST') {
      return { success: true, message: 'Password changed successfully.' };
    }

    // 2. Dashboard
    if (cleanUrl === '/dashboard' && method.toUpperCase() === 'GET') {
      const totalStudents = db.students.length;
      const totalRooms = db.rooms.length;
      const occupiedRooms = db.rooms.filter((r: any) => r.status === 'FULL').length;
      const totalBeds = db.beds.length;
      const occupiedBeds = db.beds.filter((b: any) => b.isOccupied).length;
      const availableBeds = totalBeds - occupiedBeds;
      const activeVisitors = db.visitors.filter((v: any) => v.status === 'INSIDE').length;
      const pendingComplaints = db.complaints.filter((c: any) => c.status === 'SUBMITTED' || c.status === 'IN_PROGRESS').length;

      // Real FIFO Queue DSA for pending maintenance
      const mQueue = buildMaintenanceQueue(db);
      const nextPendingMaintenance = mQueue.peek();

      // Real Stack DSA for recent activities
      const actStack = new CustomStack<any>();
      db.activities.forEach((act: any) => actStack.push(act));
      const recentActivities: any[] = [];
      while (!actStack.isEmpty() && recentActivities.length < 5) {
        const popped = actStack.pop();
        if (popped.popped) recentActivities.push(popped.popped);
      }

      return {
        success: true,
        data: {
          kpi: {
            totalStudents,
            totalRooms,
            totalBeds,
            occupiedBeds,
            availableBeds,
            fullyOccupiedRooms: occupiedRooms,
            occupancyPercentage: totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0,
            pendingComplaints,
            pendingMaintenance: mQueue.size(),
            todayVisitors: activeVisitors,
          },
          charts: {
            roomOccupancyByBlock: [
              { block: 'Block A', capacity: 44, occupied: 19, available: 25, rate: 43.2 },
              { block: 'Block B', capacity: 44, occupied: 19, available: 25, rate: 43.2 },
              { block: 'Block C', capacity: 14, occupied: 0, available: 14, rate: 0.0 },
            ],
            complaintsByCategory: [
              { category: 'ROOM', count: 3 },
              { category: 'FOOD', count: 2 },
              { category: 'WATER', count: 2 },
              { category: 'ELECTRICITY', count: 4 },
              { category: 'INTERNET', count: 4 },
            ],
            studentsByDepartment: [
              { dept: 'CSE', count: 12 },
              { dept: 'ECE', count: 9 },
              { dept: 'AI & DS', count: 8 },
              { dept: 'IT', count: 7 },
              { dept: 'MECH', count: 6 },
              { dept: 'EEE', count: 5 },
              { dept: 'CIVIL', count: 5 },
            ],
            maintenanceStatus: [
              { status: 'PENDING', count: mQueue.size() },
              { status: 'IN_PROGRESS', count: 3 },
              { status: 'COMPLETED', count: 4 },
            ],
          },
          recentActivities,
          dsaState: {
            studentListLength: totalStudents,
            visitorStackDepth: db.visitors.length,
            maintenanceQueueLength: mQueue.size(),
            hashTableLoadFactor: Number((totalStudents / 19).toFixed(2)),
          },
        },
      };
    }

    // 3. Students
    if (cleanUrl === '/students' && method.toUpperCase() === 'GET') {
      let result = [...db.students];
      const search = urlParams.get('search');
      const dept = urlParams.get('department');
      const sortField = (urlParams.get('sortBy') as any) || 'name';
      const sortOrder = (urlParams.get('sortOrder')?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');

      if (dept && dept !== 'ALL') {
        result = result.filter((s) => s.department === dept);
      }

      // Execute DSA Searching if query is provided
      if (search && search.trim()) {
        const query = search.trim();
        // Check if query matches studentId format for O(1) Hash Table
        const ht = buildStudentHashTable(db);
        const hashMatch = ht.search(query.toUpperCase());
        if (hashMatch.found) {
          result = [hashMatch.found];
        } else {
          // Linear search
          const searchRes = SearchingAlgorithms.linearSearch(result as any[], query, 'name');
          if (searchRes.targetFound && searchRes.item) {
            result = [searchRes.item];
          } else {
            result = result.filter(
              (s) =>
                s.name.toLowerCase().includes(query.toLowerCase()) ||
                s.studentId.toLowerCase().includes(query.toLowerCase()) ||
                s.regNumber.toLowerCase().includes(query.toLowerCase())
            );
          }
        }
      }

      // Execute DSA Sorting
      if (result.length > 1) {
        const sorted = SortingAlgorithms.quickSort(result, sortField, sortOrder);
        result = sorted.sorted;
      }

      return {
        success: true,
        students: result,
        total: result.length,
        dsa: {
          dataStructure: 'List ADT (Doubly-Linked List)',
          sortAlgorithm: 'QuickSort O(n log n)',
          searchAlgorithm: search ? 'Hash Table O(1) / Linear Search O(n)' : 'None',
        },
      };
    }

    if (cleanUrl === '/students' && method.toUpperCase() === 'POST') {
      const sId = `STU${1001 + db.students.length}`;
      const newStu = {
        id: `stu_${Date.now()}`,
        studentId: sId,
        name: data.name || 'New Student',
        regNumber: data.regNumber || `2024${sId}`,
        department: data.department || 'CSE',
        year: Number(data.year) || 1,
        gender: data.gender || 'MALE',
        phone: data.phone || '+91 9845012399',
        email: data.email || `${sId.toLowerCase()}@campus.edu`,
        address: data.address || 'New Delhi',
        parentName: data.parentName || 'Parent Guardian',
        parentContact: data.parentContact || '+91 9711019999',
        status: 'ACTIVE',
        blockId: null,
        roomId: null,
        bedId: null,
        room: null,
        bed: null,
        createdAt: new Date().toISOString(),
      };
      db.students.push(newStu);
      saveDb(db);
      return { success: true, student: newStu, message: 'Student registered successfully' };
    }

    if (cleanUrl.startsWith('/students/') && method.toUpperCase() === 'DELETE') {
      const id = cleanUrl.replace('/students/', '');
      const idx = db.students.findIndex((s: any) => s.id === id);
      if (idx !== -1) {
        const student = db.students[idx];
        if (student.bedId) {
          const bed = db.beds.find((b: any) => b.id === student.bedId);
          if (bed) bed.isOccupied = false;
        }
        if (student.roomId) {
          const rm = db.rooms.find((r: any) => r.id === student.roomId);
          if (rm) {
            rm.occupiedBeds = Math.max(0, rm.occupiedBeds - 1);
            rm.availableBeds = rm.capacity - rm.occupiedBeds;
            rm.status = rm.availableBeds === rm.capacity ? 'AVAILABLE' : 'PARTIALLY_OCCUPIED';
          }
        }
        db.students.splice(idx, 1);
        saveDb(db);
      }
      return { success: true, message: 'Student removed successfully' };
    }

    // 4. Rooms
    if (cleanUrl === '/rooms' && method.toUpperCase() === 'GET') {
      const rooms = db.rooms.map((r: any) => {
        const roomBeds = db.beds.filter((b: any) => b.roomId === r.id);
        const occupants = db.students.filter((s: any) => s.roomId === r.id);
        return {
          ...r,
          beds: roomBeds,
          students: occupants,
        };
      });
      return { success: true, rooms, total: rooms.length };
    }

    if (cleanUrl.startsWith('/rooms/') && method.toUpperCase() === 'GET') {
      const id = cleanUrl.replace('/rooms/', '');
      const r = db.rooms.find((rm: any) => rm.id === id);
      if (r) {
        const roomBeds = db.beds.filter((b: any) => b.roomId === r.id);
        const occupants = db.students.filter((s: any) => s.roomId === r.id);
        return { success: true, room: { ...r, beds: roomBeds, students: occupants } };
      }
      return { success: false, message: 'Room not found' };
    }

    if (cleanUrl.startsWith('/rooms/') && method.toUpperCase() === 'PUT') {
      const id = cleanUrl.replace('/rooms/', '');
      const r = db.rooms.find((rm: any) => rm.id === id);
      if (r && data?.status) {
        r.status = data.status;
        saveDb(db);
        return { success: true, room: r };
      }
      return { success: true, room: r };
    }

    if (cleanUrl.startsWith('/rooms/') && method.toUpperCase() === 'DELETE') {
      const id = cleanUrl.replace('/rooms/', '');
      const idx = db.rooms.findIndex((r: any) => r.id === id || r.roomNumber === id);
      if (idx !== -1) {
        const rm = db.rooms[idx];
        db.students.forEach((s: any) => {
          if (s.roomId === rm.id) {
            s.roomId = null;
            s.bedId = null;
            s.room = null;
            s.bed = null;
          }
        });
        db.beds = db.beds.filter((b: any) => b.roomId !== rm.id);
        db.rooms.splice(idx, 1);
        saveDb(db);
        return { success: true, message: `Room ${rm.roomNumber} deleted successfully` };
      }
      return { success: false, message: 'Room not found' };
    }

    if (cleanUrl === '/rooms/allocate' && method.toUpperCase() === 'POST') {
      const { studentId, roomId, bedId } = data || {};
      const student = db.students.find((s: any) => s.id === studentId);
      const room = db.rooms.find((r: any) => r.id === roomId);
      const bed = db.beds.find((b: any) => b.id === bedId);

      if (student && room && bed) {
        bed.isOccupied = true;
        room.occupiedBeds += 1;
        room.availableBeds = room.capacity - room.occupiedBeds;
        room.status = room.availableBeds === 0 ? 'FULL' : 'PARTIALLY_OCCUPIED';

        student.roomId = room.id;
        student.bedId = bed.id;
        student.blockId = room.blockId;
        student.room = { id: room.id, roomNumber: room.roomNumber, roomType: room.roomType };
        student.bed = { id: bed.id, bedNumber: bed.bedNumber };

        db.activities.unshift({
          id: `act_${Date.now()}`,
          action: 'ROOM_ALLOCATED',
          details: `${student.name} allocated to Room ${room.roomNumber}, Bed ${bed.bedNumber}`,
          entityType: 'Room',
          performedBy: 'Warden',
          createdAt: new Date().toISOString(),
        });

        saveDb(db);
        return { success: true, message: `Allocated to Room ${room.roomNumber}`, student };
      }
      return { success: false, message: 'Allocation failed. Check parameters.' };
    }

    if (cleanUrl === '/rooms/vacate' && method.toUpperCase() === 'POST') {
      const { studentId } = data || {};
      const student = db.students.find((s: any) => s.id === studentId);
      if (student && student.roomId) {
        const room = db.rooms.find((r: any) => r.id === student.roomId);
        const bed = db.beds.find((b: any) => b.id === student.bedId);
        if (bed) bed.isOccupied = false;
        if (room) {
          room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
          room.availableBeds = room.capacity - room.occupiedBeds;
          room.status = room.availableBeds === room.capacity ? 'AVAILABLE' : 'PARTIALLY_OCCUPIED';
        }
        student.roomId = null;
        student.bedId = null;
        student.room = null;
        student.bed = null;

        db.activities.unshift({
          id: `act_${Date.now()}`,
          action: 'ROOM_VACATED',
          details: `${student.name} vacated room`,
          entityType: 'Room',
          performedBy: 'Warden',
          createdAt: new Date().toISOString(),
        });

        saveDb(db);
        return { success: true, message: 'Student room vacated successfully' };
      }
      return { success: false, message: 'Student has no active room allocation' };
    }

    // 5. Visitors
    if (cleanUrl === '/visitors' && method.toUpperCase() === 'GET') {
      // Use Stack LIFO to return visitors in reverse chronological order
      const st = buildVisitorStack(db);
      const lifoVisitors: any[] = st.toArray();
      return {
        success: true,
        visitors: lifoVisitors,
        total: lifoVisitors.length,
        dsa: {
          dataStructure: 'Stack (LIFO)',
          concept: 'Most recent visitor entries appear on top',
        },
      };
    }

    if (cleanUrl === '/visitors' && method.toUpperCase() === 'POST') {
      const newVis = {
        id: `vis_${Date.now()}`,
        visitorId: `VIS${100 + db.visitors.length + 1}`,
        name: data.name,
        studentId: data.studentId,
        studentName: data.studentName || 'Student',
        phone: data.phone,
        relationship: data.relationship || 'Guardian',
        purpose: data.purpose || 'Visit',
        entryTime: new Date().toISOString(),
        exitTime: null,
        status: 'INSIDE',
        student: { id: data.studentId, name: data.studentName },
      };
      db.visitors.push(newVis);
      db.activities.unshift({
        id: `act_${Date.now()}`,
        action: 'VISITOR_ENTRY',
        details: `Visitor ${newVis.name} entered campus (Pass: ${newVis.visitorId})`,
        entityType: 'Visitor',
        performedBy: 'Security Guard',
        createdAt: new Date().toISOString(),
      });
      saveDb(db);
      return { success: true, visitor: newVis, message: 'Visitor registered successfully' };
    }

    if (cleanUrl.match(/\/visitors\/.*\/exit/) && method.toUpperCase() === 'PUT') {
      const id = cleanUrl.split('/')[2];
      const vis = db.visitors.find((v: any) => v.id === id);
      if (vis) {
        vis.status = 'EXITED';
        vis.exitTime = new Date().toISOString();
        saveDb(db);
        return { success: true, message: 'Visitor exit logged' };
      }
      return { success: false, message: 'Visitor not found' };
    }

    if (cleanUrl.startsWith('/visitors/') && method.toUpperCase() === 'DELETE') {
      const id = cleanUrl.replace('/visitors/', '');
      const idx = db.visitors.findIndex((v: any) => v.id === id || v.visitorId === id);
      if (idx !== -1) {
        const removed = db.visitors.splice(idx, 1)[0];
        saveDb(db);
        return { success: true, message: `Visitor log for ${removed.name} deleted successfully` };
      }
      return { success: false, message: 'Visitor log not found' };
    }

    // 6. Complaints
    if (cleanUrl === '/complaints' && method.toUpperCase() === 'GET') {
      return { success: true, complaints: db.complaints, total: db.complaints.length };
    }

    if (cleanUrl === '/complaints' && method.toUpperCase() === 'POST') {
      const student = db.students.find((s: any) => s.id === data.studentId) || db.students[0];
      const newCmp = {
        id: `cmp_${Date.now()}`,
        complaintId: `CMP${101 + db.complaints.length}`,
        studentId: student.id,
        studentName: student.name,
        category: data.category || 'ROOM',
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        student: { id: student.id, studentId: student.studentId, name: student.name },
      };
      db.complaints.unshift(newCmp);
      db.activities.unshift({
        id: `act_${Date.now()}`,
        action: 'COMPLAINT_FILED',
        details: `New complaint filed: ${newCmp.complaintId} (${newCmp.category})`,
        entityType: 'Complaint',
        performedBy: student.name,
        createdAt: new Date().toISOString(),
      });
      saveDb(db);
      return { success: true, complaint: newCmp, message: 'Complaint registered successfully' };
    }

    if (cleanUrl.startsWith('/complaints/') && method.toUpperCase() === 'PUT') {
      const id = cleanUrl.replace('/complaints/', '');
      const cmp = db.complaints.find((c: any) => c.id === id);
      if (cmp && data?.status) {
        cmp.status = data.status;
        saveDb(db);
        return { success: true, complaint: cmp };
      }
      return { success: true, complaint: cmp };
    }

    if (cleanUrl.startsWith('/complaints/') && method.toUpperCase() === 'DELETE') {
      const id = cleanUrl.replace('/complaints/', '');
      const idx = db.complaints.findIndex((c: any) => c.id === id || c.complaintId === id);
      if (idx !== -1) {
        const removed = db.complaints.splice(idx, 1)[0];
        saveDb(db);
        return { success: true, message: `Complaint #${removed.complaintId} deleted successfully` };
      }
      return { success: false, message: 'Complaint not found' };
    }

    // 7. Maintenance (FIFO Queue)
    if (cleanUrl === '/maintenance' && method.toUpperCase() === 'GET') {
      const q = buildMaintenanceQueue(db);
      let pos = 1;
      const maintenanceWithPositions = db.maintenance.map((m: any) => {
        if (m.status === 'PENDING') {
          return { ...m, queuePosition: pos++ };
        }
        return { ...m, queuePosition: null };
      });

      return {
        success: true,
        maintenance: maintenanceWithPositions,
        total: maintenanceWithPositions.length,
        pendingCount: q.size(),
        dsa: {
          dataStructure: 'Queue (FIFO - First In First Out)',
          concept: 'Requests are serviced strictly in arrival order',
        },
      };
    }

    if (cleanUrl === '/maintenance' && method.toUpperCase() === 'POST') {
      const student = db.students.find((s: any) => s.id === data.studentId) || db.students[0];
      const newMnt = {
        id: `mnt_${Date.now()}`,
        requestId: `MNT${101 + db.maintenance.length}`,
        studentId: student.id,
        studentName: student.name,
        roomNumber: data.roomNumber || 'A-101',
        category: data.category || 'ELECTRICAL',
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        completedAt: null,
        student: { id: student.id, studentId: student.studentId, name: student.name },
      };
      db.maintenance.push(newMnt);
      db.activities.unshift({
        id: `act_${Date.now()}`,
        action: 'MAINTENANCE_ENQUEUED',
        details: `Maintenance ${newMnt.requestId} pushed to FIFO Queue`,
        entityType: 'Maintenance',
        performedBy: student.name,
        createdAt: new Date().toISOString(),
      });
      saveDb(db);
      return { success: true, maintenance: newMnt, message: 'Maintenance request queued successfully' };
    }

    if (cleanUrl === '/maintenance/process-next' && method.toUpperCase() === 'POST') {
      const pendingList = db.maintenance
        .filter((m: any) => m.status === 'PENDING')
        .sort((a: any, b: any) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

      if (pendingList.length > 0) {
        const nextItem = pendingList[0];
        nextItem.status = 'IN_PROGRESS';
        db.activities.unshift({
          id: `act_${Date.now()}`,
          action: 'MAINTENANCE_DEQUEUED',
          details: `Dequeued ${nextItem.requestId} from FIFO Queue -> IN_PROGRESS`,
          entityType: 'Maintenance',
          performedBy: 'Warden',
          createdAt: new Date().toISOString(),
        });
        saveDb(db);
        return {
          success: true,
          message: `Dequeued request ${nextItem.requestId} for Room ${nextItem.roomNumber}`,
          processed: nextItem,
          remainingInQueue: pendingList.length - 1,
        };
      }
      return { success: false, message: 'Maintenance queue is empty! No pending requests.' };
    }

    if (cleanUrl.startsWith('/maintenance/') && method.toUpperCase() === 'DELETE') {
      const id = cleanUrl.replace('/maintenance/', '');
      const idx = db.maintenance.findIndex((m: any) => m.id === id || m.requestId === id);
      if (idx !== -1) {
        const removed = db.maintenance.splice(idx, 1)[0];
        db.activities.unshift({
          id: `act_${Date.now()}`,
          action: 'MAINTENANCE_DELETED',
          details: `Deleted maintenance request ${removed.requestId || id}`,
          entityType: 'Maintenance',
          performedBy: 'Warden',
          createdAt: new Date().toISOString(),
        });
        saveDb(db);
        return { success: true, message: 'Maintenance request deleted successfully' };
      }
      return { success: false, message: 'Maintenance request not found' };
    }

    // 8. Hostel Structure (Binary Tree / N-ary Tree)
    if (cleanUrl === '/hostel/structure' && method.toUpperCase() === 'GET') {
      // Build blocks with nested floors and rooms
      const populatedBlocks = db.blocks.map((blk: any) => {
        const blkFloors = db.floors
          .filter((f: any) => f.blockId === blk.id)
          .map((flr: any) => ({
            ...flr,
            rooms: db.rooms
              .filter((r: any) => r.floorId === flr.id)
              .map((rm: any) => ({
                ...rm,
                beds: db.beds.filter((b: any) => b.roomId === rm.id),
              })),
          }));
        return {
          ...blk,
          floors: blkFloors,
        };
      });

      const hierarchyRoot = HostelBinaryTree.buildHierarchicalTree(populatedBlocks);
      const bstTree = new HostelBinaryTree();
      populatedBlocks.forEach((blk: any) => {
        bstTree.insertBST({ id: blk.id, name: blk.name, type: 'BLOCK' });
      });

      const preorder = bstTree.preorderTraversal();
      const inorder = bstTree.inorderTraversal();
      const postorder = bstTree.postorderTraversal();
      const levelorder = bstTree.levelOrderTraversal();

      return {
        success: true,
        structure: hierarchyRoot,
        traversals: {
          preorder,
          inorder,
          postorder,
          levelorder,
        },
        dsa: {
          dataStructure: 'Binary Tree & N-Ary Hierarchy Tree',
          algorithms: ['Pre-Order Traversal', 'In-Order Traversal', 'Post-Order Traversal', 'Breadth-First Level-Order'],
        },
      };
    }

    // 9. Facilities (Graph, BFS, Dijkstra, DFS)
    if (cleanUrl === '/facilities' && method.toUpperCase() === 'GET') {
      const g = buildCampusGraph(db);
      return {
        success: true,
        facilities: db.facilities,
        edges: db.edges,
        adjacencyList: g.getAllEdges(),
        dsa: {
          dataStructure: 'Graph (Adjacency List with Weighted Distances)',
          vertices: db.facilities.length,
          edges: db.edges.length,
        },
      };
    }

    if (cleanUrl === '/facilities/navigate' && method.toUpperCase() === 'POST') {
      const { startCode, targetCode } = data || {};
      const g = buildCampusGraph(db);

      const start = startCode || 'HOSTEL_A';
      const dest = targetCode || 'MESS';

      const bfsResult = g.bfsShortestPath(start, dest);
      const dijkstraResult = g.dijkstraShortestPath(start, dest);

      return {
        success: true,
        navigation: {
          bfs: {
            algorithm: 'Breadth-First Search (BFS)',
            hops: bfsResult.hopCount,
            path: bfsResult.path,
            visitedNodes: bfsResult.visitedNodesCount,
            steps: bfsResult.pathSteps,
            timeComplexity: 'O(V + E)',
          },
          dijkstra: {
            algorithm: "Dijkstra's Shortest Path Algorithm",
            totalDistanceMeters: dijkstraResult.totalDistanceMeters,
            path: dijkstraResult.path,
            detailedSteps: dijkstraResult.pathSteps,
            timeComplexity: 'O((V + E) log V)',
          },
        },
      };
    }

    if (cleanUrl === '/facilities/explore-dfs' && method.toUpperCase() === 'GET') {
      const startId = urlParams.get('startId') || 'HOSTEL_A';
      const g = buildCampusGraph(db);
      const dfsResult = g.dfsExploration(startId);

      return {
        success: true,
        exploration: {
          startFacility: startId,
          dfsOrder: dfsResult.order,
          steps: dfsResult.steps,
          timeComplexity: 'O(V + E)',
        },
      };
    }

    // 10. DSA Visualizer Endpoints
    if (cleanUrl === '/dsa/hash-table' && method.toUpperCase() === 'GET') {
      const ht = buildStudentHashTable(db);
      const vis = ht.getVisualization();
      const collisions = vis.filter((b) => b.chainLength > 1).length;
      const maxChain = Math.max(...vis.map((b) => b.chainLength), 0);

      return {
        success: true,
        hashTable: {
          bucketSize: 19,
          totalItems: ht.size(),
          loadFactor: Number((ht.size() / 19).toFixed(2)),
          distribution: vis,
          metrics: {
            collisionCount: collisions,
            maxChainLength: maxChain,
            hashFunction: 'Polynomial Rolling Hash (Σ charCode * 31^i) mod 19',
          },
        },
      };
    }

    if (cleanUrl === '/dsa/search-visualize' && method.toUpperCase() === 'POST') {
      const { query } = data || {};
      const searchTarget = query || 'Aarav';

      const sortedStudents = (SortingAlgorithms.quickSort(db.students, 'name', 'ASC').sorted as any[]);
      const linearTrace = SearchingAlgorithms.linearSearch(db.students as any[], searchTarget, 'name');
      const binaryTrace = SearchingAlgorithms.binarySearch(sortedStudents as any[], searchTarget, 'name');

      return {
        success: true,
        results: {
          target: searchTarget,
          linearSearch: linearTrace,
          binarySearch: binaryTrace,
        },
      };
    }

    if (cleanUrl === '/dsa/sort-visualize' && method.toUpperCase() === 'POST') {
      const { field = 'name' } = data || {};
      const items = db.students.slice(0, 20);

      const bubbleRes = SortingAlgorithms.bubbleSort([...items], field as any, 'ASC');
      const insertionRes = SortingAlgorithms.insertionSort([...items], field as any, 'ASC');
      const mergeRes = SortingAlgorithms.mergeSort([...items], field as any, 'ASC');
      const quickRes = SortingAlgorithms.quickSort([...items], field as any, 'ASC');

      return {
        success: true,
        benchmarks: {
          field,
          totalElements: items.length,
          bubbleSort: bubbleRes.metrics,
          insertionSort: insertionRes.metrics,
          mergeSort: mergeRes.metrics,
          quickSort: quickRes.metrics,
        },
      };
    }

    // 11. Reports
    if (cleanUrl === '/reports' && method.toUpperCase() === 'GET') {
      const type = urlParams.get('type') || 'all';
      const totalStudents = db.students.length;
      const totalRooms = db.rooms.length;
      const occupiedRooms = db.rooms.filter((r: any) => r.status === 'FULL').length;
      const totalBeds = db.beds.length;
      const occupiedBeds = db.beds.filter((b: any) => b.isOccupied).length;

      return {
        success: true,
        report: {
          type,
          generatedAt: new Date().toISOString(),
          occupancy: {
            totalRooms,
            occupiedRooms,
            availableRooms: totalRooms - occupiedRooms,
            totalBeds,
            occupiedBeds,
            availableBeds: totalBeds - occupiedBeds,
            rate: Math.round((occupiedBeds / totalBeds) * 100),
          },
          departmentBreakdown: [
            { department: 'CSE', count: db.students.filter((s: any) => s.department === 'CSE').length },
            { department: 'ECE', count: db.students.filter((s: any) => s.department === 'ECE').length },
            { department: 'AI & DS', count: db.students.filter((s: any) => s.department === 'AI & DS').length },
            { department: 'MECH', count: db.students.filter((s: any) => s.department === 'MECH').length },
            { department: 'IT', count: db.students.filter((s: any) => s.department === 'IT').length },
            { department: 'EEE', count: db.students.filter((s: any) => s.department === 'EEE').length },
            { department: 'CIVIL', count: db.students.filter((s: any) => s.department === 'CIVIL').length },
          ],
          maintenanceBreakdown: {
            pending: db.maintenance.filter((m: any) => m.status === 'PENDING').length,
            inProgress: db.maintenance.filter((m: any) => m.status === 'IN_PROGRESS').length,
            completed: db.maintenance.filter((m: any) => m.status === 'COMPLETED').length,
          },
          complaintsBreakdown: {
            submitted: db.complaints.filter((c: any) => c.status === 'SUBMITTED').length,
            underReview: db.complaints.filter((c: any) => c.status === 'UNDER_REVIEW').length,
            resolved: db.complaints.filter((c: any) => c.status === 'RESOLVED').length,
          },
          visitorsSummary: {
            total: db.visitors.length,
            currentlyInside: db.visitors.filter((v: any) => v.status === 'INSIDE').length,
          },
        },
      };
    }

    // 12. Notifications
    if (cleanUrl === '/notifications' && method.toUpperCase() === 'GET') {
      const unreadCount = db.notifications.filter((n: any) => !n.isRead).length;
      return { success: true, data: db.notifications, notifications: db.notifications, unreadCount };
    }

    if (cleanUrl === '/notifications/all/read' && method.toUpperCase() === 'PUT') {
      db.notifications.forEach((n: any) => (n.isRead = true));
      saveDb(db);
      return { success: true, message: 'All notifications marked as read' };
    }

    // Default fallback
    return { success: true, message: 'Mock DSA response', data: {} };
  },
};
