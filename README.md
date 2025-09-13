# Suraksha - Blood Donation Platform

Suraksha is a web-based platform that connects blood donors with those in need, making the process of finding compatible blood donors faster and more efficient. Our mission is to save lives by bridging the gap between donors and receivers.

## Features

### For Donors
- **Easy Registration**: Simple form to register as a blood donor
- **Complete Profile**: Store all necessary information including medical history
- **Location-Based Matching**: Get matched with receivers in your area
- **Availability Management**: Control when you're available for donation

### For Receivers
- **Quick Blood Request**: Register your blood requirement with urgency levels
- **Compatible Donor Matching**: Find donors with compatible blood groups
- **Location-Based Results**: See donors sorted by proximity
- **Direct Contact**: Get contact information to reach out to donors

### Platform Features
- **Blood Group Compatibility**: Automatic matching based on medical compatibility
- **Real-time Location Matching**: Find the nearest available donors
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Database Storage**: All data securely stored in SQLite database
- **RESTful API**: Complete backend API for all operations

## Blood Group Compatibility

The platform automatically matches donors and receivers based on medical compatibility:

- **A+** can receive from: A+, A-, O+, O-
- **A-** can receive from: A-, O-
- **B+** can receive from: B+, B-, O+, O-
- **B-** can receive from: B-, O-
- **AB+** can receive from: All blood groups (Universal Recipient)
- **AB-** can receive from: A-, B-, AB-, O-
- **O+** can receive from: O+, O-
- **O-** can receive from: O- (Universal Donor)

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Setup Instructions

1. **Clone or download the project files**
   ```bash
   # If using git
   git clone <repository-url>
   cd suraksha-blood-donation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your web browser
   - Navigate to `http://localhost:3000`
   - The application will be ready to use

### Development Mode
For development with auto-restart:
```bash
npm run dev
```

## Usage

### For Donors

1. **Register as a Donor**
   - Click "I Want to Donate" on the homepage
   - Fill in all required information:
     - Personal details (name, age, gender)
     - Blood group and weight
     - Contact information
     - Location and address
     - Medical history
   - Submit the form

2. **Get Matched**
   - You'll be automatically matched with receivers who need your blood type
   - Receive notifications when someone needs your blood

### For Receivers

1. **Request Blood**
   - Click "I Need Blood" on the homepage
   - Fill in the blood request form:
     - Patient details
     - Required blood group
     - Urgency level
     - Location and contact information
   - Submit the request

2. **Find Donors**
   - View a list of compatible donors
   - Donors are sorted by distance from your location
   - Contact donors directly using provided information

## API Endpoints

The platform provides a RESTful API for all operations:

### Donors
- `GET /api/donors` - Get all available donors
- `POST /api/donors` - Register a new donor
- `PUT /api/donors/:id/availability` - Update donor availability

### Receivers
- `GET /api/receivers` - Get all active receivers
- `POST /api/receivers` - Register a new receiver
- `GET /api/receivers/:id/donors` - Get compatible donors for a receiver

### Matches
- `POST /api/matches` - Create a match between donor and receiver

### Statistics
- `GET /api/stats` - Get platform statistics

## Database Schema

The application uses SQLite database with the following tables:

### Donors Table
- Personal information (name, age, gender)
- Blood group and medical details
- Contact information and location
- Availability status

### Receivers Table
- Patient information
- Required blood group and urgency
- Contact details and location
- Request status

### Matches Table
- Tracks connections between donors and receivers
- Match status and timestamps

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome

## Contributing

We welcome contributions to improve the platform:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Safety and Privacy

- All personal information is stored securely
- Contact information is only shared between matched donors and receivers
- Medical information is kept confidential
- Users can control their availability and data

## Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- SMS/Email notifications
- Mobile app development
- Integration with hospitals
- Advanced location services
- Donor reward system
- Blood bank integration

---

**Saving lives, one donation at a time.**

