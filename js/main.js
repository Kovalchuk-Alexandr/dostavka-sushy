const items = [
    {
        id: 1,
        title: "Филадельфия хит ролл",
        price: 300,
        weigth: 180,
        itemsInBox: 6,
        img: "philadelphia.jpg",
        counter: 1,
    },
    {
        id: 2,
        title: "Калифорния темпура",
        price: 250,
        weigth: 250,
        itemsInBox: 6,
        img: "california-tempura.jpg",
        counter: 1,
    },
    {
        id: 3,
        title: "Запеченый ролл 'Калифорния'",
        price: 230,
        weigth: 182,
        itemsInBox: 6,
        img: "zapech-california.jpg",
        counter: 1,
    },
    {
        id: 4,
        title: "Филадельфия",
        price: 230,
        weigth: 320,
        itemsInBox: 6,
        img: "philadelphia.jpg",
        counter: 1,
    },
];

// Глобальная переменная для хранения состояния приложения
const state = {
    items: items,
    cart: []
}

const productsContainer = document.querySelector("#productsMainContainer");
const cartItemsContainer = document.querySelector("#cartItemsHolder");
const cartEmptyNotification = document.querySelector("#cartEmpty");
const cartTotal = document.querySelector("#cartTotal");
const makeOrder = document.querySelector("#makeOrder");
const cart = document.querySelector("#cart");
const cartTotalPrice = document.querySelector("#cartTotalPrice");
const deliveryPriceContainer = document.querySelector("#deliveryPriceContainer");

const deliveryMinimalFree = 600;

const renderItem = function (item) {
    
    const markup = `
        <div class="col-md-6">
            <div class="card mb-4" data-productid=${item.id}>
                <img class="product-img" src="img/roll/${item.img}" alt="${item.title}">
                <div class="card-body text-center">
                    <h4 class="item-title">${item.title}</h5>
                    <p><small class="text-muted">${item.itemsInBox} шт.</small></p>
    
                    <div class="details-wrapper">
                        <div class="items">
                            <div class="items__control" data-click="minus">-</div>
                            <div class="items__current" data-count>${item.counter}</div>
                            <div class="items__control" data-click="plus">+</div>
                        </div>
    
                        <div class="price">
                            <div class="price__weight">${item.weigth}г.</div>
                            <div class="price__currency">${item.price} ₽</div>
                        </div>
                    </div>
    
                    <button data-click="addToCart" type="button" class="btn btn-block btn-outline-warning">+ в корзину</button>
                    
                </div>
            </div>
        </div>
    `;
    
    productsContainer.insertAdjacentHTML('beforeend', markup);
}

const renderItemInCart = function (item) {
    const markup = `
        <div class="cart-item" data-productid="${item.id}">
            <div class="cart-item__top">
                <div class="cart-item__img">
                    <img src="img/roll/${item.img}" alt="${item.title}">
                </div>
                <div class="cart-item__desc">
                    <div class="cart-item__title">${item.title}</div>
                    <div class="cart-item__weight">${item.itemsInBox} шт. / ${item.weigth}г.</div>

                    <div class="cart-item__details">

                        <div class="items items--small">
                            <div class="items__control" data-click="minus">-</div>
                            <div class="items__current" data-count>${item.counter}</div>
                            <div class="items__control" data-click="plus">+</div>
                        </div>

                        <div class="price">
                            <div class="price__currency">
                                <span data-sum>${item.sum}</span>
                                <span>₽</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    `;

    cartItemsContainer.insertAdjacentHTML("beforeend", markup);
};

// Выводим все элементы (карточки)
state.items.forEach(renderItem);


// Ф-я обновления счетчика в модели
const itemUpdateCounter = function (id, type, place) {
    // console.log(id);
    // console.log(type);

    switch (place) {
        case 'items':
            target = state.items;
            break;
        case 'cart':
            target = state.cart;
            break;
    
        default:
            break;
    }

    // Находим в 'state' (БД) индекс кликнутого элемента по переданному индексу
    // const itemIndex = state.items.findIndex(function (element) {
    const itemIndex = target.findIndex(function (element) {
        if (element.id == id ) {
            return true;
        }
    }); // [ {i:1}, {i:2}, {i:3}, {i:4},]

    console.log("itemIndex: " + itemIndex);

    // Получаем значение счетчика
    // let count = state.items[itemIndex].counter;
    let count = target[itemIndex].counter;
    
    if (type == "minus" && count > 1) {
        count--;
        target[itemIndex].counter = count;
  
    } else if (type == "plus") {
        count++;
        target[itemIndex].counter = count;
        // state.items[itemIndex].counter = count;
    }
    // console.log('In ');
    // console.log(target);
    // console.log(target[itemIndex].counter + ' items');
    
};

// Ф-я обновления счетчика в разметке
const itemUpdateViewCounter = function (id, place) {

    let target;
    let container;
    
    switch (place) {
        case "items":
            target = state.items;
            container = productsContainer;
            break;
        case "cart":
            target = state.cart;
            container = cartItemsContainer;
            break;

        default:
            break;
    }

    calculateTotalPrice();

    // Находим в 'state.items' (БД) индекс кликнутого элемента по переданному индексу
    // чтобы получить значение его свойства 'counter'
    const itemIndex = target.findIndex(function (element) {
        if (element.id == id) {
            return true;
        }
    });

    // Получаем значение счетчика
    const countToShow = target[itemIndex].counter;
    let sumToShow = undefined;

    if (target[itemIndex].sum) {
        sumToShow = target[itemIndex].sum;
        // console.log("sumToShow = " + sumToShow);
    }

    // console.log("countToShow = " + countToShow);

    // 2.1) Находим в разметке счетчик // [data-count]
    // const currentProduct = productsContainer.querySelector(
    const currentProduct = container.querySelector(
        '[data-productid="' + id + '"]'
    );
    const counter = currentProduct.querySelector("[data-count]");
    const sum = currentProduct.querySelector("[data-sum]");

    // 2.2) Обновить значение счетчика в разметке
    counter.innerText = countToShow;
    if (sumToShow) {
        sum.innerText = sumToShow;
    }
}

// Ф-я проверки пустой корзины
const checkCart = function () {
    if (state.cart.length > 0) {
        cartEmptyNotification.style.display = "none";
        cartTotal.style.display = "block";
        makeOrder.style.display = "block";
    } else {
        cartTotal.style.display = "none";
        makeOrder.style.display = "none";
        cartEmptyNotification.style.display = "block";
    }

}

// Ф-я добавления товаров в корзину
const addToCart = function (id) {
    // Находим в 'state.items' (БД) индекс кликнутого элемента по переданному индексу
    // чтобы получить значение его свойства 'counter'
    const itemIndex = state.items.findIndex(function (element) {
        if (element.id == id) {
            return true;
        }
    });

    // Проверяем, есть ли такой товар уже в корзине
    const itemIndexInCart = state.cart.findIndex(function (element) {
        if (element.id == id) {
            return true;
        }
    });

    // console.log("itemIndex: " + itemIndex);
    // console.log("itemIndexInCart: " + itemIndexInCart);

    if (itemIndexInCart != -1) {
        console.log('Товар существует, нужно изменить счетчик');
        console.log(state.cart[itemIndexInCart].counter);
        console.log(state.items[itemIndex].counter);
        state.cart[itemIndexInCart].counter += state.items[itemIndex].counter;
    } else {
            const newItem = {
            id: state.items[itemIndex].id,
            title: state.items[itemIndex].title,
            price: state.items[itemIndex].price,
            weigth: state.items[itemIndex].weigth,
            itemsInBox: state.items[itemIndex].itemsInBox,
            img: state.items[itemIndex].img,
            counter: state.items[itemIndex].counter,
        };

        // Добавляем в массив 'cart[]' выбранный товар
        state.cart.push(newItem);
    }
        

    // Сбрасываем счетчик товаров в разметке
    state.items[itemIndex].counter = 1;
    itemUpdateViewCounter(id, 'items');

    
    // Проверяем пустая корзина или нет, для отображения доп.информации
    checkCart();
    calculateTotalPrice();
    
    // очищаем контейнер и 
    cartItemsContainer.innerHTML = "";
    // Вывод товара из корзины
    state.cart.forEach(renderItemInCart);

    // console.log(state.cart);
}


// Ф-я проверяет сумму доставки, и если больше 300 - выводим 'бесплатно'
const calculateDelivery = function () {
    if (state.totalPrice >= deliveryMinimalFree) {
        deliveryPriceContainer.innerText = ' безплатно';
        deliveryPriceContainer.classList.add('free');
    } else {
        deliveryPriceContainer.innerText = " 200 ₽";
        deliveryPriceContainer.classList.remove("free");
    }
}


// Ф-я подсчета общей стоимости
const calculateTotalPrice = function () {
    let totalPrice = 0;

    state.cart.forEach(function (element) {
        let thisPrice = element.counter * element.price; 
        // console.log('Id: ' + element.id + ", Total: " + thisPrice);
        element.sum = thisPrice;
        
        totalPrice += thisPrice;
    })
    
    // console.log(state.cart);
    // console.log(totalPrice);
    state.totalPrice = totalPrice;
    cartTotalPrice.innerText = totalPrice;

    calculateDelivery();
}


// Ловим событие в родительском контейнере
productsContainer.addEventListener('click', function (e) {
 
    
    if (e.target.matches('[data-click="minus"]')) {
        // console.log('-');
        const id = e.target.closest("[data-productid]").dataset.productid;
        itemUpdateCounter(id, 'minus', 'items'); //Обновление счетчика в модели
        itemUpdateViewCounter(id, "items"); //Обновление счетчика в проекте
    } else if (e.target.matches('[data-click="plus"]')) {
        // console.log('+');
        const id = e.target.closest("[data-productid]").dataset.productid;
        itemUpdateCounter(id, "plus", "items");
        itemUpdateViewCounter(id, "items");
    } else if (e.target.matches('[data-click="addToCart"]')) {
        const id = e.target.closest("[data-productid]").dataset.productid;
        addToCart(id);
    }

    // Мой вариант (короче)
    // if (e.target.innerText === '-') {
    //     console.log('minus');
    // } else if (e.target.innerText === "+") {
    //     console.log("plus");
    // }
})

// Ловим событие в корзине
cart.addEventListener('click', function (e) {
 
    // console.log(id);

    if (e.target.matches('[data-click="minus"]')) {
        // console.log('-');
        const id = e.target.closest("[data-productid]").dataset.productid;
        itemUpdateCounter(id, 'minus', 'cart'); //Обновление счетчика в модели
        itemUpdateViewCounter(id, 'cart'); //Обновление счетчика в проекте
    } else if (e.target.matches('[data-click="plus"]')) {
        // console.log("+");
        const id = e.target.closest("[data-productid]").dataset.productid;
        itemUpdateCounter(id, "plus", "cart");
        itemUpdateViewCounter(id, 'cart');
    }
 })