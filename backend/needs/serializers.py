from rest_framework import serializers
from needs.models import Need
from expenses.serializers import ExpenseSerializer

class NeedSerializer(serializers.ModelSerializer):

    expenses = ExpenseSerializer(many=True, read_only=True)

    class Meta:
        model = Need
        fields = '__all__'
        read_only_fields = [
            'student',
            'amount_pledged',
            'status',
            'created_at',
            'expenses',
        ]
