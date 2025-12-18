from rest_framework import serializers
from needs.models import Need

class NeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Need
        fields = '__all__'
        read_only_fields = [
            'student',
            'amount_pledged',
            'status',
            'created_at'
        ]
