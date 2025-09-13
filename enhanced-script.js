// Enhanced Suraksha Blood Donation Platform JavaScript
// Unique Features Implementation

// Global variables
let donors = [];
let receivers = [];
let currentUser = null;
let leaderboardData = [];
let challengesData = [];
let inventoryData = [];
let userLocation = null;
let locationPermissionGranted = false;

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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeNewFeatures();
    loadLeaderboard();
    loadChallenges();
    loadInventory();
    
    // Initialize location services
    initializeLocationServices();
    
    // Add form event listeners
    document.getElementById('donorRegistrationForm').addEventListener('submit', handleDonorRegistration);
    document.getElementById('receiverRegistrationForm').addEventListener('submit', handleReceiverRegistration);
    document.getElementById('healthScreeningForm').addEventListener('submit', handleHealthScreening);
});

// ===== NEW FEATURE INITIALIZATION =====

function initializeNewFeatures() {
    // Add sample data for demonstration
    addSampleData();
    
    // Initialize gamification for demo user
    initializeDemoUser();
    
    // Set up inventory filters
    setupInventoryFilters();
}

function initializeDemoUser() {
    currentUser = {
        id: 'demo_user',
        name: 'Demo User',
        points: 1250,
        level: 3,
        totalDonations: 8,
        streakCount: 2,
        achievements: ['First Drop', 'Life Saver', 'Streak Master']
    };
    
    updateUserProfile();
}

// ===== GAMIFICATION SYSTEM =====

function showGamification() {
    hideAllSections();
    document.getElementById('gamification').style.display = 'block';
    document.getElementById('gamification').scrollIntoView({ behavior: 'smooth' });
    updateUserProfile();
}

function updateUserProfile() {
    if (!currentUser) return;
    
    document.getElementById('userPoints').textContent = currentUser.points;
    document.getElementById('userDonations').textContent = currentUser.totalDonations;
    document.getElementById('userStreak').textContent = currentUser.streakCount;
    document.getElementById('userLevel').textContent = currentUser.level;
    
    displayUserAchievements();
}

function displayUserAchievements() {
    const achievementsContainer = document.getElementById('userAchievements');
    const achievements = [
        { name: 'First Drop', icon: '🩸', earned: currentUser.achievements.includes('First Drop') },
        { name: 'Life Saver', icon: '💖', earned: currentUser.achievements.includes('Life Saver') },
        { name: 'Hero Donor', icon: '🦸', earned: currentUser.achievements.includes('Hero Donor') },
        { name: 'Streak Master', icon: '🔥', earned: currentUser.achievements.includes('Streak Master') },
        { name: 'Emergency Responder', icon: '🚨', earned: false },
        { name: 'Community Champion', icon: '🏆', earned: false },
        { name: 'Perfect Health', icon: '💪', earned: false },
        { name: 'Rare Blood Hero', icon: '⭐', earned: false }
    ];
    
    achievementsContainer.innerHTML = achievements.map(achievement => `
        <div class="achievement-card ${achievement.earned ? 'earned' : 'locked'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-status">${achievement.earned ? 'Earned' : 'Locked'}</div>
        </div>
    `).join('');
}

function awardPoints(points, reason) {
    if (!currentUser) return;
    
    currentUser.points += points;
    
    // Check for level up
    const newLevel = Math.floor(currentUser.points / 500) + 1;
    if (newLevel > currentUser.level) {
        currentUser.level = newLevel;
        showLevelUpNotification(newLevel);
    }
    
    // Check for new achievements
    checkAchievements();
    
    updateUserProfile();
    showPointsNotification(points, reason);
}

function checkAchievements() {
    const newAchievements = [];
    
    if (currentUser.totalDonations >= 1 && !currentUser.achievements.includes('First Drop')) {
        newAchievements.push('First Drop');
    }
    if (currentUser.totalDonations >= 5 && !currentUser.achievements.includes('Life Saver')) {
        newAchievements.push('Life Saver');
    }
    if (currentUser.totalDonations >= 10 && !currentUser.achievements.includes('Hero Donor')) {
        newAchievements.push('Hero Donor');
    }
    if (currentUser.streakCount >= 3 && !currentUser.achievements.includes('Streak Master')) {
        newAchievements.push('Streak Master');
    }
    
    newAchievements.forEach(achievement => {
        currentUser.achievements.push(achievement);
        showAchievementNotification(achievement);
    });
}

// ===== AI HEALTH ASSISTANT =====

function showHealthAssistant() {
    hideAllSections();
    document.getElementById('health-assistant').style.display = 'block';
    document.getElementById('health-assistant').scrollIntoView({ behavior: 'smooth' });
}

function handleHealthScreening(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const screeningData = {
        age: parseInt(formData.get('age')),
        weight: parseInt(formData.get('weight')),
        gender: formData.get('gender'),
        medicalHistory: formData.get('medicalHistory'),
        lastDonation: formData.get('lastDonation'),
        currentMedications: formData.get('currentMedications')
    };
    
    // Simulate AI health assessment
    const healthAssessment = performHealthAssessment(screeningData);
    displayHealthResults(healthAssessment);
}

function performHealthAssessment(data) {
    let healthScore = 100;
    let recommendations = [];
    let warnings = [];
    
    // Age factor
    if (data.age < 18 || data.age > 65) {
        healthScore -= 50;
        warnings.push('Age outside donation range');
    } else if (data.age > 50) {
        healthScore -= 10;
        recommendations.push('Consider additional health checkup');
    }
    
    // Weight factor
    if (data.weight < 45) {
        healthScore -= 30;
        warnings.push('Weight below minimum requirement');
    } else if (data.weight > 100) {
        healthScore -= 5;
        recommendations.push('Consider weight management');
    }
    
    // Medical history analysis - Infectious diseases (PERMANENT EXCLUSIONS)
    const medicalHistoryLower = data.medicalHistory ? data.medicalHistory.toLowerCase() : '';
    
    // HIV/AIDS - PERMANENT EXCLUSION
    if (medicalHistoryLower.includes('hiv') || medicalHistoryLower.includes('aids') || 
        medicalHistoryLower.includes('human immunodeficiency virus') || 
        medicalHistoryLower.includes('acquired immunodeficiency syndrome')) {
        healthScore = 0;
        warnings.push('HIV/AIDS - PERMANENT EXCLUSION from blood donation');
        return {
            healthScore: 0,
            eligibility: 'permanently_excluded',
            recommendations: ['HIV/AIDS is a permanent exclusion from blood donation for safety reasons'],
            warnings: ['HIV/AIDS - PERMANENT EXCLUSION from blood donation'],
            nextScreeningDate: null
        };
    }
    
    // Hepatitis B & C - PERMANENT EXCLUSION
    if (medicalHistoryLower.includes('hepatitis b') || medicalHistoryLower.includes('hepatitis c') ||
        medicalHistoryLower.includes('hbv') || medicalHistoryLower.includes('hcv')) {
        healthScore = 0;
        warnings.push('Hepatitis B/C - PERMANENT EXCLUSION from blood donation');
        return {
            healthScore: 0,
            eligibility: 'permanently_excluded',
            recommendations: ['Hepatitis B/C is a permanent exclusion from blood donation for safety reasons'],
            warnings: ['Hepatitis B/C - PERMANENT EXCLUSION from blood donation'],
            nextScreeningDate: null
        };
    }
    
    // Syphilis - PERMANENT EXCLUSION
    if (medicalHistoryLower.includes('syphilis') || medicalHistoryLower.includes('treponema')) {
        healthScore = 0;
        warnings.push('Syphilis - PERMANENT EXCLUSION from blood donation');
        return {
            healthScore: 0,
            eligibility: 'permanently_excluded',
            recommendations: ['Syphilis is a permanent exclusion from blood donation for safety reasons'],
            warnings: ['Syphilis - PERMANENT EXCLUSION from blood donation'],
            nextScreeningDate: null
        };
    }
    
    // Other blood-borne diseases
    if (medicalHistoryLower.includes('malaria') || medicalHistoryLower.includes('babesiosis') ||
        medicalHistoryLower.includes('chagas disease') || medicalHistoryLower.includes('trypanosoma')) {
        healthScore = 0;
        warnings.push('Blood-borne parasitic disease - EXCLUSION from blood donation');
        return {
            healthScore: 0,
            eligibility: 'permanently_excluded',
            recommendations: ['Blood-borne parasitic diseases are exclusions from blood donation for safety reasons'],
            warnings: ['Blood-borne parasitic disease - EXCLUSION from blood donation'],
            nextScreeningDate: null
        };
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
    if (data.lastDonation) {
        const daysSinceLastDonation = (new Date() - new Date(data.lastDonation)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastDonation < 56) {
            healthScore -= 40;
            warnings.push('Minimum 56 days gap required between donations');
        }
    }
    
    // Medication check
    if (data.currentMedications && data.currentMedications.length > 0) {
        healthScore -= 20;
        recommendations.push('Consult doctor about current medications');
    }
    
    const eligibility = healthScore >= 70 ? 'eligible' : healthScore >= 50 ? 'conditional' : 'not_eligible';
    
    return {
        healthScore: Math.max(0, healthScore),
        eligibility,
        recommendations,
        warnings,
        nextScreeningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
}

function displayHealthResults(assessment) {
    const resultsContainer = document.getElementById('healthResults');
    
    const eligibilityClass = assessment.eligibility === 'eligible' ? 'success' : 
                           assessment.eligibility === 'conditional' ? 'warning' : 
                           assessment.eligibility === 'permanently_excluded' ? 'critical' : 'error';
    
    resultsContainer.innerHTML = `
        <div class="health-assessment-result">
            <div class="health-score ${eligibilityClass}">
                <div class="score-circle">
                    <div class="score-value">${assessment.healthScore}</div>
                    <div class="score-label">Health Score</div>
                </div>
                <div class="eligibility-status ${eligibilityClass}">
                    ${assessment.eligibility.toUpperCase()}
                </div>
            </div>
            
            <div class="assessment-details">
                ${assessment.warnings.length > 0 ? `
                    <div class="warnings-section">
                        <h4><i class="fas fa-exclamation-triangle"></i> Warnings</h4>
                        <ul>
                            ${assessment.warnings.map(warning => `<li>${warning}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${assessment.recommendations.length > 0 ? `
                    <div class="recommendations-section">
                        <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
                        <ul>
                            ${assessment.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="next-screening">
                    <h4><i class="fas fa-calendar"></i> Next Screening</h4>
                    <p>Recommended: ${new Date(assessment.nextScreeningDate).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    `;
    
    resultsContainer.style.display = 'block';
}

// ===== LEADERBOARD SYSTEM =====

function loadLeaderboard() {
    // Simulate API call
    leaderboardData = {
        points: [
            { name: 'Rajesh Kumar', points: 2500, level: 5, bloodGroup: 'O+', totalDonations: 15 },
            { name: 'Priya Sharma', points: 2200, level: 4, bloodGroup: 'A+', totalDonations: 12 },
            { name: 'Amit Singh', points: 1800, level: 4, bloodGroup: 'B+', totalDonations: 10 },
            { name: 'Demo User', points: 1250, level: 3, bloodGroup: 'AB+', totalDonations: 8 },
            { name: 'Sneha Patel', points: 1100, level: 3, bloodGroup: 'O-', totalDonations: 7 }
        ],
        donations: [
            { name: 'Rajesh Kumar', totalDonations: 15, points: 2500, level: 5, bloodGroup: 'O+' },
            { name: 'Priya Sharma', totalDonations: 12, points: 2200, level: 4, bloodGroup: 'A+' },
            { name: 'Amit Singh', totalDonations: 10, points: 1800, level: 4, bloodGroup: 'B+' },
            { name: 'Demo User', totalDonations: 8, points: 1250, level: 3, bloodGroup: 'AB+' },
            { name: 'Sneha Patel', totalDonations: 7, points: 1100, level: 3, bloodGroup: 'O-' }
        ],
        streak: [
            { name: 'Rajesh Kumar', streakCount: 6, points: 2500, level: 5, bloodGroup: 'O+' },
            { name: 'Priya Sharma', streakCount: 4, points: 2200, level: 4, bloodGroup: 'A+' },
            { name: 'Demo User', streakCount: 2, points: 1250, level: 3, bloodGroup: 'AB+' },
            { name: 'Amit Singh', streakCount: 1, points: 1800, level: 4, bloodGroup: 'B+' },
            { name: 'Sneha Patel', streakCount: 1, points: 1100, level: 3, bloodGroup: 'O-' }
        ]
    };
    
    showLeaderboard('points');
}

function showLeaderboard(type) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const data = leaderboardData[type];
    const container = document.getElementById('leaderboardContent');
    
    container.innerHTML = `
        <div class="leaderboard-list">
            ${data.map((user, index) => `
                <div class="leaderboard-item ${user.name === 'Demo User' ? 'current-user' : ''}">
                    <div class="rank">#${index + 1}</div>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-details">
                            Level ${user.level} • ${user.bloodGroup} • ${user.totalDonations} donations
                        </div>
                    </div>
                    <div class="user-score">
                        ${type === 'points' ? `${user.points} pts` : 
                          type === 'donations' ? `${user.totalDonations} donations` : 
                          `${user.streakCount} streak`}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== COMMUNITY CHALLENGES =====

function loadChallenges() {
    challengesData = [
        {
            id: 1,
            title: 'Blood Drive Marathon',
            description: 'Help us reach 1000 donations this month!',
            targetDonations: 1000,
            currentDonations: 750,
            endDate: '2025-02-28',
            rewardPoints: 100,
            status: 'active'
        },
        {
            id: 2,
            title: 'Emergency Response Challenge',
            description: 'Respond to 50 emergency blood requests',
            targetDonations: 50,
            currentDonations: 32,
            endDate: '2025-02-15',
            rewardPoints: 200,
            status: 'active'
        },
        {
            id: 3,
            title: 'Rare Blood Heroes',
            description: 'Special challenge for AB- and O- donors',
            targetDonations: 25,
            currentDonations: 18,
            endDate: '2025-03-01',
            rewardPoints: 300,
            status: 'active'
        }
    ];
    
    displayChallenges();
}

function displayChallenges() {
    const container = document.getElementById('challengesList');
    
    container.innerHTML = challengesData.map(challenge => {
        const progress = (challenge.currentDonations / challenge.targetDonations) * 100;
        const daysLeft = Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="challenge-card">
                <div class="challenge-header">
                    <h3>${challenge.title}</h3>
                    <span class="challenge-status ${challenge.status}">${challenge.status}</span>
                </div>
                <p class="challenge-description">${challenge.description}</p>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">
                        ${challenge.currentDonations}/${challenge.targetDonations} donations
                    </div>
                </div>
                <div class="challenge-footer">
                    <div class="challenge-reward">
                        <i class="fas fa-gem"></i>
                        ${challenge.rewardPoints} points reward
                    </div>
                    <div class="challenge-deadline">
                        <i class="fas fa-clock"></i>
                        ${daysLeft} days left
                    </div>
                </div>
                <button class="btn btn-primary challenge-join-btn" onclick="joinChallenge(${challenge.id})">
                    Join Challenge
                </button>
            </div>
        `;
    }).join('');
}

function joinChallenge(challengeId) {
    const challenge = challengesData.find(c => c.id === challengeId);
    if (challenge) {
        showMessage(`Joined "${challenge.title}" challenge! Start donating to contribute.`, 'success');
        awardPoints(10, 'Joined community challenge');
    }
}

// ===== BLOOD INVENTORY TRACKING =====

function loadInventory() {
    inventoryData = [
        { hospital: 'Apollo Hospital', bloodGroup: 'A+', available: 15, required: 5, expiry: '2025-02-20' },
        { hospital: 'Apollo Hospital', bloodGroup: 'O+', available: 8, required: 12, expiry: '2025-02-18' },
        { hospital: 'Fortis Hospital', bloodGroup: 'B+', available: 20, required: 3, expiry: '2025-02-25' },
        { hospital: 'Fortis Hospital', bloodGroup: 'AB+', available: 5, required: 8, expiry: '2025-02-22' },
        { hospital: 'Max Hospital', bloodGroup: 'A-', available: 3, required: 10, expiry: '2025-02-15' },
        { hospital: 'Max Hospital', bloodGroup: 'O-', available: 2, required: 15, expiry: '2025-02-16' }
    ];
    
    setupInventoryFilters();
    displayInventory();
}

function setupInventoryFilters() {
    const hospitalSelect = document.getElementById('inventoryHospital');
    const hospitals = [...new Set(inventoryData.map(item => item.hospital))];
    
    hospitalSelect.innerHTML = '<option value="">All Hospitals</option>' +
        hospitals.map(hospital => `<option value="${hospital}">${hospital}</option>`).join('');
    
    // Add event listeners
    hospitalSelect.addEventListener('change', displayInventory);
    document.getElementById('inventoryBloodGroup').addEventListener('change', displayInventory);
}

function displayInventory() {
    const hospitalFilter = document.getElementById('inventoryHospital').value;
    const bloodGroupFilter = document.getElementById('inventoryBloodGroup').value;
    
    let filteredData = inventoryData;
    
    if (hospitalFilter) {
        filteredData = filteredData.filter(item => item.hospital === hospitalFilter);
    }
    
    if (bloodGroupFilter) {
        filteredData = filteredData.filter(item => item.bloodGroup === bloodGroupFilter);
    }
    
    const container = document.getElementById('inventoryTable');
    
    container.innerHTML = `
        <div class="inventory-grid">
            ${filteredData.map(item => {
                const status = item.available >= item.required ? 'sufficient' : 'critical';
                const statusIcon = status === 'sufficient' ? '✅' : '🚨';
                
                return `
                    <div class="inventory-item ${status}">
                        <div class="hospital-name">${item.hospital}</div>
                        <div class="blood-group">${item.bloodGroup}</div>
                        <div class="inventory-status">
                            <span class="status-icon">${statusIcon}</span>
                            <span class="status-text">${status}</span>
                        </div>
                        <div class="inventory-details">
                            <div class="available">Available: ${item.available} units</div>
                            <div class="required">Required: ${item.required} units</div>
                            <div class="expiry">Expires: ${new Date(item.expiry).toLocaleDateString()}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ===== EMERGENCY NETWORK =====

function sendEmergencyAlert() {
    const alertData = {
        receiverId: 'emergency_001',
        alertType: 'critical_shortage',
        message: 'URGENT: Critical blood shortage in your area. Immediate response needed.',
        priority: 1
    };
    
    // Simulate sending emergency alert
    showMessage('Emergency alert sent to all nearby donors!', 'success');
    
    // Award points for emergency response
    awardPoints(50, 'Emergency response');
}

// ===== NOTIFICATION SYSTEM =====

function showMessage(text, type) {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.innerHTML = `
        <div class="message-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${text}</span>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

function showPointsNotification(points, reason) {
    const notification = document.createElement('div');
    notification.className = 'points-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="points-earned">+${points} points</div>
            <div class="points-reason">${reason}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showLevelUpNotification(level) {
    const notification = document.createElement('div');
    notification.className = 'levelup-notification';
    notification.innerHTML = `
        <div class="levelup-content">
            <div class="levelup-icon">⭐</div>
            <div class="levelup-text">
                <div class="levelup-title">Level Up!</div>
                <div class="levelup-level">You reached Level ${level}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ===== EXISTING FUNCTIONS (Enhanced) =====

function hideAllSections() {
    const sections = [
        'donor-form', 'receiver-form', 'donor-results', 
        'health-assistant', 'gamification', 'emergency'
    ];
    sections.forEach(section => {
        document.getElementById(section).style.display = 'none';
    });
}

function showDonorForm() {
    hideAllSections();
    document.getElementById('donor-form').style.display = 'block';
    document.getElementById('donor-form').scrollIntoView({ behavior: 'smooth' });
}

function showReceiverForm() {
    hideAllSections();
    document.getElementById('receiver-form').style.display = 'block';
    document.getElementById('receiver-form').scrollIntoView({ behavior: 'smooth' });
}

function handleDonorRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const donorData = {
        id: Date.now().toString(),
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        weight: parseInt(formData.get('weight')),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        location: formData.get('location'),
        address: formData.get('address'),
        lastDonation: formData.get('lastDonation'),
        medicalHistory: formData.get('medicalHistory'),
        registrationDate: new Date().toISOString(),
        isAvailable: true,
        latitude: userLocation ? userLocation.latitude : null,
        longitude: userLocation ? userLocation.longitude : null
    };
    
    if (!validateDonorEligibility(donorData)) {
        return;
    }
    
    donors.push(donorData);
    saveData();
    
    // Award points for registration
    awardPoints(100, 'New donor registration');
    
    showMessage('Thank you for registering as a donor! You earned 100 points!', 'success');
    e.target.reset();
    hideAllSections();
    document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
}

function handleReceiverRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const receiverData = {
        id: Date.now().toString(),
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        requiredBloodGroup: formData.get('requiredBloodGroup'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        location: formData.get('location'),
        address: formData.get('address'),
        urgency: formData.get('urgency'),
        hospitalName: formData.get('hospitalName'),
        patientCondition: formData.get('patientCondition'),
        searchRadius: parseInt(formData.get('searchRadius')) || 25,
        requestDate: new Date().toISOString(),
        status: 'active',
        latitude: userLocation ? userLocation.latitude : null,
        longitude: userLocation ? userLocation.longitude : null
    };
    
    receivers.push(receiverData);
    saveData();
    
    const compatibleDonors = findCompatibleDonors(receiverData);
    displayDonorResults(compatibleDonors, receiverData);
    
    hideAllSections();
    document.getElementById('donor-results').style.display = 'block';
    document.getElementById('donor-results').scrollIntoView({ behavior: 'smooth' });
}

function validateDonorEligibility(donor) {
    const errors = [];
    
    if (donor.age < 18 || donor.age > 65) {
        errors.push('Age must be between 18 and 65 years');
    }
    
    if (donor.weight < 45) {
        errors.push('Weight must be at least 45 kg');
    }
    
    if (donor.lastDonation) {
        const lastDonationDate = new Date(donor.lastDonation);
        const daysSinceLastDonation = (new Date() - lastDonationDate) / (1000 * 60 * 60 * 24);
        if (daysSinceLastDonation < 56) {
            errors.push('Minimum 56 days gap required between donations');
        }
    }
    
    if (errors.length > 0) {
        showMessage('Registration failed: ' + errors.join(', '), 'error');
        return false;
    }
    
    return true;
}

function findCompatibleDonors(receiver) {
    const requiredBloodGroup = receiver.requiredBloodGroup;
    const compatibleBloodGroups = bloodCompatibility[requiredBloodGroup] || [];
    
    // Get search radius from form or use default
    const searchRadius = receiver.searchRadius || 25; // Default 25km
    
    return donors.filter(donor => {
        const isBloodCompatible = compatibleBloodGroups.includes(donor.bloodGroup);
        const isAvailable = donor.isAvailable;
        
        // Check location compatibility
        let isLocationMatch = false;
        if (donor.latitude && donor.longitude && receiver.latitude && receiver.longitude) {
            // Use GPS coordinates for precise distance calculation
            const distance = calculateDistance(donor.latitude, donor.longitude, receiver.latitude, receiver.longitude);
            isLocationMatch = distance <= searchRadius;
        } else {
            // Fallback to text-based location matching
            isLocationMatch = donor.location.toLowerCase().includes(receiver.location.toLowerCase()) ||
                             receiver.location.toLowerCase().includes(donor.location.toLowerCase());
        }
        
        return isBloodCompatible && isAvailable && isLocationMatch;
    }).map(donor => {
        let distance;
        if (donor.latitude && donor.longitude && receiver.latitude && receiver.longitude) {
            // Use GPS coordinates for precise distance
            distance = calculateDistance(donor.latitude, donor.longitude, receiver.latitude, receiver.longitude);
        } else {
            // Fallback to legacy distance calculation
            distance = calculateDistanceLegacy(donor.location, receiver.location);
        }
        return { ...donor, distance };
    }).sort((a, b) => a.distance - b.distance);
}

// ===== LOCATION SERVICES =====

function initializeLocationServices() {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        showLocationFallback();
        return;
    }
    
    // Request location permission
    requestLocationPermission();
}

function requestLocationPermission() {
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
    };
    
    navigator.geolocation.getCurrentPosition(
        onLocationSuccess,
        onLocationError,
        options
    );
}

function onLocationSuccess(position) {
    userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
    };
    
    locationPermissionGranted = true;
    console.log('Location obtained:', userLocation);
    
    // Update location in forms if they exist
    updateLocationInForms();
    
    // Show location status indicators
    showLocationStatus();
    
    // Show location success message
    showMessage('Location detected successfully! You can now find nearby donors.', 'success');
}

function showLocationStatus() {
    const donorStatus = document.getElementById('donorLocationStatus');
    const receiverStatus = document.getElementById('receiverLocationStatus');
    
    if (donorStatus) {
        donorStatus.style.display = 'flex';
    }
    if (receiverStatus) {
        receiverStatus.style.display = 'flex';
    }
}

function onLocationError(error) {
    console.log('Location error:', error);
    locationPermissionGranted = false;
    
    let errorMessage = 'Unable to detect your location. ';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access to find nearby donors.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
        default:
            errorMessage += 'An unknown error occurred.';
            break;
    }
    
    showMessage(errorMessage, 'warning');
    showLocationFallback();
}

function updateLocationInForms() {
    if (!userLocation) return;
    
    // Update donor registration form
    const donorLocationInput = document.getElementById('donorLocation');
    if (donorLocationInput && !donorLocationInput.value) {
        getLocationName(userLocation.latitude, userLocation.longitude)
            .then(locationName => {
                donorLocationInput.value = locationName;
            })
            .catch(() => {
                donorLocationInput.placeholder = 'Enter your city, state';
            });
    }
    
    // Update receiver registration form
    const receiverLocationInput = document.getElementById('receiverLocation');
    if (receiverLocationInput && !receiverLocationInput.value) {
        getLocationName(userLocation.latitude, userLocation.longitude)
            .then(locationName => {
                receiverLocationInput.value = locationName;
            })
            .catch(() => {
                receiverLocationInput.placeholder = 'Enter your city, state';
            });
    }
}

function showLocationFallback() {
    // Show manual location input option
    const locationButtons = document.querySelectorAll('.location-button');
    locationButtons.forEach(button => {
        button.style.display = 'block';
    });
}

// Get location name from coordinates using reverse geocoding
async function getLocationName(latitude, longitude) {
    try {
        // Using a free reverse geocoding service
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await response.json();
        
        if (data.city && data.principalSubdivision) {
            return `${data.city}, ${data.principalSubdivision}`;
        } else if (data.locality) {
            return data.locality;
        } else {
            return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    } catch (error) {
        console.log('Reverse geocoding failed:', error);
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 10) / 10;
}

// Legacy function for backward compatibility
function calculateDistanceLegacy(location1, location2) {
    const commonWords = ['city', 'state', 'district', 'area'];
    let distance = Math.random() * 50;
    
    for (let word of commonWords) {
        if (location1.toLowerCase().includes(word) && location2.toLowerCase().includes(word)) {
            distance = Math.random() * 10;
            break;
        }
    }
    
    return Math.round(distance * 10) / 10;
}

// Get distance class for styling
function getDistanceClass(distance) {
    if (distance <= 10) return '';
    if (distance <= 25) return 'far';
    return 'very-far';
}

function displayDonorResults(compatibleDonors, receiver) {
    const donorList = document.getElementById('donorList');
    
    if (compatibleDonors.length === 0) {
        donorList.innerHTML = `
            <div class="message error">
                <h3>No compatible donors found</h3>
                <p>We couldn't find any compatible donors in your area. Please try again later or contact your local blood bank.</p>
            </div>
        `;
        return;
    }
    
    donorList.innerHTML = `
        <div class="message success">
            <h3>Found ${compatibleDonors.length} compatible donor(s)</h3>
            <p>Here are the donors who can help you. Contact them directly to arrange blood donation.</p>
        </div>
    `;
    
    compatibleDonors.forEach(donor => {
        const donorCard = createDonorCard(donor, receiver);
        donorList.appendChild(donorCard);
    });
}

function createDonorCard(donor, receiver) {
    const card = document.createElement('div');
    card.className = 'donor-card';
    
    const urgencyClass = receiver.urgency === 'critical' ? 'btn-danger' : 'btn-primary';
    const urgencyText = receiver.urgency === 'critical' ? 'URGENT' : 'Contact';
    
    card.innerHTML = `
        <h3>${donor.name}</h3>
        <div class="donor-info">
            <span>Age:</span><span class="value">${donor.age} years</span>
            <span>Gender:</span><span class="value">${donor.gender}</span>
            <span>Blood Group:</span><span class="value">${donor.bloodGroup}</span>
            <span>Weight:</span><span class="value">${donor.weight} kg</span>
            <span>Location:</span><span class="value">${donor.location}</span>
            <span>Mobile:</span><span class="value">${donor.mobile}</span>
        </div>
        <div class="distance">
            <i class="fas fa-map-marker-alt"></i>
            <span class="distance-badge ${getDistanceClass(donor.distance)}">${donor.distance} km</span>
        </div>
        <button class="contact-btn ${urgencyClass}" onclick="contactDonor('${donor.id}', '${receiver.id}')">
            <i class="fas fa-phone"></i>
            ${urgencyText} - Call Now
        </button>
    `;
    
    return card;
}

function contactDonor(donorId, receiverId) {
    const donor = donors.find(d => d.id === donorId);
    const receiver = receivers.find(r => r.id === receiverId);
    
    if (donor && receiver) {
        showContactModal(donor, receiver);
        
        // Award points for successful contact
        awardPoints(25, 'Successful donor contact');
    }
}

function showContactModal(donor, receiver) {
    let modal = document.getElementById('contactModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'contactModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Contact Information</h2>
            <div class="contact-details">
                <h3>Donor: ${donor.name}</h3>
                <p><strong>Mobile:</strong> <a href="tel:${donor.mobile}">${donor.mobile}</a></p>
                <p><strong>Email:</strong> ${donor.email || 'Not provided'}</p>
                <p><strong>Location:</strong> ${donor.location}</p>
            </div>
            <div class="request-details">
                <h3>Request Details:</h3>
                <p><strong>Patient:</strong> ${receiver.name}</p>
                <p><strong>Required Blood Group:</strong> ${receiver.requiredBloodGroup}</p>
                <p><strong>Urgency:</strong> ${receiver.urgency}</p>
                <p><strong>Contact:</strong> <a href="tel:${receiver.mobile}">${receiver.mobile}</a></p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="window.open('tel:${donor.mobile}')">
                    <i class="fas fa-phone"></i> Call Donor
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveData() {
    localStorage.setItem('suraksha_donors', JSON.stringify(donors));
    localStorage.setItem('suraksha_receivers', JSON.stringify(receivers));
}

function loadData() {
    const savedDonors = localStorage.getItem('suraksha_donors');
    const savedReceivers = localStorage.getItem('suraksha_receivers');
    
    if (savedDonors) {
        donors = JSON.parse(savedDonors);
    }
    
    if (savedReceivers) {
        receivers = JSON.parse(savedReceivers);
    }
}

function addSampleData() {
    if (donors.length === 0) {
        donors = [
            {
                id: '1',
                name: 'Rajesh Kumar',
                age: 28,
                gender: 'male',
                bloodGroup: 'O+',
                weight: 70,
                mobile: '9876543210',
                email: 'rajesh@email.com',
                location: 'Mumbai, Maharashtra',
                address: '123 Andheri West, Mumbai',
                lastDonation: '2024-01-15',
                medicalHistory: 'No known medical conditions',
                registrationDate: '2024-01-01',
                isAvailable: true
            },
            {
                id: '2',
                name: 'Priya Sharma',
                age: 25,
                gender: 'female',
                bloodGroup: 'A+',
                weight: 55,
                mobile: '9876543211',
                email: 'priya@email.com',
                location: 'Delhi, NCR',
                address: '456 Connaught Place, Delhi',
                lastDonation: '2024-02-01',
                medicalHistory: 'No known medical conditions',
                registrationDate: '2024-01-15',
                isAvailable: true
            },
            {
                id: '3',
                name: 'Amit Singh',
                age: 32,
                gender: 'male',
                bloodGroup: 'B+',
                weight: 75,
                mobile: '9876543212',
                email: 'amit@email.com',
                location: 'Bangalore, Karnataka',
                address: '789 MG Road, Bangalore',
                lastDonation: '2023-12-01',
                medicalHistory: 'No known medical conditions',
                registrationDate: '2024-02-01',
                isAvailable: true
            }
        ];
        saveData();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target === modal) {
        closeModal();
    }
}
