# Teacher Evaluation System - Flowchart Prompt

## Project Overview
Create a comprehensive flowchart for a **Teacher Evaluation System (TBI - Teacher-Backed Initiative)** - a web application that allows students to evaluate their teachers.

## Technology Stack
- **Backend**: Django REST Framework with PostgreSQL
- **Frontend**: React.js with React Router
- **Authentication**: Firebase (Frontend) + Django REST (Backend)
- **Database**: Django ORM with multiple models (Student, Teacher, Evaluation, EvaluationAnswer, EvaluationPeriod)

---

## User Roles & Flows

### 1. **Student User Flow**
```
Landing Page → Login/Signup → Dashboard (Teacher List) → Select Teacher → Evaluation Form → Submit → Confirmation
```

- **Entry Points**: Landing page, Student login
- **Authentication**: Firebase Auth for login, Django backend for validation
- **Core Actions**: 
  - View list of teachers
  - Select a teacher to evaluate
  - Fill out evaluation form (rating 1-5, comments)
  - Submit evaluation

### 2. **Admin User Flow**
```
Django Admin Login → Manage Students → Manage Teachers → View Evaluations → Generate Reports
```

- **Entry Point**: Django Admin panel (/admin)
- **Core Actions**:
  - CRUD operations on Students, Teachers
  - View all evaluations
  - Manage evaluation periods/semesters

---

## Key Entities/Components

### Database Models (from Django models.py)

1. **Student** (AbstractBaseUser)
   - Fields: email, student_id, first_name, last_name, middle_name, contact_number, year_level (1-4), program, is_active, created_at, preferred_language

2. **Teacher**
   - Fields: employee_id, full_name, first_name, last_name, middle_name, email, position (Instructor to Dean), employment_status, department, subjects_taught, degree

3. **Evaluation**
   - Fields: student (FK), teacher (FK), rating (1-5), comments, is_anonymous, created_at

4. **EvaluationAnswer**
   - Fields: evaluation (FK), question_text, answer_value, answered_at

5. **EvaluationPeriod**
   - Fields: name, start_date, end_date, is_active, created_at

---

## API Endpoints (from views.py)

1. `POST /api/students/login/` - Student authentication
2. `GET /api/teachers/` - List all teachers
3. `GET /api/teachers/<id>/` - Get teacher details
4. `POST /api/evaluations/create/` - Submit new evaluation
5. `GET /api/evaluations/<teacher_id>/` - Get evaluations for a teacher

---

## Frontend Pages (from App.js)

1. **Landing** (`/`) - Public landing page
2. **Login** (`/login`) - Student login page
3. **Signup** (`/signup`) - Student registration
4. **Dashboard** (`/dashboard`) - Teacher list view
5. **TeacherList** (`/teachers`) - All teachers listing
6. **Evaluation** (`/evaluate/:teacherId`) - Evaluation form
7. **StudentLogin** (`/student-login`) - Alternative login

---

## Flowchart Requirements

### Create a flowchart showing:

1. **Main User Flow** (Student Perspective)
   - User visits landing page
   - Option to login/signup
   - After authentication → Dashboard with teacher list
   - Select teacher → Evaluation form
   - Submit → Success message → Return to dashboard

2. **Authentication Flow**
   - Firebase authentication for students
   - Student ID lookup in Firestore
   - Email/password validation
   - Session management

3. **Evaluation Submission Flow**
   - Select teacher from list
   - Load evaluation form
   - Fill rating (1-5 scale)
   - Add optional comments
   - Submit to Django API
   - Backend validation
   - Save to database
   - Return success response

4. **Admin Flow** (Optional - secondary)
   - Django admin access
   - CRUD operations on entities
   - View reports

---

## Visual Style Requirements
- Use standard flowchart symbols:
  - Rectangles: Process steps
  - Diamonds: Decision points
  - Ovals: Start/End points
  - Arrows: Flow direction
- Color coding by user role (Student: Blue, Admin: Red, System: Gray)
- Include API calls as distinct steps
- Show both frontend and backend interactions

---

## Output Format
