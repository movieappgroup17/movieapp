import axios from "axios"

const apiKey = import.meta.env.VITE_TMDB_API_KEY;

const api = axios.create({
    baseURL: "https://api.themoviedb.org/3"
});

async function fetchGenres() {
    const { data } = await api.get("/genre/movie/list", {
        params: { api_key: apiKey, language: "en-US" },
    });
    return data.genres;
}

// kun ei ole tekstihaku vaan "valikkohaku"
async function discoverMovies({ genres = [], year = "",
    sort = "popularity.desc", page = 1 }) {
    const params = {
        api_key: apiKey,
        include_adult: false,
        page,
        sort_by: sort,
    };
    if (genres.length) params.with_genres = genres.join(",");
    if (year) params.primary_release_year = year;

    const { data } = await api.get("/discover/movie", { params });
    return data; // results, total_pages jne
}

// searchMoviesByText: tekstihaku 
async function searchMoviesByText({ query, page = 1 }) {
    const params = {
        api_key: apiKey,
        include_adult: false,
        query,
        page,
    };
    const { data } = await api.get("/search/movie", { params });
    console.log(data)
    return data;
}

// fetching most trending movies from TMDB API
async function getTrendingMovies() {
    const params = {
        api_key: apiKey,
        language: "en-US"
    };
    const { data } = await api.get("/trending/movie/week", { params });
    return data.results;
}

export { discoverMovies, searchMoviesByText, fetchGenres, getTrendingMovies }