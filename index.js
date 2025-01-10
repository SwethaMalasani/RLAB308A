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
/**6.Create a progress bar to indicate the request is in progress.
The progressBar element has already been created for you.
You need only to modify its width style property to align with the request progress.
In your request interceptor, set the width of the progressBar element to 0%.
This is to reset the progress with each request.
Research the axios onDownloadProgress config option.
Create a function "updateProgress" that receives a ProgressEvent object.
Pass this function to the axios onDownloadProgress config option in your event handler.
console.log your ProgressEvent object within updateProgress, and familiarize yourself with its structure.
Update the progress of the request using the properties you are given.
Note that we are not downloading a lot of data, so onDownloadProgress will likely only 
fire once or twice per request to this API. This is still a concept worth familiarizing yourself with for future projects.*/
function updateProgress(progressEvent) {
  console.log(progressEvent);

  if (progressEvent.total > 0) {
    let percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    progressBar.style.width = `${percent}%`;
  }
}
/**Within this additional file, change all of your fetch() functions to Axios!
Axios has already been imported for you within index.js.
If you've done everything correctly up to this point, this should be simple.
If it is not simple, take a moment to re-evaluate your original code.
Hint: Axios has the ability to set default headers. Use this to your advantage by setting a default header 
with your API key so that you do 
not have to send it manually with all of your requests! You can also set a default base URL! */
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
/**5.Add Axios interceptors to log the time between request and response to the console.
Hint: you already have access to code that does this!
Add a console.log statement to indicate when requests begin.
As an added challenge, try to do this on your own without referencing the lesson material. */
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
/**To practice posting data, we will create a system to "favourite" certain images.
The skeleton of this favourite() function has already been created for you.
This function is used within Carousel.js to add the event listener as items are created.
This is why we use the export keyword for this function.
Post to the cat API's favourites endpoint with the given id.
The API documentation gives examples of this functionality using fetch(); use Axios!
Add additional logic to this function such that if the image is already favourited, you delete that favourite using the API, giving this function "toggle" behavior.
You can call this function by clicking on the heart at the top right of any image. */
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
/**Test your favourite() function by creating a getFavourites() function.
Use Axios to get all of your favourites from the cat API.
Clear the carousel and display your favourites when the button is clicked.
You will have to bind this event listener to getFavouritesBtn yourself.
Hint: you already have all of the logic built for building a carousel. If that is not in its own function, 
maybe it should be so that you do not have to repeat yourself in this section. */
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
