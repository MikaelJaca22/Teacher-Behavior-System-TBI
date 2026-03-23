#!/usr/bin/env python
"""Verify evaluations in the database"""
import os
import sys
import django

sys.path.insert(0, 'tbi_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tbi_backend.settings')
django.setup()

from core.models import Evaluation, Teacher

print("=" * 60)
print("DATABASE VERIFICATION REPORT")
print("=" * 60)

# Count teachers
teacher_count = Teacher.objects.count()
print(f"\n1. TEACHERS IN DATABASE: {teacher_count}")

# Count evaluations
eval_count = Evaluation.objects.count()
print(f"2. EVALUATIONS IN DATABASE: {eval_count}")

# Show latest evaluations
if eval_count > 0:
    print("\n3. LATEST EVALUATIONS:")
    print("-" * 60)
    for e in Evaluation.objects.all().order_by('-id')[:5]:
        print(f"   ID: {e.id}")
        print(f"   Teacher: {e.teacher.full_name}")
        print(f"   Student: {e.student_name}")
        print(f"   Rating: {e.rating}/5")
        print(f"   Comments: {e.comments[:100] if e.comments else 'None'}...")
        print(f"   Submitted: {e.submitted_at}")
        print("-" * 60)
else:
    print("\n3. No evaluations found in database.")

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
