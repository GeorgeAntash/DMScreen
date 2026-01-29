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

    /* Floating Window Animation */
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

    /* Daggerheart Card Styles */
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

    /* Checkbox Styling for HP/Stress */
    .dh-checkbox {
        width: 14px;
        height: 14px;
        border: 1px solid #4b5563;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.1s;
    }
    .dh-checkbox.filled {
        background-color: #ef4444; /* Red for HP */
        border-color: #ef4444;
    }
    .dh-checkbox.stress {
        border-color: #a855f7;
    }
    .dh-checkbox.stress.filled {
        background-color: #a855f7; /* Purple for Stress */
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

    /* Combat Tracker Active Row */
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

// Helper to safely store data without crashing
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

export default function App() {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#0f1115] text-white">
            <style>{styles}</style>
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">DM Screen - Loading...</h1>
                <p className="text-gray-400">Base file created. Full components coming next.</p>
            </div>
        </div>
    );
}
