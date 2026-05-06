from django.conf import settings
from django.db import models

class Match(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='matches')
    mode = models.CharField(max_length=50)
    legs = models.PositiveIntegerField()
    players = models.JSONField(default=list, null=True, blank=True)
    started_at = models.BigIntegerField()
    ended_at = models.BigIntegerField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Matches"

    def __str__(self):
        return f"Match {self.id} - {self.mode}"


class Turn(models.Model):
    match = models.ForeignKey(Match, related_name='turns', on_delete=models.CASCADE)
    score = models.IntegerField()
    leg = models.PositiveIntegerField()
    darts_used_on_double = models.PositiveIntegerField()
    leg_won = models.BooleanField(default=False, null=True, blank=True)
    player = models.BigIntegerField(null=True, blank=True)

    def __str__(self):
        return f"Turn for Match {self.match.id} - Leg {self.leg} - Score {self.score}"


class PracticeMatch(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='practice_matches')
    mode = models.CharField(max_length=50)
    finish_on = models.PositiveIntegerField()
    started_at = models.BigIntegerField()
    ended_at = models.BigIntegerField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "PracticeMatches"

    def __str__(self):
        return f"PracticeMatch {self.id} - {self.mode}"


class PracticeTurn(models.Model):
    match = models.ForeignKey(PracticeMatch, related_name='turns', on_delete=models.CASCADE)
    dart1 = models.IntegerField(null=True, blank=True)
    dart2 = models.IntegerField(null=True, blank=True)
    dart3 = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Turn for PracticeMatch {self.match.id} - Darts: {self.dart1}, {self.dart2}, {self.dart3}"

