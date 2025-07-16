# Sistem Manajemen Ternak

Sistem manajemen ternak modern dengan fitur QR code untuk tracking kambing, kandang, dan vaksinasi menggunakan PostgreSQL.

## Fitur Utama

- **Manajemen Kambing**: CRUD kambing dengan QR code generation
- **Manajemen Kandang**: Tracking keluar masuk kambing dengan QR scanning
- **Manajemen Vaksin**: Katalog vaksin dan proses vaksinasi
- **Vaksinasi**: Scan QR kambing untuk mencatat vaksinasi
- **History**: Riwayat pergerakan kambing
- **User Management**: Role-based access (User/Admin)

## Teknologi

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL
- **QR Code**: qrcode + html5-qrcode
- **Authentication**: JWT

## Setup

### 1. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL
# Create database
createdb livestock_db

# Run database initialization
psql -d livestock_db -f database/init.sql
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=livestock_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret

# Start backend server
npm run dev
```

### 3. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Start frontend development server
npm run dev
```

## Database Schema

Database menggunakan PostgreSQL dengan tabel:
- `users` - User management dengan role
- `kambing` - Data kambing
- `kandang` - Data kandang
- `vaksin` - Katalog vaksin
- `vaksinisasi` - Record vaksinasi
- `gate_kandang` - Tracking keluar masuk kandang

## Login Demo

- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Kambing
- `GET /api/kambing` - Get all kambing
- `POST /api/kambing` - Create kambing
- `PUT /api/kambing/:id` - Update kambing
- `DELETE /api/kambing/:id` - Delete kambing

### Kandang
- `GET /api/kandang` - Get all kandang
- `POST /api/kandang` - Create kandang
- `POST /api/kandang/:id/gate` - Record gate entry/exit

### Vaksin
- `GET /api/vaksin` - Get all vaksin
- `POST /api/vaksin` - Create vaksin

### Vaksinisasi
- `GET /api/vaksinisasi` - Get all vaksinisasi
- `POST /api/vaksinisasi` - Create vaksinisasi

### History
- `GET /api/history/gate` - Get gate history
- `GET /api/history/stats` - Get statistics

## Cara Penggunaan

### 1. Manajemen Kambing
- Tambah data kambing baru
- Generate dan download QR code untuk setiap kambing
- Edit/hapus data kambing

### 2. Vaksinasi
- Scan QR code kambing
- Pilih vaksin dan dosis
- Sistem otomatis mencatat vaksinasi

### 3. Kandang
- Scan QR code kambing di kandang
- Sistem otomatis detect status masuk/keluar
- Tracking real-time pergerakan kambing

### 4. History
- Lihat riwayat semua pergerakan kambing
- Filter berdasarkan status dan pencarian
- Statistik aktivitas

## Development

```bash
# Backend development
cd server
npm run dev

# Frontend development
npm run dev

# Build for production
npm run build
```

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection protection with parameterized queries