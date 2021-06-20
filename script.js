const BASE_URL = 'https://api.mercadolibre.com/sites/MLB/search?q=';
const ITEM_URL = 'https://api.mercadolibre.com/items/';
const CART_ITEMS = '.cart__items';
const LOCAL_STORAGE_KEY = 'shopCart';

let itemStorage = [];

const cartItemsIdUpdate = () => {
  const cartItems = document.querySelectorAll('.cart__item');
  cartItems.forEach((item, index) => {
    const itemElement = item;
    itemElement.id = index;
  })
}

const updateTotalPrice = () => {
  const totalPrice = itemStorage.reduce((acc, { price }) => acc + price, 0);
  const totalElement = document.querySelector('.total-price');
  totalElement.innerText = totalPrice.toFixed(2);
};

const addLocalStorage = (item) => {
  itemStorage.push(item);
  const itemStorageString = JSON.stringify(itemStorage);
  localStorage.setItem(LOCAL_STORAGE_KEY, itemStorageString);
  updateTotalPrice();
};

const rmvLocalStorage = (cartItem) => {
  itemStorage = itemStorage.filter((item, index) => index !== Number(cartItem.id));
  const itemStorageString = JSON.stringify(itemStorage);
  localStorage.setItem(LOCAL_STORAGE_KEY, itemStorageString);
  cartItemsIdUpdate();
  updateTotalPrice();
};

const createProductImageElement = (imageSource) => {
  const img = document.createElement('img');``
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

const createCustomElement = (element, className, innerText) => {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

const createProductItemElement = ({ id: sku, title: name, thumbnail_id: image, price }) => {
  const section = document.createElement('section');
  const divImg = document.createElement('div');
  divImg.className = 'img__div';
  section.className = 'item';
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createCustomElement('span', 'item__price', `R$ ${price.toFixed(2)}`));
  divImg.appendChild(createProductImageElement(`https://http2.mlstatic.com/D_NQ_NP_${image}-W.webp`));
  section.appendChild(divImg);
  return section;
}

const getSkuFromProductItem = (item) => item.querySelector('span.item__sku').innerText;

const cartItemClickListener = (event) => {
  event.target.remove();
  rmvLocalStorage(event.target);
}

const createCartItemElement = ({ id: sku, title: name, price: salePrice }) => {
  const li = document.createElement('li');
  const cartLength = document.querySelector(CART_ITEMS).childNodes.length;
  li.id = cartLength;
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const getLocalStorage = () => {
  if (localStorage.getItem(LOCAL_STORAGE_KEY) !== null) {
    itemStorage = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    itemStorage.forEach((item) => {
      const parentElement = document.querySelector(CART_ITEMS);
      parentElement.appendChild(createCartItemElement(item));
    });
  }
  updateTotalPrice();
};

const removeLoading = () => {
  const element = document.querySelector('.loading');
  element.remove();
};

const createItemList = async (item) => {
  try {
    const apiPromise = await fetch(`${BASE_URL}${item}`);
    const apiObj = await apiPromise.json();
    const itemResults = apiObj.results;
    const parentElement = document.querySelector('.items');
    itemResults
      .forEach((element) => parentElement
        .appendChild(createProductItemElement(element)));
  } catch (error) {
    console.log('Erro na criação dos items da página');
  } 
  removeLoading();
};

const createLoading = () => {
  const bodyElement = document.querySelector('body');
  const containerElement = document.querySelector('.container');
  bodyElement.insertBefore(createCustomElement('p', 'loading', 'Carregando...'), containerElement);
};

const removeItemList = () => {
  const itemList = document.querySelectorAll('.item');
  const parentElement = document.querySelector('.items');
  itemList.forEach((item) => { parentElement.removeChild(item) });
};

const searchProduct = () => {
  const searchButton = document.getElementById('search-button');
  searchButton.addEventListener('click', async () => {
    const { value } = document.getElementById('search');
    removeItemList();
    createLoading();
    await createItemList(value);
    addButtonsEvent();
  });
};

const searchOnReturn = () => {
  const searchInput = document.querySelector('#search');
  const createTaskButton = document.querySelector('#search-button');
  searchInput.addEventListener('keyup', (event) => {
    event.preventDefault();
    if (event.keyCode === 13) {
      createTaskButton.click();
    }
  })
}

const createCartItem = async (item) => {
  const itemID = getSkuFromProductItem(item);
  try {
    const itemFromApi = await fetch(`${ITEM_URL}${itemID}`);
    const itemObj = await itemFromApi.json();
    const parentElement = document.querySelector(CART_ITEMS);
    parentElement.appendChild(createCartItemElement(itemObj));
    addLocalStorage(itemObj);
    } catch (error) {
      console.log('Erro ao adicionar item no carrinho.');
    }
};

const addButtonsEvent = () => {
  const itemList = document.querySelectorAll('.item');
  itemList.forEach((item) => {
    item.addEventListener('click', () => {
      createCartItem(item);
    });
  });
};

const eraseCart = () => {
  const eraseButton = document.querySelector('.empty-cart');
  eraseButton.addEventListener('click', () => {
    const shopCart = document.querySelector(CART_ITEMS);
    const cartItem = document.querySelectorAll('.cart__item');
    itemStorage = [];
    cartItem.forEach((item) => shopCart.removeChild(item));
    localStorage.clear();
    updateTotalPrice();
  });
};

window.onload = async () => {
  try {
    await createItemList('computador');
  } catch (error) {
    console.log('Erro na window.onload');
  }
  addButtonsEvent();
  getLocalStorage();
  eraseCart();
  // removeLoading();
  searchProduct();
  searchOnReturn();
};