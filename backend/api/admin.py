from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Election, Position, Party, Candidate, Vote

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'student_id', 'is_admin', 'is_whitelisted')
    list_filter = ('is_admin', 'is_whitelisted')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'student_id')}),
        ('Blockchain', {'fields': ('wallet_address', 'is_whitelisted')}),
        ('Permissions', {'fields': ('is_active', 'is_admin', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    search_fields = ('username', 'email', 'first_name', 'last_name', 'student_id')

class PositionInline(admin.TabularInline):
    model = Position
    extra = 1

class CandidateInline(admin.TabularInline):
    model = Candidate
    extra = 1

class ElectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'start_time', 'end_time', 'contract_address')
    list_filter = ('status',)
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PositionInline]

class PositionAdmin(admin.ModelAdmin):
    list_display = ('title', 'election', 'position_id')
    list_filter = ('election',)
    search_fields = ('title',)
    inlines = [CandidateInline]

class CandidateAdmin(admin.ModelAdmin):
    list_display = ('name', 'election', 'position', 'party', 'candidate_id')
    list_filter = ('election', 'position', 'party')
    search_fields = ('name', 'bio')

class VoteAdmin(admin.ModelAdmin):
    list_display = ('election', 'position', 'candidate', 'wallet', 'timestamp')
    list_filter = ('election', 'position')
    search_fields = ('wallet', 'transaction_hash')
    readonly_fields = ('timestamp',)

# Register the models
admin.site.register(User, CustomUserAdmin)
admin.site.register(Election, ElectionAdmin)
admin.site.register(Position, PositionAdmin)
admin.site.register(Party)
admin.site.register(Candidate, CandidateAdmin)
admin.site.register(Vote, VoteAdmin)
