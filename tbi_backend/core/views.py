from django.shortcuts import render
# core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import Student, Teacher, Evaluation, EvaluationAnswer, EvaluationPeriod
from .serializers import StudentSerializer, TeacherSerializer, EvaluationSerializer, EvaluationCreateSerializer

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class StudentLoginAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(email=email, password=password)

        if user:
            serializer = StudentSerializer(user)
            return Response({"success": True, "student": serializer.data})

        return Response(
            {"success": False, "error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )


class TeacherListAPIView(APIView):
    """GET: Retrieve all teachers"""
    def get(self, request):
        teachers = Teacher.objects.all()
        serializer = TeacherSerializer(teachers, many=True)
        return Response({"success": True, "teachers": serializer.data})


class TeacherDetailAPIView(APIView):
    """GET: Retrieve a single teacher by ID"""
    def get(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            serializer = TeacherSerializer(teacher)
            return Response({"success": True, "teacher": serializer.data})
        except Teacher.DoesNotExist:
            return Response(
                {"success": False, "error": "Teacher not found"},
                status=status.HTTP_404_NOT_FOUND
            )


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


@method_decorator(csrf_exempt, name='dispatch')
class EvaluationCreateAPIView(APIView):
    """POST: Submit a new evaluation with full student information"""
    def post(self, request):
        # Extract student information from Firebase/Frontend
        student_data = {
            'email': request.data.get('student_email'),
            'student_id': request.data.get('student_id'),
            'first_name': request.data.get('student_first_name', ''),
            'last_name': request.data.get('student_last_name', ''),
        }
        
        # Extract evaluation data
        teacher_id = request.data.get('teacher_id')
        rating = request.data.get('rating')
        comments = request.data.get('comments', '')
        answers = request.data.get('answers', [])
        
        # Validate required fields
        if not teacher_id or not rating:
            return Response(
                {"success": False, "error": "teacher_id and rating are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not student_data['email'] or not student_data['student_id']:
            return Response(
                {"success": False, "error": "student_email and student_id are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure rating is an integer
        try:
            rating = int(rating)
        except (ValueError, TypeError):
            return Response(
                {"success": False, "error": "rating must be a valid integer"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create the teacher
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response(
                {"success": False, "error": "Teacher not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get or create the student based on email and student_id
        student, created = Student.objects.get_or_create(
            email=student_data['email'],
            defaults={
                'student_id': student_data['student_id'],
                'first_name': student_data['first_name'],
                'last_name': student_data['last_name'],
            }
        )
        
        # If student exists but data changed, update it
        if not created:
            updated = False
            if student.student_id != student_data['student_id']:
                student.student_id = student_data['student_id']
                updated = True
            if student.first_name != student_data['first_name']:
                student.first_name = student_data['first_name']
                updated = True
            if student.last_name != student_data['last_name']:
                student.last_name = student_data['last_name']
                updated = True
            if updated:
                student.save()
        
        # Get or create an active evaluation period
        evaluation_period, created = EvaluationPeriod.objects.get_or_create(
            status='active',
            defaults={
                'name': 'Academic Year 2025-2026',
                'academic_year': '2025-2026',
                'semester': 'first',
                'start_date': timezone.now(),
                'end_date': timezone.now() + timedelta(days=120),
            }
        )
        
        # Check if student already evaluated this teacher in this period
        existing_evaluation = Evaluation.objects.filter(
            student=student,
            teacher=teacher,
            evaluation_period=evaluation_period
        ).first()
        
        if existing_evaluation:
            return Response({
                "success": False,
                "error": "You have already evaluated this teacher for this period",
                "evaluation_id": existing_evaluation.id
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create evaluation with full tracking
        evaluation = Evaluation.objects.create(
            teacher=teacher,
            student=student,
            evaluation_period=evaluation_period,
            rating=rating,
            comments=comments,
            status='submitted',
            submitted_at=timezone.now()
        )
        
        # Create evaluation answers with ALL denormalized student/teacher data
        for answer_data in answers:
            question_number = answer_data.get("question_number")
            answer_rating = answer_data.get("rating")
            
            if question_number and answer_rating:
                try:
                    answer_rating = int(answer_rating)
                    EvaluationAnswer.objects.create(
                        evaluation=evaluation,
                        question=f"Question {question_number}",
                        question_number=question_number,
                        rating=answer_rating,
                        # Student details (WHO evaluated)
                        student_name=student.full_name,
                        student_email=student.email,
                        student_id=student.student_id,
                        # Teacher details (WHOM they evaluated)
                        teacher_name=teacher.full_name,
                        teacher_subject=teacher.subject,
                        teacher_department=teacher.department,
                        # Evaluation summary
                        overall_score=rating,  # Overall rating from evaluation
                        evaluation_comments=comments,  # General comments
                        # Timestamp
                        answered_at=timezone.now()
                    )
                except (ValueError, TypeError):
                    pass  # Skip invalid ratings
        
        # Prepare response data
        response_data = {
            "success": True,
            "message": "Evaluation submitted successfully",
            "evaluation": {
                "id": evaluation.id,
                "teacher": {
                    "id": teacher.id,
                    "name": teacher.full_name,
                    "subject": teacher.subject,
                    "department": teacher.department
                },
                "student": {
                    "id": student.id,
                    "email": student.email,
                    "student_id": student.student_id,
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "full_name": student.full_name
                },
                "evaluation_period": {
                    "id": evaluation_period.id,
                    "name": evaluation_period.name,
                    "academic_year": evaluation_period.academic_year
                },
                "rating": evaluation.rating,
                "comments": evaluation.comments,
                "submitted_at": evaluation.submitted_at,
                "answers_count": evaluation.legacy_answers.count()
            }
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class StudentEvaluationHistoryAPIView(APIView):
    """GET: Get evaluation history for a specific student"""
    def get(self, request, student_email):
        try:
            student = Student.objects.get(email=student_email)
        except Student.DoesNotExist:
            return Response(
                {"success": False, "error": "Student not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        evaluations = Evaluation.objects.filter(student=student).select_related(
            'teacher', 'evaluation_period'
        ).order_by('-submitted_at')
        
        evaluation_data = []
        for eval in evaluations:
            evaluation_data.append({
                "id": eval.id,
                "teacher": {
                    "id": eval.teacher.id,
                    "name": eval.teacher.full_name,
                    "subject": eval.teacher.subject
                },
                "evaluation_period": eval.evaluation_period.name if eval.evaluation_period else None,
                "rating": eval.rating,
                "comments": eval.comments,
                "submitted_at": eval.submitted_at,
                "status": eval.status
            })
        
        return Response({
            "success": True,
            "student": {
                "email": student.email,
                "student_id": student.student_id,
                "full_name": student.full_name
            },
            "evaluations": evaluation_data,
            "total_evaluations": len(evaluation_data)
        })