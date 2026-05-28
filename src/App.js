import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import CategoryPage from './pages/CategoryPage';
import SearchResultsPage from './pages/SearchResultsPage';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={HomePage} />
        <Route path="/listing" component={ListingPage} />
        <Route path="/category" component={CategoryPage} />
        <Route path="/search-results" component={SearchResultsPage} />
      </Switch>
    </Router>
  );
};

export default App;
