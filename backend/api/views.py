from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Voter, Election, Position, Party, Candidate, Vote
from .serializers import (
    UserSerializer, VoterSerializer, VoterRegistrationSerializer, ElectionSerializer,
    PositionSerializer, PartySerializer, CandidateSerializer, VoteSerializer,
    ElectionResultsSerializer, WalletConnectionSerializer
)

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsVoterOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow voters to access their own data and admins to access all.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        # For voters, only allow access to own data
        try:
            voter = request.user.voter
            return voter.id == obj.id
        except:
            return False

class VoterRegistrationView(generics.CreateAPIView):
    """
    API endpoint for voter registration.
    """
    serializer_class = VoterRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class VoterViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing voters.
    """
    queryset = Voter.objects.all()
    serializer_class = VoterSerializer
    permission_classes = [permissions.IsAuthenticated, IsVoterOrAdmin]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Voter.objects.all()
        try:
            return Voter.objects.filter(user=self.request.user)
        except:
            return Voter.objects.none()

class ConnectWalletView(APIView):
    """
    API endpoint for connecting a wallet to a voter account.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = WalletConnectionSerializer(data=request.data)
        if serializer.is_valid():
            wallet_address = serializer.validated_data['wallet_address']
            
            try:
                voter = request.user.voter
                voter.wallet_address = wallet_address
                voter.save()
                return Response({"status": "success", "message": "Wallet connected successfully"}, status=status.HTTP_200_OK)
            except Voter.DoesNotExist:
                return Response({"status": "error", "message": "Voter profile not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ElectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing elections.
    """
    queryset = Election.objects.all()
    serializer_class = ElectionSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]

class PositionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing positions.
    """
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        election_id = self.request.query_params.get('election', None)
        if election_id:
            return Position.objects.filter(election__id=election_id)
        return Position.objects.all()

class PartyViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing parties.
    """
    queryset = Party.objects.all()
    serializer_class = PartySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]

class CandidateViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing candidates.
    """
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        position_id = self.request.query_params.get('position', None)
        election_id = self.request.query_params.get('election', None)
        
        if position_id:
            return Candidate.objects.filter(position__id=position_id)
        elif election_id:
            return Candidate.objects.filter(position__election__id=election_id)
        return Candidate.objects.all()

class VoteViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing votes.
    """
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Set the voter to the current user's voter instance
        try:
            voter = request.user.voter
            request.data['voter'] = voter.id
        except Voter.DoesNotExist:
            return Response({"status": "error", "message": "Voter profile not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Vote.objects.all()
        try:
            return Vote.objects.filter(voter__user=self.request.user)
        except:
            return Vote.objects.none()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_election_results(request, election_id):
    """
    Get the results for a specific election.
    """
    election = get_object_or_404(Election, pk=election_id)
    
    # Only show results if the election is closed or the user is an admin
    if election.status != 'closed' and not request.user.is_staff:
        return Response({"status": "error", "message": "Results not available until election is closed"}, status=status.HTTP_403_FORBIDDEN)
    
    results = []
    
    for position in election.positions.all():
        position_results = []
        candidates = position.candidates.all()
        
        for candidate in candidates:
            vote_count = Vote.objects.filter(election=election, position=position, candidate=candidate).count()
            position_results.append({
                'candidate_id': candidate.id,
                'candidate_name': candidate.name,
                'party_name': candidate.party.name if candidate.party else None,
                'vote_count': vote_count
            })
        
        # Sort candidates by vote count in descending order
        position_results = sorted(position_results, key=lambda x: x['vote_count'], reverse=True)
        
        results.append({
            'position_id': position.id,
            'position_title': position.title,
            'candidates': position_results
        })
    
    return Response({
        'election_id': election.id,
        'election_title': election.title,
        'results': results
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def whitelist_voter(request, voter_id):
    """
    Whitelist a voter for elections.
    """
    voter = get_object_or_404(Voter, pk=voter_id)
    
    if not voter.wallet_address:
        return Response({"status": "error", "message": "Voter has no wallet address"}, status=status.HTTP_400_BAD_REQUEST)
    
    voter.is_verified = True
    voter.is_whitelisted = True
    voter.save()
    
    return Response({"status": "success", "message": "Voter whitelisted successfully"})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def update_election_status(request, election_id):
    """
    Update the status of an election.
    """
    election = get_object_or_404(Election, pk=election_id)
    status_value = request.data.get('status')
    
    if status_value not in dict(Election.PHASE_CHOICES):
        return Response({"status": "error", "message": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST)
    
    election.status = status_value
    election.save()
    
    return Response({"status": "success", "message": f"Election status updated to {status_value}"})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_active_elections(request):
    """
    Get all active elections.
    """
    now = timezone.now()
    active_elections = Election.objects.filter(
        status='voting',
        start_time__lte=now,
        end_time__gte=now
    )
    
    serializer = ElectionSerializer(active_elections, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_voter_status(request):
    """
    Check if the current user has a verified voter profile.
    """
    try:
        voter = request.user.voter
        return Response({
            "is_registered": True,
            "is_verified": voter.is_verified,
            "is_whitelisted": voter.is_whitelisted,
            "has_wallet": bool(voter.wallet_address),
            "wallet_address": voter.wallet_address
        })
    except Voter.DoesNotExist:
        return Response({
            "is_registered": False,
            "is_verified": False,
            "is_whitelisted": False,
            "has_wallet": False,
            "wallet_address": None
        })
