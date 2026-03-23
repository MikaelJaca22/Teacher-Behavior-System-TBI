#!/usr/bin/env python
"""
Comprehensive test script for teacher evaluation submission flow.
Uses Django's test client with CSRF handling.
"""
import os
import sys
import django

sys.path.insert(0, 'tbi_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tbi_backend.settings')
django.setup()

from django.test import Client
from django.middleware.csrf import get_token
from core.models import Evaluation, EvaluationAnswer, Teacher

def run_migrations():
    print("=" * 60)
    print("1. RUNNING DJANGO MIGRATIONS")
    print("=" * 60)
    from django.core.management import call_command
    from io import StringIO
    out = StringIO()
    call_command('migrate', '--run-syncdb', stdout=out)
    print(out.getvalue())
    return True

def create_mock_teacher():
    """Ensure we have a teacher with ID 1"""
    if not Teacher.objects.filter(id=1).exists():
        print("Creating mock teacher with ID 1...")
        Teacher.objects.create(
            id=1,
            full_name="Dr. John Smith",
            department="Science",
            email="john.smith@tbi.edu"
        )
        print("Teacher created successfully!")
    else:
        print("Teacher with ID 1 already exists.")

def test_api_endpoint():
    print("\n" + "=" * 60)
    print("2. TESTING EVALUATION API ENDPOINT")
    print("=" * 60)
    
    # Use enforce_csrf_checks=False to bypass CSRF for testing
    client = Client(enforce_csrf_checks=False)
    
    url = "/api/evaluations/"
    
    payload = {
        "teacher": 1,
        "student": 1,
        "rating": 4,
        "comments": "Great teacher!",
        "answers": [
            {"question_number": 1, "rating": 5},
            {"question_number": 2, "rating": 4},
            {"question_number": 3, "rating": 5},
            {"question_number": 4, "rating": 4},
            {"question_number": 5, "rating": 5},
            {"question_number": 6, "rating": 4},
            {"question_number": 7, "rating": 5},
            {"question_number": 8, "rating": 4},
            {"question_number": 9, "rating": 5},
            {"question_number": 10, "rating": 4},
            {"question_number": 11, "rating": 5}
        ]
    }
    
    print(f"POST payload: {payload}")
    
    response = client.post(url, data=payload, content_type='application/json')
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {response.content.decode()}")
    
    return response.status_code in [200, 201], response

def verify_database():
    print("\n" + "=" * 60)
    print("3. VERIFYING DATA IN POSTGRESQL")
    print("=" * 60)
    
    eval_count = Evaluation.objects.count()
    answer_count = EvaluationAnswer.objects.count()
    
    print(f"\nEvaluations in database: {eval_count}")
    print(f"Evaluation Answers in database: {answer_count}")
    
    if eval_count > 0:
        print("\nLatest Evaluation Details:")
        print("-" * 60)
        latest = Evaluation.objects.order_by('-id').first()
        print(f"  ID: {latest.id}")
        print(f"  Teacher: {latest.teacher.full_name if latest.teacher else 'N/A'}")
        print(f"  Student: {latest.student_name}")
        print(f"  Rating: {latest.rating}/5")
        print(f"  Comments: {latest.comments}")
        print(f"  Submitted: {latest.submitted_at}")
        
        print("\n  Answers:")
        answers = latest.answers.all()
        for answer in answers:
            print(f"    {answer.question}: {answer.rating}/5")
    
    return eval_count > 0, answer_count > 0

def main():
    results = {
        "migrations": False,
        "api_submission": False,
        "data_saved": False
    }
    
    try:
        # Step 1: Run migrations
        results["migrations"] = run_migrations()
        
        # Step 2: Create mock teacher
        create_mock_teacher()
        
        # Step 3: Test API
        results["api_submission"], response = test_api_endpoint()
        
        # Step 4: Verify database
        results["data_saved"], _ = verify_database()
        
        # Final Report
        print("\n" + "=" * 60)
        print("FINAL TEST RESULTS")
        print("=" * 60)
        print(f"\n1. Migrations: {'PASSED' if results['migrations'] else 'FAILED'}")
        print(f"2. API Submission: {'PASSED' if results['api_submission'] else 'FAILED'}")
        print(f"3. Data Saved to PostgreSQL: {'PASSED' if results['data_saved'] else 'FAILED'}")
        print("\n" + "=" * 60)
        
        all_passed = all(results.values())
        print(f"OVERALL: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
        print("=" * 60)
        
        return 0 if all_passed else 1
        
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
