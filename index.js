import * as Carousel from "./Carousel.js"; // Importing carousel functionality
//import axios from "axios"; // Axios for making HTTP requests

// Elements for breed selection, information dump, progress bar, and favourites button
const breedSelect = document.getElementById("breedSelect");
const infoDump = document.getElementById("infoDump");
const progressBar = document.getElementById("progressBar");
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// API Key for authentication
const API_KEY = 'live_w0Ezw2vCZfWAMsTIAn4kkFfqZpvrrOlZOc682APaaI8IijxazuV1ArD8fmeTvIkF';

// Function to update the progress bar during an API request
function updateProgress(progressEvent) {
  console.log(progressEvent);

  if (progressEvent.total > 0) {
    let percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    progressBar.style.width = `${percent}%`;
  }
}

// Initialize the breed selection dropdown by fetching breed data
async function initialLoad() {
  const req = await axios.get("https://api.thecatapi.com/v1/breeds", {
    headers: { 'x-api-key': API_KEY }
  });
  const data = req.data;

  // Add each breed as an option in the breedSelect dropdown
  data.forEach(breed => {
    let option = document.createElement("OPTION");
    option.id = breed.id;
    option.value = breed.id;
    option.text = breed.name;
    breedSelect.appendChild(option);
  });
}

// Execute initial load to populate the breedSelect dropdown
initialLoad();

// Event listener to handle breed selection and image fetching
breedSelect.addEventListener("change", async (e) => {
  // Clear any previous carousel items
  Carousel.clear();

  // Get the breed ID from the selected option
  let index = e.target.selectedIndex;
  let val = e.target.options[index].id;
  console.log(`Selected breed ID: ${val}`);

  // Fetch images for the selected breed
  const req = await axios.get(
    `https://api.thecatapi.com/v1/images/search?limit=10&breed_ids=${val}`,
    {
      headers: { 'x-api-key': API_KEY },
      onDownloadProgress: updateProgress
    }
  );
  console.log(req.data[0].url); // Log the first image URL for verification

  // Create and append carousel items for each image
  req.data.forEach(imageData => {
    let carItem = Carousel.createCarouselItem(imageData.url, imageData.id);
    Carousel.appendCarousel(carItem);
  });

  // Start the carousel functionality
  Carousel.start();
});

// Axios interceptors for logging request/response time
axios.interceptors.request.use(request => {
  progressBar.style.width = "0%"; // Reset progress bar on new request
  document.body.style.cursor = 'progress'; // Change cursor to indicate loading

  request.startTime = new Date(); // Save start time
  console.log(`Request started at: ${request.startTime.toLocaleTimeString()}`);
  return request;
}, error => Promise.reject(error));

axios.interceptors.response.use(response => {
  const duration = new Date() - response.config.startTime;
  console.log(`Response received at: ${new Date().toLocaleTimeString()}`);
  console.log(`Request duration: ${duration} ms`);
  
  document.body.style.cursor = 'default'; // Reset cursor when the response is received
  return response;
}, error => {
  document.body.style.cursor = 'default'; // Reset cursor in case of error
  return Promise.reject(error);
});

// Function to handle toggling favourite status for an image
export async function favourite(imgId) {
  try {
    // Get all favourites
    const favouritesResponse = await axios.get('https://api.thecatapi.com/v1/favourites', {
      headers: { 'x-api-key': API_KEY },
    });

    // Check if the image is already in favourites
    const favouriteExists = favouritesResponse.data.some(fav => fav.image.id === imgId);

    if (favouriteExists) {
      // Remove the image from favourites
      const favToRemove = favouritesResponse.data.find(fav => fav.image.id === imgId);
      await axios.delete(`https://api.thecatapi.com/v1/favourites/${favToRemove.id}`, {
        headers: { 'x-api-key': API_KEY },
      });
      console.log(`Removed image with ID ${imgId} from favourites`);
      alert('Image removed from favourites');
    } else {
      // Add the image to favourites
      await axios.post('https://api.thecatapi.com/v1/favourites', {
        image_id: imgId,
      }, {
        headers: { 'x-api-key': API_KEY },
      });
      console.log(`Added image with ID ${imgId} to favourites`);
      alert('Image added to favourites');
    }
  } catch (error) {
    console.error('Error favouriting the image:', error);
    alert('An error occurred while favouriting the image');
  }
}

// Function to fetch and display the user's favourites
async function getFavourites() {
  try {
    // Clear the carousel
    Carousel.clear();

    // Fetch all favourite images
    const response = await axios.get('https://api.thecatapi.com/v1/favourites', {
      headers: { 'x-api-key': API_KEY },
    });

    if (response.data.length === 0) {
      alert('You have no favourite images.');
      return;
    }

    // Add each favourite image to the carousel
    response.data.forEach(fav => {
      const favImage = fav.image;
      const carItem = Carousel.createCarouselItem(favImage.url, favImage.alt, favImage.id);
      Carousel.appendCarousel(carItem);
    });

    // Start the carousel
    Carousel.start();
  } catch (error) {
    console.error('Error fetching favourites:', error);
    alert('An error occurred while fetching your favourites.');
  }
}

// Bind the event listener for the "Get Favourites" button
getFavouritesBtn.addEventListener('click', getFavourites);
