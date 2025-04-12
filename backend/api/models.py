from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Voter(models.Model):
    """
    Represents a voter in the system. Extends the Django User model.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='voter')
    student_id = models.CharField(max_length=20, unique=True)
    wallet_address = models.CharField(max_length=42, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    is_whitelisted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.student_id})"

class Election(models.Model):
    """
    Represents an election in the system.
    """
    PHASE_CHOICES = [
        ('init', 'Initialization'),
        ('voting', 'Voting Active'),
        ('closed', 'Closed'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=PHASE_CHOICES, default='init')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_elections')
    contract_address = models.CharField(max_length=42, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    @property
    def is_active(self):
        now = timezone.now()
        return self.status == 'voting' and self.start_time <= now <= self.end_time

class Position(models.Model):
    """
    Represents a position in an election.
    """
    election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name='positions')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.election.title}"

class Party(models.Model):
    """
    Represents a political party in the system.
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    logo_url = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Parties"

class Candidate(models.Model):
    """
    Represents a candidate in an election.
    """
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    manifesto = models.TextField(blank=True)
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='candidates')
    party = models.ForeignKey(Party, on_delete=models.CASCADE, related_name='candidates', null=True, blank=True)
    photo_url = models.CharField(max_length=200, blank=True)
    wallet_address = models.CharField(max_length=42, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.position.title}"

class Vote(models.Model):
    """
    Records a vote cast by a voter.
    """
    election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name='votes')
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='votes')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='votes')
    voter = models.ForeignKey(Voter, on_delete=models.CASCADE, related_name='votes')
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensure a voter can only vote once per position in an election
        unique_together = ['voter', 'election', 'position']

    def __str__(self):
        return f"Vote by {self.voter.user.username} for {self.candidate.name}"
