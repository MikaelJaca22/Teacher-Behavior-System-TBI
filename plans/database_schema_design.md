# Teacher Evaluation System - Comprehensive Database Schema Design

## Document Information
- **Version**: 1.0
- **Date**: 2026-02-12
- **Status**: Design Specification (Planning Phase)
- **Technology Stack**: Django ORM, PostgreSQL

---

## 1. Executive Summary

This document provides a comprehensive database schema design for an enhanced Teacher Evaluation System. The design extends the existing schema to support multiple evaluation types, reporting capabilities, and administrative features while maintaining backward compatibility and data integrity.

### Key Improvements
- Multi-type evaluations (student, peer, self, admin)
- Evaluation periods/semesters tracking
- Category-based question organization
- Individual response tracking for detailed analytics
- Pre-computed report snapshots
- Enhanced security and data isolation

---

## 2. Entity-Relationship Diagram Description

### 2.1 High-Level Entity Overview

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│     STUDENT     │       │     TEACHER      │       │    EVALUATOR    │
│  (Extended)     │       │  (Enhanced)      │       │  (New Entity)   │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ - id (PK)       │       │ - id (PK)        │       │ - id (PK)       │
│ - email (UQ)     │       │ - full_name      │       │ - email (UQ)    │
│ - student_id     │       │ - subject        │       │ - role          │
│ - first_name    │       │ - department     │       │ - permissions   │
│ - last_name     │       │ - email          │       │ - is_active     │
│ - is_active     │       │ - created_at     │       │ - created_at    │
│ - is_staff      │       │ - is_active      │       └────────┬────────┘
└────────┬────────┘       └────────┬────────┘                │
         │                         │                         │
         │                         │                         │
         │    ┌────────────────────┼────────────────────┐   │
         │    │                    │                    │   │
         ▼    ▼                    ▼                    ▼   │
    ┌─────────────────────────────────────────────────────┐  │
    │                   EVALUATION                        │  │
    │                   (Enhanced)                        │  │
    ├─────────────────────────────────────────────────────┤  │
    │ - id (PK)                                           │  │
    │ - evaluation_period_id (FK)                         │  │
    │ - evaluator_id (FK, nullable)                      │──┘
    │ - teacher_id (FK)                                   │
    │ - evaluation_type                                   │
    │ - status                                            │
    │ - submitted_at                                      │
    └────────────────────┬────────────────────────────────┘
                         │
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────────┐  ┌─────────────────┐
    │EVALUATION│  │EVALUATION   │  │EVALUATION       │
    │RESPONSE  │  │PERIOD       │  │REPORT           │
    │(New)     │  │(New)        │  │(New)            │
    ├──────────┤  ├──────────────┤  ├─────────────────┤
    │- id      │  │- id          │  │- id             │
    │- eval_id │  │- name        │  │- eval_period_id │
    │- quest_id│  │- start_date  │  │- teacher_id     │
    │- rating  │  │- end_date    │  │- report_type    │
    │- comment │  │- status      │  │- data_snapshot  │
    └──────────┘  │- is_active   │  │- generated_at   │
                 └──────────────┘  └─────────────────┘
                         │
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────────┐  ┌─────────────────┐
    │EVALUATION│  │EVALUATION    │  │                 │
    │CATEGORY  │  │QUESTION      │  │                 │
    │(New)     │  │(New)         │  │                 │
    ├──────────┤  ├──────────────┤  │                 │
    │- id      │  │- id          │  │                 │
    │- name    │  │- category_id │  │                 │
    │- descr   │  │- text        │  │                 │
    │- weight  │  │- order       │  │                 │
    │- order   │  │- is_required │  │                 │
    └──────────┘  └──────────────┘  │                 │
                                    │                 │
                                    └─────────────────┘
```

### 2.2 Relationship Cardinalities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RELATIONSHIP MATRIX                               │
├────────────────┬───────────────┬───────────────┬───────────────────────────┤
│ Entity A       │ Relationship  │ Entity B      │ Cardinality               │
├────────────────┼───────────────┼───────────────┼───────────────────────────┤
│ Student        │ submits       │ Evaluation    │ 0..N Student → 0..N Eval │
│ Teacher        │ receives       │ Evaluation    │ 0..N Teacher → 0..N Eval │
│ Evaluator      │ creates       │ Evaluation    │ 0..N Eval → 0..1 Evaluator│
│ EvaluationPeriod│ contains    │ Evaluation    │ 0..N Period → 0..N Eval   │
│ EvaluationCategory│ contains   │ Question      │ 0..N Category → 0..N Quest│
│ Evaluation     │ has responses │ Response      │ 0..N Eval → 0..N Response │
│ Evaluation     │ generates     │ Report        │ 0..N Eval → 0..1 Report   │
│ EvaluationPeriod│ has categories│ Category     │ 0..N Period → 0..N Cat    │
└────────────────┴───────────────┴───────────────┴───────────────────────────┘
```

### 2.3 Evaluation Type Hierarchy

```
EVALUATION TYPE TAXONOMY
═══════════════════════════════════════════════════════════════════════════════

                          Evaluation (Base)
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │ STUDENT  │  │   PEER    │  │   SELF   │
              │Evaluation │  │Evaluation │  │Evaluation│
              └──────────┘  └──────────┘  └──────────┘
                    │
                    │         ┌─────────────────┐
                    │         │    Features     │
                    │         ├─────────────────┤
                    │         │ - Anonymous     │
                    │         │ - Required     │
                    │         │ - Numerical    │
                    │         │   Ratings      │
                    │         │ - Text Comments│
                    │         └─────────────────┘
                    │
                    ▼
              ┌──────────┐
              │  ADMIN   │
              │Evaluation│
              └──────────┘
                    │
                    │         ┌─────────────────┐
                    │         │    Features     │
                    │         ├─────────────────┤
                    │         │ - Identified    │
                    │         │ - Administrative│
                    │         │ - Detailed     │
                    │         │   Metrics      │
                    │         └─────────────────┘
```

---

## 3. Complete Model Definitions

### 3.1 Student Model (Existing - Enhanced)

```python
class Student(AbstractBaseUser, PermissionsMixin):
    """Extended student model with enhanced profile information"""
    
    # Authentication Fields
    email = models.EmailField(
        unique=True,
        max_length=254,
        db_index=True,
        verbose_name="email address"
    )
    student_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        verbose_name="student identification number"
    )
    
    # Profile Fields
    first_name = models.CharField(max_length=150, blank=True, default="")
    last_name = models.CharField(max_length=150, blank=True, default="")
    middle_name = models.CharField(max_length=150, blank=True, default="")
    contact_number = models.CharField(max_length=20, blank=True, default="")
    year_level = models.PositiveIntegerField(
        null=True,
        blank=True,
        choices=[
            (1, 'First Year'),
            (2, 'Second Year'),
            (3, 'Third Year'),
            (4, 'Fourth Year'),
        ]
    )
    program = models.CharField(max_length=255, blank=True, default="")
    
    # Status Fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Preferences
    preferred_language = models.CharField(
        max_length=10,
        default='en',
        choices=[('en', 'English'), ('tl', 'Tagalog')]
    )
    receive_notifications = models.BooleanField(default=True)
    
    objects = StudentManager()
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["student_id"]
    
    class Meta:
        db_table = "students"
        verbose_name = "Student"
        verbose_name_plural = "Students"
        indexes = [
            models.Index(fields=['email'], name='idx_student_email'),
            models.Index(fields=['student_id'], name='idx_student_id'),
            models.Index(fields=['is_active'], name='idx_student_active'),
            models.Index(fields=['created_at'], name='idx_student_created'),
        ]
    
    def __str__(self):
        return f"{self.student_id} - {self.email}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.middle_name or ''} {self.last_name}".strip()
```

### 3.2 Teacher Model (Existing - Enhanced)

```python
class Teacher(models.Model):
    """Enhanced teacher model with professional details"""
    
    # Personal Information
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        verbose_name="employee identification number"
    )
    full_name = models.CharField(max_length=255, db_index=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    middle_name = models.CharField(max_length=150, blank=True, default="")
    
    # Contact Information
    email = models.EmailField(blank=True, default="")
    alternate_email = models.EmailField(blank=True, default="")
    contact_number = models.CharField(max_length=20, blank=True, default="")
    
    # Professional Information
    subject = models.CharField(max_length=255, db_index=True)
    department = models.CharField(max_length=255, db_index=True)
    position = models.CharField(
        max_length=100,
        default="Faculty",
        choices=[
            ('Instructor', 'Instructor'),
            ('Assistant Professor', 'Assistant Professor'),
            ('Associate Professor', 'Associate Professor'),
            ('Professor', 'Professor'),
            ('Department Head', 'Department Head'),
            ('Dean', 'Dean'),
        ]
    )
    highest_degree = models.CharField(
        max_length=50,
        blank=True,
        default="",
        choices=[
            ('', 'Not Specified'),
            ('Bachelor', 'Bachelor'),
            ('Master', 'Master'),
            ('Doctorate', 'Doctorate'),
            ('Post-Doctorate', 'Post-Doctorate'),
        ]
    )
    specializations = models.JSONField(
        default=list,
        blank=True,
        help_text="List of subject specializations"
    )
    
    # Status and Employment
    employment_status = models.CharField(
        max_length=20,
        default="full-time",
        choices=[
            ('full-time', 'Full-Time'),
            ('part-time', 'Part-Time'),
            ('contractual', 'Contractual'),
            ('adjunct', 'Adjunct'),
            ('on-leave', 'On Leave'),
        ]
    )
    is_active = models.BooleanField(default=True, db_index=True)
    hire_date = models.DateField(null=True, blank=True)
    termination_date = models.DateField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "teachers"
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"
        indexes = [
            models.Index(fields=['email'], name='idx_teacher_email'),
            models.Index(fields=['department'], name='idx_teacher_dept'),
            models.Index(fields=['subject'], name='idx_teacher_subject'),
            models.Index(fields=['is_active'], name='idx_teacher_active'),
            models.Index(fields=['full_name'], name='idx_teacher_name'),
            models.Index(fields=['created_at'], name='idx_teacher_created'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['email'],
                name='uq_teacher_email'
            ),
        ]
    
    def __str__(self):
        return f"{self.full_name} - {self.subject}"
    
    @property
    def full_name_reversed(self):
        return f"{self.last_name}, {self.first_name} {self.middle_name or ''}"
```

### 3.3 Evaluator Model (New)

```python
class Evaluator(models.Model):
    """Administrator model for managing evaluations and viewing reports"""
    
    ROLE_CHOICES = [
        ('admin', 'System Administrator'),
        ('department_head', 'Department Head'),
        ('evaluations_manager', 'Evaluations Manager'),
        ('report_viewer', 'Report Viewer'),
    ]
    
    # Authentication (linked to User system)
    user_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Link to Django auth User model"
    )
    email = models.EmailField(
        unique=True,
        max_length=254,
        db_index=True
    )
    
    # Profile Information
    full_name = models.CharField(max_length=255)
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True
    )
    department = models.CharField(max_length=255)
    position = models.CharField(max_length=100)
    
    # Role and Permissions
    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES,
        default='report_viewer'
    )
    permissions = models.JSONField(
        default=dict,
        blank=True,
        help_text="Granular permissions configuration"
    )
    
    # Scoped Access (for department heads)
    department_access = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Restrict access to specific departments"
    )
    
    # Status
    is_active = models.BooleanField(default=True, db_index=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    
    class Meta:
        db_table = "evaluators"
        verbose_name = "Evaluator"
        verbose_name_plural = "Evaluators"
        indexes = [
            models.Index(fields=['email'], name='idx_evaluator_email'),
            models.Index(fields=['role'], name='idx_evaluator_role'),
            models.Index(fields=['department'], name='idx_evaluator_dept'),
            models.Index(fields=['is_active'], name='idx_evaluator_active'),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"
    
    def has_permission(self, permission):
        """Check if evaluator has specific permission"""
        if self.role == 'admin':
            return True
        return self.permissions.get(permission, False)
```

### 3.4 EvaluationPeriod Model (New)

```python
class EvaluationPeriod(models.Model):
    """Tracks different evaluation periods (semesters)"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('archived', 'Archived'),
    ]
    
    TYPE_CHOICES = [
        ('midterm', 'Midterm Evaluation'),
        ('final', 'Final Evaluation'),
        ('annual', 'Annual Review'),
        ('special', 'Special Evaluation'),
    ]
    
    # Identification
    name = models.CharField(
        max_length=100,
        db_index=True,
        help_text="e.g., 'Fall 2024', 'Spring 2025'"
    )
    academic_year = models.CharField(
        max_length=10,
        db_index=True,
        help_text="e.g., '2024-2025'"
    )
    semester = models.CharField(
        max_length=20,
        choices=[
            ('first', 'First Semester'),
            ('second', 'Second Semester'),
            ('summer', 'Summer Term'),
            ('trimester', 'Trimester'),
        ]
    )
    evaluation_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='final'
    )
    
    # Scheduling
    start_date = models.DateTimeField(db_index=True)
    end_date = models.DateTimeField(db_index=True)
    extension_date = models.DateTimeField(null=True, blank=True)
    
    # Status and Configuration
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True
    )
    is_active = models.BooleanField(default=True, db_index=True)
    
    # Settings
    allow_late_submissions = models.BooleanField(default=False)
    require_comments = models.BooleanField(default=False)
    minimum_responses_required = models.PositiveIntegerField(
        default=0,
        help_text="Minimum responses before report generation"
    )
    
    # Visibility Settings
    results_visible_to_teachers = models.BooleanField(default=False)
    results_visible_to_students = models.BooleanField(default=False)
    results_visibility_date = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        Evaluator,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    
    # Description and Notes
    description = models.TextField(blank=True, default="")
    notes = models.TextField(blank=True, default="")
    
    class Meta:
        db_table = "evaluation_periods"
        verbose_name = "Evaluation Period"
        verbose_name_plural = "Evaluation Periods"
        indexes = [
            models.Index(fields=['name'], name='idx_period_name'),
            models.Index(fields=['academic_year'], name='idx_period_year'),
            models.Index(fields=['status'], name='idx_period_status'),
            models.Index(fields=['start_date', 'end_date'], name='idx_period_dates'),
            models.Index(fields=['is_active'], name='idx_period_active'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__gt=models.F('start_date')),
                name='check_period_dates_valid'
            ),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_semester_display()} {self.academic_year})"
    
    @property
    def is_current(self):
        """Check if period is currently active"""
        from django.utils import timezone
        now = timezone.now()
        return (
            self.status == 'active' and
            self.start_date <= now <= (self.end_date or now)
        )
```

### 3.5 EvaluationCategory Model (New)

```python
class EvaluationCategory(models.Model):
    """Categories for organizing evaluation questions"""
    
    # Category Definition
    name = models.CharField(
        max_length=100,
        db_index=True,
        help_text="e.g., 'Teaching Methodology'"
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text="Short code for identification"
    )
    description = models.TextField(blank=True, default="")
    
    # Weight and Order
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.00,
        help_text="Weight factor for category scoring"
    )
    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Order of display in evaluation form"
    )
    
    # Status
    is_active = models.BooleanField(default=True, db_index=True)
    is_required = models.BooleanField(
        default=True,
        help_text="Category must have responses"
    )
    
    # Period Association (optional - can be null for global categories)
    evaluation_period = models.ForeignKey(
        EvaluationPeriod,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "evaluation_categories"
        verbose_name = "Evaluation Category"
        verbose_name_plural = "Evaluation Categories"
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['code'], name='idx_category_code'),
            models.Index(fields=['is_active'], name='idx_category_active'),
            models.Index(fields=['display_order'], name='idx_category_order'),
        ]
    
    def __str__(self):
        return f"{self.name} (Weight: {self.weight})"
```

### 3.6 EvaluationQuestion Model (New)

```python
class EvaluationQuestion(models.Model):
    """Individual questions linked to categories"""
    
    QUESTION_TYPE_CHOICES = [
        ('rating', 'Rating Scale (1-5)'),
        ('rating_10', 'Rating Scale (1-10)'),
        ('boolean', 'Yes/No'),
        ('text', 'Short Text'),
        ('textarea', 'Long Text'),
        ('multiple_choice', 'Multiple Choice'),
    ]
    
    RATING_SCALE_CHOICES = [
        ('1-5', '1-5 Scale'),
        ('1-10', '1-10 Scale'),
        ('1-7', '1-7 Scale'),
    ]
    
    # Question Content
    question_number = models.PositiveIntegerField(
        default=1,
        help_text="Question number for ordering"
    )
    category = models.ForeignKey(
        EvaluationCategory,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    
    question_text = models.TextField(
        help_text="The actual question to be displayed"
    )
    question_text_localized = models.JSONField(
        default=dict,
        blank=True,
        help_text="Localized versions of question text"
    )
    help_text = models.TextField(
        blank=True,
        default="",
        help_text="Additional guidance for respondents"
    )
    
    # Question Configuration
    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPE_CHOICES,
        default='rating'
    )
    rating_scale = models.CharField(
        max_length=10,
        choices=RATING_SCALE_CHOICES,
        default='1-5'
    )
    min_rating = models.PositiveIntegerField(default=1)
    max_rating = models.PositiveIntegerField(default=5)
    
    # Constraints
    is_required = models.BooleanField(default=True, db_index=True)
    allow_na = models.BooleanField(
        default=False,
        help_text="Allow Not Applicable option"
    )
    max_length = models PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Max character length for text responses"
    )
    choices = models.JSONField(
        null=True,
        blank=True,
        help_text="Options for multiple choice questions"
    )
    
    # Scoring
    positive_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.0,
        help_text="Weight for positive responses"
    )
    reverse_scored = models.BooleanField(
        default=False,
        help_text="Reverse scoring (high score = negative)"
    )
    
    # Visibility and Status
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    version = models.PositiveIntegerField(default=1)
    
    class Meta:
        db_table = "evaluation_questions"
        verbose_name = "Evaluation Question"
        verbose_name_plural = "Evaluation Questions"
        ordering = ['category', 'display_order']
        indexes = [
            models.Index(fields=['category'], name='idx_question_category'),
            models.Index(fields=['is_active'], name='idx_question_active'),
            models.Index(fields=['question_number'], name='idx_question_number'),
            models.Index(fields=['display_order'], name='idx_question_order'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['category', 'question_number'],
                name='uq_category_question_number'
            ),
        ]
    
    def __str__(self):
        return f"Q{self.question_number}: {self.question_text[:50]}..."
    
    @property
    def scale_range(self):
        """Return scale range as tuple"""
        return (self.min_rating, self.max_rating)
```

### 3.7 Enhanced Evaluation Model

```python
class Evaluation(models.Model):
    """Enhanced evaluation model with comprehensive tracking"""
    
    EVALUATION_TYPE_CHOICES = [
        ('student', 'Student Evaluation'),
        ('peer', 'Peer Evaluation'),
        ('self', 'Self Evaluation'),
        ('admin', 'Administrative Review'),
        ('supervisor', 'Supervisor Review'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('verified', 'Verified'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    # Primary Relationships
    evaluation_period = models.ForeignKey(
        EvaluationPeriod,
        on_delete=models.PROTECT,
        related_name='evaluations',
        db_index=True
    )
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name='evaluations',
        db_index=True
    )
    
    # Evaluator Information
    evaluator_type = models.CharField(
        max_length=20,
        choices=EVALUATION_TYPE_CHOICES,
        default='student',
        db_index=True
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='evaluations',
        db_index=True
    )
    evaluator = models.ForeignKey(
        Evaluator,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='evaluations',
        db_index=True
    )
    
    # For non-student evaluations
    evaluator_name = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Name for non-student evaluators"
    )
    evaluator_email = models.EmailField(
        blank=True,
        default="",
        help_text="Email for non-student evaluators"
    )
    
    # Status and Progress
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True
    )
    progress_percentage = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Timing
    started_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # IP and Device Tracking (for integrity)
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True
    )
    user_agent = models.TextField(blank=True, default="")
    device_id = models.CharField(max_length=100, blank=True, default="")
    
    # Anonymity Settings
    is_anonymous = models.BooleanField(default=True)
    show_respondent_in_report = models.BooleanField(default=False)
    
    # Overall Assessment
    overall_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        db_index=True,
        help_text="Calculated overall rating (1-5)"
    )
    summary_comment = models.TextField(blank=True, default="")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "evaluations"
        verbose_name = "Evaluation"
        verbose_name_plural = "Evaluations"
        indexes = [
            models.Index(fields=['evaluation_period'], name='idx_eval_period'),
            models.Index(fields=['teacher'], name='idx_eval_teacher'),
            models.Index(fields=['evaluator_type'], name='idx_eval_type'),
            models.Index(fields=['status'], name='idx_eval_status'),
            models.Index(fields=['submitted_at'], name='idx_eval_submitted'),
            models.Index(fields=['overall_rating'], name='idx_eval_rating'),
            models.Index(fields=['created_at'], name='idx_eval_created'),
            models.Index(
                fields=['evaluation_period', 'teacher'],
                name='idx_eval_period_teacher'
            ),
            models.Index(
                fields=['evaluation_period', 'status'],
                name='idx_eval_period_status'
            ),
        ]
        constraints = [
            # Ensure unique evaluation per student/teacher/period
            models.UniqueConstraint(
                fields=['evaluation_period', 'teacher', 'student'],
                condition=models.Q(student__isnull=False),
                name='uq_student_evaluation_unique'
            ),
            models.CheckConstraint(
                check=models.Q(progress_percentage__gte=0) & 
                      models.Q(progress_percentage__lte=100),
                name='check_progress_valid'
            ),
        ]
    
    def __str__(self):
        evaluator = self.student or self.evaluator_name or "Anonymous"
        return f"Evaluation of {self.teacher} by {evaluator} ({self.evaluation_period.name})"
    
    def calculate_overall_rating(self):
        """Calculate overall rating from responses"""
        responses = self.responses.all()
        if not responses.exists():
            return None
        
        total_weighted_score = 0
        total_weight = 0
        
        for response in responses:
            if response.rating is not None:
                category_weight = response.question.category.weight
                total_weighted_score += response.rating * category_weight
                total_weight += category_weight
        
        if total_weight == 0:
            return None
        
        return round(total_weighted_score / total_weight, 2)
```

### 3.8 EvaluationResponse Model (New)

```python
class EvaluationResponse(models.Model):
    """Individual question responses with scores and optional comments"""
    
    # Primary Relationships
    evaluation = models.ForeignKey(
        Evaluation,
        on_delete=models.CASCADE,
        related_name='responses',
        db_index=True
    )
    question = models.ForeignKey(
        EvaluationQuestion,
        on_delete=models.PROTECT,
        related_name='responses',
        db_index=True
    )
    
    # Response Data
    rating = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        db_index=True,
        help_text="Numeric rating value"
    )
    text_response = models.TextField(blank=True, default="")
    boolean_response = models.BooleanField(null=True, blank=True)
    choice_response = models.CharField(max_length=100, blank=True, default="")
    
    # Not Applicable tracking
    is_na = models.BooleanField(
        default=False,
        help_text="Marked as Not Applicable"
    )
    na_reason = models.CharField(max_length=255, blank=True, default="")
    
    # Scoring (pre-computed for performance)
    weighted_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Pre-computed weighted score"
    )
    
    # Metadata
    responded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "evaluation_responses"
        verbose_name = "Evaluation Response"
        verbose_name_plural = "Evaluation Responses"
        indexes = [
            models.Index(fields=['evaluation'], name='idx_response_eval'),
            models.Index(fields=['question'], name='idx_response_question'),
            models.Index(fields=['rating'], name='idx_response_rating'),
            models.Index(fields=['is_na'], name='idx_response_na'),
            models.Index(
                fields=['evaluation', 'question'],
                name='idx_response_eval_question'
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['evaluation', 'question'],
                name='uq_evaluation_question_response'
            ),
            models.CheckConstraint(
                check=models.Q(rating__isnull=True) | 
                      models.Q(rating__gte=0),
                name='check_rating_non_negative'
            ),
        ]
    
    def __str__(self):
        return f"Response to {self.question.question_number}: {self.rating}"
    
    def save(self, *args, **kwargs):
        """Pre-compute weighted score on save"""
        if self.rating is not None:
            if self.question.reverse_scored:
                # Convert to reverse score
                max_scale = self.question.max_rating
                self.weighted_score = max_scale + 1 - float(self.rating)
            else:
                self.weighted_score = float(self.rating)
        super().save(*args, **kwargs)
```

### 3.9 EvaluationReport Model (New)

```python
class EvaluationReport(models.Model):
    """Pre-computed or stored report snapshots"""
    
    REPORT_TYPE_CHOICES = [
        ('teacher_summary', 'Teacher Summary Report'),
        ('department_summary', 'Department Summary Report'),
        ('detailed_analysis', 'Detailed Analysis Report'),
        ('comparative_analysis', 'Comparative Analysis Report'),
        ('trend_analysis', 'Trend Analysis Report'),
        ('student_feedback', 'Student Feedback Summary'),
        ('compliance_report', 'Compliance Report'),
    ]
    
    REPORT_FORMAT_CHOICES = [
        ('pdf', 'PDF Document'),
        ('excel', 'Excel Spreadsheet'),
        ('csv', 'CSV Data'),
        ('json', 'JSON Data'),
    ]
    
    # Report Identification
    report_id = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text="Unique report identifier"
    )
    report_type = models.CharField(
        max_length=30,
        choices=REPORT_TYPE_CHOICES,
        db_index=True
    )
    report_format = models.CharField(
        max_length=10,
        choices=REPORT_FORMAT_CHOICES,
        default='pdf'
    )
    
    # Scope
    evaluation_period = models.ForeignKey(
        EvaluationPeriod,
        on_delete=models.PROTECT,
        related_name='reports',
        db_index=True
    )
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports',
        db_index=True
    )
    department = models.CharField(max_length=255, blank=True, default="")
    
    # Report Content
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    
    # Data Snapshot
    data_snapshot = models.JSONField(
        default=dict,
        help_text="Complete report data snapshot"
    )
    generated_html = models.TextField(
        blank=True,
        default="",
        help_text="Pre-rendered HTML for web display"
    )
    
    # Statistical Summary
    summary_statistics = models.JSONField(
        default=dict,
        blank=True,
        help_text="Key statistics (mean, median, std dev, etc.)"
    )
    
    # File Storage (for generated files)
    file_path = models.CharField(max_length=500, blank=True, default="")
    file_size = models.BigIntegerField(null=True, blank=True)
    
    # Generation Details
    generated_by = models.ForeignKey(
        Evaluator,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_reports'
    )
    generation_params = models.JSONField(
        default=dict,
        help_text="Parameters used to generate this report"
    )
    
    # Status
    is_public = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = "evaluation_reports"
        verbose_name = "Evaluation Report"
        verbose_name_plural = "Evaluation Reports"
        indexes = [
            models.Index(fields=['report_id'], name='idx_report_id'),
            models.Index(fields=['report_type'], name='idx_report_type'),
            models.Index(fields=['evaluation_period'], name='idx_report_period'),
            models.Index(fields=['teacher'], name='idx_report_teacher'),
            models.Index(fields=['created_at'], name='idx_report_created'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(
                    models.Q(teacher__isnull=False) |
                    models.Q(department__gt='')
                ),
                name='check_report_scope'
            ),
        ]
    
    def __str__(self):
        scope = self.teacher.full_name if self.teacher else self.department
        return f"{self.title} - {scope} ({self.evaluation_period.name})"
    
    @property
    def is_expired(self):
        """Check if report has expired"""
        from django.utils import timezone
        if self.expires_at is None:
            return False
        return timezone.now() > self.expires_at
```

---

## 4. Index Recommendations for Performance

### 4.1 Critical Performance Indexes

```sql
-- ============================================================
-- CRITICAL INDEXES (High Query Frequency)
-- ============================================================

-- Student evaluations lookup
CREATE INDEX idx_evaluations_student_period 
ON evaluations(evaluation_period_id, student_id);

-- Teacher evaluation aggregation
CREATE INDEX idx_evaluations_teacher_rating 
ON evaluations(teacher_id, evaluation_period_id, overall_rating DESC);

-- Period-based reporting
CREATE INDEX idx_evaluations_period_status 
ON evaluations(evaluation_period_id, status, submitted_at DESC);

-- Response-based analytics
CREATE INDEX idx_responses_question_rating 
ON evaluation_responses(question_id, rating DESC);

-- Category-based aggregation
CREATE INDEX idx_responses_category 
ON evaluation_responses(evaluation_id, question__category_id);

-- Report generation optimization
CREATE INDEX idx_reports_period_type 
ON evaluation_reports(evaluation_period_id, report_type, created_at DESC);
```

### 4.2 Composite and Covering Indexes

```sql
-- ============================================================
-- COMPOSITE INDEXES (Multi-Column Queries)
-- ============================================================

-- Dashboard queries (most common)
CREATE INDEX idx_eval_dashboard 
ON evaluations(
    evaluation_period_id, 
    teacher_id, 
    status, 
    evaluator_type
) INCLUDE (overall_rating, submitted_at);

-- Response aggregation queries
CREATE INDEX idx_response_aggregation 
ON evaluation_responses(
    evaluation_id, 
    question_id, 
    rating DESC
) INCLUDE (weighted_score, is_na);

-- Report data queries
CREATE INDEX idx_report_data 
ON evaluation_reports(
    evaluation_period_id, 
    report_type, 
    teacher_id, 
    created_at DESC
) INCLUDE (title, summary_statistics);
```

### 4.3 Partial/Filtered Indexes

```sql
-- ============================================================
-- PARTIAL INDEXES (Performance + Storage Optimization)
-- ============================================================

-- Only active evaluations
CREATE INDEX idx_active_evaluations 
ON evaluations(teacher_id, evaluation_period_id DESC)
WHERE status IN ('submitted', 'verified', 'published');

-- Only active questions
CREATE INDEX idx_active_questions 
ON evaluation_questions(category_id, display_order)
WHERE is_active = TRUE;

-- Recent reports only
CREATE INDEX idx_recent_reports 
ON evaluation_reports(created_at DESC)
WHERE created_at > NOW() - INTERVAL '1 year';
```

### 4.4 Full-Text Search Indexes

```sql
-- ============================================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================================

-- Question text search
CREATE INDEX idx_question_text_search 
ON evaluation_questions 
USING GIN(to_tsvector('english', question_text));

-- Category name search
CREATE INDEX idx_category_name_search 
ON evaluation_categories 
USING GIN(to_tsvector('english', name || ' ' || description));

-- Teacher name search
CREATE INDEX idx_teacher_name_search 
ON teachers 
USING GIN(to_tsvector('english', full_name));
```

---

## 5. Migration Strategy

### 5.1 Phase 1: Preparation (Pre-Migration)

```python
# Migration Plan: Phase 1 - Preparation
══════════════════════════════════════════════════════════════════════════════

Step 1.1: Backup Current Database
─────────────────────────────────
□ Create full database backup
□ Export all data to JSON fixtures
□ Document current schema version

Step 1.2: Data Validation
─────────────────────────
□ Validate all existing evaluations have valid teacher FK
□ Check for orphaned records
□ Verify student FK integrity
□ Document data quality issues

Step 1.3: Create Shadow Tables (Dry Run)
─────────────────────────────────────────
□ Create new tables with _new suffix
□ Test data migration scripts
□ Verify constraints and indexes
```

### 5.2 Phase 2: Core Schema Migration

```python
# Migration Plan: Phase 2 - Core Schema
══════════════════════════════════════════════════════════════════════════════

Step 2.1: Create Evaluator Model
────────────────────────────────
□ Create evaluators table
□ Insert admin users from existing staff
□ Set up initial permissions

Step 2.2: Create EvaluationPeriod Model
───────────────────────────────────────
□ Create evaluation_periods table
□ Migrate existing evaluation dates
□ Create periods for historical data

Step 2.3: Create EvaluationCategory Model
─────────────────────────────────────────
□ Create evaluation_categories table
□ Insert default categories
□ Assign to evaluation periods

Step 2.4: Create EvaluationQuestion Model
─────────────────────────────────────────
□ Create evaluation_questions table
□ Migrate EvaluationAnswer data to questions
□ Create default question bank

Step 2.5: Migrate EvaluationAnswers to Responses
─────────────────────────────────────────────────
□ Create evaluation_responses table
□ Map EvaluationAnswer → EvaluationResponse
□ Preserve all historical data
```

### 5.3 Phase 3: Data Transformation

```python
# Migration Plan: Phase 3 - Data Transformation
══════════════════════════════════════════════════════════════════════════════

Step 3.1: Enhance Student Model
───────────────────────────────
□ Add new columns (year_level, program, etc.)
□ Migrate existing profile data
□ Populate missing fields with defaults

Step 3.2: Enhance Teacher Model
───────────────────────────────
□ Add new columns (employee_id, position, etc.)
□ Split full_name into components
□ Update specializations as JSON

Step 3.3: Migrate EvaluationAnswers
────────────────────────────────────
□ Convert question_number to FK reference
□ Map category assignments
□ Create response records with question FK

Step 3.4: Populate Evaluation Periods
─────────────────────────────────────
□ Create default periods based on existing data
□ Map evaluations to appropriate periods
□ Set period status appropriately
```

### 5.4 Phase 4: Validation and Cleanup

```python
# Migration Plan: Phase 4 - Validation & Cleanup
══════════════════════════════════════════════════════════════════════════════

Step 4.1: Data Integrity Verification
───────────────────────────────────────
□ Verify all FK relationships
□ Check unique constraints
□ Validate calculated fields
□ Run data quality checks

Step 4.2: Functional Testing
────────────────────────────
□ Test evaluation submission flow
□ Verify reporting queries
□ Test admin functionality

Step 4.3: Performance Validation
────────────────────────────────
□ Benchmark key queries
□ Verify index effectiveness
□ Check query execution plans

Step 4.4: Final Cleanup
───────────────────────
□ Remove shadow tables (_new suffix)
□ Drop deprecated columns (if any)
□ Update sequence generators
□ Recalculate statistics
```

### 5.5 Migration Scripts Summary

```python
# Migration Script: Data Transformation
══════════════════════════════════════════════════════════════════════════════

# 1. Create new tables
migrations.CreateModel(
    name='Evaluator',
    fields=[...],
)

migrations.CreateModel(
    name='EvaluationPeriod',
    fields=[...],
)

migrations.CreateModel(
    name='EvaluationCategory',
    fields=[...],
)

migrations.CreateModel(
    name='EvaluationQuestion',
    fields=[...],
)

migrations.CreateModel(
    name='EvaluationResponse',
    fields=[...],
)

migrations.CreateModel(
    name='EvaluationReport',
    fields=[...],
)

# 2. Data migration operations
migrations.RunPython(
    migrate_evaluation_answers_to_responses,
    reverse_migrate_responses_to_answers
)

migrations.RunPython(
    create_default_categories,
    reverse_default_categories
)

migrations.RunPython(
    populate_evaluation_periods,
    reverse_evaluation_periods
)

# 3. Schema modifications
migrations.AddField(
    model_name='evaluation',
    name='evaluation_period',
    field=models.ForeignKey(...),
)

migrations.AddField(
    model_name='evaluation',
    name='evaluator',
    field=models.ForeignKey(...),
)

migrations.AddField(
    model_name='evaluation',
    name='overall_rating',
    field=models.DecimalField(...),
)

# 4. Remove deprecated fields (after data migration)
migrations.RemoveField(
    model_name='evaluationanswer',
    name='question',
)

migrations.DeleteModel(
    name='EvaluationAnswer',
)
```

---

## 6. PostgreSQL Schema (Raw SQL)

### 6.1 Core Tables

```sql
-- ============================================================
-- TEACHER EVALUATION SYSTEM - POSTGRESQL SCHEMA
-- Generated: 2026-02-12
-- Database: PostgreSQL 14+
-- ============================================================

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- STUDENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    
    -- Profile
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    middle_name VARCHAR(150) NOT NULL DEFAULT '',
    contact_number VARCHAR(20) NOT NULL DEFAULT '',
    year_level SMALLINT NULL,
    program VARCHAR(255) NOT NULL DEFAULT '',
    
    -- Authentication
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Preferences
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    receive_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Metadata
    last_login TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_student_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_student_year_level CHECK (year_level IS NULL OR (year_level BETWEEN 1 AND 4))
);

-- Indexes
CREATE INDEX idx_student_email ON students(email);
CREATE INDEX idx_student_student_id ON students(student_id);
CREATE INDEX idx_student_is_active ON students(is_active);
CREATE INDEX idx_student_created_at ON students(created_at);

COMMENT ON TABLE students IS 'Student users of the evaluation system';
COMMENT ON COLUMN students.password_hash IS 'Django password hash (bcrypt/scrypt/PBKDF2)';

-- ============================================================
-- TEACHERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS teachers (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    
    -- Name Components
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    middle_name VARCHAR(150) NOT NULL DEFAULT '',
    
    -- Contact
    email VARCHAR(254) NOT NULL,
    alternate_email VARCHAR(254) NOT NULL DEFAULT '',
    contact_number VARCHAR(20) NOT NULL DEFAULT '',
    
    -- Professional
    subject VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL DEFAULT 'Faculty',
    highest_degree VARCHAR(50) NOT NULL DEFAULT '',
    specializations JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Status
    employment_status VARCHAR(20) NOT NULL DEFAULT 'full-time',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    hire_date DATE NULL,
    termination_date DATE NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_teacher_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_teacher_position CHECK (position IN ('Instructor', 'Assistant Professor', 'Associate Professor', 'Professor', 'Department Head', 'Dean'))
);

-- Indexes
CREATE INDEX idx_teacher_email ON teachers(email);
CREATE INDEX idx_teacher_department ON teachers(department);
CREATE INDEX idx_teacher_subject ON teachers(subject);
CREATE INDEX idx_teacher_is_active ON teachers(is_active);
CREATE INDEX idx_teacher_full_name ON teachers(full_name);

COMMENT ON TABLE teachers IS 'Teaching faculty members';
COMMENT ON COLUMN teachers.specializations IS 'Array of subject specializations';

-- ============================================================
-- EVALUATORS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluators (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    
    -- Profile
    full_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL,
    
    -- Role
    role VARCHAR(30) NOT NULL DEFAULT 'report_viewer',
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    department_access VARCHAR(255) NOT NULL DEFAULT '',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by_id INTEGER NULL REFERENCES evaluators(id),
    
    CONSTRAINT chk_evaluator_role CHECK (role IN ('admin', 'department_head', 'evaluations_manager', 'report_viewer'))
);

-- Indexes
CREATE INDEX idx_evaluator_email ON evaluators(email);
CREATE INDEX idx_evaluator_role ON evaluators(role);
CREATE INDEX idx_evaluator_department ON evaluators(department);
CREATE INDEX idx_evaluator_is_active ON evaluators(is_active);

COMMENT ON TABLE evaluators IS 'Administrative users who manage evaluations';

-- ============================================================
-- EVALUATION PERIODS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_periods (
    id BIGSERIAL PRIMARY KEY,
    
    -- Identification
    name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    evaluation_type VARCHAR(20) NOT NULL DEFAULT 'final',
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    extension_date TIMESTAMP WITH TIME ZONE NULL,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Settings
    allow_late_submissions BOOLEAN NOT NULL DEFAULT FALSE,
    require_comments BOOLEAN NOT NULL DEFAULT FALSE,
    minimum_responses_required INTEGER NOT NULL DEFAULT 0,
    
    -- Visibility
    results_visible_to_teachers BOOLEAN NOT NULL DEFAULT FALSE,
    results_visible_to_students BOOLEAN NOT NULL DEFAULT FALSE,
    results_visibility_date TIMESTAMP WITH TIME ZONE NULL,
    
    -- Metadata
    description TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by_id INTEGER NULL REFERENCES evaluators(id),
    
    CONSTRAINT chk_period_semester CHECK (semester IN ('first', 'second', 'summer', 'trimester')),
    CONSTRAINT chk_period_type CHECK (evaluation_type IN ('midterm', 'final', 'annual', 'special')),
    CONSTRAINT chk_period_status CHECK (status IN ('draft', 'scheduled', 'active', 'closed', 'archived')),
    CONSTRAINT chk_period_dates CHECK (end_date > start_date)
);

-- Indexes
CREATE INDEX idx_period_name ON evaluation_periods(name);
CREATE INDEX idx_period_academic_year ON evaluation_periods(academic_year);
CREATE INDEX idx_period_status ON evaluation_periods(status);
CREATE INDEX idx_period_dates ON evaluation_periods(start_date, end_date);
CREATE INDEX idx_period_is_active ON evaluation_periods(is_active);

COMMENT ON TABLE evaluation_periods IS 'Evaluation periods (semesters, trimesters, etc.)';

-- ============================================================
-- EVALUATION CATEGORIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_categories (
    id BIGSERIAL PRIMARY KEY,
    
    -- Category
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    
    -- Weight
    weight DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Period
    evaluation_period_id BIGINT NULL REFERENCES evaluation_periods(id) ON DELETE CASCADE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_category_weight CHECK (weight > 0)
);

-- Indexes
CREATE INDEX idx_category_code ON evaluation_categories(code);
CREATE INDEX idx_category_is_active ON evaluation_categories(is_active);
CREATE INDEX idx_category_display_order ON evaluation_categories(display_order);
CREATE INDEX idx_category_period ON evaluation_categories(evaluation_period_id);

COMMENT ON TABLE evaluation_categories IS 'Categories for organizing evaluation questions';

-- ============================================================
-- EVALUATION QUESTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_questions (
    id BIGSERIAL PRIMARY KEY,
    
    -- Content
    question_number INTEGER NOT NULL,
    category_id BIGINT NOT NULL REFERENCES evaluation_categories(id) ON DELETE CASCADE,
    
    question_text TEXT NOT NULL,
    question_text_localized JSONB NOT NULL DEFAULT '{}'::jsonb,
    help_text TEXT NOT NULL DEFAULT '',
    
    -- Type
    question_type VARCHAR(20) NOT NULL DEFAULT 'rating',
    rating_scale VARCHAR(10) NOT NULL DEFAULT '1-5',
    min_rating INTEGER NOT NULL DEFAULT 1,
    max_rating INTEGER NOT NULL DEFAULT 5,
    
    -- Constraints
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    allow_na BOOLEAN NOT NULL DEFAULT FALSE,
    max_length INTEGER NULL,
    choices JSONB NULL,
    
    -- Scoring
    positive_weight DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    reverse_scored BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_question_type CHECK (question_type IN ('rating', 'rating_10', 'boolean', 'text', 'textarea', 'multiple_choice')),
    CONSTRAINT chk_question_scale CHECK (rating_scale IN ('1-5', '1-10', '1-7')),
    CONSTRAINT chk_rating_range CHECK (max_rating > min_rating),
    CONSTRAINT chk_category_question UNIQUE (category_id, question_number)
);

-- Indexes
CREATE INDEX idx_question_category ON evaluation_questions(category_id);
CREATE INDEX idx_question_is_active ON evaluation_questions(is_active);
CREATE INDEX idx_question_number ON evaluation_questions(question_number);
CREATE INDEX idx_question_display_order ON evaluation_questions(display_order);

COMMENT ON TABLE evaluation_Questions IS 'Individual questions in the evaluation';

-- ============================================================
-- EVALUATIONS TABLE (Enhanced)
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluations (
    id BIGSERIAL PRIMARY KEY,
    
    -- Relationships
    evaluation_period_id BIGINT NOT NULL REFERENCES evaluation_periods(id) ON DELETE RESTRICT,
    teacher_id BIGINT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    
    -- Evaluator
    evaluator_type VARCHAR(20) NOT NULL DEFAULT 'student',
    student_id BIGINT NULL REFERENCES students(id) ON DELETE SET NULL,
    evaluator_id BIGINT NULL REFERENCES evaluators(id) ON DELETE SET NULL,
    
    -- Non-student evaluator info
    evaluator_name VARCHAR(255) NOT NULL DEFAULT '',
    evaluator_email VARCHAR(254) NOT NULL DEFAULT '',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    progress_percentage SMALLINT NOT NULL DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NULL,
    verified_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Tracking
    ip_address INET NULL,
    user_agent TEXT NOT NULL DEFAULT '',
    device_id VARCHAR(100) NOT NULL DEFAULT '',
    
    -- Anonymity
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    show_respondent_in_report BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Overall
    overall_rating DECIMAL(3, 2) NULL,
    summary_comment TEXT NOT NULL DEFAULT '',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_evaluator_type CHECK (evaluator_type IN ('student', 'peer', 'self', 'admin', 'supervisor')),
    CONSTRAINT chk_eval_status CHECK (status IN ('draft', 'in_progress', 'submitted', 'verified', 'published', 'archived')),
    CONSTRAINT chk_progress CHECK (progress_percentage BETWEEN 0 AND 100),
    CONSTRAINT chk_rating_range CHECK (overall_rating IS NULL OR (overall_rating BETWEEN 0 AND 5)),
    CONSTRAINT chk_student_evaluation UNIQUE (evaluation_period_id, teacher_id, student_id) 
        WHERE student_id IS NOT NULL
);

-- Indexes
CREATE INDEX idx_eval_period ON evaluations(evaluation_period_id);
CREATE INDEX idx_eval_teacher ON evaluations(teacher_id);
CREATE INDEX idx_eval_evaluator_type ON evaluations(evaluator_type);
CREATE INDEX idx_eval_status ON evaluations(status);
CREATE INDEX idx_eval_submitted_at ON evaluations(submitted_at);
CREATE INDEX idx_eval_overall_rating ON evaluations(overall_rating);
CREATE INDEX idx_eval_created_at ON evaluations(created_at);
CREATE INDEX idx_eval_student ON evaluations(student_id);
CREATE INDEX idx_eval_evaluator ON evaluations(evaluator_id);
CREATE INDEX idx_eval_period_teacher ON evaluations(evaluation_period_id, teacher_id);
CREATE INDEX idx_eval_period_status ON evaluations(evaluation_period_id, status);

COMMENT ON TABLE evaluations IS 'Main evaluation records';

-- ============================================================
-- EVALUATION RESPONSES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_responses (
    id BIGSERIAL PRIMARY KEY,
    
    -- Relationships
    evaluation_id BIGINT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES evaluation_questions(id) ON DELETE RESTRICT,
    
    -- Response
    rating DECIMAL(5, 2) NULL,
    text_response TEXT NOT NULL DEFAULT '',
    boolean_response BOOLEAN NULL,
    choice_response VARCHAR(100) NOT NULL DEFAULT '',
    
    -- NA
    is_na BOOLEAN NOT NULL DEFAULT FALSE,
    na_reason VARCHAR(255) NOT NULL DEFAULT '',
    
    -- Pre-computed
    weighted_score DECIMAL(5, 2) NULL,
    
    -- Metadata
    responded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_response_rating CHECK (rating IS NULL OR rating >= 0),
    CONSTRAINT chk_unique_response UNIQUE (evaluation_id, question_id)
);

-- Indexes
CREATE INDEX idx_response_evaluation ON evaluation_responses(evaluation_id);
CREATE INDEX idx_response_question ON evaluation_responses(question_id);
CREATE INDEX idx_response_rating ON evaluation_responses(rating);
CREATE INDEX idx_response_is_na ON evaluation_responses(is_na);
CREATE INDEX idx_response_eval_question ON evaluation_responses(evaluation_id, question_id);

COMMENT ON TABLE evaluation_responses IS 'Individual question responses';

-- ============================================================
-- EVALUATION REPORTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluation_reports (
    id BIGSERIAL PRIMARY KEY,
    
    -- Identification
    report_id VARCHAR(50) NOT NULL UNIQUE,
    report_type VARCHAR(30) NOT NULL,
    report_format VARCHAR(10) NOT NULL DEFAULT 'pdf',
    
    -- Scope
    evaluation_period_id BIGINT NOT NULL REFERENCES evaluation_periods(id) ON DELETE RESTRICT,
    teacher_id BIGINT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    department VARCHAR(255) NOT NULL DEFAULT '',
    
    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    
    -- Data
    data_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_html TEXT NOT NULL DEFAULT '',
    summary_statistics JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- File
    file_path VARCHAR(500) NOT NULL DEFAULT '',
    file_size BIGINT NULL,
    
    -- Generation
    generated_by_id BIGINT NULL REFERENCES evaluators(id) ON DELETE SET NULL,
    generation_params JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Status
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Metadata
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_report_type CHECK (report_type IN ('teacher_summary', 'department_summary', 'detailed_analysis', 'comparative_analysis', 'trend_analysis', 'student_feedback', 'compliance_report')),
    CONSTRAINT chk_report_format CHECK (report_format IN ('pdf', 'excel', 'csv', 'json')),
    CONSTRAINT chk_report_scope CHECK (teacher_id IS NOT NULL OR department != '')
);

-- Indexes
CREATE INDEX idx_report_report_id ON evaluation_reports(report_id);
CREATE INDEX idx_report_type ON evaluation_reports(report_type);
CREATE INDEX idx_report_period ON evaluation_reports(evaluation_period_id);
CREATE INDEX idx_report_teacher ON evaluation_reports(teacher_id);
CREATE INDEX idx_report_created_at ON evaluation_reports(created_at);

COMMENT ON TABLE evaluation_reports IS 'Pre-computed report snapshots';

-- ============================================================
-- LEGACY EVALUATION ANSWERS TABLE (Deprecation Warning)
-- ============================================================

-- This table exists for backward compatibility during migration
-- Should be dropped after successful migration

CREATE TABLE IF NOT EXISTS evaluation_answers (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id BIGINT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    question VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL,
    
    CONSTRAINT chk_answer_rating CHECK (rating BETWEEN 1 AND 5)
);

-- Indexes
CREATE INDEX idx_answer_evaluation ON evaluation_answers(evaluation_id);

COMMENT ON TABLE evaluation_answers IS 'Legacy table - migrate to evaluation_responses and drop';
```

### 6.2 Triggers and Functions

```sql
-- ============================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================

-- Function: Update timestamp on record modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at 
    BEFORE UPDATE ON teachers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluators_updated_at 
    BEFORE UPDATE ON evaluators 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_periods_updated_at 
    BEFORE UPDATE ON evaluation_periods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_categories_updated_at 
    BEFORE UPDATE ON evaluation_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_questions_updated_at 
    BEFORE UPDATE ON evaluation_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at 
    BEFORE UPDATE ON evaluations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_responses_updated_at 
    BEFORE UPDATE ON evaluation_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_reports_updated_at 
    BEFORE UPDATE ON evaluation_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: Calculate and update overall rating
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_overall_rating(p_evaluation_id BIGINT)
RETURNS DECIMAL AS $$
DECLARE
    v_total_weighted_score DECIMAL := 0;
    v_total_weight DECIMAL := 0;
    v_result DECIMAL;
BEGIN
    SELECT 
        COALESCE(SUM(r.weighted_score * c.weight), 0) AS weighted_sum,
        COALESCE(SUM(c.weight), 0) AS total_weight
    INTO v_total_weighted_score, v_total_weight
    FROM evaluation_responses r
    INNER JOIN evaluation_questions q ON r.question_id = q.id
    INNER JOIN evaluation_categories c ON q.category_id = c.id
    WHERE r.evaluation_id = p_evaluation_id
    AND r.is_na = FALSE
    AND r.rating IS NOT NULL;

    IF v_total_weight > 0 THEN
        v_result := v_total_weighted_score / v_total_weight;
    ELSE
        v_result := NULL;
    END IF;

    UPDATE evaluations 
    SET overall_rating = v_result,
        updated_at = NOW()
    WHERE id = p_evaluation_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate overall rating on response update
CREATE TRIGGER trigger_calculate_rating
    AFTER INSERT OR UPDATE ON evaluation_responses
    FOR EACH ROW
    EXECUTE FUNCTION calculate_overall_rating(NEW.evaluation_id);
```

---

## 7. Summary and Next Steps

### 7.1 Key Design Highlights

| Feature | Implementation |
|---------|----------------|
| **Multi-type Evaluations** | `evaluator_type` field with student/peer/self/admin options |
| **Period Management** | Dedicated `EvaluationPeriod` model with scheduling |
| **Category-based Questions** | Hierarchical category → question structure |
| **Response Granularity** | Individual `EvaluationResponse` per question |
| **Reporting** | Pre-computed `EvaluationReport` snapshots |
| **Performance** | Strategic indexes for common query patterns |
| **Integrity** | Foreign keys, check constraints, unique constraints |
| **Scalability** | JSON fields for flexible data, proper normalization |

### 7.2 Backward Compatibility

The design maintains backward compatibility by:
- Keeping the `Student` model with existing fields
- Enhancing `Teacher` model without removing existing fields
- Migrating `EvaluationAnswer` data to `EvaluationResponse`
- Preserving all historical evaluation data

### 7.3 Recommended Next Steps

1. **Review and Approve** - Review this design document and approve or request modifications
2. **Create Migration Scripts** - Once approved, switch to Code mode to implement migrations
3. **Test in Staging** - Validate migration and functionality in a staging environment
4. **Plan Deployment** - Schedule deployment with rollback strategy
5. **Documentation Update** - Update API documentation and user guides

---

*Document generated for the Teacher Evaluation System enhancement project*
