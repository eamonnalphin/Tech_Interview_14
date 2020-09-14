/**
 * Code related to the Five Star Widget only
 * Be sure to include FiveStar.css in the html header as this contains the styling for the widget.
 *
 * To Use:
 * 1) Place <div id="NEW_PRODUCT_ID_STARRATINGWIDGET" class="rating"></div> wherever you want a widget to show up.
 * 2) Call the "addStarRatingWidgets()" function, whenever your page is ready to add the widgets.
 * This should be after you've loaded the product details as the widget needs the product data (specifically the product ID and a current rating) in order to work.
 * Author: Eamonn Alphin
 */


let starArray = ["_1Stars", "_2Stars", "_3Stars", "_4Stars", "_5Stars"]; //for easy iteration and adjustment of the number of stars desired.


/**
 * Sets the rating for a given productID
 * Author: Eamonn Alphin
 * @param productID the product ID of the star rating widget.
 * @param rating the rating to apply
 */
function AddOrAdjustStarRatingWidgets(productID,rating){
  //get the identifier for this widget
  let identifier = '#'+productID+"_StarRatingWidget"

  //reset the widget
  $(identifier).empty()

  //append stars to the widget
  for(let j = starArray.length-1; j>=0; j--) {

    //create the star ID based on the productID
    let starID = productID + starArray[j];

    //a star defaults to 'empty', unless the current rating indicates it should be filled.
    let star = "☆";
    if(rating >= j+1){
      star = "★"
    }

    //create the string that will set a single star onto the widget.
    let widgetString = "<span id='"+starID +"' onclick='userClickRating(this)'>"+star+"</span>"

    //append the star to the widget.
    $(identifier).append(widgetString)
  }
}


/**
 * Handles the user clicking on a star rating for a product.
 * Author: Eamonn Alphin
 * @param starRatingID the id of the star being clicked.
 */
function userClickRating(starRatingID){
  //the starRatingID contains the productID being clicked and the chosen rating, but it has to be broken up
  //the last part of the id will be '_#Stars
  console.log(starRatingID.id)
  let starRating = getRatingFromID(starRatingID.id);
  let productID = getProductIDFromID(starRatingID.id);
  submitStarRating(starRating, productID)
    .then(function(newRating){
      AddOrAdjustStarRatingWidgets(productID,newRating)
    })
    .catch(function(error){
      alert("Something went wrong and your rating could not be submitted. " + error)
    })
}


/**
 * Pulls the star rating out of the ID
 * Author: Eamonn Alphin
 * @param starRatingID xdufi88_5Stars -> 5
 */
function getRatingFromID(starRatingID){

  //looking for _#Stars
  let starRegex = new RegExp('_\\dStars$')

  //get the index that _#Stars starts at, in the string.
  let starRatingIndex = starRatingID.search(starRegex)

  //get just the number value, which will be the next index.
  let starRating = starRatingID.substr(starRatingIndex+1,1)

  //return the number value
  console.log(starRating + " Stars")

  return starRating
}

/**
 * Pulls the product ID out of the StarRatingID
 * Author: Eamonn Alphin
 * @param starRatingID xdufi88_5Stars -> xdufi88
 */
function getProductIDFromID(starRatingID){

  //looking for _#Stars
  let starRegex = new RegExp('_\\dStars$')

  //get the index that _#Stars starts at, in the string.
  let starRatingIndex = starRatingID.search(starRegex)

  //get the previous part of the string, up to the star rating
  let productID = starRatingID.substr(0,starRatingIndex)

  //return the product ID
  //console.log("Product ID: " + productID)

  return productID

}

/**
 * Sends the star rating, the productID and the UserID to the server to record.
 * Authentication is assumed to be in the header and handled on the back end.
 * Author:Eamonn Alphin
 * @param starRating the rating given by the user
 * @param productID the ID of the product being rated
 */
function submitStarRating(starRating,productID){

  return new Promise(function(resolve,reject){
    $.post("FiveStar.html", {starRating:starRating,productID:productID}, function(newAvgStarRating){

      backendSimulation(starRating,productID)
        .then(function(simulatedNewAvgStarRating){
        console.log("new average rating:", simulatedNewAvgStarRating)
        resolve(simulatedNewAvgStarRating)
      }).catch(function(error){
        alert("Something went wrong and your rating could not be submitted: " + error)
      })
    });
  })

}

/**
 * This function simulates stuff happening on the backend, for demonstration purposes.
 * Author: Eamonn Alphin
 * @param starRating the user's rating
 * @param productID the ID of the product being rated
 */
function backendSimulation(starRating, productID){

  //Normally, the following would happen on the backend:
  //1. Has the user already rated this product?
  //yes -> change the user's rating
  //no -> add the user's rating, record that they rated this product ID.
  //2. Calculate new average score (rounded down b/c half-stars are not in scope)
  //3. Return new average star rating.


  //for simplicity, lets assume the user hasn't rated any products before.
  return new Promise(function(resolve,reject){

    //get the list of products
    loadProductDataFromServer().then(function(productList){

      //find the product being updated
      let thisProduct = productList.find(product => product.productID === productID);

      //if the product exists...
      if(thisProduct){
        //get the ratings for the product
        let productRatings = thisProduct.productRatings

        //append the new rating
        productRatings.push(starRating);

        //resolve with the new average rating.
        resolve(averageRating(productRatings))
      }else{
        reject(new Error("product not found"))
      }

    })
  })


}


/**
 * Simple function to calculate an average rating from an array of ratings.
 * Author: Eamonn Alphin
 * @param ratings
 * @returns {number}
 */
function averageRating(ratings){
  let sum = 0
  for(let i = 0; i < ratings.length; i++){
    sum += parseInt(ratings[i]);
  }

  return Math.floor(sum/ratings.length);
}
