import React, { useCallback, useEffect, useState } from 'react'
import './css/Showtimes.css'
import '../components/Header'
import Header from '../components/Header'

export default function Showtimes() {

  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const [shows, setShows] = useState([])


  // function goes through XML-data recursively and changes it to JSON-object
  const xmlToJson = useCallback((node) => {

    const json = {}
    
    let children = [...node.children]

    if (!children.length) return node.innerHTML

    for (let child of children) {
      const hasSiblings = children.filter(c => c.nodeName === child.nodeName).length > 1

      if (hasSiblings) {
        if (!json[child.nodeName]) {
          json[child.nodeName] = [xmlToJson(child)];
        } else {
          json[child.nodeName].push(xmlToJson(child));
        }
      } else {
        json[child.nodeName] = xmlToJson(child);
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


  // function to fetch showtimes for selected theatre/area
  const getShowtimes = (theatre) => {

    fetch('https://www.finnkino.fi/xml/Schedule/?area=' + theatre)
    .then(response => response.text())
    .then(xml => {
      const json = parseXML(xml)
      console.log(json)

    if (json.Schedule && json.Schedule.Shows && json.Schedule.Shows.Show) {
      const shows = json.Schedule.Shows.Show

      // debugging
      for (let i = 0; i < shows.length; i++) {
        const show = shows[i]
        console.log(show.Title, show.Genres)
        console.log(show.Images.EventSmallImagePortrait)
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


  // function to handle selection of theatre and to store selected ID for later usage
  const handleAreaChoice = (event) => {

    const selectedTheatre = event.target.value
    
    setSelectedArea(selectedTheatre)
    console.log('Selected area id: ', selectedTheatre)  // debugging
    getShowtimes(selectedTheatre) // calls function to fetch showtimes
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
          <h3 id='date'>{new Date().toLocaleDateString()}</h3>
          
          <div>
            {shows.map((show, index) => (
              <div key={index}>
                <h3 id='movieName'>{show.Title}</h3>

                <div id="showtimeContent">
                  <div id='movieImage'>
                    {show.Images.EventSmallImagePortrait && (
                      <img src={show.Images.EventSmallImagePortrait} />
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
                      <img src={show.RatingImageUrl} />
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
