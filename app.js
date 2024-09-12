// Marvel API
const API_KEY_MARVEL = 'f6d31785cd35679bae7ccedda2d5a1b3';
const PRIVATE_KEY_MARVEL = 'dd70e79fd308782e42a53eef768bf7ebddc2e20e';
const BASE_URL_MARVEL = 'https://gateway.marvel.com/v1/public/';

// TMDB API (para películas)
const API_KEY_TMDB = '8ae3dc26309603df1a2e27232716f975';
const BASE_URL_TMDB = 'https://api.themoviedb.org/3/search/movie';


// Generar hash de autenticación para Marvel
function generateHash(ts) {
  return CryptoJS.MD5(ts + PRIVATE_KEY_MARVEL + API_KEY_MARVEL).toString();
}

// Función para hacer la búsqueda
async function searchMarvel(query, type) {
  const ts = new Date().getTime();
  const hash = generateHash(ts);
  let url;

  switch (type) {
    case 'characters':
      url = `${BASE_URL_MARVEL}characters?nameStartsWith=${query}&ts=${ts}&apikey=${API_KEY_MARVEL}&hash=${hash}`;
      break;
    case 'comics':
      url = `${BASE_URL_MARVEL}comics?titleStartsWith=${query}&ts=${ts}&apikey=${API_KEY_MARVEL}&hash=${hash}`;
      break;
    case 'movies':
      searchMovies(query);
      return;
    case 'games':
      searchGames(query);
      return;
  }

  const response = await fetch(url);
  const data = await response.json();
  if (data.data && data.data.results) {
    displayResults(data.data.results, `${type}-list`);
  } else {
    console.error('No se encontraron resultados', data);
  }
}

// Buscar películas relacionadas usando TMDB
async function searchMovies(query) {
  const url = `${BASE_URL_TMDB}?api_key=${API_KEY_TMDB}&query=${query}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    displayResultsTMDB(data.results, 'movies-list');
  } else {
    console.error('No se encontraron películas relacionadas');
  }
}

// Mostrar películas de TMDB
function displayResultsTMDB(results, sectionId) {
  const section = document.getElementById(sectionId);
  section.innerHTML = '';

  results.forEach(item => {
    const div = document.createElement('div');
    const imageUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    div.innerHTML = `<img src="${imageUrl}" alt="${item.title}">
                     <h3>${item.title}</h3>`;
    section.appendChild(div);
  });
}


// Mostrar los resultados de Marvel con imagen
function displayResults(results, sectionId) {
  const section = document.getElementById(sectionId);
  section.innerHTML = '';

  results.forEach(item => {
    const div = document.createElement('div');
    const imageUrl = `${item.thumbnail.path}.${item.thumbnail.extension}`;
    div.innerHTML = `<img src="${imageUrl}" alt="${item.name || item.title}">
                     <h3>${item.name || item.title}</h3>`;
    section.appendChild(div);
  });
}

// Manejar navegación por secciones
function handleNavigation() {
  const sections = document.querySelectorAll('.result-section');
  const navLinks = document.querySelectorAll('nav ul li a');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const id = this.id.split('-')[1];

      // Mostrar la sección correspondiente y ocultar las demás
      sections.forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(id).classList.add('active');
    });
  });
}

// Evento de búsqueda al hacer clic
document.getElementById('search-button').addEventListener('click', () => {
  const query = document.getElementById('search-input').value;
  searchActiveSection(query);
});

// Evento para buscar cuando se presiona Enter
document.getElementById('search-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const query = document.getElementById('search-input').value;
    searchActiveSection(query);
  }
});

// Buscar en la sección activa
function searchActiveSection(query) {
  const activeSection = document.querySelector('.result-section.active');
  if (query) {
    if (activeSection.id === 'characters') {
      searchMarvel(query, 'characters');
    } else if (activeSection.id === 'comics') {
      searchMarvel(query, 'comics');
    } else if (activeSection.id === 'movies') {
      searchMarvel(query, 'movies');
    }
  }
}

// Inicializar la navegación
handleNavigation();
