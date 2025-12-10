# API Documentation

Complete API reference for the Attendance Management System (AMS-AI).

## Table of Contents

- [Authentication](#authentication)
- [Dashboard APIs](#dashboard-apis)
- [Terminal APIs](#terminal-apis)
- [Reports APIs](#reports-apis)
- [Settings APIs](#settings-apis)
- [Camera APIs](#camera-apis)
- [Admin APIs](#admin-apis)
- [Enrollment APIs](#enrollment-apis)
- [Error Handling](#error-handling)

---

## Base URL

All API endpoints are relative to:
```
http://localhost:3000
```

## Authentication

All API endpoints (except login/register) require authentication via session cookies.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "teacher"
  }
}
```

### Logout
```http
GET /auth/logout
```

**Response:** Redirects to `/login`

---

## Dashboard APIs

### Get Admin Statistics
```http
GET /dashboard/api/dashboard/admin-stats
Authorization: Admin role required
```

**Response:**
```json
{
  "totalStudents": 150,
  "presentCount": 120,
  "lateCount": 15,
  "absentCount": 15,
  "recentActivity": [
    {
      "studentName": "John Doe",
      "rollNo": "CS2021001",
      "courseName": "Database Systems",
      "courseCode": "CS301",
      "className": "CS 5 - A",
      "status": "present",
      "timestamp": "2025-12-10T09:30:00.000Z"
    }
  ],
  "classBreakdown": [
    {
      "className": "CS 5 - A",
      "totalStudents": 50,
      "presentToday": 45,
      "attendanceRate": 90
    }
  ],
  "weeklyData": [
    {
      "date": "2025-12-04",
      "dayName": "Thu",
      "present": 120,
      "late": 10,
      "absent": 20
    }
  ]
}
```

### Get Teacher Statistics
```http
GET /dashboard/api/dashboard/teacher-stats
Authorization: Teacher role required
```

**Response:** Same structure as admin stats, filtered to teacher's assigned courses.

### Get Student Statistics
```http
GET /dashboard/api/dashboard/student-stats
Authorization: Student role required
```

**Response:**
```json
{
  "studentInfo": {
    "name": "John Doe",
    "rollNo": "CS2021001",
    "className": "CS 5 - A"
  },
  "presentCount": 45,
  "lateCount": 3,
  "absentCount": 2,
  "totalSessions": 50,
  "totalCourses": 5,
  "attendanceRate": 90,
  "recentActivity": [...],
  "courseBreakdown": [
    {
      "courseName": "Database Systems",
      "courseCode": "CS301",
      "present": 10,
      "late": 1,
      "absent": 0,
      "total": 11,
      "attendanceRate": 91
    }
  ],
  "weeklyData": [...]
}
```

---

## Terminal APIs

### Get Teacher Data
```http
GET /terminal/api/teacher-data
Authorization: Teacher/Admin role required
```

**Response:**
```json
{
  "classes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Computer Science",
      "semester": "5",
      "section": "A",
      "department": "CS",
      "displayName": "Computer Science 5 - A",
      "courses": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Database Systems",
          "code": "CS301"
        }
      ]
    }
  ]
}
```

### Get Class Students
```http
GET /terminal/api/class-students/:classId
Authorization: Teacher/Admin role required
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `classId` | string | MongoDB ObjectId of the class |

**Response:**
```json
{
  "students": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "username": "johndoe",
      "fullName": "John Doe",
      "rollNo": "CS2021001",
      "faceDescriptor": [0.123, -0.456, ...] // 128 floats
    }
  ]
}
```

### Mark Attendance
```http
POST /terminal/api/mark-attendance
Authorization: Teacher/Admin role required
Content-Type: application/json

{
  "studentId": "507f1f77bcf86cd799439013",
  "courseId": "507f1f77bcf86cd799439012",
  "classId": "507f1f77bcf86cd799439011",
  "confidenceScore": 0.85,
  "faceDescriptor": [0.123, -0.456, ...] // Optional, for incremental learning
}
```

**Response:**
```json
{
  "success": true,
  "attendance": {
    "_id": "507f1f77bcf86cd799439014",
    "studentRef": "507f1f77bcf86cd799439013",
    "courseRef": "507f1f77bcf86cd799439012",
    "classRef": "507f1f77bcf86cd799439011",
    "status": "present",
    "confidenceScore": 0.85,
    "markedBy": "facial_recognition",
    "sessionDate": "2025-12-10T00:00:00.000Z",
    "timestamp": "2025-12-10T09:30:00.000Z",
    "student": {
      "fullName": "John Doe",
      "rollNo": "CS2021001"
    }
  },
  "status": "present"
}
```

### Get Today's Attendance
```http
GET /terminal/api/today-attendance/:courseId
Authorization: Teacher/Admin role required
```

**Response:**
```json
{
  "attendance": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "studentRef": "507f1f77bcf86cd799439013",
      "status": "present",
      "confidenceScore": 0.85,
      "timestamp": "2025-12-10T09:30:00.000Z",
      "student": {
        "_id": "507f1f77bcf86cd799439013",
        "fullName": "John Doe",
        "rollNo": "CS2021001"
      }
    }
  ]
}
```

### Get Unmarked Students
```http
GET /terminal/api/unmarked-students/:classId/:courseId
Authorization: Teacher/Admin role required
```

**Response:**
```json
{
  "unmarkedStudents": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "fullName": "Jane Smith",
      "rollNo": "CS2021002"
    }
  ],
  "totalStudents": 50,
  "markedCount": 45
}
```

### Manual Mark Attendance
```http
POST /terminal/api/manual-mark-attendance
Authorization: Teacher/Admin role required
Content-Type: application/json

{
  "studentId": "507f1f77bcf86cd799439015",
  "courseId": "507f1f77bcf86cd799439012",
  "classId": "507f1f77bcf86cd799439011",
  "status": "present" // "present", "late", or "absent"
}
```

**Response:**
```json
{
  "success": true,
  "attendance": {
    "_id": "507f1f77bcf86cd799439016",
    "status": "present",
    "markedBy": "manual",
    "student": {
      "fullName": "Jane Smith",
      "rollNo": "CS2021002"
    }
  }
}
```

### End Session
```http
POST /terminal/api/end-session
Authorization: Teacher/Admin role required
Content-Type: application/json

{
  "classId": "507f1f77bcf86cd799439011",
  "courseId": "507f1f77bcf86cd799439012",
  "markAbsent": true // If true, marks all remaining students as absent
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session ended. 5 students marked as absent.",
  "totalStudents": 50,
  "presentCount": 45,
  "absentCount": 5,
  "unmarkedStudents": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "fullName": "Jane Smith",
      "rollNo": "CS2021002"
    }
  ]
}
```

---

## Reports APIs

### Get Sessions
```http
GET /reports/api/sessions
Authorization: Teacher/Admin role required
Query Parameters: ?startDate=2025-12-01&endDate=2025-12-10
```

**Response:**
```json
{
  "sessions": [
    {
      "date": "2025-12-10",
      "courses": [
        {
          "courseId": "507f1f77bcf86cd799439012",
          "courseName": "Database Systems",
          "courseCode": "CS301",
          "className": "CS 5 - A",
          "presentCount": 45,
          "lateCount": 3,
          "absentCount": 2,
          "totalCount": 50
        }
      ]
    }
  ]
}
```

### Get Course Sessions
```http
GET /reports/api/course-sessions/:courseId
Authorization: Teacher/Admin role required
Query Parameters: ?sessionDate=2025-12-10
```

**Response:**
```json
{
  "records": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "student": {
        "fullName": "John Doe",
        "rollNo": "CS2021001"
      },
      "status": "present",
      "timestamp": "2025-12-10T09:30:00.000Z",
      "confidenceScore": 0.85,
      "markedBy": "facial_recognition"
    }
  ]
}
```

---

## Settings APIs

### Get Settings
```http
GET /api/settings
Authorization: Authenticated user required
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "userId": "507f1f77bcf86cd799439011",
  "userModel": "Teacher",
  "cameraType": "webcam",
  "ipCameraUrl": "",
  "videoFilePath": "",
  "matchingThreshold": 0.75,
  "inputSize": 416,
  "detectionModel": "tiny",
  "lateCutoffTime": "09:30",
  "workStartTime": "09:00",
  "workEndTime": "17:00"
}
```

### Update Settings
```http
POST /api/settings
Authorization: Authenticated user required
Content-Type: application/json

{
  "cameraType": "ip",
  "ipCameraUrl": "rtsp://192.168.0.103:554/stream",
  "matchingThreshold": 0.80,
  "inputSize": 512,
  "lateCutoffTime": "09:15"
}
```

**Response:**
```json
{
  "success": true,
  "settings": {...}
}
```

---

## Camera APIs

### Get Stream URL
```http
GET /api/camera/stream-url
Authorization: Authenticated user required
```

**Response:**
```json
{
  "cameraType": "ip",
  "streamUrl": "rtsp://192.168.0.103:554/stream"
}
```

### Get MJPEG Stream
```http
GET /api/camera/stream
Authorization: Authenticated user required
Content-Type: multipart/x-mixed-replace; boundary=frame
```

Returns continuous MJPEG stream for IP cameras.

### Upload Video
```http
POST /api/camera/upload-video
Authorization: Authenticated user required
Content-Type: multipart/form-data

video: [file]
```

**Response:**
```json
{
  "success": true,
  "filename": "video_1702200000000.mp4",
  "path": "uploads/videos/video_1702200000000.mp4"
}
```

### Get Video Info
```http
GET /api/camera/video-info
Authorization: Authenticated user required
```

**Response:**
```json
{
  "hasVideo": true,
  "filename": "video_1702200000000.mp4",
  "path": "uploads/videos/video_1702200000000.mp4"
}
```

### Stream Video
```http
GET /api/camera/video-stream
Authorization: Authenticated user required
```

Returns video file with support for range requests (seeking).

### Delete Video
```http
DELETE /api/camera/video
Authorization: Authenticated user required
```

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

---

## Admin APIs

### Get All Classes
```http
GET /admin/api/classes
Authorization: Admin role required
```

### Create Class
```http
POST /admin/api/classes
Authorization: Admin role required
Content-Type: application/json

{
  "name": "Computer Science",
  "semester": "5",
  "section": "A",
  "department": "CS"
}
```

### Get All Courses
```http
GET /admin/api/courses
Authorization: Admin role required
```

### Create Course
```http
POST /admin/api/courses
Authorization: Admin role required
Content-Type: application/json

{
  "name": "Database Systems",
  "code": "CS301",
  "classRef": "507f1f77bcf86cd799439011",
  "instructorRef": "507f1f77bcf86cd799439018"
}
```

### Get All Teachers
```http
GET /admin/api/teachers
Authorization: Admin role required
```

### Create Teacher
```http
POST /admin/api/teachers
Authorization: Admin role required
Content-Type: application/json

{
  "fullName": "Dr. Smith",
  "email": "smith@university.edu",
  "password": "password123",
  "department": "CS"
}
```

---

## Enrollment APIs

### Enroll Student
```http
POST /enrollment/api/enroll
Authorization: Teacher/Admin role required
Content-Type: multipart/form-data

fullName: "John Doe"
email: "john@example.com"
password: "password123"
rollNo: "CS2021001"
classRef: "507f1f77bcf86cd799439011"
faceImage: [file]
```

**Response:**
```json
{
  "success": true,
  "student": {
    "_id": "507f1f77bcf86cd799439013",
    "fullName": "John Doe",
    "rollNo": "CS2021001"
  },
  "message": "Student enrolled successfully"
}
```

---

## Error Handling

All API errors follow this format:

```json
{
  "error": "Error message here",
  "details": {} // Optional additional details
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 500 | Internal Server Error |

### Common Errors

```json
// Authentication Error
{
  "error": "Not authenticated",
  "redirect": "/login"
}

// Authorization Error
{
  "error": "Access denied",
  "requiredRole": "admin"
}

// Validation Error
{
  "error": "Missing required fields",
  "details": {
    "studentId": false,
    "courseId": true,
    "classId": true
  }
}

// Duplicate Error
{
  "error": "Attendance already marked",
  "alreadyMarked": true
}
```
