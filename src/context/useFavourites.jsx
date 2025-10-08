import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";

// custom hook to handle favourites

export function useFavourites() {
  const { user } = useContext(UserContext); // get user from context
  const [favourites, setFavourites] = useState([]); // useState for favourites
  const [loadingFavs, setLoadingFavs] = useState(true); // useState for loading status

  // useEffect is run when user´s token is changed
  useEffect(() => {

    // if there is no token, favourites are not fetched
    if (!user?.token) return;

    // function to fetch favourites
    async function fetchFavourites() {
      setLoadingFavs(true); // loading status is set to true
      try {
        // GET request to the server to fetch user´s favourites
        const resp = await fetch(`${import.meta.env.VITE_API_URL}/favourites/user/${user.userid}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        if (!resp.ok) throw new Error("Failed to fetch favourites") // if fetch fails, throw error
        const data = await resp.json(); // change data to JSON
        //console.log("palautetaan suosikeiksi: ", data)
        setFavourites(data) // update useState with favourites
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingFavs(false) // change loading status to false after successfull fetch or an error
      }
    }

    fetchFavourites();  // call fetch function
  }, [user?.token]);

  return { favourites, setFavourites, loadingFavs }
}
