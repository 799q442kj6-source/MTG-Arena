#!/bin/bash

echo "=== Verifying MTG Arena Card Collection Stats ==="
echo

# Total cards (excluding header)
TOTAL=$(awk 'NR > 1' "MTG Arena Card Collection.csv" | wc -l)
echo "📦 Total Cards: $TOTAL"

# Legendary cards
LEGENDARY=$(awk -F',' 'NR > 1 && $9 == "true"' "MTG Arena Card Collection.csv" | wc -l)
echo "👑 Legendary Cards: $LEGENDARY"

# Creatures
CREATURES=$(awk -F',' 'NR > 1 && $10 == "true"' "MTG Arena Card Collection.csv" | wc -l)
echo "🦖 Creatures: $CREATURES"

# Lands  
LANDS=$(awk -F',' 'NR > 1 && $11 == "true"' "MTG Arena Card Collection.csv" | wc -l)
echo "🏔️ Lands: $LANDS"

# Non-basic lands (legends = false AND lands = true)
NONBASIC=$(awk -F',' 'NR > 1 && $11 == "true" && $9 == "false"' "MTG Arena Card Collection.csv" | wc -l)
echo "🗺️ Non-Basic Lands: $NONBASIC"

# Legendary creatures/planeswalkers (commanders)
COMMANDERS=$(awk -F',' 'NR > 1 && $9 == "true" && ($10 == "true" || $16 == "true")' "MTG Arena Card Collection.csv" | wc -l)
echo "⚔️ Commanders (Legendary Creatures/PWs): $COMMANDERS"

echo
echo "What the app should show:"
echo "✅ $TOTAL cards | 👑 $COMMANDERS commanders"
