from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom user model with additional fields for TrustVote
    """
    student_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    is_admin = models.BooleanField(default=False)
    wallet_address = models.CharField(max_length=42, blank=True, null=True, unique=True)
    is_whitelisted = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
    
    def __str__(self):
        return f"{self.username} ({self.student_id})"

class Election(models.Model):
    """
    Model representing an election
    """
    ELECTION_STATUS = [
        ('Init', 'Initialization'),
        ('Voting', 'Voting Open'),
        ('Closed', 'Voting Closed'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=ELECTION_STATUS, default='Init')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    contract_address = models.CharField(max_length=42, blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class Position(models.Model):
    """
    Model representing a position (e.g., President, Vice President)
    """
    election = models.ForeignKey(Election, related_name='positions', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    position_id = models.IntegerField(unique=True)  # Used in smart contract
    
    class Meta:
        ordering = ['election', 'title']
    
    def __str__(self):
        return f"{self.title} - {self.election.title}"

class Party(models.Model):
    """
    Model representing a political party
    """
    name = models.CharField(max_length=255)
    logo_url = models.URLField(blank=True, null=True)
    
    class Meta:
        verbose_name_plural = 'parties'
    
    def __str__(self):
        return self.name

class Candidate(models.Model):
    """
    Model representing a candidate
    """
    name = models.CharField(max_length=255)
    election = models.ForeignKey(Election, related_name='candidates', on_delete=models.CASCADE)
    position = models.ForeignKey(Position, related_name='candidates', on_delete=models.CASCADE)
    party = models.ForeignKey(Party, related_name='candidates', on_delete=models.SET_NULL, null=True, blank=True)
    bio = models.TextField()
    manifesto = models.TextField()
    photo_url = models.URLField(blank=True, null=True)
    wallet = models.CharField(max_length=42, blank=True, null=True)
    candidate_id = models.IntegerField(unique=True)  # Used in smart contract
    
    class Meta:
        ordering = ['election', 'position', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.position.title}"

class Vote(models.Model):
    """
    Model representing a vote (off-chain record)
    """
    election = models.ForeignKey(Election, related_name='votes', on_delete=models.CASCADE)
    position = models.ForeignKey(Position, related_name='votes', on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, related_name='votes', on_delete=models.CASCADE)
    wallet = models.CharField(max_length=42)  # Voter's wallet address
    timestamp = models.DateTimeField(auto_now_add=True)
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)  # Ethereum transaction hash
    
    class Meta:
        ordering = ['-timestamp']
        unique_together = ('election', 'position', 'wallet')  # One vote per position per wallet
    
    def __str__(self):
        return f"Vote: {self.wallet} -> {self.candidate.name} ({self.position.title})"
