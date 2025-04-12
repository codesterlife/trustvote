from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'voters', views.VoterViewSet)
router.register(r'elections', views.ElectionViewSet)
router.register(r'positions', views.PositionViewSet)
router.register(r'parties', views.PartyViewSet)
router.register(r'candidates', views.CandidateViewSet)
router.register(r'votes', views.VoteViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.VoterRegistrationView.as_view(), name='voter-registration'),
    path('connect-wallet/', views.ConnectWalletView.as_view(), name='connect-wallet'),
    path('election-results/<int:election_id>/', views.get_election_results, name='election-results'),
    path('whitelist-voter/<int:voter_id>/', views.whitelist_voter, name='whitelist-voter'),
    path('update-election-status/<int:election_id>/', views.update_election_status, name='update-election-status'),
    path('active-elections/', views.get_active_elections, name='active-elections'),
    path('voter-status/', views.check_voter_status, name='voter-status'),
]
