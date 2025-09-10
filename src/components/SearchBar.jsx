import { useState, useEffect, useMemo } from "react"
import { fetchGenres } from './SearchFunctions'
import './SearchBar.css'

function SearchBar({ defaultValues, onSearch }) {
    // esim genret, year, query, sort
    const [form, setForm] = useState(defaultValues)
    const [allGenres, setAllGenres] = useState([]);
    const years = useMemo(
        () => Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i),
        []
    )

    useEffect(() => {
        fetchGenres().then(setAllGenres).catch(console.error);
    }, [])

    function update(fieldName, newValue) {
        setForm(prev => ({
            ...prev, [fieldName]: newValue
        }))
    }

    // Kun käyttäjä valitsee yhden genren selectistä, lisätään se listaan
    function addGenre(idStr) {
        if (!idStr) return;
        const id = Number(idStr);
        setForm((prev) =>
            prev.genres.includes(id) ? prev : { ...prev, genres: [...prev.genres, id] }
        );
    }

    function removeGenre(id) {
        setForm((prev) => ({ ...prev, genres: prev.genres.filter((g) => g !== id) }));
    }

    function submit(e) {
        e.preventDefault();
        onSearch(form); // Samun haku-funktio saa koko objektiin
    }

    return (
        <form onSubmit={submit} className="searchbar">
            {/* GENRE valitsin (kertyy) */}
            <div className="genreSelector">
                <select onChange={(e) => addGenre(e.target.value)} defaultValue="">
                    <option value="">Genre</option>
                    {allGenres.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>

                {/* Valitut genret tageina */}
                <div className="genresAsTags">
                    {form.genres.map((id) => {
                        const g = allGenres.find((x) => x.id === id);
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => removeGenre(id)}
                                className="tag"
                                title="Remove"
                            >
                                {g?.name || id} ✕
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* YEAR */}
            <select value={form.year} onChange={(e) => update("year", e.target.value)}>
                <option value="">Year</option>
                {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>

            {/* SORTTAUS */}
            <select value={form.sort} onChange={(e) => update("sort", e.target.value)}>
                <option value="popularity.desc">Additionals</option>
                <option value="release_date.desc">Newest</option>
                <option value="vote_average.desc">Top rated</option>
            </select>

            {/* QUERY */}
            <input
                placeholder="Keywords"
                value={form.query}
                onChange={(e) => update("query", e.target.value)}
            />

            <button type="submit">Search</button>
        </form>
    );
}


export { SearchBar } 