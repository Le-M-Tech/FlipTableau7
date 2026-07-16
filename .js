window.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('tableBody');
  const headerRow = document.getElementById('headerRow');
  const totalRow = document.getElementById('totalRow');
  const sidebar = document.getElementById('sidebar');
  
  // Boutons d'Action
  const addColBtn = document.getElementById('addColBtn');
  const addRowBtn = document.getElementById('addRowBtn');
  const newGameBtn = document.getElementById('newGameBtn');
  const saveGameBtn = document.getElementById('saveGameBtn');
  const showRankingBtn = document.getElementById('showRankingBtn');
  const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  
  // Overlays & Modals
  const victoryOverlay = document.getElementById('victoryOverlay');
  const winnerText = document.getElementById('winnerText');
  const closeVictoryBtn = document.getElementById('closeVictoryBtn');
  const rankingModal = document.getElementById('rankingModal');
  const rankingList = document.getElementById('rankingList');
  const closeRankingBtn = document.getElementById('closeRankingBtn');
  const savedGamesList = document.getElementById('savedGamesList');

  const WIN_SCORE = 200;
  let gameAlreadyWon = false; 

  // --- Gestion du Masquage de la Barre Latérale ---
  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // --- Initialisation d'une partie par défaut ---
  function initGame(names = ["Joueur 1", "Joueur 2"]) {
    headerRow.innerHTML = "";
    tableBody.innerHTML = "";
    totalRow.innerHTML = "";
    gameAlreadyWon = false;
    victoryOverlay.classList.add('hidden'); // On cache l'écran de victoire s'il était actif

    // Ajout des colonnes prénoms
    names.forEach((name, index) => addColumnToDOM(name, index, false));
    
    // Ajout de la colonne de contrôle (boutons supprimer)
    addControlColumn(); 

    // Création de 3 lignes de base pour commencer à jouer
    for(let i = 0; i < 3; i++) addRowToDOM([], false);
    
    updateTotals();
  }

  // --- Gestion dynamique du DOM (Ajout de colonnes/lignes) ---
  function addColumnToDOM(name, index, shouldFocus = false) {
    // 1. Création de l'en-tête (Nom du joueur)
    const th = document.createElement('th');
    th.innerHTML = `
      <div class="th-content">
        <input type="text" class="name-input" value="${name}" placeholder="NOM">
        <button class="btn-icon delete-col-btn" title="Supprimer le joueur">×</button>
      </div>
    `;
    
    // Insère avant la colonne de contrôle (qui aligne les suppressions à droite)
    const controlTh = document.getElementById('control-th');
    if (controlTh) {
      headerRow.insertBefore(th, controlTh);
    } else {
      headerRow.appendChild(th);
    }

    // 2. Ajout d'une cellule de score dans chaque ligne existante
    Array.from(tableBody.children).forEach(tr => {
      const td = document.createElement('td');
      td.innerHTML = `<input type="number" inputmode="numeric" class="score-input" placeholder="0">`;
      
      const controlTd = tr.lastElementChild;
      if (controlTd && controlTd.querySelector('.delete-row-btn')) {
        tr.insertBefore(td, controlTd);
      } else {
        tr.appendChild(td);
      }
    });

    // 3. Ajout de la cellule correspondante dans la ligne des totaux
    const tdTotal = document.createElement('td');
    tdTotal.className = 'total-cell';
    tdTotal.innerHTML = `0`;
    
    const controlThActive = document.getElementById('control-th');
    if (controlThActive) {
      totalRow.insertBefore(tdTotal, totalRow.lastElementChild);
    } else {
      totalRow.appendChild(tdTotal);
    }

    // Focus automatique très confortable sur le nouveau joueur ajouté
    if (shouldFocus) {
      setTimeout(() => {
        const input = th.querySelector('.name-input');
        if (input) {
          input.focus();
          input.select();
        }
      }, 50);
    }
  }

  function addControlColumn() {
    // Crée la colonne "tampon" vide à droite pour aligner les boutons "supprimer ligne"
    if (!document.getElementById('control-th')) {
      headerRow.insertAdjacentHTML('beforeend', `<th id="control-th" style="width: 40px;"></th>`);
      totalRow.insertAdjacentHTML('beforeend', `<td></td>`);
    }
  }

  function addRowToDOM(scores = [], shouldFocus = false) {
    const tr = document.createElement('tr');
    const colCount = headerRow.children.length - 1; // -1 pour exclure la colonne tampon

    for (let i = 0; i < colCount; i++) {
      const val = scores[i] !== undefined ? scores[i] : '';
      tr.insertAdjacentHTML('beforeend', `<td><input type="number" inputmode="numeric" class="score-input" value="${val}" placeholder="0"></td>`);
    }
    
    // Injection du bouton de suppression de ligne
    tr.insertAdjacentHTML('beforeend', `<td><button class="btn-icon delete-row-btn" title="Supprimer la ligne">🗑️</button></td>`);
    tableBody.appendChild(tr);

    // Focus automatique sur la première case de la nouvelle ligne
    if (shouldFocus) {
      setTimeout(() => {
        const firstInput = tr.querySelector('.score-input');
        if (firstInput) firstInput.focus();
      }, 50);
    }
  }

  // --- Algorithme de Calcul des Totaux ---
  function updateTotals() {
    const rows = Array.from(tableBody.children);
    const colCount = headerRow.children.length - 1;
    let winner = null;

    for (let i = 0; i < colCount; i++) {
      let sum = 0;
      rows.forEach(row => {
        const input = row.children[i].querySelector('input');
        if (input && input.value) {
          const val = parseFloat(input.value);
          if (!isNaN(val)) sum += val;
        }
      });

      const totalCell = totalRow.children[i];
      if (totalCell) {
        totalCell.textContent = sum;
        if (sum >= WIN_SCORE) {
          totalCell.classList.add('winner-text');
          if (!winner) {
            const nameInput = headerRow.children[i].querySelector('.name-input');
            winner = nameInput ? nameInput.value : `Joueur ${i + 1}`;
          }
        } else {
          totalCell.classList.remove('winner-text');
        }
      }
    }

    if (winner && !gameAlreadyWon) {
      triggerVictory(winner);
    }
  }

  function triggerVictory(winnerName) {
    winnerText.textContent = `${winnerName} a gagné !`;
    victoryOverlay.classList.remove('hidden');
    gameAlreadyWon = true; 
  }

  // --- Traitement du Classement Dynamique ---
  function showRanking() {
    const colCount = headerRow.children.length - 1;
    let scores = [];

    for (let i = 0; i < colCount; i++) {
      const nameInput = headerRow.children[i].querySelector('.name-input');
      const name = nameInput ? nameInput.value.trim() : `Joueur ${i + 1}`;
      const total = parseFloat(totalRow.children[i].textContent) || 0;
      scores.push({ name: name || `Joueur ${i + 1}`, total });
    }

    scores.sort((a, b) => b.total - a.total); // Tri décroissant (plus grand au plus petit)

    rankingList.innerHTML = scores.map((s, index) => 
      `<li>
        <span>${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1) + '.'} ${s.name}</span>
        <strong>${s.total} pts</strong>
      </li>`
    ).join('');

    rankingModal.classList.remove('hidden');
  }

  // --- Système de Sauvegarde Locale (LocalStorage) ---
  function saveGame() {
    const colCount = headerRow.children.length - 1;
    const names = [];
    for (let i = 0; i < colCount; i++) {
      const inputVal = headerRow.children[i].querySelector('.name-input').value.trim();
      names.push(inputVal || `Joueur ${i + 1}`);
    }

    const rowsData = [];
    Array.from(tableBody.children).forEach(tr => {
      const rowScores = [];
      for (let i = 0; i < colCount; i++) {
        const input = tr.children[i].querySelector('input');
        rowScores.push(input ? input.value : '');
      }
      rowsData.push(rowScores);
    });

    const gameData = {
      id: Date.now(),
      date: new Date().toLocaleDateString() + ' à ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      names,
      rows: rowsData
    };

    let saved = JSON.parse(localStorage.getItem('scoreGames') || '[]');
    saved.unshift(gameData); // On place la plus récente en premier
    localStorage.setItem('scoreGames', JSON.stringify(saved));
    
    alert("Partie sauvegardée localement !");
    refreshSavedGamesList();
  }

  function loadGame(gameData) {
    headerRow.innerHTML = "";
    tableBody.innerHTML = "";
    totalRow.innerHTML = "";
    gameAlreadyWon = false;
    victoryOverlay.classList.add('hidden'); // Ferme l'overlay de victoire au chargement

    gameData.names.forEach((name, index) => addColumnToDOM(name, index, false));
    addControlColumn();
    
    gameData.rows.forEach(scores => addRowToDOM(scores, false));
    updateTotals();
  }

  function refreshSavedGamesList() {
    let saved = JSON.parse(localStorage.getItem('scoreGames') || '[]');
    savedGamesList.innerHTML = '';
    
    if (saved.length === 0) {
      savedGamesList.innerHTML = '<li class="no-games">Aucune partie sauvegardée</li>';
      return;
    }
    
    saved.forEach((game, index) => {
      const li = document.createElement('li');
      li.className = 'game-item';
      li.innerHTML = `
        <span class="game-info">Partie du ${game.date} (${game.names.length} j.)</span>
        <button class="delete-game-btn" data-index="${index}" title="Supprimer la sauvegarde">×</button>
      `;
      
      li.querySelector('.game-info').addEventListener('click', () => {
        if(confirm("Charger cette partie ? (La partie non sauvegardée en cours sera perdue).")) {
          loadGame(game);
        }
      });

      li.querySelector('.delete-game-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Évite de déclencher le chargement de la partie par erreur
        if(confirm("Supprimer définitivement cette sauvegarde ?")) {
          saved.splice(index, 1);
          localStorage.setItem('scoreGames', JSON.stringify(saved));
          refreshSavedGamesList();
        }
      });

      savedGamesList.appendChild(li);
    });
  }

  // --- Délégation globale d'événements (Optimisation des performances) ---
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('score-input') || e.target.classList.contains('name-input')) {
      updateTotals();
    }
  });

  document.addEventListener('click', (e) => {
    // Bouton de suppression d'une ligne
    if (e.target.classList.contains('delete-row-btn')) {
      if (tableBody.children.length > 1) {
        e.target.closest('tr').remove();
        updateTotals();
      } else {
        alert("Il doit y avoir au moins une ligne de scores !");
      }
    }
    
    // Bouton de suppression d'un joueur
    if (e.target.classList.contains('delete-col-btn')) {
      const th = e.target.closest('th');
      const index = Array.from(headerRow.children).indexOf(th);
      
      if (headerRow.children.length > 2) { // 1 joueur minimum + colonne de contrôle
        th.remove();
        Array.from(tableBody.children).forEach(tr => tr.children[index].remove());
        totalRow.children[index].remove();
        updateTotals();
      } else {
        alert("Il doit rester au moins un joueur !");
      }
    }
  });

  // --- Écouteurs de clic directs ---
  addColBtn.addEventListener('click', () => {
    const newIndex = headerRow.children.length - 1;
    addColumnToDOM(`Joueur ${newIndex + 1}`, newIndex, true);
    updateTotals(); 
  });
  
  addRowBtn.addEventListener('click', () => addRowToDOM([], true));
  
  newGameBtn.addEventListener('click', () => {
    if(confirm("Lancer une nouvelle partie ? Tous les scores actuels seront réinitialisés.")) {
      initGame();
    }
  });
  
  saveGameBtn.addEventListener('click', saveGame);
  showRankingBtn.addEventListener('click', showRanking);
  
  closeVictoryBtn.addEventListener('click', () => victoryOverlay.classList.add('hidden'));
  closeRankingBtn.addEventListener('click', () => rankingModal.classList.add('hidden'));
  
  // Fermeture de la pop-up de classement si on clique à côté
  rankingModal.addEventListener('click', (e) => {
    if (e.target === rankingModal) rankingModal.classList.add('hidden');
  });

  // --- Démarrage initial ---
  initGame();
  refreshSavedGamesList();
});
