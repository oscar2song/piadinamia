"use strict";

angular.module("piadinamia").factory("sharedCartService",
    ["cartService", "$firebase", "Firebase", "FBURL",
    function (cartService, $firebase, Firebase, FBURL) {
        var mySubscribers = [],
            myCatalogName,
            cartByUser = {},
            cartByItem = {};

        function updateCart (user, cart) {
            var myCart = [],
                total = 0,
                counter = 0;

            angular.forEach(cart, function (item) {
                myCart.push(item);

                total += item.qty * item.price;

                if (cartByItem[item.item]) {
                    counter = cartByItem[item.item].total + item.qty;
                } else {
                    counter = item.qty;
                }

                cartByItem[item.item] = {
                    total: counter
                };
                console.log(user.name, item.item, item.qty);
            });

            cartByUser[user.id] = {
                name: user.name,
                total: total,
                cart: myCart
            };
        }

        return {
            init: function (subscribers, catalogName, userId) {
                var subscribersRef,
                    url = FBURL + "/users/" + userId +
                        "/catalogs/" + catalogName + "/subscribers";

                mySubscribers = subscribers;
                myCatalogName = catalogName;

                subscribersRef = new Firebase(url);

                $firebase(subscribersRef).$on("loaded", function (subs) {
                    mySubscribers = [];
                    angular.forEach(subs, function (item) {
                        mySubscribers.push(item);
                    });
                });

                $firebase(subscribersRef).$on("change", function () {
                    console.log("subscribers change");
                });

                mySubscribers.forEach(function (user) {
                    var cartRef,
                        url = FBURL + "/users/" + user.id +
                            "/catalogs/" + myCatalogName + "/cart";

                    cartRef = new Firebase(url);

                    $firebase(cartRef).$on("loaded", function (cart) {
                        console.log(user.name, "-- loaded");
                        updateCart(user, cart);
                    });

                    $firebase(cartRef).$on("change", function () {
                        $firebase(cartRef).$on("loaded", function (cart) {
                            console.log(user.name, "-- change");
                            updateCart(user, cart);
                        });
                    });

                });

            },

            getCartByItem: function () {
                return cartByItem;
            },

            getCartByUser: function () {
                return cartByUser;
            }

        };

    }]);
