# Attendance Management System (AMS-AI)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D4.4-green.svg)

**An intelligent attendance management system using AI-powered facial recognition technology**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage-guide) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
  - [Core Functionality](#-core-functionality)
  - [User Roles](#-user-roles)
  - [Technical Features](#-technical-features)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
  - [Prerequisites](#prerequisites)
  - [Setup Steps](#setup-steps)
  - [Environment Variables](#environment-variables)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
  - [First-Time Setup](#first-time-setup)
  - [Marking Attendance](#marking-attendance)
  - [End Session & Manual Marking](#end-session--manual-marking)
  - [Viewing Reports](#viewing-reports)
- [Configuration](#-configuration)
  - [Recognition Settings](#recognition-settings)
  - [Camera Types](#camera-types)
  - [Time Settings](#time-settings)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Performance Optimization](#-performance-optimization)
- [Troubleshooting](#-troubleshooting)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

AMS-AI is a modern, AI-powered attendance management system designed for educational institutions. It uses facial recognition technology to automatically mark student attendance, reducing manual effort and improving accuracy. The system supports multiple camera types including webcams, USB cameras, IP cameras (RTSP), and pre-recorded videos.

### Key Highlights

- 🤖 **AI-Powered Recognition** - Automatic face detection and recognition using face-api.js
- 📊 **Real-time Analytics** - Live dashboards with attendance statistics
- 🎥 **Multiple Camera Support** - Webcam, USB, IP Camera (RTSP), and pre-recorded video
- 👥 **Role-Based Access** - Separate interfaces for Admin, Teacher, and Student
- 📈 **Incremental Learning** - Face descriptors improve with each detection
- ⏱️ **Session Management** - End session with bulk absent marking

---

## ✨ Features

### 🎯 Core Functionality

| Feature | Description |
|---------|-------------|
| **Real-time Face Recognition** | Automatic attendance marking using AI-powered facial recognition |
| **Pre-recorded Video Support** | Process attendance from uploaded video files |
| **Role-Based Access Control** | Separate interfaces for Admin, Teacher, and Student |
| **IP Camera Support** | RTSP stream integration for remote camera access |
| **Live Dashboard** | Real-time attendance statistics and analytics |
| **Comprehensive Reports** | Detailed attendance reports with filtering options |
| **Session Management** | End session with automatic absent marking |
| **Manual Marking** | Mark missed students manually during or after session |
| **Incremental Learning** | Face descriptors update with each detection for improved accuracy |

### 👥 User Roles

#### 🔐 Admin
- Manage teachers, students, classes, and courses
- View system-wide attendance statistics
- Access all reports and analytics
- Configure system settings
- Assign teachers to courses
- Create and manage user accounts

#### 👨‍🏫 Teacher
- Mark attendance using facial recognition
- View assigned classes and courses
- Access student attendance reports
- Configure personal camera settings
- Upload pre-recorded videos for attendance
- End sessions and mark absent students
- Track course-specific statistics

#### 👨‍🎓 Student
- View personal attendance records
- Check attendance percentage by course
- Access individual attendance history
- View course enrollment details

### 🔧 Technical Features

- **Multiple Detection Models** - Support for Tiny Face Detector and SSD MobileNet v1
- **Adjustable Recognition Settings** - Configurable matching threshold (0.5-0.95) and input size
- **Per-User Settings** - Independent camera and recognition settings for each teacher/admin
- **Session Management** - Secure authentication with express-session
- **Optimized Performance** - Database indexes and query optimization for scalability
- **RTSP Streaming** - FFmpeg-powered real-time video streaming
- **Incremental Learning** - EMA-based descriptor updates (alpha=0.15, threshold≥0.6)

---

## 🛠 Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js v5** | Web framework |
| **MongoDB** | NoSQL Database |
| **Mongoose v9** | ODM for MongoDB |
| **face-api.js** | Face detection and recognition |
| **FFmpeg** | Video streaming and processing |
| **bcryptjs** | Password hashing |
| **express-session** | Session management |
| **multer** | File upload handling |

### Frontend
| Technology | Purpose |
|------------|---------|
| **EJS** | Server-side templating |
| **TailwindCSS** | UI styling framework |
| **face-api.js** | Client-side face detection |
| **Chart.js** | Dashboard visualizations |
| **Vanilla JavaScript** | Client-side interactions |

---

## 📦 Installation

### Prerequisites

- **Node.js** v14.0.0 or higher
- **MongoDB** v4.4 or higher
- **FFmpeg** (for IP camera and video support)
- **npm** or **yarn** package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Asad-xnb/Attendance-Management-System.git
   cd Attendance-Management-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ams-ai
   SESSION_SECRET=your-secret-key-here
   PORT=3000
   ```

4. **Install FFmpeg** (for IP camera and video support)
   
   **Windows:**
   ```bash
   winget install Gyan.FFmpeg
   ```
   
   **Linux:**
   ```bash
   sudo apt install ffmpeg
   ```
   
   **macOS:**
   ```bash
   brew install ffmpeg
   ```

5. **Start MongoDB**
   ```bash
   mongod
   ```

6. **Create Super Admin Account**
   ```bash
   node My_scripts/createSuperAdmin.js
   ```

7. **Start the server**
   ```bash
   npm start
   ```

8. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ams-ai` |
| `SESSION_SECRET` | Secret key for session encryption | Required |
| `PORT` | Server port | `3000` |

---

## 📁 Project Structure

```
AMS-AI/
├── app.js                    # Application entry point
├── package.json              # Project dependencies
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
├── LICENSE                  # MIT License
│
├── models/                  # Mongoose schemas
│   ├── index.js            # Model exports
│   ├── Admin.js            # Admin user model
│   ├── Student.js          # Student model with face descriptors
│   ├── Class.js            # Class/section model
│   ├── Course.js           # Course model
│   ├── Attendance.js       # Attendance records
│   └── Settings.js         # User settings (camera, recognition)
│
├── routes/                  # Express route handlers
│   ├── base.routes.js      # Base/home routes
│   ├── auth.routes.js      # Authentication routes
│   ├── admin.routes.js     # Admin management routes
│   ├── dashboard.routes.js # Dashboard statistics API
│   ├── reports.routes.js   # Reports API
│   ├── terminal.routes.js  # Attendance terminal API
│   ├── enrollment.routes.js# Student enrollment routes
│   ├── settings.routes.js  # Settings API
│   ├── camera.routes.js    # Camera streaming routes
│   └── student.routes.js   # Student-specific routes
│
├── views/                   # EJS templates
│   ├── login.ejs           # Login page
│   ├── dashboard.ejs       # Dashboard page
│   ├── reports.ejs         # Reports page
│   ├── terminal.ejs        # Attendance terminal
│   ├── enrollment.ejs      # Student enrollment
│   ├── settings.ejs        # Settings page
│   └── includes/           # Partial templates
│       ├── head.ejs        # HTML head section
│       └── sidebar.ejs     # Navigation sidebar
│
├── middleware/              # Custom middleware
│   └── auth.js             # Authentication & authorization
│
├── public/                  # Static assets
│   └── scripts/            # Client-side face-api models
│       ├── face-api.min.js
│       ├── tiny_face_detector_model-*
│       ├── face_landmark_68_model-*
│       └── face_recognition_model-*
│
├── FACE_API_Models/         # Server-side face-api models
├── uploads/                 # Uploaded files (faces, videos)
├── My_scripts/              # Utility scripts
│   └── createSuperAdmin.js # Create admin account
│
└── docs/                    # Documentation
    ├── README.md           # This file
    ├── FFMPEG_SETUP.md     # FFmpeg setup guide
    └── RTSP_INTEGRATION.md # RTSP camera guide
```

---

## 📖 Usage Guide

### First-Time Setup

1. **Create Admin Account**
   ```bash
   node My_scripts/createSuperAdmin.js
   ```
   Follow the prompts to create your admin credentials.

2. **Login**
   - Navigate to `http://localhost:3000/login`
   - Enter admin credentials

3. **Add Classes**
   - Go to "Manage" → "Classes"
   - Create classes with name, semester, and section
   - Example: "Computer Science", Semester 5, Section "A"

4. **Add Teachers** (if needed)
   - Go to "Manage" → "Teachers"
   - Create teacher accounts with email and password

5. **Add Courses**
   - Go to "Manage" → "Courses"
   - Create courses and assign to classes
   - Assign teachers as instructors

6. **Enroll Students**
   - Go to "Enrollment" page
   - Fill student details (name, roll number, email)
   - Upload student face images (clear, front-facing)
   - System automatically extracts face descriptors

### Marking Attendance

1. **Configure Camera Settings**
   - Go to "Settings" page
   - Select camera type:
     - **Webcam**: Built-in or USB webcam
     - **IP Camera**: Enter RTSP URL (e.g., `rtsp://192.168.0.103:554/stream`)
     - **Pre-recorded Video**: Upload a video file
   - Adjust recognition settings:
     - Matching Threshold (recommended: 0.70-0.80)
     - Input Size (recommended: 416px)

2. **Start Recognition**
   - Go to "Terminal" page
   - Select class from dropdown
   - Select course from dropdown
   - Click "Start Recognition"
   - Students are automatically marked when detected
   - View real-time "Not Yet Detected" panel

3. **Monitor Progress**
   - Watch the live feed with face detection boxes
   - Green box = Already marked
   - Yellow box = Detected, marking...
   - Red box = Unknown face
   - Check statistics: Marked, Total, Pending

### End Session & Manual Marking

1. **During Session**
   - Click "+" button on any student in "Not Yet Detected" panel
   - Choose: Present, Late, or Absent

2. **End Session**
   - Click "End Session" button
   - Review unmarked students in modal
   - Quick-mark individuals as Present/Late
   - Check "Mark all remaining as absent"
   - Click "End Session" to finalize

### Viewing Reports

1. **Navigate to Reports**
   - Go to "Reports" page
   - View sessions grouped by date

2. **Filter Reports**
   - Select date range
   - Filter by class or course
   - Filter by attendance status

3. **View Session Details**
   - Click on a session card
   - View all students and their status
   - See timestamps and confidence scores

---

## ⚙️ Configuration

### Recognition Settings

| Setting | Range | Recommended | Description |
|---------|-------|-------------|-------------|
| **Matching Threshold** | 0.50 - 0.95 | 0.70 - 0.80 | Lower = More lenient, Higher = Stricter |
| **Input Size** | 224, 320, 416, 512 | 416px | Higher = More accurate but slower |
| **Detection Model** | Tiny/SSD | Tiny | Tiny = Faster, SSD = More accurate |

### Camera Types

| Type | URL Format | Example |
|------|------------|---------|
| **Webcam** | Auto-detected | - |
| **IP Camera (RTSP)** | `rtsp://[user:pass@]ip:port/path` | `rtsp://admin:admin@192.168.0.103:554/stream` |
| **Pre-recorded Video** | File upload | `.mp4`, `.avi`, `.mkv`, `.mov` |

### Time Settings

| Setting | Description |
|---------|-------------|
| **Work Start Time** | When attendance marking can begin |
| **Late Cutoff Time** | After this time, arrivals marked as "Late" |
| **Work End Time** | When attendance marking ends |

---

## 🔌 API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/logout` | GET | User logout |
| `/auth/register` | POST | Register new user |

### Dashboard

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/dashboard/api/dashboard/admin-stats` | GET | Admin | Get admin dashboard statistics |
| `/dashboard/api/dashboard/teacher-stats` | GET | Teacher | Get teacher dashboard statistics |
| `/dashboard/api/dashboard/student-stats` | GET | Student | Get student dashboard statistics |

### Terminal (Attendance)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/terminal/api/teacher-data` | GET | Teacher/Admin | Get teacher's classes and courses |
| `/terminal/api/class-students/:classId` | GET | Teacher/Admin | Get students with face descriptors |
| `/terminal/api/mark-attendance` | POST | Teacher/Admin | Mark student attendance |
| `/terminal/api/today-attendance/:courseId` | GET | Teacher/Admin | Get today's attendance for course |
| `/terminal/api/unmarked-students/:classId/:courseId` | GET | Teacher/Admin | Get unmarked students |
| `/terminal/api/manual-mark-attendance` | POST | Teacher/Admin | Manually mark attendance |
| `/terminal/api/end-session` | POST | Teacher/Admin | End session, mark remaining absent |

### Reports

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/reports/api/sessions` | GET | Teacher/Admin | Get attendance sessions |
| `/reports/api/course-sessions/:courseId` | GET | Teacher/Admin | Get sessions for specific course |

### Settings

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/settings` | GET | Authenticated | Get user settings |
| `/api/settings` | POST | Authenticated | Update user settings |

### Camera

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/camera/stream-url` | GET | Authenticated | Get camera stream URL |
| `/api/camera/stream` | GET | Authenticated | Get MJPEG stream (IP camera) |
| `/api/camera/upload-video` | POST | Authenticated | Upload video file |
| `/api/camera/video-info` | GET | Authenticated | Get uploaded video info |
| `/api/camera/video-stream` | GET | Authenticated | Stream uploaded video |
| `/api/camera/video` | DELETE | Authenticated | Delete uploaded video |

---

## 🗄️ Database Schema

### Student
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  rollNo: String,
  classRef: ObjectId (ref: Class),
  faceDescriptor: [Number] (128-dimensional),
  isEnrolled: Boolean,
  lastDescriptorUpdate: Date,
  descriptorUpdateCount: Number
}
```

### Attendance
```javascript
{
  studentRef: ObjectId (ref: Student),
  courseRef: ObjectId (ref: Course),
  classRef: ObjectId (ref: Class),
  status: Enum ['present', 'late', 'absent'],
  confidenceScore: Number,
  markedBy: Enum ['facial_recognition', 'manual', 'session_end'],
  sessionDate: Date,
  timestamp: Date
}
```

### Settings
```javascript
{
  userId: ObjectId,
  userModel: Enum ['Admin', 'Teacher'],
  cameraType: Enum ['webcam', 'usb', 'ip', 'video'],
  ipCameraUrl: String,
  videoFilePath: String,
  matchingThreshold: Number (0.5-0.95),
  inputSize: Number (224, 320, 416, 512),
  detectionModel: Enum ['tiny', 'ssd'],
  lateCutoffTime: String (HH:MM)
}
```

---

## ⚡ Performance Optimization

The system includes several optimizations:

| Optimization | Description |
|--------------|-------------|
| **Database Indexes** | Indexed fields for fast queries |
| **Query Limits** | Prevents loading excessive records |
| **Lean Queries** | Reduced memory usage for read operations |
| **5 FPS Detection** | 200ms intervals for better CPU usage |
| **Incremental Learning** | EMA updates (α=0.15) only when confidence ≥60% |
| **Video Streaming** | Chunked streaming for large files |

---

## 🔧 Troubleshooting

### Camera Not Working

| Issue | Solution |
|-------|----------|
| Webcam not detected | Check browser permissions, try different browser |
| IP camera not connecting | Verify RTSP URL, check network connectivity |
| Video not loading | Check file format (.mp4, .avi, .mkv, .mov supported) |
| FFmpeg errors | Reinstall FFmpeg, verify PATH environment variable |

### Face Not Detected

| Issue | Solution |
|-------|----------|
| No faces detected | Improve lighting, face camera directly |
| Wrong person detected | Increase matching threshold |
| Known face shows "Unknown" | Lower matching threshold, re-enroll student |
| Slow detection | Reduce input size to 320px or 224px |

### Database Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Ensure MongoDB is running |
| Authentication failed | Check MONGODB_URI credentials |
| Slow queries | Check database indexes |

---

## 🔒 Security

| Feature | Implementation |
|---------|----------------|
| **Password Hashing** | bcryptjs with salt rounds |
| **Session Management** | express-session with MongoDB store |
| **Role-Based Access** | Middleware-based authorization |
| **Input Validation** | Server-side validation |
| **File Upload Security** | Multer with file type validation |

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/YourFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add YourFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/YourFeature
   ```
5. **Open a Pull Request**

### Code Style

- Use ESLint for JavaScript linting
- Follow existing code patterns
- Add comments for complex logic
- Update documentation for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) - Face detection and recognition
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Express.js](https://expressjs.com/) - Web framework

---

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues**: [Open an issue](https://github.com/Asad-xnb/Attendance-Management-System/issues)
- **Email**: Contact repository owner

---

<div align="center">

**Built with ❤️ for educational institutions**

</div>
