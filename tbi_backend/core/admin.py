# from django.contrib import admin
# from .models import Student, Teacher, Evaluation, EvaluationAnswer
# # Register your models here.

# admin.site.register(Student)
# admin.site.register(Teacher)
# admin.site.register(Evaluation)
# admin.site.register(EvaluationAnswer)
# core/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Avg, Count
from .models import (
    Student, Teacher, Evaluator, EvaluationPeriod,
    EvaluationCategory, EvaluationQuestion, Evaluation,
    EvaluationResponse, EvaluationAnswer, EvaluationReport
)


# =============================================================================
# STUDENT ADMIN
# =============================================================================
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'email', 'full_name', 'year_level', 'program', 
                    'is_active', 'evaluation_count', 'created_at']
    list_filter = ['is_active', 'year_level', 'program', 'created_at']
    search_fields = ['email', 'student_id', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    
    fieldsets = (
        ('Authentication', {
            'fields': ('email', 'student_id', 'is_active', 'email_verified')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'middle_name', 'contact_number')
        }),
        ('Academic Information', {
            'fields': ('year_level', 'program')
        }),
        ('Preferences', {
            'fields': ('preferred_language', 'receive_notifications')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'last_login'),
            'classes': ('collapse',)
        }),
    )
    
    def evaluation_count(self, obj):
        """Show how many evaluations this student has submitted"""
        count = obj.evaluations.count()
        return format_html(
            '<a href="/admin/core/evaluation/?student__id__exact={}">{} evaluations</a>',
            obj.id, count
        )
    evaluation_count.short_description = 'Evaluations Submitted'


# =============================================================================
# TEACHER ADMIN
# =============================================================================
@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'full_name', 'subject', 'department', 
                    'position', 'is_active', 'evaluation_count', 'avg_rating']
    list_filter = ['is_active', 'department', 'position', 'employment_status']
    search_fields = ['full_name', 'first_name', 'last_name', 'employee_id', 
                     'email', 'subject']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Identification', {
            'fields': ('employee_id', 'full_name', 'first_name', 'last_name', 'middle_name')
        }),
        ('Contact', {
            'fields': ('email', 'alternate_email', 'contact_number')
        }),
        ('Professional', {
            'fields': ('subject', 'department', 'position', 'highest_degree', 
                      'specializations', 'employment_status')
        }),
        ('Status', {
            'fields': ('is_active', 'hire_date', 'termination_date')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def evaluation_count(self, obj):
        """Show how many evaluations this teacher has received"""
        count = obj.evaluations.count()
        return format_html(
            '<a href="/admin/core/evaluation/?teacher__id__exact={}">{} evaluations</a>',
            obj.id, count
        )
    evaluation_count.short_description = 'Evaluations Received'
    
    def avg_rating(self, obj):
        """Show average rating for this teacher"""
        avg = obj.evaluations.filter(rating__isnull=False).aggregate(Avg('rating'))['rating__avg']
        if avg:
            avg_val = float(avg)
            if avg_val >= 4:
                color = 'green'
            elif avg_val >= 3:
                color = 'orange'
            else:
                color = 'red'
            return format_html(
                '<span style="color: {};">{:.2f} / 5.0</span>',
                color, avg_val
            )
        return '-'
    avg_rating.short_description = 'Average Rating'


# =============================================================================
# EVALUATION ANSWER INLINE (for viewing individual question responses)
# =============================================================================
class EvaluationAnswerInline(admin.TabularInline):
    model = EvaluationAnswer
    extra = 0
    readonly_fields = ['question', 'question_number', 'rating']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


# =============================================================================
# EVALUATION ADMIN (Main view for who evaluated whom)
# =============================================================================
@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ['id', 'student_display', 'teacher_display', 'period_display',
                    'rating_display', 'status', 'submitted_at', 'answer_count']
    list_filter = ['status', 'evaluation_period', 'submitted_at', 'created_at']
    search_fields = ['student__email', 'student__first_name', 'student__last_name',
                     'teacher__full_name', 'comments']
    readonly_fields = ['created_at', 'updated_at', 'submitted_at', 'started_at',
                      'verified_at', 'overall_rating']
    date_hierarchy = 'submitted_at'
    inlines = [EvaluationAnswerInline]
    
    fieldsets = (
        ('Evaluation Details', {
            'fields': ('evaluation_period', 'teacher', 'student', 'evaluator_type')
        }),
        ('Rating & Feedback', {
            'fields': ('rating', 'overall_rating', 'comments', 'summary_comment')
        }),
        ('Status', {
            'fields': ('status', 'progress_percentage', 'is_anonymous')
        }),
        ('Timestamps', {
            'fields': ('started_at', 'submitted_at', 'verified_at', 
                      'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Tracking', {
            'fields': ('ip_address', 'user_agent', 'device_id'),
            'classes': ('collapse',)
        }),
    )
    
    def student_display(self, obj):
        """Display student info with link"""
        if obj.student:
            return format_html(
                '<a href="/admin/core/student/{}/change/">{}</a><br>'
                '<small style="color: #666;">{}</small>',
                obj.student.id,
                obj.student.full_name,
                obj.student.email
            )
        return format_html('<span style="color: #999;">Anonymous</span>')
    student_display.short_description = 'Student (Evaluator)'
    
    def teacher_display(self, obj):
        """Display teacher info with link"""
        if obj.teacher:
            return format_html(
                '<a href="/admin/core/teacher/{}/change/">{}</a><br>'
                '<small style="color: #666;">{}</small>',
                obj.teacher.id,
                obj.teacher.full_name,
                obj.teacher.subject
            )
        return '-'
    teacher_display.short_description = 'Teacher (Evaluated)'
    
    def period_display(self, obj):
        """Display evaluation period"""
        if obj.evaluation_period:
            return format_html(
                '{}<br><small style="color: #666;">{}</small>',
                obj.evaluation_period.name,
                obj.evaluation_period.academic_year
            )
        return '-'
    period_display.short_description = 'Period'
    
    def rating_display(self, obj):
        """Display rating with color coding"""
        if obj.rating:
            color = '#28a745' if obj.rating >= 4 else '#ffc107' if obj.rating >= 3 else '#dc3545'
            return format_html(
                '<strong style="color: {}; font-size: 16px;">{}</strong> / 5',
                color, obj.rating
            )
        return '-'
    rating_display.short_description = 'Rating'
    
    def answer_count(self, obj):
        """Show number of questions answered"""
        count = obj.legacy_answers.count()
        if count > 0:
            return format_html(
                '<span style="color: #28a745;">{} answers</span>',
                count
            )
        return format_html('<span style="color: #999;">No answers</span>')
    answer_count.short_description = 'Questions Answered'
    
    def get_queryset(self, request):
        """Optimize queries"""
        qs = super().get_queryset(request)
        return qs.select_related('student', 'teacher', 'evaluation_period')


# =============================================================================
# EVALUATION ANSWER ADMIN (Detailed question-by-question responses)
# =============================================================================
@admin.register(EvaluationAnswer)
class EvaluationAnswerAdmin(admin.ModelAdmin):
    list_display = ['id', 'evaluation_link', 'student_name', 'teacher_name',
                    'question_display', 'rating_display']
    list_filter = ['rating', 'question_number']
    search_fields = ['evaluation__student__first_name', 
                     'evaluation__student__last_name',
                     'evaluation__teacher__full_name', 'question']
    readonly_fields = ['evaluation', 'question', 'question_number', 'rating']
    
    def evaluation_link(self, obj):
        """Link to parent evaluation"""
        return format_html(
            '<a href="/admin/core/evaluation/{}/change/">Evaluation #{}</a>',
            obj.evaluation.id, obj.evaluation.id
        )
    evaluation_link.short_description = 'Evaluation'
    
    def student_name(self, obj):
        """Show student who answered"""
        if obj.evaluation.student:
            return obj.evaluation.student.full_name
        return 'Anonymous'
    student_name.short_description = 'Student'
    
    def teacher_name(self, obj):
        """Show teacher being evaluated"""
        return obj.evaluation.teacher.full_name
    teacher_name.short_description = 'Teacher'
    
    def question_display(self, obj):
        """Display question with number"""
        return format_html(
            '<strong>Q{}:</strong> {}',
            obj.question_number, obj.question
        )
    question_display.short_description = 'Question'
    
    def rating_display(self, obj):
        """Display rating with color"""
        color = '#28a745' if obj.rating >= 4 else '#ffc107' if obj.rating >= 3 else '#dc3545'
        return format_html(
            '<strong style="color: {}; font-size: 14px;">{}</strong> / 5',
            color, obj.rating
        )
    rating_display.short_description = 'Rating'
    
    def get_queryset(self, request):
        """Optimize queries"""
        qs = super().get_queryset(request)
        return qs.select_related('evaluation__student', 'evaluation__teacher')
    
    def has_add_permission(self, request):
        """Prevent adding answers through admin"""
        return False


# =============================================================================
# EVALUATION PERIOD ADMIN
# =============================================================================
@admin.register(EvaluationPeriod)
class EvaluationPeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'academic_year', 'semester', 'status', 'is_active',
                    'evaluation_count', 'date_range']
    list_filter = ['status', 'semester', 'is_active', 'start_date']
    search_fields = ['name', 'academic_year']
    readonly_fields = ['created_at', 'updated_at']
    
    def evaluation_count(self, obj):
        """Show number of evaluations in this period"""
        count = obj.evaluations.count()
        return format_html(
            '<a href="/admin/core/evaluation/?evaluation_period__id__exact={}">{} evaluations</a>',
            obj.id, count
        )
    evaluation_count.short_description = 'Evaluations'
    
    def date_range(self, obj):
        """Show date range"""
        return format_html(
            '{}<br>to<br>{}',
            obj.start_date.strftime('%b %d, %Y') if obj.start_date else '-',
            obj.end_date.strftime('%b %d, %Y') if obj.end_date else '-'
        )
    date_range.short_description = 'Date Range'


# =============================================================================
# OTHER MODEL REGISTRATIONS
# =============================================================================
@admin.register(Evaluator)
class EvaluatorAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'full_name', 'email', 'role', 'department', 'is_active']
    list_filter = ['role', 'is_active', 'department']
    search_fields = ['full_name', 'email', 'employee_id']


@admin.register(EvaluationCategory)
class EvaluationCategoryAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'weight', 'display_order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code']


@admin.register(EvaluationQuestion)
class EvaluationQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_number', 'question_text_short', 'category', 
                    'question_type', 'is_active']
    list_filter = ['category', 'question_type', 'is_active']
    search_fields = ['question_text']
    
    def question_text_short(self, obj):
        """Show shortened question text"""
        return obj.question_text[:80] + '...' if len(obj.question_text) > 80 else obj.question_text
    question_text_short.short_description = 'Question Text'


@admin.register(EvaluationReport)
class EvaluationReportAdmin(admin.ModelAdmin):
    list_display = ['report_id', 'report_type', 'teacher', 'evaluation_period', 'created_at']
    list_filter = ['report_type', 'is_public', 'is_archived']
    search_fields = ['report_id', 'title', 'teacher__full_name']


# =============================================================================
# ADMIN SITE CUSTOMIZATION
# =============================================================================
admin.site.site_header = "Teacher Evaluation System Administration"
admin.site.site_title = "TBI Admin"
admin.site.index_title = "Welcome to Teacher Evaluation System"