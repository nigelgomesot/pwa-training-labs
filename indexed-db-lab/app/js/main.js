/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var idbApp = (function() {
  'use strict';

  // TODO 2 - check for support
  if (!('indexedDB' in window)) {
    console.log('indexedDB not supported by Browser.');
    return;
  }

  var dbPromise = idb.open('couches-n-things', 5, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        // a placeholder case so that the switch block will 
        // execute when the database is first created
        // (oldVersion is 0)
      case 1:
        console.log('Creating products object store');
        upgradeDb.createObjectStore('products', { keyPath: 'id' });

        // TODO 4.1 - create 'name' index
      case 2:
        console.log('Creating a name index');
        var store = upgradeDb.transaction.objectStore('products');
        store.createIndex('name', 'name', { unique: true });

        // TODO 4.2 - create 'price' and 'description' indexes
      case 3:
        console.log('Creating a price index');
        var store = upgradeDb.transaction.objectStore('products');
        store.createIndex('price', 'price',);

        console.log('Creating a description index');
        var store = upgradeDb.transaction.objectStore('products');
        store.createIndex('description', 'description');

        // TODO 5.1 - create an 'orders' object store
      case 4:
        console.log('Creating orders object store');
        upgradeDb.createObjectStore('orders', { keyPath: 'id' });

    }
  });

  function addProducts() {

    // TODO 3.3 - add objects to the products store

    dbPromise.then(db => {
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      const items = [
        {
          name: 'Couch',
          id: 'cch-blk-ma',
          price: 499.99,
          color: 'black',
          material: 'mahogany',
          description: 'A very comfy couch',
          quantity: 3
        },
        {
          name: 'Armchair',
          id: 'ac-gr-pin',
          price: 299.99,
          color: 'grey',
          material: 'pine',
          description: 'A plush recliner armchair',
          quantity: 7
        },
        {
          name: 'Stool',
          id: 'st-re-pin',
          price: 59.99,
          color: 'red',
          material: 'pine',
          description: 'A light, high-stool',
          quantity: 3
        },
        {
          name: 'Chair',
          id: 'ch-blu-pin',
          price: 49.99,
          color: 'blue',
          material: 'pine',
          description: 'A plain chair for the kitchen table',
          quantity: 1
        },
        {
          name: 'Dresser',
          id: 'dr-wht-ply',
          price: 399.99,
          color: 'white',
          material: 'plywood',
          description: 'A plain dresser with five drawers',
          quantity: 4
        },
        {
          name: 'Cabinet',
          id: 'ca-brn-ma',
          price: 799.99,
          color: 'brown',
          material: 'mahogany',
          description: 'An intricately-designed, antique cabinet',
          quantity: 11
        },
        {
          name: 'Chair2',
          id: 'ch-blu-pin2',
          price: 49.99,
          color: 'blue',
          material: 'pine',
          description: 'A plain chair for the kitchen table',
          quantity: 1
        }
      ];

      return Promise.all(items.map(item => {
        console.log('Adding item:', item);
        
        return store.add(item);
        })
      ).catch(err => {
        console.error('Adding item failed:', err);

        tx.abort();
      }).then(() => {
        console.log('Add products completed.');
      });
    });
  }

  function getByName(key) {

    // TODO 4.3 - use the get method to get an object by name
    return dbPromise.then(db => {
      const tx = db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const index = store.index('name');

      return index.get(key);
    });
  }

  function displayByName() {
    var key = document.getElementById('name').value;
    if (key === '') {return;}
    var s = '';
    getByName(key).then(function(object) {
      if (!object) {return;}

      s += '<h2>' + object.name + '</h2><p>';
      for (var field in object) {
        s += field + ' = ' + object[field] + '<br/>';
      }
      s += '</p>';

    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function getByPrice() {

    // TODO 4.4a - use a cursor to get objects by price
    const lower = document.getElementById('priceLower').value;
    const upper = document.getElementById('priceUpper').value;
    const lowerNum = Number(lower);
    const upperNum = Number(upper);

    if (lower === '' && upper === '') { return };

    let range;
    if (lower !== '' && upper !== '') {
      range = IDBKeyRange.bound(lowerNum, upperNum);
    } else if ( lower === '' ) {
      range = IDBKeyRange.upperBound(upperNum);
    } else {
      range = IDBKeyRange.lowerBound(lowerNum);
    }

    let s = '';
    dbPromise.then(db => {
      let tx = db.transaction('products', 'readonly');
      let store = tx.objectStore('products');
      let index = store.index('price');

      return index.openCursor(range);
    }).then(function showRange(cursor) {
      if (!cursor) { return; }

      console.log(`Cursored at: ${cursor.value.name}`);

      s += `<h2>Price - ${cursor.value.price}</h2><p>`;

      for (let field in cursor.value) {
        s += `${field} = ${cursor.value[field]} <br>`;
      }

      s += '</p>';

      return cursor.continue().then(showRange);
    }).then(() => {
      if (s === '') { s =  '<p>No results.</p>'; }

      document.getElementById('results').innerHTML = s;
    });
  }

  function getByDesc() {
    var key = document.getElementById('desc').value;
    if (key === '') {return;}
    var range = IDBKeyRange.only(key);
    var s = '';
    dbPromise.then(function(db) {

      // TODO 4.4b - get items by their description
      const tx =  db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const index = store.index('description');

      return index.openCursor(range);

    }).then(function showRange(cursor) {
      if (!cursor) { return; }

      console.log(`Cursored at: ${cursor.value.name}`);

      s += `<h2>Description - ${cursor.value.description} </h2><p>`;

      for (let field in cursor.value) {
        s += `${field} = ${cursor.value[field]} </br>`;
      }
      s += '</p>';

      return cursor.continue().then(showRange);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function addOrders() {

    // TODO 5.2 - add items to the 'orders' object store
    dbPromise.then(db => {
      const tx = db.transaction('orders', 'readwrite');
      const store = tx.objectStore('orders');

      const items = [
        {
          name: 'Cabinet',
          id: 'ca-brn-ma',
          price: 799.99,
          color: 'brown',
          material: 'mahogany',
          description: 'An intricately-designed, antique cabinet',
          quantity: 7
        },
        {
          name: 'Armchair',
          id: 'ac-gr-pin',
          price: 299.99,
          color: 'grey',
          material: 'pine',
          description: 'A plush recliner armchair',
          quantity: 3
        },
        {
          name: 'Couch',
          id: 'cch-blk-ma',
          price: 499.99,
          color: 'black',
          material: 'mahogany',
          description: 'A very comfy couch',
          quantity: 3
        }
      ];

      return Promise.all(
        items.map(item => {
          console.log('adding item:', item);

          return store.add(item);
        })
      ).catch(err => {
        console.error('Adding orders failed:', err);
        tx.abort();
      }).then(() => {
        console.log('Adding items completed');
      });
    });
  }

  function showOrders() {
    var s = '';
    dbPromise.then(function(db) {

      // TODO 5.3 - use a cursor to display the orders on the page
      var tx = db.transaction('orders', 'readonly');
      var store = tx.objectStore('orders');

      return store.openCursor();
    }).then(function buildShowOrders(cursor) {
      if (!cursor) { return };

      console.log(`Cursored at: ${cursor.value.name}`);
      s += `<h2>Name - ${cursor.value.name} </h2><p>`;

      for (let field in cursor.value) {
        s += `${field} = ${cursor.value[field]} </br>`;
      }
      s += '</p>';

      return cursor.continue().then(buildShowOrders);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('orders').innerHTML = s;
    });
  }

  // PENDING: Get all orders

  function getOrders() {

    // TODO 5.4 - get all objects from 'orders' object store
    return dbPromise.then(db => {
      const tx = db.transaction('orders', 'readonly');
      const store = tx.objectStore('orders');

      return store.getAll();
    });
  }

  function fulfillOrders() {
    getOrders().then(function(orders) {
      return processOrders(orders);
    }).then(function(updatedProducts) {
      updateProductsStore(updatedProducts);
    });
  }

  function processOrders(orders) {

    // TODO 5.5 - get items in the 'products' store matching the orders
    return dbPromise.then(db => {
      const tx = db.transaction('products');
      const store = tx.objectStore('products');
      
      return Promise.all(
        orders.map(order => {
          return store.get(order.id).then(product => decrementQuantity(product, order));
        })
      );
    });
  }

  function decrementQuantity(product, order) {

    // TODO 5.6 - check the quantity of remaining products
    return new Promise((resolve, reject) => {
      const item = product;
      const quantityRemaining = item.quantity - order.quantity;

      if (quantityRemaining < 0) {
        const errorMessage = `Product ${item.id} out of stock!`; 
        console.error(errorMessage);
        document.getElementById('receipt').innerHTML = `<h3>${errorMessage}</h3>`

        throw `Out of stock!`;
      }

      item.quantity = quantityRemaining;
      resolve(item);
    });
  }

  function updateProductsStore(products) {
    dbPromise.then(function(db) {

      // TODO 5.7 - update the items in the 'products' object store
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');

      return Promise.all(
        products.map(product => {
          console.log(`updating product: ${product.id}`);

          return store.put(product);
        })
      ).catch(err => {
        console.error('update products store failed', err);

        tx.abort();
      }).then(() => {
        console.log('update products store completed');

        tx.complete;
      });

    }).then(function() {
      console.log('Orders processed successfully!');
      document.getElementById('receipt').innerHTML =
      '<h3>Order processed successfully!</h3>';
    });
  }

  return {
    dbPromise: (dbPromise),
    addProducts: (addProducts),
    getByName: (getByName),
    displayByName: (displayByName),
    getByPrice: (getByPrice),
    getByDesc: (getByDesc),
    addOrders: (addOrders),
    showOrders: (showOrders),
    getOrders: (getOrders),
    fulfillOrders: (fulfillOrders),
    processOrders: (processOrders),
    decrementQuantity: (decrementQuantity),
    updateProductsStore: (updateProductsStore)
  };
})();
