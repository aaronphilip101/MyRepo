/**
 * EstateHub Mobile Application Script (compiled JavaScript)
 * Generated from src/app.ts
 */
(function ($) {
  var SAMPLE_PROPERTIES = [
    {
      id: 'sample-1',
      title: 'Modern Riverside Apartment',
      price: 365000,
      description:
        'Experience panoramic river views in this bright two-bedroom apartment with an open-plan kitchen and south-facing balcony.',
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80'
      ],
      features: ['2 Bedrooms', '1 Bathroom', 'Balcony', 'Underground Parking'],
      location: {
        lat: 53.3478,
        lng: -6.2597,
        address: 'Docklands, Dublin 1'
      }
    },
    {
      id: 'sample-2',
      title: 'Suburban Family Home',
      price: 485000,
      description:
        'A charming detached home featuring four spacious bedrooms, landscaped gardens and a cosy sunroom ideal for family living.',
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80'
      ],
      features: ['4 Bedrooms', '3 Bathrooms', 'Garden', 'Garage'],
      location: {
        lat: 53.2981,
        lng: -6.1858,
        address: 'Blackrock, Co. Dublin'
      }
    },
    {
      id: 'sample-3',
      title: 'City Penthouse Retreat',
      price: 825000,
      description:
        'A luxurious penthouse with floor-to-ceiling windows, smart home automation and a private roof terrace for entertaining.',
      images: [
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1486304873000-235643847519?auto=format&fit=crop&w=800&q=80'
      ],
      features: ['3 Bedrooms', '2.5 Bathrooms', 'Smart Home', 'Roof Terrace'],
      location: {
        lat: 53.3394,
        lng: -6.2605,
        address: 'Grand Canal Dock, Dublin 2'
      }
    }
  ];
  var state = {
    properties: [],
    activeProperty: null,
    currentUser: null
  };
  function initialiseFirebase() {
    var _a, _b;
    if (!((_a = window.ESTATE_HUB) === null || _a === void 0 ? void 0 : _a.firebaseConfig)) {
      console.warn('Firebase config not found. Running in demo mode.');
      return null;
    }
    if (firebase.apps.length) {
      return firebase.app();
    }
    return firebase.initializeApp((_b = window.ESTATE_HUB) === null || _b === void 0 ? void 0 : _b.firebaseConfig);
  }
  function bindAuthListeners() {
    firebase.auth().onAuthStateChanged(function (user) {
      state.currentUser = user;
      updateAccountStatus();
      toggleAuthOnlySections(!!user);
    });
  }
  function loadProperties() {
    return __awaiter(this, void 0, void 0, function () {
      var snapshot, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, firebase.firestore().collection('properties').orderBy('title').get()];
          case 1:
            snapshot = _a.sent();
            data = snapshot.docs.map(function (doc) {
              return __assign({ id: doc.id }, doc.data());
            });
            state.properties = data;
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.warn('Unable to fetch properties from Firestore, using sample data.', error_1);
            state.properties = SAMPLE_PROPERTIES;
            return [3 /*break*/, 3];
          case 3:
            renderPropertyList();
            populateReservationDropdown();
            return [2 /*return*/];
        }
      });
    });
  }
  function renderPropertyList() {
    var $list = $('#propertyList');
    $list.empty();
    state.properties.forEach(function (property) {
      var $card = $('<article></article>')
        .addClass('property-card')
        .attr('tabindex', 0)
        .attr('data-id', property.id)
        .append(
          $('<img />')
            .addClass('property-card__image')
            .attr('src', property.images[0])
            .attr('alt', property.title + ' exterior')
        )
        .append(
          $('<div></div>')
            .addClass('property-card__body')
            .append($('<h4></h4>').addClass('property-card__title').text(property.title))
            .append($('<p></p>').addClass('property-card__price').text(formatPrice(property.price)))
            .append($('<p></p>').addClass('property-card__address').text(property.location.address))
        );
      $card.on('click keypress', function (event) {
        if (event.type === 'click' || event.which === 13) {
          showPropertyDetail(property.id);
        }
      });
      $list.append($card);
    });
  }
  function populateReservationDropdown() {
    var $select = $('#reservationProperty');
    $select.find('option:not(:first)').remove();
    state.properties.forEach(function (property) {
      $('<option></option>').val(property.id).text(property.title).appendTo($select);
    });
  }
  function showPropertyDetail(propertyId) {
    var property = state.properties.find(function (item) {
      return item.id === propertyId;
    });
    if (!property) {
      return;
    }
    state.activeProperty = property;
    $('#detailTitle').text(property.title);
    $('#detailContent')
      .removeClass('property-detail--empty')
      .html(renderPropertyDetailHtml(property));
    renderMap(property);
  }
  function renderPropertyDetailHtml(property) {
    var galleryHtml = property.images
      .map(function (image) {
        return '<img class="property-gallery__image" src="' + image + '" alt="' + property.title + '" />';
      })
      .join('');
    var featureHtml = property.features
      .map(function (feature) {
        return '<span class="tag">' + feature + '</span>';
      })
      .join('');
    return (
      '\n    <div>\n      <div class="property-gallery">' +
      galleryHtml +
      '</div>\n      <h4>' +
      property.title +
      '</h4>\n      <p class="property-card__address">' +
      property.location.address +
      '</p>\n      <p class="property-card__price">' +
      formatPrice(property.price) +
      '</p>\n      <p>' +
      property.description +
      '</p>\n      <div class="property-meta">\n        <div class="property-meta__features">' +
      featureHtml +
      '</div>\n      </div>\n    </div>\n    <div>\n      <div class="map-container" id="mapContainer"></div>\n      <div class="property-meta">\n        <h5>Viewing availability</h5>\n        <p>Reserve your preferred slot using the form below.</p>\n      </div>\n    </div>\n  '
    );
  }
  function renderMap(property) {
    var _a;
    if (!((_a = window.google) === null || _a === void 0 ? void 0 : _a.maps)) {
      console.warn('Google Maps failed to load.');
      return;
    }
    var container = document.getElementById('mapContainer');
    if (!container) {
      return;
    }
    var map = new window.google.maps.Map(container, {
      zoom: 14,
      center: { lat: property.location.lat, lng: property.location.lng }
    });
    new window.google.maps.Marker({
      position: { lat: property.location.lat, lng: property.location.lng },
      map: map,
      title: property.title
    });
  }
  function bindFormHandlers() {
    $('#reservationForm').on('submit', function (event) {
      return __awaiter(void 0, void 0, void 0, function () {
        var propertyId, scheduledDate, scheduledTime, notes, property, payload, error_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              event.preventDefault();
              if (!state.currentUser) {
                updateStatus('#reservationStatus', 'Please sign in to request a viewing.', true);
                return [2 /*return*/];
              }
              propertyId = String($('#reservationProperty').val());
              scheduledDate = String($('#reservationDate').val());
              scheduledTime = String($('#reservationTime').val());
              notes = String($('#reservationNotes').val() || '');
              if (!propertyId || !scheduledDate || !scheduledTime) {
                updateStatus('#reservationStatus', 'All fields are required before submitting.', true);
                return [2 /*return*/];
              }
              property = state.properties.find(function (item) {
                return item.id === propertyId;
              });
              if (!property) {
                updateStatus('#reservationStatus', 'Selected property no longer exists.', true);
                return [2 /*return*/];
              }
              payload = {
                propertyId: propertyId,
                propertyTitle: property.title,
                userId: state.currentUser.uid,
                scheduledDate: scheduledDate,
                scheduledTime: scheduledTime,
                notes: notes,
                createdAt: Date.now()
              };
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, firebase.firestore().collection('viewings').add(payload)];
            case 2:
              _a.sent();
              updateStatus('#reservationStatus', 'Viewing successfully booked. We will confirm shortly!', false);
              $('#reservationForm')[0].reset();
              return [3 /*break*/, 4];
            case 3:
              error_2 = _a.sent();
              console.error('Failed to create viewing', error_2);
              updateStatus('#reservationStatus', 'Unable to book viewing. Please try again later.', true);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
    $('#createAdForm').on('submit', function (event) {
      return __awaiter(void 0, void 0, void 0, function () {
        var title, price, address, lat, lng, description, images, features, payload, docRef, error_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              event.preventDefault();
              if (!state.currentUser) {
                updateStatus('#createAdStatus', 'Sign in to publish a property advertisement.', true);
                return [2 /*return*/];
              }
              title = String($('#adTitle').val());
              price = Number($('#adPrice').val());
              address = String($('#adAddress').val());
              lat = Number($('#adLat').val());
              lng = Number($('#adLng').val());
              description = String($('#adDescription').val());
              images = String($('#adImages').val() || '')
                .split(',')
                .map(function (url) {
                  return url.trim();
                })
                .filter(Boolean);
              features = String($('#adFeatures').val() || '')
                .split(',')
                .map(function (feature) {
                  return feature.trim();
                })
                .filter(Boolean);
              if (!title || !price || !address || !description || Number.isNaN(lat) || Number.isNaN(lng)) {
                updateStatus('#createAdStatus', 'Please complete all required fields with valid information.', true);
                return [2 /*return*/];
              }
              payload = {
                title: title,
                price: price,
                description: description,
                images: images.length ? images : SAMPLE_PROPERTIES[0].images,
                features: features.length ? features : ['New Listing'],
                location: { lat: lat, lng: lng, address: address }
              };
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, firebase.firestore().collection('properties').add(payload)];
            case 2:
              docRef = _a.sent();
              updateStatus('#createAdStatus', 'Listing published successfully!', false);
              state.properties.push(__assign({ id: docRef.id }, payload));
              renderPropertyList();
              populateReservationDropdown();
              $('#createAdForm')[0].reset();
              return [3 /*break*/, 4];
            case 3:
              error_3 = _a.sent();
              console.error('Failed to create listing', error_3);
              updateStatus('#createAdStatus', 'Unable to publish listing. Please try again later.', true);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
  }
  function bindUiEvents() {
    $('#browsePropertiesBtn').on('click', function () {
      var _a;
      (_a = document.getElementById('propertiesPanel')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    });
    $('.nav-btn').on('click', function (event) {
      var target = event.currentTarget.dataset.target;
      if (!target) return;
      var panelId = target === 'properties' ? 'propertiesPanel' : target === 'create-ad' ? 'createAdPanel' : 'accountPanel';
      var _a = document.getElementById(panelId);
      _a === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    });
    $('#closeDetailBtn').on('click', function () {
      $('#detailContent')
        .addClass('property-detail--empty')
        .html('<p>Please choose a property to view its full description, gallery, map and booking form.</p>');
      $('#detailTitle').text('Select a property to view details');
      state.activeProperty = null;
    });
  }
  function formatPrice(value) {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }
  function updateStatus(selector, message, isError) {
    var $status = $(selector);
    $status.text(message).toggleClass('is-error', isError);
  }
  function updateAccountStatus() {
    var $message = $('#accountStatus .account__message');
    if (state.currentUser) {
      $message.text('Signed in as ' + (state.currentUser.email || 'anonymous user')).removeClass('is-error');
      $('#logoutBtn').show();
    } else {
      $message.text('You are browsing as a guest. Sign in to access personalised features.').removeClass('is-error');
      $('#logoutBtn').hide();
    }
  }
  function showAccountFeedback(message, isError) {
    $('#accountStatus .account__message').text(message).toggleClass('is-error', isError);
  }
  function toggleAuthOnlySections(isAuthenticated) {
    $('#createAdPanel').toggleClass('is-disabled', !isAuthenticated);
  }
  function bindAuthForms() {
    if (!firebase.apps.length) {
      $('#authForm :input').prop('disabled', true);
      showAccountFeedback('Firebase is not configured. Demo mode active.', true);
      $('#logoutBtn').hide();
      return;
    }
    $('#authForm').on('submit', function (event) {
      return __awaiter(void 0, void 0, void 0, function () {
        var email, password, error_4;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              event.preventDefault();
              email = String($('#authEmail').val());
              password = String($('#authPassword').val());
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, firebase.auth().signInWithEmailAndPassword(email, password)];
            case 2:
              _a.sent();
              showAccountFeedback('Successfully signed in.', false);
              return [3 /*break*/, 4];
            case 3:
              error_4 = _a.sent();
              console.error('Login failed', error_4);
              showAccountFeedback('Unable to sign in. Please verify your credentials.', true);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
    $('#registerBtn').on('click', function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var email, password, error_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              email = String($('#authEmail').val());
              password = String($('#authPassword').val());
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, firebase.auth().createUserWithEmailAndPassword(email, password)];
            case 2:
              _a.sent();
              showAccountFeedback('Account created. You are now signed in!', false);
              return [3 /*break*/, 4];
            case 3:
              error_5 = _a.sent();
              console.error('Registration failed', error_5);
              showAccountFeedback('Unable to register. Please review the form and try again.', true);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    });
    $('#logoutBtn').on('click', function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, firebase.auth().signOut()];
            case 1:
              _a.sent();
              showAccountFeedback('You have been signed out.', false);
              return [3 /*break*/, 3];
            case 2:
              error_6 = _a.sent();
              console.error('Sign out failed', error_6);
              showAccountFeedback('Unable to sign out at this time.', true);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    });
  }
  function bootstrap() {
    $('#currentYear').text(new Date().getFullYear());
    var app = initialiseFirebase();
    if (app) {
      bindAuthListeners();
    }
    bindAuthForms();
    bindUiEvents();
    bindFormHandlers();
    if (app) {
      loadProperties();
    } else {
      state.properties = SAMPLE_PROPERTIES;
      renderPropertyList();
      populateReservationDropdown();
      toggleAuthOnlySections(false);
    }
  }
  $(bootstrap);
})(jQuery);

/* Polyfills for async/await and object spread generated from TypeScript */
function __assign() {
  __assign =
    Object.assign ||
    function (t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
  return __assign.apply(this, arguments);
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator['throw'](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = {
      label: 0,
      sent: function () {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
    f,
    y,
    t,
    g;
  return (
    (g = { next: verb(0), throw: verb(1), return: verb(2) }),
    typeof Symbol === 'function' && (g[Symbol.iterator] = function () {
      return this;
    }),
    g
  );
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError('Generator is already executing.');
    while (_)
      try {
        if (((f = 1), y && (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done))
          return t;
        if (((y = 0), t)) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1]))) {
              if (op[0] === 6 || op[0] === 2) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
            }
            if (op[0] === 3 && _.label < t[1]) {
              _.label = t[1];
              _.trys.push(op);
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        (op = [6, e]), (y = 0);
      } finally {
        f = t = 0;
      }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
