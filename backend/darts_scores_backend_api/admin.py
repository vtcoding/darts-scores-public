from django.contrib import admin
from .models import Match, Turn, PracticeMatch, PracticeTurn

# Inline for Turn
class TurnInline(admin.TabularInline):
    model = Turn
    extra = 1  # How many blank turns to show by default

# Inline for PracticeTurn
class PracticeTurnInline(admin.TabularInline):
    model = PracticeTurn
    extra = 1

# Register Match with Turn inline
@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'mode', 'legs', 'started_at', 'ended_at')
    inlines = [TurnInline]

# Register PracticeMatch with PracticeTurn inline
@admin.register(PracticeMatch)
class PracticeMatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'mode', 'finish_on', 'started_at', 'ended_at')
    inlines = [PracticeTurnInline]

# Optional: you can also register Turn and PracticeTurn individually
# admin.site.register(Turn)
# admin.site.register(PracticeTurn)

