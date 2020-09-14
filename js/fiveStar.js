/**
 * Handles the Five Star Widget Problem Solution
 * including code related to adding sample products.
 * Author: Eamonn Alphin
 */

/**
 * Load the page with products and star widgets
 * Author: Eamonn Alphin
 */
$(document).ready(function () {

  // load the product data from the 'server'
  loadProductDataFromServer()
    .then(function (productList) {

      //add the products to the page
      populatePageWithProducts(productList)
        .then(function () {

          //for each product, add a star rating widget
          for(let i = 0; i < productList.length; i++){
            AddOrAdjustStarRatingWidgets(productList[i].productID, productList[i].AverageRating)
          }
        })
    })
});


/**
 * Loads the data from the server.
 * Author: Eamonn Alphin
 * @returns {Promise<unknown>}
 */
function loadProductDataFromServer() {

  //sample data
  let serverData = [
    {
      productID: "xjfis987",
      productName: "ItemA",
      productRatings: [1,1],
      AverageRating:1
    },
    {
      productID: "kskdu765",
      productName: "ItemB",
      productRatings: [5,5],
      AverageRating:5
    },
    {
      productID: "0dkfjh876",
      productName: "ItemC",
      productRatings: [3,2],
      AverageRating:2

    },
    {
      productID: "lsjfu524",
      productName: "ItemD",
      productRatings: [1,2],
      AverageRating:1
    }
  ]


  // return this as a promise because this function would be asynchronous.
  return new Promise(function (resolve, reject) {
    resolve(serverData)
  })


}


/**
 * Fills the page with products, in ProductCards.
 * This can be done in any other way, not necessarily through this function, but each product listing needs to
 * have a <div id="NEW_PRODUCT_ID_STARRATINGWIDGET" class="rating"></div> where
 * the Star Rating will appear.
 * 'NEW_PRODUCT_ID' needs to be the product ID of the product to be rated.
 * Author:Eamonn Alphin
 * @param productList
 */
function populatePageWithProducts(productList) {

  //return this as a promise because it would normally be retrieved asynchronously
  return new Promise(function (resolve, reject) {
    resolve(
      $.get("ProductCard.html", function (html_string) {
        for (let i = 0; i < productList.length; i++) {

          let product = productList[i];
          let productID = product.productID
          let productName = product.productName

          //add a product card
          $('#itemList').append(html_string);

          //Set the product name
          $('#NEW_PRODUCT_ID .card-title:first').text(productName)

          //Set the ID of the star rating widget.
          $('#NEW_PRODUCT_ID_STARRATINGWIDGET').attr('id', productID + "_StarRatingWidget")

          //set the card ID to the product ID
          $('#NEW_PRODUCT_ID').attr('id', productID)

          console.log("addedproduct:", productID)
        }
      }, 'html')
    )
  })
}




