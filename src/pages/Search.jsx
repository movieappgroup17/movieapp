import { useState } from 'react'
import { SearchBar } from '../components/SearchBar.jsx'
import { discoverMovies, searchMoviesByText } from '../components/SearchFunctions'
import ReactPaginate from 'react-paginate'

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
    setFilters (newFilters)
    setPage (newPage)
    //console.log("filters", filters)
    setLoading(true)
    setErr(null)

    try {
      let data;
      const hasFilters = newFilters.genres.length || newFilters.year || newFilters.sort !== "popularity.desc"
      if (newFilters.query && hasFilters) {
        // Jos on tekstihaku + suodattimia, voi käyttää discoveria ilman querya
        // yhdistäminen: hae searchilla ja suodata clientissä 
        // Tässä valitaan discover, koska TMDB ei yhdistä suoraan query + with_genres
        data = await discoverMovies({
          genres: newFilters.genres,
          year: newFilters.year,
          sort: newFilters.sort,
          page: newPage
        })
      } else if (newFilters.query) {
        data = await searchMoviesByText({ query: newFilters.query, page: newPage})
      } else {
        data = await discoverMovies({
          genres: newFilters.genres,
          year: newFilters.year,
          sort: newFilters.sort,
          page: newPage
        }
        );
      }
      setResults(data?.results ?? [])
      setPageCount(data?.total_pages ?? 0)
      setPage (newPage)
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <SearchBar defaultValues={defaultFilters} onSearch={runSearch} />

      {loading && <p>Loading…</p>}
      {err && <p>Failed: {String(err.message || err)}</p>}

      <div className="grid gap-3 mt-4">
        {results.map((m) => (
          <div key={m.id} className="border p-3 rounded">
          {m.poster_path && (
        <img
          src={`https://image.tmdb.org/t/p/w200${m.poster_path}`}
          alt={m.title}
        />
      )} 
            <div className="font-semibold">{m.title}</div>
            <div>{m.release_date}</div>
          </div>
        ))}
      </div>


      {pageCount > 1 &&(
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
        forcePage={page -1}
        />
      )}
    </div>
  );
}

export { Search }