function removeProduct(cartId, productId) {
    console.log("man")
    $.ajax({
      url: "/removeProduct",
      data: {
        cart: cartId,
        product: productId,
      },
      method: "post",
      success: () => {
        location.reload();
      },
    });
  }

  function changeQuantity(cartId, productId, count) {
			
    let quantity = parseInt(document.getElementById("quantity").innerHTML);
    $.ajax({
      url: "/changeQuantity",
      data: {
        cart: cartId,
        product: productId,
        count: count,
      },
      method: "post",
      success: () => {
        document.getElementById("quantity").innerHTML = quantity + count;
        location.reload();
      },
    });
  }