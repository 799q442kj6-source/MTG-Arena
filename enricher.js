// MTG Collection Enricher with Scryfall
const SCRYFALL_API_BASE = 'https://api.scryfall.com';
const SCRYFALL_DELAY = 100; // ms between requests (rate limit: 10 req/sec)

let enrichedCards = [];
let legendaryCount = 0;

// DOM Elements
const elements = {
    csvUpload: document.getElementById('csvUpload'),
    uploadSection: document.getElementById('uploadSection'),
    progressSection: document.getElementById('progressSection'),
    resultsSection: document.getElementById('resultsSection'),
    errorBox: document.getElementById('errorBox'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    statusText: document.getElementById('statusText'),
    totalCards: document.getElementById('totalCards'),
    legendaryCount: document.getElementById('legendaryCount'),
    downloadButton: document.getElementById('downloadButton'),
    errorMessage: document.getElementById('errorMessage')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    elements.csvUpload.addEventListener('change', handleFileUpload);
    elements.downloadButton.addEventListener('click', downloadEnrichedCSV);
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        processCSV(e.target.result);
    };
    reader.readAsText(file);
}

async function processCSV(csvText) {
    try {
        // Hide upload section, show progress
        elements.uploadSection.style.display = 'none';
        elements.progressSection.style.display = 'block';
        elements.errorBox.style.display = 'none';
        
        // Parse CSV - HANDLE MULTI-LINE FIELDS PROPERLY
        const lines = [];
        let currentLine = '';
        let inQuotes = false;
        
        for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
                currentLine += char;
            } else if (char === '\n' && !inQuotes) {
                if (currentLine.trim()) {
                    lines.push(currentLine);
                }
                currentLine = '';
            } else {
                currentLine += char;
            }
        }
        
        if (currentLine.trim()) {
            lines.push(currentLine);
        }
        
        const headers = parseCSVLine(lines[0]).map(h => h.trim());
        
        const rawCards = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = parseCSVLine(line);
            if (values.length < headers.length) continue;
            
            const card = {};
            headers.forEach((header, index) => {
                card[header] = values[index] ? values[index].replace(/^"|"$/g, '') : '';
            });
            
            card.Count = parseInt(card.Count) || 0;
            card.PrintCount = parseInt(card.PrintCount) || 0;
            
            // ONLY include cards we own!
            if (card.Count > 0) {
                rawCards.push(card);
            }
        }
        
        elements.progressText.textContent = `Found ${rawCards.length} owned cards. Starting enrichment...`;
        
        // Enrich with Scryfall
        enrichedCards = [];
        legendaryCount = 0;
        
        for (let i = 0; i < rawCards.length; i++) {
            const card = rawCards[i];
            
            // Update progress
            const progress = ((i + 1) / rawCards.length * 100).toFixed(1);
            elements.progressBar.style.width = `${progress}%`;
            elements.progressBar.textContent = `${progress}%`;
            elements.progressText.textContent = `Enriching: ${i + 1} / ${rawCards.length}`;
            elements.statusText.textContent = `Fetching: ${card.Name}...`;
            
            // Enrich card
            const enrichedCard = await enrichCardWithScryfall(card);
            enrichedCards.push(enrichedCard);
            
            // Count legendaries
            if (enrichedCard.isLegendary && (enrichedCard.isCreature || enrichedCard.isPlaneswalker)) {
                legendaryCount++;
            }
            
            // Rate limit
            await sleep(SCRYFALL_DELAY);
        }
        
        // Show results
        showResults();
        
    } catch (error) {
        showError(error.message);
    }
}

async function enrichCardWithScryfall(card) {
    try {
        // Try exact match with set
        let response = await fetch(`${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(card.Name)}&set=${card.Set}`);
        
        if (!response.ok) {
            // Fallback: try without set
            response = await fetch(`${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(card.Name)}`);
            
            if (!response.ok) {
                // If still not found, return original card with basic enrichment
                return {
                    ...card,
                    type: 'Unknown',
                    isLegendary: false,
                    isCreature: false,
                    isLand: false,
                    cmc: 0,
                    colors: [],
                    colorIdentity: [],
                    manaCost: '',
                    oracleText: '',
                    power: '',
                    toughness: ''
                };
            }
        }
        
        const data = await response.json();
        
        // Extract all useful data
        return {
            // Original CSV data
            Id: card.Id,
            Name: card.Name,
            Set: card.Set,
            Color: card.Color,
            Rarity: card.Rarity,
            Count: card.Count,
            PrintCount: card.PrintCount,
            
            // Scryfall enrichment
            type: data.type_line || 'Unknown',
            isLegendary: data.type_line?.includes('Legendary') || false,
            isCreature: data.type_line?.includes('Creature') || false,
            isLand: data.type_line?.includes('Land') || false,
            isInstant: data.type_line?.includes('Instant') || false,
            isSorcery: data.type_line?.includes('Sorcery') || false,
            isArtifact: data.type_line?.includes('Artifact') || false,
            isEnchantment: data.type_line?.includes('Enchantment') || false,
            isPlaneswalker: data.type_line?.includes('Planeswalker') || false,
            manaCost: data.mana_cost || '',
            cmc: data.cmc || 0,
            colors: (data.colors || []).join(','),
            colorIdentity: (data.color_identity || []).join(','),
            power: data.power || '',
            toughness: data.toughness || '',
            oracleText: data.oracle_text || '',
            scryfallId: data.id || '',
            imageUrl: data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal || ''
        };
        
    } catch (error) {
        console.error(`Error enriching ${card.Name}:`, error);
        return {
            ...card,
            type: 'Error',
            isLegendary: false,
            isCreature: false,
            cmc: 0
        };
    }
}

function showResults() {
    elements.progressSection.style.display = 'none';
    elements.resultsSection.style.display = 'block';
    
    elements.totalCards.textContent = enrichedCards.length;
    elements.legendaryCount.textContent = legendaryCount;
}

function showError(message) {
    elements.progressSection.style.display = 'none';
    elements.errorBox.style.display = 'block';
    elements.errorMessage.textContent = message;
    elements.uploadSection.style.display = 'block';
}

function downloadEnrichedCSV() {
    // Create CSV content
    const headers = [
        'Id', 'Name', 'Set', 'Color', 'Rarity', 'Count', 'PrintCount',
        'type', 'isLegendary', 'isCreature', 'isLand', 'isInstant', 'isSorcery',
        'isArtifact', 'isEnchantment', 'isPlaneswalker',
        'manaCost', 'cmc', 'colors', 'colorIdentity',
        'power', 'toughness', 'oracleText', 'scryfallId', 'imageUrl'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    enrichedCards.forEach(card => {
        const row = headers.map(header => {
            let value = card[header] !== undefined ? card[header] : '';
            
            // Escape quotes and wrap in quotes if contains comma or newline
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            
            return value;
        });
        
        csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'enriched_collection.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Utility Functions
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
