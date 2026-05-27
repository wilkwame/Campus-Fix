import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ============= HELPER FUNCTIONS =============

// Validate institutional email (supports multiple domains)
const isValidInstitutionalEmail = (email) => {
  const validDomains = [
    '@htu.edu.gh',      // Main university domain
    '@stu.htu.edu.gh',  // Student domain
    '@hu.edu.gh',       // Alternative domain
    '@htu.edu',         // Short domain
    '@htu.stu.edu.gh'   // Alternative student domain
  ];
  return validDomains.some(domain => email.toLowerCase().includes(domain));
};

// Auto-assign technician based on category
const autoAssignTechnician = async (category) => {
  const categoryMap = {
    'ELECTRICAL': 'ELECTRICAL',
    'PLUMBING': 'PLUMBING', 
    'CARPENTRY': 'CARPENTRY',
    'IT_NETWORK': 'IT_NETWORK',
    'HVAC': 'HVAC',
    'CLEANING': 'CLEANING',
    'GROUNDS': 'GROUNDS',
    'SECURITY': 'SECURITY',
    'STRUCTURAL': 'STRUCTURAL',
    'OTHER': null
  };
  
  const expertise = categoryMap[category];
  if (!expertise) return null;
  
  const technician = await prisma.user.findFirst({
    where: {
      role: 'TECHNICIAN',
      expertise: expertise,
      isAvailable: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
  
  return technician;
};

// Create notification
const createNotification = async (userId, title, message, type, relatedId) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        relatedId
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus-fix-secret-key-2024');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        staffId: true, 
        department: true, 
        expertise: true,
        phoneNumber: true,
        isAvailable: true
      }
    });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Required role: ' + roles.join(', ') });
    }
    next();
  };
};

// ============= API ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Campus-Fix Backend is running!', timestamp: new Date() });
});

// ============= AUTHENTICATION ROUTES =============

// Register new user
app.post('/api/auth/register', async (req, res) => {
  const { staffId, email, password, name, role, department, phoneNumber, expertise } = req.body;
  
  console.log('Registration attempt:', { staffId, email, name, role, department });
  
  // Validate required fields
  if (!staffId || !email || !password || !name || !department) {
    return res.status(400).json({ 
      message: 'Missing required fields',
      required: ['staffId', 'email', 'password', 'name', 'department']
    });
  }
  
  // Validate email format
  if (!isValidInstitutionalEmail(email)) {
    return res.status(400).json({ 
      message: 'Please use your institutional email (@htu.edu.gh, @stu.htu.edu.gh, or @hu.edu.gh)' 
    });
  }
  
  // Validate staff ID format
  if (!staffId || staffId.length < 5) {
    return res.status(400).json({ message: 'Valid staff ID required (minimum 5 characters)' });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  // For technicians, expertise is required
  if (role === 'TECHNICIAN' && !expertise) {
    return res.status(400).json({ message: 'Technicians must select an area of expertise' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { staffId: staffId }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or staff ID already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        staffId,
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: role || 'STAFF',
        department,
        phoneNumber: phoneNumber || null,
        expertise: role === 'TECHNICIAN' ? expertise : null,
        isAvailable: true
      },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        staffId: true,
        department: true,
        expertise: true
      }
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'campus-fix-secret-key-2024',
      { expiresIn: '7d' }
    );
    
    console.log('✅ User registered successfully:', user.email);
    
    res.status(201).json({ 
      success: true,
      message: 'Registration successful!',
      user, 
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', email);
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  
  try {
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'campus-fix-secret-key-2024',
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in:', user.email);
    
    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        staffId: user.staffId,
        department: user.department,
        expertise: user.expertise
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed: ' + error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticate, async (req, res) => {
  res.json(req.user);
});

// ============= ISSUE ROUTES =============

// Create new issue (with optional image/video upload)
app.post('/api/issues', authenticate, upload.single('media'), async (req, res) => {
  const { title, description, category, location, priority } = req.body;
  const mediaFile = req.file;
  
  console.log('New issue reported:', { title, category, location, reportedBy: req.user.email });
  
  if (!title || !description || !category || !location) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    // Create issue
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        category,
        location,
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        imageUrl: mediaFile ? `/uploads/${mediaFile.filename}` : null,
        reportedBy: { connect: { id: req.user.id } }
      },
      include: {
        reportedBy: { select: { name: true, email: true } }
      }
    });
    
    console.log('✅ Issue created:', issue.id);
    
    // Auto-assign technician
    const technician = await autoAssignTechnician(category);
    
    if (technician) {
      const assignment = await prisma.assignment.create({
        data: {
          issueId: issue.id,
          technicianId: technician.id,
          assignedBy: null,
          status: 'PENDING'
        },
        include: {
          technician: { select: { name: true, expertise: true } }
        }
      });
      
      // Update issue status
      await prisma.issue.update({
        where: { id: issue.id },
        data: { status: 'ASSIGNED' }
      });
      
      // Notify technician
      await createNotification(
        technician.id,
        '🔧 New Task Assigned',
        `You have been assigned: "${title}" in ${location}`,
        'ASSIGNMENT',
        issue.id
      );
      
      // Notify reporter
      await createNotification(
        req.user.id,
        '✅ Issue Assigned',
        `Your issue "${title}" has been assigned to ${technician.name}`,
        'STATUS_UPDATE',
        issue.id
      );
      
      res.status(201).json({ 
        issue, 
        assignment, 
        assignedTo: technician.name,
        message: 'Issue reported and technician assigned automatically'
      });
    } else {
      // No technician available, notify admins
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await createNotification(
          admin.id,
          '⚠️ Unassigned Issue',
          `No technician available for: "${title}". Please assign manually.`,
          'NEW_ISSUE',
          issue.id
        );
      }
      
      res.status(201).json({ 
        issue, 
        message: 'Issue reported but no technician available. Admin has been notified.'
      });
    }
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Failed to create issue: ' + error.message });
  }
});

// Get all issues (filtered by role)
app.get('/api/issues', authenticate, async (req, res) => {
  const { status, category } = req.query;
  
  try {
    let where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    
    // Role-based filtering
    if (req.user.role === 'STAFF') {
      where.reportedById = req.user.id;
    } else if (req.user.role === 'TECHNICIAN') {
      where.assignedTo = { technicianId: req.user.id };
    }
    
    const issues = await prisma.issue.findMany({
      where,
      include: {
        reportedBy: { select: { id: true, name: true, email: true, staffId: true } },
        assignedTo: { 
          include: { 
            technician: { select: { id: true, name: true, expertise: true, phoneNumber: true } } 
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

// Get single issue
app.get('/api/issues/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        reportedBy: { select: { id: true, name: true, email: true, staffId: true, department: true } },
        assignedTo: { 
          include: { 
            technician: { select: { id: true, name: true, expertise: true, phoneNumber: true } } 
          } 
        }
      }
    });
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    res.json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ message: 'Failed to fetch issue' });
  }
});

// Update issue status
app.patch('/api/issues/:id/status', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const issue = await prisma.issue.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });
    
    await createNotification(
      issue.reportedById,
      '📋 Status Updated',
      `Your issue "${issue.title}" status changed to ${status}`,
      'STATUS_UPDATE',
      id
    );
    
    res.json(issue);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// ============= ASSIGNMENT ROUTES =============

// Technician response (accept/reject assignment)
app.post('/api/assignments/:assignmentId/respond', authenticate, authorize('TECHNICIAN'), async (req, res) => {
  const { assignmentId } = req.params;
  const { accept, responseNote } = req.body;
  
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { issue: { include: { reportedBy: true } }, technician: true }
    });
    
    if (!assignment || assignment.technicianId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const newStatus = accept ? 'ACCEPTED' : 'REJECTED';
    
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: newStatus,
        responseNote,
        respondedAt: new Date()
      }
    });
    
    if (accept) {
      await prisma.issue.update({
        where: { id: assignment.issueId },
        data: { status: 'IN_PROGRESS' }
      });
      
      await createNotification(
        assignment.issue.reportedById,
        '✅ Issue Accepted',
        `${req.user.name} has accepted to work on: "${assignment.issue.title}"`,
        'STATUS_UPDATE',
        assignment.issueId
      );
    } else {
      // Notify admins for reassignment
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await createNotification(
          admin.id,
          '⚠️ Assignment Rejected',
          `${req.user.name} rejected: "${assignment.issue.title}". Reason: ${responseNote || 'Not specified'}`,
          'ASSIGNMENT',
          assignment.issueId
        );
      }
    }
    
    res.json({ message: `Assignment ${accept ? 'accepted' : 'rejected'} successfully` });
  } catch (error) {
    console.error('Error responding to assignment:', error);
    res.status(500).json({ message: 'Failed to respond to assignment' });
  }
});

// Admin: Reassign issue
app.post('/api/issues/:issueId/reassign', authenticate, authorize('ADMIN'), async (req, res) => {
  const { issueId } = req.params;
  const { technicianId, notes } = req.body;
  
  try {
    const assignment = await prisma.assignment.upsert({
      where: { issueId },
      update: {
        technicianId,
        assignedBy: req.user.id,
        status: 'PENDING',
        responseNote: notes
      },
      create: {
        issueId,
        technicianId,
        assignedBy: req.user.id,
        status: 'PENDING'
      }
    });
    
    const technician = await prisma.user.findUnique({ where: { id: technicianId } });
    
    await createNotification(
      technicianId,
      '🔄 Task Reassigned',
      `Admin reassigned: "${notes || 'Please review this task'}"`,
      'ASSIGNMENT',
      issueId
    );
    
    res.json({ message: 'Reassigned successfully', assignment });
  } catch (error) {
    console.error('Error reassigning:', error);
    res.status(500).json({ message: 'Failed to reassign' });
  }
});

// ============= NOTIFICATION ROUTES =============

// Get user notifications
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', authenticate, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
});

// ============= ADMIN ROUTES =============

// Admin Dashboard Stats with Data Visualization
app.get('/api/admin/stats', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const totalIssues = await prisma.issue.count();
    const pendingIssues = await prisma.issue.count({ where: { status: 'PENDING' } });
    const assignedIssues = await prisma.issue.count({ where: { status: 'ASSIGNED' } });
    const inProgressIssues = await prisma.issue.count({ where: { status: 'IN_PROGRESS' } });
    const resolvedIssues = await prisma.issue.count({ where: { status: 'RESOLVED' } });
    const rejectedIssues = await prisma.issue.count({ where: { status: 'REJECTED' } });
    
    // Issues by category
    const issuesByCategory = await prisma.issue.groupBy({
      by: ['category'],
      _count: true
    });
    
    // Issues by priority
    const issuesByPriority = await prisma.issue.groupBy({
      by: ['priority'],
      _count: true
    });
    
    // Users count by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });
    
    // Recent issues (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentIssues = await prisma.issue.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });
    
    res.json({
      overview: {
        total: totalIssues,
        pending: pendingIssues,
        assigned: assignedIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues,
        rejected: rejectedIssues,
        completionRate: totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0,
        recentIssues
      },
      charts: {
        byCategory: issuesByCategory,
        byPriority: issuesByPriority,
        usersByRole: usersByRole
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get all technicians (for admin assignment)
app.get('/api/admin/technicians', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const technicians = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      select: { 
        id: true, 
        name: true, 
        expertise: true, 
        isAvailable: true, 
        phoneNumber: true,
        email: true
      }
    });
    res.json(technicians);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ message: 'Failed to fetch technicians' });
  }
});

// Get all users (for admin)
app.get('/api/admin/users', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        staffId: true,
        department: true,
        expertise: true,
        isAvailable: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
app.patch('/api/admin/users/:userId/role', authenticate, authorize('ADMIN'), async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// ============= START SERVER =============

// Create uploads folder if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`\n🚀 ========================================`);
  console.log(`   Campus-Fix Backend Server`);
  console.log(`   ========================================`);
  console.log(`   ✅ Server running on http://localhost:${PORT}`);
  console.log(`   ✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`   ✅ API ready to accept requests`);
  console.log(`   ========================================\n`);
});

// Allow any email for testing (REMOVE THIS IN PRODUCTION)
// if (!email.includes('@htu.edu.gh') && !email.includes('@stu.htu.edu.gh')) {
//   return res.status(400).json({ 
//     message: 'Please use your institutional email (@htu.edu.gh or @stu.htu.edu.gh)' 
//   });
// }
// TEMPORARY: Allow any email for testing
console.log('⚠️ Warning: Accepting any email for testing purposes');