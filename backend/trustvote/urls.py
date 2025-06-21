"""trustvote URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Simple view for the API root
@csrf_exempt
def api_root(request):
    return JsonResponse({
        'name': 'TrustVote API',
        'version': '1.0.0',
        'description': 'Blockchain-based voting system API',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'auth': '/api/auth/',
            'elections': '/api/elections/',
            'candidates': '/api/candidates/',
            'parties': '/api/parties/',
            'votes': '/api/votes/',
            'voters': '/api/voters/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', api_root, name='api-root'),  # Root URL view
]
