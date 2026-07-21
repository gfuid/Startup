# 📂 Connecting Supabase (PostgreSQL) to ServiceHub Backend

This guide outlines the exact steps to migrate the backend from MongoDB (Mongoose) to PostgreSQL (Supabase) using **Prisma ORM**.

---

## 🛠️ Step 1: Install Prisma ORM in Backend
Run these commands in your backend directory terminal (`c:/Project/startup/backend`):

```bash
# 1. Install Prisma as dev dependency and client as main dependency
npm install prisma --save-dev
npm install @prisma/client

# 2. Initialize Prisma configurations
npx prisma init
```

*This command creates a new folder named `prisma` with a file named `schema.prisma`, and adds a `.env` template.*

---

## 🌐 Step 2: Configure Environment Variables
Open your `.env` file in the backend folder and add your Supabase PostgreSQL connection URL:

```env
# MongoDB config (you can keep it for fallback or comment it out)
# MONGO_URI=mongodb://127.0.0.1:27017/startupDB

# Supabase Connection URL (Replace with your actual password and reference id)
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```
*(Note: Pgbouncer port 6543 is recommended for connection pooling in serverless environments, direct port 5432 is for migrations)*.

---

## 📄 Step 3: Define the Database Schema
Replace the contents of `prisma/schema.prisma` with the relational mapping of our models:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-client-js"
}

enum Role {
  customer
  provider
  admin
}

enum BookingStatus {
  pending
  accepted
  in_progress
  completed
  cancelled
  rejected
}

enum PaymentStatus {
  pending
  paid
  failed
}

model User {
  id                 String    @id @default(uuid())
  name               String
  email              String    @unique
  phone              String    @unique
  password           String
  role               Role      @default(customer)
  isVerified         Boolean   @default(false)
  isActive           Boolean   @default(true)
  profileImage       String    @default("")
  expoPushToken      String    @default("")
  resetPasswordCode  String?
  resetPasswordExpire DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  // Customer Relationships
  customerBookings   Booking[] @relation("CustomerBookings")
  customerMessages   Message[]

  // Provider Details
  experience         String?
  isApproved         Boolean   @default(false)
  isOnline           Boolean   @default(false)
  rating             Float     @default(0.0)
  totalReviews       Int       @default(0)
  providerBookings   Booking[] @relation("ProviderBookings")
}

model Service {
  id          String    @id @default(uuid())
  name        String    @unique
  category    String
  description String
  price       Float
  unit        String    @default("visit")
  duration    String    @default("1-2 hours")
  includes    String[]
  image       String    @default("")
  rating      Float     @default(0.0)
  reviews     Int       @default(0)
  isActive    Boolean   @default(true)
  featured    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  bookings    Booking[]
}

model Booking {
  id                 String        @id @default(uuid())
  customerId         String
  customer           User          @relation("CustomerBookings", fields: [customerId], references: [id])
  providerId         String
  provider           User          @relation("ProviderBookings", fields: [providerId], references: [id])
  serviceId          String
  service            Service       @relation(fields: [serviceId], references: [id])
  customerName       String        @default("")
  customerPhone      String        @default("")
  status             BookingStatus @default(pending)
  scheduledDate      DateTime
  scheduledTime      String
  fullAddress        String
  street             String        @default("")
  city               String        @default("")
  pincode            String        @default("")
  latitude           Float?
  longitude          Float?
  notes              String        @default("")
  totalAmount        Float
  paymentMethod      String        @default("cash")
  paymentStatus      PaymentStatus @default(pending)
  rating             Int?
  review             String?
  cancellationReason String        @default("")
  
  // Payment Details
  orderId            String?
  paymentId          String?
  paymentVerifiedAt  DateTime?

  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  messages           Message[]
}

model Message {
  id        String   @id @default(uuid())
  bookingId String
  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  senderId  String
  sender    User     @relation(fields: [senderId], references: [id])
  text      String
  createdAt DateTime @default(now())
}
```

---

## 🚀 Step 4: Run Initial DB Migration
Deploy the tables directly to your Supabase cloud PostgreSQL:

```bash
npx prisma migrate dev --name init
```
*This will connect to Supabase, create the tables matching our schema, and generate the Prisma Client types automatically.*

---

## 🔌 Step 5: Initialize Prisma Client in Code
Create a single database connection file. Replace the code in `config/db.js` with:

```javascript
// backend/config/db.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['error', 'warn']
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Supabase PostgreSQL Connected via Prisma');
    } catch (error) {
        console.error('❌ Database Connection Error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
global.prisma = prisma; // Expose globally for easy controllers access
```

---

## ⚡ Step 6: Code Query Modifications
Once the database is switched, MongoDB Mongoose commands will be swapped out for Prisma commands inside controllers. Here are the core patterns:

| Operation | MongoDB (Mongoose) | PostgreSQL (Prisma) |
| :--- | :--- | :--- |
| **Find All** | `User.find()` | `prisma.user.findMany()` |
| **Find by ID** | `User.findById(id)` | `prisma.user.findUnique({ where: { id } })` |
| **Create** | `User.create(data)` | `prisma.user.create({ data })` |
| **Update** | `User.findByIdAndUpdate(id, data)` | `prisma.user.update({ where: { id }, data })` |
| **Delete** | `User.findByIdAndDelete(id)` | `prisma.user.delete({ where: { id } })` |
