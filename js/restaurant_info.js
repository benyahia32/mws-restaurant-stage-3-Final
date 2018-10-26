let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  setTimeout(() => {
    let map = document.getElementById('map');
    map.setAttribute('tabindex', '-1');
    let children = map.querySelectorAll('a');
    children.forEach(child => {
      child.setAttribute('tabindex', '-1');
    });
  }, 0);
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiYmVueWFoaWEzMiIsImEiOiJjampxN3I2Y2kydWprM3Fzb3Ztbmh0djYxIn0.xQV5_c8dkp2lWcsFZieeyw',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      if (!self.restaurant.reviews) {
        restaurant.reviews = DBHelper.fetchReviews(self.restaurant.id, (error, reviews) => {
          if (!error) {
            self.restaurant.reviews = reviews;
            // fill reviews
            //remove reviews
            removeReviewsHTML();
            fillReviewsHTML();
          }
        });
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.tabIndex = 0;
  address.title = 'address';

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  //image.alt = `${restaurant.name} `;
  //image.alt = `${restaurant.name} restaurant, ${shortDesc[restaurant.id-1]}`;
  image.alt = DBHelper.imageAltForRestaurant(restaurant);
  image.tabIndex = 0;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSetUrlForRestaurant(restaurant);

  // Add favorite button
  const starButton = DBHelper.favoriteButton(restaurant);
  starButton.classList.add('restaurant-favorite-star');
  const primaryStarButton = document.getElementById('favorite-button');
  primaryStarButton.parentNode.replaceChild(starButton, primaryStarButton);
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.tabIndex = 0;
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  //fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  hours.setAttribute('role', 'list');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.setAttribute('role', 'listitem');
    const day = document.createElement('td');
    day.tabIndex = 0;
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.tabIndex = 0;
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  DBHelper.getPendingReviews((error, reviews) => {
    //load prior reviews..
    reviews.forEach((review) => {
      DBHelper.postRestaurantReview(review, (error, response) => {
        if (error) {
          console.log("fillReviewsHTML " + error);
        }
        displayRecentlySubmittedReview(response);
      });
    });
  });

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}
removeReviewsHTML = () => {
  const list = document.getElementById('reviews-list');
  list.innerHTML = "";
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.setAttribute('role', 'listitem');
  const name = document.createElement('p');
  name.tabIndex = 0;
  name.innerHTML = review.name;
  li.appendChild(name);

  if (review.createdAt) {
    const date = document.createElement('p');
    date.innerHTML = `Posted: ${new Date(review.createdAt).toDateString()}`;
    date.classList.add('review-date');
    li.appendChild(date);
  }
//Update the date
  // Last update
  if (review.updatedAt && review.updatedAt !== review.createdAt) {
    const updatedDate = document.createElement('p');    
    date.innerHTML = `Posted: ${new Date(review.createdAt).toDateString()}`;
    date.classList.add('review-date');
    li.appendChild(date);
  }
  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.tabIndex = 0;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.tabIndex = 0;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
//Submit the review via the form
submitReview = (form) => {
  const reviewName = form.elements.namedItem('review-name');
  const reviewRating = form.elements.namedItem('review-rating');
  const reviewComments = form.elements.namedItem('review-comments');
  const restaurantID = self.restaurant.id;

  if (!(reviewName && reviewRating && reviewComments)) {
    return false;
  }
    // Display loader
  const reviewDiv = document.getElementById('review-submission');
  reviewDiv.style.display = 'none';
  
  const loader = document.createElement('div');
  loader.classList.add('loader');
  loader.id = ('review-loader');
  document.getElementById('review-submission-container').append(loader);

  // POST content
  const postData = {
    'restaurant_id': restaurantID,
    'name': reviewName.value,
    'rating': reviewRating.value,
    'comments': reviewComments.value
  }

  // Submit post
  DBHelper.postRestaurantReview(postData, (error, response) => {
    if (error) {
      hideLoader();
      displayReviewSubmissionError(error);
      return false;
    }
    hideLoader();
    displayReviewSubmissionSuccess();
    displayRecentlySubmittedReview(response);
  });
  return false;
}
/**
 * Display confirmation modal
 */
displayConfirmationModal = (options) => {

  const reviewModal = document.createElement('div');
  reviewModal.classList.add('review-modal');
  reviewModal.id = 'review-modal';
// Modal tittle
  if (options.title) {
    const modalTitle = document.createElement('h3');
    modalTitle.innerHTML = options.title;
    modalTitle.classList.add('review-modal-title');
    reviewModal.append(modalTitle);
  }
// Modal details
  if (options.details) {
    const modalDetails = document.createElement('p');
    modalDetails.innerHTML = options.details;
    modalDetails.classList.add('review-modal-details');
    reviewModal.append(modalDetails);
  }
  // Modal Ok Button
  const modalConfirm = document.createElement('button');
  modalConfirm.innerHTML = 'Ok';
  modalConfirm.classList.add('review-modal-button');
  modalConfirm.addEventListener('click', () => {
    const reviewModal = document.getElementById('review-modal');
    reviewModal.parentNode.removeChild(reviewModal);
  });
  reviewModal.append(modalConfirm);

  // Add it all to review section
  document.getElementById('review-submission-container').append(reviewModal);
}
//Succesful submission
displayReviewSubmissionSuccess = () => {
  const modalData = {
    title: 'Success',
    details: 'Your review has been submitted successfully.'
  }
  displayConfirmationModal(modalData);
}
//Error on submission
displayReviewSubmissionError = (error) => {
  const modalData = {
    title: 'Error',
    details: 'Your review will be resubmitted when possible. We apologize for the inconvenience.'
  }
  displayConfirmationModal(modalData);
}
//Display new review
displayRecentlySubmittedReview = (reviewData) => {
  const reviewsList = document.getElementById('reviews-list');
  const newReview = createReviewHTML(reviewData);
  newReview.style.backgroundColor = '#FFFFCC';
  reviewsList.insertBefore(newReview, reviewsList.childNodes[0]);
}
/**
 * Hide loader
 */
hideLoader = () => {
  const reviewLoader = document.getElementById('review-loader');
  if (reviewLoader) {
    reviewLoader.parentNode.removeChild(reviewLoader);
    document.getElementById('review-name').value = '';
    document.getElementById('review-rating').value = '';
    document.getElementById('review-comments').value = '';
    document.getElementById('review-submission').style.display = 'block';
    return true;
  }
  return false;
}
