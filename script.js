$(function(){
    
    const MAX_DESCRIPTION_LENGTH = 200;
    const MAX_TITLE_LENGTH = 30;
    
    localStorage.removeItem("products");
    
    fetchAndStoreProducts();
    loadCartItems();
    
    $("#produkter").click(clickAction);
    $("#cartModalList").click(cartActions);
    $("#buy-button").click(function(){
        let cart = JSON.parse(localStorage.getItem("cart"));
        if(cart.length >= 1){
            location.href = "checkout.html"
        }else{
            alert("Varukorgen är tom");
        }
    });
    
    function cartActions(event){
        let element = event.target;
        let productID = element.getAttribute("data-id");
        
        if(element.classList.contains('decrease')){
            console.log("decrease");
            decreaseCartAmount(productID);
        }else if(element.classList.contains('increase')){
            console.log("increase");
            increaseCartAmount(productID);
        }else if(element.classList.contains('remove')){
            console.log("remove");
            removeCartItem(productID);
        }
        loadCartItems();
    }

    function decreaseCartAmount(ID){
        let cartItems = JSON.parse(localStorage.getItem("cart"));
        for (let index = 0; index < cartItems.length; index++) {
            if(cartItems[index].id == ID){
                let amount = cartItems[index].amount;
                console.log("found matching product with id " + ID + " and amount " + amount);

                if(amount == 1){
                    removeCartItem(ID);
                }else{
                    cartItems[index].amount--;
                    localStorage.setItem("cart", JSON.stringify(cartItems));
                }
            }   
        }
    }

    function increaseCartAmount(ID){
        let cartItems = JSON.parse(localStorage.getItem("cart"));

        for (let index = 0; index < cartItems.length; index++) {
            if(cartItems[index].id == ID){
                let amount = cartItems[index].amount;
                console.log("found matching product with id " + ID + " and amount " + amount);
                cartItems[index].amount++;
                localStorage.setItem("cart", JSON.stringify(cartItems));
            }   
        }

    }

    function removeCartItem(ID){
        let cartItems = JSON.parse(localStorage.getItem("cart"));
        for (let index = 0; index < cartItems.length; index++) {
            if(cartItems[index].id == ID){
                cartItems.splice(index, 1);
                localStorage.setItem("cart", JSON.stringify(cartItems));
            }
        }
    }

    function loadCartItems(){
        let loadedCart = JSON.parse(localStorage.getItem("cart"));
        let totalSum = 0;
        
        console.log(loadedCart);
        $("#cartModalList").empty();
        
        if(loadedCart != null){
            loadedCart.forEach(product => renderCartItem(product));
            loadedCart.forEach(product => totalSum += (product.price * product.amount));
        }
        
        updateTotalPrice(totalSum);
    }

    function updateTotalPrice(sum){
        $("#total-sum").text("$" + sum.toFixed(2));
    }

    function renderCartItem(product){

        const ul = $("#cartModalList");

        let title;
        if(product.title.length > MAX_TITLE_LENGTH){
            title = product.title.substring(0,MAX_TITLE_LENGTH) + "...";
        }else{
            title = product.title;
        }

        let li = `<li>
                    <div class="cart-title">${title}</div>
                    <div class="cart-price">\$${product.price}</div>
                    <div class="cart-control">
                    <div class="decrease" data-id=${product.id}>-</div>
                    <div class="amount cartControls">${product.amount}</div>
                    <div class="increase" data-id=${product.id}>+</div>
                    <div class="remove" data-id=${product.id}>X</div>
                    </div>
                    </li>`;
        ul.append(li);

    }
    
    function clickAction(event){
        let element = event.target;
        if(element.className == "buy-btn"){
            let productID = element.getAttribute("data-id");
            console.log("BUYING!!! " + productID);
            addToCart(productID);
        }
    }
    async function fetchAndStoreProducts(){
        
        await fetch(`https://fakestoreapi.com/products/`)
        .then(response=>response.json())
        .then(data=>localStorage.setItem("products", JSON.stringify(data)) )
        .catch(error=>console.error(error));
        
        renderStoredProducts();
    }

    function renderStoredProducts(){
        
        let data = JSON.parse(localStorage.getItem("products"));

        data.forEach(element => {
            renderProduct(element);
        });
        
    }
    
    function renderProduct(product){
        
        let title = product.title;
        let description = product.description;
        
        if(title.length > MAX_TITLE_LENGTH){
            title = title.substring(0,MAX_TITLE_LENGTH) + "...";
        }
        if(description.length > MAX_DESCRIPTION_LENGTH){
            description = description.substring(0,MAX_DESCRIPTION_LENGTH - 3) + "..."
        }
        
        let productData = `
        <div class="card col-sm-4">
            <img class="image" src="${product.image}" alt="${product.title}">
            <h5>${title}</h5>
            <p class="price">\$${product.price}</p>
            <p>${description}</p>
            <p><button class="buy-btn" data-id="${product.id}">Köp</button></p>
            </div>`;
            
            $("#produkter").append(productData);
    }
        
    function getProduct(ID){
        let productList = JSON.parse(localStorage.getItem("products"));
        let selectedProduct = 0; 
        
        for (let index = 0; index < productList.length; index++) {
            if(productList[index].id == ID){
                return productList[index];
            }
        }
    }    
    
    function addToCart(ID){
        
        let storedCart = JSON.parse(localStorage.getItem("cart"));
        let cart = [];
        const selectedProduct = getProduct(ID);
        console.log("produkten: " + selectedProduct.title);
        
        if(storedCart != null){
            storedCart.forEach(element => cart.push(element));
        }

        let foundProduct = false;
        for (let index = 0; index < cart.length; index++) {
            if(cart[index].id == selectedProduct.id){
                cart[index].amount++;
                foundProduct = true;
                break;
            }
        }
        if(!foundProduct){
            console.log("Did not find product. Adding to cart")
            selectedProduct.amount = 1;
            cart.push(selectedProduct);
        }
        localStorage.setItem("cart", JSON.stringify(cart) );
        loadCartItems();
    }
    
    function loadProduct(ID){
        JSON.parse(localStorage.getItem("products")).forEach(product => {
            if(product.id == ID){
                console.log("returning: " + product.title);
                return product;
            }else{
                return null;
            }
        });
    }

})