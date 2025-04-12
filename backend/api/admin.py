from django.contrib import admin
from .models import Voter, Election, Position, Party, Candidate, Vote

@admin.register(Voter)
class VoterAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_id', 'get_username', 'wallet_address', 'is_verified', 'is_whitelisted')
    list_filter = ('is_verified', 'is_whitelisted')
    search_fields = ('student_id', 'user__username', 'wallet_address')
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'

@admin.register(Election)
class ElectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'start_time', 'end_time', 'status', 'is_active')
    list_filter = ('status',)
    search_fields = ('title', 'description')

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'election')
    list_filter = ('election',)
    search_fields = ('title', 'description')

@admin.register(Party)
class PartyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name', 'description')

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'position', 'party')
    list_filter = ('position__election', 'position', 'party')
    search_fields = ('name', 'bio', 'manifesto')

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'voter', 'election', 'position', 'candidate', 'timestamp')
    list_filter = ('election', 'position')
    search_fields = ('voter__student_id', 'candidate__name')
