import * as Carousel from "./Carousel.js";
// import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY = 'live_w0Ezw2vCZfWAMsTIAn4kkFfqZpvrrOlZOc682APaaI8IijxazuV1ArD8fmeTvIkF';


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
Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire once or twice per request to this API.
 This is still a concept worth familiarizing yourself with for future projects. */

// Function to update the progress bar
function updateProgress(progressEvent) {
  // Log the ProgressEvent object to see its structure
  console.log(progressEvent);

  if (progressEvent.total > 0) {
    // Calculate the percentage progress
    let percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    progressBar.style.width = `${percent}%`;
  }
}

/**
 * Within this additional file, change all of your fetch() functions to Axios!
Axios has already been imported for you within index.js.
If you've done everything correctly up to this point, this should be simple.
If it is not simple, take a moment to re-evaluate your original code.
Hint: Axios has the ability to set default headers. Use this to your advantage by setting a default header
 with your API key so that you do not have to send it manually with all of your requests! 
You can also set a default base URL!
 */
async function initialLoad() {
  const req = await axios.get("https://api.thecatapi.com/v1/breeds");
  const data = req.data;

  // Create an option element for each breed and add it to the breedSelect dropdown
  for (let i = 0; i < data.length; i++) {
    let option = document.createElement("OPTION");
    option.id = data[i].id;
    option.value = data[i].id;
    option.text = data[i].name;

    breedSelect.appendChild(option);
  }
}

// Execute initialLoad to populate the breedSelect dropdown
initialLoad();

// Event listener for when the user selects a breed
breedSelect.addEventListener("change", async (e) => {
  // Clear the previous carousel items
  Carousel.clear();

  // Get the breed ID from the selected option
  let index = e.target.selectedIndex;
  let val = e.target.options[index].id;
  console.log(val);

  // Fetch images for the selected breed from the API
  const req = await axios.get(
    `https://api.thecatapi.com/v1/images/search?limit=10&breed_ids=${val}&api_key=${API_KEY}`,
    {
      // Pass the updateProgress function to track download progress
      onDownloadProgress: updateProgress
    }
  );
  console.log(req.data[0].url); // Log the first image URL to verify the data

  // Create and append carousel items for each image
  for (let i = 0; i < req.data.length; i++) {
    let carItem = Carousel.createCarouselItem(req.data[i].url);
    Carousel.appendCarousel(carItem);
  }

  // Start the carousel
  Carousel.start();
});

/**5.Add Axios interceptors to log the time between request and response to the console.
Hint: you already have access to code that does this!
Add a console.log statement to indicate when requests begin.
As an added challenge, try to do this on your own without referencing the lesson material. */

// Axios interceptors for logging request and response time
axios.interceptors.request.use(request => {
  // Reset the progress bar width to 0% when a new request starts
  progressBar.style.width = "0%";
  progressBar.style.transition = "width 0.5s ease";

  /**As a final element of progress indication, add the following to your Axios interceptors:
In your request interceptor, set the body element's cursor style to "progress."
In your response interceptor, set the body element's cursor style to "default." */
  // Change the cursor style to 'progress' when the request starts
  document.body.style.cursor = 'progress';
  
  // Save the start time on the request object
  request.startTime = new Date();
  console.log(`Request started at: ${request.startTime.toLocaleTimeString()}`);
  return request;
}, error => {
  // Handle any errors with the request
  return Promise.reject(error);
});

// Response Interceptor: Log the response time and calculate the duration
axios.interceptors.response.use(response => {
  // Calculate the duration between the request and response
  const duration = new Date() - response.config.startTime;
  console.log(`Response received at: ${new Date().toLocaleTimeString()}`);
  console.log(`Request duration: ${duration} ms`);

  // Reset the cursor style to 'default' when the response is received
  document.body.style.cursor = 'default';
  
  return response;
}, error => {
  // Handle any errors with the response
  // Reset cursor to default in case of an error too
  document.body.style.cursor = 'default';
  return Promise.reject(error);
});

