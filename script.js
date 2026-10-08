const API_BASE = 'https://data.jujutsukaisenapi.site/api/v1';

let allCharacters = [];

// DOM Elements
const grid = document.getElementById('charactersGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const gradeFilter = document.getElementById('gradeFilter');
const retryBtn = document.getElementById('retryBtn');
const detailModal = document.getElementById('detailModal');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModalBtn');

// Fetch Characters from API
async function fetchCharacters() {
  showLoading();
  try {
    const response = await fetch(`${API_BASE}/characters`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    
    // Normalizar la lista de personajes
    allCharacters = Array.isArray(data) ? data : (data.data || []);
    
    renderCharacters(allCharacters);
  } catch (error) {
    console.error('Error fetching data:', error);
    showError(error.message);
  }
}

// Render characters cards
function renderCharacters(characters) {
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');

  if (!characters || characters.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    resultsCount.textContent = '0 personajes encontrados';
    return;
  }

  emptyState.classList.add('hidden');
  grid.classList.remove('hidden');
  resultsCount.textContent = `${characters.length} personaje${characters.length !== 1 ? 's' : ''} mostrado${characters.length !== 1 ? 's' : ''}`;

  grid.innerHTML = characters.map(char => createCardHTML(char)).join('');
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Create Card HTML
function createCardHTML(char) {
  const gradeName = char.grade?.name || 'Unknown Grade';
  const statusName = char.status?.name || 'Unknown';
  const affiliations = (char.affiliations || []).map(a => a.affiliation_name).slice(0, 1).join(', ') || 'Sin afiliación';
  const techniquesCount = (char.cursedTechniques || []).length;
  
  // Status style
  const isAlive = statusName.toLowerCase() === 'alive';
  const statusBadge = `
    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isAlive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}">
      <span class="w-1.5 h-1.5 rounded-full ${isAlive ? 'bg-emerald-400' : 'bg-red-400'}"></span>
      ${statusName}
    </span>
  `;

  // Grade badge styling
  const isSpecial = gradeName.toLowerCase().includes('special');
  const gradeBadge = `
    <span class="text-xs font-bold px-2.5 py-1 rounded-lg ${isSpecial ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-sm shadow-purple-600/30' : 'bg-purple-900/60 text-purple-200 border border-purple-700/40'}">
      ${gradeName}
    </span>
  `;

  const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name || 'JJK')}&background=1b1d36&color=a855f7&size=400`;
  const imgUrl = char.image || fallbackImg;

  return `
    <div 
      onclick="openDetails(${char.id})" 
      class="group cursor-pointer bg-curse-800 rounded-2xl overflow-hidden border border-purple-900/30 hover:border-purple-500/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 flex flex-col"
    >
      <!-- Image Container -->
      <div class="relative aspect-[4/5] overflow-hidden bg-curse-700">
        <img 
          src="${imgUrl}" 
          alt="${char.name}"
          loading="lazy"
          onerror="this.onerror=null; this.src='${fallbackImg}';"
          class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-curse-800 via-transparent to-black/30"></div>
        
        <!-- Badges on top -->
        <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          ${statusBadge}
          ${gradeBadge}
        </div>
      </div>

      <!-- Info Container -->
      <div class="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
            ${char.name}
          </h3>
          <p class="text-xs text-gray-400 line-clamp-1 mt-0.5">
            ${char.alias && char.alias.length ? `"${char.alias[0]}"` : affiliations}
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between text-xs text-gray-400">
          <span class="flex items-center gap-1.5">
            <i data-lucide="zap" class="w-3.5 h-3.5 text-purple-400"></i>
            ${techniquesCount} Técnica${techniquesCount !== 1 ? 's' : ''}
          </span>
          <span class="text-purple-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
            Ver detalles <i data-lucide="chevron-right" class="w-3 h-3"></i>
          </span>
        </div>
      </div>
    </div>
  `;
}

// Open modal with detailed character info
window.openDetails = function(characterId) {
  const char = allCharacters.find(c => c.id === characterId);
  if (!char) return;

  const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name || 'JJK')}&background=1b1d36&color=a855f7&size=400`;
  const imgUrl = char.image || fallbackImg;
  const isAlive = (char.status?.name || '').toLowerCase() === 'alive';
  const techniques = char.cursedTechniques || [];
  const domain = char.domainExpansion;

  modalContent.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Character Image -->
      <div class="w-full md:w-5/12 flex-shrink-0">
        <div class="rounded-xl overflow-hidden bg-curse-700 border border-purple-900/50 aspect-[3/4]">
          <img 
            src="${imgUrl}" 
            alt="${char.name}"
            onerror="this.onerror=null; this.src='${fallbackImg}';"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Character Info -->
      <div class="w-full md:w-7/12 flex flex-col">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-2xl font-black text-white">${char.name}</h2>
            ${char.alias && char.alias.length ? `
              <p class="text-xs text-purple-400 mt-0.5">Alias: ${char.alias.join(', ')}</p>
            ` : ''}
          </div>
          <span class="px-2.5 py-1 text-xs rounded-lg font-bold bg-purple-950 border border-purple-600/50 text-purple-300">
            ${char.grade?.name || 'Grade Desconocido'}
          </span>
        </div>

        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-2 gap-2 mt-4 bg-curse-900/60 p-3 rounded-xl border border-purple-950">
          <div class="text-xs"><span class="text-gray-400">Estado:</span> <span class="font-semibold ${isAlive ? 'text-emerald-400' : 'text-red-400'}">${char.status?.name || 'N/A'}</span></div>
          <div class="text-xs"><span class="text-gray-400">Especie:</span> <span class="font-semibold text-gray-200">${char.species?.species_name || 'N/A'}</span></div>
          <div class="text-xs"><span class="text-gray-400">Edad:</span> <span class="font-semibold text-gray-200">${char.age || 'N/A'}</span></div>
          <div class="text-xs"><span class="text-gray-400">Cumpleaños:</span> <span class="font-semibold text-gray-200">${char.birthday || 'N/A'}</span></div>
          <div class="text-xs"><span class="text-gray-400">Estatura:</span> <span class="font-semibold text-gray-200">${char.height || 'N/A'}</span></div>
          <div class="text-xs"><span class="text-gray-400">Debut Anime:</span> <span class="font-semibold text-gray-200">${char.animeDebut || 'N/A'}</span></div>
        </div>

        <!-- Affiliations -->
        ${char.affiliations && char.affiliations.length ? `
          <div class="mt-4">
            <h4 class="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">Afiliación</h4>
            <div class="flex flex-wrap gap-1.5">
              ${char.affiliations.map(aff => `
                <span class="px-2.5 py-1 rounded-md text-xs bg-curse-700 border border-purple-900/40 text-gray-200">
                  ${aff.affiliation_name}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Domain Expansion -->
        ${domain ? `
          <div class="mt-4 p-3 rounded-xl bg-purple-950/40 border border-purple-800/40">
            <h4 class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i>
              Expansión de Dominio: ${domain.name}
            </h4>
            <p class="text-xs text-gray-300 mt-1 leading-relaxed">${domain.description || 'Sin descripción disponible.'}</p>
          </div>
        ` : ''}

        <!-- Cursed Techniques -->
        <div class="mt-4">
          <h4 class="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">
            Técnicas Malditas (${techniques.length})
          </h4>
          <div class="max-h-44 overflow-y-auto pr-1 space-y-2">
            ${techniques.length === 0 ? '<p class="text-xs text-gray-500 italic">No tiene técnicas registradas.</p>' : ''}
            ${techniques.map(tech => `
              <div class="p-2.5 bg-curse-700/60 rounded-lg border border-purple-900/30 text-xs">
                <div class="font-bold text-purple-200 flex items-center justify-between">
                  <span>${tech.technique_name}</span>
                  ${tech.type?.name ? `<span class="text-[10px] text-gray-400 font-normal px-1.5 py-0.5 rounded bg-curse-800">${tech.type.name}</span>` : ''}
                </div>
                ${tech.description ? `<p class="text-gray-300 mt-1 text-[11px] leading-relaxed">${tech.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  detailModal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

// Close Modal
function closeModal() {
  detailModal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

closeModalBtn.addEventListener('click', closeModal);
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
    closeModal();
  }
});

// Filters and Search logic
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedGrade = gradeFilter.value;

  const filtered = allCharacters.filter(char => {
    // Search match
    const nameMatch = char.name?.toLowerCase().includes(searchTerm);
    const aliasMatch = (char.alias || []).some(a => a.toLowerCase().includes(searchTerm));
    const matchesSearch = !searchTerm || nameMatch || aliasMatch;

    // Grade match
    const charGrade = char.grade?.name || '';
    const matchesGrade = selectedGrade === 'all' || charGrade.toLowerCase() === selectedGrade.toLowerCase();

    return matchesSearch && matchesGrade;
  });

  renderCharacters(filtered);
}

// UI State helpers
function showLoading() {
  loadingState.classList.remove('hidden');
  errorState.classList.add('hidden');
  emptyState.classList.add('hidden');
  grid.classList.add('hidden');
  resultsCount.textContent = 'Cargando personajes...';
}

function showError(msg) {
  loadingState.classList.add('hidden');
  emptyState.classList.add('hidden');
  grid.classList.add('hidden');
  errorState.classList.remove('hidden');
  document.getElementById('errorMessage').textContent = msg;
  resultsCount.textContent = 'Error al cargar';
}

// Event Listeners
searchInput.addEventListener('input', applyFilters);
gradeFilter.addEventListener('change', applyFilters);
retryBtn.addEventListener('click', fetchCharacters);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();
  fetchCharacters();
});
