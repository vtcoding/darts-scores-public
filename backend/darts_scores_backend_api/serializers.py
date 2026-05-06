# serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import Match, Turn, PracticeMatch, PracticeTurn

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("username_already_exists")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
            refresh = self.get_token(self.user)
            data['refresh'] = str(refresh)
            data['access'] = str(refresh.access_token)
            data['username'] = self.user.username
            return data
        except Exception as e:
            # Check if it's an authentication error
            if 'No active account found' in str(e) or 'Authentication failed' in str(e):
                raise serializers.ValidationError("wrong_username_or_password")
            raise


class TurnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turn
        fields = ['score', 'leg', 'darts_used_on_double', 'leg_won', 'player']


class PracticeTurnSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeTurn
        fields = ['dart1', 'dart2', 'dart3']


class MatchSerializer(serializers.ModelSerializer):
    # turns is both read & write
    turns = TurnSerializer(many=True)

    class Meta:
        model = Match
        fields = ['id', 'mode', 'legs', 'players', 'started_at', 'ended_at', 'turns']

    def create(self, validated_data):
        turns_data = validated_data.pop('turns')
        user = self.context['request'].user

        match = Match.objects.create(user=user, **validated_data)

        # create all nested turns
        for t in turns_data:
            Turn.objects.create(match=match, **t)

        return match


class PracticeMatchSerializer(serializers.ModelSerializer):
    # turns is both read & write
    turns = PracticeTurnSerializer(many=True)

    class Meta:
        model = PracticeMatch
        fields = ['id', 'mode', 'finish_on', 'started_at', 'ended_at', 'turns']

    def create(self, validated_data):
        turns_data = validated_data.pop('turns')
        user = self.context['request'].user

        match = PracticeMatch.objects.create(user=user, **validated_data)

        # create all nested turns
        for t in turns_data:
            PracticeTurn.objects.create(match=match, **t)

        return match
