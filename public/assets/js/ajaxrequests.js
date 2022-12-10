
function removeProduct(cartId, productId) {
    
    $.ajax({
      url: "/removeProduct",
      data: {
        cart: cartId,
        product: productId,
      },
      method: "post",
      success: () => {
        Swal.fire({
          title: "Product removed from cart!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(function () {
          location.reload();
        });
      },
    });
  }

  function changeQuantity(cartId, productId, count) {
			
    let quantity = parseInt(document.getElementById(productId).innerHTML);
    $.ajax({
      url: "/changeQuantity",
      data: {
        cart: cartId,
        product: productId,
        count: count,
      },
      method: "post",
      success: (response) => {
        document.getElementById(productId).innerHTML = quantity + count;
        document.getElementById("sum").innerText = response.productData[0].total+"₹";
        document.getElementById("netamount").innerText = response.productData[0].total+"₹";
        console.log(response);
      },
    });
  }

  function removeFromWishlist(wishlistId, productId) {
    $.ajax({
      url: "/removeFromWishlist",
      method: "post",
      data: {
        wishlistId,
        productId,
      },
      success: () => {
        Swal.fire({
          title: "Product removed from wishlist!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(function (){
          location.reload();
        })

      },
    });
  }