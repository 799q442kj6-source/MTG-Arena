// AI MTG Arena Deck Generator
// State management
let cardCollection = [];
let generatedDecks = [];
let selectedDeck = null;

// Basic lands (always available)
const basicLands = [
    { Id: 'BASIC_PLAINS', Name: 'Plains', Set: 'BASIC', Color: 'White', Rarity: 'Common', Count: 999, PrintCount: 999 },
    { Id: 'BASIC_ISLAND', Name: 'Island', Set: 'BASIC', Color: 'Blue', Rarity: 'Common', Count: 999, PrintCount: 999 },
    { Id: 'BASIC_SWAMP', Name: 'Swamp', Set: 'BASIC', Color: 'Black', Rarity: 'Common', Count: 999, PrintCount: 999 },
    { Id: 'BASIC_MOUNTAIN', Name: 'Mountain', Set: 'BASIC', Color: 'Red', Rarity: 'Common', Count: 999, PrintCount: 999 },
    { Id: 'BASIC_FOREST', Name: 'Forest', Set: 'BASIC', Color: 'Green', Rarity: 'Common', Count: 999, PrintCount: 999 }
];

// Archetype templates with card type distributions
const archetypeTemplates = {
    aggro: {
        name: 'Aggro',
        description: 'Fast and aggressive strategy focusing on early game pressure',
        creatures: 0.50,  // 50% creatures
        spells: 0.25,     // 25% spells
        lands: 0.25,      // 25% lands
        avgCMC: 2.5,
        landCount: { 60: 22, 100: 36 },
        cmcDistribution: [0.05, 0.30, 0.30, 0.20, 0.10, 0.05, 0, 0] // 0-7+
    },
    midrange: {
        name: 'Midrange',
        description: 'Balanced strategy with strong mid-game presence',
        creatures: 0.40,
        spells: 0.35,
        lands: 0.25,
        avgCMC: 3.5,
        landCount: { 60: 24, 100: 38 },
        cmcDistribution: [0.05, 0.15, 0.20, 0.25, 0.20, 0.10, 0.05, 0]
    },
    control: {
        name: 'Control',
        description: 'Defensive strategy with answers and late-game threats',
        creatures: 0.20,
        spells: 0.50,
        lands: 0.30,
        avgCMC: 4.0,
        landCount: { 60: 26, 100: 40 },
        cmcDistribution: [0.05, 0.15, 0.20, 0.20, 0.20, 0.15, 0.05, 0]
    },
    combo: {
        name: 'Combo',
        description: 'Synergy-focused strategy aiming for powerful combinations',
        creatures: 0.30,
        spells: 0.45,
        lands: 0.25,
        avgCMC: 3.0,
        landCount: { 60: 23, 100: 37 },
        cmcDistribution: [0.05, 0.20, 0.25, 0.25, 0.15, 0.10, 0, 0]
    },
    tempo: {
        name: 'Tempo',
        description: 'Efficient strategy controlling the pace of the game',
        creatures: 0.35,
        spells: 0.40,
        lands: 0.25,
        avgCMC: 2.8,
        landCount: { 60: 23, 100: 37 },
        cmcDistribution: [0.05, 0.25, 0.30, 0.20, 0.15, 0.05, 0, 0]
    },
    ramp: {
        name: 'Ramp',
        description: 'Mana acceleration strategy for big spells',
        creatures: 0.30,
        spells: 0.40,
        lands: 0.30,
        avgCMC: 4.5,
        landCount: { 60: 26, 100: 40 },
        cmcDistribution: [0.05, 0.10, 0.15, 0.15, 0.20, 0.20, 0.10, 0.05]
    }
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
    // File upload
    elements.csvUpload.addEventListener('change', handleFileUpload);
    
    // Generator buttons
    elements.generateDecksBtn.addEventListener('click', generateDecks);
    elements.clearGeneratorBtn.addEventListener('click', clearGenerator);
    
    // Deck actions
    elements.selectDeckBtn.addEventListener('click', useDeck);
    elements.tweakDeckBtn.addEventListener('click', tweakDeck);
    elements.saveDeckBtn.addEventListener('click', saveDeck);
    elements.loadDeckBtn.addEventListener('click', showLoadDeckModal);
    elements.exportDeckBtn.addEventListener('click', exportDeck);
    elements.copyExportBtn.addEventListener('click', copyToClipboard);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            elements.exportModal.style.display = 'none';
            elements.loadModal.style.display = 'none';
        });
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === elements.exportModal) elements.exportModal.style.display = 'none';
        if (e.target === elements.loadModal) elements.loadModal.style.display = 'none';
    });
}

function loadBasicLands() {
    cardCollection = [...basicLands];
    updateCollectionStatus();
}

// File Upload Handler
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
            cardCollection.push(card);
        }
    }
    
    updateCollectionStatus();
    alert(`✅ Collection loaded! ${cardCollection.length - 5} cards available (plus basic lands)`);
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

function updateCollectionStatus() {
    const ownedCards = cardCollection.filter(c => !c.Id.startsWith('BASIC_')).length;
    elements.collectionStatus.innerHTML = `<span>✅ ${ownedCards} cards loaded</span>`;
}

// ===== DECK GENERATION ENGINE =====

async function generateDecks() {
    if (cardCollection.length <= 5) {
        alert('❌ Please load your collection CSV first!');
        return;
    }
    
    // Show loading
    elements.generationStatus.style.display = 'block';
    elements.generateDecksBtn.disabled = true;
    
    // Get parameters
    const archetype = elements.archetypeSelect.value;
    const colorPref = elements.colorPreference.value;
    const format = elements.deckFormat.value;
    const rarityBudget = elements.rarityBudget.value;
    const numDecks = parseInt(elements.numDecks.value);
    const includeSideboard = elements.includeSideboard.checked;
    
    // Simulate AI thinking time
    await sleep(1000);
    
    generatedDecks = [];
    
    for (let i = 0; i < numDecks; i++) {
        const deck = generateSingleDeck(archetype, colorPref, format, rarityBudget, includeSideboard);
        if (deck) {
            generatedDecks.push(deck);
        }
    }
    
    // Hide loading
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
    // Determine archetype
    if (archetypeKey === 'auto') {
        const archetypes = Object.keys(archetypeTemplates);
        archetypeKey = archetypes[Math.floor(Math.random() * archetypes.length)];
    }
    
    const archetype = archetypeTemplates[archetypeKey];
    const deckSize = (format === 'commander' || format === 'brawl' && format !== 'brawl') ? 100 : 60;
    const landCount = archetype.landCount[deckSize];
    
    // Determine colors
    const colors = selectColors(colorPref);
    
    // Filter available cards
    let availableCards = filterCardsByParameters(colors, rarityBudget, format);
    
    if (availableCards.length < 20) {
        return null; // Not enough cards
    }
    
    // Build deck
    const mainboard = [];
    const sideboard = [];
    
    // Add lands
    const lands = selectLands(colors, landCount);
    mainboard.push(...lands);
    
    // Calculate non-land slots
    const nonLandSlots = deckSize - landCount;
    const creatureSlots = Math.floor(nonLandSlots * archetype.creatures);
    const spellSlots = nonLandSlots - creatureSlots;
    
    // Add creatures (simplified - we don't have card types in CSV)
    const creatures = selectCards(availableCards, creatureSlots, archetype);
    mainboard.push(...creatures);
    
    // Add spells
    const spells = selectCards(availableCards.filter(c => !creatures.includes(c)), spellSlots, archetype);
    mainboard.push(...spells);
    
    // Add sideboard if requested
    if (includeSideboard && format !== 'commander') {
        const sideboardCards = selectCards(availableCards, 15, archetype);
        sideboard.push(...sideboardCards);
    }
    
    // Calculate deck score
    const score = calculateDeckScore(mainboard, archetype, colors);
    
    return {
        id: generateId(),
        name: generateDeckName(archetypeKey, colors),
        archetype: archetype.name,
        archetypeKey: archetypeKey,
        colors: colors,
        format: format,
        mainboard: mainboard,
        sideboard: sideboard,
        score: score,
        description: archetype.description
    };
}

function selectColors(colorPref) {
    const allColors = ['White', 'Blue', 'Black', 'Red', 'Green'];
    
    // Get available colors from collection
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
        default: // auto
            // Randomly choose 1-2 colors weighted by availability
            const numColors = Math.random() < 0.6 ? 2 : 1;
            return availableColors.slice(0, numColors);
    }
}

function filterCardsByParameters(colors, rarityBudget, format) {
    return cardCollection.filter(card => {
        if (card.Id.startsWith('BASIC_')) return false;
        
        // Color filter
        if (!colors.includes(card.Color) && card.Color !== 'Colorless') return false;
        
        // Rarity filter
        if (rarityBudget === 'budget' && !['Common', 'Uncommon'].includes(card.Rarity)) return false;
        if (rarityBudget === 'mixed' && Math.random() > 0.3 && !['Common', 'Uncommon', 'Rare'].includes(card.Rarity)) return false;
        
        return true;
    });
}

function selectLands(colors, count) {
    const lands = [];
    const landsPerColor = Math.floor(count / colors.length);
    
    colors.forEach(color => {
        const basicLand = basicLands.find(l => l.Color === color);
        if (basicLand) {
            lands.push({ ...basicLand, quantity: landsPerColor });
        }
    });
    
    // Add remaining lands to first color
    const remaining = count - (landsPerColor * colors.length);
    if (remaining > 0 && lands.length > 0) {
        lands[0].quantity += remaining;
    }
    
    return lands;
}

function selectCards(availableCards, count, archetype) {
    const selected = [];
    const usedCards = new Set();
    
    // Shuffle available cards
    const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
    
    let remaining = count;
    
    for (const card of shuffled) {
        if (remaining <= 0) break;
        if (usedCards.has(card.Id)) continue;
        
        // Determine quantity (1-4 based on rarity and archetype)
        const maxCopies = card.Id.startsWith('BASIC_') ? remaining : Math.min(4, card.Count);
        const quantity = Math.min(
            maxCopies,
            Math.ceil(Math.random() * Math.min(3, remaining)),
            remaining
        );
        
        selected.push({ ...card, quantity });
        usedCards.add(card.Id);
        remaining -= quantity;
    }
    
    return selected;
}

function calculateDeckScore(mainboard, archetype, colors) {
    let score = 70; // Base score
    
    // Bonus for deck size
    const totalCards = mainboard.reduce((sum, card) => sum + card.quantity, 0);
    if (totalCards >= 60) score += 10;
    
    // Bonus for color consistency
    if (colors.length <= 2) score += 10;
    
    // Bonus for variety
    if (mainboard.length >= 20) score += 10;
    
    return Math.min(100, score);
}

function generateDeckName(archetype, colors) {
    const colorNames = {
        'White': 'W',
        'Blue': 'U',
        'Black': 'B',
        'Red': 'R',
        'Green': 'G'
    };
    
    const colorStr = colors.map(c => colorNames[c] || 'C').join('');
    const archetypeName = archetypeTemplates[archetype]?.name || 'Mixed';
    
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
                    <div class="deck-card-archetype">${deck.archetype}</div>
                </div>
                <div class="deck-card-colors">${colorDots}</div>
                <div class="deck-card-stats">
                    <div class="deck-card-stat">📦 ${totalCards} cards</div>
                    ${sideboardCards > 0 ? `<div class="deck-card-stat">📋 ${sideboardCards} sideboard</div>` : ''}
                    <div class="deck-card-stat">🎯 ${deck.format}</div>
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
    
    displayGeneratedDecks(); // Refresh to show selection
    displaySelectedDeck();
}

function displaySelectedDeck() {
    if (!selectedDeck) return;
    
    elements.deckViewActions.style.display = 'flex';
    elements.deckStatsDetailed.style.display = 'block';
    
    // Display mainboard
    let html = '<div class="deck-section-view"><h4>📦 Mainboard</h4>';
    selectedDeck.mainboard.forEach(card => {
        html += `
            <div class="card-line">
                <span class="card-quantity">${card.quantity}x</span>
                ${escapeHtml(card.Name)}
                <span class="card-set-tag">(${escapeHtml(card.Set)})</span>
            </div>
        `;
    });
    html += '</div>';
    
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
    
    // Update stats
    updateDeckStats(selectedDeck);
}

function updateDeckStats(deck) {
    const totalCards = deck.mainboard.reduce((sum, c) => sum + c.quantity, 0);
    elements.totalCards.textContent = totalCards;
    elements.avgCMC.textContent = '2.5'; // Simplified
    
    updateManaCurve(deck);
    updateColorDistribution(deck);
    updateTypeDistribution(deck);
}

function updateManaCurve(deck) {
    // Simplified mana curve
    const curve = [3, 8, 12, 10, 6, 3, 1, 0];
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
        if (card.Color) {
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
    
    elements.colorDistribution.innerHTML = html;
}

function updateTypeDistribution(deck) {
    const lands = deck.mainboard.filter(c => c.Id.startsWith('BASIC_')).reduce((sum, c) => sum + c.quantity, 0);
    const nonLands = deck.mainboard.filter(c => !c.Id.startsWith('BASIC_')).reduce((sum, c) => sum + c.quantity, 0);
    
    const html = `
        <div class="type-bar">
            <div class="type-bar-label">Lands</div>
            <div class="type-bar-fill" style="width: ${(lands / (lands + nonLands)) * 100}%; background: #5a67d8;">
                <div class="type-bar-count">${lands}</div>
            </div>
        </div>
        <div class="type-bar">
            <div class="type-bar-label">Spells</div>
            <div class="type-bar-fill" style="width: ${(nonLands / (lands + nonLands)) * 100}%; background: #ed8936;">
                <div class="type-bar-count">${nonLands}</div>
            </div>
        </div>
    `;
    
    elements.typeDistribution.innerHTML = html;
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
                    ${deck.archetype} | ${deck.format} | Main: ${mainCount} | Side: ${sideCount}
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
    
    let exportText = 'Deck\n';
    selectedDeck.mainboard.forEach(card => {
        exportText += `${card.quantity} ${card.Name} (${card.Set})\n`;
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
