import { useState } from 'react'
import { SearchBar } from '../components/SearchBar.jsx'
import { discoverMovies, searchMoviesByText } from '../components/SearchFunctions'
import ReactPaginate from 'react-paginate'
import Header from '../components/Header'
import './css/search.css'
import ToggleFav from '../components/Favourites.jsx'

function Search() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const defaultFilters = {
    genres: [],
    year: "",
    query: "",
    sort: "popularity.desc"
  }
  const [filters, setFilters] = useState(defaultFilters)

  async function runSearch(newFilters, newPage = 1) {
    setFilters(newFilters)
    setPage(newPage)
    //console.log("filters", filters)
    setLoading(true)
    setErr(null)

    try {
      let data;
      if (newFilters.query) {
        data = await searchMoviesByText({ query: newFilters.query, page: newPage })
        let filtered = data.results ?? []

        if (newFilters.year) {
          filtered = filtered.filter(m => m.release_date?.startsWith(newFilters.year))
        }
        if (newFilters.genres.length) {
          filtered = filtered.filter(m => m.genres_ids?.some(g => newFilters.genres.includes(g)))
        }
        if (newFilters.sort === "release_date.desc") {
          filtered = [...filtered].sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        }
        if (newFilters.sort === "vote_average.desc") {
          filtered = [...filtered].sort((a, b) => b.vote_average - a.vote_average)
        }

        data.results = filtered
      }
      setResults(data?.results ?? [])
      setPageCount(data?.total_pages ?? 0)
      setPage(newPage)
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header pageTitle={"Search"} />
      <div id="searchbar-container">
        <SearchBar defaultValues={defaultFilters} onSearch={runSearch} />

        {loading && <p>Loading…</p>}
        {err && <p>Failed: {String(err.message || err)}</p>}

        <div id="movieContainer">
          {results.map((m) => (
            <div key={m.id} id="movieCard">
              {m.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${m.poster_path}`}
                  alt={m.title}
                />
              )}

              <div id="movieTitle">{m.title}</div>
              <div>{m.release_date}</div>
              <div id="movieDescription"> {m.overview && <p>{m.overview}</p>}</div>
              <ToggleFav movie={{ id: m.id, title: m.title }} />

            </div>
          ))}
        </div>


        {pageCount > 1 && (
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={(e) => runSearch(filters, e.selected + 1)}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="<"
            renderOnZeroPageCount={null}
            containerClassName='pagination'
            activeClassName='selected'
            forcePage={page - 1}
          />
        )}
      </div>
    </>
  );
}

export { Search }