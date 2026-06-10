import React, { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Plus, Trash2, FolderPlus, CheckCircle, Circle, Calendar, ListTodo, Info, X } from 'lucide-react';
import * as THREE from 'three';

// 3D Task Node Component
function TaskNode({ task, index, total, onSelect, activeTaskId }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Calculate coordinates in a 3D helix spiral
  const angle = index * 1.2;
  const radius = 3.5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = (index - total / 2) * 1.0;

  // Hover and spin animations
  useFrame((state) => {
    if (meshRef.current) {
      // Rotate the mesh
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
      
      // Gentle floating up and down using sine wave
      meshRef.current.position.y = y + Math.sin(state.clock.getElapsedTime() * 1.5 + index) * 0.15;
    }
  });

  const isSelected = activeTaskId === task.id;
  const scale = hovered ? 1.4 : isSelected ? 1.25 : 1.0;
  
  // Decide color: Green if completed, list color if incomplete
  const color = task.status === 'DONE' 
    ? '#10B981' 
    : (task.list_details?.color || '#3B82F6');

  return (
    <group position={[x, y, z]}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          setHovered(false);
          setHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(task);
        }}
      >
        {task.status === 'DONE' ? (
          // Completed tasks are cylinders
          <cylinderGeometry args={[0.35, 0.35, 0.7, 16]} />
        ) : (
          // Incomplete tasks are spheres
          <sphereGeometry args={[0.4, 32, 32]} />
        )}
        
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 0.6 : 0.2}
          transparent
          opacity={task.status === 'DONE' ? 0.9 : 0.85}
        />
      </mesh>

      {/* Floating 3D Text Tag on Hover */}
      {(hovered || isSelected) && (
        <Html distanceFactor={8} position={[0, 0.7, 0]} center>
          <div className="glass-panel px-3 py-1.5 rounded-lg border border-white/20 shadow-glass pointer-events-none select-none text-[9px] font-bold text-white whitespace-nowrap">
            {task.title}
          </div>
        </Html>
      )}
    </group>
  );
}

// 3D Scene Wrapper when no tasks are present
function EmptySceneShape() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.5, 0.4, 120, 16]} />
      <meshStandardMaterial
        color="#00f2fe"
        roughness={0.2}
        metalness={0.9}
        wireframe
      />
    </mesh>
  );
}

export default function Dashboard() {
  const { 
    tasks, lists, createTask, updateTask, deleteTask, 
    completeTask, uncompleteTask, createList, deleteList 
  } = useTaskStore();

  const [selectedTask, setSelectedTask] = useState(null);

  // Forms states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskList, setTaskList] = useState('');

  const [listName, setListName] = useState('');
  const [listColor, setListColor] = useState('#3B82F6');
  const [listIcon, setListIcon] = useState('folder');

  const [showAddList, setShowAddList] = useState(false);
  const [selectedListFilter, setSelectedListFilter] = useState('ALL');

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;

    const payload = {
      title: taskTitle,
      description: taskDesc,
      due_date: taskDueDate,
      list: taskList ? parseInt(taskList) : null,
      status: 'TODO'
    };

    const task = await createTask(payload);
    if (task) {
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate(new Date().toISOString().split('T')[0]);
      setTaskList('');
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!listName) return;

    const newList = await createList(listName, listColor, listIcon);
    if (newList) {
      setListName('');
      setShowAddList(false);
    }
  };

  const handleToggleTaskStatus = async (task) => {
    let updated;
    if (task.status === 'DONE') {
      updated = await uncompleteTask(task.id);
    } else {
      updated = await completeTask(task.id);
    }

    if (updated) {
      // Sync detailed drawer state
      setSelectedTask(updated);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const success = await deleteTask(taskId);
    if (success && selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  // Filter tasks based on selected workspace
  const filteredTasks = tasks.filter(t => {
    if (selectedListFilter === 'ALL') return true;
    if (selectedListFilter === 'PERSONAL') return t.list === null;
    return t.list === parseInt(selectedListFilter);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-4rem)]">
      
      {/* LEFT COLUMN: Controls & Tasks Lists (5 cols) */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-start">
        
        {/* Workspace selector */}
        <div className="glass-panel p-4 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Workspaces</h3>
            <button 
              onClick={() => setShowAddList(!showAddList)} 
              className="text-xs text-neonBlue font-semibold hover:underline"
            >
              {showAddList ? 'Cancel' : 'New List'}
            </button>
          </div>

          {showAddList ? (
            <form onSubmit={handleCreateList} className="space-y-3 pt-2">
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                placeholder="List Name"
                value={listName}
                onChange={e => setListName(e.target.value)}
              />
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-500 mb-1">Color Theme</label>
                  <input
                    type="color"
                    className="w-full h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    value={listColor}
                    onChange={e => setListColor(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neonBlue text-[#06070c] font-bold text-xs self-end h-8 active:scale-95 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setSelectedListFilter('ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedListFilter === 'ALL'
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedListFilter('PERSONAL')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedListFilter === 'PERSONAL'
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                }`}
              >
                Personal
              </button>
              {lists.map(l => (
                <div key={l.id} className="relative group">
                  <button
                    onClick={() => setSelectedListFilter(l.id.toString())}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center space-x-1.5 ${
                      selectedListFilter === l.id.toString()
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                    <span>{l.name}</span>
                  </button>
                  <button
                    onClick={() => deleteList(l.id)}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Creator Form */}
        <form onSubmit={handleCreateTask} className="glass-panel p-5 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
            <Plus size={16} className="text-neonBlue" />
            <span>Create Action Item</span>
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue/50 transition-colors"
              placeholder="Task Title"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
            />
            <textarea
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue/50 transition-colors h-14"
              placeholder="Description (Optional)"
              value={taskDesc}
              onChange={e => setTaskDesc(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-extrabold mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-extrabold mb-1">List</label>
                <select
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  value={taskList}
                  onChange={e => setTaskList(e.target.value)}
                >
                  <option value="">None (Personal)</option>
                  {lists.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neonBlue to-neonPurple text-[#06070c] font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-[0_4px_10px_0_rgba(0,242,254,0.15)]"
          >
            Create Task Node
          </button>
        </form>

        {/* Task List Panel */}
        <div className="glass-panel p-5 rounded-3xl flex-1 space-y-4 overflow-y-auto max-h-[350px]">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Action Queue</h3>
          <div className="space-y-2.5">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedTask(t)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer border transition-all ${
                    selectedTask?.id === t.id 
                      ? 'bg-white/10 border-white/20' 
                      : 'bg-white/2 border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTaskStatus(t);
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {t.status === 'DONE' ? <CheckCircle size={18} className="text-green-400" /> : <Circle size={18} />}
                    </button>
                    <div className="truncate">
                      <span className={`text-xs font-bold block truncate ${t.status === 'DONE' ? 'line-through text-gray-500' : 'text-white'}`}>
                        {t.title}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center space-x-1.5 mt-0.5">
                        <Calendar size={10} />
                        <span>{t.due_date}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {t.list_details && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-[8px] font-bold" 
                        style={{ backgroundColor: `${t.list_details.color}22`, color: t.list_details.color, border: `1px solid ${t.list_details.color}44` }}
                      >
                        {t.list_details.name}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(t.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-8">No action items in this queue.</p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: 3D Visualization Canvas & Detail Panel (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-6 h-full relative min-h-[400px] lg:min-h-0">
        
        {/* Detail Overlay Panel */}
        {selectedTask && (
          <div className="absolute top-4 left-4 right-4 glass-panel p-5 rounded-2xl border border-white/10 z-10 animate-slideDown flex justify-between items-start">
            <div className="space-y-1.5 max-w-[80%]">
              <span className="text-[9px] uppercase tracking-wider text-neonBlue font-extrabold flex items-center space-x-1.5">
                <Info size={12} />
                <span>Node Details</span>
              </span>
              <h4 className="text-base font-bold text-white leading-tight">{selectedTask.title}</h4>
              {selectedTask.description && (
                <p className="text-xs text-gray-400 leading-relaxed">{selectedTask.description}</p>
              )}
              <div className="flex items-center space-x-3 pt-1 text-[10px] text-gray-400">
                <span className="flex items-center space-x-1">
                  <Calendar size={11} />
                  <span>Due: {selectedTask.due_date}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                <span className="font-semibold" style={{ color: selectedTask.status === 'DONE' ? '#10B981' : '#3B82F6' }}>
                  Status: {selectedTask.status === 'DONE' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleToggleTaskStatus(selectedTask)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 active:scale-95 transition-all"
              >
                {selectedTask.status === 'DONE' ? 'Mark Todo' : 'Mark Done'}
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 3D R3F View Canvas */}
        <div className="glass-panel rounded-3xl flex-1 relative overflow-hidden h-[450px] lg:h-full min-h-[300px]">
          {/* Instructions Overlay */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none select-none text-[10px] text-gray-500 font-medium">
            Drag to Rotate • Scroll to Zoom • Click Node to View Details
          </div>

          <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
            {/* Ambient lighting for basic shape exposure */}
            <ambientLight intensity={0.6} />
            {/* Direct lighting to create 3D depth and highlights */}
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />

            {/* OrbitControls to zoom and spin the workspace */}
            <OrbitControls 
              enableZoom={true} 
              enablePan={false} 
              minDistance={3}
              maxDistance={12}
            />

            {filteredTasks.length > 0 ? (
              filteredTasks.map((t, idx) => (
                <TaskNode 
                  key={t.id} 
                  task={t} 
                  index={idx} 
                  total={filteredTasks.length} 
                  activeTaskId={selectedTask?.id}
                  onSelect={(task) => setSelectedTask(task)}
                />
              ))
            ) : (
              <EmptySceneShape />
            )}
          </Canvas>
        </div>
      </div>

    </div>
  );
}
