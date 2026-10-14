export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'WARDEN';
  phone?: string;
  avatar?: string;
}

export interface Bed {
  id: string;
  bedNumber: number;
  isOccupied: boolean;
  roomId: string;
  student?: {
    id: string;
    studentId: string;
    name: string;
    department: string;
    year: number;
    phone: string;
  };
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  occupiedBeds: number;
  availableBeds: number;
  roomType: 'AC' | 'NON_AC' | 'DELUXE';
  status: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE';
  blockId: string;
  floorId: string;
  block?: {
    id: string;
    name: string;
    genderType: string;
  };
  floor?: {
    id: string;
    name: string;
    floorNumber: number;
  };
  beds?: Bed[];
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  regNumber: string;
  department: string;
  year: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
  address: string;
  parentName: string;
  parentContact: string;
  admissionDate: string;
  status: 'ACTIVE' | 'VACATED' | 'SUSPENDED';
  blockId?: string;
  roomId?: string;
  bedId?: string;
  room?: Room;
  bed?: Bed;
}

export interface Visitor {
  id: string;
  visitorId: string;
  name: string;
  studentId: string;
  studentName: string;
  phone: string;
  relationship: string;
  purpose: string;
  entryTime: string;
  exitTime?: string;
  status: 'INSIDE' | 'EXITED';
  student?: Student;
}

export interface Complaint {
  id: string;
  complaintId: string;
  studentId: string;
  studentName: string;
  category: 'ROOM' | 'FOOD' | 'CLEANING' | 'WATER' | 'ELECTRICITY' | 'INTERNET' | 'SECURITY' | 'OTHER';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  student?: Student;
}

export interface MaintenanceRequest {
  id: string;
  requestId: string;
  studentId?: string;
  studentName?: string;
  roomNumber: string;
  category: 'ELECTRICAL' | 'PLUMBING' | 'FURNITURE' | 'INTERNET' | 'CLEANING' | 'OTHER';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  submittedAt: string;
  completedAt?: string;
  student?: Student;
}

export interface Facility {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  xCoord: number;
  yCoord: number;
}

export interface FacilityEdge {
  id: string;
  sourceFacilityId: string;
  targetFacilityId: string;
  distanceMeters: number;
  pathwayType: string;
  sourceFacility?: Facility;
  targetFacility?: Facility;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  entityType?: string;
  entityId?: string;
  performedBy: string;
  createdAt: string;
}

export interface DSAOperationLog {
  operation: string;
  dataStructure: string;
  timeComplexity: string;
  spaceComplexity: string;
  stepsCount: number;
  description: string;
  timestamp: string;
}
