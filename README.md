# Learning Management System (LMS) - MERN Stack

## Project Overview
A Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js) for administrators and students to manage and access online course materials.

## Features

### User Roles

#### Admin
- Manage students and courses  
- Upload and organize lesson recordings  
- Create and manage course content  

#### Student
- View and watch lesson recordings  
- Access course materials  
- Download lesson notes/materials  

### Lessons & Recordings
- Upload video recordings (MP4, WebM) or embed YouTube links  
- Organize lessons into courses and modules  
- Support multiple recordings per course/module  
- Option to lock next lesson until previous video is watched  

### Authentication & Security
- Role-based user registration & login  
- Password reset via email  
- Secure video streaming  

## Technology Stack
- **Frontend**: React.js  
- **Backend**: Node.js with Express.js  
- **Database**: MongoDB  
- **Authentication**: JWT  

## Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
