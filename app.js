require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");
const app = express();

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/artist-search", async (req, res) => {
  const { artistName } = req.query;
  try {
    const searchResult = await spotifyApi.searchArtists(artistName);
    const searchResultArr = searchResult.body.artists.items;

    res.render("artistSearch", { searchResultArr });
  } catch (err) {
    console.log(err);
  }
});

app.get("/albums/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const albums = await spotifyApi.getArtistAlbums(id);
    const albumsArr = albums.body.items;

    res.render("albums", { albumsArr });
  } catch (err) {
    console.log(err);
  }
});

app.get("/albums/view-tracks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const album = await spotifyApi.getAlbum(id);
    const tracksIdArr = album.body.tracks.items.map((track) => track.id);
    const tracks = await spotifyApi.getTracks(tracksIdArr);
    const tracksArr = tracks.body.tracks;

    res.render("tracks", { tracksArr });
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
