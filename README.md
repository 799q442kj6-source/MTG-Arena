# MTG Arena Deck Builder

A modern, feature-rich deck builder for Magic: The Gathering Arena that uses your personal card collection from a CSV file.

## Features

### 🎴 Collection Management
- **CSV Import**: Load your card collection from CSV file
- **Owned Card Tracking**: Only build decks with cards you actually own
- **Basic Lands**: Always available (unlimited)
- **Availability Display**: See how many copies you have available

### 🔍 Advanced Search & Filtering
- **Text Search**: Find cards by name
- **Color Filtering**: Filter by W, U, B, R, G, or Colorless
- **Rarity Filter**: Common, Uncommon, Rare, Mythic
- **Format Support**: Standard, Historic, Explorer, Alchemy, Commander, Brawl
- **Owned Only Toggle**: Show all cards or only owned cards

### 🃏 Deck Building
- **Mainboard & Sideboard**: Full support for both
- **Card Limits**: Enforces 4-card limit (except basic lands)
- **Collection Tracking**: Won't let you add more copies than you own
- **Visual Organization**: Cards organized by type
- **Quick Add/Remove**: Easy buttons to manage quantities

### 📊 Statistics & Analytics
- **Mana Curve**: Visual representation of your deck's mana costs
- **Color Distribution**: See your deck's color breakdown
- **Card Type Distribution**: Track creatures, spells, lands, etc.
- **Card Count**: Real-time mainboard and sideboard counts
- **Average CMC**: Calculate average converted mana cost

### 💾 Deck Management
- **Save Decks**: Store multiple decks in browser localStorage
- **Load Decks**: Retrieve your saved decks anytime
- **Export to Arena**: Generate proper MTG Arena import format
- **Copy to Clipboard**: One-click copy for importing
- **Format Selection**: Choose deck format (Standard, Historic, etc.)

## How to Use

### 1. Load Your Collection
1. Click **"Load Collection CSV"** button
2. Select your CSV file containing your card collection
3. Your owned cards will be loaded and displayed

### CSV Format
Your CSV file should have these columns:
```
Id,Name,Set,Color,Rarity,Count,PrintCount
```

Example:
```csv
Id,Name,Set,Color,Rarity,Count,PrintCount
9135,"Mind Stone",HA1,Colorless,Common,1,1
10307,"Mana Leak",AA2,Blue,Common,2,2
12551,"Grim Monolith",ULG,Colorless,Rare,1,1
```

- **Count**: Number of copies you own (app only shows Count > 0)
- **Color**: White, Blue, Black, Red, Green, or Colorless
- **Basic Lands**: Always available regardless of CSV

### 2. Search and Filter Cards
- Type in the **search box** to find cards by name
- Use **color filters** to narrow by mana color
- Select **rarity** to filter by card rarity
- Choose **format** to see format-legal cards
- Toggle **"Show Only Owned Cards"** on/off

### 3. Build Your Deck
1. Click on a card in the search results to add it to your deck
2. Use **+ / -** buttons in the deck list to adjust quantities
3. Switch between **Mainboard** and **Sideboard** tabs
4. Watch the stats update in real-time

### 4. Save Your Deck
1. Give your deck a name in the text field
2. Select the format (Standard, Historic, etc.)
3. Click **"Save Deck"** to store it
4. Click **"Load Deck"** to retrieve saved decks

### 5. Export to MTG Arena
1. Click **"Export to Arena"** button
2. Click **"Copy to Clipboard"**
3. In MTG Arena:
   - Go to **Decks**
   - Click **Import**
   - Paste your decklist
   - Done!

## Format Rules

The app supports multiple formats:

- **Standard**: 60-card minimum, 4-copy limit
- **Historic**: 60-card minimum, 4-copy limit
- **Explorer**: 60-card minimum, 4-copy limit
- **Alchemy**: 60-card minimum, 4-copy limit
- **Commander**: 100-card singleton (1 copy per card except basic lands)
- **Brawl**: 60-card singleton (1 copy per card except basic lands)

## Technical Features

### Built With
- Pure HTML5, CSS3, JavaScript (no frameworks needed)
- Responsive design for all screen sizes
- Modern gradient UI with dark theme
- LocalStorage for deck persistence
- CSV parsing with proper quote handling

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6+ support

## Tips & Tricks

1. **Quick Building**: Double-click a card to add it quickly
2. **Collection Management**: The app tracks how many copies you're using vs. what you own
3. **Format Validation**: Choose your format first, then build to ensure legality
4. **Sideboard Strategy**: Use sideboard for best-of-3 matches
5. **Save Often**: Save multiple deck variants to compare strategies

## Keyboard Shortcuts

- **Ctrl/Cmd + F**: Focus search box (browser default)
- **Escape**: Close modals

## Known Limitations

- CMC calculation is simplified (card data doesn't include full mana cost details)
- Type detection is basic (enhanced version would need full card data)
- No online sync (decks saved locally in browser)
- Card images not included (would require Scryfall API integration)

## Future Enhancements

Potential features for future versions:
- Scryfall API integration for card images and full data
- Mana cost parsing for accurate CMC calculation
- Card legality checking per format
- Deck statistics (win rate, matchup tracking)
- Import/export to other formats (TappedOut, Moxfield, etc.)
- Deck recommendations based on collection
- Multi-deck comparison tool

## License

This is a personal project. MTG and MTG Arena are trademarks of Wizards of the Coast.

## Credits

Created as a deck building tool for MTG Arena players who want to build decks from their actual collection.

---

**Enjoy building your decks! 🎴✨**
