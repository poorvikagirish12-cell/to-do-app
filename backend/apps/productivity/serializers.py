from rest_framework import serializers
from .models import List, Task, Habit, HabitLog, DailyPerformanceSnapshot

class ListSerializer(serializers.ModelSerializer):
    class Meta:
        model = List
        fields = ('id', 'name', 'color', 'icon', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class TaskSerializer(serializers.ModelSerializer):
    list_details = ListSerializer(source='list', read_only=True)

    class Meta:
        model = Task
        fields = (
            'id', 'list', 'list_details', 'title', 'description', 
            'due_date', 'status', 'completed_at', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'completed_at', 'created_at', 'updated_at')

class HabitSerializer(serializers.ModelSerializer):
    list_details = ListSerializer(source='list', read_only=True)

    class Meta:
        model = Habit
        fields = (
            'id', 'list', 'list_details', 'title', 'description',
            'frequency', 'start_date', 'is_active', 'last_reminder_sent_date',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'last_reminder_sent_date', 'created_at', 'updated_at')

class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ('id', 'habit', 'date', 'status', 'logged_at')
        read_only_fields = ('id', 'logged_at')

class DailyPerformanceSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyPerformanceSnapshot
        fields = ('id', 'date', 'tasks_completed', 'tasks_failed', 'habits_completed', 'habits_failed', 'completion_rate')
