#!/bin/bash

# Script de test d'accessibilité pour WildCards
# Ce script lance une série de tests automatisés pour vérifier la conformité aux normes d'accessibilité

echo "🚀 Début des tests d'accessibilité pour WildCards"
echo "================================================"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer pour continuer."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer pour continuer."
    exit 1
fi

echo "✅ Node.js et npm détectés"

# Installer les dépendances de test si nécessaire
echo "📦 Installation des outils de test d'accessibilité..."

# Installer axe-core CLI globalement si pas déjà installé
if ! command -v axe &> /dev/null; then
    echo "Installation de axe-core..."
    npm install -g @axe-core/cli
fi

# Installer html-validate si pas déjà installé
if ! command -v html-validate &> /dev/null; then
    echo "Installation de html-validate..."
    npm install -g html-validate
fi

echo "✅ Outils installés"

# Test 1: Validation HTML
echo ""
echo "🔍 Test 1: Validation HTML W3C"
echo "--------------------------------"

if command -v html-validate &> /dev/null; then
    html-validate index.html
    if [ $? -eq 0 ]; then
        echo "✅ HTML valide"
    else
        echo "❌ Erreurs de validation HTML détectées"
    fi
else
    echo "⚠️  html-validate non disponible, validation HTML ignorée"
fi

# Test 2: Tests axe-core (nécessite un serveur local)
echo ""
echo "🔍 Test 2: Tests d'accessibilité automatisés (axe-core)"
echo "--------------------------------------------------------"

# Démarrer un serveur HTTP simple en arrière-plan
if command -v python3 &> /dev/null; then
    echo "Démarrage du serveur de test sur le port 8080..."
    python3 -m http.server 8080 &
    SERVER_PID=$!
    sleep 2
    
    # Tester avec axe-core
    if command -v axe &> /dev/null; then
        echo "Exécution des tests axe-core..."
        axe http://localhost:8080 --timeout 10000
        if [ $? -eq 0 ]; then
            echo "✅ Tests axe-core réussis"
        else
            echo "❌ Violations d'accessibilité détectées par axe-core"
        fi
    else
        echo "⚠️  axe-core non disponible"
    fi
    
    # Arrêter le serveur
    kill $SERVER_PID 2>/dev/null
    
elif command -v python &> /dev/null; then
    echo "Démarrage du serveur de test sur le port 8080..."
    python -m SimpleHTTPServer 8080 &
    SERVER_PID=$!
    sleep 2
    
    # Tester avec axe-core
    if command -v axe &> /dev/null; then
        echo "Exécution des tests axe-core..."
        axe http://localhost:8080 --timeout 10000
        if [ $? -eq 0 ]; then
            echo "✅ Tests axe-core réussis"
        else
            echo "❌ Violations d'accessibilité détectées par axe-core"
        fi
    else
        echo "⚠️  axe-core non disponible"
    fi
    
    # Arrêter le serveur
    kill $SERVER_PID 2>/dev/null
else
    echo "⚠️  Python non disponible, tests axe-core ignorés"
    echo "   Vous pouvez démarrer manuellement un serveur et tester avec:"
    echo "   axe http://localhost:8080"
fi

# Test 3: Vérification des points clés d'accessibilité
echo ""
echo "🔍 Test 3: Vérification manuelle des critères d'accessibilité"
echo "--------------------------------------------------------------"

echo "📋 Liste de vérification:"

# Vérifier la présence d'éléments clés
if grep -q 'aria-' index.html; then
    echo "✅ Attributs ARIA présents"
else
    echo "❌ Aucun attribut ARIA trouvé"
fi

if grep -q 'role=' index.html; then
    echo "✅ Rôles ARIA présents"
else
    echo "❌ Aucun rôle ARIA trouvé"
fi

if grep -q 'tabindex=' index.html; then
    echo "✅ Gestion du tabindex présente"
else
    echo "⚠️  Aucun tabindex trouvé (peut être normal)"
fi

if grep -q 'aria-live=' index.html; then
    echo "✅ Régions live présentes"
else
    echo "❌ Aucune région live trouvée"
fi

if grep -q 'sr-only' index.html; then
    echo "✅ Texte pour lecteurs d'écran présent"
else
    echo "❌ Aucun texte sr-only trouvé"
fi

if grep -q 'skip-link' index.html; then
    echo "✅ Liens de navigation rapide présents"
else
    echo "❌ Aucun lien de navigation rapide trouvé"
fi

# Vérifier les raccourcis clavier dans le JavaScript
if grep -q 'keydown' src/script.js; then
    echo "✅ Gestion des événements clavier présente"
else
    echo "❌ Aucune gestion clavier trouvée"
fi

if grep -q 'focus' src/script.js; then
    echo "✅ Gestion du focus présente"
else
    echo "❌ Aucune gestion du focus trouvée"
fi

# Test 4: Vérification CSS d'accessibilité
echo ""
echo "🔍 Test 4: Vérification CSS d'accessibilité"
echo "--------------------------------------------"

if grep -q 'prefers-reduced-motion' assets/css/styles.css; then
    echo "✅ Support prefers-reduced-motion présent"
else
    echo "❌ Support prefers-reduced-motion manquant"
fi

if grep -q 'focus-visible' assets/css/styles.css; then
    echo "✅ Styles focus-visible présents"
else
    echo "❌ Styles focus-visible manquants"
fi

if grep -q 'outline:' assets/css/styles.css; then
    echo "✅ Styles d'outline personnalisés présents"
else
    echo "⚠️  Aucun style d'outline personnalisé trouvé"
fi

if grep -q 'prefers-high-contrast' assets/css/styles.css; then
    echo "✅ Support contraste élevé présent"
else
    echo "⚠️  Support contraste élevé non trouvé"
fi

# Test 5: Instructions pour tests manuels
echo ""
echo "🔍 Test 5: Tests manuels recommandés"
echo "-------------------------------------"
echo "Pour compléter les tests automatisés, effectuez ces vérifications manuelles:"
echo ""
echo "🔧 Navigation au clavier:"
echo "   1. Testez Tab/Shift+Tab pour naviguer entre tous les éléments"
echo "   2. Testez les flèches haut/bas pour naviguer entre les cartes"
echo "   3. Testez Entrée/Espace pour activer les cartes"
echo "   4. Testez Échap pour fermer les modales"
echo "   5. Testez les raccourcis Ctrl+F, Ctrl+T, etc."
echo ""
echo "🔧 Lecteur d'écran:"
echo "   1. Testez avec NVDA/JAWS (Windows) ou VoiceOver (Mac)"
echo "   2. Vérifiez les annonces lors de la recherche"
echo "   3. Vérifiez les annonces lors du changement de progression"
echo "   4. Vérifiez la lecture des cartes et de leur état"
echo ""
echo "🔧 Zoom et responsive:"
echo "   1. Testez le zoom jusqu'à 200%"
echo "   2. Vérifiez l'absence de défilement horizontal"
echo "   3. Testez sur différentes tailles d'écran"
echo ""
echo "🔧 Contraste:"
echo "   1. Testez en mode sombre et clair"
echo "   2. Vérifiez la visibilité du focus"
echo "   3. Testez avec des simulateurs de daltonisme"

echo ""
echo "🎉 Tests d'accessibilité terminés!"
echo "=================================="
echo ""
echo "Pour un audit complet, utilisez également:"
echo "- Lighthouse (onglet Accessibilité)"
echo "- WAVE Web Accessibility Evaluation Tool"
echo "- axe DevTools extension"
echo "- Tests avec de vrais utilisateurs de technologies d'assistance"
echo ""
echo "📚 Consultez ACCESSIBILITY.md pour plus d'informations"
