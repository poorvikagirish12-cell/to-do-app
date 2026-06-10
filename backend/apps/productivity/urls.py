from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ListViewSet, TaskViewSet, HabitViewSet,
    HabitLogViewSet, DailyPerformanceSnapshotViewSet
)

router = DefaultRouter()
router.register(r'lists', ListViewSet, basename='list')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'habits', HabitViewSet, basename='habit')
router.register(r'habit-logs', HabitLogViewSet, basename='habit-log')
router.register(r'snapshots', DailyPerformanceSnapshotViewSet, basename='snapshot')

urlpatterns = [
    path('', include(router.urls)),
]
