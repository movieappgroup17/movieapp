import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";

export function useFavourites() {
  const { user } = useContext(UserContext);
  const [favourites, setFavourites] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(true);

  useEffect(() => {
    if (!user?.token) return;

    async function fetchFavourites() {
      setLoadingFavs(true);
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL}/favourites/user/${user.userid}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!resp.ok) throw new Error("Failed to fetch favourites");
        const data = await resp.json();
        console.log("palautetaan suosikeiksi: ", data)
        setFavourites(data); // oletetaan että backend palauttaa taulukon, jossa movieID:t
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingFavs(false);
      }
    }

    fetchFavourites();
  }, [user?.token]);

  return { favourites, setFavourites, loadingFavs };
}
