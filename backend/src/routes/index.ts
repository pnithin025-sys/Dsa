import { Router } from 'express';
import { login, register, getMe, changePassword } from '../controllers/authController';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController';
import {
  getAllRooms,
  getRoomById,
  allocateStudent,
  vacateStudent,
  updateRoomStatus,
  deleteRoom,
} from '../controllers/roomController';
import {
  getAllVisitors,
  recordVisitorEntry,
  recordVisitorExit,
  deleteVisitor,
} from '../controllers/visitorController';
import {
  getAllMaintenanceRequests,
  createMaintenanceRequest,
  processNextMaintenanceRequest,
  updateMaintenanceStatus,
  deleteMaintenanceRequest,
} from '../controllers/maintenanceController';
import {
  getAllComplaints,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
} from '../controllers/complaintController';
import { getHostelStructure } from '../controllers/hostelController';
import { getAllFacilities, navigateRoute, exploreDfs } from '../controllers/facilityController';
import {
  getDsaSummary,
  visualizeSearch,
  visualizeSort,
  getHashTableState,
} from '../controllers/dsaController';
import { getDashboardMetrics } from '../controllers/dashboardController';
import { getReports } from '../controllers/reportController';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 1. Auth Routes
router.post('/auth/login', login);
router.post('/auth/register', register);
router.get('/auth/me', authenticateToken, getMe);
router.post('/auth/change-password', authenticateToken, changePassword);

// 2. Dashboard
router.get('/dashboard', authenticateToken, getDashboardMetrics);

// 3. Students
router.get('/students', authenticateToken, getAllStudents);
router.get('/students/:id', authenticateToken, getStudentById);
router.post('/students', authenticateToken, createStudent);
router.put('/students/:id', authenticateToken, updateStudent);
router.delete('/students/:id', authenticateToken, deleteStudent);

// 4. Rooms
router.get('/rooms', authenticateToken, getAllRooms);
router.get('/rooms/:id', authenticateToken, getRoomById);
router.post('/rooms/allocate', authenticateToken, allocateStudent);
router.post('/rooms/vacate', authenticateToken, vacateStudent);
router.put('/rooms/:id', authenticateToken, updateRoomStatus);
router.delete('/rooms/:id', authenticateToken, deleteRoom);

// 5. Visitors (Stack)
router.get('/visitors', authenticateToken, getAllVisitors);
router.post('/visitors', authenticateToken, recordVisitorEntry);
router.put('/visitors/:id/exit', authenticateToken, recordVisitorExit);
router.delete('/visitors/:id', authenticateToken, deleteVisitor);

// 6. Maintenance (Queue FIFO)
router.get('/maintenance', authenticateToken, getAllMaintenanceRequests);
router.post('/maintenance', authenticateToken, createMaintenanceRequest);
router.post('/maintenance/process-next', authenticateToken, processNextMaintenanceRequest);
router.put('/maintenance/:id', authenticateToken, updateMaintenanceStatus);
router.delete('/maintenance/:id', authenticateToken, deleteMaintenanceRequest);

// 7. Complaints
router.get('/complaints', authenticateToken, getAllComplaints);
router.post('/complaints', authenticateToken, createComplaint);
router.put('/complaints/:id', authenticateToken, updateComplaintStatus);
router.delete('/complaints/:id', authenticateToken, deleteComplaint);

// 8. Hostel Structure (Tree)
router.get('/hostel/structure', authenticateToken, getHostelStructure);

// 9. Facilities Navigation (Graph)
router.get('/facilities', authenticateToken, getAllFacilities);
router.post('/facilities/navigate', authenticateToken, navigateRoute);
router.get('/facilities/explore-dfs', authenticateToken, exploreDfs);

// 10. DSA Visualizer
router.get('/dsa/summary', authenticateToken, getDsaSummary);
router.post('/dsa/search-visualize', authenticateToken, visualizeSearch);
router.post('/dsa/sort-visualize', authenticateToken, visualizeSort);
router.get('/dsa/hash-table', authenticateToken, getHashTableState);

// 11. Reports
router.get('/reports', authenticateToken, getReports);

// 12. Notifications
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markAsRead);

export default router;
