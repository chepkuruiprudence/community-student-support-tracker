from rest_framework.viewsets import ModelViewSet
from .models import Need
from needs.serializers import NeedSerializer

class NeedViewSet(ModelViewSet):
    serializer_class = NeedSerializer

    def get_queryset(self):
        return Need.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
