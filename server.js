const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Initialize SQLite database
const db = new sqlite3.Database('suraksha.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Create donors table
    db.run(`CREATE TABLE IF NOT EXISTS donors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        weight INTEGER NOT NULL,
        mobile TEXT NOT NULL,
        country_code TEXT DEFAULT '+91',
        email TEXT,
        location TEXT NOT NULL,
        address TEXT NOT NULL,
        last_donation DATE,
        medical_history TEXT,
        registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_available BOOLEAN DEFAULT 1,
        latitude REAL,
        longitude REAL,
        points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        total_donations INTEGER DEFAULT 0,
        streak_count INTEGER DEFAULT 0,
        last_streak_date DATE,
        verification_status TEXT DEFAULT 'pending',
        health_score REAL DEFAULT 0.0,
        preferred_notification_time TEXT DEFAULT '09:00',
        emergency_contact TEXT,
        social_media_consent BOOLEAN DEFAULT 0
    )`);

    // Create receivers table
    db.run(`CREATE TABLE IF NOT EXISTS receivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        required_blood_group TEXT NOT NULL,
        mobile TEXT NOT NULL,
        country_code TEXT DEFAULT '+91',
        email TEXT,
        location TEXT NOT NULL,
        address TEXT NOT NULL,
        urgency TEXT NOT NULL,
        hospital_name TEXT,
        patient_condition TEXT,
        request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        latitude REAL,
        longitude REAL,
        emergency_level INTEGER DEFAULT 1,
        family_contact TEXT,
        doctor_name TEXT,
        doctor_contact TEXT
    )`);

    // Create matches table to track donor-receiver connections
    db.run(`CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        donor_id INTEGER,
        receiver_id INTEGER,
        match_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        donation_completed BOOLEAN DEFAULT 0,
        donation_date DATE,
        feedback_rating INTEGER,
        feedback_comment TEXT,
        points_awarded INTEGER DEFAULT 0,
        FOREIGN KEY (donor_id) REFERENCES donors (id),
        FOREIGN KEY (receiver_id) REFERENCES receivers (id)
    )`);

    // Create gamification tables
    db.run(`CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        points_required INTEGER,
        category TEXT,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS donor_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        donor_id INTEGER,
        achievement_id INTEGER,
        earned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES donors (id),
        FOREIGN KEY (achievement_id) REFERENCES achievements (id)
    )`);

    // Create blood inventory table
    db.run(`CREATE TABLE IF NOT EXISTS blood_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_name TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        units_available INTEGER DEFAULT 0,
        units_required INTEGER DEFAULT 0,
        expiry_date DATE,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        latitude REAL,
        longitude REAL
    )`);

    // Create donor wellness tracking
    db.run(`CREATE TABLE IF NOT EXISTS wellness_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        donor_id INTEGER,
        donation_id INTEGER,
        pre_donation_health_score REAL,
        post_donation_health_score REAL,
        recovery_time_hours INTEGER,
        side_effects TEXT,
        tracking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES donors (id),
        FOREIGN KEY (donation_id) REFERENCES matches (id)
    )`);

    // Create emergency alerts table
    db.run(`CREATE TABLE IF NOT EXISTS emergency_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receiver_id INTEGER,
        alert_type TEXT NOT NULL,
        message TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        sent_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'sent',
        response_count INTEGER DEFAULT 0,
        FOREIGN KEY (receiver_id) REFERENCES receivers (id)
    )`);

    // Create community challenges
    db.run(`CREATE TABLE IF NOT EXISTS community_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        target_donations INTEGER,
        current_donations INTEGER DEFAULT 0,
        start_date DATE,
        end_date DATE,
        reward_points INTEGER,
        status TEXT DEFAULT 'active',
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default achievements
    insertDefaultAchievements();

    console.log('Database tables initialized with enhanced features');
}

// Insert default achievements
function insertDefaultAchievements() {
    const achievements = [
        { name: 'First Drop', description: 'Complete your first blood donation', icon: '🩸', points_required: 50, category: 'milestone' },
        { name: 'Life Saver', description: 'Save 5 lives through donations', icon: '💖', points_required: 250, category: 'milestone' },
        { name: 'Hero Donor', description: 'Complete 10 donations', icon: '🦸', points_required: 500, category: 'milestone' },
        { name: 'Streak Master', description: 'Maintain 3-month donation streak', icon: '🔥', points_required: 300, category: 'streak' },
        { name: 'Emergency Responder', description: 'Respond to 5 emergency requests', icon: '🚨', points_required: 400, category: 'emergency' },
        { name: 'Community Champion', description: 'Participate in community challenges', icon: '🏆', points_required: 200, category: 'community' },
        { name: 'Perfect Health', description: 'Maintain 95%+ health score', icon: '💪', points_required: 150, category: 'health' },
        { name: 'Rare Blood Hero', description: 'Donate rare blood type (AB-, O-)', icon: '⭐', points_required: 600, category: 'special' }
    ];

    achievements.forEach(achievement => {
        db.run(`INSERT OR IGNORE INTO achievements (name, description, icon, points_required, category) 
                VALUES (?, ?, ?, ?, ?)`, 
                [achievement.name, achievement.description, achievement.icon, 
                 achievement.points_required, achievement.category]);
    });
}

// Blood group compatibility mapping
const bloodCompatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
};

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// API Routes

// ===== GAMIFICATION ENDPOINTS =====

// Get donor profile with gamification data
app.get('/api/donors/:id/profile', (req, res) => {
    const donorId = req.params.id;
    
    const query = `
        SELECT d.*, 
               COUNT(da.achievement_id) as total_achievements,
               GROUP_CONCAT(a.name) as achievement_names,
               GROUP_CONCAT(a.icon) as achievement_icons
        FROM donors d
        LEFT JOIN donor_achievements da ON d.id = da.donor_id
        LEFT JOIN achievements a ON da.achievement_id = a.id
        WHERE d.id = ?
        GROUP BY d.id
    `;
    
    db.get(query, [donorId], (err, donor) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!donor) {
            return res.status(404).json({ error: 'Donor not found' });
        }
        res.json(donor);
    });
});

// Award points to donor
app.post('/api/donors/:id/award-points', (req, res) => {
    const donorId = req.params.id;
    const { points, reason } = req.body;
    
    if (!points || points <= 0) {
        return res.status(400).json({ error: 'Invalid points value' });
    }
    
    // Update donor points and check for level up
    db.run('UPDATE donors SET points = points + ? WHERE id = ?', [points, donorId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Check for achievements
        checkAndAwardAchievements(donorId);
        
        res.json({ message: 'Points awarded successfully', points_awarded: points, reason: reason });
    });
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    const { type = 'points', limit = 10 } = req.query;
    
    let orderBy = 'points DESC';
    if (type === 'donations') orderBy = 'total_donations DESC';
    if (type === 'streak') orderBy = 'streak_count DESC';
    
    const query = `SELECT name, points, total_donations, streak_count, level, blood_group 
                   FROM donors 
                   ORDER BY ${orderBy} 
                   LIMIT ?`;
    
    db.all(query, [parseInt(limit)], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// ===== AI HEALTH ASSISTANT ENDPOINTS =====

// AI-powered health screening
app.post('/api/health-screening', (req, res) => {
    const { age, weight, gender, medicalHistory, lastDonation, currentMedications } = req.body;
    
    // AI-like health assessment (simplified version)
    let healthScore = 100;
    let recommendations = [];
    let warnings = [];
    
    // Age factor
    if (age < 18 || age > 65) {
        healthScore -= 50;
        warnings.push('Age outside donation range');
    } else if (age > 50) {
        healthScore -= 10;
        recommendations.push('Consider additional health checkup');
    }
    
    // Weight factor
    if (weight < 45) {
        healthScore -= 30;
        warnings.push('Weight below minimum requirement');
    } else if (weight > 100) {
        healthScore -= 5;
        recommendations.push('Consider weight management');
    }
    
    // Medical history analysis - Infectious diseases (PERMANENT EXCLUSIONS)
    const medicalHistoryLower = medicalHistory ? medicalHistory.toLowerCase() : '';
    
    // HIV/AIDS - PERMANENT EXCLUSION
    if (medicalHistoryLower.includes('hiv') || medicalHistoryLower.includes('aids') || 
        medicalHistoryLower.includes('human immunodeficiency virus') || 
        medicalHistoryLower.includes('acquired immunodeficiency syndrome')) {
        healthScore = 0;
        warnings.push('HIV/AIDS - PERMANENT EXCLUSION from blood donation');
        return res.json({
            healthScore: 0,
            eligibility: 'permanently_excluded',
            recommendations: ['HIV/AIDS is a permanent exclusion from blood donation for safety reasons'],
            warnings: ['HIV/AIDS - PERMANENT EXCLUSION from blood donation'],
            nextScreeningDate: null
        });
    }
    
    // Hepatitis B & C - PERMANENT EXCLUSION
    if (medicalHistoryLower.includes('hepatitis b') || medicalHistoryLower.includes('hepatitis c') ||
        medicalHistoryLower.includes('hbv') || medicalHistoryLower.includes('hcv')) {
        healthScore = 0;
        warnings.push('Hepatitis B/C - PERMANENT EXCLUSION from blood donation');
        return res.json({
            healthScore: 0,
            eligibility: 'permanently_excluded',
            recommendations: ['Hepatitis B/C is a permanent exclusion from blood donation for safety reasons'],
            warnings: ['Hepatitis B/C - PERMANENT EXCLUSION from blood donation'],
            nextScreeningDate: null
        });
    }
    
    // Syphilis - PERMANENT EXCLUSION
    if (medicalHistoryLower.includes('syphilis') || medicalHistoryLower.includes('treponema')) {
        healthScore = 0;
        warnings.push('Syphilis - PERMANENT EXCLUSION from blood donation');
        return res.json({
            healthScore: 0,
            eligibility: 'permanently_excluded',
            recommendations: ['Syphilis is a permanent exclusion from blood donation for safety reasons'],
            warnings: ['Syphilis - PERMANENT EXCLUSION from blood donation'],
            nextScreeningDate: null
        });
    }
    
    // Other blood-borne diseases
    if (medicalHistoryLower.includes('malaria') || medicalHistoryLower.includes('babesiosis') ||
        medicalHistoryLower.includes('chagas disease') || medicalHistoryLower.includes('trypanosoma')) {
        healthScore = 0;
        warnings.push('Blood-borne parasitic disease - EXCLUSION from blood donation');
        return res.json({
            healthScore: 0,
            eligibility: 'permanently_excluded',
            recommendations: ['Blood-borne parasitic diseases are exclusions from blood donation for safety reasons'],
            warnings: ['Blood-borne parasitic disease - EXCLUSION from blood donation'],
            nextScreeningDate: null
        });
    }
    
    // Cancer - TEMPORARY EXCLUSION (varies by type and treatment)
    if (medicalHistoryLower.includes('cancer') || medicalHistoryLower.includes('tumor') ||
        medicalHistoryLower.includes('malignancy') || medicalHistoryLower.includes('leukemia') ||
        medicalHistoryLower.includes('lymphoma')) {
        healthScore -= 50;
        warnings.push('Cancer history - requires medical clearance');
        recommendations.push('Cancer history requires medical clearance and may be a permanent exclusion');
    }
    
    // Diabetes - CONDITIONAL
    if (medicalHistoryLower.includes('diabetes')) {
        healthScore -= 15;
        recommendations.push('Monitor blood sugar levels before donation');
    }
    
    // Hypertension - CONDITIONAL
    if (medicalHistoryLower.includes('hypertension') || medicalHistoryLower.includes('high blood pressure')) {
        healthScore -= 10;
        recommendations.push('Check blood pressure before donation');
    }
    
    // Heart conditions - CONDITIONAL
    if (medicalHistoryLower.includes('heart disease') || medicalHistoryLower.includes('cardiac') ||
        medicalHistoryLower.includes('myocardial infarction') || medicalHistoryLower.includes('heart attack')) {
        healthScore -= 25;
        warnings.push('Heart condition - requires medical clearance');
        recommendations.push('Heart conditions require medical clearance before donation');
    }
    
    // Epilepsy/Seizures - CONDITIONAL
    if (medicalHistoryLower.includes('epilepsy') || medicalHistoryLower.includes('seizure')) {
        healthScore -= 20;
        recommendations.push('Epilepsy/seizure history requires medical clearance');
    }
    
    // Last donation timing
    if (lastDonation) {
        const daysSinceLastDonation = (new Date() - new Date(lastDonation)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastDonation < 56) {
            healthScore -= 40;
            warnings.push('Minimum 56 days gap required between donations');
        }
    }
    
    // Medication check
    if (currentMedications && currentMedications.length > 0) {
        healthScore -= 20;
        recommendations.push('Consult doctor about current medications');
    }
    
    const eligibility = healthScore >= 70 ? 'eligible' : healthScore >= 50 ? 'conditional' : 'not_eligible';
    
    res.json({
        healthScore: Math.max(0, healthScore),
        eligibility,
        recommendations,
        warnings,
        nextScreeningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
});

// ===== BLOOD INVENTORY TRACKING =====

// Get blood inventory for hospitals
app.get('/api/blood-inventory', (req, res) => {
    const { hospital, bloodGroup } = req.query;
    
    let query = 'SELECT * FROM blood_inventory WHERE 1=1';
    let params = [];
    
    if (hospital) {
        query += ' AND hospital_name LIKE ?';
        params.push(`%${hospital}%`);
    }
    
    if (bloodGroup) {
        query += ' AND blood_group = ?';
        params.push(bloodGroup);
    }
    
    query += ' ORDER BY last_updated DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Update blood inventory
app.post('/api/blood-inventory', (req, res) => {
    const { hospitalName, bloodGroup, unitsAvailable, unitsRequired, expiryDate, latitude, longitude } = req.body;
    
    if (!hospitalName || !bloodGroup) {
        return res.status(400).json({ error: 'Hospital name and blood group are required' });
    }
    
    const sql = `INSERT OR REPLACE INTO blood_inventory 
                 (hospital_name, blood_group, units_available, units_required, expiry_date, latitude, longitude) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [hospitalName, bloodGroup, unitsAvailable, unitsRequired, expiryDate, latitude, longitude], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Blood inventory updated successfully' });
    });
});

// ===== EMERGENCY NETWORK =====

// Send emergency alert
app.post('/api/emergency-alert', (req, res) => {
    const { receiverId, alertType, message, priority = 1 } = req.body;
    
    if (!receiverId || !alertType || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const sql = 'INSERT INTO emergency_alerts (receiver_id, alert_type, message, priority) VALUES (?, ?, ?, ?)';
    
    db.run(sql, [receiverId, alertType, message, priority], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // In a real app, this would trigger SMS, push notifications, etc.
        res.json({ id: this.lastID, message: 'Emergency alert sent successfully' });
    });
});

// ===== COMMUNITY CHALLENGES =====

// Get active community challenges
app.get('/api/community-challenges', (req, res) => {
    const query = `SELECT * FROM community_challenges 
                   WHERE status = 'active' AND end_date > date('now') 
                   ORDER BY created_date DESC`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Create community challenge
app.post('/api/community-challenges', (req, res) => {
    const { title, description, targetDonations, endDate, rewardPoints } = req.body;
    
    if (!title || !targetDonations || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const sql = `INSERT INTO community_challenges 
                 (title, description, target_donations, end_date, reward_points) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, description, targetDonations, endDate, rewardPoints], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Community challenge created successfully' });
    });
});

// ===== WELLNESS TRACKING =====

// Track donor wellness
app.post('/api/wellness-tracking', (req, res) => {
    const { donorId, donationId, preDonationHealthScore, postDonationHealthScore, recoveryTimeHours, sideEffects } = req.body;
    
    const sql = `INSERT INTO wellness_tracking 
                 (donor_id, donation_id, pre_donation_health_score, post_donation_health_score, recovery_time_hours, side_effects) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [donorId, donationId, preDonationHealthScore, postDonationHealthScore, recoveryTimeHours, sideEffects], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Wellness data recorded successfully' });
    });
});

// Get donor wellness history
app.get('/api/donors/:id/wellness', (req, res) => {
    const donorId = req.params.id;
    
    const query = `SELECT * FROM wellness_tracking 
                   WHERE donor_id = ? 
                   ORDER BY tracking_date DESC`;
    
    db.all(query, [donorId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Helper function to check and award achievements
function checkAndAwardAchievements(donorId) {
    // Get donor data
    db.get('SELECT * FROM donors WHERE id = ?', [donorId], (err, donor) => {
        if (err || !donor) return;
        
        // Check for various achievements
        const achievements = [
            { condition: donor.total_donations >= 1, achievement: 'First Drop' },
            { condition: donor.total_donations >= 5, achievement: 'Life Saver' },
            { condition: donor.total_donations >= 10, achievement: 'Hero Donor' },
            { condition: donor.streak_count >= 3, achievement: 'Streak Master' },
            { condition: donor.health_score >= 95, achievement: 'Perfect Health' }
        ];
        
        achievements.forEach(({ condition, achievement }) => {
            if (condition) {
                // Check if already awarded
                db.get('SELECT id FROM donor_achievements da JOIN achievements a ON da.achievement_id = a.id WHERE da.donor_id = ? AND a.name = ?', 
                       [donorId, achievement], (err, existing) => {
                    if (!err && !existing) {
                        // Award achievement
                        db.get('SELECT id FROM achievements WHERE name = ?', [achievement], (err, ach) => {
                            if (!err && ach) {
                                db.run('INSERT INTO donor_achievements (donor_id, achievement_id) VALUES (?, ?)', 
                                       [donorId, ach.id]);
                            }
                        });
                    }
                });
            }
        });
    });
}

// Get all donors
app.get('/api/donors', (req, res) => {
    db.all('SELECT * FROM donors WHERE is_available = 1', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Register new donor
app.post('/api/donors', (req, res) => {
    const {
        name, age, gender, bloodGroup, weight, mobile, countryCode, email,
        location, address, lastDonation, medicalHistory, latitude, longitude
    } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !bloodGroup || !weight || !mobile || !location || !address) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate donor eligibility
    if (age < 18 || age > 65) {
        return res.status(400).json({ error: 'Age must be between 18 and 65 years' });
    }

    if (weight < 45) {
        return res.status(400).json({ error: 'Weight must be at least 45 kg' });
    }

    // Use provided country code or default to +91
    const finalCountryCode = countryCode || '+91';

    const sql = `INSERT INTO donors (name, age, gender, blood_group, weight, mobile, country_code, email, 
                location, address, last_donation, medical_history, latitude, longitude) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [name, age, gender, bloodGroup, weight, mobile, finalCountryCode, email, location, 
                address, lastDonation, medicalHistory, latitude, longitude], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Donor registered successfully' });
    });
});

// Get all receivers
app.get('/api/receivers', (req, res) => {
    db.all('SELECT * FROM receivers WHERE status = "active"', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Register new receiver and find compatible donors
app.post('/api/receivers', (req, res) => {
    const {
        name, age, gender, requiredBloodGroup, mobile, countryCode, email,
        location, address, urgency, hospitalName, patientCondition, latitude, longitude
    } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !requiredBloodGroup || !mobile || !location || !address || !urgency) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Use provided country code or default to +91
    const finalCountryCode = countryCode || '+91';

    const sql = `INSERT INTO receivers (name, age, gender, required_blood_group, mobile, country_code, email, 
                location, address, urgency, hospital_name, patient_condition, latitude, longitude) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [name, age, gender, requiredBloodGroup, mobile, finalCountryCode, email, location, 
                address, urgency, hospitalName, patientCondition, latitude, longitude], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const receiverId = this.lastID;

        // Find compatible donors
        const compatibleBloodGroups = bloodCompatibility[requiredBloodGroup] || [];
        const placeholders = compatibleBloodGroups.map(() => '?').join(',');

        const donorQuery = `SELECT *, 
            CASE 
                WHEN latitude IS NOT NULL AND longitude IS NOT NULL AND ? IS NOT NULL AND ? IS NOT NULL
                THEN (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))
                ELSE 999
            END as distance
            FROM donors 
            WHERE blood_group IN (${placeholders}) 
            AND is_available = 1
            ORDER BY distance ASC`;

        db.all(donorQuery, [latitude, longitude, latitude, longitude, latitude, ...compatibleBloodGroups], (err, donors) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            // Filter by location if coordinates are not available
            const filteredDonors = donors.filter(donor => {
                if (donor.latitude && donor.longitude && latitude && longitude) {
                    return true; // Distance already calculated
                }
                // Simple location matching
                return donor.location.toLowerCase().includes(location.toLowerCase()) ||
                       location.toLowerCase().includes(donor.location.toLowerCase());
            });

            res.json({
                receiverId: receiverId,
                message: 'Receiver registered successfully',
                compatibleDonors: filteredDonors.slice(0, 10) // Limit to top 10 matches
            });
        });
    });
});

// Get compatible donors for a specific receiver
app.get('/api/receivers/:id/donors', (req, res) => {
    const receiverId = req.params.id;

    // Get receiver details
    db.get('SELECT * FROM receivers WHERE id = ?', [receiverId], (err, receiver) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!receiver) {
            return res.status(404).json({ error: 'Receiver not found' });
        }

        // Find compatible donors
        const compatibleBloodGroups = bloodCompatibility[receiver.required_blood_group] || [];
        const placeholders = compatibleBloodGroups.map(() => '?').join(',');

        const donorQuery = `SELECT *, 
            CASE 
                WHEN latitude IS NOT NULL AND longitude IS NOT NULL AND ? IS NOT NULL AND ? IS NOT NULL
                THEN (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))
                ELSE 999
            END as distance
            FROM donors 
            WHERE blood_group IN (${placeholders}) 
            AND is_available = 1
            ORDER BY distance ASC`;

        db.all(donorQuery, [receiver.latitude, receiver.longitude, receiver.latitude, receiver.longitude, receiver.latitude, ...compatibleBloodGroups], (err, donors) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.json(donors.slice(0, 10)); // Limit to top 10 matches
        });
    });
});

// Create a match between donor and receiver
app.post('/api/matches', (req, res) => {
    const { donorId, receiverId } = req.body;

    if (!donorId || !receiverId) {
        return res.status(400).json({ error: 'Donor ID and Receiver ID are required' });
    }

    const sql = 'INSERT INTO matches (donor_id, receiver_id) VALUES (?, ?)';
    db.run(sql, [donorId, receiverId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Match created successfully' });
    });
});

// Update donor availability
app.put('/api/donors/:id/availability', (req, res) => {
    const donorId = req.params.id;
    const { isAvailable } = req.body;

    const sql = 'UPDATE donors SET is_available = ? WHERE id = ?';
    db.run(sql, [isAvailable, donorId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Donor availability updated successfully' });
    });
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const queries = [
        'SELECT COUNT(*) as total_donors FROM donors',
        'SELECT COUNT(*) as available_donors FROM donors WHERE is_available = 1',
        'SELECT COUNT(*) as total_receivers FROM receivers',
        'SELECT COUNT(*) as active_receivers FROM receivers WHERE status = "active"',
        'SELECT COUNT(*) as total_matches FROM matches'
    ];

    Promise.all(queries.map(query => 
        new Promise((resolve, reject) => {
            db.get(query, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        })
    )).then(results => {
        const stats = {
            totalDonors: results[0].total_donors,
            availableDonors: results[1].available_donors,
            totalReceivers: results[2].total_receivers,
            activeReceivers: results[3].active_receivers,
            totalMatches: results[4].total_matches
        };
        res.json(stats);
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Suraksha Blood Donation Platform running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});

