// TMDB API configuration
const TMDB_API_KEY = '4c51ad9a4e58672fa733d1cda3dec6cc'; // Replace with your TMDB API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const searchInput = document.getElementById('movie-search');
    const searchBtn = document.getElementById('search-btn');
    const googleSearchBtn = document.getElementById('google-search-btn');
    const searchResults = document.getElementById('search-results');
    const getRecommendationBtn = document.getElementById('get-recommendation');
    const recommendationResults = document.getElementById('recommendation-results');
    
    // Questions
    const moodQuestion = document.getElementById('mood-question');
    const occasionQuestion = document.getElementById('occasion-question');
    const genreQuestion = document.getElementById('genre-question');
    const ageRatingQuestion = document.getElementById('age-rating-question');
    const movieAgeQuestion = document.getElementById('movie-age-question');
    const languageQuestion = document.getElementById('language-question');
    
    let selectedMood = '';
    let selectedOccasion = '';
    let selectedGenre = '';
    let selectedAgeRating = '';
    let selectedMovieAge = '';
    let selectedLanguage = '';

    // Search functionality
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchMovies(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchMovies(query);
            }
        }
    });

    googleSearchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query + ' movie')}`, '_blank');
        }
    });

    // Question navigation
    document.querySelectorAll('.option-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const question = e.target.closest('.question');
            const options = question.querySelectorAll('.option-btn');
            
            options.forEach(opt => opt.classList.remove('selected'));
            e.target.classList.add('selected');

            if (question.id === 'mood-question') {
                selectedMood = e.target.dataset.value;
                moodQuestion.style.display = 'none';
                occasionQuestion.style.display = 'block';
            } else if (question.id === 'occasion-question') {
                selectedOccasion = e.target.dataset.value;
                occasionQuestion.style.display = 'none';
                genreQuestion.style.display = 'block';
            } else if (question.id === 'genre-question') {
                selectedGenre = e.target.dataset.value;
                genreQuestion.style.display = 'none';
                ageRatingQuestion.style.display = 'block';
            } else if (question.id === 'age-rating-question') {
                selectedAgeRating = e.target.dataset.value;
                ageRatingQuestion.style.display = 'none';
                movieAgeQuestion.style.display = 'block';
            } else if (question.id === 'movie-age-question') {
                selectedMovieAge = e.target.dataset.value;
                movieAgeQuestion.style.display = 'none';
                languageQuestion.style.display = 'block';
            } else if (question.id === 'language-question') {
                selectedLanguage = e.target.dataset.value;
                languageQuestion.style.display = 'none';
                getRecommendationBtn.style.display = 'block';
            }
        });
    });

    // Get recommendation
    getRecommendationBtn.addEventListener('click', () => {
        getMovieRecommendation(selectedMood, selectedOccasion, selectedGenre);
    });

    async function searchMovies(query) {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (!response.ok) {
                displayError(searchResults, data.status_message || 'Failed to search movies');
                return;
            }
            
            displayMovies(searchResults, data.results);
        } catch (error) {
            displayError(searchResults, 'Failed to search movies. Please try again.');
        }
    }

    async function getMovieRecommendation(mood, occasion, genre) {
        try {
            // Show loading state
            recommendationResults.innerHTML = '<div class="loading">Finding the perfect movie for you...</div>';

            // Construct query parameters
            const currentYear = new Date().getFullYear();
            let releaseYear = '';
            if (selectedMovieAge === 'classic') {
                releaseYear = '&release_date.lte=2000';
            } else if (selectedMovieAge === 'recent') {
                releaseYear = `&primary_release_date.gte=${currentYear-5}`;
            }

            let language = '';
            if (selectedLanguage === 'en') {
                language = '&with_original_language=en';
            } else if (selectedLanguage === 'foreign') {
                language = '&without_original_language=en';
            }

            // Get movies filtered by criteria
            const response = await fetch(
                `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc` +
                `&with_genres=${getGenreId(genre)}${releaseYear}${language}`
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                displayError(recommendationResults, data.status_message || 'Failed to get recommendations');
                return;
            }

            // Filter movies based on criteria
            const filteredMovies = filterMovies(data.results, {
                mood,
                occasion,
                ageRating: selectedAgeRating
            });

            if (filteredMovies.length > 0) {
                // Get random movie from filtered list
                const recommendation = filteredMovies[Math.floor(Math.random() * filteredMovies.length)];
                displaySimpleMovie(recommendationResults, recommendation);
            } else {
                displayError(recommendationResults, 'No movies found matching your criteria. Try different options.');
            }
        } catch (error) {
            displayError(recommendationResults, 'Failed to get recommendation. Please try again.');
        }
    }

    function displaySimpleMovie(container, movie) {
        const posterPath = movie.poster_path
            ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
            : null;
        
        // Construct JustWatch URL - encode movie title for the search
        const justWatchUrl = `https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.title)}`;
        
        container.innerHTML = `
            <div class="movie-recommendation">
                ${posterPath 
                    ? `<img src="${posterPath}" alt="${movie.title}" class="movie-poster">`
                    : `<div class="no-poster">No poster available</div>`
                }
                <h2 class="movie-title">${movie.title}</h2>
                <a href="${justWatchUrl}" target="_blank" class="watch-now-btn">
                    <span>Watch Now</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </a>
            </div>
        `;
    }

    function getGenreId(genre) {
        const genreMap = {
            'action': 28,
            'comedy': 35,
            'drama': 18,
            'horror': 27,
            'romance': 10749,
            'scifi': 878,
            'thriller': 53,
            'family': 10751
        };
        return genreMap[genre] || 28;
    }

    function filterMovies(movies, criteria) {
        return movies.filter(movie => {
            // Basic mood filtering
            if (!filterByMood(movie, criteria.mood)) return false;

            // Age rating filtering
            if (!filterByAgeRating(movie, criteria.ageRating)) return false;

            // Occasion filtering
            if (!filterByOccasion(movie, criteria.occasion)) return false;

            return true;
        });
    }

    function filterByMood(movie, mood) {
        switch(mood) {
            case 'happy':
                return movie.vote_average >= 7.5;
            case 'sad':
                return movie.vote_average >= 7 && movie.genre_ids.includes(18);
            case 'excited':
                return movie.popularity > 100;
            case 'relaxed':
                return movie.vote_average >= 6.5;
            case 'romantic':
                return movie.genre_ids.includes(10749);
            default:
                return true;
        }
    }

    function filterByAgeRating(movie, ageRating) {
        switch(ageRating) {
            case 'family':
                return !movie.adult && movie.genre_ids.includes(10751);
            case 'pg13':
                return !movie.adult && movie.vote_average < 7.5;
            case 'r':
                return movie.vote_average >= 7.5;
            case 'any':
            default:
                return true;
        }
    }

    function filterByOccasion(movie, occasion) {
        switch(occasion) {
            case 'alone':
                return true;
            case 'date':
                return movie.genre_ids.includes(10749) || movie.genre_ids.includes(35);
            case 'family':
                return !movie.adult && (movie.genre_ids.includes(10751) || movie.genre_ids.includes(16));
            case 'friends':
                return movie.popularity > 50;
            default:
                return true;
        }
    }

    function displayMovies(container, movies) {
        container.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            
            const posterPath = movie.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                : null;
            
            movieCard.innerHTML = `
                ${posterPath 
                    ? `<img src="${posterPath}" alt="${movie.title}" class="movie-poster">`
                    : `<div class="no-poster">No poster available</div>`
                }
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
                    <span class="movie-rating">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                    <p class="movie-overview">${movie.overview || 'No overview available'}</p>
                </div>
            `;
            
            container.appendChild(movieCard);
        });
    }

    function displayError(container, message) {
        container.innerHTML = `<div class="error">${message}</div>`;
    }
});
