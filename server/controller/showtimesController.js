import fetch from 'node-fetch'

export async function getShowtimes(req, res, next) {
    const { area, date } = req.params
      try {
        const response = await fetch(`https://www.finnkino.fi/xml/Schedule/?area=${area}&dt=${date}`)
        const xml = await response.text()
        res.send(xml) // send the XML back to the frontend
      } catch (err) {
        next(err)
      }
}