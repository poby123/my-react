import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import DragRectangle from '../Screens/DragRectangle';
import RotatePolygon from '../Screens/RotatePolygon';
import Header from './Header';

class Routes extends Component {
  render() {
    return (
      <Router>
        <Header />
        <Route path="/drag-rectangle" component={DragRectangle} />
        <Route path="/rotate-polygon" component={RotatePolygon} />
      </Router>
    );
  }
}

Routes.propTypes = {};

export default Routes;
