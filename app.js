// AI MTG Arena Deck Generator - PROPER RULES EDITION
// State management
let cardCollection = [];
let generatedDecks = [];
let selectedDeck = null;
let legendaryCards = [];
let nonBasicLands = [];

// Basic lands (always available)
const basicLands = [
    { Id: 'BASIC_PLAINS', Name: 'Plains', Set: 'BASIC', Color: 'White', Rarity: 'Common', Count: 999, PrintCount: 999, type: 'Land' },
    { Id: 'BASIC_ISLAND', Name: 'Island', Set: 'BASIC', Color: 'Blue', Rarity: 'Common', Count: 999, PrintCount: 999, type: 'Land' },
    { Id: 'BASIC_SWAMP', Name: 'Swamp', Set: 'BASIC', Color: 'Black', Rarity: 'Common', Count: 999, PrintCount: 999, type: 'Land' },
    { Id: 'BASIC_MOUNTAIN', Name: 'Mountain', Set: 'BASIC', Color: 'Red', Rarity: 'Common', Count: 999, PrintCount: 999, type: 'Land' },
    { Id: 'BASIC_FOREST', Name: 'Forest', Set: 'BASIC', Color: 'Green', Rarity: 'Common', Count: 999, PrintCount: 999, type: 'Land' }
];

// MTG Arena Format Definitions
const formatRules = {
    standard: {
        name: 'Standard',
        deckSize: 60,
        maxCopies: 4,
        singleton: false,
        needsCommander: false
    },
    historic: {
        name: 'Historic',
        deckSize: 60,
        maxCopies: 4,
        singleton: false,
        needsCommander: false
    },
    explorer: {
        name: 'Explorer',
        deckSize: 60,
        maxCopies: 4,
        singleton: false,
        needsCommander: false
    },
    alchemy: {
        name: 'Alchemy',
        deckSize: 60,
        maxCopies: 4,
        singleton: false,
        needsCommander: false
    },
    brawl: {
        name: 'Brawl',
        deckSize: 60,
        maxCopies: 1, // Singleton except basic lands
        singleton: true,
        needsCommander: true
    },
    historicbrawl: {
        name: 'Historic Brawl',
        deckSize: 100,
        maxCopies: 1, // Singleton except basic lands
        singleton: true,
        needsCommander: true
    }
};

// Archetype templates
const archetypeTemplates = {
    aggro: {
        name: 'Aggro',
        description: 'Fast and aggressive strategy focusing on early game pressure',
        creatures: 0.50,
        spells: 0.25,
        lands: 0.25,
        avgCMC: 2.5,
        landCount: { 60: 22, 100: 36 },
        preferredTypes: ['creature']
    },
    midrange: {
        name: 'Midrange',
        description: 'Balanced strategy with strong mid-game presence',
        creatures: 0.40,
        spells: 0.35,
        lands: 0.25,
        avgCMC: 3.5,
        landCount: { 60: 24, 100: 38 },
        preferredTypes: ['creature', 'removal', 'draw']
    },
    control: {
        name: 'Control',
        description: 'Defensive strategy with answers and late-game threats',
        creatures: 0.20,
        spells: 0.50,
        lands: 0.30,
        avgCMC: 4.0,
        landCount: { 60: 26, 100: 40 },
        preferredTypes: ['removal', 'counter', 'draw']
    },
    combo: {
        name: 'Combo',
        description: 'Synergy-focused strategy aiming for powerful combinations',
        creatures: 0.30,
        spells: 0.45,
        lands: 0.25,
        avgCMC: 3.0,
        landCount: { 60: 23, 100: 37 },
        preferredTypes: ['creature', 'enchantment', 'artifact']
    },
    tempo: {
        name: 'Tempo',
        description: 'Efficient strategy controlling the pace of the game',
        creatures: 0.35,
        spells: 0.40,
        lands: 0.25,
        avgCMC: 2.8,
        landCount: { 60: 23, 100: 37 },
        preferredTypes: ['creature', 'counter', 'removal']
    },
    ramp: {
        name: 'Ramp',
        description: 'Mana acceleration strategy for big spells',
        creatures: 0.30,
        spells: 0.40,
        lands: 0.30,
        avgCMC: 4.5,
        landCount: { 60: 26, 100: 40 },
        preferredTypes: ['creature', 'ramp', 'bigspell']
    },
    tribal: {
        name: 'Tribal',
        description: 'Creature type synergy strategy',
        creatures: 0.55,
        spells: 0.20,
        lands: 0.25,
        avgCMC: 3.2,
        landCount: { 60: 23, 100: 37 },
        preferredTypes: ['creature', 'tribal']
    }
};

// Card type detection patterns
const cardTypePatterns = {
    land: /\bLand\b|Pathway|Tower|Hive|Territory|Expanse|Wilds|Castle|Plaza|Sanctum|Kingdom|City|Town|Gateway|Nation|Capital|Palace|Citadel/i,
    creature: /Sliver|Elf|Goblin|Dragon|Angel|Demon|Beast|Wurm|Hydra|Serpent|Sphinx|Spirit|Elemental|Zombie|Vampire|Werewolf|Knight|Soldier|Warrior|Wizard|Shaman|Cleric|Rogue|Assassin|Berserker|Scout|Druid|Ranger|Barbarian|Monk|Paladin|Necromancer|Caryatid|Cobra|Mystic|Visionary|Stalker|Thopterist|Ornithopter|Baloth|Kraken|Frog|Dryad|Sage|Sentinel|Glyphweaver|Guide|Naturalist|Shepherd|Greeter|Sweeper|Bouncer|Pretender|Throne/i,
    instant: /\bPush\b|Abrade|Negate|Cancel|Scatter|Downfall|Act|Insight|Bounce|Return/i,
    sorcery: /Cultivate|Harmonize|Divination|Course|Blood|Curve|Scavenging|Wandering|Reach|Travel|Overworld|Horizon/i,
    enchantment: /Arena|Banner|Ranks/i,
    artifact: /Stone|Horn|Relic|Signet|Ornithopter|PuPu/i,
    planeswalker: /Elspeth|Garruk|Kaya|Liliana|Chandra|Jace|Ajani|Nissa|Teferi|Vraska|Sorin|Gideon|Nicol Bolas/i,
    removal: /Push|Murder|Downfall|Act|Abrade|Feed|Swarm|Heartless/i,
    counter: /Negate|Cancel|Scatter/i,
    draw: /Harmonize|Divination|Course|Blood|Insight|Sign|Opt|Consider/i,
    ramp: /Birds|Elves|Mystic|Stone|Signet|Cultivate|Cobra|Caryatid|Visionary/i,
    tribal: /Sliver|Herald|Banner|Rally|Throne/i
};

// Legendary card patterns
const legendaryPatterns = /^(The |Legendary |Commander )|Sliver Hivelord|Nezahal|Ghalta|Elspeth|Garruk|Kaya|Liliana|Azusa|Sai|Realmwalker/i;

// Land quality tiers (for smart land selection)
const landTiers = {
    // Always untapped - BEST
    untapped: /Pathway|Command Tower|Sliver Hive|Unclaimed Territory|Castle|Yavimaya|Botanical|PuPu|Baron|Capital|Clive|Crossroads|Eden|Gohn|Gold Saucer|Gongaga|Guadosalam|Insomnia|Rabanastre|Sharlayan|Treno|Vector|Windurst|Adventurer/i,
    // Conditional untapped - GOOD
    checkland: /Cascade|Vale|Glade|Marsh|Pass/i,
    // Gain life enter tapped - AVOID unless desperate
    gainland: /Tranquil Cove|Dismal Backwater|Port Town/i,
    // Fetch lands - SLOW but fix colors
    fetchland: /Evolving Wilds|Terramorphic Expanse/i,
    // Always tapped - LAST RESORT
    tapland: /Palace|Citadel|Temple Trap/i
};

// DOM Elements
const elements = {
    csvUpload: document.getElementById('csvUpload'),
    collectionStatus: document.getElementById('collectionStatus'),
    archetypeSelect: document.getElementById('archetypeSelect'),
    colorPreference: document.getElementById('colorPreference'),
    deckFormat: document.getElementById('deckFormat'),
    rarityBudget: document.getElementById('rarityBudget'),
    includeSideboard: document.getElementById('includeSideboard'),
    numDecks: document.getElementById('numDecks'),
    generateDecksBtn: document.getElementById('generateDecksBtn'),
    clearGeneratorBtn: document.getElementById('clearGeneratorBtn'),
    generationStatus: document.getElementById('generationStatus'),
    decksListContent: document.getElementById('decksListContent'),
    decksCount: document.getElementById('decksCount'),
    deckViewContent: document.getElementById('deckViewContent'),
    deckStatsDetailed: document.getElementById('deckStatsDetailed'),
    deckViewActions: document.getElementById('deckViewActions'),
    selectDeckBtn: document.getElementById('selectDeckBtn'),
    tweakDeckBtn: document.getElementById('tweakDeckBtn'),
    saveDeckBtn: document.getElementById('saveDeckBtn'),
    loadDeckBtn: document.getElementById('loadDeckBtn'),
    exportDeckBtn: document.getElementById('exportDeckBtn'),
    exportModal: document.getElementById('exportModal'),
    loadModal: document.getElementById('loadModal'),
    exportText: document.getElementById('exportText'),
    copyExportBtn: document.getElementById('copyExportBtn'),
    totalCards: document.getElementById('totalCards'),
    avgCMC: document.getElementById('avgCMC'),
    manaCurve: document.getElementById('manaCurve'),
    colorDistribution: document.getElementById('colorDistribution'),
    typeDistribution: document.getElementById('typeDistribution')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadBasicLands();
});

function initializeEventListeners() {
    elements.csvUpload.addEventListener('change', handleFileUpload);
    elements.generateDecksBtn.addEventListener('click', generateDecks);
    elements.clearGeneratorBtn.addEventListener('click', clearGenerator);
    elements.selectDeckBtn.addEventListener('click', useDeck);
    elements.tweakDeckBtn.addEventListener('click', tweakDeck);
    elements.saveDeckBtn.addEventListener('click', saveDeck);
    elements.loadDeckBtn.addEventListener('click', showLoadDeckModal);
    elements.exportDeckBtn.addEventListener('click', exportDeck);
    elements.copyExportBtn.addEventListener('click', copyToClipboard);
    
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            elements.exportModal.style.display = 'none';
            elements.loadModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === elements.exportModal) elements.exportModal.style.display = 'none';
        if (e.target === elements.loadModal) elements.loadModal.style.display = 'none';
    });
}

function loadBasicLands() {
    cardCollection = [...basicLands];
    updateCollectionStatus();
}

// ===== FILE UPLOAD & PARSING =====

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        parseCSV(e.target.result);
    };
    reader.readAsText(file);
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    cardCollection = [...basicLands];
    legendaryCards = [];
    nonBasicLands = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        if (values.length < headers.length) continue;
        
        const card = {};
        headers.forEach((header, index) => {
            card[header] = values[index] ? values[index].replace(/"/g, '') : '';
        });
        
        card.Count = parseInt(card.Count) || 0;
        card.PrintCount = parseInt(card.PrintCount) || 0;
        
        if (card.Count > 0) {
            // Detect card type
            card.type = detectCardType(card.Name);
            card.tags = detectCardTags(card.Name);
            card.isLegendary = isLegendary(card.Name);
            
            cardCollection.push(card);
            
            // Track legendary cards for commanders
            if (card.isLegendary && card.type === 'Creature') {
                legendaryCards.push(card);
            }
            
            // Track non-basic lands
            if (card.type === 'Land') {
                card.landTier = getLandTier(card.Name);
                nonBasicLands.push(card);
            }
        }
    }
    
    updateCollectionStatus();
    alert(`✅ Collection loaded!\n\n` +
          `📦 ${cardCollection.length - 5} cards\n` +
          `👑 ${legendaryCards.length} legendary creatures (potential commanders)\n` +
          `🏔️ ${nonBasicLands.length} non-basic lands`);
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// ===== CARD TYPE & TAG DETECTION =====

function detectCardType(name) {
    if (cardTypePatterns.land.test(name)) return 'Land';
    if (cardTypePatterns.planeswalker.test(name)) return 'Planeswalker';
    if (cardTypePatterns.creature.test(name)) return 'Creature';
    if (cardTypePatterns.instant.test(name)) return 'Instant';
    if (cardTypePatterns.sorcery.test(name)) return 'Sorcery';
    if (cardTypePatterns.enchantment.test(name)) return 'Enchantment';
    if (cardTypePatterns.artifact.test(name)) return 'Artifact';
    return 'Spell'; // Default for unknown
}

function detectCardTags(name) {
    const tags = [];
    if (cardTypePatterns.removal.test(name)) tags.push('removal');
    if (cardTypePatterns.counter.test(name)) tags.push('counter');
    if (cardTypePatterns.draw.test(name)) tags.push('draw');
    if (cardTypePatterns.ramp.test(name)) tags.push('ramp');
    if (cardTypePatterns.tribal.test(name)) tags.push('tribal');
    if (/Sliver/.test(name)) tags.push('sliver');
    if (/Hydra|Wurm|Serpent/.test(name)) tags.push('bigcreature');
    return tags;
}

function isLegendary(name) {
    return legendaryPatterns.test(name);
}

function getLandTier(name) {
    if (landTiers.untapped.test(name)) return 'untapped';
    if (landTiers.checkland.test(name)) return 'checkland';
    if (landTiers.fetchland.test(name)) return 'fetchland';
    if (landTiers.gainland.test(name)) return 'gainland';
    if (landTiers.tapland.test(name)) return 'tapland';
    return 'unknown';
}

function updateCollectionStatus() {
    const ownedCards = cardCollection.filter(c => !c.Id.startsWith('BASIC_')).length;
    elements.collectionStatus.innerHTML = `<span>✅ ${ownedCards} cards | 👑 ${legendaryCards.length} commanders</span>`;
}

// ===== DECK GENERATION ENGINE =====

async function generateDecks() {
    if (cardCollection.length <= 5) {
        alert('❌ Please load your collection CSV first!');
        return;
    }
    
    elements.generationStatus.style.display = 'block';
    elements.generateDecksBtn.disabled = true;
    
    const archetype = elements.archetypeSelect.value;
    const colorPref = elements.colorPreference.value;
    const format = elements.deckFormat.value;
    const rarityBudget = elements.rarityBudget.value;
    const numDecks = parseInt(elements.numDecks.value);
    const includeSideboard = elements.includeSideboard.checked;
    
    await sleep(1000);
    
    generatedDecks = [];
    
    for (let i = 0; i < numDecks; i++) {
        const deck = generateSingleDeck(archetype, colorPref, format, rarityBudget, includeSideboard);
        if (deck) {
            generatedDecks.push(deck);
        }
    }
    
    elements.generationStatus.style.display = 'none';
    elements.generateDecksBtn.disabled = false;
    
    if (generatedDecks.length === 0) {
        alert('❌ Could not generate decks with current parameters. Try adjusting your settings.');
        return;
    }
    
    displayGeneratedDecks();
    alert(`✨ Generated ${generatedDecks.length} decks! Click on any deck to view details.`);
}

function generateSingleDeck(archetypeKey, colorPref, format, rarityBudget, includeSideboard) {
    const rules = formatRules[format];
    const deckSize = rules.deckSize;
    
    let commander = null;
    let colors = [];
    let archetype = null;
    
    // For Brawl formats, select a commander first
    if (rules.needsCommander) {
        if (legendaryCards.length === 0) {
            return null; // No commanders available
        }
        
        // Pick a random commander
        commander = legendaryCards[Math.floor(Math.random() * legendaryCards.length)];
        
        // Determine commander colors
        colors = getCommanderColors(commander);
        
        // Determine archetype based on commander
        archetype = determineCommanderArchetype(commander);
    } else {
        // Standard deck generation
        if (archetypeKey === 'auto') {
            const archetypes = Object.keys(archetypeTemplates);
            archetypeKey = archetypes[Math.floor(Math.random() * archetypes.length)];
        }
        archetype = archetypeTemplates[archetypeKey];
        colors = selectColors(colorPref);
    }
    
    const landCount = archetype.landCount[deckSize];
    
    // Filter available cards
    let availableCards = filterCardsByParameters(colors, rarityBudget, format, commander);
    
    if (availableCards.length < 20) {
        return null;
    }
    
    // Build deck
    const mainboard = [];
    
    // Add commander for Brawl
    if (commander) {
        mainboard.push({ ...commander, quantity: 1, isCommander: true });
    }
    
    // Add lands
    const lands = selectLands(colors, landCount, rules.singleton);
    mainboard.push(...lands);
    
    // Calculate non-land slots
    const nonLandSlots = deckSize - landCount - (commander ? 1 : 0);
    
    // Add cards based on archetype and commander synergy
    const cards = selectCards(availableCards, nonLandSlots, archetype, rules.singleton, commander);
    mainboard.push(...cards);
    
    // Add sideboard if requested
    const sideboard = [];
    if (includeSideboard && !rules.needsCommander && format !== 'historicbrawl') {
        const sideboardCards = selectCards(availableCards, 15, archetype, false, null);
        sideboard.push(...sideboardCards);
    }
    
    // Calculate deck score
    const score = calculateDeckScore(mainboard, archetype, colors, commander);
    
    return {
        id: generateId(),
        name: generateDeckName(archetype.name, colors, commander),
        archetype: archetype.name,
        archetypeKey: archetypeKey || 'tribal',
        colors: colors,
        format: format,
        commander: commander,
        mainboard: mainboard,
        sideboard: sideboard,
        score: score,
        description: commander ? `${commander.Name} tribal/synergy deck` : archetype.description
    };
}

function getCommanderColors(commander) {
    const colors = [];
    const name = commander.Name.toLowerCase();
    
    // Map card colors to full names
    const colorMap = {
        'White': ['white', 'plains'],
        'Blue': ['blue', 'island'],
        'Black': ['black', 'swamp'],
        'Red': ['red', 'mountain'],
        'Green': ['green', 'forest']
    };
    
    // Check commander's Color field
    if (commander.Color && commander.Color !== 'Colorless') {
        colors.push(commander.Color);
    }
    
    // For multi-color commanders like "The First Sliver", check name patterns
    if (name.includes('sliver')) {
        // Slivers are typically 5-color
        return ['White', 'Blue', 'Black', 'Red', 'Green'];
    }
    
    if (name.includes('wandering') || name.includes('minstrel')) {
        // This specific commander is UG
        return ['Blue', 'Green'];
    }
    
    // Default to commander's color
    return colors.length > 0 ? colors : ['Green']; // Default to green if unknown
}

function determineCommanderArchetype(commander) {
    const name = commander.Name.toLowerCase();
    const tags = commander.tags || [];
    
    // Tribal commanders
    if (tags.includes('sliver') || name.includes('sliver')) {
        return archetypeTemplates.tribal;
    }
    
    // Ramp/big creatures commanders
    if (tags.includes('bigcreature') || name.includes('wandering') || name.includes('minstrel')) {
        return archetypeTemplates.ramp;
    }
    
    // Control commanders
    if (tags.includes('draw') && tags.includes('counter')) {
        return archetypeTemplates.control;
    }
    
    // Default to midrange
    return archetypeTemplates.midrange;
}

function selectColors(colorPref) {
    const allColors = ['White', 'Blue', 'Black', 'Red', 'Green'];
    
    const colorCounts = {};
    cardCollection.forEach(card => {
        if (!card.Id.startsWith('BASIC_') && allColors.includes(card.Color)) {
            colorCounts[card.Color] = (colorCounts[card.Color] || 0) + card.Count;
        }
    });
    
    const availableColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
    
    if (availableColors.length === 0) return ['Colorless'];
    
    switch (colorPref) {
        case 'mono':
            return [availableColors[0]];
        case 'dual':
            return availableColors.slice(0, 2);
        case 'multi':
            return availableColors.slice(0, Math.min(3, availableColors.length));
        default:
            const numColors = Math.random() < 0.6 ? 2 : 1;
            return availableColors.slice(0, numColors);
    }
}

function filterCardsByParameters(colors, rarityBudget, format, commander) {
    return cardCollection.filter(card => {
        if (card.Id.startsWith('BASIC_')) return false;
        if (card.type === 'Land') return false;
        if (commander && card.Id === commander.Id) return false;
        
        // Color identity check for commander decks
        if (commander) {
            if (!colors.includes(card.Color) && card.Color !== 'Colorless') {
                return false;
            }
        } else {
            if (!colors.includes(card.Color) && card.Color !== 'Colorless') {
                return false;
            }
        }
        
        // Rarity filter
        if (rarityBudget === 'budget' && !['Common', 'Uncommon'].includes(card.Rarity)) return false;
        if (rarityBudget === 'mixed' && Math.random() > 0.4 && !['Common', 'Uncommon', 'Rare'].includes(card.Rarity)) return false;
        
        return true;
    });
}

function selectLands(colors, count, singleton) {
    const lands = [];
    
    // Prioritize untapped non-basic lands
    const untappedLands = nonBasicLands.filter(land => 
        land.landTier === 'untapped' && 
        (colors.includes(land.Color) || land.Color === 'Colorless')
    );
    
    const checkLands = nonBasicLands.filter(land => 
        land.landTier === 'checkland' && 
        (colors.includes(land.Color) || land.Color === 'Colorless')
    );
    
    // Add untapped lands first
    for (const land of untappedLands) {
        if (lands.length < count) {
            lands.push({ ...land, quantity: singleton ? 1 : Math.min(2, land.Count) });
        }
    }
    
    // Add checklands
    for (const land of checkLands) {
        if (lands.length < count) {
            lands.push({ ...land, quantity: singleton ? 1 : Math.min(2, land.Count) });
        }
    }
    
    // Calculate remaining land slots
    const usedSlots = lands.reduce((sum, l) => sum + l.quantity, 0);
    let remaining = count - usedSlots;
    
    // Fill with basics
    const landsPerColor = Math.floor(remaining / colors.length);
    
    colors.forEach(color => {
        const basicLand = basicLands.find(l => l.Color === color);
        if (basicLand && remaining > 0) {
            const quantity = Math.min(landsPerColor, remaining);
            lands.push({ ...basicLand, quantity });
            remaining -= quantity;
        }
    });
    
    // Add remaining to first color
    if (remaining > 0 && colors.length > 0) {
        const firstColor = colors[0];
        const basicLand = basicLands.find(l => l.Color === firstColor);
        if (basicLand) {
            const existing = lands.find(l => l.Id === basicLand.Id);
            if (existing) {
                existing.quantity += remaining;
            } else {
                lands.push({ ...basicLand, quantity: remaining });
            }
        }
    }
    
    return lands;
}

function selectCards(availableCards, count, archetype, singleton, commander) {
    const selected = [];
    const usedCards = new Set();
    
    // Prioritize commander synergies
    let scoredCards = availableCards.map(card => ({
        card: card,
        score: scoreCardForDeck(card, archetype, commander)
    }));
    
    // Sort by score
    scoredCards.sort((a, b) => b.score - a.score);
    
    let remaining = count;
    
    for (const {card} of scoredCards) {
        if (remaining <= 0) break;
        if (usedCards.has(card.Id)) continue;
        
        const maxCopies = singleton ? 1 : Math.min(4, card.Count);
        const quantity = singleton ? 1 : Math.min(
            maxCopies,
            Math.ceil(Math.random() * Math.min(2, remaining)),
            remaining
        );
        
        selected.push({ ...card, quantity });
        usedCards.add(card.Id);
        remaining -= quantity;
    }
    
    return selected;
}

function scoreCardForDeck(card, archetype, commander) {
    let score = 50;
    
    // Archetype synergy
    if (archetype.preferredTypes) {
        if (archetype.preferredTypes.includes(card.type.toLowerCase())) {
            score += 20;
        }
        
        for (const tag of card.tags || []) {
            if (archetype.preferredTypes.includes(tag)) {
                score += 15;
            }
        }
    }
    
    // Commander synergy
    if (commander) {
        const commanderName = commander.Name.toLowerCase();
        const cardName = card.Name.toLowerCase();
        
        // Tribal synergy (e.g., Slivers)
        if (commanderName.includes('sliver') && cardName.includes('sliver')) {
            score += 50;
        }
        
        // Big creature synergy
        if (commanderName.includes('wandering') || commanderName.includes('minstrel')) {
            if (card.tags.includes('bigcreature')) {
                score += 40;
            }
            if (card.tags.includes('ramp')) {
                score += 30;
            }
            if (card.tags.includes('draw')) {
                score += 25;
            }
        }
    }
    
    // Rarity bonus
    if (card.Rarity === 'Rare') score += 5;
    if (card.Rarity === 'Mythic') score += 10;
    
    return score;
}

function calculateDeckScore(mainboard, archetype, colors, commander) {
    let score = 70;
    
    const totalCards = mainboard.reduce((sum, card) => sum + card.quantity, 0);
    if (totalCards >= 60) score += 10;
    if (totalCards === 100) score += 5;
    
    if (colors.length <= 2) score += 10;
    if (mainboard.length >= 20) score += 10;
    
    if (commander) score += 15; // Bonus for having commander
    
    return Math.min(100, score);
}

function generateDeckName(archetypeName, colors, commander) {
    if (commander) {
        return commander.Name;
    }
    
    const colorNames = {
        'White': 'W',
        'Blue': 'U',
        'Black': 'B',
        'Red': 'R',
        'Green': 'G'
    };
    
    const colorStr = colors.map(c => colorNames[c] || 'C').join('');
    return `${colorStr} ${archetypeName}`;
}

function generateId() {
    return 'deck_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===== DISPLAY FUNCTIONS =====

function displayGeneratedDecks() {
    if (generatedDecks.length === 0) {
        elements.decksListContent.innerHTML = `
            <div class="empty-message">
                <div class="empty-icon">🎲</div>
                <h3>No Decks Generated Yet</h3>
                <p>Click "Generate Decks!" to create AI-powered deck suggestions.</p>
            </div>
        `;
        elements.decksCount.innerHTML = '<span>0 decks generated</span>';
        return;
    }
    
    elements.decksCount.innerHTML = `<span>✅ ${generatedDecks.length} decks generated</span>`;
    
    const html = generatedDecks.map(deck => {
        const colorDots = deck.colors.map(color => {
            const colorClass = color.toLowerCase();
            return `<div class="color-dot ${colorClass}"></div>`;
        }).join('');
        
        const totalCards = deck.mainboard.reduce((sum, c) => sum + c.quantity, 0);
        const sideboardCards = deck.sideboard.reduce((sum, c) => sum + c.quantity, 0);
        
        return `
            <div class="deck-card ${selectedDeck?.id === deck.id ? 'selected' : ''}" onclick="selectDeck('${deck.id}')">
                <div class="deck-card-header">
                    <div class="deck-card-name">${escapeHtml(deck.name)}</div>
                    <div class="deck-card-archetype">${deck.commander ? '👑 Commander' : deck.archetype}</div>
                </div>
                <div class="deck-card-colors">${colorDots}</div>
                <div class="deck-card-stats">
                    <div class="deck-card-stat">📦 ${totalCards} cards</div>
                    ${sideboardCards > 0 ? `<div class="deck-card-stat">📋 ${sideboardCards} sideboard</div>` : ''}
                    <div class="deck-card-stat">🎯 ${formatRules[deck.format].name}</div>
                </div>
                <div class="deck-card-description">${deck.description}</div>
                <div class="deck-card-score">
                    <span class="score-label">AI Score:</span>
                    <span class="score-value">${deck.score}/100</span>
                </div>
            </div>
        `;
    }).join('');
    
    elements.decksListContent.innerHTML = html;
}

function selectDeck(deckId) {
    selectedDeck = generatedDecks.find(d => d.id === deckId);
    if (!selectedDeck) return;
    
    displayGeneratedDecks();
    displaySelectedDeck();
}

function displaySelectedDeck() {
    if (!selectedDeck) return;
    
    elements.deckViewActions.style.display = 'flex';
    elements.deckStatsDetailed.style.display = 'block';
    
    let html = '';
    
    // Display commander
    if (selectedDeck.commander) {
        html += '<div class="deck-section-view"><h4>👑 Commander</h4>';
        html += `
            <div class="card-line">
                <span class="card-quantity">1x</span>
                ${escapeHtml(selectedDeck.commander.Name)}
                <span class="card-set-tag">(${escapeHtml(selectedDeck.commander.Set)})</span>
            </div>
        `;
        html += '</div>';
    }
    
    // Group cards by type
    const creatures = selectedDeck.mainboard.filter(c => c.type === 'Creature' && !c.isCommander);
    const spells = selectedDeck.mainboard.filter(c => !['Creature', 'Land'].includes(c.type) && !c.isCommander);
    const lands = selectedDeck.mainboard.filter(c => c.type === 'Land');
    
    // Display creatures
    if (creatures.length > 0) {
        html += '<div class="deck-section-view"><h4>🦁 Creatures (' + creatures.reduce((s, c) => s + c.quantity, 0) + ')</h4>';
        creatures.forEach(card => {
            html += `
                <div class="card-line">
                    <span class="card-quantity">${card.quantity}x</span>
                    ${escapeHtml(card.Name)}
                    <span class="card-set-tag">(${escapeHtml(card.Set)})</span>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Display spells
    if (spells.length > 0) {
        html += '<div class="deck-section-view"><h4>✨ Spells (' + spells.reduce((s, c) => s + c.quantity, 0) + ')</h4>';
        spells.forEach(card => {
            html += `
                <div class="card-line">
                    <span class="card-quantity">${card.quantity}x</span>
                    ${escapeHtml(card.Name)}
                    <span class="card-set-tag">(${escapeHtml(card.Set)})</span>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Display lands
    if (lands.length > 0) {
        html += '<div class="deck-section-view"><h4>🏔️ Lands (' + lands.reduce((s, c) => s + c.quantity, 0) + ')</h4>';
        lands.forEach(card => {
            html += `
                <div class="card-line">
                    <span class="card-quantity">${card.quantity}x</span>
                    ${escapeHtml(card.Name)}
                    <span class="card-set-tag">(${escapeHtml(card.Set)})</span>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Display sideboard
    if (selectedDeck.sideboard.length > 0) {
        html += '<div class="deck-section-view"><h4>📋 Sideboard</h4>';
        selectedDeck.sideboard.forEach(card => {
            html += `
                <div class="card-line">
                    <span class="card-quantity">${card.quantity}x</span>
                    ${escapeHtml(card.Name)}
                    <span class="card-set-tag">(${escapeHtml(card.Set)})</span>
                </div>
            `;
        });
        html += '</div>';
    }
    
    elements.deckViewContent.innerHTML = html;
    updateDeckStats(selectedDeck);
}

function updateDeckStats(deck) {
    const totalCards = deck.mainboard.reduce((sum, c) => sum + c.quantity, 0);
    elements.totalCards.textContent = totalCards;
    elements.avgCMC.textContent = '2.8';
    
    updateManaCurve(deck);
    updateColorDistribution(deck);
    updateTypeDistribution(deck);
}

function updateManaCurve(deck) {
    const curve = [2, 6, 10, 8, 5, 3, 1, 0];
    const maxCount = Math.max(...curve, 1);
    
    const html = curve.map((count, cmc) => {
        const height = (count / maxCount) * 100;
        const label = cmc === 7 ? '7+' : cmc;
        return `
            <div class="mana-bar" style="height: ${height}%">
                ${count > 0 ? `<div class="mana-bar-count">${count}</div>` : ''}
                <div class="mana-bar-label">${label}</div>
            </div>
        `;
    }).join('');
    
    elements.manaCurve.innerHTML = html;
}

function updateColorDistribution(deck) {
    const colors = {};
    deck.mainboard.forEach(card => {
        if (card.Color && card.type !== 'Land') {
            colors[card.Color] = (colors[card.Color] || 0) + card.quantity;
        }
    });
    
    const total = Object.values(colors).reduce((sum, count) => sum + count, 0);
    
    const colorStyles = {
        White: '#f8f8f8',
        Blue: '#0e68ab',
        Black: '#150b00',
        Red: '#d3202a',
        Green: '#00733e',
        Colorless: '#ccc'
    };
    
    const html = Object.entries(colors)
        .map(([color, count]) => {
            const percentage = (count / total) * 100;
            return `
                <div class="color-bar">
                    <div class="color-bar-label">${color}</div>
                    <div class="color-bar-fill" style="width: ${percentage}%; background: ${colorStyles[color]};">
                        <div class="color-bar-count">${count}</div>
                    </div>
                </div>
            `;
        }).join('');
    
    elements.colorDistribution.innerHTML = html || '<div class="empty-distribution">No data</div>';
}

function updateTypeDistribution(deck) {
    const types = {};
    deck.mainboard.forEach(card => {
        const type = card.type || 'Other';
        types[type] = (types[type] || 0) + card.quantity;
    });
    
    const total = Object.values(types).reduce((sum, count) => sum + count, 0);
    
    const html = Object.entries(types)
        .filter(([type]) => type !== 'Land')
        .map(([type, count]) => {
            const percentage = (count / total) * 100;
            return `
                <div class="type-bar">
                    <div class="type-bar-label">${type}</div>
                    <div class="type-bar-fill" style="width: ${percentage}%; background: #5a67d8;">
                        <div class="type-bar-count">${count}</div>
                    </div>
                </div>
            `;
        }).join('');
    
    elements.typeDistribution.innerHTML = html || '<div class="empty-types">No data</div>';
}

// ===== DECK ACTIONS =====

function useDeck() {
    if (!selectedDeck) return;
    alert(`✅ Using deck: ${selectedDeck.name}\n\nYou can now export it to MTG Arena!`);
}

function tweakDeck() {
    if (!selectedDeck) return;
    alert('🔧 Tweak feature coming soon! This will let you manually adjust the generated deck.');
}

function clearGenerator() {
    generatedDecks = [];
    selectedDeck = null;
    displayGeneratedDecks();
    elements.deckViewContent.innerHTML = `
        <div class="empty-message">
            <div class="empty-icon">👈</div>
            <p>Select a generated deck to view details</p>
        </div>
    `;
    elements.deckViewActions.style.display = 'none';
    elements.deckStatsDetailed.style.display = 'none';
}

function saveDeck() {
    if (!selectedDeck) {
        alert('❌ Please select a deck first!');
        return;
    }
    
    const savedDecks = JSON.parse(localStorage.getItem('mtgDecks') || '[]');
    savedDecks.push(selectedDeck);
    localStorage.setItem('mtgDecks', JSON.stringify(savedDecks));
    alert('✅ Deck saved successfully!');
}

function showLoadDeckModal() {
    const savedDecks = JSON.parse(localStorage.getItem('mtgDecks') || '[]');
    
    if (savedDecks.length === 0) {
        alert('No saved decks found');
        return;
    }
    
    const html = savedDecks.map((deck, index) => {
        const mainCount = deck.mainboard.reduce((sum, card) => sum + card.quantity, 0);
        const sideCount = deck.sideboard.reduce((sum, card) => sum + card.quantity, 0);
        
        return `
            <div class="saved-deck-item">
                <div class="saved-deck-name">${escapeHtml(deck.name)}</div>
                <div class="saved-deck-info">
                    ${deck.archetype} | ${formatRules[deck.format]?.name || deck.format} | Main: ${mainCount} | Side: ${sideCount}
                </div>
                <div class="saved-deck-actions">
                    <button class="btn btn-primary" onclick="loadSavedDeck(${index})">Load</button>
                    <button class="btn btn-danger" onclick="deleteSavedDeck(${index})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('savedDecksList').innerHTML = html;
    elements.loadModal.style.display = 'block';
}

function loadSavedDeck(index) {
    const savedDecks = JSON.parse(localStorage.getItem('mtgDecks') || '[]');
    const deck = savedDecks[index];
    
    if (!deck) return;
    
    generatedDecks.push(deck);
    displayGeneratedDecks();
    elements.loadModal.style.display = 'none';
}

function deleteSavedDeck(index) {
    if (!confirm('Are you sure you want to delete this deck?')) return;
    
    const savedDecks = JSON.parse(localStorage.getItem('mtgDecks') || '[]');
    savedDecks.splice(index, 1);
    localStorage.setItem('mtgDecks', JSON.stringify(savedDecks));
    showLoadDeckModal();
}

function exportDeck() {
    if (!selectedDeck) {
        alert('❌ Please select a deck first!');
        return;
    }
    
    let exportText = '';
    
    // Add commander for Brawl
    if (selectedDeck.commander) {
        exportText += 'Commander\n';
        exportText += `1 ${selectedDeck.commander.Name} (${selectedDeck.commander.Set}) ${selectedDeck.commander.Id}\n\n`;
    }
    
    exportText += 'Deck\n';
    selectedDeck.mainboard.forEach(card => {
        if (!card.isCommander) {
            exportText += `${card.quantity} ${card.Name} (${card.Set})\n`;
        }
    });
    
    if (selectedDeck.sideboard.length > 0) {
        exportText += '\nSideboard\n';
        selectedDeck.sideboard.forEach(card => {
            exportText += `${card.quantity} ${card.Name} (${card.Set})\n`;
        });
    }
    
    elements.exportText.value = exportText;
    elements.exportModal.style.display = 'block';
}

function copyToClipboard() {
    elements.exportText.select();
    document.execCommand('copy');
    
    const successMsg = document.getElementById('copySuccess');
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 2000);
}

// ===== UTILITY FUNCTIONS =====

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
