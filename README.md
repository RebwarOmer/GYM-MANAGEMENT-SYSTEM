# Gym Management System

## Overview

Gym Management System is a full-stack web application designed to simplify gym administration and member management. The system is managed by a single administrator who has full control over all operations through a centralized dashboard.

The application provides tools for managing members, handling membership subscriptions, monitoring activity, and maintaining gym records efficiently.

## Features

### Authentication

* Secure administrator login
* Protected routes and API endpoints
* Authentication and authorization for administrative access

### Member Management

The administrator can:

* Add new members
* Update member information
* Delete members
* Pause memberships
* View member details
* Manage member records

### Membership Offers

The system supports multiple membership plans:

* 1 Month Membership
* 3 Months Membership
* 6 Months Membership

Administrators can assign and manage memberships based on the selected offer.

### Dashboard

The dashboard provides a centralized overview of gym operations, including:

* Total number of members
* Active memberships
* Paused memberships
* Membership statistics
* General gym activity information

### Logging System

The application includes a logging mechanism that records important system events and administrative actions for monitoring and troubleshooting purposes.

## Technology Stack

### Frontend

* React
* JavaScript
* HTML
* CSS

### Backend

* Spring Boot
* Java
* REST API

### Database

* Relational Database Management System

## Project Structure

```text
GYM-MANAGEMENT-SYSTEM/
├── frontend/
├── backend/
├── target/
└── README.md
```

## Installation

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## System Roles

### Administrator

The system contains a single role:

* Administrator

The administrator has full access to all system features, including authentication, member management, membership management, dashboard access, and activity monitoring.

## Future Improvements

* Attendance tracking
* Payment management
* Membership renewal reminders
* Trainer management
* Reporting and analytics
* QR code member check-in

## License

This project is intended for educational and learning purposes.
