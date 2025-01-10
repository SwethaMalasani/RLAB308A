import * as Carousel from "./Carousel.js"; // Assuming Carousel.js contains necessary carousel methods

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Store your API key here for easy access.
const API_KEY = 'live_w0Ezw2vCZfWAMsTIAn4kkFfqZpvrrOlZOc682APaaI8IijxazuV1ArD8fmeTvIkF';

// Define the async function to load the breeds and populate the dropdown
/**Create an async function "initialLoad" that does the following:
Retrieve a list of breeds from the cat API using fetch().
Create new <options> for each of these breeds, and append them to breedSelect.
Each option should have a value attribute equal to the id of the breed.
Each option should display text equal to the name of the breed.
This function should execute immediately.*/
async function initialLoad() {
  try {
    // Fetch the list of breeds from the Cat API
    const response = await fetch('https://api.thecatapi.com/v1/breeds', {
      headers: {
        'x-api-key': API_KEY
      }
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error('Failed to fetch breeds');
    }

    // Parse the response data as JSON
    const breeds = await response.json();

    // Loop through the breeds and create an <option> element for each
    breeds.forEach(breed => {
      const option = document.createElement('option');
      option.value = breed.id;  // Set the value attribute to the breed's ID
      option.textContent = breed.name;  // Set the text of the option to the breed's name
      breedSelect.appendChild(option);  // Append the <option> to the breedSelect dropdown
    });
    
    // Add the event listener for breed selection
    breedSelect.addEventListener("change", async (e) => {
      const selectedBreedId = e.target.value;
      if (selectedBreedId) {
        await loadBreedImagesAndInfo(selectedBreedId, breeds);
      }
    });

  } catch (error) {
    console.error('Error loading breeds:', error);
  }
}

// Function to load breed images and information
/**Create an event handler for breedSelect that does the following:
Retrieve information on the selected breed from the cat API using fetch().
Make sure your request is receiving multiple array items!
Check the API documentation if you are only getting a single object.
For each object in the response array, create a new element for the carousel.
Append each of these new elements to the carousel.
Use the other data you have been given to create an informational section within the infoDump element.
Be creative with how you create DOM elements and HTML.
Feel free to edit index.html and styles.css to suit your needs.
Remember that functionality comes first, but user experience and design are also important.
Each new selection should clear, re-populate, and restart the carousel.
Add a call to this function to the end of your initialLoad function above to create the initial carousel. */
async function loadBreedImagesAndInfo(selectedBreedId, breeds) {
  // Clear existing carousel items
  Carousel.clear();

  try {
    // Fetch images for the selected breed
    const response = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${selectedBreedId}&limit=10&api_key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch breed images');
    }

    // Parse the response data as JSON (array of images)
    const images = await response.json();
    
    // Clear the breed info section
    infoDump.innerHTML = '';

    // Find the breed object in the breeds array
    const selectedBreed = breeds.find(breed => breed.id === selectedBreedId);
    
    // Create breed information section
    const breedInfo = document.createElement('div');
    breedInfo.classList.add('breed-info');
    breedInfo.innerHTML = `
      <h2>${selectedBreed.name}</h2>
      <p><strong>Origin:</strong> ${selectedBreed.origin}</p>
      <p><strong>Description:</strong> ${selectedBreed.description}</p>
      <p><strong>Temperament:</strong> ${selectedBreed.temperament}</p>
    `;
    infoDump.appendChild(breedInfo);

    // Create carousel items for each image in the response
    images.forEach(image => {
      const carouselItem = Carousel.createCarouselItem(image.url, selectedBreed.name, image.id);
      Carousel.appendCarousel(carouselItem);
    });

    // Restart the carousel to reflect the new images
    Carousel.start();

  } catch (error) {
    console.error('Error fetching breed images:', error);
  }
}

// Execute the initialLoad function to populate the breed dropdown
initialLoad();
