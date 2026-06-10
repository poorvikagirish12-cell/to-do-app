from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import List, Task, Habit, HabitLog, DailyPerformanceSnapshot
from .serializers import (
    ListSerializer, TaskSerializer, HabitSerializer,
    HabitLogSerializer, DailyPerformanceSnapshotSerializer
)
from .utils import update_daily_snapshot

class ListViewSet(viewsets.ModelViewSet):
    serializer_class = ListSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return List.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by('due_date', '-created_at')

    def perform_create(self, serializer):
        task = serializer.save(user=self.request.user)
        # Update snapshot for the due date
        update_daily_snapshot(self.request.user, task.due_date)

    def perform_update(self, serializer):
        task = serializer.save()
        update_daily_snapshot(self.request.user, task.due_date)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.mark_completed()
        # Update snapshot for the completed day
        update_daily_snapshot(request.user, task.completed_at.date())
        # Also update snapshot for the due day in case they are different
        update_daily_snapshot(request.user, task.due_date)
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['post'])
    def uncomplete(self, request, pk=None):
        task = self.get_object()
        old_completed_date = task.completed_at.date() if task.completed_at else None
        task.status = 'TODO'
        task.completed_at = None
        task.save()
        # Update snapshots
        if old_completed_date:
            update_daily_snapshot(request.user, old_completed_date)
        update_daily_snapshot(request.user, task.due_date)
        return Response(TaskSerializer(task).data)

class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class HabitLogViewSet(viewsets.ModelViewSet):
    serializer_class = HabitLogSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return HabitLog.objects.filter(habit__user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        log = serializer.save()
        update_daily_snapshot(self.request.user, log.date)

    def perform_destroy(self, instance):
        user = instance.habit.user
        date = instance.date
        instance.delete()
        update_daily_snapshot(user, date)

class DailyPerformanceSnapshotViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DailyPerformanceSnapshotSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return DailyPerformanceSnapshot.objects.filter(user=self.request.user).order_by('date')
