# core/serializers.py
from rest_framework import serializers
from .models import (
    Student, Teacher, Evaluation, EvaluationAnswer,
    Evaluator, EvaluationPeriod, EvaluationCategory,
    EvaluationQuestion, EvaluationResponse, EvaluationReport
)


# =============================================================================
# EXISTING SERIALIZERS (Backward Compatibility)
# =============================================================================

class EvaluationAnswerSerializer(serializers.Serializer):
    question_number = serializers.IntegerField()
    rating = serializers.IntegerField()


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "email", "first_name", "last_name", "student_id"]


class TeacherSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name', read_only=True)
    
    class Meta:
        model = Teacher
        fields = ["id", "name", "full_name", "subject", "department", "email", "created_at"]
        read_only_fields = ["created_at"]


class EvaluationSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    student_name = serializers.SerializerMethodField()
    evaluation_period_name = serializers.CharField(source='evaluation_period.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Evaluation
        fields = ["id", "student", "student_name", "teacher", "evaluation_period", 
                  "evaluation_period_name", "rating", "comments", "submitted_at"]
        read_only_fields = ["submitted_at"]
    
    def get_student_name(self, obj):
        """Get student full name or return Anonymous"""
        if obj.student:
            return obj.student.full_name
        return "Anonymous"


class EvaluationCreateSerializer(serializers.Serializer):
    teacher = serializers.IntegerField()
    student = serializers.IntegerField(required=False, allow_null=True)
    rating = serializers.IntegerField()
    comments = serializers.CharField(required=False, allow_blank=True)
    answers = EvaluationAnswerSerializer(many=True, required=False)


# =============================================================================
# EVALUATOR SERIALIZERS
# =============================================================================

class EvaluatorSerializer(serializers.ModelSerializer):
    """Serializer for Evaluator model"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = Evaluator
        fields = [
            "id", "user_id", "email", "full_name", "employee_id",
            "department", "position", "role", "role_display",
            "permissions", "department_access", "is_active",
            "last_login", "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at", "employee_id"]


class EvaluatorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating evaluators"""
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Evaluator
        fields = [
            "id", "email", "full_name", "employee_id",
            "department", "position", "role", "permissions",
            "department_access", "is_active", "password"
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        evaluator = Evaluator(**validated_data)
        if password:
            evaluator.set_password(password)
        evaluator.save()
        return evaluator


# =============================================================================
# EVALUATION PERIOD SERIALIZERS
# =============================================================================

class EvaluationPeriodSerializer(serializers.ModelSerializer):
    """Serializer for EvaluationPeriod model"""
    semester_display = serializers.CharField(source='get_semester_display', read_only=True)
    evaluation_type_display = serializers.CharField(source='get_evaluation_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, allow_null=True)
    is_current = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = EvaluationPeriod
        fields = [
            "id", "name", "academic_year", "semester", "semester_display",
            "evaluation_type", "evaluation_type_display",
            "start_date", "end_date", "extension_date",
            "status", "status_display", "is_active",
            "allow_late_submissions", "require_comments",
            "minimum_responses_required",
            "results_visible_to_teachers", "results_visible_to_students",
            "results_visibility_date",
            "description", "notes",
            "created_at", "updated_at", "created_by", "created_by_name",
            "is_current"
        ]
        read_only_fields = ["created_at", "updated_at"]


class EvaluationPeriodListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing periods"""
    semester_display = serializers.CharField(source='get_semester_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = EvaluationPeriod
        fields = [
            "id", "name", "academic_year", "semester", "semester_display",
            "evaluation_type", "start_date", "end_date",
            "status", "status_display", "is_active"
        ]


# =============================================================================
# EVALUATION CATEGORY SERIALIZERS
# =============================================================================

class EvaluationCategorySerializer(serializers.ModelSerializer):
    """Serializer for EvaluationCategory model"""
    
    class Meta:
        model = EvaluationCategory
        fields = [
            "id", "name", "code", "description",
            "weight", "display_order",
            "is_active", "is_required",
            "evaluation_period",
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]


class EvaluationCategoryDetailSerializer(serializers.ModelSerializer):
    """Detailed category serializer with questions"""
    questions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EvaluationCategory
        fields = [
            "id", "name", "code", "description",
            "weight", "display_order",
            "is_active", "is_required",
            "evaluation_period",
            "created_at", "updated_at",
            "questions_count"
        ]
        read_only_fields = ["created_at", "updated_at"]
    
    def get_questions_count(self, obj):
        return obj.questions.count() if hasattr(obj, 'questions') else 0


# =============================================================================
# EVALUATION QUESTION SERIALIZERS
# =============================================================================

class EvaluationQuestionSerializer(serializers.ModelSerializer):
    """Serializer for EvaluationQuestion model"""
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    
    class Meta:
        model = EvaluationQuestion
        fields = [
            "id", "question_number", "question_text", "question_type",
            "category", "category_name",
            "options", "is_required", "min_value", "max_value",
            "help_text", "display_order", "weight",
            "is_active", "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]


class EvaluationQuestionDetailSerializer(serializers.ModelSerializer):
    """Detailed question serializer with category info"""
    category = EvaluationCategorySerializer(read_only=True)
    
    class Meta:
        model = EvaluationQuestion
        fields = [
            "id", "question_number", "question_text", "question_type",
            "category", "options", "is_required",
            "min_value", "max_value", "help_text",
            "display_order", "weight", "is_active",
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]


# =============================================================================
# EVALUATION RESPONSE SERIALIZERS
# =============================================================================

class EvaluationResponseSerializer(serializers.ModelSerializer):
    """Serializer for EvaluationResponse model"""
    student_name = serializers.CharField(source='student.full_name', read_only=True, allow_null=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True)
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = EvaluationResponse
        fields = [
            "id", "student", "student_name", "teacher", "teacher_name",
            "period", "period_name", "question", "question_text",
            "rating", "text_response", "is_na",
            "created_at", "updated_at", "submitted_at"
        ]
        read_only_fields = ["created_at", "updated_at", "submitted_at"]


class EvaluationResponseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating evaluation responses"""
    
    class Meta:
        model = EvaluationResponse
        fields = [
            "student", "teacher", "period", "question",
            "rating", "text_response", "is_na"
        ]
    
    def validate(self, data):
        """Validate response data"""
        question = data.get('question')
        rating = data.get('rating')
        
        if question:
            if rating is not None and not question.is_na:
                if rating < question.min_value or rating > question.max_value:
                    raise serializers.ValidationError({
                        "rating": f"Rating must be between {question.min_value} and {question.max_value}"
                    })
        
        return data


class EvaluationResponseSubmitSerializer(serializers.Serializer):
    """Serializer for bulk response submission"""
    responses = EvaluationResponseCreateSerializer(many=True)
    evaluation_complete = serializers.BooleanField(default=False)


# =============================================================================
# EVALUATION REPORT SERIALIZERS
# =============================================================================

class EvaluationReportSerializer(serializers.ModelSerializer):
    """Serializer for EvaluationReport model"""
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = EvaluationReport
        fields = [
            "id", "report_type", "teacher", "teacher_name",
            "period", "period_name",
            "category_scores", "overall_score", "response_count",
            "strengths", "areas_for_improvement",
            "recommendations", "percentile_rank",
            "generated_at", "generated_by", "generated_by_name",
            "is_final", "created_at", "updated_at"
        ]
        read_only_fields = ["generated_at", "created_at", "updated_at"]


class EvaluationReportSummarySerializer(serializers.ModelSerializer):
    """Lightweight report serializer for listings"""
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True)
    
    class Meta:
        model = EvaluationReport
        fields = [
            "id", "report_type", "teacher", "teacher_name",
            "period", "period_name",
            "overall_score", "response_count",
            "generated_at", "is_final"
        ]


class TeacherEvaluationSummarySerializer(serializers.Serializer):
    """Summary serializer for teacher evaluation overview"""
    teacher_id = serializers.IntegerField()
    teacher_name = serializers.CharField()
    department = serializers.CharField()
    subject = serializers.CharField()
    total_responses = serializers.IntegerField()
    average_score = serializers.FloatField()
    score_breakdown = serializers.DictField()
    strengths = serializers.ListField()
    areas_for_improvement = serializers.ListField()
    report_generated = serializers.BooleanField()
    last_evaluation_date = serializers.DateTimeField(allow_null=True)


# =============================================================================
# NESTED SERIALIZERS FOR COMPLEX OPERATIONS
# =============================================================================

class PeriodWithCategoriesSerializer(serializers.ModelSerializer):
    """EvaluationPeriod with categories nested"""
    categories = EvaluationCategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = EvaluationPeriod
        fields = [
            "id", "name", "academic_year", "semester",
            "evaluation_type", "start_date", "end_date",
            "status", "is_active", "categories"
        ]


class CategoryWithQuestionsSerializer(serializers.ModelSerializer):
    """EvaluationCategory with questions nested"""
    questions = EvaluationQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = EvaluationCategory
        fields = [
            "id", "name", "code", "description",
            "weight", "display_order",
            "is_active", "is_required", "questions"
        ]


class TeacherEvaluationFormSerializer(serializers.Serializer):
    """Serializer for generating evaluation form data"""
    teacher = TeacherSerializer(read_only=True)
    period = EvaluationPeriodSerializer(read_only=True)
    categories = CategoryWithQuestionsSerializer(many=True, read_only=True)
    questions_count = serializers.IntegerField()