/**
 * EstateHub Mobile Application Script (TypeScript Source)
 * ------------------------------------------------------
 * Handles Firebase authentication, Firestore CRUD operations,
 * Google Maps rendering and responsive UI interactions.
 */

type Nullable<T> = T | null;

interface PropertyLocation {
  lat: number;
  lng: number;
  address: string;
}

interface Property {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  features: string[];
  location: PropertyLocation;
}

interface ViewingRequest {
  propertyId: string;
  propertyTitle: string;
  userId: string;
  scheduledDate: string;
  scheduledTime: string;
  notes: string;
  createdAt: number;
}

interface AppState {
  properties: Property[];
  activeProperty: Nullable<Property>;
  currentUser: Nullable<firebase.User>;
}

declare global {
  interface Window {
    ESTATE_HUB?: {
      firebaseConfig?: Record<string, unknown>;
    };
    google?: typeof google;
  }
}

// Predefined sample data used as fallback when Firestore is unavailable
const SAMPLE_PROPERTIES: Property[] = [
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

const state: AppState = {
  properties: [],
  activeProperty: null,
  currentUser: null
};

/**
 * Initialise Firebase using config injected at runtime.
 * When no config is supplied the app still works with sample data
 * but Firebase-dependent functionality becomes read-only.
 */
function initialiseFirebase(): Nullable<firebase.app.App> {
  if (!window.ESTATE_HUB?.firebaseConfig) {
    console.warn('Firebase config not found. Running in demo mode.');
    return null;
  }

  if (firebase.apps.length) {
    return firebase.app();
  }

  return firebase.initializeApp(window.ESTATE_HUB.firebaseConfig);
}

/**
 * Observe authentication state and update UI accordingly.
 */
function bindAuthListeners(): void {
  firebase.auth().onAuthStateChanged((user) => {
    state.currentUser = user;
    updateAccountStatus();
    toggleAuthOnlySections(!!user);
  });
}

/**
 * Attempt to load property data from Firestore. Falls back to
 * local sample data when Firestore is unreachable or misconfigured.
 */
async function loadProperties(): Promise<void> {
  try {
    const snapshot = await firebase.firestore().collection('properties').orderBy('title').get();
    const data: Property[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Property, 'id'>)
    }));
    state.properties = data;
  } catch (error) {
    console.warn('Unable to fetch properties from Firestore, using sample data.', error);
    state.properties = SAMPLE_PROPERTIES;
  }

  renderPropertyList();
  populateReservationDropdown();
}

/**
 * Render property cards for the browse view.
 */
function renderPropertyList(): void {
  const $list = $('#propertyList');
  $list.empty();

  state.properties.forEach((property) => {
    const $card = $('<article></article>')
      .addClass('property-card')
      .attr('tabindex', 0)
      .attr('data-id', property.id)
      .append(
        $('<img />')
          .addClass('property-card__image')
          .attr('src', property.images[0])
          .attr('alt', `${property.title} exterior`)
      )
      .append(
        $('<div></div>')
          .addClass('property-card__body')
          .append($('<h4></h4>').addClass('property-card__title').text(property.title))
          .append($('<p></p>').addClass('property-card__price').text(formatPrice(property.price)))
          .append($('<p></p>').addClass('property-card__address').text(property.location.address))
      );

    $card.on('click keypress', (event) => {
      if (event.type === 'click' || (event as JQuery.KeyPressEvent).which === 13) {
        showPropertyDetail(property.id);
      }
    });

    $list.append($card);
  });
}

/**
 * Populate reservation property selector with available entries.
 */
function populateReservationDropdown(): void {
  const $select = $('#reservationProperty');
  $select.find('option:not(:first)').remove();

  state.properties.forEach((property) => {
    $('<option></option>').val(property.id).text(property.title).appendTo($select);
  });
}

/**
 * Display full details, gallery, features and map for a property.
 */
function showPropertyDetail(propertyId: string): void {
  const property = state.properties.find((item) => item.id === propertyId);
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

/**
 * Create detail markup for selected property.
 */
function renderPropertyDetailHtml(property: Property): string {
  const galleryHtml = property.images
    .map((image) => `<img class="property-gallery__image" src="${image}" alt="${property.title}" />`)
    .join('');

  const featureHtml = property.features.map((feature) => `<span class="tag">${feature}</span>`).join('');

  return `
    <div>
      <div class="property-gallery">${galleryHtml}</div>
      <h4>${property.title}</h4>
      <p class="property-card__address">${property.location.address}</p>
      <p class="property-card__price">${formatPrice(property.price)}</p>
      <p>${property.description}</p>
      <div class="property-meta">
        <div class="property-meta__features">${featureHtml}</div>
      </div>
    </div>
    <div>
      <div class="map-container" id="mapContainer"></div>
      <div class="property-meta">
        <h5>Viewing availability</h5>
        <p>Reserve your preferred slot using the form below.</p>
      </div>
    </div>
  `;
}

/**
 * Render a Google Map centred on the property location.
 */
function renderMap(property: Property): void {
  if (!window.google?.maps) {
    console.warn('Google Maps failed to load.');
    return;
  }

  const container = document.getElementById('mapContainer');
  if (!container) {
    return;
  }

  const map = new window.google.maps.Map(container, {
    zoom: 14,
    center: { lat: property.location.lat, lng: property.location.lng }
  });

  new window.google.maps.Marker({
    position: { lat: property.location.lat, lng: property.location.lng },
    map,
    title: property.title
  });
}

/**
 * Attach listeners for reservation and ad creation forms.
 */
function bindFormHandlers(): void {
  $('#reservationForm').on('submit', async (event) => {
    event.preventDefault();

    if (!state.currentUser) {
      updateStatus('#reservationStatus', 'Please sign in to request a viewing.', true);
      return;
    }

    const propertyId = String($('#reservationProperty').val());
    const scheduledDate = String($('#reservationDate').val());
    const scheduledTime = String($('#reservationTime').val());
    const notes = String($('#reservationNotes').val() || '');

    if (!propertyId || !scheduledDate || !scheduledTime) {
      updateStatus('#reservationStatus', 'All fields are required before submitting.', true);
      return;
    }

    const property = state.properties.find((item) => item.id === propertyId);
    if (!property) {
      updateStatus('#reservationStatus', 'Selected property no longer exists.', true);
      return;
    }

    const payload: ViewingRequest = {
      propertyId,
      propertyTitle: property.title,
      userId: state.currentUser.uid,
      scheduledDate,
      scheduledTime,
      notes,
      createdAt: Date.now()
    };

    try {
      await firebase.firestore().collection('viewings').add(payload);
      updateStatus('#reservationStatus', 'Viewing successfully booked. We will confirm shortly!', false);
      ($('#reservationForm')[0] as HTMLFormElement).reset();
    } catch (error) {
      console.error('Failed to create viewing', error);
      updateStatus('#reservationStatus', 'Unable to book viewing. Please try again later.', true);
    }
  });

  $('#createAdForm').on('submit', async (event) => {
    event.preventDefault();

    if (!state.currentUser) {
      updateStatus('#createAdStatus', 'Sign in to publish a property advertisement.', true);
      return;
    }

    const title = String($('#adTitle').val());
    const price = Number($('#adPrice').val());
    const address = String($('#adAddress').val());
    const lat = Number($('#adLat').val());
    const lng = Number($('#adLng').val());
    const description = String($('#adDescription').val());
    const images = String($('#adImages').val() || '')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);
    const features = String($('#adFeatures').val() || '')
      .split(',')
      .map((feature) => feature.trim())
      .filter(Boolean);

    if (!title || !price || !address || !description || Number.isNaN(lat) || Number.isNaN(lng)) {
      updateStatus('#createAdStatus', 'Please complete all required fields with valid information.', true);
      return;
    }

    const payload: Omit<Property, 'id'> = {
      title,
      price,
      description,
      images: images.length ? images : SAMPLE_PROPERTIES[0].images,
      features: features.length ? features : ['New Listing'],
      location: { lat, lng, address }
    };

    try {
      const docRef = await firebase.firestore().collection('properties').add(payload);
      updateStatus('#createAdStatus', 'Listing published successfully!', false);
      state.properties.push({ id: docRef.id, ...payload });
      renderPropertyList();
      populateReservationDropdown();
      ($('#createAdForm')[0] as HTMLFormElement).reset();
    } catch (error) {
      console.error('Failed to create listing', error);
      updateStatus('#createAdStatus', 'Unable to publish listing. Please try again later.', true);
    }
  });
}

/**
 * Bind UI interactions such as navigation and hero CTA.
 */
function bindUiEvents(): void {
  $('#browsePropertiesBtn').on('click', () => {
    document.getElementById('propertiesPanel')?.scrollIntoView({ behavior: 'smooth' });
  });

  $('.nav-btn').on('click', (event) => {
    const target = (event.currentTarget as HTMLButtonElement).dataset.target;
    if (!target) return;

    const panelId =
      target === 'properties'
        ? 'propertiesPanel'
        : target === 'create-ad'
        ? 'createAdPanel'
        : 'accountPanel';

    document.getElementById(panelId)?.scrollIntoView({ behavior: 'smooth' });
  });

  $('#closeDetailBtn').on('click', () => {
    $('#detailContent')
      .addClass('property-detail--empty')
      .html('<p>Please choose a property to view its full description, gallery, map and booking form.</p>');
    $('#detailTitle').text('Select a property to view details');
    state.activeProperty = null;
  });
}

/**
 * Helper to format currency values for display.
 */
function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Display feedback messages for form submissions.
 */
function updateStatus(selector: string, message: string, isError: boolean): void {
  const $status = $(selector);
  $status.text(message).toggleClass('is-error', isError);
}

/**
 * Update the account summary panel for the current user.
 */
function updateAccountStatus(): void {
  const $message = $('#accountStatus .account__message');

  if (state.currentUser) {
    $message.text(`Signed in as ${state.currentUser.email ?? 'anonymous user'}`).removeClass('is-error');
    $('#logoutBtn').show();
  } else {
    $message.text('You are browsing as a guest. Sign in to access personalised features.').removeClass('is-error');
    $('#logoutBtn').hide();
  }
}

/**
 * Provide inline feedback for authentication actions.
 */
function showAccountFeedback(message: string, isError: boolean): void {
  $('#accountStatus .account__message').text(message).toggleClass('is-error', isError);
}

/**
 * Reveal or hide sections that require authentication.
 */
function toggleAuthOnlySections(isAuthenticated: boolean): void {
  $('#createAdPanel').toggleClass('is-disabled', !isAuthenticated);
}

/**
 * Attach handlers for the authentication form actions.
 */
function bindAuthForms(): void {
  if (!firebase.apps.length) {
    $('#authForm :input').prop('disabled', true);
    showAccountFeedback('Firebase is not configured. Demo mode active.', true);
    $('#logoutBtn').hide();
    return;
  }

  $('#authForm').on('submit', async (event) => {
    event.preventDefault();

    const email = String($('#authEmail').val());
    const password = String($('#authPassword').val());

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      showAccountFeedback('Successfully signed in.', false);
    } catch (error) {
      console.error('Login failed', error);
      showAccountFeedback('Unable to sign in. Please verify your credentials.', true);
    }
  });

  $('#registerBtn').on('click', async () => {
    const email = String($('#authEmail').val());
    const password = String($('#authPassword').val());

    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      showAccountFeedback('Account created. You are now signed in!', false);
    } catch (error) {
      console.error('Registration failed', error);
      showAccountFeedback('Unable to register. Please review the form and try again.', true);
    }
  });

  $('#logoutBtn').on('click', async () => {
    try {
      await firebase.auth().signOut();
      showAccountFeedback('You have been signed out.', false);
    } catch (error) {
      console.error('Sign out failed', error);
      showAccountFeedback('Unable to sign out at this time.', true);
    }
  });
}

/**
 * Initialise the application once the DOM is ready.
 */
function bootstrap(): void {
  $('#currentYear').text(new Date().getFullYear());

  const app = initialiseFirebase();
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
