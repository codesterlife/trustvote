from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Voter, Election, Position, Party, Candidate, Vote

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)

class VoterSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Voter
        fields = ('id', 'user', 'student_id', 'wallet_address', 'is_verified', 'is_whitelisted')
        read_only_fields = ('id', 'is_verified', 'is_whitelisted')
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(
            username=user_data['username'],
            email=user_data.get('email', ''),
            password=user_data.get('password', 'defaultpassword'),
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', '')
        )
        voter = Voter.objects.create(user=user, **validated_data)
        return voter

class VoterRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email', required=False)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    password = serializers.CharField(source='user.password', write_only=True)
    
    class Meta:
        model = Voter
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'student_id', 'wallet_address')
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(
            username=user_data['username'],
            email=user_data.get('email', ''),
            password=user_data.get('password'),
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', '')
        )
        voter = Voter.objects.create(user=user, **validated_data)
        return voter

class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ('id', 'name', 'description', 'logo_url', 'created_at')
        read_only_fields = ('id', 'created_at')

class CandidateSerializer(serializers.ModelSerializer):
    party_name = serializers.SerializerMethodField()
    position_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidate
        fields = ('id', 'name', 'bio', 'manifesto', 'position', 'position_title', 'party', 'party_name', 'photo_url', 'wallet_address', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def get_party_name(self, obj):
        return obj.party.name if obj.party else None
    
    def get_position_title(self, obj):
        return obj.position.title

class PositionSerializer(serializers.ModelSerializer):
    candidates = CandidateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Position
        fields = ('id', 'election', 'title', 'description', 'candidates', 'created_at')
        read_only_fields = ('id', 'created_at')

class ElectionSerializer(serializers.ModelSerializer):
    positions = PositionSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Election
        fields = ('id', 'title', 'description', 'start_time', 'end_time', 'status', 'contract_address', 'positions', 'created_by', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'contract_address', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ('id', 'election', 'position', 'candidate', 'voter', 'transaction_hash', 'timestamp')
        read_only_fields = ('id', 'timestamp')
    
    def validate(self, data):
        # Check if the election is active
        if not data['election'].is_active:
            raise serializers.ValidationError("This election is not active")
        
        # Check if the position belongs to the election
        if data['position'].election.id != data['election'].id:
            raise serializers.ValidationError("Position does not belong to this election")
        
        # Check if the candidate belongs to the position
        if data['candidate'].position.id != data['position'].id:
            raise serializers.ValidationError("Candidate does not belong to this position")
        
        # Check if the voter has already voted for this position in this election
        if Vote.objects.filter(voter=data['voter'], election=data['election'], position=data['position']).exists():
            raise serializers.ValidationError("Voter has already cast a vote for this position")
        
        return data

class ElectionResultsSerializer(serializers.Serializer):
    election_id = serializers.IntegerField()
    position_id = serializers.IntegerField()
    results = serializers.ListField(child=serializers.DictField())

class WalletConnectionSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
