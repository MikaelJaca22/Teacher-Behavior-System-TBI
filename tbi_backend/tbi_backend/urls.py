"""
URL configuration for tbi_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
# core/urls.py
from django.urls import path
from core.views import (
    StudentLoginAPIView, 
    TeacherListAPIView, 
    TeacherDetailAPIView, 
    EvaluationCreateAPIView,
    StudentEvaluationHistoryAPIView  # NEW - Import the new view
)
from django.shortcuts import redirect


urlpatterns = [
    path("login/", StudentLoginAPIView.as_view(), name="student-login"),
    path('teachers/', TeacherListAPIView.as_view(), name='teacher-list'),
    path('teachers/<int:teacher_id>/', TeacherDetailAPIView.as_view(), name='teacher-detail'),
    path('evaluations/', EvaluationCreateAPIView.as_view(), name='evaluation-create'),
    path('admin/', admin.site.urls),  
    
    # NEW - Student evaluation history endpoint
    path('student-evaluations/<str:student_email>/', 
         StudentEvaluationHistoryAPIView.as_view(), 
         name='student-evaluation-history'),
    
    path('', lambda request: redirect('student-login')),
]