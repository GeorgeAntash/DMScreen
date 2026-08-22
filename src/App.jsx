import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Map as MapIcon, Users, BookOpen, Scroll, Dices, Settings,
    ChevronRight, ChevronDown, Plus, Trash2, Save,
    AlertTriangle, Sun, Moon, MapPin, X, ExternalLink,
    CloudRain, Wind, Skull, Tent, Castle, Mountain, Trees, Search,
    Sword, User, FileText, Target, Eye, Maximize2, Minimize2, GripHorizontal, LayoutGrid,
    Book, Filter, Hash, Tag, ArrowUp, ArrowDown, MoveDiagonal,
    Zap, Shield, Activity, Droplets, Pencil, Copy, Minus, Calculator, Folder, ArrowLeft, MoreVertical, Layers, RefreshCw,
    Image as ImageIcon, Move, Upload, EyeOff, Download, List, Compass, MessageSquare, Box, Sparkles, Apple, Shuffle, Wand2, Grid,
    Play, SkipForward, RotateCcw, PaintBucket, CheckSquare, Link, UserPlus
} from 'lucide-react';

const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

    .serif { font-family: 'Crimson Text', serif; }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #1a1d23; }
    ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #4b5563; }

    .hex-grid { user-select: none; }
    .hex:hover { filter: brightness(1.2); cursor: pointer; }

    .panel {
        background: #1a1d23;
        border: 1px solid #2f333a;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .panel-header {
        background: #25282e;
        border-bottom: 1px solid #2f333a;
        cursor: grab;
    }
    .panel-header:active {
        cursor: grabbing;
    }

    .input-dark {
        background: #0f1115;
        border: 1px solid #374151;
        color: #e5e7eb;
        transition: border-color 0.2s;
    }
    .input-dark:focus {
        outline: none;
        border-color: #6366f1;
    }

    @keyframes popIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    .floating-window {
        animation: popIn 0.1s ease-out;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }

    .stat-block {
        background: #15171b;
        border: 1px solid #3f3f46;
        border-radius: 6px;
        padding: 12px;
        font-family: 'Inter', sans-serif;
    }

    .dh-card {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        border: 2px solid #4b5563;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .dh-header {
        background: #374151;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #4b5563;
    }
    .dh-stat-box {
        background: #111827;
        border: 1px solid #374151;
        border-radius: 6px;
        padding: 4px;
        text-align: center;
    }
    .dh-feature-row {
        border-left: 3px solid #6366f1;
        background: rgba(99, 102, 241, 0.1);
        margin-bottom: 8px;
        padding: 8px;
        border-radius: 0 6px 6px 0;
    }

    .dh-checkbox {
        width: 14px;
        height: 14px;
        border: 1px solid #4b5563;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.1s;
    }
    .dh-checkbox.filled {
        background-color: #ef4444;
        border-color: #ef4444;
    }
    .dh-checkbox.stress {
        border-color: #a855f7;
    }
    .dh-checkbox.stress.filled {
        background-color: #a855f7;
    }

    .sidebar-btn {
        padding: 8px;
        border-radius: 8px;
        color: #9ca3af;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .sidebar-btn:hover {
        background-color: #374151;
        color: white;
    }
    .sidebar-btn.active {
        background-color: #4f46e5;
        color: white;
        box-shadow: 0 0 10px rgba(79, 70, 229, 0.4);
    }

    .combat-row-active {
        background: rgba(79, 70, 229, 0.2);
        border-left: 4px solid #6366f1;
    }
`;

// --- CONSTANTS ---
const WIDGET_CONFIG = {
    TIMELINE: { id: 'TIMELINE', title: 'Narrative Flow', icon: Scroll, defaultSpan: 'col-span-4 row-span-12' },
    HEX: { id: 'HEX', title: 'Hex Navigation', icon: MapPin, defaultSpan: 'col-span-5 row-span-7' },
    PARTY: { id: 'PARTY', title: 'Party', icon: Users, defaultSpan: 'col-span-3 row-span-6' },
    RULES: { id: 'RULES', title: 'Reference', icon: BookOpen, defaultSpan: 'col-span-3 row-span-6' },
    MAP: { id: 'MAP', title: 'World Map', icon: MapIcon, defaultSpan: 'col-span-5 row-span-5' },
    DICE: { id: 'DICE', title: 'Dice Roller', icon: Dices, defaultSpan: 'col-span-3 row-span-6' },
    FEAR: { id: 'FEAR', title: 'Fear Tracker', icon: Skull, defaultSpan: 'col-span-3 row-span-4' }
};

const TABLE_CATEGORIES = [
    { id: 'weather', label: 'Weather', icon: CloudRain },
    { id: 'landmarks', label: 'Landmarks', icon: MapPin },
    { id: 'encounters', label: 'Encounters', icon: Sword },
    { id: 'npcs', label: 'NPCs', icon: User },
    { id: 'resources', label: 'Resources', icon: Apple },
    { id: 'rumors', label: 'Rumors', icon: MessageSquare },
    { id: 'creatures', label: 'Creatures', icon: Skull },
    { id: 'items', label: 'Items', icon: Box },
    { id: 'wild_magic', label: 'Wild Magic', icon: Sparkles }
];

const DEFAULT_RULES = [
    { id: 'travel', title: 'Travel Costs', content: `• Roads/Chord Paths: 2 Hours per Hex\n• Off-Road: 3 Hours per Hex\n• Difficult Terrain: +1 Hour\n\nNavigation (Instincts):\n• DC 10-20. Success = Trailblaze (Auto-success future).\n• Fail = Random adjacent hex, lost.` },
    { id: 'rest', title: 'Rest Types', content: `A. TAKING A REST (8 hrs): 6 sleep/2 light. Interrupt = +1 hr cost.\n\nB. NIGHT'S REST (Camp):\n• Heal 1d4 + Tier HP\n• Clear 1d4 + Tier Stress\n• Repair 1d4 + Tier Armor\n• Gain 1 Hope (2 if group prep)\n\nC. GOOD REST (Safe Haven/3 Nights):\n• Full Heal, Full Stress clear, Full Repair.\n• Project progress.` },
    { id: 'actions', title: 'Camp & Actions', content: `Camp Phase (4 hrs): Must eat 1 ration or mark 1d4 Stress.\n\nShort Rest Actions (1 hr):\n• Repair Armor (Finesse/Know): 10+=1, 15+=1d4, 20+=All.\n• Prepare: +1 Hope.\n• Forage (2 hrs): Instincts check. 12 = 1 ration.` },
    { id: 'moves', title: 'GM Moves', content: `• Make a move when they roll with Fear.\n• Make a move when they look to you to see what happens.\n• Use a Soft Move to set up danger.\n• Use a Hard Move to follow through on a threat.` }
];

const DEFAULT_PARTY = [
    { id: 1, name: 'Kaelen', class: 'Warrior', hp: 6, maxHp: 6, stress: 0, maxStress: 5, evasion: 12, hope: 2, image: '' },
    { id: 2, name: 'Lyra', class: 'Seraph', hp: 5, maxHp: 5, stress: 1, maxStress: 6, evasion: 10, hope: 3, image: '' },
];

const ADVERSARY_TYPES = ["Bruiser", "Horde", "Leader", "Minion", "Ranged", "Skulk", "Social", "Solo", "Standard", "Support", "Environment"];
const CREATURE_TYPES = ["Humanoid", "Beast", "Construct", "Fiend", "Undead", "Elemental", "Celestial", "Giant", "Dragon", "Ooze", "Plant", "Aberration", "Monstrosity", "Fey"];
const BIOMES = ["Plains", "Forest", "Swamp", "Mountain", "Desert", "Underground", "Water", "Urban", "Cold", "Volcanic"];
const ATTACK_RANGES = ["Melee", "Very Close", "Close", "Far", "Very Far"];
const FEATURE_TYPES = ["Action", "Reaction", "Passive", "Fear"];

const DEFAULT_BESTIARY = [
    {
        id: '101', name: 'Sand Raider', tier: '1', type: 'Minion', creatureType: 'Humanoid', biome: 'Desert', tags: 'Bandit',
        difficulty: '10', attack: '+2', experiences: 'Ambush Tactics +2', motives: 'To steal supplies and protect their territory.',
        attacks: [{id: 1, name: 'Scimitar', range: 'Melee', mod: '+2', damage: '1d6 Phys'}], hp: '4', stress: '0', thresholds: { major: '6', severe: '12' },
        features: [{ id: 1, name: 'Pack Tactics', type: 'Passive', description: 'Has advantage on attacks if an ally is within close range of the target.', flavorText: 'They hunt as one.' }]
    },
    {
        id: '102', name: 'Crystal Golem', tier: '2', type: 'Solo', creatureType: 'Construct', biome: 'Underground', tags: 'Magic',
        difficulty: '15', attack: '+4', experiences: 'Immovable Object +3', motives: 'To guard the crystal core at all costs.',
        attacks: [{id: 1, name: 'Crystal Slam', range: 'Melee', mod: '+4', damage: '2d8+2 Phys'}], hp: '12', stress: '5', thresholds: { major: '8', severe: '16' },
        features: [{ id: 1, name: 'Reflective Carapace', type: 'Passive', description: 'Ranged attacks against the Golem have disadvantage.', flavorText: 'Spells bounce off its hide.' }, { id: 2, name: 'Shard Burst', type: 'Action', description: 'Deal 1d8 damage to all enemies in Very Close range.', fearCost: '1' }]
    }
];

const NPC_TRAIT_CATEGORIES = ['Appearance', 'Mannerism', 'Voice', 'Quirk', 'Goal', 'Secret', 'Name', 'Backstory'];

const DEFAULT_NPC_TRAITS = [
    { id: 1, text: "Piercings made of sacred metal bones line their trunk.", category: "Appearance", tags: "fakherin, spiritual" },
    { id: 2, text: "Rough, bark-like skin that smells of pine.", category: "Appearance", tags: "fakherin, nature" },
    { id: 3, text: "Wears a cloak of shifting desert sands.", category: "Appearance", tags: "magic, desert" },
    { id: 4, text: "Always carrying a satchel of rare spices.", category: "Mannerism", tags: "city, merchant" },
    { id: 5, text: "Speaks in a low rumble that vibrates the floor.", category: "Voice", tags: "fakherin, large" },
    { id: 6, text: "Has a noticeable limp from an old war wound.", category: "Appearance", tags: "veteran, generic" },
    { id: 7, text: "Speaks incredibly fast, running words together.", category: "Voice", tags: "city, nervous" },
    { id: 8, text: "Collects strange bugs in glass jars.", category: "Quirk", tags: "odd, nature" },
    { id: 9, text: "Secretly a spy for a rival faction.", category: "Secret", tags: "city, political" },
    { id: 10, text: "Wants to find the lost oasis of the ancients.", category: "Goal", tags: "desert, adventure" },
    { id: 11, text: "Thorn", category: "Name", tags: "fakherin" },
    { id: 12, text: "Root-Walker", category: "Name", tags: "fakherin" },
    { id: 13, text: "Elara", category: "Name", tags: "elf, city" },
    { id: 14, text: "Garret", category: "Name", tags: "human, city" },
    { id: 15, text: "Constantly polishes a coin between their fingers.", category: "Mannerism", tags: "greedy, nervous" }
];

const safeSetItem = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.warn(`Failed to save ${key} to localStorage:`, e);
    }
};

const generateMockItems = () => {
    const items = [];
    const rarities = ['common', 'unlikely', 'rare', 'wondrous'];
    const tones = ['positive', 'neutral', 'negative'];

    for(let i=0; i<30; i++) {
        const rarity = rarities[Math.floor(Math.random() * rarities.length)];
        const tone = tones[Math.floor(Math.random() * tones.length)];
        let tag = "";
        if (Math.random() > 0.3) tag = "magic,weapon";

        items.push({
            id: Date.now() + i,
            text: `Magic Item ${i + 1} (${rarity}, ${tone})`,
            rarity,
            tone,
            tags: tag
        });
    }
    return items;
};

// --- COMPONENTS ---

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d23] border border-gray-700 w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#25282e]">
                    <h2 className="text-xl font-serif font-bold text-gray-200">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-[#0f1115]">
                    {children}
                </div>
            </div>
        </div>
    );
};

const FloatingWindow = ({ windowData, onClose, onFocus, children }) => {
    const [position, setPosition] = useState(() => {
        if (windowData.type === 'COMBAT') return { x: 50, y: 50, w: 900, h: 700 };
        if (windowData.type === 'ENCOUNTER_MANAGER') return { x: 150, y: 80, w: 900, h: 700 };
        if (windowData.type === 'NPC_BUILDER') return { x: window.innerWidth/2 - 300, y: 50, w: 800, h: 750 };
        if (windowData.type === 'NPC_MANAGER') return { x: 100, y: 100, w: 900, h: 700 };
        if (windowData.type === 'NPC') return { x: window.innerWidth/2 - 200, y: 100, w: 400, h: 550 };
        if (windowData.type === 'HEX_DETAIL') return { x: window.innerWidth/2 - 250, y: 100, w: 500, h: 600 };
        if (windowData.type === 'TABLE_MANAGER') return { x: 100, y: 100, w: 900, h: 700 };
        if (windowData.type === 'TABLE_ROLLER') return { x: 200, y: 100, w: 400, h: 600 };
        if (windowData.type === 'BESTIARY') return { x: 100, y: 80, w: 900, h: 700 };
        if (windowData.type === 'ADV_BUILDER') return { x: window.innerWidth/2 - 300, y: 50, w: 600, h: 750 };
        if (windowData.type === 'BESTIARY_PICKER') return { x: 150, y: 100, w: 900, h: 600 };
        if (windowData.type === 'TABLE_PICKER') return { x: 150, y: 100, w: 500, h: 600 };
        if (windowData.type === 'NPC_PICKER') return { x: 150, y: 100, w: 600, h: 600 };
        return { x: 100, y: 100, w: 500, h: 600 };
    });

    const [isDragging, setIsDragging] = useState(false);
    const [resizeDir, setResizeDir] = useState(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, mx: 0, my: 0 });

    const handleMouseDown = (e) => {
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select') || e.target.closest('.dh-checkbox')) return;
        setIsDragging(true);
        dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        onFocus(windowData.id);
    };

    const handleResizeStart = (e, dir) => {
        e.stopPropagation();
        e.preventDefault();
        setResizeDir(dir);
        resizeStart.current = { x: position.x, y: position.y, w: position.w, h: position.h, mx: e.clientX, my: e.clientY };
        onFocus(windowData.id);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                let newY = e.clientY - dragOffset.current.y;
                if (newY < 0) newY = 0;
                setPosition(prev => ({ ...prev, x: e.clientX - dragOffset.current.x, y: newY }));
            } else if (resizeDir) {
                const dx = e.clientX - resizeStart.current.mx;
                const dy = e.clientY - resizeStart.current.my;
                const { x, y, w, h } = resizeStart.current;

                let newW = w, newH = h, newX = x, newY = y;

                if (resizeDir.includes('e')) newW = Math.max(300, w + dx);
                if (resizeDir.includes('s')) newH = Math.max(200, h + dy);
                if (resizeDir.includes('w')) { newW = Math.max(300, w - dx); newX = x + (w - newW); }
                if (resizeDir.includes('n')) { newH = Math.max(200, h - dy); newY = y + (h - newH); }

                if (newY < 0) { newH += newY; newY = 0; }

                setPosition({ x: newX, y: newY, w: newW, h: newH });
            }
        };
        const handleMouseUp = () => { setIsDragging(false); setResizeDir(null); };

        if (isDragging || resizeDir) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, resizeDir]);

    const resizerStyle = "absolute z-50 bg-transparent";

    return (
        <div
            className="fixed floating-window bg-[#1a1d23] border border-gray-600 rounded-lg flex flex-col overflow-hidden shadow-2xl"
            style={{ top: position.y, left: position.x, width: position.w, height: position.h, zIndex: windowData.zIndex }}
            onMouseDown={() => onFocus(windowData.id)}
        >
            <div className={`${resizerStyle} cursor-n-resize top-0 left-0 w-full h-2`} onMouseDown={(e) => handleResizeStart(e, 'n')}></div>
            <div className={`${resizerStyle} cursor-s-resize bottom-0 left-0 w-full h-2`} onMouseDown={(e) => handleResizeStart(e, 's')}></div>
            <div className={`${resizerStyle} cursor-w-resize left-0 top-0 h-full w-2`} onMouseDown={(e) => handleResizeStart(e, 'w')}></div>
            <div className={`${resizerStyle} cursor-e-resize right-0 top-0 h-full w-2`} onMouseDown={(e) => handleResizeStart(e, 'e')}></div>
            <div className={`${resizerStyle} cursor-nw-resize top-0 left-0 w-4 h-4`} onMouseDown={(e) => handleResizeStart(e, 'nw')}></div>
            <div className={`${resizerStyle} cursor-ne-resize top-0 right-0 w-4 h-4`} onMouseDown={(e) => handleResizeStart(e, 'ne')}></div>
            <div className={`${resizerStyle} cursor-sw-resize bottom-0 left-0 w-4 h-4`} onMouseDown={(e) => handleResizeStart(e, 'sw')}></div>
            <div className={`${resizerStyle} cursor-se-resize bottom-0 right-0 w-4 h-4`} onMouseDown={(e) => handleResizeStart(e, 'se')}></div>

            <div className="bg-[#25282e] p-2 px-4 border-b border-gray-700 flex justify-between items-center cursor-move select-none group flex-shrink-0" onMouseDown={handleMouseDown}>
                <div className="flex items-center gap-2 font-bold text-gray-200">
                    <GripHorizontal size={14} className="text-gray-600 group-hover:text-gray-400"/> {windowData.icon} <span>{windowData.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onClose(windowData.id)} className="text-gray-400 hover:text-red-400"><X size={18}/></button>
                </div>
            </div>
            <div className="flex-1 bg-[#0f1115] p-4 relative cursor-default overflow-hidden flex flex-col">
                {children}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center text-gray-500 hover:text-white pointer-events-auto z-50" onMouseDown={(e) => handleResizeStart(e, 'se')}>
                <MoveDiagonal size={14}/>
            </div>
        </div>
    );
};

const PanelHeader = ({ icon: Icon, title, onPopOut, isPopped, onDragStart, onDrop }) => (
    <div
        className="panel-header p-2 px-3 flex justify-between items-center select-none flex-shrink-0"
        draggable={!isPopped}
        onDragStart={!isPopped ? onDragStart : undefined}
        onDragOver={(e) => e.preventDefault()}
        onDrop={!isPopped ? onDrop : undefined}
    >
        <span className="font-bold text-sm tracking-wide text-gray-300 flex items-center gap-2">
            {!isPopped && <GripHorizontal size={14} className="text-gray-600 cursor-grab"/>}
            <Icon size={16}/> {title}
        </span>
        {!isPopped && <button onClick={onPopOut} className="text-gray-500 hover:text-white" title="Pop Out"><Maximize2 size={14}/></button>}
    </div>
);

const PoppedPlaceholder = ({ title, onRestore }) => (
    <div className="h-full w-full flex flex-col items-center justify-center text-gray-600 bg-[#121418]">
        <ExternalLink size={32} className="mb-2 opacity-50"/><span className="text-sm font-bold">{title} is popped out</span>
        <button onClick={onRestore} className="mt-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-700">Restore</button>
    </div>
);

// --- WIDGETS ---

const DiceWidget = () => {
    const [history, setHistory] = useState([]);
    const [selectedDice, setSelectedDice] = useState('d20');
    const [count, setCount] = useState(1);
    const [modifier, setModifier] = useState(0);

    const roll = (mode = 'normal') => {
        let rolls = [];
        let total = 0;
        let details = '';

        if (selectedDice === 'duality') {
            const hope = Math.floor(Math.random() * 12) + 1;
            const fear = Math.floor(Math.random() * 12) + 1;
            rolls = [hope, fear];
            total = hope + fear + modifier;
            const isCrit = hope === fear;
            details = `Hope: ${hope}, Fear: ${fear}${isCrit ? ' (CRIT)' : ''}`;
        } else {
            const sides = parseInt(selectedDice.substring(1));

            if (mode === 'normal') {
                for(let i=0; i<count; i++) {
                    const r = Math.floor(Math.random() * sides) + 1;
                    rolls.push(r);
                    total += r;
                }
                details = `[${rolls.join(', ')}]`;
            } else {
                const r1 = Math.floor(Math.random() * sides) + 1;
                const r2 = Math.floor(Math.random() * sides) + 1;
                rolls = [r1, r2];
                total = mode === 'adv' ? Math.max(r1, r2) : Math.min(r1, r2);
                details = `Rolled: [${r1}, ${r2}]`;
            }
            total += modifier;
        }

        const newRoll = {
            id: Date.now(),
            dice: selectedDice === 'duality' ? 'Duality' : `${mode === 'normal' ? count : 1}${selectedDice}`,
            result: total,
            details: details,
            mode: mode
        };
        setHistory(prev => [newRoll, ...prev].slice(0, 10));
    };

    return (
        <div className="h-full flex flex-col gap-2 p-1">
            <div className="grid grid-cols-4 gap-1 mb-2">
                {['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100', 'duality'].map(d => (
                    <button
                        key={d}
                        onClick={() => setSelectedDice(d)}
                        className={`text-xs py-1 rounded font-bold uppercase ${selectedDice === d ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        {d === 'duality' ? 'Dual' : d}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 items-center bg-gray-900 p-2 rounded">
                {selectedDice !== 'duality' && (
                    <div className="flex items-center border border-gray-700 rounded overflow-hidden">
                        <button onClick={() => setCount(Math.max(1, count-1))} className="px-2 hover:bg-gray-700 text-gray-400">-</button>
                        <span className="px-2 text-sm w-6 text-center">{count}</span>
                        <button onClick={() => setCount(count+1)} className="px-2 hover:bg-gray-700 text-gray-400">+</button>
                    </div>
                )}
                <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-gray-500">Mod:</span>
                    <input type="number" className="w-10 bg-gray-800 border border-gray-700 rounded text-center text-sm" value={modifier} onChange={e => setModifier(parseInt(e.target.value)||0)}/>
                </div>
            </div>

            <div className="flex gap-2">
                <button onClick={() => roll('normal')} className="flex-1 bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-1.5 rounded text-sm">Roll</button>
                {selectedDice !== 'duality' && (
                    <>
                        <button onClick={() => roll('adv')} className="flex-1 bg-green-900 hover:bg-green-800 text-green-200 font-bold py-1.5 rounded text-xs">Adv</button>
                        <button onClick={() => roll('dis')} className="flex-1 bg-red-900 hover:bg-red-800 text-red-200 font-bold py-1.5 rounded text-xs">Dis</button>
                    </>
                )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-1 mt-2 border-t border-gray-800 pt-2">
                {history.map(h => (
                    <div key={h.id} className="flex justify-between items-center text-xs p-1 hover:bg-gray-800 rounded">
                        <div>
                            <span className="font-bold text-gray-400">{h.dice}</span>
                            {h.mode !== 'normal' && <span className={`ml-1 text-[9px] uppercase ${h.mode === 'adv' ? 'text-green-500' : 'text-red-500'}`}>{h.mode}</span>}
                            <div className="text-[10px] text-gray-600">{h.details} {modifier !== 0 ? `(${modifier > 0 ? '+' : ''}${modifier})` : ''}</div>
                        </div>
                        <span className="text-lg font-bold text-white">{h.result}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FearWidget = ({ fear, setFear }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <Skull size={100} className="text-purple-500" />
            </div>
            <div className="text-6xl font-bold text-purple-400 mb-6 drop-shadow-lg z-10">{fear}</div>
            <div className="flex gap-6 z-10">
                <button onClick={() => setFear(Math.max(0, fear - 1))} className="w-12 h-12 flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full text-white shadow-lg transition-transform hover:scale-110 active:scale-95"><Minus size={24} /></button>
                <button onClick={() => setFear(Math.min(12, fear + 1))} className="w-12 h-12 flex items-center justify-center bg-purple-700 hover:bg-purple-600 border border-purple-500 rounded-full text-white shadow-lg shadow-purple-900/50 transition-transform hover:scale-110 active:scale-95"><Plus size={24} /></button>
            </div>
            <div className="mt-6 z-10 flex gap-2">
                 <button onClick={() => setFear(0)} className="text-xs text-gray-500 hover:text-red-400 uppercase tracking-widest font-bold px-2 py-1 rounded hover:bg-gray-800">Clear</button>
            </div>
        </div>
    );
};

const TimelineWidget = ({ activeSessionId, setActiveSessionId, sessions, setSessions, nodes, setNodes, openWindow }) => {
    const createSession = () => {
        const newId = Date.now().toString();
        const newSession = { id: newId, title: 'New Session', date: new Date().toLocaleDateString() };
        setSessions([newSession, ...sessions]);
        setActiveSessionId(newId);
    };

    const addNode = () => {
        const newNode = { id: Date.now(), title: 'New Scene', desc: '', enemies: [], skillChecks: [], npcs: [], children: [] };
        setNodes([...nodes, newNode]);
    };

    return (
        <div className="h-full flex flex-col gap-2">
            <div className="flex gap-2 mb-2">
                <select
                    className="flex-1 bg-gray-900 border border-gray-700 rounded p-1 text-xs text-white"
                    value={activeSessionId || ''}
                    onChange={(e) => setActiveSessionId(e.target.value)}
                >
                    <option value="" disabled>Select Session</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.title} ({s.date})</option>)}
                </select>
                <button onClick={createSession} className="bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded" title="New Session"><Plus size={14}/></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                {nodes.filter(n => n.type !== 'quick_encounter').map((node, i) => (
                    <div key={node.id} className="bg-gray-800/50 p-2 rounded border border-gray-700 hover:border-indigo-500 cursor-pointer group" onClick={() => openWindow('SCENE', { nodeId: node.id }, node.title)}>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-gray-200">{i+1}. {node.title}</span>
                            <ChevronRight size={14} className="text-gray-500 group-hover:text-white"/>
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">{node.desc || 'No description...'}</div>
                    </div>
                ))}
                {nodes.filter(n => n.type !== 'quick_encounter').length === 0 && <div className="text-xs text-gray-600 text-center italic mt-4">No scenes yet.</div>}
            </div>

            <button onClick={addNode} className="w-full py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded border border-gray-700 mt-auto flex items-center justify-center gap-2">
                <Plus size={12}/> Add Scene
            </button>
        </div>
    );
};

const HexGridWidget = ({ hexes, updateHex, bgImage, setBgImage, openWindow, hexSettings, setHexSettings, updateGridDimensions, loadMapData }) => {
    const size = hexSettings.hexSize || 35;

    const hexToPixel = (q, r) => {
        const x = size * 3/2 * q;
        const y = size * Math.sqrt(3) * (r + q/2);
        return { x: x + (hexSettings.offsetX || 0), y: y + (hexSettings.offsetY || 0) };
    };

    const getHexPoints = (x, y, r) => {
        let points = [];
        for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i;
            const angle_rad = Math.PI / 180 * angle_deg;
            points.push(`${x + r * Math.cos(angle_rad)},${y + r * Math.sin(angle_rad)}`);
        }
        return points.join(" ");
    };

    const [dragStart, setDragStart] = useState(null);
    const [isMoveMode, setIsMoveMode] = useState(false);
    const [activeTool, setActiveTool] = useState('SELECT');
    const [paintData, setPaintData] = useState({ terrain: 'plains', icon: 'none' });
    const [isPainting, setIsPainting] = useState(false);

    const [showToolbar, setShowToolbar] = useState(true);
    const fileInputRef = useRef(null);
    const mapImportRef = useRef(null);

    const handleMouseDown = (e) => {
        if (activeTool === 'PAINT' && e.target.closest('.hex-interactive')) {
            setIsPainting(true);
            return;
        }
        if (!isMoveMode || e.target.closest('.hex-interactive')) return;
        setDragStart({ x: e.clientX, y: e.clientY, initX: hexSettings.offsetX || 0, initY: hexSettings.offsetY || 0 });
    };

    const handleHexEnter = (idx) => {
        if (isPainting && activeTool === 'PAINT') {
            applyPaint(idx);
        }
    };

    const applyPaint = (idx) => {
        const h = hexes[idx];
        const newHex = { ...h, terrain: paintData.terrain };
        if (paintData.icon !== 'none') newHex.icon = paintData.icon;
        if (newHex.status === 'unexplored') newHex.status = 'explored';

        updateHex(idx, 'terrain', newHex.terrain);
        if (paintData.icon !== 'none') updateHex(idx, 'icon', newHex.icon);
        updateHex(idx, 'status', 'explored');
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setBgImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hexes));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "hex_map_data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedHexes = JSON.parse(event.target.result);
                if(Array.isArray(loadedHexes)) {
                    loadMapData(loadedHexes);
                } else {
                    alert("Invalid map file");
                }
            } catch(error) {
                console.error("Error reading map file", error);
            }
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (dragStart) {
                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;
                setHexSettings(prev => ({ ...prev, offsetX: dragStart.initX + dx, offsetY: dragStart.initY + dy }));
            }
        };
        const handleMouseUp = () => { setDragStart(null); setIsPainting(false); };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragStart, setHexSettings]);

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-[#15171b]">
            {showToolbar ? (
                <div className="absolute top-2 left-2 right-2 z-20 flex flex-wrap gap-2 items-center bg-[#25282e] p-2 rounded shadow-lg border border-gray-700 pointer-events-auto">
                      <button
                        onClick={() => setIsMoveMode(!isMoveMode)}
                        className={`p-1.5 rounded transition-colors ${isMoveMode ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                        title="Move Grid (Drag background)"
                      >
                        <Move size={14}/>
                      </button>
                      <div className="h-4 w-px bg-gray-600 mx-1"></div>

                      <button
                        onClick={() => setActiveTool('SELECT')}
                        className={`p-1.5 rounded transition-colors ${activeTool === 'SELECT' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                        title="Select Hex"
                      >
                        <CheckSquare size={14}/>
                      </button>

                      <button
                        onClick={() => setActiveTool('PAINT')}
                        className={`p-1.5 rounded transition-colors ${activeTool === 'PAINT' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                        title="Paint Brush"
                      >
                        <PaintBucket size={14}/>
                      </button>

                      {activeTool === 'PAINT' && (
                        <div className="flex items-center gap-1 bg-black/20 p-1 rounded">
                             <select className="bg-gray-900 border border-gray-700 rounded text-[10px] text-white py-1" value={paintData.terrain} onChange={(e) => setPaintData(p => ({...p, terrain: e.target.value}))}>
                                <option value="plains">Plains</option>
                                <option value="forest">Forest</option>
                                <option value="mountain">Mountain</option>
                                <option value="water">Water</option>
                                <option value="swamp">Swamp</option>
                                <option value="desert">Desert</option>
                             </select>
                             <select className="bg-gray-900 border border-gray-700 rounded text-[10px] text-white py-1" value={paintData.icon} onChange={(e) => setPaintData(p => ({...p, icon: e.target.value}))}>
                                <option value="none">No Icon</option>
                                <option value="town">Town</option>
                                <option value="dungeon">Dungeon</option>
                                <option value="ruins">Ruins</option>
                             </select>
                        </div>
                      )}

                      <div className="h-4 w-px bg-gray-600 mx-1"></div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase text-gray-500 font-bold">Grid</span>
                        <input type="number" className="w-10 bg-gray-900 border border-gray-700 rounded px-2 py-0.5 text-xs text-white focus:border-indigo-500 outline-none" value={hexSettings.rows || 8} onChange={(e) => updateGridDimensions(parseInt(e.target.value)||1, hexSettings.cols||8)} />
                        <span className="text-gray-500 text-xs">x</span>
                        <input type="number" className="w-10 bg-gray-900 border border-gray-700 rounded px-2 py-0.5 text-xs text-white focus:border-indigo-500 outline-none" value={hexSettings.cols || 8} onChange={(e) => updateGridDimensions(hexSettings.rows||8, parseInt(e.target.value)||1)} />
                      </div>

                      <div className="flex-1 min-w-[100px] ml-auto">
                        <div className="relative flex gap-1 justify-end">
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-400 p-1 rounded border border-gray-700"
                                title="Upload Background Image"
                            >
                                <Upload size={12}/>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />

                            <button
                                onClick={handleExport}
                                className="bg-gray-800 hover:bg-gray-700 text-green-400 p-1 rounded border border-gray-700"
                                title="Save Map (Export JSON)"
                            >
                                <Save size={12}/>
                            </button>
                            <button
                                onClick={() => mapImportRef.current.click()}
                                className="bg-gray-800 hover:bg-gray-700 text-blue-400 p-1 rounded border border-gray-700"
                                title="Load Map (Import JSON)"
                            >
                                <Folder size={12}/>
                            </button>
                            <input
                                type="file"
                                ref={mapImportRef}
                                onChange={handleImport}
                                className="hidden"
                                accept=".json"
                            />
                        </div>
                      </div>
                      <button onClick={() => setShowToolbar(false)} className="text-gray-500 hover:text-white ml-2"><EyeOff size={14}/></button>
                </div>
            ) : (
                <button onClick={() => setShowToolbar(true)} className="absolute top-2 left-2 z-20 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded pointer-events-auto border border-white/10"><Settings size={14}/></button>
            )}

            <div
                className={`flex-1 overflow-hidden relative ${isMoveMode ? 'cursor-move' : activeTool === 'PAINT' ? 'cursor-crosshair' : 'cursor-default'}`}
                onMouseDown={handleMouseDown}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        transform: `scale(${hexSettings.scale})`,
                        transformOrigin: 'top left',
                        position: 'relative'
                    }}
                >
                    {bgImage && (
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage: `url(${bgImage})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'top left',
                                opacity: 1,
                                width: '2000px',
                                height: '2000px'
                            }}
                        />
                    )}

                    <svg
                        width="2000"
                        height="2000"
                        className="absolute inset-0 pointer-events-none"
                        style={{ overflow: 'visible' }}
                    >
                        {hexes.map((hex, i) => {
                            const { x, y } = hexToPixel(hex.q, hex.r);
                            const hexOpacity = hexSettings.opacity !== undefined ? hexSettings.opacity : 0.5;
                            const isRevealed = hex.status === 'explored' || hex.status === 'unsearched';

                            return (
                                <g
                                    key={`${hex.q},${hex.r}`}
                                    className="hex-interactive cursor-pointer pointer-events-auto hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        if (activeTool === 'PAINT') applyPaint(i);
                                        else if (!isMoveMode) openWindow('HEX_DETAIL', { hexIndex: i }, `Hex ${hex.q},${hex.r}`);
                                    }}
                                    onMouseEnter={() => handleHexEnter(i)}
                                >
                                    <polygon
                                        points={getHexPoints(x, y, size - 1)}
                                        fill={isRevealed
                                            ? (hex.terrain === 'mountain' ? '#4a5568' : hex.terrain === 'water' ? '#2b6cb0' : hex.terrain === 'forest' ? '#2f855a' : hex.terrain === 'desert' ? '#d69e2e' : hex.terrain === 'swamp' ? '#2c5282' : '#2d3748')
                                            : 'black'
                                        }
                                        fillOpacity={isRevealed ? hexOpacity : Math.min(hexOpacity + 0.2, 0.8)}
                                        stroke={
                                            hex.status === 'unsearched' ? '#fbbf24' :
                                            hex.status === 'explored' ? '#4ade80' :
                                            (hex.status === 'unexplored' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)')
                                        }
                                        strokeWidth={hex.status === 'unsearched' || hex.status === 'explored' ? "2.5" : "1.5"}
                                        strokeDasharray={hex.status === 'unsearched' ? "4,2" : "none"}
                                        className="hover:fill-white/20"
                                    />
                                    {hex.status === 'unexplored' && (
                                        <text x={x} y={y} dy=".3em" textAnchor="middle" fontSize={size/2.5} fill="rgba(255,255,255,0.5)" className="pointer-events-none select-none font-sans font-bold shadow-black drop-shadow-md">
                                            {String(hex.q)},{String(hex.r)}
                                        </text>
                                    )}
                                    {hex.icon === 'town' && <text x={x} y={y} dy=".3em" textAnchor="middle" fontSize={size} className="pointer-events-none">🏘️</text>}
                                    {hex.icon === 'dungeon' && <text x={x} y={y} dy=".3em" textAnchor="middle" fontSize={size} className="pointer-events-none">🏰</text>}
                                    {hex.icon === 'ruins' && <text x={x} y={y} dy=".3em" textAnchor="middle" fontSize={size} className="pointer-events-none">🗿</text>}
                                    {(hex.npcs && hex.npcs.length > 0) && (
                                        <text x={x} y={y + size/1.8} dy=".3em" textAnchor="middle" fontSize={size/2.5} className="pointer-events-none">👤</text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <div className="absolute bottom-2 right-2 flex gap-1 z-20">
                     <button onClick={() => setHexSettings(p => ({...p, scale: Math.min(3, p.scale + 0.1)}))} className="bg-[#25282e] border border-gray-700 hover:bg-gray-700 text-white p-1.5 rounded shadow-lg"><Plus size={14}/></button>
                     <button onClick={() => setHexSettings(p => ({...p, scale: Math.max(0.2, p.scale - 0.1)}))} className="bg-[#25282e] border border-gray-700 hover:bg-gray-700 text-white p-1.5 rounded shadow-lg"><Minus size={14}/></button>
                </div>
            </div>
        </div>
    );
};

const PartyWidget = ({ party, setParty }) => {
    const updateMember = (id, field, value) => {
        setParty(party.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    return (
        <div className="h-full overflow-y-auto space-y-2 p-1">
            {party.map(pc => (
                <div key={pc.id} className="bg-gray-800 p-2 rounded border border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-white">{pc.name}</span>
                        <span className="text-[10px] text-gray-500">{pc.class}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-black/30 rounded p-1">
                            <div className="text-[8px] uppercase text-red-400 font-bold">HP</div>
                            <div className="flex items-center justify-center gap-1">
                                <button onClick={() => updateMember(pc.id, 'hp', Math.max(0, pc.hp - 1))} className="text-gray-500 hover:text-white">-</button>
                                <span className="text-sm font-bold">{pc.hp}/{pc.maxHp}</span>
                                <button onClick={() => updateMember(pc.id, 'hp', Math.min(pc.maxHp, pc.hp + 1))} className="text-gray-500 hover:text-white">+</button>
                            </div>
                        </div>
                        <div className="bg-black/30 rounded p-1">
                            <div className="text-[8px] uppercase text-purple-400 font-bold">Stress</div>
                            <div className="flex items-center justify-center gap-1">
                                <button onClick={() => updateMember(pc.id, 'stress', Math.max(0, pc.stress - 1))} className="text-gray-500 hover:text-white">-</button>
                                <span className="text-sm font-bold">{pc.stress}/{pc.maxStress}</span>
                                <button onClick={() => updateMember(pc.id, 'stress', Math.min(pc.maxStress, pc.stress + 1))} className="text-gray-500 hover:text-white">+</button>
                            </div>
                        </div>
                        <div className="bg-black/30 rounded p-1">
                            <div className="text-[8px] uppercase text-yellow-400 font-bold">Hope</div>
                            <div className="flex items-center justify-center gap-1">
                                <button onClick={() => updateMember(pc.id, 'hope', Math.max(0, pc.hope - 1))} className="text-gray-500 hover:text-white">-</button>
                                <span className="text-sm font-bold">{pc.hope}</span>
                                <button onClick={() => updateMember(pc.id, 'hope', pc.hope + 1)} className="text-gray-500 hover:text-white">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const RulesWidget = ({ rules }) => {
    return (
        <div className="h-full overflow-y-auto space-y-1 p-1">
            {rules.map(rule => (
                <div key={rule.id} className="bg-gray-800/50 rounded border border-gray-700 overflow-hidden">
                      <div className="p-2 bg-gray-800 font-bold text-xs text-yellow-500">{rule.title}</div>
                      <div className="p-2 text-[10px] text-gray-300 whitespace-pre-wrap font-mono">{rule.content}</div>
                </div>
            ))}
        </div>
    );
};

const MapWidget = ({ mapUrl, setMapUrl, notes, setNotes }) => {
    return (
        <div className="h-full flex flex-col gap-2">
            <input
                className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
                placeholder="Map Image URL..."
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
            />
            <div className="flex-1 bg-black/50 rounded border border-gray-800 overflow-hidden relative">
                {mapUrl ? (
                    <img src={mapUrl} alt="World Map" className="w-full h-full object-contain" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-600 text-xs">No map loaded</div>
                )}
            </div>
            <textarea
                className="h-20 bg-gray-900 border border-gray-700 rounded p-2 text-xs text-gray-300 resize-none focus:outline-none focus:border-orange-500"
                placeholder="Map notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </div>
    );
};

const EncounterManager = ({ savedEncounters, setSavedEncounters }) => {
    const [name, setName] = useState('');
    const [difficulty, setDifficulty] = useState('Moderate');
    const [notes, setNotes] = useState('');

    const addEncounter = () => {
        if (!name.trim()) return;
        setSavedEncounters(prev => [
            { id: Date.now(), name: name.trim(), difficulty, notes: notes.trim() },
            ...prev
        ]);
        setName('');
        setDifficulty('Moderate');
        setNotes('');
    };

    const deleteEncounter = (id) => {
        setSavedEncounters(prev => prev.filter(encounter => encounter.id !== id));
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="bg-gray-900/60 border border-gray-700 rounded p-3 space-y-3">
                <div className="text-xs uppercase tracking-wide text-gray-400 font-bold">Create Encounter</div>
                <div className="grid grid-cols-1 gap-2">
                    <input
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none"
                        placeholder="Encounter name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <select
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Hard">Hard</option>
                        <option value="Deadly">Deadly</option>
                    </select>
                    <textarea
                        className="w-full h-24 bg-gray-900 border border-gray-700 rounded p-2 text-xs text-gray-300 resize-none focus:outline-none focus:border-red-500"
                        placeholder="Encounter notes, foes, twists..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <button onClick={addEncounter} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded">
                        Save Encounter
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
                {savedEncounters.length === 0 && (
                    <div className="text-center text-gray-500 text-sm italic mt-8">No saved encounters yet.</div>
                )}
                {savedEncounters.map(encounter => (
                    <div key={encounter.id} className="bg-gray-800 border border-gray-700 rounded p-3 space-y-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm font-bold text-gray-200">{encounter.name}</div>
                                <div className="text-[10px] uppercase text-red-400 font-bold">{encounter.difficulty}</div>
                            </div>
                            <button onClick={() => deleteEncounter(encounter.id)} className="text-gray-400 hover:text-red-400">
                                <Trash2 size={14}/>
                            </button>
                        </div>
                        {encounter.notes && (
                            <div className="text-xs text-gray-400 whitespace-pre-wrap">{encounter.notes}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const BestiaryPickerWindowContent = ({ library, onPick, close }) => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState([]);

    const [typeFilter, setTypeFilter] = useState('All');
    const [tierFilter, setTierFilter] = useState('All');
    const [creatureFilter, setCreatureFilter] = useState('All');
    const [biomeFilter, setBiomeFilter] = useState('All');

    const filtered = library.filter(adv => {
        const matchesSearch = adv.name.toLowerCase().includes(search.toLowerCase()) || adv.tags.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'All' || adv.type === typeFilter;
        const matchesTier = tierFilter === 'All' || adv.tier === tierFilter;
        const matchesCreature = creatureFilter === 'All' || adv.creatureType === creatureFilter;
        const matchesBiome = biomeFilter === 'All' || adv.biome === biomeFilter;
        return matchesSearch && matchesType && matchesTier && matchesCreature && matchesBiome;
    });

    const addToSelected = (adv) => {
        setSelected(prev => {
            const existing = prev.find(p => p.id === adv.id);
            if (existing) {
                return prev.map(p => p.id === adv.id ? { ...p, count: p.count + 1 } : p);
            }
            return [...prev, { ...adv, count: 1 }];
        });
    };

    const removeFromSelected = (advId) => {
        setSelected(prev => {
            const existing = prev.find(p => p.id === advId);
            if (existing.count > 1) {
                return prev.map(p => p.id === advId ? { ...p, count: p.count - 1 } : p);
            }
            return prev.filter(p => p.id !== advId);
        });
    };

    const confirmSelection = () => {
        const enemiesToAdd = selected.flatMap(s =>
            Array.from({length: s.count}).map(() => ({ ...s }))
        );

        onPick(enemiesToAdd);
        close();
    };

    return (
        <div className="h-full flex gap-4">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex flex-col gap-2 mb-2">
                    <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}/>
                    <div className="flex gap-1 flex-wrap">
                        <select className="bg-gray-800 border border-gray-700 rounded text-xs px-1 py-1 text-gray-300" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option value="All">All Types</option>{ADVERSARY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        <select className="bg-gray-800 border border-gray-700 rounded text-xs px-1 py-1 text-gray-300" value={tierFilter} onChange={e => setTierFilter(e.target.value)}><option value="All">All Tiers</option>{[0,1,2,3,4].map(t => <option key={t} value={String(t)}>Tier {t}</option>)}</select>
                        <select className="bg-gray-800 border border-gray-700 rounded text-xs px-1 py-1 text-gray-300" value={creatureFilter} onChange={e => setCreatureFilter(e.target.value)}><option value="All">All Creatures</option>{CREATURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        <select className="bg-gray-800 border border-gray-700 rounded text-xs px-1 py-1 text-gray-300" value={biomeFilter} onChange={e => setBiomeFilter(e.target.value)}><option value="All">All Biomes</option>{BIOMES.map(b => <option key={b} value={b}>{b}</option>)}</select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
                    {filtered.map(adv => (
                        <div key={adv.id} onClick={() => addToSelected(adv)} className="bg-gray-800 hover:bg-gray-700 p-2 rounded cursor-pointer border border-gray-700 flex justify-between items-center group">
                            <div>
                                <div className="font-bold text-sm">{adv.name}</div>
                                <div className="text-[10px] text-gray-400">{adv.type} • Tier {adv.tier}</div>
                            </div>
                            <div className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                                {adv.difficulty} <Plus size={14} className="opacity-0 group-hover:opacity-100"/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-1/3 bg-gray-900 border-l border-gray-800 pl-4 flex flex-col">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Selected Squad</h4>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    {selected.map(s => (
                        <div key={s.id} className="flex justify-between items-center bg-black/20 p-2 rounded">
                            <span className="text-sm font-bold truncate">{s.name}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => removeFromSelected(s.id)} className="text-gray-500 hover:text-white"><Minus size={12}/></button>
                                <span className="text-xs font-mono">{s.count}</span>
                                <button onClick={() => addToSelected(s)} className="text-gray-500 hover:text-white"><Plus size={12}/></button>
                            </div>
                        </div>
                    ))}
                    {selected.length === 0 && <div className="text-xs text-gray-600 italic text-center mt-4">No adversaries selected.</div>}
                </div>
                <button
                    onClick={confirmSelection}
                    disabled={selected.length === 0}
                    className={`w-full py-2 rounded font-bold text-sm ${selected.length > 0 ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                    Add to Combat
                </button>
            </div>
        </div>
    );
};

const AdversaryBuilderWindow = ({ onSave, initialData, close }) => {
    const [data, setData] = useState(initialData || {
        id: Date.now(),
        name: '',
        tier: '0',
        type: 'Standard',
        creatureType: 'Humanoid',
        biome: 'Plains',
        tags: '',
        difficulty: '10',
        experiences: '',
        motives: '',
        attacks: [],
        hp: '1',
        stress: '0',
        thresholds: { major: '', severe: '' },
        features: [],
        environment: false
    });

    const handleSave = () => { onSave(data); close(); };
    const addAttack = () => setData({...data, attacks: [...data.attacks, { id: Date.now(), name: '', range: 'Melee', mod: '', damage: '' }]});
    const updateAttack = (id, field, value) => setData({...data, attacks: data.attacks.map(atk => atk.id === id ? { ...atk, [field]: value } : atk)});
    const deleteAttack = (id) => setData({...data, attacks: data.attacks.filter(atk => atk.id !== id)});

    const addFeature = () => setData({...data, features: [...data.features, { id: Date.now(), name: '', type: 'Action', description: '', flavorText: '', fearCost: '', stressCost: '', hpCost: '', maxUses: '', passiveValue: '' }]});
    const updateFeature = (id, field, value) => setData({...data, features: data.features.map(f => f.id === id ? { ...f, [field]: value } : f)});
    const deleteFeature = (id) => setData({...data, features: data.features.filter(f => f.id !== id)});

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="dh-card p-4 flex-1 overflow-y-auto min-h-0">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Name</label>
                        <input className="w-full bg-transparent text-xl font-bold text-white border-b border-gray-600 focus:border-red-500 outline-none" value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Adversary Name"/>
                    </div>
                    <div className="w-20">
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Tier</label>
                        <select className="w-full bg-transparent text-xl font-bold text-white border-b border-gray-600 focus:border-red-500 outline-none text-center" value={data.tier} onChange={e => setData({...data, tier: e.target.value})}>
                            {[0,1,2,3,4].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div><label className="text-[9px] uppercase text-gray-500 font-bold">Adversary Type</label><select className="w-full bg-gray-800 text-xs p-2 rounded border border-gray-700 text-gray-300" value={data.type} onChange={e => setData({...data, type: e.target.value})}>{ADVERSARY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div><label className="text-[9px] uppercase text-gray-500 font-bold">Creature Type</label><select className="w-full bg-gray-800 text-xs p-2 rounded border border-gray-700 text-gray-300" value={data.creatureType} onChange={e => setData({...data, creatureType: e.target.value})}>{CREATURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div><label className="text-[9px] uppercase text-gray-500 font-bold">Biome</label><select className="w-full bg-gray-800 text-xs p-2 rounded border border-gray-700 text-gray-300" value={data.biome} onChange={e => setData({...data, biome: e.target.value})}>{BIOMES.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                    <div><label className="text-[9px] uppercase text-gray-500 font-bold">Tags</label><input className="w-full bg-gray-800 text-xs p-2 rounded border border-gray-700 text-gray-300" placeholder="e.g. Skeleton, Trap" value={data.tags} onChange={e => setData({...data, tags: e.target.value})}/></div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="col-span-1 dh-stat-box"><div className="text-[9px] uppercase text-gray-500 font-bold mb-1">Difficulty</div><input className="w-full bg-transparent text-center font-bold text-lg text-white" value={data.difficulty} onChange={e => setData({...data, difficulty: e.target.value})} placeholder="12"/></div>
                    <div className="col-span-1 dh-stat-box"><div className="text-[9px] uppercase text-gray-500 font-bold mb-1">Attack Mod</div><input className="w-full bg-transparent text-center font-bold text-lg text-red-400" value={data.attack} onChange={e => setData({...data, attack: e.target.value})} placeholder="+0"/></div>
                    <div className="col-span-2 bg-gray-900/50 p-2 rounded border border-gray-700"><label className="text-[9px] uppercase text-gray-500 font-bold block mb-1">Experiences</label><textarea className="w-full bg-transparent text-sm text-gray-300 resize-none h-12 focus:outline-none" value={data.experiences} onChange={e => setData({...data, experiences: e.target.value})} placeholder="Alertness +2, Sneaky +1..."/></div>
                </div>

                 <div className="mb-4 bg-gray-900/50 p-2 rounded border border-gray-700">
                    <label className="text-[9px] uppercase text-gray-500 font-bold block mb-1">Motives & Tactics</label>
                    <textarea className="w-full bg-transparent text-sm text-gray-300 resize-none h-16 focus:outline-none" value={data.motives} onChange={e => setData({...data, motives: e.target.value})} placeholder="To protect the queen..."/>
                 </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2"><label className="text-[10px] uppercase text-gray-500 font-bold">Attacks & Weapons</label><button onClick={addAttack} className="text-[10px] bg-red-900 hover:bg-red-800 text-red-200 px-2 py-1 rounded flex items-center gap-1">+ Add Attack</button></div>
                    <div className="space-y-2">
                        {data.attacks.map(atk => (
                            <div key={atk.id} className="grid grid-cols-12 gap-2 items-center bg-gray-800 p-2 rounded border border-gray-700">
                                <input className="col-span-4 bg-transparent border-b border-gray-600 text-sm text-white focus:border-red-500 outline-none" placeholder="Weapon Name" value={atk.name} onChange={e => updateAttack(atk.id, 'name', e.target.value)} />
                                <select className="col-span-3 bg-transparent border-b border-gray-600 text-xs text-gray-400 focus:border-red-500 outline-none" value={atk.range} onChange={e => updateAttack(atk.id, 'range', e.target.value)}>{ATTACK_RANGES.map(r => <option key={r} value={r}>{r}</option>)}</select>
                                <input className="col-span-2 bg-transparent border-b border-gray-600 text-sm text-red-300 font-bold focus:border-red-500 outline-none text-center" placeholder="+3" value={atk.mod} onChange={e => updateAttack(atk.id, 'mod', e.target.value)} />
                                <input className="col-span-2 bg-transparent border-b border-gray-600 text-sm text-gray-200 focus:border-red-500 outline-none text-right" placeholder="1d8+2" value={atk.damage} onChange={e => updateAttack(atk.id, 'damage', e.target.value)} />
                                <button onClick={() => deleteAttack(atk.id)} className="col-span-1 text-gray-600 hover:text-red-500 flex justify-center"><Trash2 size={12}/></button>
                            </div>
                        ))}
                        {data.attacks.length === 0 && <div className="text-xs text-gray-600 italic text-center p-2">No attacks added.</div>}
                    </div>
                </div>

                <div className="bg-gray-900/50 p-3 rounded border border-gray-700 mb-6">
                    <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block">Damage Thresholds & Health</label>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="text-center"><span className="block text-[9px] text-gray-500">Major</span><input className="w-full bg-gray-800 border border-gray-600 rounded text-center text-sm" value={data.thresholds.major} onChange={e => setData({...data, thresholds: {...data.thresholds, major: e.target.value}})} placeholder="X"/></div>
                        <div className="text-center"><span className="block text-[9px] text-gray-500">Severe</span><input className="w-full bg-gray-800 border border-gray-600 rounded text-center text-sm" value={data.thresholds.severe} onChange={e => setData({...data, thresholds: {...data.thresholds, severe: e.target.value}})} placeholder="Y+"/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-2 mt-2">
                        <div className="flex items-center justify-between"><span className="text-xs text-gray-400 font-bold">Hit Points</span><input className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-center font-bold text-white" value={data.hp} onChange={e => setData({...data, hp: e.target.value})} /></div>
                        <div className="flex items-center justify-between"><span className="text-xs text-purple-400 font-bold">Stress</span><input className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-center font-bold text-white" value={data.stress} onChange={e => setData({...data, stress: e.target.value})} /></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2"><label className="text-[10px] uppercase text-gray-500 font-bold">Moves & Features</label><button onClick={addFeature} className="text-[10px] bg-indigo-900 hover:bg-indigo-800 text-indigo-200 px-2 py-1 rounded flex items-center gap-1">+ Add Feature</button></div>
                    <div className="space-y-2">
                        {(data.features || []).map(f => (
                            <div key={f.id} className="dh-feature-row relative group p-2 bg-gray-900/30 border border-indigo-900/30 rounded">
                                <div className="flex gap-2 mb-2 items-center">
                                    <input className="bg-transparent font-bold text-sm text-indigo-300 focus:outline-none flex-1" placeholder="Feature Name" value={f.name} onChange={e => updateFeature(f.id, 'name', e.target.value)} />
                                    <select className="bg-gray-900 border border-indigo-900/50 text-[10px] text-gray-400 rounded px-1" value={f.type} onChange={e => updateFeature(f.id, 'type', e.target.value)}>
                                        {FEATURE_TYPES.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                                    </select>
                                    {f.type === 'Passive' && (
                                        <input
                                            className="w-16 bg-transparent text-xs text-center border-b border-indigo-900/50 focus:border-indigo-500 outline-none text-indigo-200"
                                            placeholder="Value"
                                            value={f.passiveValue || ''}
                                            onChange={e => updateFeature(f.id, 'passiveValue', e.target.value)}
                                        />
                                    )}
                                </div>
                                <input className="w-full bg-transparent text-xs text-gray-500 italic mb-1 focus:outline-none border-b border-transparent focus:border-gray-700" placeholder="Flavor Text (Optional)..." value={f.flavorText || ''} onChange={e => updateFeature(f.id, 'flavorText', e.target.value)} />
                                <textarea className="w-full bg-transparent text-xs text-gray-300 resize-none h-16 focus:outline-none mb-2" placeholder="Mechanics description..." value={f.description} onChange={e => updateFeature(f.id, 'description', e.target.value)} />
                                <div className="flex gap-3 items-center bg-black/20 p-1 rounded">
                                    <div className="flex items-center gap-1" title="Fear Cost"><Skull size={10} className="text-purple-400"/><input className="w-6 bg-transparent text-xs text-center border-b border-gray-700 focus:border-purple-500 outline-none text-purple-200" placeholder="-" value={f.fearCost || ''} onChange={e => updateFeature(f.id, 'fearCost', e.target.value)} /></div>
                                    <div className="flex items-center gap-1" title="Stress Cost"><Activity size={10} className="text-gray-400"/><input className="w-6 bg-transparent text-xs text-center border-b border-gray-700 focus:border-white outline-none text-gray-200" placeholder="-" value={f.stressCost || ''} onChange={e => updateFeature(f.id, 'stressCost', e.target.value)} /></div>
                                    <div className="flex items-center gap-1" title="HP Cost"><div className="text-[10px] text-red-400 font-bold">HP</div><input className="w-6 bg-transparent text-xs text-center border-b border-gray-700 focus:border-red-500 outline-none text-red-200" placeholder="-" value={f.hpCost || ''} onChange={e => updateFeature(f.id, 'hpCost', e.target.value)} /></div>
                                    <div className="flex items-center gap-1 ml-auto"><span className="text-[9px] text-gray-500 uppercase">Uses</span><input className="w-16 bg-transparent text-xs text-right border-b border-gray-700 focus:border-yellow-500 outline-none text-yellow-200" placeholder="e.g. 1/Scene" value={f.maxUses || ''} onChange={e => updateFeature(f.id, 'maxUses', e.target.value)} /></div>
                                </div>
                                <button onClick={() => deleteFeature(f.id)} className="absolute top-1 right-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                            </div>
                        ))}
                        {(data.features || []).length === 0 && <div className="text-xs text-gray-600 italic text-center p-2">No features added.</div>}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 flex-shrink-0">
                <button onClick={close} className="px-4 py-2 rounded border border-gray-600 text-gray-400 hover:text-white">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded bg-red-700 hover:bg-red-600 text-white font-bold flex items-center gap-2"><Save size={16}/> Save Adversary</button>
            </div>
        </div>
    );
};

const BestiaryWindowContent = ({ library, setLibrary, openWindow }) => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [tierFilter, setTierFilter] = useState('All');
    const [creatureFilter, setCreatureFilter] = useState('All');
    const [biomeFilter, setBiomeFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('none');

    const filtered = library.filter(adv => {
        const matchesSearch = adv.name.toLowerCase().includes(search.toLowerCase()) || adv.tags.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'All' || adv.type === typeFilter;
        const matchesTier = tierFilter === 'All' || adv.tier === tierFilter;
        const matchesCreature = creatureFilter === 'All' || adv.creatureType === creatureFilter;
        const matchesBiome = biomeFilter === 'All' || adv.biome === biomeFilter;
        return matchesSearch && matchesType && matchesTier && matchesCreature && matchesBiome;
    }).sort((a, b) => {
        if (sortOrder === 'none') return 0;
        const diffA = parseInt(a.difficulty) || 0;
        const diffB = parseInt(b.difficulty) || 0;
        return sortOrder === 'asc' ? diffA - diffB : diffB - diffA;
    });

    const handleSaveAdversary = (savedAdv) => {
        setLibrary(prev => {
            const idx = prev.findIndex(a => a.id === savedAdv.id);
            if (idx >= 0) {
                const newLib = [...prev];
                newLib[idx] = savedAdv;
                return newLib;
            } else {
                return [...prev, savedAdv];
            }
        });
    };

    const toggleSort = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col gap-2 mb-4 bg-gray-900/50 p-2 rounded border border-gray-800 flex-shrink-0">
                <div className="relative w-full">
                    <Search size={14} className="absolute top-2.5 left-2 text-gray-500"/>
                    <input className="w-full bg-gray-800 border border-gray-700 rounded pl-8 py-1.5 text-sm text-white focus:border-indigo-500 outline-none" placeholder="Search adversaries..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select className="bg-gray-800 border border-gray-700 rounded text-xs px-2 py-1 text-gray-300" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option value="All">All Types</option>{ADVERSARY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                    <select className="bg-gray-800 border border-gray-700 rounded text-xs px-2 py-1 text-gray-300" value={tierFilter} onChange={e => setTierFilter(e.target.value)}><option value="All">All Tiers</option>{[0,1,2,3,4].map(t => <option key={t} value={String(t)}>Tier {t}</option>)}</select>
                    <select className="bg-gray-800 border border-gray-700 rounded text-xs px-2 py-1 text-gray-300" value={creatureFilter} onChange={e => setCreatureFilter(e.target.value)}><option value="All">All Creatures</option>{CREATURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                    <select className="bg-gray-800 border border-gray-700 rounded text-xs px-2 py-1 text-gray-300" value={biomeFilter} onChange={e => setBiomeFilter(e.target.value)}><option value="All">All Biomes</option>{BIOMES.map(b => <option key={b} value={b}>{b}</option>)}</select>
                    <button onClick={toggleSort} className="bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded flex items-center gap-1 text-xs" title="Sort Difficulty">{sortOrder === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>} Diff</button>
                    <button onClick={() => openWindow('ADV_BUILDER', { onSave: handleSaveAdversary }, 'New Adversary')} className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 text-xs font-bold ml-auto"><Plus size={14}/> Create</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(adv => (
                    <div key={adv.id} className="bg-gray-800 border border-gray-700 rounded p-3 hover:border-indigo-500 transition-colors cursor-pointer group relative">
                        <div className="flex justify-between items-start mb-1">
                            <div><h4 className="font-bold text-white text-sm">{adv.name}</h4><div className="flex gap-1 mt-1"><span className="text-[9px] text-gray-400 bg-gray-900 px-1 py-0.5 rounded border border-gray-700">{adv.type}</span><span className="text-[9px] text-gray-400 bg-gray-900 px-1 py-0.5 rounded border border-gray-700">Tier {adv.tier}</span></div></div>
                            <div className="text-right"><div className="text-[9px] text-gray-500 uppercase font-bold">Diff</div><div className="text-sm font-bold text-indigo-400">{adv.difficulty}</div></div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                            {adv.creatureType && <span className="text-[9px] text-blue-300 bg-blue-900/30 px-1 rounded">{adv.creatureType}</span>}
                            {adv.biome && <span className="text-[9px] text-green-300 bg-green-900/30 px-1 rounded">{adv.biome}</span>}
                        </div>
                        <p className="text-xs text-gray-500 italic truncate mb-2">{adv.tags}</p>
                        <div className="flex flex-col gap-1 mb-2">
                            {(adv.attacks || []).slice(0, 2).map(atk => (<div key={atk.id} className="flex justify-between text-xs text-gray-300 bg-gray-900/50 p-1 rounded"><span className="font-bold truncate w-20">{atk.name}</span><span className="text-red-400">{atk.mod}</span><span className="text-gray-400">{atk.damage}</span></div>))}
                            {(adv.attacks || []).length > 2 && <span className="text-[9px] text-gray-500">+{adv.attacks.length - 2} more...</span>}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openWindow('ADV_BUILDER', { onSave: handleSaveAdversary, initialData: adv }, `Edit ${adv.name}`); }} className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded"><Pencil size={12}/></button>
                            <button onClick={(e) => { e.stopPropagation(); if(window.confirm("Delete this adversary?")) setLibrary(library.filter(l => l.id !== adv.id)); }} className="text-red-500 hover:bg-red-900/20 p-1 rounded"><Trash2 size={12}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HexDetailWindowContent = ({ hexes, hexIndex, updateHex, tables, openWindow, savedEncounters }) => {
    const hex = hexes[hexIndex];
    const [activeTab, setActiveTab] = useState('details');
    const [selectedEncounterId, setSelectedEncounterId] = useState('');
    const [quickEncounterName, setQuickEncounterName] = useState('');
    const [quickEncounterNotes, setQuickEncounterNotes] = useState('');

    const addEncounterToHex = (encounter) => {
        const updated = [
            ...(hex.encounters || []),
            {
                instanceId: Date.now(),
                source: encounter.source,
                id: encounter.id,
                name: encounter.name,
                difficulty: encounter.difficulty,
                notes: encounter.notes || ''
            }
        ];
        updateHex(hexIndex, 'encounters', updated);
    };

    const removeEncounterFromHex = (instanceId) => {
        const updated = (hex.encounters || []).filter(encounter => encounter.instanceId !== instanceId);
        updateHex(hexIndex, 'encounters', updated);
    };

    if (!hex) return <div>Hex Not Found</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                <h2 className="text-xl font-bold text-green-400">Hex {hex.q}, {hex.r}</h2>
                <select className="bg-gray-800 border border-gray-700 rounded p-1 text-xs text-white" value={hex.status} onChange={(e) => updateHex(hexIndex, 'status', e.target.value)}>
                    <option value="unexplored">Unexplored</option>
                    <option value="explored">Explored</option>
                    <option value="unsearched">Unsearched</option>
                </select>
            </div>
            <div className="flex gap-2 mb-4">
                {['details', 'encounters', 'npcs'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-1 text-xs font-bold uppercase rounded ${activeTab === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                        {t === 'details' ? 'Overview' : t === 'encounters' ? 'Encounters' : 'NPCs'}
                    </button>
                ))}
            </div>
            {activeTab === 'details' && (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-gray-500">Region Name</label>
                        <input className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-green-500 outline-none" value={hex.title} onChange={(e) => updateHex(hexIndex, 'title', e.target.value)} placeholder="Region Name..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs uppercase font-bold text-gray-500">Terrain</label>
                            <select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-green-500 outline-none" value={hex.terrain} onChange={(e) => updateHex(hexIndex, 'terrain', e.target.value)}>
                                <option value="plains">Plains</option>
                                <option value="forest">Forest</option>
                                <option value="mountain">Mountain</option>
                                <option value="water">Water</option>
                                <option value="swamp">Swamp</option>
                                <option value="desert">Desert</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs uppercase font-bold text-gray-500">Icon</label>
                            <select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-green-500 outline-none" value={hex.icon} onChange={(e) => updateHex(hexIndex, 'icon', e.target.value)}>
                                <option value="none">None</option>
                                <option value="town">Town</option>
                                <option value="dungeon">Dungeon</option>
                                <option value="ruins">Ruins</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1 flex-1">
                        <label className="text-xs uppercase font-bold text-gray-500">Notes</label>
                        <textarea className="w-full h-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-300 resize-none focus:outline-none focus:border-green-500" value={hex.notes} onChange={(e) => updateHex(hexIndex, 'notes', e.target.value)} placeholder="Hex notes..." />
                    </div>
                </div>
            )}
            {activeTab === 'encounters' && (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="bg-gray-900/60 border border-gray-700 rounded p-3 space-y-3">
                        <div className="text-xs uppercase tracking-wide text-gray-400 font-bold">Add from Library</div>
                        <div className="flex gap-2">
                            <select
                                className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none"
                                value={selectedEncounterId}
                                onChange={(e) => setSelectedEncounterId(e.target.value)}
                            >
                                <option value="">Select an encounter...</option>
                                {savedEncounters.map(encounter => (
                                    <option key={encounter.id} value={encounter.id}>{encounter.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => {
                                    const encounter = savedEncounters.find(item => item.id === Number(selectedEncounterId));
                                    if (encounter) {
                                        addEncounterToHex({ ...encounter, source: 'library' });
                                        setSelectedEncounterId('');
                                    }
                                }}
                                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 rounded"
                            >
                                Add
                            </button>
                        </div>
                        {savedEncounters.length === 0 && (
                            <div className="text-[11px] text-gray-500 italic">No encounters saved yet. Use the Encounter Builder to create some.</div>
                        )}
                    </div>
                    <div className="bg-gray-900/60 border border-gray-700 rounded p-3 space-y-3">
                        <div className="text-xs uppercase tracking-wide text-gray-400 font-bold">Quick Encounter</div>
                        <input
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none"
                            placeholder="Encounter name..."
                            value={quickEncounterName}
                            onChange={(e) => setQuickEncounterName(e.target.value)}
                        />
                        <textarea
                            className="w-full h-20 bg-gray-900 border border-gray-700 rounded p-2 text-xs text-gray-300 resize-none focus:outline-none focus:border-red-500"
                            placeholder="Notes, foes, twists..."
                            value={quickEncounterNotes}
                            onChange={(e) => setQuickEncounterNotes(e.target.value)}
                        />
                        <button
                            onClick={() => {
                                if (!quickEncounterName.trim()) return;
                                addEncounterToHex({
                                    source: 'custom',
                                    id: null,
                                    name: quickEncounterName.trim(),
                                    difficulty: 'Custom',
                                    notes: quickEncounterNotes.trim()
                                });
                                setQuickEncounterName('');
                                setQuickEncounterNotes('');
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded"
                        >
                            Add to Hex
                        </button>
                    </div>
                    <div className="space-y-2">
                        {(hex.encounters || []).length === 0 && (
                            <div className="text-center text-gray-600 text-xs italic mt-4">No encounters assigned to this hex yet.</div>
                        )}
                        {(hex.encounters || []).map(encounter => (
                            <div key={encounter.instanceId} className="bg-gray-800 border border-gray-700 p-2 rounded space-y-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-sm text-gray-200">{encounter.name}</div>
                                        <div className="text-[10px] text-red-400 uppercase font-bold">{encounter.difficulty}</div>
                                    </div>
                                    <button onClick={() => removeEncounterFromHex(encounter.instanceId)} className="text-gray-400 hover:text-red-400">
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                                {encounter.notes && (
                                    <div className="text-xs text-gray-400 whitespace-pre-wrap">{encounter.notes}</div>
                                )}
                                <div className="text-[10px] text-gray-600 uppercase">Source: {encounter.source}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeTab === 'npcs' && (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="space-y-2">
                        {(hex.npcs || []).map(npc => (
                            <div key={npc.id} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded cursor-pointer group transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-bold text-xs">{npc.name.charAt(0)}</div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-200">{npc.name}</div>
                                            <div className="text-[10px] text-gray-500">{npc.race} • {npc.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(hex.npcs || []).length === 0 && <div className="text-center text-gray-600 text-xs italic mt-4">No NPCs in this hex.</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

const TableManagerWindowContent = ({ tables, setTables, customTables, setCustomTables }) => {
    const [activeCategory, setActiveCategory] = useState('weather');
    const [view, setView] = useState('list');
    const [editItem, setEditItem] = useState(null);
    const [newItem, setNewItem] = useState({ text: '', tags: '', rarity: 'common', tone: 'neutral' });
    const [newTableName, setNewTableName] = useState('');

    const allCategories = [
        ...TABLE_CATEGORIES,
        ...customTables.map(t => ({ id: t.id, label: t.name, icon: List, custom: true }))
    ];

    const currentItems = customTables.find(t => t.id === activeCategory)?.items || tables[activeCategory] || [];

    const addItem = () => {
        if (!newItem.text.trim()) return;
        const item = { id: Date.now(), ...newItem };
        const customTable = customTables.find(t => t.id === activeCategory);
        if (customTable) {
            setCustomTables(prev => prev.map(t => t.id === activeCategory ? { ...t, items: [...t.items, item] } : t));
        } else {
            setTables(prev => ({ ...prev, [activeCategory]: [...(prev[activeCategory] || []), item] }));
        }
        setNewItem({ text: '', tags: '', rarity: 'common', tone: 'neutral' });
    };

    const deleteItem = (itemId) => {
        const customTable = customTables.find(t => t.id === activeCategory);
        if (customTable) {
            setCustomTables(prev => prev.map(t => t.id === activeCategory ? { ...t, items: t.items.filter(i => i.id !== itemId) } : t));
        } else {
            setTables(prev => ({ ...prev, [activeCategory]: prev[activeCategory].filter(i => i.id !== itemId) }));
        }
    };

    const updateItem = (itemId, updates) => {
        const customTable = customTables.find(t => t.id === activeCategory);
        if (customTable) {
            setCustomTables(prev => prev.map(t => t.id === activeCategory ? { ...t, items: t.items.map(i => i.id === itemId ? { ...i, ...updates } : i) } : t));
        } else {
            setTables(prev => ({ ...prev, [activeCategory]: prev[activeCategory].map(i => i.id === itemId ? { ...i, ...updates } : i) }));
        }
        setEditItem(null);
    };

    const createTable = () => {
        if (!newTableName.trim()) return;
        const newTable = { id: `custom_${Date.now()}`, name: newTableName.trim(), items: [] };
        setCustomTables(prev => [...prev, newTable]);
        setActiveCategory(newTable.id);
        setNewTableName('');
    };

    const deleteTable = (tableId) => {
        if (!window.confirm("Delete this custom table?")) return;
        setCustomTables(prev => prev.filter(t => t.id !== tableId));
        setActiveCategory('weather');
    };

    const rollOnTable = () => {
        if (currentItems.length === 0) return null;
        const weights = { common: 60, unlikely: 25, rare: 12, wondrous: 3 };
        const weighted = currentItems.flatMap(item => Array(weights[item.rarity] || 10).fill(item));
        return weighted[Math.floor(Math.random() * weighted.length)];
    };

    const [lastRoll, setLastRoll] = useState(null);

    return (
        <div className="h-full flex gap-4">
            <div className="w-48 flex flex-col gap-2 border-r border-gray-800 pr-4">
                <div className="text-xs uppercase text-gray-500 font-bold mb-2">Categories</div>
                {allCategories.map(cat => {
                    const Icon = cat.icon;
                    return (
                        <div key={cat.id} className="flex items-center gap-1">
                            <button
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-sm ${activeCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                            >
                                <Icon size={14}/> {cat.label}
                            </button>
                            {cat.custom && (
                                <button onClick={() => deleteTable(cat.id)} className="text-gray-600 hover:text-red-400 p-1"><Trash2 size={12}/></button>
                            )}
                        </div>
                    );
                })}
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <input className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white mb-2" placeholder="New table name..." value={newTableName} onChange={e => setNewTableName(e.target.value)}/>
                    <button onClick={createTable} className="w-full bg-green-700 hover:bg-green-600 text-white text-xs py-1 rounded flex items-center justify-center gap-1"><Plus size={12}/> Create Table</button>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold capitalize">{allCategories.find(c => c.id === activeCategory)?.label || activeCategory}</h3>
                    <div className="flex gap-2">
                        <button onClick={() => { const r = rollOnTable(); if(r) setLastRoll(r); }} className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"><Dices size={14}/> Roll</button>
                        <button onClick={() => setView(view === 'list' ? 'editor' : 'list')} className={`px-3 py-1 rounded text-xs ${view === 'editor' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{view === 'list' ? 'Editor' : 'List'}</button>
                    </div>
                </div>

                {lastRoll && (
                    <div className="bg-purple-900/30 border border-purple-700 rounded p-3 mb-4">
                        <div className="text-xs text-purple-400 uppercase font-bold mb-1">Rolled Result</div>
                        <div className="text-white font-bold">{lastRoll.text}</div>
                        <div className="flex gap-2 mt-1">
                            <span className={`text-[10px] px-1 rounded ${lastRoll.rarity === 'common' ? 'bg-gray-700' : lastRoll.rarity === 'unlikely' ? 'bg-green-900 text-green-300' : lastRoll.rarity === 'rare' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>{lastRoll.rarity}</span>
                            {lastRoll.tags && <span className="text-[10px] text-gray-500">{lastRoll.tags}</span>}
                        </div>
                    </div>
                )}

                {view === 'editor' && (
                    <div className="bg-gray-900/60 border border-gray-700 rounded p-3 mb-4">
                        <div className="text-xs uppercase text-gray-500 font-bold mb-2">Add Entry</div>
                        <div className="grid grid-cols-1 gap-2">
                            <textarea className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white resize-none h-16" placeholder="Entry text..." value={newItem.text} onChange={e => setNewItem({...newItem, text: e.target.value})}/>
                            <div className="flex gap-2">
                                <input className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white" placeholder="Tags (comma separated)" value={newItem.tags} onChange={e => setNewItem({...newItem, tags: e.target.value})}/>
                                <select className="bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white" value={newItem.rarity} onChange={e => setNewItem({...newItem, rarity: e.target.value})}>
                                    <option value="common">Common</option>
                                    <option value="unlikely">Unlikely</option>
                                    <option value="rare">Rare</option>
                                    <option value="wondrous">Wondrous</option>
                                </select>
                                <select className="bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white" value={newItem.tone} onChange={e => setNewItem({...newItem, tone: e.target.value})}>
                                    <option value="positive">Positive</option>
                                    <option value="neutral">Neutral</option>
                                    <option value="negative">Negative</option>
                                </select>
                            </div>
                            <button onClick={addItem} className="bg-green-700 hover:bg-green-600 text-white text-xs py-2 rounded">Add Entry</button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-2">
                    {currentItems.map(item => (
                        <div key={item.id} className="bg-gray-800 border border-gray-700 rounded p-2 group hover:border-gray-600">
                            {editItem === item.id ? (
                                <div className="space-y-2">
                                    <textarea className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white resize-none" defaultValue={item.text} id={`edit-${item.id}`}/>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateItem(item.id, { text: document.getElementById(`edit-${item.id}`).value })} className="bg-green-700 text-white text-xs px-2 py-1 rounded">Save</button>
                                        <button onClick={() => setEditItem(null)} className="text-gray-400 text-xs">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="text-sm text-white">{item.text}</div>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`text-[10px] px-1 rounded ${item.rarity === 'common' ? 'bg-gray-700' : item.rarity === 'unlikely' ? 'bg-green-900 text-green-300' : item.rarity === 'rare' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>{item.rarity}</span>
                                            <span className={`text-[10px] px-1 rounded ${item.tone === 'positive' ? 'bg-green-900/50 text-green-400' : item.tone === 'negative' ? 'bg-red-900/50 text-red-400' : 'bg-gray-700 text-gray-400'}`}>{item.tone}</span>
                                            {item.tags && <span className="text-[10px] text-gray-500">{item.tags}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                        <button onClick={() => setEditItem(item.id)} className="text-gray-400 hover:text-white p-1"><Pencil size={12}/></button>
                                        <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-400 p-1"><Trash2 size={12}/></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {currentItems.length === 0 && <div className="text-center text-gray-600 text-sm italic mt-8">No entries in this table yet.</div>}
                </div>
            </div>
        </div>
    );
};

const NPCManagerWindowContent = ({ npcCatalog, setNpcCatalog, npcTraits, setNpcTraits, openWindow }) => {
    const [view, setView] = useState('catalog');
    const [search, setSearch] = useState('');
    const [newTrait, setNewTrait] = useState({ text: '', category: 'Appearance', tags: '' });
    const [filterCategory, setFilterCategory] = useState('All');

    const filteredNpcs = npcCatalog.filter(npc =>
        npc.name.toLowerCase().includes(search.toLowerCase()) ||
        (npc.role || '').toLowerCase().includes(search.toLowerCase())
    );

    const filteredTraits = npcTraits.filter(t =>
        (filterCategory === 'All' || t.category === filterCategory) &&
        (t.text.toLowerCase().includes(search.toLowerCase()) || (t.tags || '').toLowerCase().includes(search.toLowerCase()))
    );

    const addTrait = () => {
        if (!newTrait.text.trim()) return;
        setNpcTraits(prev => [...prev, { id: Date.now(), ...newTrait }]);
        setNewTrait({ text: '', category: 'Appearance', tags: '' });
    };

    const deleteTrait = (id) => {
        setNpcTraits(prev => prev.filter(t => t.id !== id));
    };

    const deleteNpc = (id) => {
        if (window.confirm("Delete this NPC?")) {
            setNpcCatalog(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex gap-2 mb-4">
                <button onClick={() => setView('catalog')} className={`flex-1 py-2 text-xs font-bold uppercase rounded ${view === 'catalog' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>NPC Catalog</button>
                <button onClick={() => setView('traits')} className={`flex-1 py-2 text-xs font-bold uppercase rounded ${view === 'traits' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Trait Library</button>
            </div>

            {view === 'catalog' && (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute top-2.5 left-2 text-gray-500"/>
                            <input className="w-full bg-gray-800 border border-gray-700 rounded pl-8 py-1.5 text-sm text-white" placeholder="Search NPCs..." value={search} onChange={e => setSearch(e.target.value)}/>
                        </div>
                        <button onClick={() => openWindow('NPC_BUILDER', { onSave: (npc) => setNpcCatalog(prev => [...prev, npc]) }, 'Create NPC')} className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"><Plus size={14}/> New NPC</button>
                    </div>
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredNpcs.map(npc => (
                            <div key={npc.id} className="bg-gray-800 border border-gray-700 rounded p-3 hover:border-indigo-500 transition-colors group relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold">{npc.name.charAt(0)}</div>
                                    <div>
                                        <div className="font-bold text-white">{npc.name}</div>
                                        <div className="text-[10px] text-gray-400">{npc.race} • {npc.role}</div>
                                    </div>
                                </div>
                                {npc.traits && npc.traits.length > 0 && (
                                    <div className="text-xs text-gray-500 italic truncate">{npc.traits[0]}</div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
                                    <button onClick={() => openWindow('NPC_BUILDER', { onSave: (updated) => setNpcCatalog(prev => prev.map(n => n.id === updated.id ? updated : n)), initialData: npc }, `Edit ${npc.name}`)} className="text-gray-400 hover:text-white p-1"><Pencil size={12}/></button>
                                    <button onClick={() => deleteNpc(npc.id)} className="text-gray-400 hover:text-red-400 p-1"><Trash2 size={12}/></button>
                                </div>
                            </div>
                        ))}
                        {filteredNpcs.length === 0 && <div className="col-span-full text-center text-gray-600 text-sm italic mt-8">No NPCs found. Create one to get started!</div>}
                    </div>
                </div>
            )}

            {view === 'traits' && (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="bg-gray-900/60 border border-gray-700 rounded p-3 mb-4">
                        <div className="text-xs uppercase text-gray-500 font-bold mb-2">Add New Trait</div>
                        <div className="grid grid-cols-1 gap-2">
                            <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" placeholder="Trait description..." value={newTrait.text} onChange={e => setNewTrait({...newTrait, text: e.target.value})}/>
                            <div className="flex gap-2">
                                <select className="bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white" value={newTrait.category} onChange={e => setNewTrait({...newTrait, category: e.target.value})}>
                                    {NPC_TRAIT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <input className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white" placeholder="Tags (comma separated)" value={newTrait.tags} onChange={e => setNewTrait({...newTrait, tags: e.target.value})}/>
                                <button onClick={addTrait} className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 rounded">Add</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <input className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" placeholder="Search traits..." value={search} onChange={e => setSearch(e.target.value)}/>
                        <select className="bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            <option value="All">All Categories</option>
                            {NPC_TRAIT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {filteredTraits.map(trait => (
                            <div key={trait.id} className="bg-gray-800 border border-gray-700 rounded p-2 group hover:border-gray-600 flex justify-between items-start">
                                <div>
                                    <div className="text-sm text-white">{trait.text}</div>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] bg-indigo-900/50 text-indigo-300 px-1 rounded">{trait.category}</span>
                                        {trait.tags && <span className="text-[10px] text-gray-500">{trait.tags}</span>}
                                    </div>
                                </div>
                                <button onClick={() => deleteTrait(trait.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 p-1"><Trash2 size={12}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const NPCBuilderWindow = ({ onSave, initialData, npcTraits, close }) => {
    const [data, setData] = useState(initialData || {
        id: Date.now(),
        name: '',
        race: 'Human',
        role: '',
        personality: '',
        goal: '',
        secret: '',
        traits: [],
        notes: ''
    });

    const [selectedCategory, setSelectedCategory] = useState('Appearance');

    const getRandomTrait = (category) => {
        const categoryTraits = npcTraits.filter(t => t.category === category);
        if (categoryTraits.length === 0) return null;
        return categoryTraits[Math.floor(Math.random() * categoryTraits.length)];
    };

    const addRandomTrait = () => {
        const trait = getRandomTrait(selectedCategory);
        if (trait) {
            setData(prev => ({ ...prev, traits: [...prev.traits, trait.text] }));
        }
    };

    const generateFullNpc = () => {
        const newTraits = [];
        ['Appearance', 'Mannerism', 'Voice', 'Quirk'].forEach(cat => {
            const t = getRandomTrait(cat);
            if (t) newTraits.push(t.text);
        });
        const goalTrait = getRandomTrait('Goal');
        const secretTrait = getRandomTrait('Secret');
        const nameTrait = getRandomTrait('Name');

        setData(prev => ({
            ...prev,
            traits: newTraits,
            goal: goalTrait?.text || prev.goal,
            secret: secretTrait?.text || prev.secret,
            name: nameTrait?.text || prev.name
        }));
    };

    const removeTrait = (idx) => {
        setData(prev => ({ ...prev, traits: prev.traits.filter((_, i) => i !== idx) }));
    };

    const handleSave = () => {
        onSave(data);
        close();
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex gap-4 flex-1 overflow-y-auto">
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold">Name</label>
                            <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="NPC Name"/>
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold">Race/Ancestry</label>
                            <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" value={data.race} onChange={e => setData({...data, race: e.target.value})} placeholder="Human, Elf, etc."/>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-gray-500 font-bold">Role / Occupation</label>
                        <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" value={data.role} onChange={e => setData({...data, role: e.target.value})} placeholder="Merchant, Guard, etc."/>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-gray-500 font-bold">Personality</label>
                        <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" value={data.personality} onChange={e => setData({...data, personality: e.target.value})} placeholder="Gruff, kind, suspicious..."/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold">Goal</label>
                            <textarea className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white resize-none h-20" value={data.goal} onChange={e => setData({...data, goal: e.target.value})} placeholder="What do they want?"/>
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold">Secret</label>
                            <textarea className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white resize-none h-20" value={data.secret} onChange={e => setData({...data, secret: e.target.value})} placeholder="What are they hiding?"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-gray-500 font-bold">Notes</label>
                        <textarea className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white resize-none h-24" value={data.notes} onChange={e => setData({...data, notes: e.target.value})} placeholder="Additional notes..."/>
                    </div>
                </div>

                <div className="w-64 bg-gray-900/50 border border-gray-800 rounded p-3">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs uppercase text-gray-500 font-bold">Traits</span>
                        <button onClick={generateFullNpc} className="bg-purple-700 hover:bg-purple-600 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1"><Wand2 size={10}/> Generate</button>
                    </div>
                    <div className="flex gap-1 mb-3">
                        <select className="flex-1 bg-gray-800 border border-gray-700 rounded text-xs p-1 text-white" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                            {NPC_TRAIT_CATEGORIES.filter(c => !['Name', 'Goal', 'Secret', 'Backstory'].includes(c)).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <button onClick={addRandomTrait} className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs px-2 rounded"><Shuffle size={12}/></button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {data.traits.map((trait, idx) => (
                            <div key={idx} className="bg-gray-800 border border-gray-700 rounded p-2 text-xs text-gray-300 flex justify-between items-start group">
                                <span>{trait}</span>
                                <button onClick={() => removeTrait(idx)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                            </div>
                        ))}
                        {data.traits.length === 0 && <div className="text-xs text-gray-600 italic text-center">No traits added</div>}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 flex-shrink-0">
                <button onClick={close} className="px-4 py-2 rounded border border-gray-600 text-gray-400 hover:text-white">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white font-bold flex items-center gap-2"><Save size={16}/> Save NPC</button>
            </div>
        </div>
    );
};

const CombatWindowContent = ({ openWindow, party, bestiary, fear, setFear }) => {
    const [view, setView] = useState('setup');
    const [combatants, setCombatants] = useState([]);
    const [round, setRound] = useState(1);
    const [currentTurn, setCurrentTurn] = useState(0);

    const addPartyToCombat = () => {
        const partyMembers = party.map(pc => ({
            id: `pc_${pc.id}_${Date.now()}`,
            name: pc.name,
            type: 'pc',
            hp: pc.hp,
            maxHp: pc.maxHp,
            stress: pc.stress,
            maxStress: pc.maxStress,
            initiative: 0,
            conditions: [],
            isPlayer: true
        }));
        setCombatants(prev => [...prev, ...partyMembers]);
    };

    const addEnemies = (enemies) => {
        const newEnemies = enemies.map((enemy, idx) => ({
            id: `enemy_${enemy.id}_${Date.now()}_${idx}`,
            name: enemies.filter(e => e.name === enemy.name).length > 1 ? `${enemy.name} ${idx + 1}` : enemy.name,
            type: 'enemy',
            hp: parseInt(enemy.hp) || 1,
            maxHp: parseInt(enemy.hp) || 1,
            stress: parseInt(enemy.stress) || 0,
            maxStress: parseInt(enemy.stress) || 0,
            initiative: 0,
            conditions: [],
            isPlayer: false,
            data: enemy
        }));
        setCombatants(prev => [...prev, ...newEnemies]);
    };

    const updateCombatant = (id, field, value) => {
        setCombatants(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const removeCombatant = (id) => {
        setCombatants(prev => prev.filter(c => c.id !== id));
    };

    const sortByInitiative = () => {
        setCombatants(prev => [...prev].sort((a, b) => b.initiative - a.initiative));
    };

    const rollInitiative = () => {
        setCombatants(prev => prev.map(c => ({
            ...c,
            initiative: Math.floor(Math.random() * 20) + 1 + (c.isPlayer ? 0 : -1)
        })).sort((a, b) => b.initiative - a.initiative));
    };

    const nextTurn = () => {
        if (combatants.length === 0) return;
        const nextIdx = (currentTurn + 1) % combatants.length;
        if (nextIdx === 0) setRound(r => r + 1);
        setCurrentTurn(nextIdx);
    };

    const prevTurn = () => {
        if (combatants.length === 0) return;
        const prevIdx = currentTurn === 0 ? combatants.length - 1 : currentTurn - 1;
        if (currentTurn === 0 && round > 1) setRound(r => r - 1);
        setCurrentTurn(prevIdx);
    };

    const startCombat = () => {
        if (combatants.length === 0) return;
        rollInitiative();
        setView('tracker');
        setRound(1);
        setCurrentTurn(0);
    };

    const endCombat = () => {
        if (window.confirm("End combat? This will clear all combatants.")) {
            setCombatants([]);
            setView('setup');
            setRound(1);
            setCurrentTurn(0);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex gap-2 mb-4">
                <button onClick={() => setView('setup')} className={`flex-1 py-2 text-xs font-bold uppercase rounded ${view === 'setup' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Setup</button>
                <button onClick={() => setView('tracker')} className={`flex-1 py-2 text-xs font-bold uppercase rounded ${view === 'tracker' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Tracker</button>
            </div>

            {view === 'setup' && (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="flex gap-2">
                        <button onClick={addPartyToCombat} className="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2"><Users size={16}/> Add Party</button>
                        <button onClick={() => openWindow('BESTIARY_PICKER', { onPick: addEnemies }, 'Add Enemies')} className="flex-1 bg-red-700 hover:bg-red-600 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2"><Skull size={16}/> Add Enemies</button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {combatants.map(c => (
                            <div key={c.id} className={`flex items-center gap-3 p-2 rounded border ${c.isPlayer ? 'bg-blue-900/20 border-blue-800' : 'bg-red-900/20 border-red-800'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${c.isPlayer ? 'bg-blue-700' : 'bg-red-700'}`}>{c.name.charAt(0)}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{c.name}</div>
                                    <div className="text-[10px] text-gray-400">{c.isPlayer ? 'Player' : c.data?.type || 'Enemy'}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Init:</span>
                                    <input type="number" className="w-12 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-sm text-center" value={c.initiative} onChange={e => updateCombatant(c.id, 'initiative', parseInt(e.target.value) || 0)}/>
                                </div>
                                <button onClick={() => removeCombatant(c.id)} className="text-gray-500 hover:text-red-400"><X size={16}/></button>
                            </div>
                        ))}
                        {combatants.length === 0 && <div className="text-center text-gray-600 text-sm italic mt-8">No combatants added. Add party members or enemies to begin.</div>}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={rollInitiative} disabled={combatants.length === 0} className="flex-1 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-600 text-white py-2 rounded text-sm font-bold">Roll Initiative</button>
                        <button onClick={startCombat} disabled={combatants.length === 0} className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-600 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2"><Play size={16}/> Start Combat</button>
                    </div>
                </div>
            )}

            {view === 'tracker' && (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-800">
                        <div className="flex items-center gap-4">
                            <div><span className="text-xs text-gray-500 uppercase">Round</span><div className="text-2xl font-bold text-white">{round}</div></div>
                            <div className="flex items-center gap-2 bg-purple-900/30 px-3 py-1 rounded border border-purple-800">
                                <Skull size={16} className="text-purple-400"/>
                                <span className="text-xs text-gray-400">Fear:</span>
                                <button onClick={() => setFear(Math.max(0, fear - 1))} className="text-gray-500 hover:text-white">-</button>
                                <span className="text-lg font-bold text-purple-400">{fear}</span>
                                <button onClick={() => setFear(fear + 1)} className="text-gray-500 hover:text-white">+</button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={prevTurn} className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded"><ArrowLeft size={16}/></button>
                            <button onClick={nextTurn} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2"><SkipForward size={16}/> Next</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {combatants.map((c, idx) => (
                            <div key={c.id} className={`p-3 rounded border transition-all ${idx === currentTurn ? 'combat-row-active border-indigo-500 bg-indigo-900/20' : c.isPlayer ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/50 border-gray-700'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="text-lg font-bold text-gray-500 w-6">{c.initiative}</div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${c.isPlayer ? 'bg-blue-700' : 'bg-red-700'} ${c.hp <= 0 ? 'opacity-50' : ''}`}>{c.name.charAt(0)}</div>
                                    <div className="flex-1">
                                        <div className={`font-bold ${c.hp <= 0 ? 'line-through text-gray-500' : ''}`}>{c.name}</div>
                                        <div className="flex gap-4 mt-1">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-red-400">HP</span>
                                                <button onClick={() => updateCombatant(c.id, 'hp', Math.max(0, c.hp - 1))} className="text-gray-500 hover:text-white text-xs">-</button>
                                                <span className="text-sm font-bold">{c.hp}/{c.maxHp}</span>
                                                <button onClick={() => updateCombatant(c.id, 'hp', Math.min(c.maxHp, c.hp + 1))} className="text-gray-500 hover:text-white text-xs">+</button>
                                            </div>
                                            {c.maxStress > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-purple-400">Stress</span>
                                                    <button onClick={() => updateCombatant(c.id, 'stress', Math.max(0, c.stress - 1))} className="text-gray-500 hover:text-white text-xs">-</button>
                                                    <span className="text-sm font-bold">{c.stress}/{c.maxStress}</span>
                                                    <button onClick={() => updateCombatant(c.id, 'stress', Math.min(c.maxStress, c.stress + 1))} className="text-gray-500 hover:text-white text-xs">+</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {!c.isPlayer && c.data && (
                                        <div className="text-right text-xs text-gray-500">
                                            <div>Diff: {c.data.difficulty}</div>
                                            <div>Atk: {c.data.attack}</div>
                                        </div>
                                    )}
                                    <button onClick={() => removeCombatant(c.id)} className="text-gray-600 hover:text-red-400 p-1"><X size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => openWindow('BESTIARY_PICKER', { onPick: addEnemies }, 'Add Enemies')} className="bg-red-800 hover:bg-red-700 text-white px-3 py-2 rounded text-xs flex items-center gap-1"><Plus size={14}/> Add Enemies</button>
                        <button onClick={endCombat} className="ml-auto bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">End Combat</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SceneWindowContent = ({ node, nodes, setNodes, openWindow, savedEncounters, tables }) => {
    const [activeTab, setActiveTab] = useState('details');
    const nodeIndex = nodes.findIndex(n => n.id === node.id);

    const updateNode = (field, value) => {
        setNodes(prev => prev.map(n => n.id === node.id ? { ...n, [field]: value } : n));
    };

    const deleteNode = () => {
        if (window.confirm("Delete this scene?")) {
            setNodes(prev => prev.filter(n => n.id !== node.id));
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                <input
                    className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-gray-600 focus:border-indigo-500 outline-none"
                    value={node.title}
                    onChange={e => updateNode('title', e.target.value)}
                />
                <button onClick={deleteNode} className="text-gray-500 hover:text-red-400"><Trash2 size={16}/></button>
            </div>

            <div className="flex gap-2 mb-4">
                {['details', 'encounters', 'npcs'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-1 text-xs font-bold uppercase rounded ${activeTab === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {activeTab === 'details' && (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div>
                        <label className="text-xs uppercase font-bold text-gray-500">Description</label>
                        <textarea
                            className="w-full h-32 bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-300 resize-none focus:outline-none focus:border-indigo-500"
                            value={node.desc}
                            onChange={e => updateNode('desc', e.target.value)}
                            placeholder="What happens in this scene..."
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-gray-500">Skill Checks</label>
                        <textarea
                            className="w-full h-20 bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-300 resize-none focus:outline-none focus:border-indigo-500"
                            value={(node.skillChecks || []).join('\n')}
                            onChange={e => updateNode('skillChecks', e.target.value.split('\n'))}
                            placeholder="List skill checks (one per line)..."
                        />
                    </div>
                </div>
            )}

            {activeTab === 'encounters' && (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    <button
                        onClick={() => {
                            const encounter = savedEncounters[Math.floor(Math.random() * savedEncounters.length)];
                            if (encounter) {
                                updateNode('enemies', [...(node.enemies || []), { id: Date.now(), name: encounter.name, difficulty: encounter.difficulty }]);
                            }
                        }}
                        className="bg-red-700 hover:bg-red-600 text-white py-2 rounded text-sm font-bold"
                    >
                        Add Random Encounter
                    </button>
                    <div className="space-y-2">
                        {(node.enemies || []).map(enemy => (
                            <div key={enemy.id} className="bg-gray-800 border border-gray-700 rounded p-2 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-sm">{enemy.name}</div>
                                    <div className="text-[10px] text-red-400">{enemy.difficulty}</div>
                                </div>
                                <button onClick={() => updateNode('enemies', (node.enemies || []).filter(e => e.id !== enemy.id))} className="text-gray-500 hover:text-red-400"><Trash2 size={14}/></button>
                            </div>
                        ))}
                        {(node.enemies || []).length === 0 && <div className="text-center text-gray-600 text-xs italic">No encounters in this scene.</div>}
                    </div>
                </div>
            )}

            {activeTab === 'npcs' && (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="space-y-2">
                        {(node.npcs || []).map(npc => (
                            <div key={npc.id} className="bg-gray-800 border border-gray-700 rounded p-2 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center font-bold text-sm">{npc.name.charAt(0)}</div>
                                    <div>
                                        <div className="font-bold text-sm">{npc.name}</div>
                                        <div className="text-[10px] text-gray-400">{npc.role}</div>
                                    </div>
                                </div>
                                <button onClick={() => updateNode('npcs', (node.npcs || []).filter(n => n.id !== npc.id))} className="text-gray-500 hover:text-red-400"><Trash2 size={14}/></button>
                            </div>
                        ))}
                        {(node.npcs || []).length === 0 && <div className="text-center text-gray-600 text-xs italic">No NPCs in this scene.</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- APP ---

export default function App() {
    const [tables, setTables] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('ollia_tables'));
        if (saved) return saved;
        return {
            weather: [{ id: 1, text: "Heavy Dust Storm", tags: "desert", tone: "negative", rarity: "common" }],
            encounters: [{ id: 2, text: "1d4 Sand Raiders", tags: "desert", tone: "negative", rarity: "common" }],
            items: generateMockItems()
        };
    });
    const [customTables, setCustomTables] = useState(() => JSON.parse(localStorage.getItem('ollia_custom_tables')) || []);

    const [npcCatalog, setNpcCatalog] = useState(() => JSON.parse(localStorage.getItem('ollia_npc_catalog')) || []);
    const [npcTraits, setNpcTraits] = useState(() => JSON.parse(localStorage.getItem('ollia_npc_traits')) || DEFAULT_NPC_TRAITS);

    useEffect(() => { safeSetItem('ollia_custom_tables', JSON.stringify(customTables)); }, [customTables]);
    useEffect(() => { safeSetItem('ollia_tables', JSON.stringify(tables)); }, [tables]);
    useEffect(() => { safeSetItem('ollia_npc_catalog', JSON.stringify(npcCatalog)); }, [npcCatalog]);
    useEffect(() => { safeSetItem('ollia_npc_traits', JSON.stringify(npcTraits)); }, [npcTraits]);

    const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem('ollia_sessions_index')) || []);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [nodes, setNodes] = useState([]);

    const [activeWidgets, setActiveWidgets] = useState(['TIMELINE', 'HEX', 'PARTY', 'RULES', 'MAP']);

    const [hexes, setHexes] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('ollia_hexes_v2'));
            if (Array.isArray(saved) && saved.length > 0 && typeof saved[0].q === 'number') return saved;
        } catch(e) {}

        return Array.from({length: 64}).map((_, i) => {
            const c = i % 8;
            const r_offset = Math.floor(i / 8);
            const q = c;
            const r = r_offset - Math.floor((c - (c&1)) / 2);
            return { q, r, status: 'unexplored', title: '', icon: 'none', terrain: 'plains', notes: '', encounters: [], npcs: [] };
        });
    });

    const [party, setParty] = useState(() => JSON.parse(localStorage.getItem('ollia_party')) || DEFAULT_PARTY);
    const [rules, setRules] = useState(() => JSON.parse(localStorage.getItem('ollia_rules')) || DEFAULT_RULES);
    const [mapUrl, setMapUrl] = useState(() => localStorage.getItem('ollia_map_url') || '');
    const [mapNotes, setMapNotes] = useState(() => localStorage.getItem('ollia_map_notes') || '');
    const [hexBg, setHexBg] = useState(() => {
        try { return localStorage.getItem('ollia_hex_bg') || ''; } catch(e) { return ''; }
    });
    const [bestiary, setBestiary] = useState(() => JSON.parse(localStorage.getItem('ollia_bestiary')) || DEFAULT_BESTIARY);
    const [savedEncounters, setSavedEncounters] = useState(() => JSON.parse(localStorage.getItem('ollia_encounters')) || []);
    const [fear, setFear] = useState(() => JSON.parse(localStorage.getItem('ollia_fear')) || 0);
    const [hexSettings, setHexSettings] = useState(() => JSON.parse(localStorage.getItem('ollia_hex_settings')) || { offsetX: 0, offsetY: 0, scale: 1, hexSize: 35, opacity: 0.5, rows: 8, cols: 8, orientation: 'flat' });

    const [windows, setWindows] = useState([]);
    const [poppedWidgets, setPoppedWidgets] = useState([]);
    const zIndexRef = useRef(100);

    useEffect(() => {
        if (sessions.length === 0) {
            const legacyNodes = localStorage.getItem('ollia_timeline_v2');
            if (legacyNodes) {
                const newId = Date.now().toString();
                const newSession = { id: newId, title: 'Default Session', date: new Date().toLocaleDateString() };
                safeSetItem(`ollia_session_${newId}`, legacyNodes);
                setSessions([newSession]);
            }
        }
    }, []);

    useEffect(() => {
        if (activeSessionId) {
            const stored = localStorage.getItem(`ollia_session_${activeSessionId}`);
            if (stored) {
                setNodes(JSON.parse(stored));
            } else {
                setNodes([{ id: 1, title: 'Start of Session', desc: '', enemies: [], skillChecks: [], npcs: [], children: [] }]);
            }
        } else {
            setNodes([]);
        }
    }, [activeSessionId]);

    useEffect(() => {
        if (activeSessionId && nodes.length > 0) {
             safeSetItem(`ollia_session_${activeSessionId}`, JSON.stringify(nodes));
        }
    }, [nodes, activeSessionId]);

    useEffect(() => {
        safeSetItem('ollia_sessions_index', JSON.stringify(sessions));
    }, [sessions]);

    useEffect(() => { safeSetItem('ollia_hexes_v2', JSON.stringify(hexes)); }, [hexes]);
    useEffect(() => { safeSetItem('ollia_party', JSON.stringify(party)); }, [party]);
    useEffect(() => { safeSetItem('ollia_rules', JSON.stringify(rules)); }, [rules]);
    useEffect(() => { safeSetItem('ollia_map_url', mapUrl); safeSetItem('ollia_map_notes', mapNotes); }, [mapUrl, mapNotes]);
    useEffect(() => { safeSetItem('ollia_hex_bg', hexBg); }, [hexBg]);
    useEffect(() => { safeSetItem('ollia_bestiary', JSON.stringify(bestiary)); }, [bestiary]);
    useEffect(() => { safeSetItem('ollia_encounters', JSON.stringify(savedEncounters)); }, [savedEncounters]);
    useEffect(() => { safeSetItem('ollia_fear', JSON.stringify(fear)); }, [fear]);
    useEffect(() => { safeSetItem('ollia_hex_settings', JSON.stringify(hexSettings)); }, [hexSettings]);

    const updateHex = (idx, f, v) => setHexes(prev => { const n = [...prev]; n[idx] = { ...n[idx], [f]: v }; return n; });

    const updateGridDimensions = (newRows, newCols) => {
        setHexSettings(prev => ({ ...prev, rows: newRows, cols: newCols }));
        setHexes(prev => {
            const newHexes = [];
            for (let row = 0; row < newRows; row++) {
                for (let col = 0; col < newCols; col++) {
                    const q = col;
                    const r = row - (col - (col&1)) / 2;
                    const existing = prev.find(h => h.q === q && h.r === r);
                    if (existing) {
                        newHexes.push(existing);
                    } else {
                        newHexes.push({ q, r, status: 'unexplored', title: '', icon: 'none', terrain: 'plains', notes: '', encounters: [], npcs: [] });
                    }
                }
            }
            return newHexes;
        });
    };

    const openWindow = (type, data, title) => {
        const existing = windows.find(w => w.type === type && (w.data.id === data.id || (w.data.nodeId === data.nodeId && w.data.npcId === data.npcId) || w.data.hexIndex === data.hexIndex));
        if (existing) {
            setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, zIndex: zIndexRef.current++ } : w));
        } else {
            setWindows(prev => [...prev, { id: Date.now(), type, data, title, zIndex: zIndexRef.current++ }]);
        }
    };

    const closeWindow = (id) => {
        const win = windows.find(w => w.id === id);
        if (win && ['TIMELINE', 'HEX', 'PARTY', 'RULES', 'MAP', 'DICE', 'FEAR'].includes(win.type)) {
            setPoppedWidgets(prev => prev.filter(w => w !== win.type));
        }
        setWindows(prev => prev.filter(w => w.id !== id));
    };

    const focusWindow = (id) => setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndexRef.current++ } : w));

    const togglePopOut = (type, title) => {
        if (poppedWidgets.includes(type)) {
            const win = windows.find(w => w.type === type);
            if (win) closeWindow(win.id);
        } else {
            setPoppedWidgets(prev => [...prev, type]);
            openWindow(type, { id: type }, title);
        }
    };

    const toggleWidget = (type) => {
        setActiveWidgets(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    const backupCampaign = () => {
        const backup = {};
        for(let i=0; i<localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key.startsWith('ollia_')) {
                backup[key] = localStorage.getItem(key);
            }
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
        const dl = document.createElement('a');
        dl.setAttribute("href", dataStr);
        dl.setAttribute("download", `ollia_backup_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(dl);
        dl.click();
        dl.remove();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'TIMELINE': case 'SCENE': return <Scroll size={16}/>;
            case 'HEX': case 'HEX_DETAIL': return <MapPin size={16}/>;
            case 'PARTY': return <Users size={16}/>;
            case 'RULES': return <BookOpen size={16}/>;
            case 'MAP': return <MapIcon size={16}/>;
            case 'DICE': return <Dices size={16}/>;
            case 'FEAR': return <Skull size={16}/>;
            case 'COMBAT': return <Sword size={16}/>;
            case 'NPC': return <User size={16}/>;
            case 'NPC_MANAGER': case 'NPC_BUILDER': return <User size={16}/>;
            case 'BESTIARY': case 'ADV_BUILDER': case 'BESTIARY_PICKER': return <Skull size={16}/>;
            case 'ENCOUNTER_MANAGER': return <Target size={16}/>;
            case 'TABLE_MANAGER': return <List size={16}/>;
            case 'TABLE_ROLLER': return <Dices size={16}/>;
            case 'TABLE_PICKER': return <List size={16}/>;
            default: return <Settings size={16}/>;
        }
    };

    const onDragStart = (e, widgetId) => {
        e.dataTransfer.setData("widgetId", widgetId);
    };

    const onDrop = (e, targetWidgetId) => {
        const draggedId = e.dataTransfer.getData("widgetId");
        if (!draggedId || draggedId === targetWidgetId) return;

        const newWidgets = [...activeWidgets];
        const idx1 = newWidgets.indexOf(draggedId);
        const idx2 = newWidgets.indexOf(targetWidgetId);

        if (idx1 !== -1 && idx2 !== -1) {
            [newWidgets[idx1], newWidgets[idx2]] = [newWidgets[idx2], newWidgets[idx1]];
            setActiveWidgets(newWidgets);
        }
    };

    const findNode = (nodeId) => nodes.find(n => n.id === nodeId);

    const renderContent = (type, data = {}) => {
        switch (type) {
            case 'TIMELINE': return <TimelineWidget activeSessionId={activeSessionId} setActiveSessionId={setActiveSessionId} sessions={sessions} setSessions={setSessions} nodes={nodes} setNodes={setNodes} openWindow={openWindow} />;
            case 'HEX': return <HexGridWidget hexes={hexes} updateHex={updateHex} bgImage={hexBg} setBgImage={setHexBg} openWindow={openWindow} hexSettings={hexSettings} setHexSettings={setHexSettings} updateGridDimensions={updateGridDimensions} loadMapData={(data) => setHexes(data)} />;
            case 'PARTY': return <PartyWidget party={party} setParty={setParty} />;
            case 'RULES': return <RulesWidget rules={rules} />;
            case 'MAP': return <MapWidget mapUrl={mapUrl} setMapUrl={setMapUrl} notes={mapNotes} setNotes={setMapNotes} />;
            case 'DICE': return <DiceWidget />;
            case 'FEAR': return <FearWidget fear={fear} setFear={setFear} />;
            case 'HEX_DETAIL': return <HexDetailWindowContent hexes={hexes} hexIndex={data.hexIndex} updateHex={updateHex} tables={tables} openWindow={openWindow} savedEncounters={savedEncounters} />;
            case 'ENCOUNTER_MANAGER': return <EncounterManager savedEncounters={savedEncounters} setSavedEncounters={setSavedEncounters} />;
            case 'BESTIARY': return <BestiaryWindowContent library={bestiary} setLibrary={setBestiary} openWindow={openWindow} />;
            case 'ADV_BUILDER': return <AdversaryBuilderWindow onSave={data.onSave} initialData={data.initialData} close={() => closeWindow(data.windowId)} />;
            case 'BESTIARY_PICKER': return <BestiaryPickerWindowContent library={bestiary} onPick={data.onPick} close={() => closeWindow(data.windowId)} />;
            case 'TABLE_MANAGER': return <TableManagerWindowContent tables={tables} setTables={setTables} customTables={customTables} setCustomTables={setCustomTables} />;
            case 'NPC_MANAGER': return <NPCManagerWindowContent npcCatalog={npcCatalog} setNpcCatalog={setNpcCatalog} npcTraits={npcTraits} setNpcTraits={setNpcTraits} openWindow={openWindow} />;
            case 'NPC_BUILDER': return <NPCBuilderWindow onSave={data.onSave} initialData={data.initialData} npcTraits={npcTraits} close={() => closeWindow(data.windowId)} />;
            case 'COMBAT': return <CombatWindowContent openWindow={openWindow} party={party} bestiary={bestiary} fear={fear} setFear={setFear} />;
            case 'SCENE': {
                const node = findNode(data.nodeId);
                return node ? <SceneWindowContent node={node} nodes={nodes} setNodes={setNodes} openWindow={openWindow} savedEncounters={savedEncounters} tables={tables} /> : <div className="text-gray-500">Scene not found</div>;
            }
            default: return <div className="p-4 text-gray-500">Widget: {type}</div>;
        }
    };

    return (
        <div className="h-screen w-screen flex overflow-hidden bg-[#0f1115] text-[#dcdcdc] font-sans">
            <style>{styles}</style>
            {windows.map(win => (
                <FloatingWindow key={win.id} windowData={{...win, icon: getIcon(win.type)}} onClose={closeWindow} onFocus={focusWindow}>
                    {renderContent(win.type, {...win.data, windowId: win.id})}
                </FloatingWindow>
            ))}

            <div className="w-16 bg-[#15171b] border-r border-gray-800 flex flex-col items-center py-4 gap-4 z-20 overflow-y-auto">
                <div className="w-10 h-10 bg-indigo-900 rounded-full flex items-center justify-center font-bold text-indigo-200 border border-indigo-700 shadow-lg shadow-indigo-500/20 mb-2">GM</div>

                {Object.values(WIDGET_CONFIG).map(config => {
                    const Icon = config.icon;
                    return (
                        <button
                            key={config.id}
                            onClick={() => toggleWidget(config.id)}
                            className={`sidebar-btn ${activeWidgets.includes(config.id) ? 'active' : ''}`}
                            title={config.title}
                        >
                            <Icon size={20}/>
                        </button>
                    );
                })}

                <div className="h-px w-8 bg-gray-700 my-2"></div>
                <button onClick={() => openWindow('COMBAT', {}, 'Combat Tracker')} className="sidebar-btn hover:text-red-500" title="Combat Tracker"><Sword size={20}/></button>
                <button onClick={() => openWindow('NPC_MANAGER', {}, 'NPC Catalog & Builder')} className="sidebar-btn hover:text-green-400" title="NPC Catalog"><User size={20}/></button>
                <button onClick={() => openWindow('BESTIARY', {}, 'Adversary Bestiary')} className="sidebar-btn hover:text-red-400" title="Bestiary"><Skull size={20}/></button>
                <button onClick={() => openWindow('ENCOUNTER_MANAGER', {}, 'Encounter Builder')} className="sidebar-btn hover:text-orange-500" title="Encounter Builder"><Target size={20}/></button>
                <button onClick={() => openWindow('TABLE_MANAGER', {}, 'Table Generators')} className="sidebar-btn hover:text-yellow-400" title="Tables"><List size={20}/></button>
                <div className="mt-auto">
                     <button onClick={backupCampaign} className="sidebar-btn hover:text-green-400" title="Backup Full Campaign"><Settings size={20}/></button>
                </div>
            </div>

            <div className="flex-1 bg-[#0f1115] p-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="h-full grid grid-cols-12 grid-rows-12 gap-4 grid-flow-row-dense">

                    {activeWidgets.map(widgetId => {
                        const config = WIDGET_CONFIG[widgetId];
                        if (!config) return null;

                        return (
                            <div
                                key={widgetId}
                                className={`panel ${config.defaultSpan}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => onDrop(e, widgetId)}
                            >
                                <PanelHeader
                                    icon={config.icon}
                                    title={config.title}
                                    onPopOut={() => togglePopOut(widgetId, config.title)}
                                    isPopped={poppedWidgets.includes(widgetId)}
                                    onDragStart={(e) => onDragStart(e, widgetId)}
                                />
                                <div className="p-3 flex-1 overflow-hidden">
                                    {poppedWidgets.includes(widgetId)
                                        ? <PoppedPlaceholder title={config.title} onRestore={() => togglePopOut(widgetId)} />
                                        : renderContent(widgetId)
                                    }
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}
