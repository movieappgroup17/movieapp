import React, { useCallback, useEffect, useState } from 'react'
import './css/Showtimes.css'
import '../components/Header'
import Header from '../components/Header'

export default function Showtimes() {

  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const [shows, setShows] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())

  // function goes through XML-data recursively and changes it to JSON-object
  const xmlToJson = useCallback((node) => {

    const json = {}
    
    let children = [...node.children]

    if (!children.length) return node.innerHTML

    for (let child of children) {
      const hasSiblings = children.filter(c => c.nodeName === child.nodeName).length > 1

      if (hasSiblings) {
        if (!json[child.nodeName]) {
          json[child.nodeName] = [xmlToJson(child)]
        } else {
          json[child.nodeName].push(xmlToJson(child))
        }
      } else {
        json[child.nodeName] = xmlToJson(child)
      }
    }
    return json
  },[])

   // function to parse XML
  const parseXML = useCallback((xml) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'application/xml')
    return xmlToJson(xmlDoc)  // calls function to change XMLDoc to JSON
  },[xmlToJson])


  // Hook that fetches all Finnkino theatres
  useEffect(()=>{
    fetch('https://www.finnkino.fi/xml/TheatreAreas/')
    .then(response => response.text())
    .then(xml => {
      const json = parseXML(xml)
      console.log(json.TheatreAreas.TheatreArea)
      setAreas(json.TheatreAreas.TheatreArea)
    })
    .catch(error => {
      console.log(error)
    })
  }, [parseXML])

  // function to fetch showtimes for selected theatre/area
  const getShowtimes = (theatre, date) => {

    console.log('getshowtimesissa ', date)  // debugging

    fetch('https://www.finnkino.fi/xml/Schedule/?area=' + theatre + '&dt=' + date)
    .then(response => response.text())
    .then(xml => {
      const json = parseXML(xml)
      console.log(json)

    if (json.Schedule && json.Schedule.Shows && json.Schedule.Shows.Show) {
      let shows = json.Schedule.Shows.Show;

      // making sure shows is used as table instead of a single object (in case of only one show for the day)
      if (!Array.isArray(shows)) {
        shows = [shows]
      }

      // debugging
      for (let i = 0; i < shows.length; i++) {
        const show = shows[i]
      }
      setShows(shows)
    } else {
      setShows([])
    }
    })
    .catch(error => {
      console.log(error)
    })
  }

  // function to handle selection of theatre and to store selected ID for later usage
  const handleAreaChoice = (event) => {

    const selectedTheatre = event.target.value
    
    setSelectedArea(selectedTheatre)
    console.log('Selected area id: ', selectedTheatre)  // debugging

    setCurrentDate(new Date()) // makes sure new search is started on today's date

    getShowtimes(selectedTheatre, currentDate.toLocaleDateString('fi-FI')) // calls function to fetch showtimes
  }

  // function to handle next -button
  const handleNextDayButton = () => {

    // set currentDate to nextday
    const nextDay = new Date(currentDate)
    nextDay.setDate(currentDate.getDate() + 1)
    setCurrentDate(nextDay)

    // if theatre/area has been already chosen and the date changes -> fetch new showtimes for new date
    if (selectedArea) {
      getShowtimes(selectedArea, formatDate(nextDay))
    }
  }

  const handlePreviosDayButton = () => {

    if (currentDate > new Date() ) {
      // set currentDate to yesterday
      const yesterday = new Date(currentDate)
      yesterday.setDate(currentDate.getDate() - 1)
      setCurrentDate(yesterday)

      // if theatre/area has been already chosen and the date changes -> fetch new showtimes for new date
      if (selectedArea) {
        getShowtimes(selectedArea, formatDate(yesterday))
      }
    }
  }

  // function to check right format for date
  function formatDate(date) {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  return `${d}.${m}.${y}`
}

  
  return (
    <>
    <Header pageTitle={"Finnkino Showtimes"}/>
      
      <div id="content">

        <div id='firstColumn'>
          <select onChange={handleAreaChoice}>
            {
              areas.map(area => (
                <option key={area.ID} value={area.ID}>{area.Name}</option>
              ))
            }
          </select>
        </div>

        <div id='secondColumn'>
          <h2>Shows</h2>
          <h3 id='date'>{currentDate.toLocaleDateString()}</h3>
          <button type='button' onClick={handlePreviosDayButton}>Previous</button>
          <button type='button' onClick={handleNextDayButton}>Next</button>
          <div>
            {shows.map((show, index) => (
              <div key={index}>
                <h3 id='movieName'>{show.Title}</h3>

                <div id="showtimeContent">
                  <div id='movieImage'>
                    {show.Images.EventSmallImagePortrait && (
                      <img src={show.Images.EventSmallImagePortrait} alt={`${show.Title} poster`} />
                    )}
                  </div>

                  <div id='movieText'>
                    <p>
                      Showtime: {new Date(show.dttmShowStart).toLocaleTimeString('fi-FI', {hour: '2-digit', minute: '2-digit'})}
                    </p>
                    <p>
                      Auditorium: {show.TheatreAuditorium}
                    </p>
                    <p>
                      Language: {show.SpokenLanguage.Name}
                    </p>
                    <p>
                      Genre: {show.Genres}
                    </p>
                  </div>

                  <div>
                    {show.RatingImageUrl && (
                      <img src={show.RatingImageUrl} alt="Rating" />
                    )}
                  </div>

                </div> 

              </div>
            ))}
        </div>
        
        {shows.length === 0 && selectedArea && (
          <p id="noShows">No shows today</p>
        )}
        </div>
      </div>
    </>
  )
}
