from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, UserDetailView, UpdateWalletView,
    ElectionViewSet, CandidateViewSet, PartyViewSet, VoteViewSet, VoterViewSet
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'elections', ElectionViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'parties', PartyViewSet)
router.register(r'votes', VoteViewSet)
router.register(r'voters', VoterViewSet)

# Auth URLs
auth_urls = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('update-wallet/', UpdateWalletView.as_view(), name='update-wallet'),
]

urlpatterns = [
    path('auth/', include(auth_urls)),
    path('', include(router.urls)),
]
