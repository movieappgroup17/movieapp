import React, { useCallback, useEffect, useState } from 'react'

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

  const getShowtimes = (theatre) => {
    fetch('https://www.finnkino.fi/xml/Schedule/?area=' + theatre)
    .then(response => response.text())
    .then(xml => {
      const json = parseXML(xml)
      console.log(json)

    if (json.Schedule && json.Schedule.Shows && json.Schedule.Shows.Show) {
      const shows = json.Schedule.Shows.Show

      for (let i = 0; i < shows.length; i++) {
        const show = shows[i]
        console.log(show.Title, show.Genres)
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
    console.log('Selected area id: ', selectedTheatre)
    getShowtimes(selectedTheatre)
  }
  
  return (
    <>
      <div>
        <h1>Finnkino Showtimes</h1>
        <select onChange={handleAreaChoice}>
          {
            areas.map(area => (
              <option key={area.ID} value={area.ID}>{area.Name}</option>
            ))
          }
        </select>
        {selectedArea && <p>Valittu alueen ID: {selectedArea}</p>}{/*shows p -element if theatre is selected. For development purposes*/}
      </div>

      <div>
        <h2>Shows</h2>
        {shows.map((show, index) => (
          <div key={index}>
            <h3>
              {show.Title}
            </h3>

            <p>
              Genre: {show.Genres}
            </p>

            <p>
              Showtime: {show.dttmShowStart}
            </p>

            <p>
              Auditorium: {show.TheatreAuditorium}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
