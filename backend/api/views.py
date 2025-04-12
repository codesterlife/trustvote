from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .models import User, Election, Position, Candidate, Party, Vote
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, ElectionSerializer,
    PositionSerializer, CandidateSerializer, PartySerializer, VoteSerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to admin users
        return request.user and request.user.is_admin

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create token for the newly registered user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    """
    API endpoint for user login
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Create or get user token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        })

class UserDetailView(generics.RetrieveAPIView):
    """
    API endpoint to get current user details
    """
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

class UpdateWalletView(APIView):
    """
    API endpoint to update user wallet address
    """
    def post(self, request):
        wallet_address = request.data.get('wallet_address')
        if not wallet_address:
            return Response({"error": "Wallet address is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update user's wallet address
        user = request.user
        user.wallet_address = wallet_address
        user.save()
        
        return Response({
            "user": UserSerializer(user).data,
            "wallet_address": wallet_address
        })

class UserProfileUpdateView(APIView):
    """
    API endpoint to update user profile
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserVotesView(APIView):
    """
    API endpoint to get user's voting history
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get user's wallet address
        wallet_address = user.wallet_address
        
        if not wallet_address:
            return Response(
                {'error': 'Wallet address not set. Please connect your wallet first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get votes associated with this wallet address
        votes = Vote.objects.filter(wallet=wallet_address)
        
        # Enhance the data with election and candidate names
        result = []
        for vote in votes:
            vote_data = {
                'id': vote.id,
                'election_id': vote.election.id,
                'election_title': vote.election.title,
                'position_id': vote.position.id,
                'position_title': vote.position.title,
                'candidate_id': vote.candidate.id,
                'candidate_name': vote.candidate.name,
                'timestamp': vote.timestamp,
                'transaction_hash': vote.transaction_hash
            }
            result.append(vote_data)
        
        return Response(result)

class ElectionViewSet(viewsets.ModelViewSet):
    """
    API endpoints for election management
    """
    queryset = Election.objects.all()
    serializer_class = ElectionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    def create(self, request, *args, **kwargs):
        positions_data = request.data.pop('positions', [])
        serializer = self.get_serializer(data=request.data, context={'positions': positions_data})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        positions_data = request.data.pop('positions', [])
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, 
                                        partial=kwargs.get('partial', False),
                                        context={'positions': positions_data})
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def candidates(self, request, pk=None):
        """
        Get all candidates for a specific election
        """
        election = self.get_object()
        candidates = Candidate.objects.filter(election=election)
        serializer = CandidateSerializer(candidates, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def whitelist(self, request, pk=None):
        """
        Whitelist a voter for this election
        Admin only
        """
        if not request.user.is_admin:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
        wallet_address = request.data.get('wallet_address')
        if not wallet_address:
            return Response({"error": "Wallet address is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find user by wallet address and whitelist them
        try:
            user = User.objects.get(wallet_address=wallet_address)
            user.is_whitelisted = True
            user.save()
            return Response({"message": "Voter whitelisted successfully"})
        except User.DoesNotExist:
            return Response({"error": "No user found with this wallet address"}, 
                            status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['patch'])
    def phase(self, request, pk=None):
        """
        Update the election phase/status
        Admin only
        """
        if not request.user.is_admin:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
        election = self.get_object()
        status_value = request.data.get('status')
        
        if not status_value or status_value not in [s[0] for s in Election.ELECTION_STATUS]:
            return Response({"error": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST)
        
        election.status = status_value
        election.save()
        
        return Response({"message": f"Election phase updated to {status_value}"})
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """
        Get election results by position
        """
        election = self.get_object()
        
        # Organize votes by position and candidate
        result_data = {}
        positions = Position.objects.filter(election=election)
        
        for position in positions:
            candidates = Candidate.objects.filter(position=position)
            position_votes = []
            
            for candidate in candidates:
                vote_count = Vote.objects.filter(
                    election=election,
                    position=position,
                    candidate=candidate
                ).count()
                
                position_votes.append({
                    'candidateId': candidate.candidate_id,
                    'votes': vote_count
                })
            
            result_data[position.position_id] = position_votes
        
        return Response(result_data)

class CandidateViewSet(viewsets.ModelViewSet):
    """
    API endpoints for candidate management
    """
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    def get_queryset(self):
        """
        Optionally filter by election
        """
        queryset = Candidate.objects.all()
        election_id = self.request.query_params.get('election', None)
        if election_id is not None:
            queryset = queryset.filter(election__id=election_id)
        return queryset

class PartyViewSet(viewsets.ModelViewSet):
    """
    API endpoints for party management
    """
    queryset = Party.objects.all()
    serializer_class = PartySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

class VoteViewSet(viewsets.ModelViewSet):
    """
    API endpoints for vote management
    """
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Store the transaction hash if provided
        tx_hash = request.data.get('transaction_hash')
        
        # Create and validate the vote
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Add the transaction hash to the validated data
        serializer.validated_data['transaction_hash'] = tx_hash
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class VoterViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for voter management
    Admin only
    """
    queryset = User.objects.filter(is_staff=False, is_superuser=False)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return User.objects.filter(is_staff=False, is_superuser=False)
        return User.objects.none()
