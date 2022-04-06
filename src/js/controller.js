import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';
// https://forkify-api.herokuapp.com/v2

// if (module.hot) {
//   module.hot.accept();
// }

async function controlRecipe() {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());

    bookmarksView.update(model.state.bookmarks);

    // Loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    // Rendering recipe
    recipeView.render(recipe);
  } catch (error) {
    recipeView.renderError();
    console.log(error);
  }
}

async function controlSearchResults() {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();

    if (!query) return;

    await model.loadSearchResults(query);

    //render search result
    resultsView.render(model.getSearchResultsPage());

    //render pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
}

function controlPagination(goToPage) {
  //render new search result
  resultsView.render(model.getSearchResultsPage(goToPage));

  //render new pagination buttons
  paginationView.render(model.state.search);
}

function controlServings(newServings) {
  //update recipe servings
  model.updateServings(newServings);

  //update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

function controlAddBookmark() {
  // Add or remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deteleBookmark(model.state.recipe.id);
  }

  // update recipe view
  recipeView.update(model.state.recipe);

  // render bookmars
  bookmarksView.render(model.state.bookmarks);
}

function controlBookmarks() {
  bookmarksView.render(model.state.bookmarks);
}

async function controlAddRecipe(newRecipe) {
  try {
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function () {
      addRecipeView._toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.error('😣', error);
    addRecipeView.renderError(error.message);
  }
}

// (function () {
//   recipeView.addHendlerRender(controlRecipe);
// })();

function newFeature() {
  console.log('New Feature Added');
}

function init() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHendlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHendlerAddBookmark(controlAddBookmark);
  searchView.addHendlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
}
init();
