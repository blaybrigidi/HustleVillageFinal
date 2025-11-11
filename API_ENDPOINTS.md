# HustleVillage API Endpoints Reference

## Base URL
```
http://localhost:3000
```

## API Base URL
```
http://localhost:3000/api
```

---

## 🏥 Health & Status

### Check Server Health
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

### Server Welcome
```http
GET /
```

**Response:**
```json
{
  "message": "Welcome to HustleVillage API",
  "status": "Server is running"
}
```

---

## 🔐 Authentication (`/api/auth`)

### Request Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@ashesi.edu.gh",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+233123456789",
  "userType": "hustler"
}
```

**Response:**
```json
{
  "message": "Verification code sent to email",
  "userId": "uuid"
}
```

### Verify Signup
```http
POST /api/auth/verify
Content-Type: application/json

{
  "email": "user@ashesi.edu.gh",
  "verificationCode": "123456"
}
```

**Response:**
```json
{
  "message": "Account verified successfully",
  "user": {
    "id": "uuid",
    "email": "user@ashesi.edu.gh",
    "full_name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

---

## 🛍️ Buyer Endpoints (`/api/buyer`)

### View All Services
```http
GET /api/buyer/services
```

**Response:**
```json
{
  "services": [
    {
      "id": "uuid",
      "title": "Service Title",
      "description": "Service Description",
      "price": 50,
      "category": "category_name",
      "hustler": {
        "id": "uuid",
        "name": "Hustler Name"
      }
    }
  ]
}
```

---

## 💼 Hustler Endpoints (`/api/hustler`)

**Note:** All hustler endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Get My Services
```http
GET /api/hustler/services
Authorization: Bearer <token>
```

**Response:**
```json
{
  "services": [
    {
      "id": "uuid",
      "title": "My Service",
      "description": "Description",
      "price": 50,
      "status": "active"
    }
  ]
}
```

### Create Service
```http
POST /api/hustler/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Service Title",
  "description": "Service Description",
  "price": 50,
  "category": "category_name",
  "images": ["url1", "url2"]
}
```

**Response:**
```json
{
  "message": "Service created successfully",
  "service": {
    "id": "uuid",
    "title": "Service Title",
    "status": "pending_approval"
  }
}
```

### Update Service
```http
PUT /api/hustler/services/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 60
}
```

**Response:**
```json
{
  "message": "Service updated successfully",
  "service": {
    "id": "uuid",
    "title": "Updated Title"
  }
}
```

### Toggle Service Status (Pause/Unpause)
```http
PATCH /api/hustler/services/:id/toggle
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Service status updated",
  "service": {
    "id": "uuid",
    "status": "paused"
  }
}
```

### Request Service Deletion
```http
POST /api/hustler/services/:id/request-delete
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Deletion request submitted",
  "service": {
    "id": "uuid",
    "status": "pending_deletion"
  }
}
```

---

## 👑 Admin Endpoints (`/api/admin`)

**Note:** Requires admin authentication.

### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

### Get All Services
```http
GET /api/admin/services
Authorization: Bearer <admin_token>
```

### Approve Service
```http
PATCH /api/admin/services/:id/approve
Authorization: Bearer <admin_token>
```

### Reject Service
```http
PATCH /api/admin/services/:id/reject
Authorization: Bearer <admin_token>
```

---

## 🧪 Testing with cURL

### Test Backend Health
```bash
curl http://localhost:3000/health
```

### Test Get Services
```bash
curl http://localhost:3000/api/buyer/services
```

### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ashesi.edu.gh",
    "firstName": "Test",
    "lastName": "User",
    "userType": "hustler"
  }'
```

---

## 🧪 Testing with JavaScript (Browser Console)

### Test API Connection
```javascript
// Test health endpoint
fetch('http://localhost:3000/health')
  .then(res => res.json())
  .then(data => console.log('Health:', data))
  .catch(err => console.error('Error:', err));

// Test get services
fetch('http://localhost:3000/api/buyer/services')
  .then(res => res.json())
  .then(data => console.log('Services:', data))
  .catch(err => console.error('Error:', err));

// Test signup
fetch('http://localhost:3000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@ashesi.edu.gh',
    firstName: 'Test',
    lastName: 'User',
    userType: 'hustler'
  })
})
  .then(res => res.json())
  .then(data => console.log('Signup:', data))
  .catch(err => console.error('Error:', err));
```

---

## 🔒 Authentication Flow

1. **Signup Request** → `POST /api/auth/signup`
2. **Email Verification** → User receives OTP via email
3. **Verify Signup** → `POST /api/auth/verify`
4. **Receive JWT Token** → Use in subsequent requests
5. **Authenticated Requests** → Include token in `Authorization: Bearer <token>`

---

## 📝 Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message here",
  "details": "Additional details if available"
}
```

---

## 🛠️ Using the API in Frontend

With the new `api.ts` helper:

```typescript
import api from '@/lib/api';

// Get all services
const services = await api.buyer.getServices();

// Create a service (requires auth)
const newService = await api.hustler.createService({
  title: 'My Service',
  description: 'Description',
  price: 50,
  category: 'technology'
});

// Check health
const health = await api.health();
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

For more detailed information, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

