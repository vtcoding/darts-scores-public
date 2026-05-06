from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.cache import cache
from django.contrib.auth.models import User
from ..serializers import (
    UserSerializer,
    CustomTokenObtainPairSerializer
)

class CustomTokenObtainPairView(APIView):
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def is_rate_limited(self, ip):
        cache_key = f"login_attempts_{ip}"
        attempts = cache.get(cache_key, 0)
        
        if attempts >= 5:
            return True
        return False

    def increment_failed_attempt(self, ip):
        cache_key = f"login_attempts_{ip}"
        attempts = cache.get(cache_key, 0)
        cache.set(cache_key, attempts + 1, timeout=300)  # 5 minutes

    def clear_failed_attempts(self, ip):
        cache_key = f"login_attempts_{ip}"
        cache.delete(cache_key)

    def post(self, request, *args, **kwargs):
        ip = self.get_client_ip(request)
        
        # Check rate limit
        if self.is_rate_limited(ip):
            return Response({
                "error": "too_many_attempts", 
                "message": "Too many failed login attempts. Please try again in 5 minutes."
            }, status=429)
        
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            # Clear failed attempts on successful login
            self.clear_failed_attempts(ip)
            return Response(serializer.validated_data)
        except serializers.ValidationError as e:
            # Increment failed attempts
            self.increment_failed_attempt(ip)
            
            if "wrong_username_or_password" in str(e.detail):
                return Response({
                    "error": "wrong_username_or_password",
                    "message": "Invalid username or password"
                }, status=400)
            return Response(e.detail, status=400)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def is_registration_rate_limited(self, ip):
        cache_key = f"registration_attempts_{ip}"
        attempts = cache.get(cache_key, 0)
        
        if attempts >= 3:  # 3 registration attempts per hour
            return True
        return False

    def increment_registration_attempt(self, ip):
        cache_key = f"registration_attempts_{ip}"
        attempts = cache.get(cache_key, 0)
        cache.set(cache_key, attempts + 1, timeout=3600)  # 1 hour

    def create(self, request, *args, **kwargs):
        ip = self.get_client_ip(request)
        
        # Check registration rate limit
        if self.is_registration_rate_limited(ip):
            return Response({
                "error": "too_many_registration_attempts",
                "message": "Too many registration attempts. Please try again in 1 hour."
            }, status=429)
        
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            
            # Additional security checks
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            # Check if username contains suspicious patterns
            if any(pattern in username.lower() for pattern in ['admin', 'root', 'test', 'demo']):
                return Response({
                    "error": "invalid_username",
                    "message": "Username contains restricted words"
                }, status=400)
            
            self.perform_create(serializer)
            return Response(serializer.data, status=201)
            
        except serializers.ValidationError as e:
            # Increment failed registration attempt
            self.increment_registration_attempt(ip)
            
            # Check for username already exists error
            if ("username_already_exists" in str(e.detail) or 
                ("username" in e.detail and "already exists" in str(e.detail["username"]))):
                return Response({"error": "username_already_exists"}, status=409)
            return Response(e.detail, status=400)