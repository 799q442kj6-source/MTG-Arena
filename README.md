# 🤖 AI MTG Arena Deck Generator

An intelligent, AI-powered deck generator for Magic: The Gathering Arena that automatically creates complete, playable decks from your personal card collection.

## ✨ What Makes This Special?

**This is NOT a manual deck builder** - it's an AI that builds decks FOR you!

- 🧙‍♂️ **AI-Powered Generation**: Upload your collection, click a button, get complete decks
- 🎲 **Multiple Deck Options**: Generates 5+ different decks at once
- 🎯 **Smart Archetype System**: Aggro, Control, Midrange, Combo, Tempo, and Ramp
- 📊 **Intelligent Scoring**: Each deck gets an AI quality score
- 🎨 **Auto Color Selection**: AI picks best color combinations from your collection
- ⚡ **Instant Results**: Complete decks in seconds

## 🚀 How It Works

### 1. Load Your Collection
```
Click "📁 Load Collection CSV" → Select your file → Done!
```

The AI analyzes your card collection and determines what decks are possible.

### 2. Choose Your Preferences (or let AI decide!)

**Archetype:**
- 🎲 **Surprise Me!** - AI picks randomly
- ⚡ **Aggro** - Fast & aggressive (low mana curve)
- ⚔️ **Midrange** - Balanced and flexible
- 🛡️ **Control** - Defensive with big finishers
- 💥 **Combo** - Synergy-focused strategies
- ⏱️ **Tempo** - Efficient and controlling
- 🌳 **Ramp** - Big mana, big spells

**Color Preference:**
- **Auto** - AI chooses best colors from your collection
- **Mono** - Single color
- **Dual** - Two colors
- **Multi** - Three or more colors

**Format:**
- Standard, Historic, Explorer, Alchemy, Commander, Brawl

**Rarity Budget:**
- **Budget** - Commons & Uncommons only
- **Mixed** - Mix of all rarities
- **Premium** - Use all available cards

**Options:**
- Include Sideboard (for 60-card formats)
- Number of decks to generate (1-10)

### 3. Generate Decks!
```
Click "✨ Generate Decks!"
```

The AI will:
- Analyze your collection
- Determine best color combinations
- Select appropriate archetypes
- Build complete mana bases
- Choose synergistic cards
- Create 60-card decks (or 100 for Commander)
- Generate sideboards
- Score each deck for quality

### 4. Review & Select

Browse generated decks in the center panel. Each deck shows:
- **Deck Name** - Based on colors and archetype
- **Archetype Badge** - Strategy type
- **Color Indicators** - Visual color dots
- **Card Counts** - Mainboard and sideboard
- **AI Score** - Quality rating (0-100)
- **Description** - Strategy overview

### 5. Export to Arena

1. Click on a deck to view details
2. Click "✓ Use This Deck"
3. Click "📤 Export to Arena"
4. Copy the decklist
5. Paste in MTG Arena (Decks → Import)

## 🎴 Archetype Guide

### ⚡ Aggro
- **Strategy**: Win fast with early pressure
- **Creatures**: 50% of deck
- **Avg CMC**: 2.5
- **Lands**: 22 (60-card) / 36 (Commander)
- **Best For**: Quick games, aggressive playstyle

### ⚔️ Midrange
- **Strategy**: Balanced threats and answers
- **Creatures**: 40% of deck
- **Avg CMC**: 3.5
- **Lands**: 24 (60-card) / 38 (Commander)
- **Best For**: Flexible, adaptable gameplay

### 🛡️ Control
- **Strategy**: Control board, win late
- **Creatures**: 20% of deck
- **Spells**: 50% of deck
- **Avg CMC**: 4.0
- **Lands**: 26 (60-card) / 40 (Commander)
- **Best For**: Patient, reactive players

### 💥 Combo
- **Strategy**: Synergistic card combinations
- **Creatures**: 30% of deck
- **Spells**: 45% of deck
- **Avg CMC**: 3.0
- **Lands**: 23 (60-card) / 37 (Commander)
- **Best For**: Creative, puzzle-solving players

### ⏱️ Tempo
- **Strategy**: Efficient plays controlling pace
- **Creatures**: 35% of deck
- **Spells**: 40% of deck
- **Avg CMC**: 2.8
- **Lands**: 23 (60-card) / 37 (Commander)
- **Best For**: Tactical, efficient gameplay

### 🌳 Ramp
- **Strategy**: Accelerate mana, cast big spells
- **Creatures**: 30% of deck
- **Spells**: 40% of deck (including ramp)
- **Avg CMC**: 4.5
- **Lands**: 26 (60-card) / 40 (Commander)
- **Best For**: Big spell enthusiasts

## 📊 AI Intelligence Features

### Collection Analysis
- **Color Weighting**: Prioritizes colors you have most cards in
- **Rarity Distribution**: Respects your budget preferences
- **Card Availability**: Only uses cards you own
- **Basic Lands**: Always available (unlimited)

### Smart Deck Building
- **Mana Curve**: Distributes costs according to archetype
- **Land Calculation**: Optimal land count per format
- **Synergy Detection**: Groups cards by strategy
- **4-Card Limit**: Respects deck building rules
- **Format Compliance**: Builds legal decks for chosen format

### Deck Scoring Algorithm
Factors considered:
- ✅ Deck completeness (60+ cards)
- ✅ Color consistency (fewer colors = higher score)
- ✅ Card variety (more unique cards = better)
- ✅ Mana curve smoothness
- ✅ Archetype adherence

Scores range from 0-100, with 80+ being excellent.

## 🎨 User Interface

### Generator Panel (Left)
- Collection status indicator
- Archetype selector with emoji icons
- Color preference options
- Format selector
- Rarity budget controls
- Generation options
- Generate button with loading animation

### Deck List Panel (Center)
- Generated deck cards
- Deck name and archetype
- Color indicators
- Card counts
- AI score badges
- Deck descriptions
- Click to select

### Deck Details Panel (Right)
- Full deck list (mainboard + sideboard)
- Use/Tweak deck buttons
- Detailed statistics:
  - Total cards
  - Average CMC
  - Mana curve chart
  - Color distribution
  - Type breakdown

## 💾 Deck Management

### Save Decks
- Click "💾 Save Deck" to store locally
- Saved in browser localStorage
- No account needed

### Load Decks
- Click "📂 Load Deck" to view saved
- Load any previously saved deck
- Delete unwanted decks

### Export to Arena
- Proper MTG Arena format
- Includes set codes
- Mainboard and sideboard sections
- One-click copy to clipboard

## 🔧 CSV Format

Your collection CSV should have these columns:
```csv
Id,Name,Set,Color,Rarity,Count,PrintCount
```

Example:
```csv
9135,"Mind Stone",HA1,Colorless,Common,1,1
10307,"Mana Leak",AA2,Blue,Common,2,2
12551,"Grim Monolith",ULG,Colorless,Rare,1,1
```

**Required Fields:**
- `Name` - Card name
- `Set` - Set code
- `Color` - White, Blue, Black, Red, Green, or Colorless
- `Rarity` - Common, Uncommon, Rare, or Mythic
- `Count` - How many you own (must be > 0)

## 🎯 Tips for Best Results

1. **Larger Collection = Better Decks**
   - More cards = more deck options
   - Try to have at least 100+ cards

2. **Use "Surprise Me!"**
   - Great for discovering new strategies
   - AI picks archetype that fits your collection

3. **Generate Multiple Decks**
   - Set to 5-10 decks for variety
   - Compare different options
   - Pick the highest-scored deck

4. **Try Different Parameters**
   - Experiment with color preferences
   - Test budget vs premium builds
   - Compare archetypes

5. **Check AI Scores**
   - 90-100: Excellent, competitive deck
   - 80-89: Very good, solid strategy
   - 70-79: Good, playable deck
   - Below 70: Needs more cards or adjustments

## 🚫 What This ISN'T

This is **NOT** a manual deck builder where you:
- ❌ Search for individual cards
- ❌ Add cards one by one
- ❌ Build mana base yourself
- ❌ Balance the deck manually

This **IS** an AI that:
- ✅ Analyzes your collection
- ✅ Generates complete decks instantly
- ✅ Optimizes for archetype and format
- ✅ Gives you multiple options to choose from

## 🛠️ Technical Details

### Built With
- Pure HTML5, CSS3, JavaScript (ES6+)
- No external dependencies or frameworks
- Client-side only (no server needed)
- LocalStorage for persistence

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6+ support

### Performance
- Analyzes collections of 1000+ cards instantly
- Generates 10 decks in under 2 seconds
- Responsive design for all screen sizes

## 📈 Future Enhancements

Potential features for future versions:
- 🔮 Machine learning for better card selection
- 📸 Scryfall API integration for card images
- 🎲 Meta deck analysis
- 🔄 Deck evolution and refinement
- 📊 Win rate tracking
- 🤝 Deck sharing with friends
- 🎯 Budget optimization
- 🧪 Archetype mixing
- 💎 Rare/Mythic prioritization
- 🎨 Custom color identities

## 🎮 Example Usage

```
1. Upload collection.csv (1,200 cards)
2. Select "Midrange" archetype
3. Choose "Auto" colors
4. Set format to "Historic"
5. Click "Generate Decks!"
6. Result: 5 complete decks in 2 seconds
   - RG Midrange (Score: 92)
   - UB Control (Score: 88)
   - W Aggro (Score: 85)
   - UR Tempo (Score: 83)
   - GW Midrange (Score: 80)
7. Select RG Midrange
8. Export to Arena
9. Start playing!
```

## ❓ FAQ

**Q: Do I need an account?**  
A: No! Everything runs in your browser.

**Q: Is my collection data safe?**  
A: Yes! CSV is only processed locally, never uploaded.

**Q: Can I edit generated decks?**  
A: Tweak feature coming soon! For now, use as-is or regenerate.

**Q: How accurate are the AI scores?**  
A: Scores consider deck completeness, consistency, and archetype fit. 80+ means competitive.

**Q: What if I don't have enough cards?**  
A: AI will do its best, but scores may be lower. Larger collections = better decks.

**Q: Can I save unlimited decks?**  
A: Yes! Limited only by browser localStorage (usually 5-10MB).

**Q: Does it work offline?**  
A: Yes, after first load! Pure client-side application.

## 📄 License

Personal project for MTG Arena players. MTG and MTG Arena are trademarks of Wizards of the Coast.

---

**Ready to let AI build your decks? Upload your collection and let the magic happen! ✨🎴**
