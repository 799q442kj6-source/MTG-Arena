// MTG Arena Deck Builder
// State management
let cardCollection = [];
let filteredCards = [];
let mainDeck = [];
let sideboard = [];
let currentTab = 'mainboard';

// Basic lands (always available)
const basicLands = [
    { Id: 'BASIC_PLAINS', Name: 'Plains', Set: 'BASIC', Color: 'White', Rarity: 'Common', Count: 999, PrintCount: 999 },
    { Id: 'BASIC_ISLAND', Name: 'Island', Set: 'BASIC', Color: 'Blue', Rarity: 'Common', Count: 999, PrintCount: 999 },
    { Id: 'BASIC_SWAMP', Name: 'Swamp', Set: 'BASIC', Color: 'Black', Rarity: 'Common', Count: 999, PrintCount: 999 },
    { Id: 'BASIC_MOUNTAIN', Name: 'Mountain', Set: 'BASIC', Color: 'Red', Rarity: 'Common', Count: 999, PrintCount: 999 },
    { Id: 'BASIC_FOREST', Name: 'Forest', Set: 'BASIC', Color: 'Green', Rarity: 'Common', Count: 999, PrintCount: 999 }
];

// DOM Elements
const elements = {
    csvUpload: document.getElementById('csvUpload'),
    cardSearch: document.getElementById('cardSearch'),
    searchResults: document.getElementById('searchResults'),
    collectionStatus: document.getElementById('collectionStatus'),
    deckList: document.getElementById('deckList'),
    sideboardList: document.getElementById('sideboardList'),
    deckName: document.getElementById('deckName'),
    deckFormat: document.getElementById('deckFormat'),
    cardCount: document.getElementById('cardCount'),
    sideboardCount: document.getElementById('sideboardCount'),
    totalCards: document.getElementById('totalCards'),
    avgCMC: document.getElementById('avgCMC'),
    manaCurve: document.getElementById('manaCurve'),
    colorDistribution: document.getElementById('colorDistribution'),
    typeDistribution: document.getElementById('typeDistribution'),
    newDeckBtn: document.getElementById('newDeckBtn'),
    saveDeckBtn: document.getElementById('saveDeckBtn'),
    loadDeckBtn: document.getElementById('loadDeckBtn'),
    exportDeckBtn: document.getElementById('exportDeckBtn'),
    exportModal: document.getElementById('exportModal'),
    loadModal: document.getElementById('loadModal'),
    exportText: document.getElementById('exportText'),
    copyExportBtn: document.getElementById('copyExportBtn'),
    clearFilters: document.getElementById('clearFilters'),
    colorCheckboxes: document.querySelectorAll('.color-checkbox'),
    rarityFilter: document.getElementById('rarityFilter'),
    formatFilter: document.getElementById('formatFilter'),
    ownedOnlyCheckbox: document.getElementById('ownedOnlyCheckbox')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadBasicLands();
});

function initializeEventListeners() {
    // File upload
    elements.csvUpload.addEventListener('change', handleFileUpload);
    
    // Search and filters
    elements.cardSearch.addEventListener('input', debounce(filterAndDisplayCards, 300));
    elements.colorCheckboxes.forEach(cb => cb.addEventListener('change', filterAndDisplayCards));
    elements.rarityFilter.addEventListener('change', filterAndDisplayCards);
    elements.formatFilter.addEventListener('change', filterAndDisplayCards);
    elements.ownedOnlyCheckbox.addEventListener('change', filterAndDisplayCards);
    elements.clearFilters.addEventListener('click', clearFilters);
    
    // Deck management
    elements.newDeckBtn.addEventListener('click', newDeck);
    elements.saveDeckBtn.addEventListener('click', saveDeck);
    elements.loadDeckBtn.addEventListener('click', showLoadDeckModal);
    elements.exportDeckBtn.addEventListener('click', exportDeck);
    elements.copyExportBtn.addEventListener('click', copyToClipboard);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            elements.exportModal.style.display = 'none';
            elements.loadModal.style.display = 'none';
        });
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === elements.exportModal) {
            elements.exportModal.style.display = 'none';
        }
        if (e.target === elements.loadModal) {
            elements.loadModal.style.display = 'none';
        }
    });
}

function loadBasicLands() {
    cardCollection = [...basicLands];
    filteredCards = [...basicLands];
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
    
    cardCollection = [...basicLands]; // Start with basic lands
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        if (values.length < headers.length) continue;
        
        const card = {};
        headers.forEach((header, index) => {
            card[header] = values[index] ? values[index].replace(/"/g, '') : '';
        });
        
        // Convert Count to number
        card.Count = parseInt(card.Count) || 0;
        card.PrintCount = parseInt(card.PrintCount) || 0;
        
        // Only add cards we own (Count > 0) or all cards if user wants
        if (card.Count > 0 || !elements.ownedOnlyCheckbox.checked) {
            cardCollection.push(card);
        }
    }
    
    updateCollectionStatus();
    filterAndDisplayCards();
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
    const ownedCards = cardCollection.filter(c => c.Count > 0 && !c.Id.startsWith('BASIC_')).length;
    elements.collectionStatus.innerHTML = `<span>${ownedCards} cards loaded</span>`;
}

// Filtering
function filterAndDisplayCards() {
    const searchTerm = elements.cardSearch.value.toLowerCase();
    const selectedColors = Array.from(elements.colorCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    const selectedRarity = elements.rarityFilter.value;
    const ownedOnly = elements.ownedOnlyCheckbox.checked;
    
    filteredCards = cardCollection.filter(card => {
        // Search term
        if (searchTerm && !card.Name.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Color filter
        if (selectedColors.length > 0) {
            if (!selectedColors.includes(card.Color)) {
                return false;
            }
        }
        
        // Rarity filter
        if (selectedRarity && card.Rarity !== selectedRarity) {
            return false;
        }
        
        // Owned only filter
        if (ownedOnly && card.Count <= 0 && !card.Id.startsWith('BASIC_')) {
            return false;
        }
        
        return true;
    });
    
    displaySearchResults();
}

function displaySearchResults() {
    if (filteredCards.length === 0) {
        elements.searchResults.innerHTML = '<div class="loading-message">No cards found</div>';
        return;
    }
    
    // Sort by name
    filteredCards.sort((a, b) => a.Name.localeCompare(b.Name));
    
    const html = filteredCards.map(card => {
        const available = getAvailableCount(card);
        const availableText = card.Id.startsWith('BASIC_') ? '∞' : available;
        
        return `
            <div class="card-item" onclick="addCardToDeck('${escapeHtml(card.Id)}')">
                <div class="card-item-header">
                    <span class="card-item-name">${escapeHtml(card.Name)}</span>
                    <span class="card-item-count">Available: ${availableText}</span>
                </div>
                <div class="card-item-details">
                    <span class="card-item-set">${escapeHtml(card.Set)}</span>
                    <span class="card-item-rarity ${escapeHtml(card.Rarity)}">${escapeHtml(card.Rarity)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    elements.searchResults.innerHTML = html;
}

function clearFilters() {
    elements.cardSearch.value = '';
    elements.colorCheckboxes.forEach(cb => cb.checked = false);
    elements.rarityFilter.value = '';
    elements.formatFilter.value = 'all';
    elements.ownedOnlyCheckbox.checked = true;
    filterAndDisplayCards();
}

// Deck Management
function addCardToDeck(cardId) {
    const card = cardCollection.find(c => c.Id === cardId);
    if (!card) return;
    
    const deck = currentTab === 'mainboard' ? mainDeck : sideboard;
    const existingCard = deck.find(c => c.Id === cardId);
    
    // Check availability
    const available = getAvailableCount(card);
    const currentInDeck = existingCard ? existingCard.quantity : 0;
    
    // Check 4-card limit (except basic lands)
    if (!card.Id.startsWith('BASIC_') && currentInDeck >= 4) {
        alert('Maximum 4 copies of non-basic lands allowed in deck');
        return;
    }
    
    if (available <= 0 && !card.Id.startsWith('BASIC_')) {
        alert('No more copies available in your collection');
        return;
    }
    
    if (existingCard) {
        existingCard.quantity++;
    } else {
        deck.push({ ...card, quantity: 1 });
    }
    
    updateDeckDisplay();
    updateStats();
}

function removeCardFromDeck(cardId, fromSideboard = false) {
    const deck = fromSideboard ? sideboard : mainDeck;
    const cardIndex = deck.findIndex(c => c.Id === cardId);
    
    if (cardIndex === -1) return;
    
    deck[cardIndex].quantity--;
    
    if (deck[cardIndex].quantity <= 0) {
        deck.splice(cardIndex, 1);
    }
    
    updateDeckDisplay();
    updateStats();
}

function getAvailableCount(card) {
    if (card.Id.startsWith('BASIC_')) return 999;
    
    const inMainDeck = mainDeck.find(c => c.Id === card.Id)?.quantity || 0;
    const inSideboard = sideboard.find(c => c.Id === card.Id)?.quantity || 0;
    
    return card.Count - inMainDeck - inSideboard;
}

function updateDeckDisplay() {
    updateDeckList(mainDeck, elements.deckList, false);
    updateDeckList(sideboard, elements.sideboardList, true);
    
    const mainCount = mainDeck.reduce((sum, card) => sum + card.quantity, 0);
    const sideCount = sideboard.reduce((sum, card) => sum + card.quantity, 0);
    
    elements.cardCount.textContent = mainCount;
    elements.sideboardCount.textContent = sideCount;
    elements.totalCards.textContent = mainCount;
}

function updateDeckList(deck, container, isSideboard) {
    if (deck.length === 0) {
        container.innerHTML = '<div class="empty-message">Add cards from the search panel</div>';
        return;
    }
    
    // Sort by name
    deck.sort((a, b) => a.Name.localeCompare(b.Name));
    
    const html = deck.map(card => `
        <div class="deck-card-item">
            <div class="deck-card-info">
                <span class="deck-card-quantity">${card.quantity}</span>
                <span class="deck-card-name">${escapeHtml(card.Name)}</span>
                <span class="deck-card-set">(${escapeHtml(card.Set)})</span>
            </div>
            <div class="deck-card-actions">
                <button class="deck-card-btn add" onclick="addCardToDeck('${escapeHtml(card.Id)}')">+</button>
                <button class="deck-card-btn remove" onclick="removeCardFromDeck('${escapeHtml(card.Id)}', ${isSideboard})">−</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tab);
    });
}

// Statistics
function updateStats() {
    const totalCards = mainDeck.reduce((sum, card) => sum + card.quantity, 0);
    elements.totalCards.textContent = totalCards;
    
    // Calculate average CMC (simplified - assumes cards have CMC in their data)
    // For now, using a placeholder
    elements.avgCMC.textContent = '0.0';
    
    updateManaCurve();
    updateColorDistribution();
    updateTypeDistribution();
}

function updateManaCurve() {
    const curve = Array(8).fill(0); // 0-7+
    
    // Simplified: just distribute randomly for demo
    // In a real app, you'd parse mana costs from card data
    mainDeck.forEach(card => {
        const cmc = Math.min(7, Math.floor(Math.random() * 8));
        curve[cmc] += card.quantity;
    });
    
    const maxCount = Math.max(...curve, 1);
    
    if (maxCount === 0) {
        elements.manaCurve.innerHTML = '<div class="empty-curve">No cards in deck</div>';
        return;
    }
    
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

function updateColorDistribution() {
    const colors = { White: 0, Blue: 0, Black: 0, Red: 0, Green: 0, Colorless: 0 };
    
    mainDeck.forEach(card => {
        if (colors.hasOwnProperty(card.Color)) {
            colors[card.Color] += card.quantity;
        }
    });
    
    const total = Object.values(colors).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
        elements.colorDistribution.innerHTML = '<div class="empty-distribution">No cards in deck</div>';
        return;
    }
    
    const colorStyles = {
        White: '#f8f8f8',
        Blue: '#0e68ab',
        Black: '#150b00',
        Red: '#d3202a',
        Green: '#00733e',
        Colorless: '#ccc'
    };
    
    const html = Object.entries(colors)
        .filter(([_, count]) => count > 0)
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

function updateTypeDistribution() {
    // Simplified type detection based on card names
    const types = { Creature: 0, Instant: 0, Sorcery: 0, Enchantment: 0, Artifact: 0, Land: 0, Other: 0 };
    
    mainDeck.forEach(card => {
        const name = card.Name.toLowerCase();
        if (card.Id.startsWith('BASIC_') || name.includes('land')) {
            types.Land += card.quantity;
        } else {
            types.Other += card.quantity;
        }
    });
    
    const total = Object.values(types).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
        elements.typeDistribution.innerHTML = '<div class="empty-types">No cards in deck</div>';
        return;
    }
    
    const html = Object.entries(types)
        .filter(([_, count]) => count > 0)
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
    
    elements.typeDistribution.innerHTML = html;
}

// Deck Persistence
function newDeck() {
    if (mainDeck.length > 0 || sideboard.length > 0) {
        if (!confirm('Are you sure you want to start a new deck? Current deck will be lost if not saved.')) {
            return;
        }
    }
    
    mainDeck = [];
    sideboard = [];
    elements.deckName.value = 'My Deck';
    updateDeckDisplay();
    updateStats();
}

function saveDeck() {
    const deckData = {
        name: elements.deckName.value,
        format: elements.deckFormat.value,
        mainboard: mainDeck,
        sideboard: sideboard,
        savedAt: new Date().toISOString()
    };
    
    const savedDecks = JSON.parse(localStorage.getItem('mtgDecks') || '[]');
    savedDecks.push(deckData);
    localStorage.setItem('mtgDecks', JSON.stringify(savedDecks));
    
    alert('Deck saved successfully!');
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
                    Format: ${deck.format} | Main: ${mainCount} | Side: ${sideCount}
                </div>
                <div class="saved-deck-actions">
                    <button class="btn btn-primary" onclick="loadDeck(${index})">Load</button>
                    <button class="btn btn-danger" onclick="deleteDeck(${index})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('savedDecksList').innerHTML = html;
    elements.loadModal.style.display = 'block';
}

function loadDeck(index) {
    const savedDecks = JSON.parse(localStorage.getItem('mtgDecks') || '[]');
    const deck = savedDecks[index];
    
    if (!deck) return;
    
    mainDeck = deck.mainboard;
    sideboard = deck.sideboard;
    elements.deckName.value = deck.name;
    elements.deckFormat.value = deck.format;
    
    updateDeckDisplay();
    updateStats();
    elements.loadModal.style.display = 'none';
}

function deleteDeck(index) {
    if (!confirm('Are you sure you want to delete this deck?')) return;
    
    const savedDecks = JSON.parse(localStorage.getItem('mtgDecks') || '[]');
    savedDecks.splice(index, 1);
    localStorage.setItem('mtgDecks', JSON.stringify(savedDecks));
    
    showLoadDeckModal();
}

function exportDeck() {
    if (mainDeck.length === 0) {
        alert('Deck is empty!');
        return;
    }
    
    let exportText = '';
    
    // Mainboard
    exportText += 'Deck\n';
    mainDeck.forEach(card => {
        exportText += `${card.quantity} ${card.Name} (${card.Set})\n`;
    });
    
    // Sideboard
    if (sideboard.length > 0) {
        exportText += '\nSideboard\n';
        sideboard.forEach(card => {
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

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
