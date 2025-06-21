from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Election,VoterElectionWhitelist, ElectoralRoll, Position, Party, Candidate, Vote

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_admin', 
                 'student_id', 'wallet_address',)
        read_only_fields = ('id', 'is_admin', )

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'student_id')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Validate student ID format (if needed)
        student_id = attrs.get('student_id')
        if student_id and not student_id.isalnum():
            raise serializers.ValidationError({"student_id": "Student ID must be alphanumeric."})
        
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            student_id=validated_data.get('student_id', '')
        )
        
        user.set_password(validated_data['password'])
        user.save()
        
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Find the user by email, then authenticate by username
            try:
                user = User.objects.get(email=email)
                user = authenticate(username=user.username, password=password)
                if not user:
                    raise serializers.ValidationError('Unable to log in with provided credentials.')
            except User.DoesNotExist:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')
        
        attrs['user'] = user
        return attrs

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ('id', 'title', 'position_id', 'election')
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Add list of candidate IDs for this position
        representation['candidates'] = [candidate.candidate_id for candidate in instance.candidates.all()]
        return representation

class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ('id', 'name', 'logo_url')

class CandidateSerializer(serializers.ModelSerializer):
    position_title = serializers.CharField(source='position.title', read_only=True)
    party_name = serializers.CharField(source='party.name', read_only=True)
    
    class Meta:
        model = Candidate
        fields = ('id', 'candidate_id', 'name', 'election', 'position', 'position_title', 
                 'party', 'party_name', 'bio', 'manifesto', 'photo_url', 'wallet')

class ElectionSerializer(serializers.ModelSerializer):
    positions = PositionSerializer(many=True, read_only=True)
    whitelisted_voters = serializers.SerializerMethodField()
    
    class Meta:
        model = Election
        fields = ('id', 'title', 'description', 'start_time', 'end_time', 
                 'status', 'created_at', 'updated_at', 'contract_address', 'positions', 'whitelisted_voters')
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Convert field names to camelCase for frontend
        representation['electionId'] = representation.pop('id')
        representation['startTime'] = representation.pop('start_time')
        representation['endTime'] = representation.pop('end_time')
        representation['createdAt'] = representation.pop('created_at')
        representation['updatedAt'] = representation.pop('updated_at')
        representation['contractAddress'] = representation.pop('contract_address')
        
        # Get parties for this election's candidates
        parties = Party.objects.filter(candidates__election=instance).distinct()
        representation['parties'] = PartySerializer(parties, many=True).data
        
        return representation
    
    def create(self, validated_data):
        positions_data = self.context.get('positions', [])
        
        print("\n=== Creating Election ===")
        print("Validated Data:", validated_data)
        print("Positions Data:", positions_data)

        election = Election.objects.create(**validated_data)
        
        # Create positions for this election
        for position_data in positions_data:
            print("Creating Position:", position_data)
            Position.objects.create(election=election, **position_data)

        print("Election Created with ID:", election.id)
        return election
    
    def update(self, instance, validated_data):
        positions_data = self.context.get('positions', [])
        print("\n=== Updating Election ===")
        print("Election ID:", instance.id)
        print("Validated Data:", validated_data)
        print("Positions Data:", positions_data)
        
        # Update election fields
        for attr, value in validated_data.items():
            print(f"Updating {attr} to {value}")
            setattr(instance, attr, value)
        instance.save()
        
        # Handle positions update if needed
        if positions_data:
            print("Updating Positions for Election ID:", instance.id)
            instance.positions.all().delete()

            new_positions = []
            for position_data in positions_data:
                print("Creating Position:", position_data)
                # Remove 'election' key from position_data to avoid conflict
                position_data.pop('election', None)
                position_data.pop('candidates', None)
                new_positions.append(Position(election=instance, **position_data))

            # Bulk create new positions
            Position.objects.bulk_create(new_positions)

        print("Election Updated with ID:", instance.id)
        return instance
    
    def get_whitelisted_voters(self, obj):
        whitelisted = VoterElectionWhitelist.objects.filter(election=obj, is_whitelisted=True)
        return VoterElectionWhitelistSerializer(whitelisted, many=True).data
    
class ElectoralRollSerializer(serializers.ModelSerializer):
    election_title = serializers.CharField(source='election.title', read_only=True)

    class Meta:
        model = ElectoralRoll
        fields = ('id', 'election', 'election_title', 'first_name', 'last_name', 'student_id')
    


class VoterElectionWhitelistSerializer(serializers.ModelSerializer):
    voter_name = serializers.CharField(source='voter.username', read_only=True)
    election_title = serializers.CharField(source='election.title', read_only=True)

    class Meta:
        model = VoterElectionWhitelist
        fields = ('id', 'voter', 'voter_name', 'election', 'election_title', 'is_whitelisted')

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ('id', 'election', 'position', 'candidate', 'wallet', 'timestamp', 'transaction_hash')
        read_only_fields = ('id', 'timestamp')
    
    def validate(self, attrs):
        # Ensure the candidate belongs to the election and position
        candidate = attrs.get('candidate')
        election = attrs.get('election')
        position = attrs.get('position')
        
        if candidate.election != election:
            raise serializers.ValidationError("Candidate does not belong to this election")
        
        if candidate.position != position:
            raise serializers.ValidationError("Candidate does not belong to this position")
        
        # Check if the user has already voted for this position in this election
        wallet = attrs.get('wallet')
        if Vote.objects.filter(election=election, position=position, wallet=wallet).exists():
            raise serializers.ValidationError("You have already voted for this position in this election")
        
        return attrs
