// Blood Donation Platform JavaScript

// Sample database (in a real application, this would be a proper database)
let donors = [];
let receivers = [];

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

// Global variables for new features
let currentUser = null;
let leaderboardData = [];
let challengesData = [];
let inventoryData = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load existing data from localStorage
    loadData();
    
    // Initialize new features
    initializeNewFeatures();
    loadLeaderboard();
    loadChallenges();
    loadInventory();
    
    // Add form event listeners
    document.getElementById('donorRegistrationForm').addEventListener('submit', handleDonorRegistration);
    document.getElementById('receiverRegistrationForm').addEventListener('submit', handleReceiverRegistration);
    
    // Add new form event listeners
    const healthScreeningForm = document.getElementById('healthScreeningForm');
    if (healthScreeningForm) {
        healthScreeningForm.addEventListener('submit', handleHealthScreening);
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Initialize phone number input fields
    initializePhoneInputs();
    
    // Add debugging for phone inputs
    debugPhoneInputs();
    
    // Ensure other form elements work properly
    ensureFormElementsWork();
});

// Initialize phone number input fields
function initializePhoneInputs() {
    const donorMobile = document.getElementById('donorMobile');
    const receiverMobile = document.getElementById('receiverMobile');
    const donorCountryCode = document.getElementById('donorCountryCode');
    const receiverCountryCode = document.getElementById('receiverCountryCode');
    
    if (donorMobile) {
        // Remove any potential restrictions
        donorMobile.removeAttribute('readonly');
        donorMobile.removeAttribute('disabled');
        
        // Add input event listener for validation
        donorMobile.addEventListener('input', function(e) {
            // Allow only numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            // Limit to 10 digits
            if (e.target.value.length > 10) {
                e.target.value = e.target.value.slice(0, 10);
            }
        });
        
        // Add click event to ensure focus
        donorMobile.addEventListener('click', function(e) {
            e.target.focus();
            e.target.select();
        });
    }
    
    if (receiverMobile) {
        // Remove any potential restrictions
        receiverMobile.removeAttribute('readonly');
        receiverMobile.removeAttribute('disabled');
        
        // Add input event listener for validation
        receiverMobile.addEventListener('input', function(e) {
            // Allow only numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            // Limit to 10 digits
            if (e.target.value.length > 10) {
                e.target.value = e.target.value.slice(0, 10);
            }
        });
        
        // Add click event to ensure focus
        receiverMobile.addEventListener('click', function(e) {
            e.target.focus();
            e.target.select();
        });
    }
    
    // Handle country code dropdown changes
    if (donorCountryCode) {
        donorCountryCode.addEventListener('change', function() {
            // Close dropdown and focus on mobile input
            setTimeout(() => {
                if (donorMobile) {
                    donorMobile.focus();
                }
            }, 100);
        });
        
        // Focus on mobile input when dropdown loses focus (but not immediately)
        donorCountryCode.addEventListener('blur', function() {
            // Only focus if the blur was intentional (not due to clicking another form element)
            setTimeout(() => {
                if (donorMobile && !document.activeElement.closest('select')) {
                    donorMobile.focus();
                }
            }, 200);
        });
    }
    
    if (receiverCountryCode) {
        receiverCountryCode.addEventListener('change', function() {
            // Close dropdown and focus on mobile input
            setTimeout(() => {
                if (receiverMobile) {
                    receiverMobile.focus();
                }
            }, 100);
        });
        
        // Focus on mobile input when dropdown loses focus (but not immediately)
        receiverCountryCode.addEventListener('blur', function() {
            // Only focus if the blur was intentional (not due to clicking another form element)
            setTimeout(() => {
                if (receiverMobile && !document.activeElement.closest('select')) {
                    receiverMobile.focus();
                }
            }, 200);
        });
    }
    
    // Add click outside handler to close phone input dropdowns only
    document.addEventListener('click', function(e) {
        // Only handle clicks outside phone input groups and not on other form elements
        if (!e.target.closest('.phone-input-group') && 
            !e.target.closest('select') && 
            !e.target.closest('input') && 
            !e.target.closest('textarea')) {
            
            // Clicked outside phone input group and other form elements, close only phone input dropdowns
            const donorCountryCode = document.getElementById('donorCountryCode');
            const receiverCountryCode = document.getElementById('receiverCountryCode');
            
            if (donorCountryCode && document.activeElement === donorCountryCode) {
                donorCountryCode.blur();
            }
            if (receiverCountryCode && document.activeElement === receiverCountryCode) {
                receiverCountryCode.blur();
            }
        }
    });
}

// Debug phone inputs
function debugPhoneInputs() {
    const donorMobile = document.getElementById('donorMobile');
    const receiverMobile = document.getElementById('receiverMobile');
    
    if (donorMobile) {
        console.log('Donor mobile input found:', donorMobile);
        console.log('Donor mobile attributes:', {
            readonly: donorMobile.hasAttribute('readonly'),
            disabled: donorMobile.hasAttribute('disabled'),
            type: donorMobile.type,
            value: donorMobile.value
        });
    }
    
    if (receiverMobile) {
        console.log('Receiver mobile input found:', receiverMobile);
        console.log('Receiver mobile attributes:', {
            readonly: receiverMobile.hasAttribute('readonly'),
            disabled: receiverMobile.hasAttribute('disabled'),
            type: receiverMobile.type,
            value: receiverMobile.value
        });
    }
}

// Test function for phone input (can be called from browser console)
function testPhoneInput() {
    const donorMobile = document.getElementById('donorMobile');
    const receiverMobile = document.getElementById('receiverMobile');
    
    console.log('Testing phone inputs...');
    
    if (donorMobile) {
        console.log('Testing donor mobile input...');
        donorMobile.focus();
        donorMobile.value = '1234567890';
        console.log('Donor mobile value set to:', donorMobile.value);
    }
    
    if (receiverMobile) {
        console.log('Testing receiver mobile input...');
        receiverMobile.focus();
        receiverMobile.value = '9876543210';
        console.log('Receiver mobile value set to:', receiverMobile.value);
    }
}

// Make test function available globally
window.testPhoneInput = testPhoneInput;

// Ensure other form elements work properly
function ensureFormElementsWork() {
    // Remove any potential interference with other form elements
    const allSelects = document.querySelectorAll('select:not(#donorCountryCode):not(#receiverCountryCode)');
    const allInputs = document.querySelectorAll('input:not(#donorMobile):not(#receiverMobile)');
    
    allSelects.forEach(select => {
        // Ensure these selects work normally
        select.addEventListener('focus', function() {
            // Don't interfere with other selects
        });
        
        select.addEventListener('click', function(e) {
            // Allow normal select behavior
            e.stopPropagation();
        });
    });
    
    allInputs.forEach(input => {
        // Ensure these inputs work normally
        input.addEventListener('focus', function() {
            // Don't interfere with other inputs
        });
    });
}

// Show donor registration form
function showDonorForm() {
    hideAllSections();
    document.getElementById('donor-form').style.display = 'block';
    document.getElementById('donor-form').scrollIntoView({ behavior: 'smooth' });
}

// Show receiver registration form
function showReceiverForm() {
    hideAllSections();
    document.getElementById('receiver-form').style.display = 'block';
    document.getElementById('receiver-form').scrollIntoView({ behavior: 'smooth' });
}

// Hide all form sections
function hideAllSections() {
    const sections = [
        'donor-form', 'receiver-form', 'donor-results', 
        'health-assistant', 'gamification', 'emergency'
    ];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Handle donor registration
function handleDonorRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const countryCode = formData.get('countryCode');
    const mobileNumber = formData.get('mobile');
    const fullMobileNumber = countryCode + mobileNumber;
    
    const donorData = {
        id: Date.now().toString(),
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        weight: parseInt(formData.get('weight')),
        mobile: fullMobileNumber,
        countryCode: countryCode,
        email: formData.get('email'),
        location: formData.get('location'),
        address: formData.get('address'),
        lastDonation: formData.get('lastDonation'),
        medicalHistory: formData.get('medicalHistory'),
        registrationDate: new Date().toISOString(),
        isAvailable: true
    };
    
    // Validate donor eligibility
    if (!validateDonorEligibility(donorData)) {
        return;
    }
    
    // Add to donors array
    donors.push(donorData);
    
    // Save to localStorage
    saveData();
    
    // Show success message
    showMessage('Thank you for registering as a donor! You will be contacted when someone needs your blood type.', 'success');
    
    // Reset form
    e.target.reset();
    
    // Hide form and show home
    hideAllSections();
    document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
}

// Handle receiver registration
function handleReceiverRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const countryCode = formData.get('countryCode');
    const mobileNumber = formData.get('mobile');
    const fullMobileNumber = countryCode + mobileNumber;
    
    const receiverData = {
        id: Date.now().toString(),
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        requiredBloodGroup: formData.get('requiredBloodGroup'),
        mobile: fullMobileNumber,
        countryCode: countryCode,
        email: formData.get('email'),
        location: formData.get('location'),
        address: formData.get('address'),
        urgency: formData.get('urgency'),
        hospitalName: formData.get('hospitalName'),
        patientCondition: formData.get('patientCondition'),
        requestDate: new Date().toISOString(),
        status: 'active'
    };
    
    // Add to receivers array
    receivers.push(receiverData);
    
    // Save to localStorage
    saveData();
    
    // Find compatible donors
    const compatibleDonors = findCompatibleDonors(receiverData);
    
    // Show results
    displayDonorResults(compatibleDonors, receiverData);
    
    // Hide form and show results
    hideAllSections();
    document.getElementById('donor-results').style.display = 'block';
    document.getElementById('donor-results').scrollIntoView({ behavior: 'smooth' });
}

// Validate donor eligibility
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

// Find compatible donors
function findCompatibleDonors(receiver) {
    const requiredBloodGroup = receiver.requiredBloodGroup;
    const compatibleBloodGroups = bloodCompatibility[requiredBloodGroup] || [];
    
    return donors.filter(donor => {
        // Check blood group compatibility
        const isBloodCompatible = compatibleBloodGroups.includes(donor.bloodGroup);
        
        // Check if donor is available
        const isAvailable = donor.isAvailable;
        
        // Check location proximity (simplified - in real app, use proper geolocation)
        const isLocationMatch = donor.location.toLowerCase().includes(receiver.location.toLowerCase()) ||
                               receiver.location.toLowerCase().includes(donor.location.toLowerCase());
        
        return isBloodCompatible && isAvailable && isLocationMatch;
    }).map(donor => {
        // Calculate distance (simplified)
        const distance = calculateDistance(donor.location, receiver.location);
        return { ...donor, distance };
    }).sort((a, b) => a.distance - b.distance); // Sort by distance
}

// Calculate distance between locations (simplified)
function calculateDistance(location1, location2) {
    // This is a simplified distance calculation
    // In a real application, you would use proper geolocation APIs
    const commonWords = ['city', 'state', 'district', 'area'];
    let distance = Math.random() * 50; // Random distance for demo
    
    // If locations have common words, reduce distance
    for (let word of commonWords) {
        if (location1.toLowerCase().includes(word) && location2.toLowerCase().includes(word)) {
            distance = Math.random() * 10;
            break;
        }
    }
    
    return Math.round(distance * 10) / 10;
}

// Display donor results
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

// Create donor card
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
            Approximately ${donor.distance} km away
        </div>
        <button class="contact-btn ${urgencyClass}" onclick="contactDonor('${donor.id}', '${receiver.id}')">
            <i class="fas fa-phone"></i>
            ${urgencyText} - Call Now
        </button>
    `;
    
    return card;
}

// Contact donor function
function contactDonor(donorId, receiverId) {
    const donor = donors.find(d => d.id === donorId);
    const receiver = receivers.find(r => r.id === receiverId);
    
    if (donor && receiver) {
        // In a real application, this would send notifications, emails, etc.
        const message = `
            Blood Donation Request:
            
            Patient: ${receiver.name}
            Required Blood Group: ${receiver.requiredBloodGroup}
            Urgency: ${receiver.urgency}
            Hospital: ${receiver.hospitalName || 'Not specified'}
            Location: ${receiver.location}
            Contact: ${receiver.mobile}
            
            Please contact the patient directly if you can help.
        `;
        
        // Show contact modal
        showContactModal(donor, receiver, message);
    }
}

// Show contact modal
function showContactModal(donor, receiver, message) {
    // Create modal if it doesn't exist
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
                    <i class="fas fa-phone"></i> Call Donor (${donor.mobile})
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show message
function showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert at the top of the current section
    const currentSection = document.querySelector('.form-section[style*="block"]');
    if (currentSection) {
        currentSection.insertBefore(message, currentSection.firstChild);
    } else {
        document.body.insertBefore(message, document.body.firstChild);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('suraksha_donors', JSON.stringify(donors));
    localStorage.setItem('suraksha_receivers', JSON.stringify(receivers));
}

// Load data from localStorage
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

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Add some sample data for demonstration
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
                mobile: '+919876543210',
                countryCode: '+91',
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
                mobile: '+919876543211',
                countryCode: '+91',
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
                mobile: '+919876543212',
                countryCode: '+91',
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

// Initialize sample data on first load
document.addEventListener('DOMContentLoaded', function() {
    addSampleData();
});

// ===== NEW FEATURE FUNCTIONS =====

function initializeNewFeatures() {
    // Initialize gamification for demo user
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

function showHealthAssistant() {
    hideAllSections();
    document.getElementById('health-assistant').style.display = 'block';
    document.getElementById('health-assistant').scrollIntoView({ behavior: 'smooth' });
}

function showGamification() {
    hideAllSections();
    document.getElementById('gamification').style.display = 'block';
    document.getElementById('gamification').scrollIntoView({ behavior: 'smooth' });
    updateUserProfile();
}

function updateUserProfile() {
    if (!currentUser) return;
    
    const userPointsEl = document.getElementById('userPoints');
    const userDonationsEl = document.getElementById('userDonations');
    const userStreakEl = document.getElementById('userStreak');
    const userLevelEl = document.getElementById('userLevel');
    
    if (userPointsEl) userPointsEl.textContent = currentUser.points;
    if (userDonationsEl) userDonationsEl.textContent = currentUser.totalDonations;
    if (userStreakEl) userStreakEl.textContent = currentUser.streakCount;
    if (userLevelEl) userLevelEl.textContent = currentUser.level;
    
    displayUserAchievements();
}

function displayUserAchievements() {
    const achievementsContainer = document.getElementById('userAchievements');
    if (!achievementsContainer) return;
    
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
    if (!resultsContainer) return;
    
    const eligibilityClass = assessment.eligibility === 'eligible' ? 'success' : 
                           assessment.eligibility === 'conditional' ? 'warning' : 'error';
    
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

function loadLeaderboard() {
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
    const container = document.getElementById('leaderboardContent');
    if (!container) return;
    
    const data = leaderboardData[type];
    
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
    if (!container) return;
    
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
    }
}

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
    if (!hospitalSelect) return;
    
    const hospitals = [...new Set(inventoryData.map(item => item.hospital))];
    
    hospitalSelect.innerHTML = '<option value="">All Hospitals</option>' +
        hospitals.map(hospital => `<option value="${hospital}">${hospital}</option>`).join('');
    
    // Add event listeners
    hospitalSelect.addEventListener('change', displayInventory);
    const bloodGroupSelect = document.getElementById('inventoryBloodGroup');
    if (bloodGroupSelect) {
        bloodGroupSelect.addEventListener('change', displayInventory);
    }
}

function displayInventory() {
    const hospitalSelect = document.getElementById('inventoryHospital');
    const bloodGroupSelect = document.getElementById('inventoryBloodGroup');
    const container = document.getElementById('inventoryTable');
    
    if (!hospitalSelect || !bloodGroupSelect || !container) return;
    
    const hospitalFilter = hospitalSelect.value;
    const bloodGroupFilter = bloodGroupSelect.value;
    
    let filteredData = inventoryData;
    
    if (hospitalFilter) {
        filteredData = filteredData.filter(item => item.hospital === hospitalFilter);
    }
    
    if (bloodGroupFilter) {
        filteredData = filteredData.filter(item => item.bloodGroup === bloodGroupFilter);
    }
    
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

function sendEmergencyAlert() {
    showMessage('Emergency alert sent to all nearby donors!', 'success');
}

function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };
    
    // Simulate sending the message
    showMessage('Thank you for your message! We will get back to you within 24 hours.', 'success');
    
    // Reset form
    e.target.reset();
    
    // Log the contact data (in a real app, this would be sent to a server)
    console.log('Contact form submitted:', contactData);
}
