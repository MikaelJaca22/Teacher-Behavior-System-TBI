from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


# =============================================================================
# STUDENT MODEL (Enhanced)
# =============================================================================

class StudentManager(BaseUserManager):
    def create_user(self, email, student_id, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not student_id:
            raise ValueError("Student ID is required")

        email = self.normalize_email(email)
        student = self.model(
            email=email,
            student_id=student_id,
            **extra_fields
        )
        student.set_password(password)
        student.save(using=self._db)
        return student

    def create_superuser(self, email, student_id, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        return self.create_user(email, student_id, password, **extra_fields)


class Student(AbstractBaseUser, PermissionsMixin):
    """Enhanced student model with profile information"""
    
    # Authentication Fields
    email = models.EmailField(unique=True, db_index=True)
    student_id = models.CharField(max_length=100, unique=True, db_index=True)
    
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
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
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


# =============================================================================
# TEACHER MODEL (Enhanced)
# =============================================================================

class Teacher(models.Model):
    """Enhanced teacher model with professional details"""
    
    POSITION_CHOICES = [
        ('Instructor', 'Instructor'),
        ('Assistant Professor', 'Assistant Professor'),
        ('Associate Professor', 'Associate Professor'),
        ('Professor', 'Professor'),
        ('Department Head', 'Department Head'),
        ('Dean', 'Dean'),
    ]
    
    EMPLOYMENT_STATUS_CHOICES = [
        ('full-time', 'Full-Time'),
        ('part-time', 'Part-Time'),
        ('contractual', 'Contractual'),
        ('adjunct', 'Adjunct'),
        ('on-leave', 'On Leave'),
    ]
    
    DEGREE_CHOICES = [
        ('', 'Not Specified'),
        ('Bachelor', 'Bachelor'),
        ('Master', 'Master'),
        ('Doctorate', 'Doctorate'),
        ('Post-Doctorate', 'Post-Doctorate'),
    ]
    
    # Personal Information
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        verbose_name="employee identification number",
        blank=True,
        default=""
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
        choices=POSITION_CHOICES
    )
    highest_degree = models.CharField(
        max_length=50,
        blank=True,
        default="",
        choices=DEGREE_CHOICES
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
        choices=EMPLOYMENT_STATUS_CHOICES
    )
    is_active = models.BooleanField(default=True, db_index=True)
    hire_date = models.DateField(null=True, blank=True)
    termination_date = models.DateField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
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
    
    def __str__(self):
        return f"{self.full_name} - {self.subject}"
    
    @property
    def full_name_reversed(self):
        return f"{self.last_name}, {self.first_name} {self.middle_name or ''}"
    
    def save(self, *args, **kwargs):
        # Auto-generate employee_id if not set
        if not self.employee_id:
            import uuid
            self.employee_id = f"EMP-{uuid.uuid4().hex[:8].upper()}"
        # Combine name fields
        self.full_name = f"{self.first_name} {self.middle_name or ''} {self.last_name}".strip()
        super().save(*args, **kwargs)


# =============================================================================
# EVALUATOR MODEL (New)
# =============================================================================

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
    email = models.EmailField(unique=True, db_index=True)
    
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
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_evaluators'
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
    
    def save(self, *args, **kwargs):
        # Auto-generate employee_id if not set
        if not self.employee_id:
            import uuid
            self.employee_id = f"EVAL-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


# =============================================================================
# EVALUATION PERIOD MODEL (New)
# =============================================================================

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
    
    SEMESTER_CHOICES = [
        ('first', 'First Semester'),
        ('second', 'Second Semester'),
        ('summer', 'Summer Term'),
        ('trimester', 'Trimester'),
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
        choices=SEMESTER_CHOICES
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
    description = models.TextField(blank=True, default="")
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        Evaluator,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_periods'
    )
    
    
    
    def __str__(self):
        return f"{self.name} ({self.get_semester_display()} {self.academic_year})"
    
    @property
    def is_current(self):
        """Check if period is currently active"""
        now = timezone.now()
        return (
            self.status == 'active' and
            self.start_date <= now <= (self.end_date or now)
        )


# =============================================================================
# EVALUATION CATEGORY MODEL (New)
# =============================================================================

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
    created_at = models.DateTimeField(default=timezone.now)
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


# =============================================================================
# EVALUATION QUESTION MODEL (New)
# =============================================================================

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
    max_length = models.PositiveIntegerField(
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
    created_at = models.DateTimeField(default=timezone.now)
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


# =============================================================================
# EVALUATION MODEL (Enhanced)
# =============================================================================

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
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Legacy support
    rating = models.IntegerField(null=True, blank=True)
    comments = models.TextField(blank=True, default="")
    
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
            models.Index(fields=['student'], name='idx_eval_student'),
            models.Index(fields=['evaluator'], name='idx_eval_evaluator'),
            models.Index(
                fields=['evaluation_period', 'teacher'],
                name='idx_eval_period_teacher'
            ),
            models.Index(
                fields=['evaluation_period', 'status'],
                name='idx_eval_period_status'
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
                total_weighted_score += float(response.rating) * float(category_weight)
                total_weight += float(category_weight)
        
        if total_weight == 0:
            return None
        
        return round(total_weighted_score / total_weight, 2)


# =============================================================================
# EVALUATION RESPONSE MODEL (New)
# =============================================================================

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
    responded_at = models.DateTimeField(default=timezone.now)
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
                condition=models.Q(rating__isnull=True) | 
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


# =============================================================================
# EVALUATION REPORT MODEL (New)
# =============================================================================

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
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    
    
    def __str__(self):
        scope = self.teacher.full_name if self.teacher else self.department
        return f"{self.title} - {scope} ({self.evaluation_period.name})"
    
    @property
    def is_expired(self):
        """Check if report has expired"""
        if self.expires_at is None:
            return False
        return timezone.now() > self.expires_at
    
    def save(self, *args, **kwargs):
        # Auto-generate report_id if not set
        if not self.report_id:
            import uuid
            self.report_id = f"RPT-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)


# =============================================================================
# LEGACY EVALUATION ANSWER MODEL (Deprecated - for migration)
# =============================================================================

class EvaluationAnswer(models.Model):
    """Legacy evaluation answer model - migrate to EvaluationResponse"""
    
    evaluation = models.ForeignKey(
        Evaluation, 
        on_delete=models.CASCADE, 
        related_name="legacy_answers"
    )
    question = models.CharField(max_length=255, default="")
    question_number = models.IntegerField(default=1)
    rating = models.IntegerField(default=0)
    
    # Student details (WHO evaluated) - stored directly for easy viewing
    student_name = models.CharField(max_length=255, blank=True, default="", 
                                     help_text="Full name of student who submitted this answer")
    student_email = models.EmailField(blank=True, default="",
                                       help_text="Email of student who submitted this answer")
    student_id = models.CharField(max_length=100, blank=True, default="",
                                   help_text="Student ID from Firebase/system")
    
    # Teacher details (WHOM they evaluated) - stored directly for easy viewing
    teacher_name = models.CharField(max_length=255, blank=True, default="",
                                     help_text="Full name of teacher being evaluated")
    teacher_subject = models.CharField(max_length=255, blank=True, default="",
                                        help_text="Subject taught by this teacher")
    teacher_department = models.CharField(max_length=255, blank=True, default="",
                                           help_text="Department of this teacher")
    
    # Evaluation metadata
    overall_score = models.IntegerField(null=True, blank=True,
                                        help_text="Overall evaluation rating (1-5)")
    evaluation_comments = models.TextField(blank=True, default="",
                                           help_text="General comments from the evaluation")
    
    # Timestamps
    answered_at = models.DateTimeField(default=timezone.now, db_index=True,
                                       help_text="When this answer was submitted")
    
    class Meta:
        db_table = "evaluation_answers"
        verbose_name = "Evaluation Answer (Legacy)"
        indexes = [
            models.Index(fields=['evaluation'], name='idx_answer_evaluation'),
            models.Index(fields=['student_email'], name='idx_answer_student_email'),
            models.Index(fields=['teacher_name'], name='idx_answer_teacher_name'),
            models.Index(fields=['answered_at'], name='idx_answer_answered_at'),
        ]
    
    def __str__(self):
        return f"{self.student_name} → {self.teacher_name}: Q{self.question_number} = {self.rating}/5"


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def create_default_evaluation_categories():
    """Create default evaluation categories with default questions"""
    
    # Create categories
    categories_data = [
        {
            'name': 'Teaching Methodology',
            'code': 'TEACHING_METHOD',
            'description': 'Evaluation of teaching methods and instructional quality',
            'weight': 1.5,
            'display_order': 1,
            'questions': [
                {'question_number': 1, 'question_text': 'The teacher presents material clearly and organized.', 'max_rating': 5},
                {'question_number': 2, 'question_text': 'The teacher uses effective teaching strategies to engage students.', 'max_rating': 5},
                {'question_number': 3, 'question_text': 'The teacher encourages student participation and discussion.', 'max_rating': 5},
                {'question_number': 4, 'question_text': 'The teacher adapts teaching methods to different learning styles.', 'max_rating': 5},
            ]
        },
        {
            'name': 'Classroom Management',
            'code': 'CLASSROOM_MGMT',
            'description': 'Assessment of classroom environment and management skills',
            'weight': 1.2,
            'display_order': 2,
            'questions': [
                {'question_number': 1, 'question_text': 'The teacher maintains a positive and respectful classroom environment.', 'max_rating': 5},
                {'question_number': 2, 'question_text': 'The teacher handles classroom disruptions effectively.', 'max_rating': 5},
                {'question_number': 3, 'question_text': 'The teacher starts and ends class on time.', 'max_rating': 5},
            ]
        },
        {
            'name': 'Student Engagement',
            'code': 'STUDENT_ENGAGEMENT',
            'description': 'Evaluation of student involvement and motivation',
            'weight': 1.3,
            'display_order': 3,
            'questions': [
                {'question_number': 1, 'question_text': 'The teacher motivates students to learn and participate.', 'max_rating': 5},
                {'question_number': 2, 'question_text': 'The teacher shows genuine interest in student success.', 'max_rating': 5},
                {'question_number': 3, 'question_text': 'The teacher provides opportunities for student collaboration.', 'max_rating': 5},
            ]
        },
        {
            'name': 'Assessment Practices',
            'code': 'ASSESSMENT',
            'description': 'Evaluation of assessment and feedback methods',
            'weight': 1.0,
            'display_order': 4,
            'questions': [
                {'question_number': 1, 'question_text': 'The teacher provides fair and timely assessments.', 'max_rating': 5},
                {'question_number': 2, 'question_text': 'The teacher gives constructive feedback to improve learning.', 'max_rating': 5},
                {'question_number': 3, 'question_text': 'The teacher assesses student understanding regularly.', 'max_rating': 5},
            ]
        },
        {
            'name': 'Communication Skills',
            'code': 'COMMUNICATION',
            'description': 'Assessment of verbal and written communication',
            'weight': 1.2,
            'display_order': 5,
            'questions': [
                {'question_number': 1, 'question_text': 'The teacher communicates clearly in verbal explanations.', 'max_rating': 5},
                {'question_number': 2, 'question_text': 'The teacher provides clear written instructions and materials.', 'max_rating': 5},
                {'question_number': 3, 'question_text': 'The teacher is approachable and responsive to questions.', 'max_rating': 5},
            ]
        },
        {
            'name': 'Subject Matter Expertise',
            'code': 'SUBJECT_EXPERTISE',
            'description': 'Evaluation of knowledge and expertise in the subject',
            'weight': 1.4,
            'display_order': 6,
            'questions': [
                {'question_number': 1, 'question_text': 'The teacher demonstrates thorough knowledge of the subject.', 'max_rating': 5},
                {'question_number': 2, 'question_text': 'The teacher can answer student questions accurately.', 'max_rating': 5},
                {'question_number': 3, 'question_text': 'The teacher provides relevant examples and applications.', 'max_rating': 5},
            ]
        },
        {
            'name': 'Professional Development',
            'code': 'PROFESSIONAL_DEV',
            'description': 'Assessment of professionalism and growth',
            'weight': 1.0,
            'display_order': 7,
            'questions': [
                {'question_number': 1, 'question_text': 'The teacher is punctual and reliable.', 'max_rating': 5},
                {'question_number': 2, 'question_text': 'The teacher shows commitment to professional growth.', 'max_rating': 5},
                {'question_number': 3, 'question_text': 'The teacher maintains professional boundaries.', 'max_rating': 5},
            ]
        },
    ]
    
    for cat_data in categories_data:
        questions = cat_data.pop('questions')
        category, created = EvaluationCategory.objects.get_or_create(
            code=cat_data['code'],
            defaults=cat_data
        )
        if created:
            for q in questions:
                EvaluationQuestion.objects.create(
                    category=category,
                    question_number=q['question_number'],
                    question_text=q['question_text'],
                    max_rating=q['max_rating']
                )
    
    return EvaluationCategory.objects.count()


# Sample teacher creation helper (from existing code)
def create_sample_teachers():
    """Create sample teachers for testing"""
    sample_teachers = [
        {"full_name": "Dr. Juan dela Cruz", "subject": "Mathematics", "department": "Science", "email": "juan.delacruz@tbi.edu", "first_name": "Juan", "last_name": "dela Cruz"},
        {"full_name": "Prof. Maria Santos", "subject": "English", "department": "Language", "email": "maria.santos@tbi.edu", "first_name": "Maria", "last_name": "Santos"},
        {"full_name": "Mr. Pedro Reyes", "subject": "History", "department": "Social Studies", "email": "pedro.reyes@tbi.edu", "first_name": "Pedro", "last_name": "Reyes"},
        {"full_name": "Mrs. Ana Lopez", "subject": "Physics", "department": "Science", "email": "ana.lopez@tbi.edu", "first_name": "Ana", "last_name": "Lopez"},
        {"full_name": "Ms. Carmen Dimaguiba", "subject": "Chemistry", "department": "Science", "email": "carmen.dimaguiba@tbi.edu", "first_name": "Carmen", "last_name": "Dimaguiba"},
    ]
    
    created = []
    for teacher_data in sample_teachers:
        teacher, created_new = Teacher.objects.get_or_create(
            full_name=teacher_data["full_name"],
            defaults=teacher_data
        )
        if created_new:
            created.append(teacher.full_name)
    return created