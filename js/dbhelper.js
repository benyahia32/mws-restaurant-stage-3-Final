/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
// Retrieve reviews
  static get DATABASE_REVIEWS_URL() {
    const port = 1337
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.openDatabase().then(function(db) {
      const store = db.transaction(['restaurants']).objectStore('restaurants');
      store.getAll().then(function(data) {
        if (data.length > 0) {
          callback(null, data);
        } else {
          fetch(DBHelper.DATABASE_URL)
          .then(function(response) {
            return response.json();
          })
          .then(function(json) {
            DBHelper.openDatabase().then(function(db) {
              const tx = db.transaction(['restaurants'], 'readwrite');
              const store = tx.objectStore('restaurants');
              json.forEach(restaurant => {
                store.put(restaurant);
              });
            });
            callback(null, json);
          })
          .catch(error => {
            const errorResponse = (`Request failed. Return the status of ${error}`);
            callback(errorResponse, null);
          });
        }
      });
    });

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    DBHelper.openDatabase().then(function(db) {
      const store = db.transaction(['restaurants']).objectStore('restaurants');
      store.get(parseInt(id)).then(function(data) {
        if (data) {
          callback(null, data);
        } else {
          DBHelper._fetchRestaurantByIdAndAddToDb(id, callback);
        }
      });
    });
  }

  /**
   * Fetch a restaurant by its ID and add it to the database
   */
  static _fetchRestaurantByIdAndAddToDb(id, callback) {
    fetch(`${DBHelper.DATABASE_URL}/${id}`)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      DBHelper.openDatabase().then(function(db) {
        const tx = db.transaction(['restaurants'], 'readwrite');
        const store = tx.objectStore('restaurants');
        store.put(json);
      });
      callback(null, json);
    })
    .catch(error => {
      const errorResponse = (`Request failed. Return the status of ${error}`);
      callback(errorResponse, null);
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }
  static fetchReviews(id, callback) {
    DBHelper.openDatabase().then(db => {
      const tx = db.transaction(['reviews'], 'readwrite');
      const store = tx.objectStore('reviews');
      store.get(id).then(data => {
        if (data) {
          callback(null, data);
          // If newer data available from server, fetch and display that.
          DBHelper._fetchReviewsAndAddToDB(id, callback);
        } else {
          DBHelper._fetchReviewsAndAddToDB(id, callback);
        }
      })
    });
  }

  static _fetchReviewsAndAddToDB(id, callback) {
    fetch(DBHelper.DATABASE_REVIEWS_URL + `/?restaurant_id=${id}`)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      DBHelper.openDatabase().then(db => {
        const tx = db.transaction(['reviews'], 'readwrite');
        const store = tx.objectStore('reviews');
        store.delete(id);
        store.put(json, id);
      });
      callback(null, json);
    })
    .catch(error => {
      const errorResponse = (`Failed to fetch review from restaurant id: ${id}`);
      callback(errorResponse, null);
    });
  }


  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  static imageSetUrlForRestaurant(restaurant) {
      return (`/images/${restaurant.id}-1600_large.jpg 1200w, /images/${restaurant.id}-800_medium.jpg 800w, /images/${restaurant.id}-400_small.jpg 400w` );
  }

/**
   * Restaurant image alt.
   */
  static imageAltForRestaurant(restaurant) {
    let shortDesc = ["classical indoor decoration",
                 "enjoy large mozzarella pizzas",
                 "large mozzarella pizza",
                 "beautiful entrance at street corner",
                 "cool open kitchen",
                 "classical American dinying room with flag",
                 "two men wating at thec cosy entrance",
                 "classical european atmosphere",
                 "busy but relaxed ambiance",
                 "tidy and clean"
         ]

    return (`${restaurant.name} restaurant, ${shortDesc[restaurant.id-1]}`);
  }


  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      keyboard: false
      })
      marker.addTo(newMap);
    return marker;
  }
  /**
   * POST a review to the database
   */
  static postRestaurantReview(postData, callback) {
    const postURL = 'http://localhost:1337/reviews'
    fetch(postURL, {
      method: 'POST',
      body: JSON.stringify(postData),
      headers : {'Content-Type': 'application/json'}
    })
    .then(response => {
      return response.json();
    })
    .then(json => {
      callback(null, json);
      DBHelper.addReviewToDb(json);
    })
    .catch(error => {
      DBHelper.openDatabase().then(function(db) {
        const tx = db.transaction(['offline-reviews'], 'readwrite');
        const store = tx.objectStore('offline-reviews');
        store.put(postData);
      });
      callback(error, null);
    });
  }

  /**
   * Get pending reviews
   */
  static getPendingReviews(callback) {
    DBHelper.openDatabase().then(function(db) {
      const store = db.transaction(['offline-reviews'], 'readwrite')
      .objectStore('offline-reviews');
      store.getAll().then(function(data) {
        if (data.length !== 0) {
          store.clear().then(() => {
            callback(null, data);
          })
        }
      })
    });
  }
  /**
   * Add a review to idb
   */
  static addReviewToDb(review) {
    DBHelper.openDatabase().then(db => {
      const store = db.transaction(['reviews'], 'readwrite')
      .objectStore('reviews');
      store.get(review.restaurant_id).then(data => {
        let reviews = review;
        if (data) {
          data.push(review);
          reviews = data;
        }
        store.put(reviews, review.restaurant_id);
      });
    });
  }
// Amen favorite status
  static amendFavorite(restaurant) {
    DBHelper.openDatabase().then(db => {
      const store = db.transaction(['restaurants'], 'readwrite')
      .objectStore('restaurants');
      store.put(restaurant);
    });
  }

  //Pending favorite
  static pendingFavorite(id, callback) {
    DBHelper.openDatabase().then(function(db) {
      const store = db.transaction(['offline-favorites'], 'readwrite')
      .objectStore('offline-favorites');
      store.get(id).then(function(data) {
        if (data) {
          store.delete(id);
          callback(null, data);
        } else {
          callback(null, null);
        }
      })
      .catch(error => {
        callback(error, null);
      })
    });
  }
  // Restaurant toggle
  static toggleFavorite(restaurant, callback) {
    const url = `${DBHelper.DATABASE_URL}/${restaurant.id}/?${restaurant.is_favorite === 'true' ? 'is_favorite=false' : 'is_favorite=true'}`
    fetch(url, {method: 'PUT'})
    .then(response => response.json())
    .then(json => {
      DBHelper.amendFavorite(json);
      callback(null, json);
    })
    .catch(error => {
      DBHelper.openDatabase().then(db => {
        const tx = db.transaction(['offline-favorites'], 'readwrite');
        const store = tx.objectStore('offline-favorites');
        store.get(restaurant.id).then(data => {
          if (data) {
            store.delete(restaurant.id);
          } else {
            store.put({
              id: restaurant.id,
              favorite: restaurant.is_favorite === 'true' ? true : false
            });
          }
        });
      });
      callback(error, null);
    });
  }
  //Favorite button
  static favoriteButton(restaurant) {
    const favorite = document.createElement('button');
    favorite.classList.add('favorite-star');
    favorite.setAttribute('tabindex', '0');
    if (restaurant.is_favorite === 'true') {
      favorite.innerHTML = '&#9733';
      favorite.setAttribute('aria-label', `Remove ${restaurant.name} from favorites`);
      favorite.classList.add('favorited');    
    } else {
      favorite.innerHTML = '&#9734';
      favorite.setAttribute('aria-label', `Add ${restaurant.name} to favorites`);
      favorite.classList.remove('favorited');
    }
    DBHelper.pendingFavorite(restaurant.id, (error, favorite) => {
      if (error) {
        console.error(error);
      } else if (favorite){
        DBHelper.toggleFavorite(favorite, (error, response) => {
          if (error) {
            console.error(error);
          } else {
            console.log(response);
          }
        });
      }
    });
    favorite.setAttribute('role', 'button');
    favorite.addEventListener('click', (event) => {
      DBHelper.toggleFavorite(restaurant, (error, response) => {
        if (error) {
          console.error(error);
        } else {
          restaurant.is_favorite = response.is_favorite;
          if (response.is_favorite === 'true') {
            favorite.innerHTML = '&#9733';
            favorite.setAttribute('aria-label', `Remove ${restaurant.name} from favorites`);
            favorite.classList.add('favorited');  
          } else {
            favorite.innerHTML = '&#9734';
            favorite.setAttribute('aria-label', `Add ${restaurant.name} to favorites`);
            favorite.classList.remove('favorited');
          }
        }
      });
    });
    return favorite;
  }

  static openDatabase() {
    if (!'serviceWorker' in navigator) {
      return Promise.resolve();
    }
  
    return idb.open('restaurantreviews', 1, function(upgradeDb) {
      const restaurants = upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
      });

      const offlineReviews = upgradeDb.createObjectStore('offline-reviews', {
        autoIncrement: true
      });

      const offlineFavorites = upgradeDb.createObjectStore('offline-favorites', {
        keyPath: 'id'
      });

      const reviews = upgradeDb.createObjectStore('reviews', {autoIncrement: true});
    });
  }

}
