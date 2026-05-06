from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Match, PracticeMatch
from ..serializers import MatchSerializer, PracticeMatchSerializer
from ..utils.stats_calculation import (
    calculate_total_first_nine_darts_average,
    calculate_first_nine_darts_average_trend,
    calculate_total_three_dart_average,
    calculate_three_dart_average_trend,
    calculate_total_checkout_percentage,
    calculate_checkout_percentage_trend,
    calculate_total_hit_rate,
    calculate_hit_rate_trend,
    calculate_sector_hit_rates,
)


class StatsGeneralView(APIView):
    def get(self, request):
        return Response(
            {
                "stats": [
                    calculate_total_three_dart_average(request.user),
                    calculate_total_first_nine_darts_average(request.user),
                    calculate_total_checkout_percentage(request.user)
                ],
                "practiceStats": [
                    calculate_total_hit_rate(request.user)
                ]
            },
            status=200
        )


class StatsTrendView(APIView):
    def get(self, request):
        stat = request.GET.get('stat', 'threeDartAverage')
        frequency = request.GET.get('frequency', 'daily')
        
        if stat == 'threeDartAverage':
            return Response(
                calculate_three_dart_average_trend(request.user, frequency),
                status=200
            )
        elif stat == 'firstNineDartsAverage':
            return Response(
                calculate_first_nine_darts_average_trend(request.user, frequency),
                status=200
            )
        elif stat == 'checkoutPercentage':
            return Response(
                calculate_checkout_percentage_trend(request.user, frequency),
            )
        elif stat == 'hitRate':
            return Response(
                calculate_hit_rate_trend(request.user, frequency),
            )
        else:
            return Response(
                {"error": f"Unknown stat type: {stat}"},
                status=400
            )

class StatsSectorHitRatesView(APIView):
    def get(self, request):
        sortBy = request.GET.get('sortBy', 'sector')
        sortOrder = request.GET.get('sortOrder', 'asc')

        return Response(
            calculate_sector_hit_rates(request.user, sortBy, sortOrder),
            status=200
        )


class StatsUploadAPIView(APIView):
    def post(self, request):
        data = request.data
        matches = data["matches"]
        practiceMatches = data["practiceMatches"]

        matchesSerializer = MatchSerializer(data=matches, many=True, context={'request': request})
        practiceMatchesSerializer = PracticeMatchSerializer(data=practiceMatches, many=True, context={'request': request})

        if matchesSerializer.is_valid() and practiceMatchesSerializer.is_valid():
            matchesSerializer.save()
            practiceMatchesSerializer.save()

        return Response(status=201)


class StatsDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        Match.objects.filter(user=request.user).delete()
        PracticeMatch.objects.filter(user=request.user).delete()

        return Response(status=204)