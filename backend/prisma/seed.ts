import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.facilityEdge.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.student.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.hostelBlock.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const wardenPassword = await bcrypt.hash('Warden@123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@hostel.com',
      password: adminPassword,
      name: 'Dr. Rajesh Sharma',
      role: 'ADMIN',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const warden = await prisma.user.create({
    data: {
      email: 'warden@hostel.com',
      password: wardenPassword,
      name: 'Prof. Sunita Rao',
      role: 'WARDEN',
      phone: '+91 98765 43211',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  console.log('✅ Users created: admin@hostel.com, warden@hostel.com');

  // 3. Seed Hostel Blocks
  const blockA = await prisma.hostelBlock.create({
    data: {
      name: 'Block A',
      genderType: 'BOYS',
      totalFloors: 3,
      description: 'Senior Undergraduate & Engineering Boys Hostel',
    },
  });

  const blockB = await prisma.hostelBlock.create({
    data: {
      name: 'Block B',
      genderType: 'GIRLS',
      totalFloors: 3,
      description: 'Undergraduate & Postgraduate Girls Hostel',
    },
  });

  const blockC = await prisma.hostelBlock.create({
    data: {
      name: 'Block C',
      genderType: 'COED',
      totalFloors: 2,
      description: 'International & Deluxe Scholar Block',
    },
  });

  // 4. Seed Floors & Rooms
  const blocks = [blockA, blockB, blockC];
  const roomsCreated: any[] = [];

  for (const block of blocks) {
    for (let f = 1; f <= block.totalFloors; f++) {
      const floor = await prisma.floor.create({
        data: {
          floorNumber: f,
          name: `Floor ${f}`,
          blockId: block.id,
        },
      });

      // 3 to 4 rooms per floor
      const numRooms = block.name === 'Block C' ? 3 : 4;
      for (let r = 1; r <= numRooms; r++) {
        const roomNum = `${block.name.slice(-1)}-${f}0${r}`;
        const capacity = block.name === 'Block C' ? 2 : 4;
        const roomType = block.name === 'Block C' ? 'DELUXE' : (r % 2 === 0 ? 'AC' : 'NON_AC');

        const room = await prisma.room.create({
          data: {
            roomNumber: roomNum,
            capacity,
            occupiedBeds: 0,
            availableBeds: capacity,
            roomType,
            status: 'AVAILABLE',
            blockId: block.id,
            floorId: floor.id,
          },
        });

        // Create beds for this room
        for (let b = 1; b <= capacity; b++) {
          await prisma.bed.create({
            data: {
              bedNumber: b,
              isOccupied: false,
              roomId: room.id,
            },
          });
        }

        roomsCreated.push(room);
      }
    }
  }

  console.log(`✅ Created ${roomsCreated.length} rooms across 3 blocks`);

  // 5. Seed 52 Students with Indian Names & Real Departments
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
    { name: 'Gautam Namboodiri', dept: 'MECH', year: 3, gender: 'MALE', phone: '9845012352' }
  ];

  const createdStudents: any[] = [];

  for (let i = 0; i < studentRawData.length; i++) {
    const s = studentRawData[i];
    const sId = `STU${1001 + i}`;
    const regNum = `2024${s.dept.replace(/[^A-Z]/g, '')}${String(100 + i).padStart(3, '0')}`;
    const email = `${s.name.toLowerCase().replace(/\s+/g, '.')}.${sId.toLowerCase()}@campus.edu`;

    // Allocate first 38 students into rooms
    let targetRoom: any = null;
    let targetBed: any = null;
    let blockId: string | null = null;

    if (i < 38) {
      const targetBlock = s.gender === 'MALE' ? blockA : blockB;
      blockId = targetBlock.id;

      // Find an available bed in this block
      const availableBed = await prisma.bed.findFirst({
        where: {
          isOccupied: false,
          room: { blockId: targetBlock.id },
        },
        include: { room: true },
      });

      if (availableBed) {
        targetBed = availableBed;
        targetRoom = availableBed.room;
        await prisma.bed.update({
          where: { id: availableBed.id },
          data: { isOccupied: true },
        });

        // Update room occupancy
        const updatedOcc = targetRoom.occupiedBeds + 1;
        const updatedAvail = targetRoom.capacity - updatedOcc;
        const status = updatedAvail === 0 ? 'FULL' : 'PARTIALLY_OCCUPIED';

        await prisma.room.update({
          where: { id: targetRoom.id },
          data: {
            occupiedBeds: updatedOcc,
            availableBeds: updatedAvail,
            status,
          },
        });
      }
    }

    const student = await prisma.student.create({
      data: {
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
      },
    });

    createdStudents.push(student);
  }

  console.log(`✅ Created ${createdStudents.length} students with realistic allocations`);

  // 6. Seed 20 Visitors
  const visitorPurposes = ['Parent visit', 'Luggage delivery', 'Medical check-in', 'Weekend meet', 'Document submission', 'Guardian briefing'];
  const relationships = ['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Guardian'];

  for (let v = 1; v <= 20; v++) {
    const targetStudent = createdStudents[v % createdStudents.length];
    const isInside = v <= 6; // 6 currently inside
    const entryDate = new Date(Date.now() - (v * 3600000 * 2));
    const exitDate = isInside ? null : new Date(entryDate.getTime() + (3600000 * 1.5));

    await prisma.visitor.create({
      data: {
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
      },
    });
  }

  console.log('✅ Created 20 visitor logs');

  // 7. Seed 15 Complaints
  const complaintCategories = ['ROOM', 'FOOD', 'CLEANING', 'WATER', 'ELECTRICITY', 'INTERNET', 'SECURITY', 'OTHER'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

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
    'Mosquito mesh damaged on window frame near balcony.'
  ];

  for (let c = 0; c < 15; c++) {
    const student = createdStudents[c];
    await prisma.complaint.create({
      data: {
        complaintId: `CMP${101 + c}`,
        studentId: student.id,
        studentName: student.name,
        category: complaintCategories[c % complaintCategories.length],
        description: complaintTexts[c],
        priority: priorities[c % priorities.length],
        status: statuses[c % statuses.length],
      },
    });
  }

  console.log('✅ Created 15 complaint tickets');

  // 8. Seed 15 Maintenance Requests for the FIFO Queue
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

  for (let m = 0; m < maintenanceItems.length; m++) {
    const item = maintenanceItems[m];
    const student = createdStudents[m];
    // Keep first 8 PENDING so warden can demonstrate "Process Next" FIFO queue
    const status = m < 8 ? 'PENDING' : (m < 11 ? 'IN_PROGRESS' : 'COMPLETED');

    await prisma.maintenanceRequest.create({
      data: {
        requestId: `MNT${101 + m}`,
        studentId: student.id,
        studentName: student.name,
        roomNumber: item.room,
        category: item.cat,
        description: item.desc,
        priority: item.priority,
        status,
        submittedAt: new Date(Date.now() - (15 - m) * 3600000 * 3),
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });
  }

  console.log('✅ Created 15 maintenance requests (ready for FIFO Queue demonstration)');

  // 9. Seed 10 Campus Facilities & Graph Edges (Vertices & Connections)
  const facilitiesData = [
    { code: 'HOSTEL_A', name: 'Boys Hostel (Block A)', category: 'ACCOMMODATION', desc: 'Senior & Junior boys residential wing', x: 120, y: 150 },
    { code: 'HOSTEL_B', name: 'Girls Hostel (Block B)', category: 'ACCOMMODATION', desc: 'Girls residential complex with secure access', x: 280, y: 100 },
    { code: 'HOSTEL_C', name: 'Deluxe Block (Block C)', category: 'ACCOMMODATION', desc: 'Scholars & postgraduate accommodation', x: 180, y: 320 },
    { code: 'MESS', name: 'Central Dining Mess', category: 'DINING', desc: '24/7 student cafeteria & hygienic food court', x: 380, y: 220 },
    { code: 'LIBRARY', name: 'Central Digital Library', category: 'ACADEMIC', desc: 'Study cubicles, DSA books & digital terminals', x: 520, y: 140 },
    { code: 'GYM', name: 'Fitness & Sports Gym', category: 'RECREATION', desc: 'Modern weights, treadmills and aerobics arena', x: 680, y: 220 },
    { code: 'MEDICAL', name: 'Campus Health Centre', category: 'HEALTHCARE', desc: 'Doctor on duty, emergency beds and pharmacy', x: 520, y: 350 },
    { code: 'PARKING', name: 'Student Vehicle Parking', category: 'SERVICES', desc: 'Automated barrier two-wheeler & car parking', x: 140, y: 460 },
    { code: 'SPORTS', name: 'Athletic Sports Complex', category: 'RECREATION', desc: 'Cricket pitch, football turf, tennis courts', x: 740, y: 380 },
    { code: 'SECURITY', name: 'Main Security Gate & Reception', category: 'SECURITY', desc: 'Campus entrance, visitor pass verification', x: 360, y: 500 },
  ];

  const facMap: { [code: string]: string } = {};

  for (const fac of facilitiesData) {
    const created = await prisma.facility.create({
      data: {
        code: fac.code,
        name: fac.name,
        category: fac.category,
        description: fac.desc,
        xCoord: fac.x,
        yCoord: fac.y,
      },
    });
    facMap[fac.code] = created.id;
  }

  // Create graph edges (bidirectional connections with realistic distances in meters)
  const edges = [
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

  for (const edge of edges) {
    // Add forward edge
    await prisma.facilityEdge.create({
      data: {
        sourceFacilityId: facMap[edge.from],
        targetFacilityId: facMap[edge.to],
        distanceMeters: edge.dist,
        pathwayType: 'PAVED_WALKWAY',
      },
    });

    // Add reverse edge for undirected campus path
    await prisma.facilityEdge.create({
      data: {
        sourceFacilityId: facMap[edge.to],
        targetFacilityId: facMap[edge.from],
        distanceMeters: edge.dist,
        pathwayType: 'PAVED_WALKWAY',
      },
    });
  }

  console.log('✅ Created 10 campus facilities and 34 bidirectional graph paths');

  // 10. Seed Notifications
  const notifications = [
    { title: 'Maintenance Queue', message: '8 urgent maintenance requests currently waiting in FIFO queue.', type: 'ALERT' },
    { title: 'Room Allocation', message: 'Block A Floor 1 rooms have reached 90% occupancy threshold.', type: 'INFO' },
    { title: 'Visitor Alert', message: '6 registered visitors currently inside campus premises.', type: 'WARNING' },
    { title: 'Hostel Inspection', message: 'Annual Electrical & Fire safety audit scheduled for Friday.', type: 'SUCCESS' },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  // 11. Seed Activity Logs (Stack demonstration)
  const activities = [
    { action: 'ROOM_ALLOCATED', details: 'Aarav Sharma allocated to Block A, Room A-101, Bed 1', entityType: 'Room', performedBy: 'Admin' },
    { action: 'VISITOR_ENTRY', details: 'Visitor Pass VIS101 generated for student Aarav Sharma', entityType: 'Visitor', performedBy: 'Security Guard' },
    { action: 'COMPLAINT_FILED', details: 'New complaint CMP101 filed: Wi-Fi router issues', entityType: 'Complaint', performedBy: 'Vivaan Patel' },
    { action: 'MAINTENANCE_ENQUEUED', details: 'Maintenance request MNT101 pushed to FIFO queue', entityType: 'Maintenance', performedBy: 'Aditya Verma' },
    { action: 'STUDENT_ENROLLED', details: 'Gautam Namboodiri enrolled in Mechanical Engineering Dept', entityType: 'Student', performedBy: 'Warden' },
  ];

  for (const act of activities) {
    await prisma.activityLog.create({ data: act });
  }

  console.log('✨ Database successfully seeded with rich, realistic data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
