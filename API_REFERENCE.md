# EduCore V2 API Reference

Base URL: `http://localhost:3001/api/v1` (dev) or `https://api.educore.com/api/v1` (prod)

**Authentication:** All endpoints require `Authorization: Bearer {token}` header

---

## Batches API

### Create Batch
```
POST /batches
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Morning Batch - Class 10",
  "schedule": "Mon, Wed, Fri - 7:00 AM"  // optional
}

Response 201:
{
  "id": "clc3pm4z5000108lc8d8x",
  "teacherId": "clc2pm4z5000108lc8d8y",
  "name": "Morning Batch - Class 10",
  "schedule": "Mon, Wed, Fri - 7:00 AM",
  "createdAt": "2026-03-02T10:30:00Z",
  "updatedAt": "2026-03-02T10:30:00Z"
}

Response 409 Conflict:
{
  "code": "DUPLICATE_BATCH",
  "message": "Batch with this name already exists for your account",
  "details": {
    "existingBatchId": "clc3pm4z5000108lc8d8x"
  }
}
```

### List All Batches
```
GET /batches
Authorization: Bearer {token}

Query Parameters:
  ?page=1&limit=20        // Pagination
  ?sort=name              // 'name' or 'createdAt'
  ?search=morning         // Fuzzy search

Response 200:
{
  "data": [
    {
      "id": "clc3pm4z5000108lc8d8x",
      "name": "Morning Batch - Class 10",
      "schedule": "Mon, Wed, Fri - 7:00 AM",
      "createdAt": "2026-03-02T10:30:00Z",
      "_count": {
        "students": 25,
        "attendance": 1250
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}

Response 401 Unauthorized:
{
  "code": "UNAUTHORIZED",
  "message": "Valid bearer token required"
}
```

### Get Batch Details
```
GET /batches/:batchId
Authorization: Bearer {token}

Response 200:
{
  "id": "clc3pm4z5000108lc8d8x",
  "teacherId": "clc2pm4z5000108lc8d8y",
  "name": "Morning Batch - Class 10",
  "schedule": "Mon, Wed, Fri - 7:00 AM",
  "students": [
    {
      "id": "s1",
      "name": "Arjun Sharma",
      "enrolledDate": "2026-02-01T00:00:00Z"
    }
  ],
  "createdAt": "2026-03-02T10:30:00Z",
  "updatedAt": "2026-03-02T10:30:00Z"
}

Response 404 Not Found:
{
  "code": "BATCH_NOT_FOUND",
  "message": "Batch not found"
}
```

### Update Batch
```
PATCH /batches/:batchId
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Updated Batch Name",
  "schedule": "Tue, Thu, Sat - 8:00 AM"
}

Response 200:
{
  "id": "clc3pm4z5000108lc8d8x",
  "name": "Updated Batch Name",
  "schedule": "Tue, Thu, Sat - 8:00 AM",
  "updatedAt": "2026-03-02T15:45:00Z"
}
```

### Delete Batch
```
DELETE /batches/:batchId
Authorization: Bearer {token}

Response 204 No Content
(Empty body)

Response 409 Conflict:
{
  "code": "CANNOT_DELETE_BATCH",
  "message": "Cannot delete batch with active attendance records",
  "details": {
    "attendanceCount": 1250
  }
}
```

---

## Batch Students API

### Enroll Students
```
POST /batches/:batchId/students
Content-Type: application/json
Authorization: Bearer {token}

{
  "studentIds": ["s1", "s2", "s3"]
}

Response 200:
{
  "enrolled": 3,
  "failed": 0,
  "message": "All students enrolled successfully",
  "records": [
    {
      "studentId": "s1",
      "name": "Arjun Sharma",
      "enrolledDate": "2026-03-02T10:30:00Z"
    }
  ]
}

Response 400 Bad Request:
{
  "code": "VALIDATION_ERROR",
  "message": "Enrollment validation failed",
  "failed": [
    {
      "studentId": "s2",
      "reason": "STUDENT_NOT_FOUND",
      "message": "Student does not exist"
    },
    {
      "studentId": "s3",
      "reason": "ALREADY_ENROLLED",
      "message": "Student already enrolled in this batch"
    }
  ],
  "enrolled": 1,
  "failed": 2
}
```

### Get Batched Students
```
GET /batches/:batchId/students
Authorization: Bearer {token}

Query Parameters:
  ?page=1&limit=50

Response 200:
{
  "data": [
    {
      "id": "s1",
      "name": "Arjun Sharma",
      "parentName": "Mr. Sharma",
      "enrolledDate": "2026-02-01T00:00:00Z",
      "attendance": {
        "total": 20,
        "present": 18,
        "absent": 2,
        "leave": 0,
        "percentage": 90
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25
  }
}
```

### Remove Student from Batch
```
DELETE /batches/:batchId/students/:studentId
Authorization: Bearer {token}

Response 204 No Content

Response 409 Conflict:
{
  "code": "CANNOT_UNENROLL",
  "message": "Cannot unenroll student with attendance records",
  "details": {
    "attendanceCount": 15
  }
}
```

---

## Attendance API

### Mark Attendance (Single)
```
POST /attendance
Content-Type: application/json
Authorization: Bearer {token}

{
  "studentId": "s1",
  "batchId": "batch1",
  "date": "2026-03-02",
  "status": "present",  // 'present', 'absent', 'leave'
  "remarks": ""         // optional
}

Response 201:
{
  "id": "att1",
  "studentId": "s1",
  "batchId": "batch1",
  "date": "2026-03-02",
  "status": "present",
  "remarks": "",
  "createdAt": "2026-03-02T10:30:00Z"
}

Response 409 Conflict:
{
  "code": "DUPLICATE_ATTENDANCE",
  "message": "Attendance already marked for this student on this date",
  "details": {
    "existingId": "att1",
    "existingStatus": "absent"
  }
}
```

### Mark Attendance (Bulk)
```
POST /attendance/bulk
Content-Type: application/json
Authorization: Bearer {token}

{
  "batchId": "batch1",
  "date": "2026-03-02",
  "records": [
    { "studentId": "s1", "status": "present", "remarks": "" },
    { "studentId": "s2", "status": "absent", "remarks": "Sick" },
    { "studentId": "s3", "status": "leave", "remarks": "Emergency" }
  ]
}

Response 201:
{
  "created": 3,
  "failed": 0,
  "records": [
    { "id": "att1", "studentId": "s1", "status": "present" },
    { "id": "att2", "studentId": "s2", "status": "absent" },
    { "id": "att3", "studentId": "s3", "status": "leave" }
  ]
}

Response 400 Bad Request:
{
  "code": "BULK_OPERATION_FAILED",
  "message": "Some records failed validation",
  "created": 2,
  "failed": 1,
  "failed_records": [
    {
      "index": 1,
      "studentId": "s2",
      "reason": "DUPLICATE_ENTRY",
      "message": "Attendance already marked for this date"
    }
  ]
}
```

### Get Attendance Records
```
GET /attendance
Authorization: Bearer {token}

Query Parameters (required: batchId OR studentId):
  ?batchId=batch1&date=2026-03-02
  ?studentId=s1&month=3&year=2026
  ?page=1&limit=50

Response 200:
{
  "data": [
    {
      "id": "att1",
      "studentId": "s1",
      "batchId": "batch1",
      "date": "2026-03-02",
      "status": "present",
      "remarks": "",
      "student": { "name": "Arjun Sharma" },
      "createdAt": "2026-03-02T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 20
  }
}

Response 400 Bad Request:
{
  "code": "INVALID_QUERY",
  "message": "Either batchId or studentId is required"
}
```

### Get Attendance Report
```
GET /attendance/report/:batchId
Authorization: Bearer {token}

Query Parameters:
  ?month=3&year=2026      // Required: defaults to current month/year
  ?studentId=s1           // Optional: filter by student
  ?format=json            // json, csv (default: json)

Response 200:
{
  "batchId": "batch1",
  "batchName": "Morning Batch - Class 10",
  "month": 3,
  "year": 2026,
  "reportDate": "2026-03-15T10:00:00Z",
  "summary": {
    "totalDaysInMonth": 25,
    "studentsEnrolled": 30,
    "averageAttendance": 87.5
  },
  "students": [
    {
      "id": "s1",
      "name": "Arjun Sharma",
      "totalDays": 25,
      "present": 23,
      "absent": 1,
      "leave": 1,
      "percentage": 92.0,
      "status": "good"  // 'good', 'average', 'poor'
    },
    {
      "id": "s2",
      "name": "Priya Negi",
      "totalDays": 25,
      "present": 18,
      "absent": 5,
      "leave": 2,
      "percentage": 72.0,
      "status": "poor"
    }
  ]
}

Response 200 CSV:
batchId,batchName,month,year,studentId,studentName,present,absent,leave,percentage
batch1,Morning Batch,3,2026,s1,Arjun Sharma,23,1,1,92.0
batch1,Morning Batch,3,2026,s2,Priya Negi,18,5,2,72.0
```

### Edit Attendance Record
```
PATCH /attendance/:attendanceId
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "absent",
  "remarks": "Updated remarked - confirmed sick leave"
}

Response 200:
{
  "id": "att1",
  "studentId": "s1",
  "batchId": "batch1",
  "date": "2026-03-02",
  "status": "absent",
  "remarks": "Updated remarked - confirmed sick leave",
  "updatedAt": "2026-03-02T11:00:00Z"
}

Response 404 Not Found:
{
  "code": "ATTENDANCE_NOT_FOUND",
  "message": "Attendance record not found"
}
```

### Delete Attendance Record
```
DELETE /attendance/:attendanceId
Authorization: Bearer {token}

Response 204 No Content

Response 400 Bad Request:
{
  "code": "CANNOT_DELETE",
  "message": "Cannot delete attendance older than 7 days"
}
```

---

## Analytics API

### Attendance Analytics
```
GET /analytics/attendance
Authorization: Bearer {token}

Query Parameters:
  ?batchId=batch1
  ?month=3&year=2026
  ?granularity=day|week|month  (default: day)

Response 200:
{
  "batchId": "batch1",
  "period": {
    "month": 3,
    "year": 2026
  },
  "trends": [
    {
      "date": "2026-03-01",
      "present": 28,
      "absent": 1,
      "leave": 1,
      "totalEnrolled": 30,
      "attendanceRate": 93.33
    },
    {
      "date": "2026-03-02",
      "present": 27,
      "absent": 2,
      "leave": 1,
      "totalEnrolled": 30,
      "attendanceRate": 90.0
    }
  ],
  "monthSummary": {
    "averageAttendanceRate": 87.5,
    "highestDate": "2026-03-01",
    "lowestDate": "2026-03-10"
  }
}
```

### Student Performance
```
GET /analytics/student/:studentId
Authorization: Bearer {token}

Query Parameters:
  ?month=3&year=2026  // Optional

Response 200:
{
  "studentId": "s1",
  "name": "Arjun Sharma",
  "batches": [
    {
      "batchId": "batch1",
      "batchName": "Morning Batch",
      "enrolledDate": "2026-02-01T00:00:00Z",
      "totalAttendance": 45,
      "currentMonth": {
        "present": 18,
        "absent": 2,
        "leave": 0,
        "percentage": 90.0
      },
      "overallPercentage": 87.5
    }
  ]
}
```

---

## Error Codes Reference

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| FORBIDDEN | 403 | User doesn't have permission |
| NOT_FOUND | 404 | Resource doesn't exist |
| DUPLICATE_ENTRY | 409 | Unique constraint violation |
| VALIDATION_ERROR | 400 | Invalid input data |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

All endpoints are rate-limited:
- **Anonymous requests:** 10 req/minute
- **Authenticated requests:** 100 req/minute
- **Bulk operations:** 5 req/minute

Headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1646227200
```

---

## Pagination

All list endpoints support pagination:
```
Query Parameters:
  ?page=1          // Page number (1-based)
  ?limit=20        // Items per page (1-100, default: 20)

Response includes:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Sorting & Filtering

```
GET /batches?sort=-createdAt&search=morning

Sorting:
  sort=field       // Ascending
  sort=-field      // Descending

Filtering:
  search=term      // Fuzzy search
  status=active    // Enum filter
  dateFrom=YYYY-MM-DD  // Date range
  dateTo=YYYY-MM-DD
```

---

## CORS & Headers

**Allowed Origins:** `http://localhost:3000` (dev), `https://educore.com` (prod)

**CORS Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

---

## Testing with curl

### Create Batch
```bash
curl -X POST http://localhost:3001/api/v1/batches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Batch"}'
```

### Mark Attendance
```bash
curl -X POST http://localhost:3001/api/v1/attendance/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "batch1",
    "date": "2026-03-02",
    "records": [
      {"studentId": "s1", "status": "present"}
    ]
  }'
```

---

## WebSocket Events (Real-time Updates)

**Connection:** `ws://localhost:3001/socket.io`

### Subscribe to Batch Updates
```javascript
socket.emit('subscribe:batch', { batchId: 'batch1' })
socket.on('batch:updated', (data) => console.log('Batch updated:', data))
```

### Subscribe to Attendance Updates
```javascript
socket.emit('subscribe:attendance', { batchId: 'batch1', date: '2026-03-02' })
socket.on('attendance:marked', (data) => console.log('New attendance:', data))
```

---

## Changelog

### v1 (Current)
- Initial Batch API endpoints
- Basic Attendance marking
- Simple reporting

### v1.1 (Next)
- Bulk operations optimizations
- Advanced filtering
- Real-time WebSocket events
- Export to Excel functionality

### v2 (Planned)
- Analytics dashboard
- Mobile app API
- OAuth2 integration
- Parent notifications

---

**Last Updated:** 2026-03-02
**API Version:** 1.0.0
**Maintainer:** EduCore Dev Team
