from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path("register/", views.auth.RegisterView.as_view(), name="register"),
    path("login/", views.auth.CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Matches
    path("matches/", views.matches.MatchListAPIView.as_view(), name="matches"),
    path("matches/upload/", views.matches.MatchCreateAPIView.as_view(), name="match-create"),
    path("matches/delete/", views.matches.MatchDeleteAPIView.as_view(), name="match-delete"),
    path("practice-matches/", views.matches.PracticeMatchListAPIView.as_view(), name="practice-matches"),
    path("practice-matches/upload/", views.matches.PracticeMatchCreateAPIView.as_view(), name="practice-match-create"),
    path("practice-matches/delete/", views.matches.PracticeMatchDeleteAPIView.as_view(), name="practicematch-delete"),

    # Statistics
    path("stats/general/", views.stats.StatsGeneralView.as_view(), name="stats-general"),
    path("stats/trend/", views.stats.StatsTrendView.as_view(), name="stats-trend"),
    path("stats/hit-rates/", views.stats.StatsSectorHitRatesView.as_view(), name="stats-hit-rates"),
    path("stats/delete/", views.stats.StatsDeleteAPIView.as_view(), name="stats-delete"),
    # path("stats/upload/", views.stats.StatsUploadAPIView.as_view(), name="stats-upload"),
]

