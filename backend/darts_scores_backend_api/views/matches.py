from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from ..models import Match, PracticeMatch
from ..serializers import (
    MatchSerializer, 
    PracticeMatchSerializer, 
)

class MatchPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = None


class MatchListAPIView(ListAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MatchPagination

    def get_queryset(self):
        return (
            Match.objects
            .filter(user=self.request.user)
            .prefetch_related('turns')
            .order_by('-ended_at')
        )


class MatchCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MatchSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            match = serializer.save()
            return Response(MatchSerializer(match).data, status=201)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=400)


class MatchDeleteAPIView(APIView):
    def delete(self, request):
        Match.objects.filter(pk=request.data["id"]).delete()
        return Response(status=204)


class PracticeMatchListAPIView(ListAPIView):
    serializer_class = PracticeMatchSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MatchPagination

    def get_queryset(self):
        return (
            PracticeMatch.objects
            .filter(user=self.request.user)
            .prefetch_related('turns')
            .order_by('-ended_at')
        )


class PracticeMatchCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PracticeMatchSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            match = serializer.save()
            return Response(status=201)
        return Response(serializer.errors, status=400)


class PracticeMatchDeleteAPIView(APIView):
    def delete(self, request):
        PracticeMatch.objects.filter(pk=request.data["id"]).delete()
        return Response(status=204)