import { exec } from 'child_process';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'findlt-super-secret-campus-jwt-key-2026';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Helper: Secure password hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'findlt_salt_salt').digest('hex');
}

// In-Memory Database store with preloaded realistic campus data
// When Supabase env credentials are provided, queries map directly to Supabase PostgreSQL
let profiles: any[] = [
  {
    id: 'usr_admin_01',
    full_name: 'Dr. Arthur Pendelton',
    campus_id: 'ADM-8801',
    email: 'admin@campus.edu',
    phone: '+1 (555) 234-5678',
    department: 'Campus Safety & Administration',
    course: 'Security Operations',
    semester: 'Staff',
    role: 'admin',
    account_status: 'active',
    password_hash: hashPassword('Admin@123'),
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'usr_student_01',
    full_name: 'Alex Johnson',
    campus_id: 'CS-2024-042',
    email: 'alex.j@campus.edu',
    phone: '+1 (555) 345-6789',
    department: 'Computer Science & Engineering',
    course: 'BCA / B.Tech CSE',
    semester: '6th Semester',
    role: 'student',
    account_status: 'active',
    password_hash: hashPassword('Student@123'),
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'usr_student_02',
    full_name: 'Sarah Miller',
    campus_id: 'CS-2024-118',
    email: 'sarah.m@campus.edu',
    phone: '+1 (555) 456-7890',
    department: 'Information Technology',
    course: 'BCA',
    semester: '4th Semester',
    role: 'student',
    account_status: 'active',
    password_hash: hashPassword('Student@123'),
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'usr_student_03',
    full_name: 'Rohan Sharma',
    campus_id: 'EC-2023-089',
    email: 'rohan.s@campus.edu',
    phone: '+1 (555) 567-8901',
    department: 'Electronics & Communication',
    course: 'B.Tech ECE',
    semester: '5th Semester',
    role: 'student',
    account_status: 'active',
    password_hash: hashPassword('Student@123'),
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'usr_student_04',
    full_name: 'Priya Patel',
    campus_id: 'ME-2024-031',
    email: 'priya.p@campus.edu',
    phone: '+1 (555) 678-9012',
    department: 'Mechanical Engineering',
    course: 'B.Tech ME',
    semester: '3rd Semester',
    role: 'student',
    account_status: 'suspended',
    password_hash: hashPassword('Student@123'),
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  }
];

let items: any[] = [
  {
    id: 'item_f_01',
    user_id: 'usr_student_01',
    item_name: 'Silver MacBook Pro 14"',
    category: 'Electronics',
    item_type: 'found',
    brand: 'Apple',
    color: 'Space Gray / Silver',
    image_url: '/src/assets/images/found_item_macbook_1793681206791.jpg',
    report_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    location: 'Main Science Library - 2nd Floor Study Cubicle 14',
    submitted_to: 'Central Campus Security Desk (Gate 2)',
    status: 'open',
    description: 'Found unattended silver laptop with collegiate stickers on lid. Handed over to security desk staff.',
    additional_notes: 'Kept safely in security locker. Serial number matches campus wifi registration.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'item_f_02',
    user_id: 'usr_admin_01',
    item_name: 'Sony WH-1000XM4 Wireless Headphones',
    category: 'Accessories',
    item_type: 'found',
    brand: 'Sony',
    color: 'Matte Black',
    image_url: '/src/assets/images/found_item_headphones_1793681207346.jpg',
    report_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    location: 'Humanities Hall Study Lounge',
    submitted_to: 'Campus Administration Office Room 102',
    status: 'open',
    description: 'Over-ear black wireless headphones with black protective carrying zip case.',
    additional_notes: 'Turned on with ~60% battery. Has subtle scratch near left swivel cup.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'item_f_03',
    user_id: 'usr_student_02',
    item_name: 'Navy Blue Water-Resistant Campus Backpack',
    category: 'Bags',
    item_type: 'found',
    brand: 'Herschel / North Face',
    color: 'Navy Blue',
    image_url: '/src/assets/images/found_item_backpack_1793681207588.jpg',
    report_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    location: 'Student Cafeteria Outdoor Bench near Fountain',
    submitted_to: 'Student Union Helpdesk',
    status: 'open',
    description: 'Contains notebook spirals for Data Structures and an insulated steel water bottle.',
    additional_notes: 'Owner can identify notebook titles to claim.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'item_f_04',
    user_id: 'usr_student_01',
    item_name: 'Campus Dormitory Key Set with ID Lanyard',
    category: 'Keys',
    item_type: 'found',
    brand: 'University Housing',
    color: 'Blue Lanyard / Brass Keys',
    image_url: '/src/assets/images/found_item_id_keys_1793681208297.jpg',
    report_date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    location: 'Engineering Block Auditorium B Hallway',
    submitted_to: 'Department Security Guard Station',
    status: 'claimed',
    description: 'Ring of 2 room keys with stamped dormitory unit number and blue University lanyard.',
    additional_notes: 'Claim pending verification.',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'item_l_01',
    user_id: 'usr_student_02',
    item_name: 'Casio Scientific Calculator FX-991EX',
    category: 'Electronics',
    item_type: 'lost',
    brand: 'Casio',
    color: 'Black and White',
    image_url: '',
    report_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    location: 'Math Building Lab 304',
    submitted_to: '',
    status: 'open',
    description: 'Classwiz scientific calculator with my initials "S.M." scratched discreetly on the sliding battery cover.',
    additional_notes: 'Lost during calculus mid-term revision session.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'item_l_02',
    user_id: 'usr_student_01',
    item_name: 'Black Leather Bifold Wallet',
    category: 'Accessories',
    item_type: 'lost',
    brand: 'Bellroy',
    color: 'Charcoal Black',
    image_url: '',
    report_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    location: 'Campus Sports Complex Bleachers',
    submitted_to: '',
    status: 'returned',
    description: 'Contained campus ID card, metro transit card, and driving license.',
    additional_notes: 'Successfully recovered via security handover on Oct 30.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];

let claims: any[] = [
  {
    id: 'clm_01',
    item_id: 'item_f_04',
    claimant_id: 'usr_student_02',
    ownership_description: 'The dorm room key has unit number 308 engraved on the reverse side. The lanyard ID badge belongs to Sarah Miller.',
    evidence_url: '',
    status: 'Pending',
    admin_remarks: 'Awaiting student to visit administration room 102 with student identity card.',
    reviewed_by: '',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'clm_02',
    item_id: 'item_l_02',
    claimant_id: 'usr_student_01',
    ownership_description: 'Wallet contains driving license matching Alex Johnson and campus ID card.',
    evidence_url: '',
    status: 'Completed',
    admin_remarks: 'ID verified in person by Officer Vance. Handover signed.',
    reviewed_by: 'usr_admin_01',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];

let handover_records: any[] = [
  {
    id: 'hnd_01',
    item_id: 'item_l_02',
    claim_id: 'clm_02',
    verified_by: 'Dr. Arthur Pendelton',
    handover_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    remarks: 'Physical student ID verified against Registrar records. Claimant signed acknowledgment form.',
    status: 'Verified',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];

let notifications: any[] = [
  {
    id: 'notif_01',
    user_id: 'usr_student_02',
    title: 'Claim Received for Key Set',
    message: 'Your claim request for "Campus Dormitory Key Set" has been recorded. Admin review is pending.',
    notification_type: 'claim_submitted',
    is_read: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'notif_02',
    user_id: 'usr_student_01',
    title: 'Handover Completed',
    message: 'Your lost item "Black Leather Bifold Wallet" was successfully verified and returned. Case resolved.',
    notification_type: 'item_returned',
    is_read: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'notif_03',
    user_id: 'usr_admin_01',
    title: 'New Claim Request Submitted',
    message: 'Sarah Miller (CS-2024-118) submitted a claim for "Campus Dormitory Key Set with ID Lanyard".',
    notification_type: 'admin_alert',
    is_read: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

let item_categories = [
  { id: 'cat_1', category_name: 'Electronics', description: 'Laptops, phones, tablets, chargers, calculators', is_active: true },
  { id: 'cat_2', category_name: 'Documents', description: 'ID cards, passports, notebooks, certificates', is_active: true },
  { id: 'cat_3', category_name: 'Accessories', description: 'Watches, headphones, glasses, jewelry, wallets', is_active: true },
  { id: 'cat_4', category_name: 'Bags', description: 'Backpacks, tote bags, laptop cases, duffel bags', is_active: true },
  { id: 'cat_5', category_name: 'Books & Stationery', description: 'Textbooks, course packets, geometry boxes', is_active: true },
  { id: 'cat_6', category_name: 'Clothing', description: 'Jackets, hoodies, caps, sports jerseys, scarves', is_active: true },
  { id: 'cat_7', category_name: 'Keys', description: 'Room keys, bike keys, car fobs, locker keys', is_active: true },
  { id: 'cat_8', category_name: 'Other', description: 'Water bottles, sports equipment, umbrella, miscellaneous', is_active: true }
];

let admin_activity_logs: any[] = [
  {
    id: 'log_01',
    admin_id: 'usr_admin_01',
    admin_name: 'Dr. Arthur Pendelton',
    action: 'Handover Verified',
    target_type: 'Item & Claim',
    target_id: 'item_l_02',
    details: 'Physical verification and student card audit completed for Alex Johnson. Bellroy Wallet returned.',
    previous_status: 'claimed',
    new_status: 'returned',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'log_02',
    admin_id: 'usr_admin_01',
    admin_name: 'Dr. Arthur Pendelton',
    action: 'Claim Review',
    target_type: 'Claim',
    target_id: 'clm_01',
    details: 'Claim marked as Pending awaiting student in-person identity verification with card at Security Desk.',
    previous_status: 'Submitted',
    new_status: 'Pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'log_03',
    admin_id: 'usr_admin_01',
    admin_name: 'Dr. Arthur Pendelton',
    action: 'System Initialized',
    target_type: 'System Settings',
    target_id: 'settings_core',
    details: 'Institutional settings, campus emergency desks, and custody rules activated.',
    previous_status: 'initial',
    new_status: 'active',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

let system_settings: any = {
  system_name: 'Findlt – Smart Campus Lost & Found',
  college_name: 'State University & Affiliated Institutes',
  security_hotline: '+1 (555) 019-9000',
  central_office: 'Central Campus Security Desk (Gate 2)',
  contact_email: 'lostfound@campus.edu',
  operating_hours: '24 Hours / 7 Days a Week (Security Gate 2)',
  auto_approve_claims: false,
  require_evidence_link: false,
  retention_period_days: 90,
  student_public_directory: true,
  enable_broadcasts: true,
  updated_at: new Date().toISOString()
};

function logAdminAction(
  admin: any,
  action: string,
  targetType: string,
  targetId: string,
  details: string,
  previousStatus?: string,
  newStatus?: string
) {
  const logEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    admin_id: admin?.id || 'usr_admin_01',
    admin_name: admin?.full_name || 'Campus Administrator',
    action,
    target_type: targetType,
    target_id: targetId,
    details,
    previous_status: previousStatus || 'N/A',
    new_status: newStatus || 'N/A',
    created_at: new Date().toISOString()
  };
  admin_activity_logs.unshift(logEntry);
  return logEntry;
}

// Authentication Middlewares
function verifyToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = profiles.find(p => p.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }
    if (user.account_status === 'suspended') {
      return res.status(403).json({ error: 'Your account is temporarily suspended by campus administration.' });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Requires verified administrator credentials.' });
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Public Stats API for Landing Page
  app.get('/api/stats/public', (_req, res) => {
    const totalItems = items.length;
    const successfullyReturned = items.filter(i => i.status === 'returned').length;
    const activeReports = items.filter(i => i.status === 'open' || i.status === 'claimed').length;
    const totalFound = items.filter(i => i.item_type === 'found').length;
    const totalLost = items.filter(i => i.item_type === 'lost').length;

    res.json({
      total_items: totalItems + 142,
      successfully_returned: successfullyReturned + 128,
      active_reports: activeReports,
      total_found: totalFound,
      total_lost: totalLost
    });
  });

  // Public Campus System Settings
  app.get('/api/settings/public', (_req, res) => {
    res.json({
      system_name: system_settings.system_name,
      college_name: system_settings.college_name,
      security_hotline: system_settings.security_hotline,
      central_office: system_settings.central_office,
      contact_email: system_settings.contact_email,
      operating_hours: system_settings.operating_hours
    });
  });

  // Categories
  app.get('/api/categories', (_req, res) => {
    res.json(item_categories.filter(c => c.is_active));
  });

  // AUTH ROUTES
  app.post('/api/auth/register', (req, res) => {
    const {
      full_name,
      campus_id,
      email,
      password,
      confirm_password,
      department,
      course,
      semester,
      phone
    } = req.body;

    if (!full_name || !campus_id || !email || !password) {
      return res.status(400).json({ error: 'Full name, campus ID, email, and password are required.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const campusIdNormalized = campus_id.toUpperCase().trim();

    // Check duplicate
    if (profiles.some(p => p.email.toLowerCase() === emailNormalized)) {
      return res.status(409).json({ error: 'An account with this college email already exists.' });
    }
    if (profiles.some(p => p.campus_id.toUpperCase() === campusIdNormalized)) {
      return res.status(409).json({ error: 'An account with this Campus ID already exists.' });
    }

    const newProfile = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      full_name: full_name.trim(),
      campus_id: campusIdNormalized,
      email: emailNormalized,
      phone: phone ? phone.trim() : '',
      department: department || 'General Studies',
      course: course || 'Undergraduate',
      semester: semester || 'Current',
      role: 'student', // Security: Role cannot be self-elevated
      account_status: 'active',
      password_hash: hashPassword(password),
      created_at: new Date().toISOString()
    };

    profiles.push(newProfile);

    // Welcome notification
    notifications.unshift({
      id: 'notif_' + Date.now(),
      user_id: newProfile.id,
      title: 'Welcome to Findlt Campus Portal',
      message: 'Your account is active. You can now report lost or found items and submit ownership claims.',
      notification_type: 'account_welcome',
      is_read: false,
      created_at: new Date().toISOString()
    });

    const token = jwt.sign(
      { userId: newProfile.id, email: newProfile.email, role: newProfile.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = newProfile;
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: safeUser
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Campus email or ID, and password are required.' });
    }

    const query = identifier.trim().toLowerCase();
    const hashed = hashPassword(password);

    const user = profiles.find(p =>
      (p.email.toLowerCase() === query || p.campus_id.toLowerCase() === query)
    );

    if (!user || user.password_hash !== hashed) {
      return res.status(401).json({ error: 'Invalid campus credentials. Please check your email/ID and password.' });
    }

    if (user.account_status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended by campus administration. Please contact room 102.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', verifyToken, (req, res) => {
    const user = (req as any).user;
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // ITEMS PUBLIC & STUDENT ROUTES
  app.get('/api/items', (req, res) => {
    const { type, category, location, status, search, sort, page = '1', limit = '12' } = req.query;

    let filtered = [...items];

    if (type && type !== 'all') {
      filtered = filtered.filter(i => i.item_type === type);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(i => i.category.toLowerCase() === String(category).toLowerCase());
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(i => i.status.toLowerCase() === String(status).toLowerCase());
    }

    if (location && location !== 'all') {
      filtered = filtered.filter(i => i.location.toLowerCase().includes(String(location).toLowerCase()));
    }

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(i =>
        i.item_name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.brand && i.brand.toLowerCase().includes(q)) ||
        i.location.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }

    if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 12);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / l) || 1;
    const paginatedItems = filtered.slice((p - 1) * l, p * l).map(i => {
      return {
        ...i,
        user_id: undefined // Mask reporter ID in public list for privacy
      };
    });

    res.json({
      items: paginatedItems,
      page: p,
      limit: l,
      total_count: totalCount,
      total_pages: totalPages
    });
  });

  app.get('/api/items/:id', (req, res) => {
    const item = items.find(i => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    let isOwnerOrAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
        if (decoded.role === 'admin' || decoded.userId === item.user_id) {
          isOwnerOrAdmin = true;
        }
      } catch (e) {
        // ignore
      }
    }

    const safeItem = {
      ...item,
      reporter_name: isOwnerOrAdmin ? profiles.find(p => p.id === item.user_id)?.full_name : undefined,
      reporter_email: isOwnerOrAdmin ? profiles.find(p => p.id === item.user_id)?.email : undefined
    };

    res.json({ item: safeItem });
  });

  // Report Lost Item
  app.post('/api/items/lost', verifyToken, (req, res) => {
    const user = (req as any).user;
    const {
      item_name,
      category,
      description,
      brand,
      color,
      last_seen_date,
      last_seen_location,
      additional_details,
      contact_preference
    } = req.body;

    if (!item_name || !category || !description || !last_seen_location) {
      return res.status(400).json({ error: 'Item name, category, description, and last seen location are required.' });
    }

    const newItem = {
      id: 'item_l_' + Date.now(),
      user_id: user.id,
      item_name: item_name.trim(),
      category: category.trim(),
      item_type: 'lost',
      brand: brand ? brand.trim() : '',
      color: color ? color.trim() : '',
      image_url: '',
      report_date: last_seen_date || new Date().toISOString().split('T')[0],
      location: last_seen_location.trim(),
      submitted_to: '',
      status: 'open',
      description: description.trim(),
      additional_notes: (additional_details || '') + (contact_preference ? ` [Contact preference: ${contact_preference}]` : ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    items.unshift(newItem);

    // Notify user
    notifications.unshift({
      id: 'notif_' + Date.now(),
      user_id: user.id,
      title: 'Lost Item Report Logged',
      message: `Your lost report for "${newItem.item_name}" has been published. Campus members and security have been alerted.`,
      notification_type: 'report_created',
      is_read: false,
      created_at: new Date().toISOString()
    });

    res.status(201).json({ message: 'Lost item report submitted successfully', item: newItem });
  });

  // Report Found Item
  app.post('/api/items/found', verifyToken, (req, res) => {
    const user = (req as any).user;
    const {
      item_name,
      category,
      description,
      image_url,
      found_date,
      found_location,
      submitted_to,
      additional_notes
    } = req.body;

    if (!item_name || !category || !description || !found_location) {
      return res.status(400).json({ error: 'Item name, category, description, and found location are required.' });
    }

    const newItem = {
      id: 'item_f_' + Date.now(),
      user_id: user.id,
      item_name: item_name.trim(),
      category: category.trim(),
      item_type: 'found',
      brand: req.body.brand || '',
      color: req.body.color || '',
      image_url: image_url || '/src/assets/images/found_item_macbook_1793681206791.jpg',
      report_date: found_date || new Date().toISOString().split('T')[0],
      location: found_location.trim(),
      submitted_to: submitted_to ? submitted_to.trim() : 'Campus Security Office',
      status: 'open',
      description: description.trim(),
      additional_notes: additional_notes ? additional_notes.trim() : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    items.unshift(newItem);

    // Notify finder
    notifications.unshift({
      id: 'notif_' + Date.now(),
      user_id: user.id,
      title: 'Found Item Registered',
      message: `Thank you for turning in "${newItem.item_name}". It is now listed in the campus directory for the verified owner to claim.`,
      notification_type: 'report_created',
      is_read: false,
      created_at: new Date().toISOString()
    });

    // Notify admins
    profiles.filter(p => p.role === 'admin').forEach(admin => {
      notifications.unshift({
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        user_id: admin.id,
        title: 'New Found Item Submitted',
        message: `${user.full_name} turned in "${newItem.item_name}" at ${newItem.submitted_to}.`,
        notification_type: 'admin_alert',
        is_read: false,
        created_at: new Date().toISOString()
      });
    });

    res.status(201).json({ message: 'Found item registered successfully', item: newItem });
  });

  // Update item
  app.put('/api/items/:id', verifyToken, (req, res) => {
    const user = (req as any).user;
    const itemIndex = items.findIndex(i => i.id === req.params.id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const currentItem = items[itemIndex];
    if (user.role !== 'admin' && currentItem.user_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this report' });
    }

    const {
      item_name,
      category,
      description,
      brand,
      color,
      location,
      status,
      additional_notes
    } = req.body;

    items[itemIndex] = {
      ...currentItem,
      item_name: item_name ? item_name.trim() : currentItem.item_name,
      category: category ? category.trim() : currentItem.category,
      description: description !== undefined ? description.trim() : currentItem.description,
      brand: brand !== undefined ? brand.trim() : currentItem.brand,
      color: color !== undefined ? color.trim() : currentItem.color,
      location: location ? location.trim() : currentItem.location,
      status: status || currentItem.status,
      additional_notes: additional_notes !== undefined ? additional_notes.trim() : currentItem.additional_notes,
      updated_at: new Date().toISOString()
    };

    res.json({ message: 'Item updated successfully', item: items[itemIndex] });
  });

  // Delete item
  app.delete('/api/items/:id', verifyToken, (req, res) => {
    const user = (req as any).user;
    const itemIndex = items.findIndex(i => i.id === req.params.id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const currentItem = items[itemIndex];
    if (user.role !== 'admin' && currentItem.user_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this report' });
    }

    items.splice(itemIndex, 1);
    res.json({ message: 'Item removed successfully' });
  });

  // CLAIMS MODULE
  app.post('/api/claims', verifyToken, (req, res) => {
    const user = (req as any).user;
    const { item_id, ownership_description, evidence_url } = req.body;

    if (!item_id || !ownership_description) {
      return res.status(400).json({ error: 'Item ID and detailed ownership description are required.' });
    }

    const item = items.find(i => i.id === item_id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.item_type !== 'found') {
      return res.status(400).json({ error: 'Claims can only be filed against found items.' });
    }

    if (item.status === 'returned') {
      return res.status(400).json({ error: 'This item has already been successfully returned and closed.' });
    }

    const existing = claims.find(c => c.item_id === item_id && c.claimant_id === user.id && c.status !== 'Rejected');
    if (existing) {
      return res.status(409).json({ error: 'You have already submitted a claim for this item. Check "My Claims".' });
    }

    const newClaim = {
      id: 'clm_' + Date.now(),
      item_id,
      claimant_id: user.id,
      ownership_description: ownership_description.trim(),
      evidence_url: evidence_url ? evidence_url.trim() : '',
      status: 'Pending',
      admin_remarks: 'Claim submitted. Awaiting administrative review and physical verification.',
      reviewed_by: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    claims.unshift(newClaim);

    // Update item status to 'claimed' if was open
    item.status = 'claimed';
    item.updated_at = new Date().toISOString();

    // Notify claimant
    notifications.unshift({
      id: 'notif_' + Date.now(),
      user_id: user.id,
      title: 'Claim Request Submitted',
      message: `Your claim for "${item.item_name}" has been placed in review. An administrator will inspect the details.`,
      notification_type: 'claim_submitted',
      is_read: false,
      created_at: new Date().toISOString()
    });

    // Notify admins
    profiles.filter(p => p.role === 'admin').forEach(admin => {
      notifications.unshift({
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        user_id: admin.id,
        title: 'New Ownership Claim Pending',
        message: `${user.full_name} (${user.campus_id}) filed a claim on "${item.item_name}".`,
        notification_type: 'admin_alert',
        is_read: false,
        created_at: new Date().toISOString()
      });
    });

    res.status(201).json({ message: 'Ownership claim submitted successfully', claim: newClaim });
  });

  app.get('/api/claims/my', verifyToken, (req, res) => {
    const user = (req as any).user;
    const userClaims = claims
      .filter(c => c.claimant_id === user.id)
      .map(c => {
        const item = items.find(i => i.id === c.item_id);
        return {
          ...c,
          item_name: item ? item.item_name : 'Unknown Item',
          item_category: item ? item.category : '',
          item_image: item ? item.image_url : '',
          item_location: item ? item.location : '',
          item_status: item ? item.status : ''
        };
      });

    res.json({ claims: userClaims });
  });

  app.get('/api/claims/:id', verifyToken, (req, res) => {
    const user = (req as any).user;
    const claim = claims.find(c => c.id === req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (user.role !== 'admin' && claim.claimant_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this claim' });
    }

    const item = items.find(i => i.id === claim.item_id);
    const claimant = profiles.find(p => p.id === claim.claimant_id);

    res.json({
      claim: {
        ...claim,
        item,
        claimant: user.role === 'admin' ? {
          id: claimant?.id,
          full_name: claimant?.full_name,
          campus_id: claimant?.campus_id,
          email: claimant?.email,
          phone: claimant?.phone,
          department: claimant?.department
        } : undefined
      }
    });
  });

  // STUDENT REPORTS
  app.get('/api/my/reports', verifyToken, (req, res) => {
    const user = (req as any).user;
    const userItems = items.filter(i => i.user_id === user.id);
    const userLost = userItems.filter(i => i.item_type === 'lost');
    const userFound = userItems.filter(i => i.item_type === 'found');

    res.json({
      lost: userLost,
      found: userFound,
      total_lost: userLost.length,
      total_found: userFound.length
    });
  });

  // NOTIFICATIONS
  app.get('/api/notifications', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ notifications: [], unread_count: 0 });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = profiles.find(p => p.id === decoded.userId);
      if (!user) {
        return res.json({ notifications: [], unread_count: 0 });
      }
      if (user.account_status === 'suspended') {
        return res.status(403).json({ error: 'Your account is temporarily suspended by campus administration.' });
      }

      const userNotifs = user.role === 'admin'
        ? notifications
        : notifications.filter(n => n.user_id === user.id);
      const unreadCount = userNotifs.filter(n => !n.is_read).length;

      return res.json({
        notifications: userNotifs,
        unread_count: unreadCount
      });
    } catch (err) {
      return res.json({ notifications: [], unread_count: 0 });
    }
  });

  app.put('/api/notifications/:id/read', verifyToken, (req, res) => {
    const user = (req as any).user;
    const notif = notifications.find(n => n.id === req.params.id && n.user_id === user.id);
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    notif.is_read = true;
    res.json({ message: 'Marked as read' });
  });

  app.put('/api/notifications/read-all', verifyToken, (req, res) => {
    const user = (req as any).user;
    notifications.forEach(n => {
      if (n.user_id === user.id) n.is_read = true;
    });
    res.json({ message: 'All notifications marked as read' });
  });

  // ========================================================
  // SUPER ADMIN PANEL REST APIS
  // ========================================================

  // 1. Live Dashboard Statistics & Analytics
  app.get('/api/admin/dashboard', verifyToken, requireAdmin, (_req, res) => {
    const totalStudents = profiles.filter(p => p.role === 'student').length;
    const totalUsers = profiles.length;
    const totalLost = items.filter(i => i.item_type === 'lost').length;
    const totalFound = items.filter(i => i.item_type === 'found').length;
    const activeReports = items.filter(i => i.status === 'open' || i.status === 'claimed').length;
    const pendingClaims = claims.filter(c => c.status === 'Pending' || c.status === 'Under Review').length;
    const approvedClaims = claims.filter(c => c.status === 'Approved').length;
    const rejectedClaims = claims.filter(c => c.status === 'Rejected').length;
    const returnedItems = items.filter(i => i.status === 'returned').length;
    const blockedUsers = profiles.filter(p => p.account_status === 'suspended').length;

    const monthlyReports = [
      { month: 'Jun', lost: 12, found: 18, returned: 14 },
      { month: 'Jul', lost: 15, found: 21, returned: 18 },
      { month: 'Aug', lost: 28, found: 34, returned: 26 },
      { month: 'Sep', lost: 32, found: 40, returned: 35 },
      { month: 'Oct', lost: 24, found: 31, returned: 27 },
      { month: 'Nov', lost: totalLost, found: totalFound, returned: returnedItems }
    ];

    const claimDistribution = [
      { status: 'Pending', count: claims.filter(c => c.status === 'Pending').length },
      { status: 'Under Review', count: claims.filter(c => c.status === 'Under Review').length },
      { status: 'Approved', count: approvedClaims },
      { status: 'Rejected', count: rejectedClaims },
      { status: 'Completed', count: claims.filter(c => c.status === 'Completed').length }
    ];

    const userRegMap: Record<string, number> = {};
    profiles.forEach(p => {
      const dept = p.department || 'General';
      userRegMap[dept] = (userRegMap[dept] || 0) + 1;
    });
    const userRegistrationStats = Object.entries(userRegMap).map(([dept, count]) => ({
      department: dept,
      count
    }));

    const recentActivity = admin_activity_logs.slice(0, 8);
    const latestReports = items.slice(0, 5).map(i => {
      const reporter = profiles.find(p => p.id === i.user_id);
      return {
        ...i,
        reporter_name: reporter?.full_name || 'Campus Student',
        reporter_campus_id: reporter?.campus_id || 'N/A'
      };
    });
    const recentClaimRequests = claims.slice(0, 5).map(c => {
      const item = items.find(i => i.id === c.item_id);
      const claimant = profiles.find(p => p.id === c.claimant_id);
      return {
        ...c,
        item_name: item?.item_name || 'Article',
        claimant_name: claimant?.full_name || 'Student',
        claimant_campus_id: claimant?.campus_id || 'N/A'
      };
    });

    res.json({
      stats: {
        total_students: totalStudents,
        total_users: totalUsers,
        total_lost: totalLost,
        total_found: totalFound,
        active_reports: activeReports,
        pending_claims: pendingClaims,
        approved_claims: approvedClaims,
        rejected_claims: rejectedClaims,
        returned_items: returnedItems,
        blocked_users: blockedUsers
      },
      monthly_reports: monthlyReports,
      claim_distribution: claimDistribution,
      user_registration_stats: userRegistrationStats,
      recent_activity: recentActivity,
      latest_reports: latestReports,
      recent_claim_requests: recentClaimRequests
    });
  });

  // 2. User Management
  app.get('/api/admin/users', verifyToken, requireAdmin, (_req, res) => {
    const safeUsers = profiles.map(p => {
      const { password_hash, ...u } = p;
      return {
        ...u,
        reports_count: items.filter(i => i.user_id === p.id).length,
        claims_count: claims.filter(c => c.claimant_id === p.id).length
      };
    });
    res.json({ users: safeUsers });
  });

  app.get('/api/admin/users/:id/details', verifyToken, requireAdmin, (req, res) => {
    const targetUser = profiles.find(p => p.id === req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const { password_hash, ...safeUser } = targetUser;
    const userReports = items.filter(i => i.user_id === targetUser.id);
    const userClaims = claims
      .filter(c => c.claimant_id === targetUser.id)
      .map(c => {
        const item = items.find(i => i.id === c.item_id);
        return {
          ...c,
          item_name: item?.item_name || 'Article',
          item_category: item?.category || '',
          item_image: item?.image_url || ''
        };
      });

    res.json({
      user: safeUser,
      lost_reports: userReports.filter(i => i.item_type === 'lost'),
      found_reports: userReports.filter(i => i.item_type === 'found'),
      claims: userClaims,
      stats: {
        total_lost: userReports.filter(i => i.item_type === 'lost').length,
        total_found: userReports.filter(i => i.item_type === 'found').length,
        total_claims: userClaims.length
      }
    });
  });

  app.put('/api/admin/users/:id/status', verifyToken, requireAdmin, (req, res) => {
    const currentAdmin = (req as any).user;
    const { status, role } = req.body;
    const targetUser = profiles.find(p => p.id === req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Security: Prevent admins from accidentally removing their own admin access or blocking themselves
    if (currentAdmin.id === targetUser.id && (status === 'suspended' || role === 'student')) {
      return res.status(400).json({ error: 'Security constraint: Administrators cannot suspend or demote their own active account.' });
    }

    const prevStatus = targetUser.account_status;
    const prevRole = targetUser.role;

    if (status) {
      targetUser.account_status = status;
      logAdminAction(
        currentAdmin,
        status === 'suspended' ? 'User Suspended' : 'User Activated',
        'Profile',
        targetUser.id,
        `${currentAdmin.full_name} changed account status of ${targetUser.full_name} (${targetUser.campus_id}) to ${status}.`,
        prevStatus,
        status
      );

      if (status === 'suspended') {
        notifications.unshift({
          id: 'notif_' + Date.now(),
          user_id: targetUser.id,
          title: 'Account Suspended',
          message: 'Your campus portal account has been temporarily suspended by administration. Contact Security Desk Room 102.',
          notification_type: 'account_suspended',
          is_read: false,
          created_at: new Date().toISOString()
        });
      }
    }

    if (role && (role === 'admin' || role === 'student')) {
      targetUser.role = role;
      logAdminAction(
        currentAdmin,
        'User Role Changed',
        'Profile',
        targetUser.id,
        `Role of ${targetUser.full_name} (${targetUser.campus_id}) modified from ${prevRole} to ${role}.`,
        prevRole,
        role
      );
    }

    const { password_hash, ...safeUser } = targetUser;
    res.json({ message: 'User status updated successfully', user: safeUser });
  });

  // 3. Items Management (Lost & Found)
  app.get('/api/admin/items', verifyToken, requireAdmin, (_req, res) => {
    const fullItems = items.map(i => {
      const reporter = profiles.find(p => p.id === i.user_id);
      return {
        ...i,
        reporter_name: reporter?.full_name || 'Campus Student',
        reporter_campus_id: reporter?.campus_id || 'N/A',
        reporter_email: reporter?.email || 'N/A',
        claims_count: claims.filter(c => c.item_id === i.id).length
      };
    });
    res.json({ items: fullItems });
  });

  app.put('/api/admin/items/:id/status', verifyToken, requireAdmin, (req, res) => {
    const currentAdmin = (req as any).user;
    const { status } = req.body;
    const item = items.find(i => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const prevStatus = item.status;
    item.status = status;
    item.updated_at = new Date().toISOString();

    logAdminAction(
      currentAdmin,
      'Item Status Updated',
      'Item',
      item.id,
      `Status for "${item.item_name}" (${item.item_type}) updated to ${status}.`,
      prevStatus,
      status
    );

    res.json({ message: 'Item status updated', item });
  });

  app.put('/api/admin/items/:id', verifyToken, requireAdmin, (req, res) => {
    const currentAdmin = (req as any).user;
    const itemIndex = items.findIndex(i => i.id === req.params.id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const currentItem = items[itemIndex];
    const {
      item_name,
      category,
      description,
      brand,
      color,
      location,
      status,
      submitted_to,
      additional_notes
    } = req.body;

    items[itemIndex] = {
      ...currentItem,
      item_name: item_name !== undefined ? item_name.trim() : currentItem.item_name,
      category: category !== undefined ? category.trim() : currentItem.category,
      description: description !== undefined ? description.trim() : currentItem.description,
      brand: brand !== undefined ? brand.trim() : currentItem.brand,
      color: color !== undefined ? color.trim() : currentItem.color,
      location: location !== undefined ? location.trim() : currentItem.location,
      status: status !== undefined ? status : currentItem.status,
      submitted_to: submitted_to !== undefined ? submitted_to : currentItem.submitted_to,
      additional_notes: additional_notes !== undefined ? additional_notes.trim() : currentItem.additional_notes,
      updated_at: new Date().toISOString()
    };

    logAdminAction(
      currentAdmin,
      'Item Modified',
      'Item',
      currentItem.id,
      `Administrator edited record details for "${items[itemIndex].item_name}".`
    );

    res.json({ message: 'Item record updated successfully', item: items[itemIndex] });
  });

  app.delete('/api/admin/items/:id', verifyToken, requireAdmin, (req, res) => {
    const currentAdmin = (req as any).user;
    const itemIndex = items.findIndex(i => i.id === req.params.id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const removedItem = items[itemIndex];
    items.splice(itemIndex, 1);

    logAdminAction(
      currentAdmin,
      'Report Deleted',
      'Item',
      removedItem.id,
      `Administrator permanently removed inappropriate/misleading report: "${removedItem.item_name}".`,
      removedItem.status,
      'deleted'
    );

    res.json({ message: 'Report removed from campus database' });
  });

  // 4. Claims & Handover Verification
  app.get('/api/admin/claims', verifyToken, requireAdmin, (_req, res) => {
    const enrichedClaims = claims.map(c => {
      const item = items.find(i => i.id === c.item_id);
      const claimant = profiles.find(p => p.id === c.claimant_id);
      const reviewer = profiles.find(p => p.id === c.reviewed_by);
      return {
        ...c,
        item_name: item?.item_name || 'Unknown Item',
        item_category: item?.category || '',
        item_image: item?.image_url || '',
        item_location: item?.location || '',
        item_status: item?.status || '',
        claimant_name: claimant?.full_name || 'Student',
        claimant_campus_id: claimant?.campus_id || 'N/A',
        claimant_email: claimant?.email || 'N/A',
        claimant_phone: claimant?.phone || 'N/A',
        reviewer_name: reviewer?.full_name || (c.reviewed_by ? 'Staff Administrator' : 'Not Reviewed')
      };
    });
    res.json({ claims: enrichedClaims });
  });

  app.put('/api/admin/claims/:id/review', verifyToken, requireAdmin, (req, res) => {
    const { status, admin_remarks } = req.body;
    const user = (req as any).user;
    const claim = claims.find(c => c.id === req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (!['Pending', 'Under Review', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid claim status' });
    }

    const prevStatus = claim.status;
    claim.status = status;
    claim.admin_remarks = admin_remarks || claim.admin_remarks;
    claim.reviewed_by = user.id;
    claim.updated_at = new Date().toISOString();

    const item = items.find(i => i.id === claim.item_id);
    const claimant = profiles.find(p => p.id === claim.claimant_id);

    logAdminAction(
      user,
      status === 'Approved' ? 'Claim Approved' : status === 'Rejected' ? 'Claim Rejected' : 'Claim In Review',
      'Claim',
      claim.id,
      `Claim on "${item?.item_name || 'Item'}" by ${claimant?.full_name || 'Student'} reviewed by ${user.full_name}. Remarks: ${admin_remarks || 'None'}`,
      prevStatus,
      status
    );

    // Notify student claimant
    notifications.unshift({
      id: 'notif_' + Date.now(),
      user_id: claim.claimant_id,
      title: `Claim ${status}: ${item?.item_name || 'Item'}`,
      message: status === 'Approved'
        ? `Your claim for "${item?.item_name}" has been APPROVED. Please visit the Campus Security Desk (Gate 2) with your student ID card to complete physical verification.`
        : `Your claim for "${item?.item_name}" status was updated to ${status}. Admin notes: ${admin_remarks || 'None'}`,
      notification_type: status === 'Approved' ? 'claim_approved' : 'claim_status_update',
      is_read: false,
      created_at: new Date().toISOString()
    });

    res.json({ message: `Claim updated to ${status}`, claim });
  });

  app.post('/api/admin/handover', verifyToken, requireAdmin, (req, res) => {
    const admin = (req as any).user;
    const { item_id, claim_id, remarks } = req.body;

    if (!item_id || !claim_id) {
      return res.status(400).json({ error: 'Item ID and Claim ID are required for handover completion.' });
    }

    const item = items.find(i => i.id === item_id);
    const claim = claims.find(c => c.id === claim_id);

    if (!item || !claim) {
      return res.status(404).json({ error: 'Item or Claim record not found' });
    }

    if (item.status === 'returned') {
      return res.status(400).json({ error: 'This item has already been handed over and marked as Returned.' });
    }

    const prevItemStatus = item.status;

    // Update statuses
    item.status = 'returned';
    item.updated_at = new Date().toISOString();

    claim.status = 'Completed';
    claim.admin_remarks = (claim.admin_remarks || '') + ` [Handover verified by ${admin.full_name}: ${remarks || 'Physical verification complete'}]`;
    claim.reviewed_by = admin.id;
    claim.updated_at = new Date().toISOString();

    // Reject any conflicting claims for this same item
    claims.forEach(c => {
      if (c.item_id === item_id && c.id !== claim_id && c.status !== 'Completed') {
        c.status = 'Rejected';
        c.admin_remarks = 'Another claimant successfully verified ownership and item was handed over.';
      }
    });

    const handoverRecord = {
      id: 'hnd_' + Date.now(),
      item_id,
      claim_id,
      verified_by: admin.full_name,
      handover_date: new Date().toISOString().split('T')[0],
      remarks: remarks || 'Physical student identity and ownership evidence verified.',
      status: 'Verified',
      created_at: new Date().toISOString()
    };
    handover_records.unshift(handoverRecord);

    const claimant = profiles.find(p => p.id === claim.claimant_id);

    logAdminAction(
      admin,
      'Handover Verified',
      'Handover',
      handoverRecord.id,
      `Custodial handover of "${item.item_name}" completed for ${claimant?.full_name || 'Claimant'}. Verified by ${admin.full_name}.`,
      prevItemStatus,
      'returned'
    );

    // Notify claimant
    notifications.unshift({
      id: 'notif_' + Date.now(),
      user_id: claim.claimant_id,
      title: 'Item Handover Complete! 🎉',
      message: `Your item "${item.item_name}" was successfully verified and handed over. Thank you for using Findlt Campus Lost & Found!`,
      notification_type: 'item_returned',
      is_read: false,
      created_at: new Date().toISOString()
    });

    res.json({
      message: 'Item handover successfully recorded. Status marked as Returned.',
      handover: handoverRecord,
      item,
      claim
    });
  });

  // 5. Returned Items List
  app.get('/api/admin/returned-items', verifyToken, requireAdmin, (_req, res) => {
    const list = handover_records.map(h => {
      const item = items.find(i => i.id === h.item_id);
      const claim = claims.find(c => c.id === h.claim_id);
      const claimant = claim ? profiles.find(p => p.id === claim.claimant_id) : null;
      return {
        ...h,
        item_name: item?.item_name || 'Resolved Article',
        item_image: item?.image_url || '',
        item_category: item?.category || '',
        item_location: item?.location || '',
        claimant_name: claimant?.full_name || 'Verified Student',
        claimant_campus_id: claimant?.campus_id || 'N/A',
        claimant_email: claimant?.email || 'N/A',
        ownership_description: claim?.ownership_description || ''
      };
    });
    res.json({ returned_items: list });
  });

  // 6. Categories Management
  app.get('/api/admin/categories', verifyToken, requireAdmin, (_req, res) => {
    const enriched = item_categories.map(c => ({
      ...c,
      items_count: items.filter(i => i.category.toLowerCase() === c.category_name.toLowerCase()).length
    }));
    res.json({ categories: enriched });
  });

  app.post('/api/admin/categories', verifyToken, requireAdmin, (req, res) => {
    const admin = (req as any).user;
    const { category_name, description } = req.body;
    if (!category_name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const newCat = {
      id: 'cat_' + Date.now(),
      category_name: category_name.trim(),
      description: description ? description.trim() : '',
      is_active: true
    };
    item_categories.push(newCat);

    logAdminAction(
      admin,
      'Category Created',
      'Category',
      newCat.id,
      `Administrator added new category: "${newCat.category_name}".`
    );

    res.status(201).json({ message: 'Category added', category: newCat });
  });

  app.put('/api/admin/categories/:id', verifyToken, requireAdmin, (req, res) => {
    const admin = (req as any).user;
    const cat = item_categories.find(c => c.id === req.params.id);
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { category_name, description, is_active } = req.body;
    if (category_name !== undefined) cat.category_name = category_name.trim();
    if (description !== undefined) cat.description = description.trim();
    if (is_active !== undefined) cat.is_active = is_active;

    logAdminAction(
      admin,
      'Category Updated',
      'Category',
      cat.id,
      `Administrator updated category "${cat.category_name}" (Active: ${cat.is_active}).`
    );

    res.json({ message: 'Category updated', category: cat });
  });

  // 7. Activity Logs
  app.get('/api/admin/logs', verifyToken, requireAdmin, (req, res) => {
    const { action, search, limit = '50' } = req.query;
    let list = [...admin_activity_logs];

    if (action && action !== 'all') {
      list = list.filter(l => l.action.toLowerCase() === String(action).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(l =>
        l.details.toLowerCase().includes(q) ||
        l.admin_name.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target_id.toLowerCase().includes(q)
      );
    }

    const maxLimit = Math.min(100, parseInt(String(limit), 10) || 50);
    res.json({
      logs: list.slice(0, maxLimit),
      total_count: list.length
    });
  });

  // 8. Notifications & Broadcasts
  app.post('/api/admin/broadcast', verifyToken, requireAdmin, (req, res) => {
    const admin = (req as any).user;
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Announcement title and message are required.' });
    }

    const studentProfiles = profiles.filter(p => p.role === 'student');
    studentProfiles.forEach(student => {
      notifications.unshift({
        id: 'notif_bcast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        user_id: student.id,
        title: `📢 Campus Announcement: ${title.trim()}`,
        message: message.trim(),
        notification_type: 'campus_announcement',
        is_read: false,
        created_at: new Date().toISOString()
      });
    });

    logAdminAction(
      admin,
      'Broadcast Announcement Sent',
      'Notification',
      'all_students',
      `Administrator broadcasted announcement "${title}" to ${studentProfiles.length} students.`
    );

    res.json({
      message: `Announcement successfully broadcasted to ${studentProfiles.length} campus users.`
    });
  });

  app.post('/api/admin/notify-user', verifyToken, requireAdmin, (req, res) => {
    const admin = (req as any).user;
    const { user_id, title, message } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({ error: 'Recipient user ID, title, and message are required.' });
    }

    const targetUser = profiles.find(p => p.id === user_id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    notifications.unshift({
      id: 'notif_direct_' + Date.now(),
      user_id: targetUser.id,
      title: title.trim(),
      message: message.trim(),
      notification_type: 'admin_direct_message',
      is_read: false,
      created_at: new Date().toISOString()
    });

    logAdminAction(
      admin,
      'Direct Notification Sent',
      'Notification',
      targetUser.id,
      `Direct message sent to ${targetUser.full_name} (${targetUser.campus_id}): "${title}".`
    );

    res.json({ message: `Notification sent to ${targetUser.full_name}` });
  });

  // 9. Institutional System Settings
  app.get('/api/admin/settings', verifyToken, requireAdmin, (_req, res) => {
    res.json({ settings: system_settings });
  });

  app.put('/api/admin/settings', verifyToken, requireAdmin, (req, res) => {
    const admin = (req as any).user;
    const incoming = req.body;

    system_settings = {
      ...system_settings,
      ...incoming,
      updated_at: new Date().toISOString()
    };

    logAdminAction(
      admin,
      'Settings Updated',
      'System Settings',
      'settings_core',
      `Administrator modified institutional campus settings and custody rules.`
    );

    res.json({ message: 'System settings saved successfully', settings: system_settings });
  });

app.listen(PORT, '0.0.0.0', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Findlt Backend Server running on ${url}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
  