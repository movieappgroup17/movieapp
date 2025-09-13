import { useState } from 'react'
import { SearchBar } from '../components/SearchBar.jsx'
import { discoverMovies, searchMoviesByText } from '../components/SearchFunctions'
import Header from '../components/Header'


function Search() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  const defaultFilters = { genres: [], year: "", query: "", sort: "popularity.desc" }

  async function runSearch(filters) {
    console.log("filters", filters)
    setLoading(true)
    setErr(null)

    try {
      let data;
      const hasFilters = filters.genres.length || filters.year || filters.sort !== "popularity.desc"
      if (filters.query && hasFilters) {
        // Jos on tekstihaku + suodattimia, voi käyttää discoveria ilman querya
        // yhdistäminen: hae searchilla ja suodata clientissä 
        // Tässä valitaan discover, koska TMDB ei yhdistä suoraan query + with_genres
        data = await discoverMovies({
          genres: filters.genres,
          year: filters.year,
          sort: filters.sort
        })
      } else if (filters.query) {
        data = await searchMoviesByText({ query: filters.query })
      } else {
        data = await discoverMovies({
          genres: filters.genres,
          year: filters.year,
          sort: filters.sort
        }
        );
      }
      setResults(data?.results ?? [])
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <Header pageTitle={"Search"}/>
    <div className="p-4">
      <SearchBar defaultValues={defaultFilters} onSearch={runSearch} />

      {loading && <p>Loading…</p>}
      {err && <p>Failed: {String(err.message || err)}</p>}

      <div className="grid gap-3 mt-4">
        {results.map((m) => (
          <div key={m.id} className="border p-3 rounded">
            <div className="font-semibold">{m.title}</div>
            <div>{m.release_date}</div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

export { Search }