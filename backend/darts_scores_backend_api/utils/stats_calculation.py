from django.db.models import F, FloatField, ExpressionWrapper, Window, Avg, Min, Max, Sum
from django.db.models.functions import RowNumber
from django.utils import timezone
from datetime import datetime
from collections import defaultdict
from ..models import Turn, PracticeTurn, Match
from . import types 


def calculate_total_three_dart_average(user):
    """
    Three dart average stats:
    - average: Avg of all turn scores
    - best: highest match-level average + match_id
    - worst: lowest match-level average + match_id
    """

    # Overall average (all turns)
    overall_avg = (
        Turn.objects
        .filter(match__user=user, player=1)
        .aggregate(avg=Avg('score'))
    )['avg']

    # Average per match
    per_match = (
        Turn.objects
        .filter(match__user=user, player=1)
        .values('match_id')
        .annotate(match_avg=Avg('score'))
        .order_by('match_avg')
    )

    if not per_match.exists():
        return {
            "type": types.THREE_DART_AVERAGE,
            "average": {"value": "-", "unit": ""},
            "best": {"value": "-", "unit": "", "match_id": None},
            "worst": {"value": "-", "unit": "", "match_id": None},
        }

    worst_match = per_match.first()
    best_match = per_match.last()

    return {
        "type": types.THREE_DART_AVERAGE,
        "average": {
            "value": round(overall_avg, 2) if overall_avg is not None else "-",
            "unit": ""
        },
        "best": {
            "value": round(best_match["match_avg"], 2),
            "unit": "",
            "match_id": best_match["match_id"],
        },
        "worst": {
            "value": round(worst_match["match_avg"], 2),
            "unit": "",
            "match_id": worst_match["match_id"],
        }
    }


def calculate_three_dart_average_trend(user, frequency):
    """
    Calculate three dart average trend based on frequency:
    - daily: every day's average (Finnish date format)
    - weekly: every week's average (W+week/year format)
    - monthly: every month's average (month/year format)
    - yearly: every year's average (year format)
    """
    
    # Get all turns for the user with match end timestamps
    turns_with_dates = (
        Turn.objects
        .filter(match__user=user, match__ended_at__isnull=False, player=1)
        .annotate(
            match_ended_at=F('match__ended_at')
        )
    )
    
    if not turns_with_dates.exists():
        return {
            "type": types.THREE_DART_AVERAGE,
            "trend": []
        }
    
    # Convert timestamp to datetime and group by frequency
    trend_data = []
    
    # Get all turns and process in Python since we're dealing with timestamps
    turns_list = list(turns_with_dates.values('match_ended_at', 'score'))
    
    # Group by frequency based on timestamp
    grouped_data = defaultdict(list)
    
    for turn in turns_list:
        timestamp = turn['match_ended_at']
        score = turn['score']
        
        # Convert timestamp (milliseconds) to datetime
        dt = datetime.fromtimestamp(timestamp / 1000)
        
        # Create grouping key based on frequency
        if frequency == 'daily':
            key = dt.strftime('%Y-%m-%d')
            date_format = '%d.%m.%Y'  # Finnish day format
        elif frequency == 'weekly':
            # Get ISO week number and year
            week_num = dt.isocalendar()[1]
            key = f"{dt.year}-W{week_num:02d}"
            # Custom format for week: W+week/year
            def format_week_from_key(k):
                year, week = k.split('-W')
                return f"W{int(week)}/{year}"
        elif frequency == 'monthly':
            key = dt.strftime('%Y-%m')
            date_format = '%m/%Y'  # month/year format
        elif frequency == 'yearly':
            key = dt.strftime('%Y')
            date_format = '%Y'  # year format
        else:
            raise ValueError(f"Invalid frequency: {frequency}")
        
        grouped_data[key].append(score)
    
    # Calculate averages for each period
    for key, scores in sorted(grouped_data.items()):
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Format the date label
        if frequency == 'daily':
            dt = datetime.strptime(key, '%Y-%m-%d')
            date_label = dt.strftime(date_format)
        elif frequency == 'weekly':
            date_label = format_week_from_key(key)
        elif frequency == 'monthly':
            dt = datetime.strptime(key, '%Y-%m')
            date_label = dt.strftime(date_format)
        elif frequency == 'yearly':
            date_label = key
        
        trend_data.append({
            "label": date_label,
            "value": round(avg_score, 2)
        })
    
    return {
        "type": types.THREE_DART_AVERAGE,
        "trend": trend_data
    }

def calculate_total_first_nine_darts_average(user):
    """
    First 9 darts average:
    - first 3 turns per leg (ordered by Turn.id)
    - average per leg
    - average per match
    - average across all matches
    - best & worst match averages + match_id
    """

    # First 3 turns per leg
    first_three_turns = (
        Turn.objects
        .filter(match__user=user, player=1)
        .annotate(
            turn_idx=Window(
                expression=RowNumber(),
                partition_by=[F('match_id'), F('leg')],
                order_by=F('id').asc()
            )
        )
        .filter(turn_idx__lte=3)
    )

    # Average per leg
    first9_per_leg = (
        first_three_turns
        .values('match_id', 'leg')
        .annotate(leg_avg=Avg('score'))
    )

    if not first9_per_leg.exists():
        return {
            "type": types.FIRST_NINE_DARTS_AVERAGE,
            "average": {"value": "-", "unit": ""},
            "best": {"value": "-", "unit": "", "match_id": None},
            "worst": {"value": "-", "unit": "", "match_id": None},
        }

    # Average per match
    per_match = defaultdict(list)
    for row in first9_per_leg:
        per_match[row["match_id"]].append(row["leg_avg"])

    match_averages = [
        {
            "match_id": match_id,
            "avg": sum(legs) / len(legs)
        }
        for match_id, legs in per_match.items()
        if legs
    ]

    # Global average (average of match averages)
    overall_avg = sum(m["avg"] for m in match_averages) / len(match_averages)

    # Best / worst match
    best_match = max(match_averages, key=lambda x: x["avg"])
    worst_match = min(match_averages, key=lambda x: x["avg"])

    return {
        "type": types.FIRST_NINE_DARTS_AVERAGE,
        "average": {
            "value": round(overall_avg, 2),
            "unit": ""
        },
        "best": {
            "value": round(best_match["avg"], 2),
            "unit": "",
            "match_id": best_match["match_id"],
        },
        "worst": {
            "value": round(worst_match["avg"], 2),
            "unit": "",
            "match_id": worst_match["match_id"],
        }
    }


def calculate_first_nine_darts_average_trend(user, frequency):
    """
    Calculate first nine darts average trend based on frequency:
    - daily: every day's average (Finnish date format)
    - weekly: every week's average (W+week/year format)
    - monthly: every month's average (month/year format)
    - yearly: every year's average (year format)
    """
    
    # First 3 turns per leg (ordered by Turn.id)
    first_three_turns = (
        Turn.objects
        .filter(match__user=user, match__ended_at__isnull=False, player=1)
        .annotate(
            match_ended_at=F('match__ended_at'),
            turn_idx=Window(
                expression=RowNumber(),
                partition_by=[F('match_id'), F('leg')],
                order_by=F('id').asc()
            )
        )
        .filter(turn_idx__lte=3)
    )
    
    if not first_three_turns.exists():
        return {
            "type": types.FIRST_NINE_DARTS_AVERAGE,
            "trend": []
        }
    
    # Get all first three turns and process in Python since we're dealing with timestamps
    turns_list = list(first_three_turns.values('match_ended_at', 'score'))
    
    # Group by frequency based on timestamp
    grouped_data = defaultdict(list)
    
    for turn in turns_list:
        timestamp = turn['match_ended_at']
        score = turn['score']
        
        # Convert timestamp (milliseconds) to datetime
        dt = datetime.fromtimestamp(timestamp / 1000)
        
        # Create grouping key based on frequency
        if frequency == 'daily':
            key = dt.strftime('%Y-%m-%d')
            date_format = '%d.%m.%Y'  # Finnish day format
        elif frequency == 'weekly':
            # Get ISO week number and year
            week_num = dt.isocalendar()[1]
            key = f"{dt.year}-W{week_num:02d}"
            # Custom format for week: W+week/year
            def format_week_from_key(k):
                year, week = k.split('-W')
                return f"W{int(week)}/{year}"
        elif frequency == 'monthly':
            key = dt.strftime('%Y-%m')
            date_format = '%m/%Y'  # month/year format
        elif frequency == 'yearly':
            key = dt.strftime('%Y')
            date_format = '%Y'  # year format
        else:
            raise ValueError(f"Invalid frequency: {frequency}")
        
        grouped_data[key].append(score)
    
    # Calculate averages for each period
    trend_data = []
    for key, scores in sorted(grouped_data.items()):
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Format the date label
        if frequency == 'daily':
            dt = datetime.strptime(key, '%Y-%m-%d')
            date_label = dt.strftime(date_format)
        elif frequency == 'weekly':
            date_label = format_week_from_key(key)
        elif frequency == 'monthly':
            dt = datetime.strptime(key, '%Y-%m')
            date_label = dt.strftime(date_format)
        elif frequency == 'yearly':
            date_label = key
        
        trend_data.append({
            "label": date_label,
            "value": round(avg_score, 2)
        })
    
    return {
        "type": types.FIRST_NINE_DARTS_AVERAGE,
        "trend": trend_data
    }    


def calculate_total_checkout_percentage(user):
    """
    Checkout percentage:
    - 100 / total darts_used_on_double from all turns in each leg (only legs that were eventually won)
    - average per match
    - average across all matches
    - best & worst match averages + match_id
    """

    legs = (
        Turn.objects
        .filter(
            match__user=user,
            player=1 # Player with number 1 is always the user in Turn. It isn't same as user ID
        )
        .values_list('match_id', 'leg')
    )

    if not legs:
        return {
            "type": types.CHECKOUT_PERCENTAGE,
            "average": {"value": "-", "unit": "%"},
            "best": {"value": "-", "unit": "%", "match_id": None},
            "worst": {"value": "-", "unit": "%", "match_id": None},
        }

    # Calculate total darts on double per leg (all turns in won legs)
    legs_with_checkout_data = []
    for match_id, leg in legs:
        total_darts = (
            Turn.objects
            .filter(
                match__user=user,
                match_id=match_id,
                leg=leg,
                player=1
            )
            .aggregate(
                total_darts_on_double=Sum('darts_used_on_double')
            )['total_darts_on_double'] or 0
        )
        
        if total_darts > 0:
            leg_pct = 100.0 / total_darts
            legs_with_checkout_data.append({
                'match_id': match_id,
                'leg': leg,
                'leg_pct': leg_pct
            })

    if not legs_with_checkout_data:
        return {
            "type": types.CHECKOUT_PERCENTAGE,
            "average": {"value": "-", "unit": "%"},
            "best": {"value": "-", "unit": "%", "match_id": None},
            "worst": {"value": "-", "unit": "%", "match_id": None},
        }

    # Average per match
    per_match = defaultdict(list)
    for row in legs_with_checkout_data:
        per_match[row["match_id"]].append(row["leg_pct"])

    match_averages = [
        {
            "match_id": match_id,
            "avg": sum(legs) / len(legs)
        }
        for match_id, legs in per_match.items()
        if legs
    ]

    # Global average
    overall_avg = sum(m["avg"] for m in match_averages) / len(match_averages)

    # Best / worst match
    best_match = max(match_averages, key=lambda x: x["avg"])
    worst_match = min(match_averages, key=lambda x: x["avg"])

    return {
        "type": types.CHECKOUT_PERCENTAGE,
        "average": {
            "value": round(overall_avg, 2),
            "unit": "%"
        },
        "best": {
            "value": round(best_match["avg"], 2),
            "unit": "%",
            "match_id": best_match["match_id"],
        },
        "worst": {
            "value": round(worst_match["avg"], 2),
            "unit": "%",
            "match_id": worst_match["match_id"],
        }
    }


def calculate_checkout_percentage_trend(user, frequency):
    """
    Calculate checkout percentage trend based on frequency:
    - daily: every day's average (Finnish date format)
    - weekly: every week's average (W+week/year format)
    - monthly: every month's average (month/year format)
    - yearly: every year's average (year format)
    """
    
    # Get all legs with checkout data and match end timestamps
    legs_with_checkout_data = []
    
    # Get all legs for the user
    legs = (
        Turn.objects
        .filter(
            match__user=user,
            match__ended_at__isnull=False,
            player=1
        )
        .values_list('match_id', 'leg')
        .distinct()
    )
    
    # Calculate checkout percentage for each leg
    for match_id, leg in legs:
        total_darts = (
            Turn.objects
            .filter(
                match__user=user,
                match_id=match_id,
                leg=leg,
                player=1
            )
            .aggregate(
                total_darts_on_double=Sum('darts_used_on_double')
            )['total_darts_on_double'] or 0
        )
        
        if total_darts > 0:
            leg_pct = 100.0 / total_darts
            
            # Get the match end timestamp
            match_end_time = (
                Turn.objects
                .filter(match_id=match_id, leg=leg, player=1)
                .first()
                .match.ended_at
            )
            
            if match_end_time:
                legs_with_checkout_data.append({
                    'timestamp': match_end_time,
                    'percentage': leg_pct
                })
    
    if not legs_with_checkout_data:
        return {
            "type": types.CHECKOUT_PERCENTAGE,
            "trend": []
        }
    
    # Group by frequency based on timestamp
    grouped_data = defaultdict(list)
    
    for leg_data in legs_with_checkout_data:
        timestamp = leg_data['timestamp']
        percentage = leg_data['percentage']
        
        # Convert timestamp (milliseconds) to datetime
        dt = datetime.fromtimestamp(timestamp / 1000)
        
        # Create grouping key based on frequency
        if frequency == 'daily':
            key = dt.strftime('%Y-%m-%d')
            date_format = '%d.%m.%Y'  # Finnish day format
        elif frequency == 'weekly':
            # Get ISO week number and year
            week_num = dt.isocalendar()[1]
            key = f"{dt.year}-W{week_num:02d}"
            # Custom format for week: W+week/year
            def format_week_from_key(k):
                year, week = k.split('-W')
                return f"W{int(week)}/{year}"
        elif frequency == 'monthly':
            key = dt.strftime('%Y-%m')
            date_format = '%m/%Y'  # month/year format
        elif frequency == 'yearly':
            key = dt.strftime('%Y')
            date_format = '%Y'  # year format
        else:
            raise ValueError(f"Invalid frequency: {frequency}")
        
        grouped_data[key].append(percentage)
    
    # Calculate averages for each period
    trend_data = []
    for key, percentages in sorted(grouped_data.items()):
        avg_percentage = sum(percentages) / len(percentages) if percentages else 0
        
        # Format the date label
        if frequency == 'daily':
            dt = datetime.strptime(key, '%Y-%m-%d')
            date_label = dt.strftime(date_format)
        elif frequency == 'weekly':
            date_label = format_week_from_key(key)
        elif frequency == 'monthly':
            dt = datetime.strptime(key, '%Y-%m')
            date_label = dt.strftime(date_format)
        elif frequency == 'yearly':
            date_label = key
        
        trend_data.append({
            "label": date_label,
            "value": round(avg_percentage, 2)
        })
    
    return {
        "type": types.CHECKOUT_PERCENTAGE,
        "trend": trend_data
    }


def calculate_total_hit_rate(user):
    """
    Hit rate for practice turns:
    - hit darts: dart values that are not null and not -1
    - total darts: dart values that are not null (regardless of -1)
    - hit rate = (hit darts / total darts) * 100
    - overall: average across all practice matches
    - best: highest match-level hit rate + match_id
    - worst: lowest match-level hit rate + match_id
    """
    
    # Get all practice turns for the user
    practice_turns = (
        PracticeTurn.objects
        .filter(match__user=user)
        .select_related('match')
    )
    
    if not practice_turns.exists():
        return {
            "type": types.HIT_RATE,
            "average": {"value": "-", "unit": "%"},
            "best": {"value": "-", "unit": "%", "match_id": None},
            "worst": {"value": "-", "unit": "%", "match_id": None},
        }
    
    # Calculate hit rate per match
    match_hit_rates = []
    matches_data = {}
    
    for turn in practice_turns:
        match_id = turn.match_id
        
        if match_id not in matches_data:
            matches_data[match_id] = {"hit_darts": 0, "total_darts": 0}
        
        # Process each dart
        darts = [turn.dart1, turn.dart2, turn.dart3]
        for dart in darts:
            if dart is not None:
                matches_data[match_id]["total_darts"] += 1
                if dart != -1:
                    matches_data[match_id]["hit_darts"] += 1
    
    # Calculate hit rates for each match
    for match_id, data in matches_data.items():
        if data["total_darts"] > 0:
            hit_rate = (data["hit_darts"] / data["total_darts"]) * 100
            match_hit_rates.append({
                "match_id": match_id,
                "hit_rate": hit_rate
            })
    
    if not match_hit_rates:
        return {
            "type": types.HIT_RATE,
            "average": {"value": "-", "unit": "%"},
            "best": {"value": "-", "unit": "%", "match_id": None},
            "worst": {"value": "-", "unit": "%", "match_id": None},
        }
    
    # Calculate overall average (average of match hit rates)
    overall_avg = sum(match["hit_rate"] for match in match_hit_rates) / len(match_hit_rates)
    
    # Find best and worst matches
    best_match = max(match_hit_rates, key=lambda x: x["hit_rate"])
    worst_match = min(match_hit_rates, key=lambda x: x["hit_rate"])
    
    return {
        "type": types.HIT_RATE,
        "average": {
            "value": round(overall_avg, 2),
            "unit": "%"
        },
        "best": {
            "value": round(best_match["hit_rate"], 2),
            "unit": "%",
            "match_id": best_match["match_id"],
        },
        "worst": {
            "value": round(worst_match["hit_rate"], 2),
            "unit": "%",
            "match_id": worst_match["match_id"],
        }
    }


def calculate_hit_rate_trend(user, frequency):
    """
    Calculate hit rate trend based on frequency:
    - daily: every day's average (Finnish date format)
    - weekly: every week's average (W+week/year format)
    - monthly: every month's average (month/year format)
    - yearly: every year's average (year format)
    """
    
    # Get all practice turns for the user with match end timestamps
    practice_turns = (
        PracticeTurn.objects
        .filter(match__user=user, match__ended_at__isnull=False)
        .select_related('match')
    )

    if not practice_turns.exists():
        return {
            "type": types.HIT_RATE,
            "trend": []
        }
    
    # Calculate hit rate per match
    matches_data = {}
    
    for turn in practice_turns:
        match_id = turn.match_id
        match_end_time = turn.match.ended_at
        
        if match_id not in matches_data:
            matches_data[match_id] = {
                "hit_darts": 0, 
                "total_darts": 0,
                "timestamp": match_end_time
            }
        
        # Process each dart
        darts = [turn.dart1, turn.dart2, turn.dart3]
        for dart in darts:
            if dart is not None:
                matches_data[match_id]["total_darts"] += 1
                if dart != -1:
                    matches_data[match_id]["hit_darts"] += 1
    
    # Calculate hit rate for each match and group by frequency
    grouped_data = defaultdict(list)
    
    for match_id, data in matches_data.items():
        if data["total_darts"] > 0:
            hit_rate = (data["hit_darts"] / data["total_darts"]) * 100
            timestamp = data["timestamp"]
            
            # Convert timestamp (milliseconds) to datetime
            dt = datetime.fromtimestamp(timestamp / 1000)
            
            # Create grouping key based on frequency
            if frequency == 'daily':
                key = dt.strftime('%Y-%m-%d')
                date_format = '%d.%m.%Y'  # Finnish day format
            elif frequency == 'weekly':
                # Get ISO week number and year
                week_num = dt.isocalendar()[1]
                key = f"{dt.year}-W{week_num:02d}"
                # Custom format for week: W+week/year
                def format_week_from_key(k):
                    year, week = k.split('-W')
                    return f"W{int(week)}/{year}"
            elif frequency == 'monthly':
                key = dt.strftime('%Y-%m')
                date_format = '%m/%Y'  # month/year format
            elif frequency == 'yearly':
                key = dt.strftime('%Y')
                date_format = '%Y'  # year format
            else:
                raise ValueError(f"Invalid frequency: {frequency}")
            
            grouped_data[key].append(hit_rate)
    
    # Calculate averages for each period
    trend_data = []
    for key, hit_rates in sorted(grouped_data.items()):
        avg_hit_rate = sum(hit_rates) / len(hit_rates) if hit_rates else 0
        
        # Format the date label
        if frequency == 'daily':
            dt = datetime.strptime(key, '%Y-%m-%d')
            date_label = dt.strftime(date_format)
        elif frequency == 'weekly':
            date_label = format_week_from_key(key)
        elif frequency == 'monthly':
            dt = datetime.strptime(key, '%Y-%m')
            date_label = dt.strftime(date_format)
        elif frequency == 'yearly':
            date_label = key
        
        trend_data.append({
            "label": date_label,
            "value": round(avg_hit_rate, 2)
        })
    
    return {
        "type": types.HIT_RATE,
        "trend": trend_data
    }


def calculate_sector_hit_rates(user, sortBy, sortOrder):
    """
    Calculate sector hit rates for a user.
    
    Returns:
        list: List with sector hit rates ordered by sector or hit rate
    """

    practice_turns = (
        PracticeTurn.objects
        .filter(match__user=user, match__ended_at__isnull=False)
        .select_related('match')
    )

    if not practice_turns.exists():
        return {
            "type": types.SECTOR_HIT_RATES,
            "data": []
        }

    sectors = {}

    misses = 0
    for turn in practice_turns:
        for dart in [turn.dart1, turn.dart2, turn.dart3]:
            if dart == -1:
                misses += 1
            elif dart is not None and dart != -1:
                if dart not in sectors:
                    sectors[dart] = {
                        "hits": 1,
                        "misses": misses
                    }
                else:
                    sectors[dart]["hits"] = sectors[dart]["hits"] + 1
                    sectors[dart]["misses"] = sectors[dart]["misses"] + misses
                misses = 0

    result = []
    for sector, data in sectors.items():
        hit_rate = data["hits"] / (data["hits"] + data["misses"]) * 100
        result.append({
            "sector": sector,
            "rate": round(hit_rate, 2)
        })

    print(sortOrder)

    if sortBy == "rate":
        result.sort(key=lambda x: x["rate"], reverse=True if sortOrder == "desc" else False)
    else:
        result.sort(key=lambda x: x["sector"], reverse=True if sortOrder == "desc" else False)

    return {
        "type": types.SECTOR_HIT_RATES,
        "data": result
    }