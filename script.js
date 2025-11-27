// API Configuration
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const API_URL = 'https://www.omdbapi.com/';

// DOM Elements
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const searchOptionBtns = document.querySelectorAll('.search-option-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const randomMovieBtn = document.getElementById('random-movie-btn');
const featuredMoviesContainer = document.getElementById('featured-movies-container');
const topRatedMoviesContainer = document.getElementById('top-rated-movies');
const movieModal = document.getElementById('movie-modal');
const closeModal = document.querySelector('.close');
const movieDetails = document.getElementById('movie-details');

// Current search type
let currentSearchType = 'title';

// Featured movies (you can customize this list)
const featuredMovies = [
    'Inception',
    'The Shawshank Redemption',
    'The Godfather',
    'Pulp Fiction',
    'The Dark Knight',
    'Forrest Gump',
    'The Matrix',
    'Goodfellas'
];

// Top rated movies (you can customize this list)
const topRatedMovies = [
    'tt0111161', // The Shawshank Redemption
    'tt0068646', // The Godfather
    'tt0071562', // The Godfather Part II
    'tt0468569', // The Dark Knight
    'tt0050083', // 12 Angry Men
    'tt0108052', // Schindler's List
    'tt0167260', // The Lord of the Rings: The Return of the King
    'tt0110912'  // Pulp Fiction
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load featured movies
    loadFeaturedMovies();
    
    // Load top rated movies
    loadTopRatedMovies();
    
    // Set up event listeners
    setupEventListeners();
});

// Set up all event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            switchSection(targetSection);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Search options
    searchOptionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            searchOptionBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSearchType = this.getAttribute('data-search-type');
            updateSearchPlaceholder();
        });
    });
    
    // Search button
    searchBtn.addEventListener('click', performSearch);
    
    // Enter key in search input
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Random movie button
    randomMovieBtn.addEventListener('click', getRandomMovie);
    
    // Modal close
    closeModal.addEventListener('click', function() {
        movieModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === movieModal) {
            movieModal.style.display = 'none';
        }
    });
}

// Switch between sections
function switchSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Update search input placeholder based on search type
function updateSearchPlaceholder() {
    switch(currentSearchType) {
        case 'title':
            searchInput.placeholder = 'Enter movie title...';
            break;
        case 'keyword':
            searchInput.placeholder = 'Enter keyword...';
            break;
        case 'imdb':
            searchInput.placeholder = 'Enter IMDb ID (e.g., tt1375666)...';
            break;
    }
}

// Perform search based on current search type
function performSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    searchResults.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    switch(currentSearchType) {
        case 'title':
            searchByTitle(query);
            break;
        case 'keyword':
            searchByKeyword(query);
            break;
        case 'imdb':
            searchByImdbId(query);
            break;
    }
}

// Search movie by title
async function searchByTitle(title) {
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            displaySearchResults([data]);
        } else {
            displayNoResults();
        }
    } catch (error) {
        console.error('Error searching by title:', error);
        displayError();
    }
}

// Search movies by keyword
async function searchByKeyword(keyword) {
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(keyword)}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            // Fetch detailed information for each movie
            const detailedMovies = await Promise.all(
                data.Search.slice(0, 10).map(movie => 
                    fetch(`${API_URL}?apikey=${API_KEY}&i=${movie.imdbID}`)
                        .then(res => res.json())
                )
            );
            displaySearchResults(detailedMovies);
        } else {
            displayNoResults();
        }
    } catch (error) {
        console.error('Error searching by keyword:', error);
        displayError();
    }
}

// Search movie by IMDb ID
async function searchByImdbId(imdbId) {
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbId}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            displaySearchResults([data]);
        } else {
            displayNoResults();
        }
    } catch (error) {
        console.error('Error searching by IMDb ID:', error);
        displayError();
    }
}

// Display search results
function displaySearchResults(movies) {
    if (movies.length === 0) {
        displayNoResults();
        return;
    }
    
    let html = '';
    
    if (movies.length === 1) {
        // Single result - show detailed view
        const movie = movies[0];
        html = `
            <div class="movie-details-card">
                <div class="movie-details-container">
                    <div class="movie-details-poster">
                        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${movie.Title}">
                    </div>
                    <div class="movie-details-info">
                        <h2 class="movie-details-title">${movie.Title}</h2>
                        <div class="movie-details-meta">
                            <span>${movie.Year}</span>
                            <span>${movie.Runtime}</span>
                            <span>${movie.Genre}</span>
                            <span>IMDb: ${movie.imdbRating}</span>
                        </div>
                        <p class="movie-details-plot">${movie.Plot}</p>
                        <div class="movie-details-extra">
                            <div class="detail-item">
                                <span class="detail-label">Director:</span>
                                <span>${movie.Director}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Actors:</span>
                                <span>${movie.Actors}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Language:</span>
                                <span>${movie.Language}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Country:</span>
                                <span>${movie.Country}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Awards:</span>
                                <span>${movie.Awards}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Multiple results - show grid
        html = '<div class="movies-grid">';
        movies.forEach(movie => {
            html += `
                <div class="movie-card" data-imdbid="${movie.imdbID}">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Poster'}" alt="${movie.Title}" class="movie-poster">
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.Title}</h3>
                        <p class="movie-year">${movie.Year}</p>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        // Add event listeners to movie cards
        setTimeout(() => {
            document.querySelectorAll('.movie-card').forEach(card => {
                card.addEventListener('click', function() {
                    const imdbId = this.getAttribute('data-imdbid');
                    showMovieDetails(imdbId);
                });
            });
        }, 100);
    }
    
    searchResults.innerHTML = html;
}

// Display no results message
function displayNoResults() {
    searchResults.innerHTML = `
        <div class="no-results">
            <h3>No results found</h3>
            <p>Try a different search term</p>
        </div>
    `;
}

// Display error message
function displayError() {
    searchResults.innerHTML = `
        <div class="no-results">
            <h3>Error fetching data</h3>
            <p>Please try again later</p>
        </div>
    `;
}

// Load featured movies
async function loadFeaturedMovies() {
    try {
        const moviePromises = featuredMovies.map(title => 
            fetch(`${API_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}`)
                .then(response => response.json())
        );
        
        const movies = await Promise.all(moviePromises);
        displayMovies(movies, featuredMoviesContainer);
    } catch (error) {
        console.error('Error loading featured movies:', error);
        featuredMoviesContainer.innerHTML = '<p>Error loading featured movies</p>';
    }
}

// Load top rated movies
async function loadTopRatedMovies() {
    try {
        const moviePromises = topRatedMovies.map(imdbId => 
            fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbId}`)
                .then(response => response.json())
        );
        
        const movies = await Promise.all(moviePromises);
        displayMovies(movies, topRatedMoviesContainer);
    } catch (error) {
        console.error('Error loading top rated movies:', error);
        topRatedMoviesContainer.innerHTML = '<p>Error loading top rated movies</p>';
    }
}

// Display movies in a grid
function displayMovies(movies, container) {
    let html = '';
    
    movies.forEach(movie => {
        if (movie.Response === 'True') {
            html += `
                <div class="movie-card" data-imdbid="${movie.imdbID}">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Poster'}" alt="${movie.Title}" class="movie-poster">
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.Title}</h3>
                        <p class="movie-year">${movie.Year}</p>
                        <p class="movie-rating">IMDb: ${movie.imdbRating}</p>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
    
    // Add event listeners to movie cards
    container.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', function() {
            const imdbId = this.getAttribute('data-imdbid');
            showMovieDetails(imdbId);
        });
    });
}

// Show movie details in modal
async function showMovieDetails(imdbId) {
    try {
        movieDetails.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        movieModal.style.display = 'block';
        
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbId}`);
        const movie = await response.json();
        
        if (movie.Response === 'True') {
            let ratingsHtml = '';
            if (movie.Ratings && movie.Ratings.length > 0) {
                ratingsHtml = '<div class="detail-item"><span class="detail-label">Ratings:</span><ul>';
                movie.Ratings.forEach(rating => {
                    ratingsHtml += `<li>${rating.Source}: ${rating.Value}</li>`;
                });
                ratingsHtml += '</ul></div>';
            }
            
            movieDetails.innerHTML = `
                <div class="movie-details-container">
                    <div class="movie-details-poster">
                        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${movie.Title}">
                    </div>
                    <div class="movie-details-info">
                        <h2 class="movie-details-title">${movie.Title}</h2>
                        <div class="movie-details-meta">
                            <span>${movie.Year}</span>
                            <span>${movie.Runtime}</span>
                            <span>${movie.Rated}</span>
                            <span>IMDb: ${movie.imdbRating}</span>
                        </div>
                        <p class="movie-details-plot">${movie.Plot}</p>
                        <div class="movie-details-extra">
                            <div class="detail-item">
                                <span class="detail-label">Director:</span>
                                <span>${movie.Director}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Actors:</span>
                                <span>${movie.Actors}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Genre:</span>
                                <span>${movie.Genre}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Release Date:</span>
                                <span>${movie.Released}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Language:</span>
                                <span>${movie.Language}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Country:</span>
                                <span>${movie.Country}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Awards:</span>
                                <span>${movie.Awards}</span>
                            </div>
                            ${ratingsHtml}
                            <div class="detail-item">
                                <span class="detail-label">Box Office:</span>
                                <span>${movie.BoxOffice !== 'N/A' ? movie.BoxOffice : 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Production:</span>
                                <span>${movie.Production !== 'N/A' ? movie.Production : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            movieDetails.innerHTML = '<p>Error loading movie details</p>';
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieDetails.innerHTML = '<p>Error loading movie details</p>';
    }
}

// Get a random movie
async function getRandomMovie() {
    // List of random keywords to search for
    const keywords = [
        'action', 'comedy', 'drama', 'thriller', 'sci-fi', 
        'romance', 'horror', 'adventure', 'mystery', 'fantasy'
    ];
    
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    try {
        // First, search for movies with the random keyword
        const searchResponse = await fetch(`${API_URL}?apikey=${API_KEY}&s=${randomKeyword}`);
        const searchData = await searchResponse.json();
        
        if (searchData.Response === 'True' && searchData.Search.length > 0) {
            // Pick a random movie from the results
            const randomIndex = Math.floor(Math.random() * Math.min(searchData.Search.length, 10));
            const randomMovie = searchData.Search[randomIndex];
            
            // Get detailed information about the random movie
            const detailResponse = await fetch(`${API_URL}?apikey=${API_KEY}&i=${randomMovie.imdbID}`);
            const movie = await detailResponse.json();
            
            if (movie.Response === 'True') {
                // Switch to search section and display the random movie
                switchSection('search');
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('[data-section="search"]').classList.add('active');
                
                displaySearchResults([movie]);
            } else {
                alert('Error fetching random movie details');
            }
        } else {
            alert('No movies found for random search');
        }
    } catch (error) {
        console.error('Error getting random movie:', error);
        alert('Error getting random movie');
    }
}